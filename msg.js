// msg.js - Message handling utilities
const { downloadContentFromMessage, getContentType } = require('@whiskeysockets/baileys');

class SMS {
    constructor(sock, msg) {
        this.sock = sock;
        this.msg = msg;
        this.type = getContentType(msg.message);
        this.from = msg.key.remoteJid;
        this.sender = msg.key.participant || msg.key.remoteJid;
        this.isGroup = this.from.endsWith('@g.us');
        this.body = this._getBody();
        this.quoted = this._getQuoted();
        this.mentions = this._getMentions();
    }

    _getBody() {
        const type = this.type;
        const msg = this.msg.message;
        if (type === 'conversation') return msg.conversation;
        if (type === 'extendedTextMessage') return msg.extendedTextMessage.text;
        if (type === 'imageMessage') return msg.imageMessage.caption || '';
        if (type === 'videoMessage') return msg.videoMessage.caption || '';
        if (type === 'buttonsResponseMessage') return msg.buttonsResponseMessage.selectedButtonId;
        if (type === 'listResponseMessage') return msg.listResponseMessage.singleSelectReply?.selectedRowId;
        if (type === 'templateButtonReplyMessage') return msg.templateButtonReplyMessage.selectedId;
        return '';
    }

    _getQuoted() {
        const ctx = this.msg.message?.extendedTextMessage?.contextInfo;
        if (!ctx) return null;
        return {
            message: ctx.quotedMessage,
            sender: ctx.participant,
            id: ctx.stanzaId
        };
    }

    _getMentions() {
        const ctx = this.msg.message?.extendedTextMessage?.contextInfo;
        return ctx?.mentionedJid || [];
    }

    async reply(text, options = {}) {
        try {
            const messageOptions = {
                text: typeof text === 'string' ? text : text.text,
                ...options
            };
            if (this.msg.key) messageOptions.quoted = this.msg;
            return await this.sock.sendMessage(this.from, messageOptions);
        } catch (e) {
            console.error('Reply error:', e);
            return null;
        }
    }

    async react(emoji) {
        try {
            await this.sock.sendMessage(this.from, {
                react: { text: emoji, key: this.msg.key }
            });
        } catch (e) {
            console.error('React error:', e);
        }
    }

    async downloadMedia() {
        try {
            const messageType = this.type.replace('Message', '');
            const stream = await downloadContentFromMessage(
                this.msg.message[this.type],
                messageType
            );
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            return buffer;
        } catch (e) {
            console.error('Download media error:', e);
            return null;
        }
    }
}

function sms(sock, msg) {
    return new SMS(sock, msg);
}

async function downloadMediaMessage(msg) {
    try {
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted) return null;
        const type = Object.keys(quoted).find(k => k.includes('Message'));
        if (!type) return null;
        const messageType = type.replace('Message', '');
        const stream = await downloadContentFromMessage(quoted[type], messageType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        return buffer;
    } catch (e) {
        console.error('downloadMediaMessage error:', e);
        return null;
    }
}

module.exports = { SMS, sms, downloadMediaMessage };