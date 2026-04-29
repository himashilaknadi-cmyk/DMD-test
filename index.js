// index.js - DULANTHA MD Main Bot File
// Supports ALL session formats: DULANTHA-MD=xxx, ASITHA-MD=xxx, YASIYA-MD=xxx, etc.

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const fs = require('fs-extra');
const path = require('path');
const pino = require('pino');
const config = require('./config');
const { sms } = require('./msg');

// ============ UNIVERSAL SESSION ID PARSER ============
// Supports ALL formats: NAME=xxxxx, SESSION_ID=xxxxx, etc.
function parseSessionId() {
    console.log('\n🔍 Searching for Session ID...\n');

    // 1. Check all ENV variables
    const envKeys = [
        'SESSION_ID', 
        'DULANTHA_MD_SESSION', 
        'ASITHA_MD_SESSION',
        'YASIYA_MD_SESSION',
        'BOT_SESSION'
    ];
    
    for (const key of envKeys) {
        if (process.env[key]) {
            console.log(`✅ Found in ENV: ${key}`);
            return process.env[key];
        }
    }
    
    if (config.SESSION_ID) {
        console.log('✅ Found in config.SESSION_ID');
        return config.SESSION_ID;
    }

    // 2. Check .env file for ANY format
    if (fs.existsSync('.env')) {
        const envContent = fs.readFileSync('.env', 'utf8');
        const lines = envContent.split('\n');
        
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;
            
            // Check standard env format: KEY=VALUE
            for (const key of envKeys) {
                if (trimmed.startsWith(`${key}=`)) {
                    const value = trimmed.replace(`${key}=`, '').trim();
                    if (value) {
                        console.log(`✅ Found in .env: ${key}`);
                        return value;
                    }
                }
            }
            
            // Check ANY_NAME=xxxxx format
            if (trimmed.includes('=') && !trimmed.startsWith('//')) {
                const parts = trimmed.split('=');
                const key = parts[0].trim();
                const value = parts.slice(1).join('=').trim();
                
                // Skip non-session keys
                if (['PREFIX', 'MONGO_URI', 'OWNER_NUMBER', 'BOT_NAME', 'WORK_TYPE'].includes(key)) continue;
                
                if (value && value.length > 20) {
                    console.log(`✅ Found in .env: ${key}=${value.substring(0, 20)}...`);
                    return value;
                }
            }
        }
    }

    // 3. Check session.txt for ANY format
    if (fs.existsSync('session.txt')) {
        const sessionFile = fs.readFileSync('session.txt', 'utf8').trim();
        
        // Direct session ID (no = sign)
        if (!sessionFile.includes('=') && sessionFile.length > 20) {
            console.log('✅ Found in session.txt (direct)');
            return sessionFile;
        }
        
        // NAME=xxxxx format
        if (sessionFile.includes('=')) {
            const parts = sessionFile.split('=');
            const value = parts.slice(1).join('=').trim();
            if (value && value.length > 20) {
                console.log(`✅ Found in session.txt: ${parts[0].trim()}=${value.substring(0, 20)}...`);
                return value;
            }
        }
    }

    // 4. Check for creds.json directly
    if (fs.existsSync('./auth/creds.json')) {
        try {
            const credsContent = fs.readFileSync('./auth/creds.json', 'utf8');
            const sessionId = Buffer.from(credsContent).toString('base64');
            console.log('✅ Generated Session ID from existing creds.json');
            return sessionId;
        } catch (e) {}
    }

    console.log('❌ No Session ID found!');
    console.log('💡 Add session in any of these formats:');
    console.log('   - SESSION_ID=xxxxx (in .env)');
    console.log('   - DULANTHA-MD=xxxxx (in .env or session.txt)');
    console.log('   - ASITHA-MD=xxxxx (in .env or session.txt)');
    console.log('   - YASIYA-MD=xxxxx (in .env or session.txt)');
    console.log('   - Any NAME=xxxxx format!\n');
    return '';
}

const SESSION_ID = parseSessionId();

