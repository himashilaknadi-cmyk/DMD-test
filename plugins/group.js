const group = {
    name: 'group',
    commands: ['tagall', 'hidetag', 'link', 'grouplink', 'online'],

    async execute({ sock, msg, from, sender, isGroup, arg, command }) {
        if (!isGroup) {
            return sock.sendMessage(from, { text: '❌ *Group command only!*' });
        }

        try {
            switch (command) {
                case 'tagall': {
                    const metadata = await sock.groupMetadata(from);
                    const participants = metadata.participants;
                    let text = `📢 *ANNOUNCEMENT*\n\n${arg || 'Tagged by admin'}\n\n`;
                    const mentions = [];
                    
                    participants.forEach((p, i) => {
                        text += `${i+1}. @${p.id.split('@')[0]}\n`;
                        mentions.push(p.id);
                    });
                    
                    text += `\n> DULANTHA MD`;
                    
                    await sock.sendMessage(from, { text, mentions }, { quoted: msg });
                    break;
                }

                case 'hidetag': {
                    const metadata = await sock.groupMetadata(from);
                    const participants = metadata.participants;
                    const mentions = participants.map(p => p.id);
                    
                    await sock.sendMessage(from, {
                        text: arg || '📢',
                        mentions
                    }, { quoted: msg });
                    break;
                }

                case 'link':
                case 'grouplink': {
                    const code = await sock.groupInviteCode(from);
                    const linkText = `🔗 *Group Link*\n\nhttps://chat.whatsapp.com/${code}\n\n> DULANTHA MD`;
                    await sock.sendMessage(from, { text: linkText }, { quoted: msg });
                    break;
                }
            }
        } catch (e) {
            console.log(e);
            await sock.sendMessage(from, { text: '❌ *Error!* Make sure I am admin.' });
        }
    }
};

module.exports = group;