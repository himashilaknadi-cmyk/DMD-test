const axios = require('axios');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

const tools = {
    name: 'tools',
    commands: ['sticker', 's', 'weather', 'calc', 'calculator', 'google', 'search', 'gs', 'jid', 'cid', 'channelid'],

    async execute({ sock, msg, from, arg, config, command }) {
        try {
            switch (command) {
                case 'sticker':
                case 's': {
                    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                    const imageMsg = quoted?.imageMessage || msg.message?.imageMessage;
                    const videoMsg = quoted?.videoMessage || msg.message?.videoMessage;

                    if (imageMsg || videoMsg) {
                        const mediaMsg = imageMsg || videoMsg;
                        const type = imageMsg ? 'image' : 'video';
                        const buffer = await downloadMedia(mediaMsg, type);
                        
                        if (buffer) {
                            await sock.sendMessage(from, { sticker: buffer }, { quoted: msg });
                        } else {
                            await sock.sendMessage(from, { text: '❌ *Failed to download media!*' });
                        }
                    } else {
                        await sock.sendMessage(from, { text: '❌ *Reply to an image/video!*' });
                    }
                    break;
                }

                case 'weather': {
                    if (!arg) return sock.sendMessage(from, { text: '❌ *City name needed!*\nExample: .weather Colombo' });
                    
                    const api = `https://api.openweathermap.org/data/2.5/weather?q=${arg}&appid=2d61a72574c11c4f36173b627f8cb177&units=metric`;
                    const { data } = await axios.get(api);
                    
                    if (data && data.main) {
                        await sock.sendMessage(from, {
                            text: `🌤️ *Weather in ${data.name}*\n\n🌡️ Temp: ${data.main.temp}°C\n💧 Humidity: ${data.main.humidity}%\n☁️ Condition: ${data.weather[0].main}\n\n> DULANTHA MD`
                        }, { quoted: msg });
                    }
                    break;
                }

                case 'gs': {
                    if (!arg) return sock.sendMessage(from, { text: '❌ *Query needed!*' });
                    
                    await sock.sendMessage(from, { 
                        text: `🔍 *Google Search:* ${arg}\n\n🔗 https://www.google.com/search?q=${encodeURIComponent(arg)}\n\n> DULANTHA MD` 
                    }, { quoted: msg });
                    break;
                }

                case 'jid': {
                    const userNumber = from.split('@')[0];
                    await sock.sendMessage(from, {
                        text: `🆔 *Chat JID:* ${from}\n📞 *Your Number:* +${userNumber}\n\n> DULANTHA MD`
                    }, { quoted: msg });
                    break;
                }
            }
        } catch (e) {
            console.log(e);
            await sock.sendMessage(from, { text: '❌ *Error occurred!*' });
        }
    }
};

async function downloadMedia(mediaMessage, type) {
    try {
        const stream = await downloadContentFromMessage(mediaMessage, type);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        return buffer;
    } catch (e) {
        console.error('Download Error:', e);
        return null;
    }
}

module.exports = tools;
