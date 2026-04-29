const axios = require('axios');
const cheerio = require('cheerio');

const news = {
    name: 'news',
    commands: ['news', 'gossip', 'cricket', 'nasa'],

    async execute({ sock, msg, from, arg, config, command }) {
        try {
            switch (command) {
                case 'news': {
                    const { data } = await axios.get('https://suhas-bro-api.vercel.app/news/lnw');
                    if (data.status && data.result) {
                        const { title, desc, date, link } = data.result;
                        await sock.sendMessage(from, {
                            text: `📰 *DULANTHA MD NEWS*\n\n📢 ${title}\n\n${desc}\n\n📅 ${date}\n🔗 ${link}\n\n> DULANTHA MD`
                        }, { quoted: msg });
                    }
                    break;
                }

                case 'gossip': {
                    const { data } = await axios.get('https://suhas-bro-api.vercel.app/news/gossiplankanews');
                    if (data.status && data.result) {
                        const { title, desc, date, link } = data.result;
                        let thumbnailUrl = '';
                        try {
                            const pageRes = await axios.get(link);
                            const $ = cheerio.load(pageRes.data);
                            thumbnailUrl = $('meta[property="og:image"]').attr('content') || '';
                        } catch (e) {}
                        
                        await sock.sendMessage(from, {
                            image: thumbnailUrl ? { url: thumbnailUrl } : undefined,
                            caption: `📰 *GOSSIP NEWS*\n\n📢 ${title}\n\n${desc}\n\n📅 ${date}\n🔗 ${link}\n\n> DULANTHA MD`
                        }, { quoted: msg });
                    }
                    break;
                }

                case 'cricket': {
                    const { data } = await axios.get('https://suhas-bro-api.vercel.app/news/cricbuzz');
                    if (data.status && data.result) {
                        const { title, score, to_win, crr, link } = data.result;
                        await sock.sendMessage(from, {
                            text: `🏏 *CRICKET NEWS*\n\n📢 ${title}\n🏆 Score: ${score}\n🎯 To Win: ${to_win}\n📈 CRR: ${crr}\n🔗 ${link}\n\n> DULANTHA MD`
                        }, { quoted: msg });
                    }
                    break;
                }

                case 'nasa': {
                    const { data } = await axios.get('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY');
                    if (data.url) {
                        await sock.sendMessage(from, {
                            image: { url: data.url },
                            caption: `🌌 *NASA APOD*\n\n🌠 ${data.title}\n📅 ${data.date}\n\n${data.explanation?.substring(0, 200)}...\n\n> DULANTHA MD`
                        }, { quoted: msg });
                    }
                    break;
                }
            }
        } catch (e) {
            console.log(e);
            await sock.sendMessage(from, { text: '❌ *Error fetching news!*' });
        }
    }
};

module.exports = news;