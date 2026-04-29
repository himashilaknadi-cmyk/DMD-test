const axios = require('axios');

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
                        const buffer = await downloadMedia(sock, msg);
                        if (buffer) {
                            await sock.sendMessage(from, { sticker: buffer }, { quoted: msg });
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
                    
                    const text = `🌤️ *WEATHER REPORT*\n\n🏙️ ${data.name}, ${data.sys.country}\n🌡️ Temp: ${data.main.temp}°C\n💧 Humidity: ${data.main.humidity}%\n🌬️ Wind: ${data.wind.speed} m/s\n☁️ ${data.weather[0].description}\n\n> DULANTHA MD`;
                    
                    await sock.sendMessage(from, { text }, { quoted: msg });
                    break;
                }

                case 'calc':
                case 'calculator': {
                    try {
                        const result = eval(arg.replace(/[^0-9+\-*/.() ]/g, ''));
                        await sock.sendMessage(from, { 
                            text: `🧮 *Calculator*\n\n📝 ${arg}\n💡 Result: ${result}\n\n> DULANTHA MD` 
                        }, { quoted: msg });
                    } catch {
                        await sock.sendMessage(from, { text: '❌ Invalid expression!' });
                    }
                    break;
                }

                case 'google':
                case 'search':
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

async function downloadMedia(sock, msg) {
    try {
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const mediaMsg = quoted?.imageMessage || quoted?.videoMessage || quoted?.stickerMessage;
        if (!mediaMsg) return null;
        
        const stream = await sock.downloadMediaMessage({ message: quoted });
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        return buffer;
    } catch {
        return null;
    }
}

module.exports = tools;