const axios = require('axios');
const yts = require('yt-search');

const download = {
    name: 'download',
    commands: ['song', 'video', 'tiktok', 'tt', 'fb', 'facebook', 'instagram', 'ig', 'apk', 'apkdownload', 'mediafire', 'mf'],

    async execute({ sock, msg, from, arg, config, command }) {
        if (!arg) {
            return sock.sendMessage(from, { text: `❌ *Please provide a link/query!*\nExample: ${config.PREFIX}${command} <url/name>` });
        }

        await sock.sendMessage(from, { text: `⏳ *Processing ${command}...*` });

        try {
            switch (command) {
                case 'song': {
                    const search = await yts(arg);
                    const video = search.videos[0];
                    if (!video) return sock.sendMessage(from, { text: '❌ Not found!' });

                    const api = `https://api.siputzx.my.id/api/d/ytmp3?url=${encodeURIComponent(video.url)}`;
                    const { data } = await axios.get(api);
                    
                    if (data.status && data.data) {
                        await sock.sendMessage(from, {
                            audio: { url: data.data },
                            mimetype: 'audio/mp4',
                            caption: `🎵 ${video.title}\n\n> DULANTHA MD`
                        }, { quoted: msg });
                    } else {
                        await sock.sendMessage(from, { text: '❌ Download failed!' });
                    }
                    break;
                }

                case 'video': {
                    const search = await yts(arg);
                    const video = search.videos[0];
                    if (!video) return sock.sendMessage(from, { text: '❌ Not found!' });

                    const api = `https://api.siputzx.my.id/api/d/ytmp4?url=${encodeURIComponent(video.url)}`;
                    const { data } = await axios.get(api);
                    
                    if (data.status && data.data) {
                        await sock.sendMessage(from, {
                            video: { url: data.data },
                            caption: `🎥 ${video.title}\n\n> DULANTHA MD`
                        }, { quoted: msg });
                    } else {
                        await sock.sendMessage(from, { text: '❌ Download failed!' });
                    }
                    break;
                }

                case 'tiktok':
                case 'tt': {
                    const api = `https://api.siputzx.my.id/api/d/tiktok?url=${encodeURIComponent(arg)}`;
                    const { data } = await axios.get(api);
                    
                    if (data.status && data.data) {
                        await sock.sendMessage(from, {
                            video: { url: data.data.play },
                            caption: `🎵 TikTok Download\n\n> DULANTHA MD`
                        }, { quoted: msg });
                    } else {
                        await sock.sendMessage(from, { text: '❌ Failed!' });
                    }
                    break;
                }

                case 'fb':
                case 'facebook': {
                    const api = `https://api.siputzx.my.id/api/d/facebook?url=${encodeURIComponent(arg)}`;
                    const { data } = await axios.get(api);
                    
                    if (data.status && data.data) {
                        await sock.sendMessage(from, {
                            video: { url: data.data.sd || data.data.hd },
                            caption: `📘 Facebook Video\n\n> DULANTHA MD`
                        }, { quoted: msg });
                    } else {
                        await sock.sendMessage(from, { text: '❌ Failed!' });
                    }
                    break;
                }

                case 'instagram':
                case 'ig': {
                    const api = `https://api.siputzx.my.id/api/d/instagram?url=${encodeURIComponent(arg)}`;
                    const { data } = await axios.get(api);
                    
                    if (data.status && data.data && data.data.length > 0) {
                        const media = data.data[0];
                        await sock.sendMessage(from, {
                            [media.type === 'image' ? 'image' : 'video']: { url: media.url },
                            caption: `📸 Instagram Download\n\n> DULANTHA MD`
                        }, { quoted: msg });
                    } else {
                        await sock.sendMessage(from, { text: '❌ Failed!' });
                    }
                    break;
                }

                case 'apk':
                case 'apkdownload': {
                    const api = `https://api.siputzx.my.id/api/d/apk?query=${encodeURIComponent(arg)}`;
                    const { data } = await axios.get(api);
                    
                    if (data.status && data.data) {
                        await sock.sendMessage(from, {
                            document: { url: data.data.download },
                            fileName: `${data.data.name}.apk`,
                            mimetype: 'application/vnd.android.package-archive',
                            caption: `📱 ${data.data.name}\n📦 ${data.data.size}\n\n> DULANTHA MD`
                        }, { quoted: msg });
                    } else {
                        await sock.sendMessage(from, { text: '❌ APK not found!' });
                    }
                    break;
                }

                case 'mediafire':
                case 'mf': {
                    const api = `https://api.siputzx.my.id/api/d/mediafire?url=${encodeURIComponent(arg)}`;
                    const { data } = await axios.get(api);
                    
                    if (data.status && data.data) {
                        await sock.sendMessage(from, {
                            document: { url: data.data.link },
                            fileName: data.data.filename,
                            mimetype: 'application/octet-stream',
                            caption: `📦 ${data.data.filename}\n📊 ${data.data.size}\n\n> DULANTHA MD`
                        }, { quoted: msg });
                    } else {
                        await sock.sendMessage(from, { text: '❌ Failed!' });
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

module.exports = download;