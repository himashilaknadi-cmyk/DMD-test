const axios = require('axios');

const ai = {
    name: 'ai',
    commands: ['ai', 'gpt', 'chat', 'aiimg', 'flux', 'translate', 'tr'],

    async execute({ sock, msg, from, arg, config, command }) {
        if (!arg) {
            return sock.sendMessage(from, { text: `❌ *Please provide a query!*\nExample: ${config.PREFIX}${command} <text>` });
        }

        await sock.sendMessage(from, { text: `🤖 *Processing...*` });

        try {
            switch (command) {
                case 'ai':
                case 'gpt':
                case 'chat': {
                    const api = `https://api.siputzx.my.id/api/ai/gpt4?query=${encodeURIComponent(arg)}`;
                    const { data } = await axios.get(api);
                    
                    if (data.status && data.data) {
                        await sock.sendMessage(from, { 
                            text: data.data,
                            footer: 'DULANTHA MD AI'
                        }, { quoted: msg });
                    } else {
                        await sock.sendMessage(from, { text: '❌ AI error!' });
                    }
                    break;
                }

                case 'aiimg':
                case 'flux': {
                    const api = `https://api.siputzx.my.id/api/ai/flux?prompt=${encodeURIComponent(arg)}`;
                    const { data } = await axios.get(api, { responseType: 'arraybuffer' });
                    
                    await sock.sendMessage(from, {
                        image: Buffer.from(data),
                        caption: `🎨 *AI Generated*\n📝 Prompt: ${arg}\n\n> DULANTHA MD`
                    }, { quoted: msg });
                    break;
                }

                case 'translate':
                case 'tr': {
                    const parts = arg.split(' ');
                    const lang = parts[0].length === 2 ? parts[0] : 'si';
                    const text = parts[0].length === 2 ? parts.slice(1).join(' ') : arg;
                    
                    const api = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`;
                    const { data: tData } = await axios.get(api);
                    const translated = tData[0][0][0];
                    
                    await sock.sendMessage(from, {
                        text: `🌐 *Translation*\n\n📝 Original: ${text}\n🔤 Translated (${lang}): ${translated}\n\n> DULANTHA MD`
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

module.exports = ai;
