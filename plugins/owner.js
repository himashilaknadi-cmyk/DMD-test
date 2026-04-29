const owner = {
    name: 'owner',
    commands: ['block', 'unblock', 'deleteme'],

    async execute({ sock, msg, from, sender, arg, config, command }) {
        const ownerNumber = config.OWNER_NUMBER.replace(/[^0-9]/g, '');
        const senderNumber = (sender.split('@')[0] || '').replace(/[^0-9]/g, '');

        if (senderNumber !== ownerNumber && command !== 'deleteme') {
            return sock.sendMessage(from, { text: '❌ *Owner only command!*' });
        }

        try {
            switch (command) {
                case 'block': {
                    let target = arg.replace(/[^0-9]/g, '');
                    if (!target) {
                        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
                        if (mentioned) target = mentioned[0].split('@')[0];
                    }
                    if (!target) return sock.sendMessage(from, { text: '❌ *Provide number or mention!*' });
                    
                    await sock.updateBlockStatus(`${target}@s.whatsapp.net`, 'block');
                    await sock.sendMessage(from, { text: `✅ Blocked +${target}\n\n> DULANTHA MD` });
                    break;
                }

                case 'unblock': {
                    let target = arg.replace(/[^0-9]/g, '');
                    if (!target) {
                        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
                        if (mentioned) target = mentioned[0].split('@')[0];
                    }
                    if (!target) return sock.sendMessage(from, { text: '❌ *Provide number or mention!*' });
                    
                    await sock.updateBlockStatus(`${target}@s.whatsapp.net`, 'unblock');
                    await sock.sendMessage(from, { text: `✅ Unblocked +${target}\n\n> DULANTHA MD` });
                    break;
                }
            }
        } catch (e) {
            console.log(e);
            await sock.sendMessage(from, { text: '❌ *Error occurred!*' });
        }
    }
};

module.exports = owner;