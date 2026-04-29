const main = {
    name: 'main',
    commands: ['menu', 'alive', 'ping', 'setting', 'settings', 'session', 'apply', 'setfilename', 'setcrd', 'showsettings'],

    async execute({ sock, msg, from, sender, arg, db, saveDb, config, command }) {
        const uptime = Math.floor(process.uptime());
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);

        switch (command) {
            case 'menu': {
                const menuText = `
╭━━━━━━━━━━━━━━━━━━━━╮
   🎬 *DULANTHA MD BOT*
╰━━━━━━━━━━━━━━━━━━━━╯

👑 *Owner:* Dulantha
⏰ *Uptime:* ${hours}h ${minutes}m ${seconds}s
📌 *Prefix:* ${config.PREFIX}
👥 *Mode:* ${db.settings.mode}

━━━━━━━━━━━━━━━━━━━━━━
📥 *DOWNLOAD MENU*
┣ • ${config.PREFIX}movie <name>
┣ • ${config.PREFIX}song <name>
┣ • ${config.PREFIX}video <name>
┣ • ${config.PREFIX}tiktok <link>
┣ • ${config.PREFIX}fb <link>
┣ • ${config.PREFIX}instagram <link>
┣ • ${config.PREFIX}apk <name>
┗ • ${config.PREFIX}mediafire <link>

━━━━━━━━━━━━━━━━━━━━━━
🤖 *AI COMMANDS*
┣ • ${config.PREFIX}ai <query>
┣ • ${config.PREFIX}aiimg <prompt>
┗ • ${config.PREFIX}translate <text>

━━━━━━━━━━━━━━━━━━━━━━
🛠️ *TOOLS*
┣ • ${config.PREFIX}sticker
┣ • ${config.PREFIX}weather
┣ • ${config.PREFIX}calc <expr>
┣ • ${config.PREFIX}google <query>
┗ • ${config.PREFIX}jid

━━━━━━━━━━━━━━━━━━━━━━
👥 *GROUP*
┣ • ${config.PREFIX}tagall
┣ • ${config.PREFIX}hidetag
┣ • ${config.PREFIX}link
┣ • ${config.PREFIX}apply <name>
┗ • ${config.PREFIX}showsettings

━━━━━━━━━━━━━━━━━━━━━━
⚙️ *SETTINGS*
┣ • ${config.PREFIX}setting inbox
┣ • ${config.PREFIX}setting group
┣ • ${config.PREFIX}setting private
┣ • ${config.PREFIX}setting button
┣ • ${config.PREFIX}setting nonbutton
┣ • ${config.PREFIX}setfilename <name>
┗ • ${config.PREFIX}setcrd <text>

> © 2026 DULANTHA MD | Made by Dulantha 💙
`;

                await sock.sendMessage(from, {
                    text: menuText,
                    footer: 'DULANTHA MD BOT',
                    buttons: db.settings.button ? [
                        { buttonId: '.alive', buttonText: { displayText: '🤖 ALIVE' }, type: 1 },
                        { buttonId: '.ping', buttonText: { displayText: '⚡ PING' }, type: 1 },
                        { buttonId: '.menu', buttonText: { displayText: '📋 MENU' }, type: 1 }
                    ] : undefined
                }, { quoted: msg });
                break;
            }

            case 'alive': {
                const aliveText = `🤖 *DULANTHA MD BOT STATUS*

👑 *Owner:* Dulantha
⏰ *Uptime:* ${hours}h ${minutes}m ${seconds}s
📌 *Prefix:* ${config.PREFIX}
👥 *Mode:* ${db.settings.mode}

> Made with 💙 by Dulantha`;

                await sock.sendMessage(from, {
                    text: aliveText,
                    footer: 'DULANTHA MD ALIVE'
                }, { quoted: msg });
                break;
            }

            case 'ping': {
                const latency = Date.now() - msg.messageTimestamp * 1000;
                const pingText = `⚡ *PING STATS*

📊 *Latency:* ${latency}ms
🚀 *Speed:* ${latency < 100 ? 'Fast ⚡' : latency < 300 ? 'Normal 🟡' : 'Slow 🔴'}

> DULANTHA MD BOT`;

                await sock.sendMessage(from, { text: pingText }, { quoted: msg });
                break;
            }

            case 'setting':
            case 'settings':
            case 'session': {
                if (arg) {
                    const settings = {
                        'inbox': () => { db.settings.mode = 'inbox'; return 'Inbox Only'; },
                        'group': () => { db.settings.mode = 'group'; return 'Group Only'; },
                        'private': () => { db.settings.mode = 'private'; return 'Private Only'; },
                        'button': () => { db.settings.button = true; return 'Buttons ON'; },
                        'nonbutton': () => { db.settings.button = false; return 'Buttons OFF'; },
                        'autotyping': () => { db.settings.autotyping = !db.settings.autotyping; return `Auto Typing ${db.settings.autotyping ? 'ON' : 'OFF'}`; },
                        'autorecording': () => { db.settings.autorecording = !db.settings.autorecording; return `Auto Recording ${db.settings.autorecording ? 'ON' : 'OFF'}`; },
                        'autoview': () => { db.settings.autoviewstatus = !db.settings.autoviewstatus; return `Auto View Status ${db.settings.autoviewstatus ? 'ON' : 'OFF'}`; },
                        'autolike': () => { db.settings.autolikestatus = !db.settings.autolikestatus; return `Auto Like Status ${db.settings.autolikestatus ? 'ON' : 'OFF'}`; },
                        'anticall': () => { db.settings.anticall = !db.settings.anticall; return `Anti Call ${db.settings.anticall ? 'ON' : 'OFF'}`; }
                    };

                    const action = settings[arg.toLowerCase()];
                    if (action) {
                        const result = action();
                        saveDb();
                        await sock.sendMessage(from, { text: `✅ Setting Updated: *${result}*` }, { quoted: msg });
                    } else {
                        await sock.sendMessage(from, { text: `❌ Unknown setting\n\nAvailable: inbox, group, private, button, nonbutton, autotyping, autorecording, autoview, autolike, anticall` });
                    }
                } else {
                    let stext = `⚙️ *CURRENT SETTINGS*\n\n`;
                    stext += `📌 Mode: ${db.settings.mode}\n`;
                    stext += `🔘 Buttons: ${db.settings.button ? 'ON' : 'OFF'}\n`;
                    stext += `⌨️ Auto Typing: ${db.settings.autotyping ? 'ON' : 'OFF'}\n`;
                    stext += `🎤 Auto Recording: ${db.settings.autorecording ? 'ON' : 'OFF'}\n`;
                    stext += `👁️ Auto View Status: ${db.settings.autoviewstatus ? 'ON' : 'OFF'}\n`;
                    stext += `❤️ Auto Like Status: ${db.settings.autolikestatus ? 'ON' : 'OFF'}\n`;
                    stext += `📞 Anti Call: ${db.settings.anticall ? 'ON' : 'OFF'}\n\n`;
                    stext += `*Use:* ${config.PREFIX}setting <option>`;
                    await sock.sendMessage(from, { text: stext }, { quoted: msg });
                }
                break;
            }

            // ============ NEW: APPLY COMMAND ============
            case 'apply': {
                if (!arg) {
                    let helpText = `📋 *APPLY COMMAND*\n\n`;
                    helpText += `Register your group with custom settings!\n\n`;
                    helpText += `📌 *Usage:*\n`;
                    helpText += `${config.PREFIX}apply <group name>\n\n`;
                    helpText += `📌 *Example:*\n`;
                    helpText += `${config.PREFIX}apply ⸙ —͞𝚂ʏᴅʀᴏx 4乃 ꜰɪʟᴍ ʜᴜʙ ᥫ᭡\n\n`;
                    helpText += `📌 *After registration, use:*\n`;
                    helpText += `${config.PREFIX}setfilename <name> - Set file name prefix\n`;
                    helpText += `${config.PREFIX}setcrd <text> - Set detail card footer\n`;
                    helpText += `${config.PREFIX}showsettings - View current settings\n`;
                    helpText += `\n> DULANTHA MD`;
                    
                    return sock.sendMessage(from, { text: helpText }, { quoted: msg });
                }

                if (!db.groups) db.groups = {};
                
                const groupName = arg;
                const existingSettings = db.groups[from]?.settings || {};
                
                db.groups[from] = {
                    name: groupName,
                    settings: {
                        fileName: existingSettings.fileName || '',
                        detailCrd: existingSettings.detailCrd || ''
                    },
                    registeredBy: sender,
                    registeredAt: new Date().toISOString()
                };
                saveDb();

                let successText = `✅ *GROUP REGISTERED!*\n\n`;
                successText += `👥 *Group Name:* ${groupName}\n`;
                successText += `👤 *Registered By:* @${sender.split('@')[0]}\n`;
                successText += `\n━━━━━━━━━━━━━━━━━━\n`;
                successText += `⚙️ *Now Configure Settings:*\n\n`;
                successText += `📁 *Set File Name Prefix:*\n`;
                successText += `${config.PREFIX}setfilename <name>\n\n`;
                successText += `🖼️ *Set Detail Card Footer:*\n`;
                successText += `${config.PREFIX}setcrd <text>\n\n`;
                successText += `📋 *View Settings:*\n`;
                successText += `${config.PREFIX}showsettings\n\n`;
                successText += `> DULANTHA MD`;

                const buttons = [
                    { buttonId: `apply_set_filename`, buttonText: { displayText: '📁 Set File Name' }, type: 1 },
                    { buttonId: `apply_set_crd`, buttonText: { displayText: '🖼️ Set Detail CRD' }, type: 1 },
                    { buttonId: `apply_show_settings`, buttonText: { displayText: '📋 View Settings' }, type: 1 }
                ];

                await sock.sendMessage(from, {
                    text: successText,
                    footer: 'DULANTHA MD | Group Setup',
                    mentions: [sender],
                    buttons: buttons,
                    headerType: 1
                }, { quoted: msg });
                break;
            }

            // ============ NEW: SET FILE NAME ============
            case 'setfilename': {
                if (!arg) {
                    return sock.sendMessage(from, { 
                        text: `❌ *Provide file name prefix!*\n\n📌 *Example:*\n${config.PREFIX}setfilename DulanthaMD\n\n💡 *Output:* \`DulanthaMD_MovieName_720p.mp4\`` 
                    }, { quoted: msg });
                }

                if (!db.groups) db.groups = {};
                if (!db.groups[from]) {
                    db.groups[from] = {
                        name: from.split('@')[0],
                        settings: {},
                        registeredBy: sender,
                        registeredAt: new Date().toISOString()
                    };
                }

                db.groups[from].settings.fileName = arg;
                saveDb();

                let exampleName = arg.replace(/\s+/g, '_');
                await sock.sendMessage(from, { 
                    text: `✅ *File Name Prefix Updated!*\n\n📁 *Prefix:* \`${arg}\`\n\n📌 *Example Output:*\n\`${exampleName}_MovieName_720p.mp4\`\n\`${exampleName}_MovieName_1080p.mp4\`\n\n> DULANTHA MD` 
                }, { quoted: msg });
                break;
            }

            // ============ NEW: SET DETAIL CARD ============
            case 'setcrd': {
                if (!arg) {
                    return sock.sendMessage(from, { 
                        text: `❌ *Provide detail card footer text!*\n\n📌 *Example:*\n${config.PREFIX}setcrd 🎬 DULANTHA MD MOVIE HUB\n\n💡 This will appear at the bottom of movie detail cards.` 
                    }, { quoted: msg });
                }

                if (!db.groups) db.groups = {};
                if (!db.groups[from]) {
                    db.groups[from] = {
                        name: from.split('@')[0],
                        settings: {},
                        registeredBy: sender,
                        registeredAt: new Date().toISOString()
                    };
                }

                db.groups[from].settings.detailCrd = arg;
                saveDb();

                await sock.sendMessage(from, { 
                    text: `✅ *Detail Card Footer Updated!*\n\n🖼️ *Footer Text:*\n\`${arg}\`\n\n📌 This will appear at the bottom of all movie detail cards.\n\n> DULANTHA MD` 
                }, { quoted: msg });
                break;
            }

            // ============ NEW: SHOW SETTINGS ============
            case 'showsettings': {
                if (!db.groups || !db.groups[from]) {
                    return sock.sendMessage(from, { 
                        text: `❌ *No settings found!*\n\nFirst register: ${config.PREFIX}apply <group name>\nOr set directly: ${config.PREFIX}setfilename <name>` 
                    }, { quoted: msg });
                }

                const groupData = db.groups[from];
                let settingsText = `📋 *CURRENT SETTINGS*\n\n`;
                settingsText += `👥 *Group Name:* ${groupData.name}\n`;
                settingsText += `\n━━━━━━━━━━━━━━━━━━\n\n`;
                settingsText += `📁 *File Name Prefix:*\n`;
                settingsText += `\`${groupData.settings.fileName || 'Not Set (Default: DULANTHA_MD)'}\`\n\n`;
                settingsText += `🖼️ *Detail Card Footer:*\n`;
                settingsText += `\`${groupData.settings.detailCrd || 'Not Set (Default: DULANTHA MD)'}\`\n\n`;
                settingsText += `━━━━━━━━━━━━━━━━━━\n`;
                settingsText += `📌 *Commands:*\n`;
                settingsText += `${config.PREFIX}setfilename <name>\n`;
                settingsText += `${config.PREFIX}setcrd <text>\n`;
                settingsText += `${config.PREFIX}apply <group name>\n`;
                settingsText += `\n> DULANTHA MD`;

                await sock.sendMessage(from, {
                    text: settingsText,
                    footer: 'DULANTHA MD | Settings'
                }, { quoted: msg });
                break;
            }
        }
    },

    // ============ BUTTON HANDLER FOR APPLY COMMAND ============
    async onButton({ sock, msg, from, buttonId, db, saveDb, config }) {
        if (buttonId === 'apply_set_filename') {
            await sock.sendMessage(from, { 
                text: `📁 *Send the file name prefix!*\n\nExample: \`DulanthaMD\`\n\nThis will be added to uploaded files:\n\`DulanthaMD_MovieName_720p.mp4\`\n\n> DULANTHA MD` 
            });
        }

        if (buttonId === 'apply_set_crd') {
            await sock.sendMessage(from, { 
                text: `🖼️ *Send detail card footer text!*\n\nExample: \`🎬 DULANTHA MD MOVIE HUB\`\n\nThis will appear at the bottom of movie detail cards.\n\n> DULANTHA MD` 
            });
        }

        if (buttonId === 'apply_show_settings') {
            if (!db.groups || !db.groups[from]) {
                await sock.sendMessage(from, { text: '❌ *No settings found!*\n\nUse: .apply <group name> or .setfilename <name>' });
            } else {
                const gd = db.groups[from];
                let text = `📋 *CURRENT SETTINGS*\n\n`;
                text += `👥 Group: ${gd.name}\n`;
                text += `📁 File Prefix: ${gd.settings.fileName || 'Not Set'}\n`;
                text += `🖼️ Detail CRD: ${gd.settings.detailCrd || 'Not Set'}\n\n> DULANTHA MD`;
                await sock.sendMessage(from, { text });
            }
        }
    }
};

module.exports = main;