// ============ DATABASE ============
const DB_PATH = './db.json';
let db = {
    settings: {
        mode: config.WORK_TYPE || 'public',
        button: config.BUTTON_MODE !== 'false',
        autotyping: config.AUTO_TYPING === 'true',
        autorecording: config.AUTO_RECORDING === 'true',
        autoviewstatus: config.AUTO_VIEW_STATUS === 'true',
        autolikestatus: config.AUTO_LIKE_STATUS === 'true',
        anticall: false,
        prefix: config.PREFIX
    },
    groups: {},
    movieData: {},
    users: {}
};

if (fs.existsSync(DB_PATH)) {
    try { db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); } catch (e) {
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    }
} else {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}
const saveDb = () => fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

// ============ PLUGIN LOADER ============
const plugins = {};

function loadPlugins() {
    const pluginDir = './plugins';
    if (!fs.existsSync(pluginDir)) {
        fs.mkdirSync(pluginDir);
        console.log('📁 Plugins folder created');
        return;
    }

    const files = fs.readdirSync(pluginDir).filter(f => f.endsWith('.js'));
    for (const file of files) {
        try {
            delete require.cache[require.resolve(path.join(__dirname, pluginDir, file))];
            const plugin = require(path.join(__dirname, pluginDir, file));
            if (plugin.name && plugin.commands) {
                plugins[plugin.name] = plugin;
                console.log(`📦 Plugin Loaded: ${plugin.name} [${plugin.commands.join(', ')}]`);
            }
        } catch (e) {
            console.log(`❌ Error loading ${file}: ${e.message}`);
        }
    }
    
    console.log(`\n📊 Total plugins loaded: ${Object.keys(plugins).length}\n`);
}

// ============ RESTORE SESSION ============
async function restoreSession() {
    if (!SESSION_ID) return false;

    console.log(`\n🔐 Restoring session...`);
    console.log(`📋 Session: ${SESSION_ID.substring(0, 25)}...\n`);

    try {
        let creds;
        
        // Try multiple decode methods
        const decodeMethods = [
            // Method 1: Direct base64 decode then JSON parse
            () => {
                const decoded = Buffer.from(SESSION_ID, 'base64').toString('utf8');
                return JSON.parse(decoded);
            },
            // Method 2: Try if it's already JSON
            () => JSON.parse(SESSION_ID),
            // Method 3: Try URL-safe base64
            () => {
                const safeBase64 = SESSION_ID.replace(/-/g, '+').replace(/_/g, '/');
                const decoded = Buffer.from(safeBase64, 'base64').toString('utf8');
                return JSON.parse(decoded);
            }
        ];

        for (const method of decodeMethods) {
            try {
                creds = method();
                if (creds && typeof creds === 'object') break;
            } catch (e) {
                continue;
            }
        }

        if (!creds || typeof creds !== 'object') {
            throw new Error('Failed to decode session');
        }

        // Save credentials
        if (!fs.existsSync('auth')) fs.mkdirSync('auth');
        fs.writeFileSync('./auth/creds.json', JSON.stringify(creds, null, 2));
        
        console.log('✅ Session restored successfully!\n');
        return true;
        
    } catch (e) {
        console.log('⚠️ Failed to restore session, using QR scan...');
        console.log('💡 Make sure your session ID format is correct\n');
        return false;
    }
}

