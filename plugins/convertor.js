const axios = require('axios');

const converter = {
    name: 'converter',
    commands: ['img2pdf', 'topdf', 'tourl', 'url', 'upload', 'font', 'fancy'],

    async execute({ sock, msg, from, arg, config, command }) {
        try {
            switch (command) {
                case 'font':
                case 'fancy': {
                    if (!arg) return sock.sendMessage(from, { text: '❌ *Please provide text!*\nExample: .font Dulantha' });
                    
                    const api = `https://www.dark-yasiya-api.site/other/font?text=${encodeURIComponent(arg)}`;
                    const { data } = await axios.get(api);
                    
                    if (data.status && data.result) {
                        const fontList = data.result.map(font => `*${font.name}:*\n${font.result}`).join('\n\n');
                        await sock.sendMessage(from, {
                            text: `🎨 *Fancy Fonts*\n\n${fontList}\n\n> DULANTHA MD`
                        }, { quoted: msg });
                    }
                    break;
                }

                case 'img2pdf':
                case 'topdf': {
                    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                    const imageMsg = quoted?.imageMessage || msg.message?.imageMessage;
                    
                    if (!imageMsg) return sock.sendMessage(from, { text: '❌ *Reply to an image!*' });
                    
                    const media = await downloadMedia(sock, msg);
                    if (!media) return sock.sendMessage(from, { text: '❌ *Failed to download media!*' });
                    
                    // Upload to telegraph
                    const FormData = require('form-data');
                    const form = new FormData();
                    form.append('file', media, { filename: 'image.jpg' });
                    
                    const uploadRes = await axios.post('https://telegra.ph/upload', form, {
                        headers: form.getHeaders()
                    });
                    
                    if (uploadRes.data?.[0]?.src) {
                        const imgUrl = 'https://telegra.ph' + uploadRes.data[0].src;
                        const pdfApi = `https://www.dark-yasiya-api.site/other/image-to-pdf?url=${imgUrl}`;
                        const pdfRes = await axios.get(pdfApi);
                        
                        if (pdfRes.data.status && pdfRes.data.result) {
                            await sock.sendMessage(from, {
                                document: { url: pdfRes.data.result },
                                mimetype: 'application/pdf',
                                fileName: `DULANTHA_MD_${Date.now()}.pdf`,
                                caption: `✅ *Image to PDF*\n\n> DULANTHA MD`
                            }, { quoted: msg });
                        }
                    }
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
        const mediaMsg = quoted?.imageMessage || msg.message?.imageMessage;
        if (!mediaMsg) return null;
        
        const stream = await sock.downloadMediaMessage({ 
            message: quoted || msg.message 
        });
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        return buffer;
    } catch {
        return null;
    }
}

module.exports = converter;