// config.js - DULANTHA MD Bot Configuration
require('dotenv').config();

const config = {
    // ============ BOT INFO ============
    BOT_NAME: process.env.BOT_NAME || 'DULANTHA MD',
    PREFIX: process.env.PREFIX || '.',
    BOT_VERSION: '2.0.0',
    
    // ============ OWNER INFO ============
    OWNER_NUMBER: process.env.OWNER_NUMBER || '94761021289',
    OWNER_NAME: process.env.OWNER_NAME || 'DULANTHA OSHADHA',
    
    // ============ SESSION (Multiple formats support) ============
    // Auto-detects any session format
    SESSION_ID: process.env.SESSION_ID || 
                process.env.DULANTHA_MD_SESSION || 
                process.env.ASITHA_MD_SESSION ||
                process.env.YASIYA_MD_SESSION || 'YASIYA-MD?KAZLyD',
    
    // ============ MONGODB (Optional) ============
    MONGO_URI: process.env.MONGO_URI || '',
    MONGO_DB: process.env.MONGO_DB || 'DULANTHA_MD',
    
    // ============ AUTO FEATURES ============
    AUTO_VIEW_STATUS: process.env.AUTO_VIEW_STATUS || 'true',
    AUTO_LIKE_STATUS: process.env.AUTO_LIKE_STATUS || 'true',
    AUTO_RECORDING: process.env.AUTO_RECORDING || 'false',
    AUTO_TYPING: process.env.AUTO_TYPING || 'false',
    AUTO_READ_MESSAGE: process.env.AUTO_READ_MESSAGE || 'off',
    
    // ============ STATUS REACTIONS ============
    AUTO_LIKE_EMOJI: ['❤️', '👍', '🔥', '💯', '✨', '🎀', '💗', '🌸'],
    
    // ============ GROUP ============
    GROUP_INVITE_LINK: process.env.GROUP_INVITE_LINK || '',
    
    // ============ NEWSLETTER ============
    NEWSLETTER_JID: process.env.NEWSLETTER_JID || '',
    
    // ============ CHANNEL ============
    CHANNEL_LINK: process.env.CHANNEL_LINK || '',
    
    // ============ IMAGES ============
    BOT_IMAGE: process.env.BOT_IMAGE || 'https://files.catbox.moe/f9gwsx.jpg',
    MENU_IMAGE: process.env.MENU_IMAGE || 'https://files.catbox.moe/f9gwsx.jpg',
    
    // ============ SETTINGS ============
    MAX_RETRIES: 3,
    OTP_EXPIRY: 300000,
    MAX_FILE_SIZE: 100 * 1024 * 1024,
    
    // ============ MODE ============
    WORK_TYPE: process.env.WORK_TYPE || 'public',
    BUTTON_MODE: process.env.BUTTON_MODE || 'true',
    
    // ============ API KEYS (Optional) ============
    TMDB_API_KEY: process.env.TMDB_API_KEY || '',
    OMDB_API_KEY: process.env.OMDB_API_KEY || '',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
    
    // ============ PREMIUM ============
    PREMIUM_USERS: (process.env.PREMIUM_USERS || '').split(',').filter(Boolean),
    
    // ============ BOT FOOTER ============
    BOT_FOOTER: '> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴜʟᴀɴᴛʜᴀ ᴍᴅ',
};

module.exports = config;