// ============ BOT START ============
async function startBot() {
    const hasSession = await restoreSession();
    
    const { state, saveCreds } = await useMultiFileAuthState('auth');
    
    const sock = makeWASocket({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
        },
        logger: pino({ level: 'silent' }),
        printQRInTerminal: !hasSession,
        browser: [config.BOT_NAME, 'Chrome', config.BOT_VERSION],
        syncFullHistory: false
    });

    // Update session on creds change
    sock.ev.on('creds.update', async () => {
        await saveCreds();
        try {
            const credsContent = fs.readFileSync('./auth/creds.json', 'utf8');
            const newSessionId = Buffer.from(credsContent).toString('base64');
            // Save with bot name prefix
            const botName = config.BOT_NAME.replace(/\s+/g, '-').toUpperCase();
            fs.writeFileSync('session.txt', `${botName}=${newSessionId}`);
        } catch (e) {}
    });

    sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                console.log('🔄 Reconnecting...');
                setTimeout(startBot, 5000);
            } else {
                console.log('❌ Logged out! Generating new Session ID...');
                // Delete old auth and restart
                try { fs.removeSync('./auth'); } catch (e) {}
                process.exit(1);
            }
        } else if (connection === 'open') {
            const botName = config.BOT_NAME;
            console.log(`
╔══════════════════════════════════╗
║     ✅ ${botName} ONLINE      ║
║     Made by Dulantha 💙        ║
║     Version: ${config.BOT_VERSION}              ║
╚══════════════════════════════════╝
`);
        }
    });

    // ============ MESSAGE HANDLER ============
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const mObj = sms(sock, msg);
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || from;
        const isGroup = from.endsWith('@g.us');

        // Status handling
        if (from === 'status@broadcast') {
            if (db.settings.autoviewstatus) {
                await sock.readMessages([msg.key]).catch(() => {});
            }
            if (db.settings.autolikestatus) {
                const emoji = config.AUTO_LIKE_EMOJI[Math.floor(Math.random() * config.AUTO_LIKE_EMOJI.length)];
                await sock.sendMessage(from, { react: { text: emoji, key: msg.key } }).catch(() => {});
            }
            return;
        }

        // Mode check
        const mode = db.settings.mode;
        if (mode === 'private' && isGroup) return;
        if (mode === 'group' && !isGroup) return;
        if (mode === 'inbox' && isGroup) return;

        // Auto typing/recording
        if (!isGroup && db.settings.autotyping) {
            await sock.sendPresenceUpdate('composing', from).catch(() => {});
            setTimeout(() => sock.sendPresenceUpdate('paused', from).catch(() => {}), 3000);
        }
        if (!isGroup && db.settings.autorecording) {
            await sock.sendPresenceUpdate('recording', from).catch(() => {});
            setTimeout(() => sock.sendPresenceUpdate('paused', from).catch(() => {}), 3000);
        }

        // Extract text
        const text = mObj.body;
        const prefix = db.settings.prefix || config.PREFIX;
        if (!text || !text.startsWith(prefix)) return;

        const [command, ...args] = text.slice(prefix.length).split(' ');
        const cmd = command.toLowerCase();
        const arg = args.join(' ');

        // ============ PLUGIN EXECUTION ============
        let handled = false;
        for (const pluginName in plugins) {
            const plugin = plugins[pluginName];
            if (plugin.commands.includes(cmd)) {
                try {
                    await plugin.execute({
                        sock, msg: mObj, from, sender, text, arg, isGroup,
                        db, saveDb, config, command: cmd, args
                    });
                    handled = true;
                } catch (e) {
                    console.log(`Error in ${pluginName}:`, e);
                }
                break;
            }
        }
    });

    // Button handler
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const type = Object.keys(msg.message)[0];
        
        if (type === 'buttonsResponseMessage') {
            const buttonId = msg.message.buttonsResponseMessage.selectedButtonId;
            const from = msg.key.remoteJid;
            
            for (const pluginName in plugins) {
                const plugin = plugins[pluginName];
                if (plugin.onButton) {
                    try {
                        await plugin.onButton({ sock, msg, from, buttonId, db, saveDb, config });
                    } catch (e) {
                        console.log(`Button error in ${pluginName}:`, e);
                    }
                }
            }
        }
    });

    // Call rejection
    sock.ev.on('call', async (calls) => {
        if (!db.settings.anticall) return;
        for (const call of calls) {
            if (call.status === 'offer') {
                await sock.rejectCall(call.id, call.from);
                await sock.sendMessage(call.from, { 
                    text: `🚫 *Auto Call Reject Enabled*\n\n> ${config.BOT_NAME}` 
                });
            }
        }
    });
}

// ============ START ============
const botName = config.BOT_NAME;
console.log(`
╔══════════════════════════════════╗
║     🎬 ${botName} BOT         ║
║     Version: ${config.BOT_VERSION}              ║
║     Starting...                  ║
╚══════════════════════════════════╝
`);

console.log('📋 Supported Session Formats:');
console.log('   • DULANTHA-MD=xxxxx');
console.log('   • ASITHA-MD=xxxxx');
console.log('   • YASIYA-MD=xxxxx');
console.log('   • SESSION_ID=xxxxx');
console.log('   • ANY_NAME=xxxxx\n');

loadPlugins();
startBot();