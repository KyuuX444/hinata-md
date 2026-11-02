import axios from 'axios';
import type { Plugin, PluginContext } from '../../../types/plugin.js';

const handler: Plugin = {
    command: ['quotenokia', 'qnokia'],
    category: 'maker',
    description: 'Membuat gambar quote jadul layar Nokia',
    owner: false,
    premium: false,
    group: false,
    private: false,
    admin: false,
    botadmin: false,
    execute: async (context: PluginContext): Promise<void> => {
        if (!context.text) {
            await context.reply(
                `📱 *QUOTE NOKIA CANVAS*\n\n` +
                `⚙️ *Format Penggunaan:*\n` +
                `› *${context.usedPrefix || '.'}${context.command} <pesan>|<pengirim>*\n\n` +
                `📌 *Contoh:*\n` +
                `› *${context.usedPrefix || '.'}${context.command} Halo dunia|Hinata*`
            );
            return;
        }

        const [message, sender = context.pushName || 'Hinata'] = context.text.split('|');
        if (!message) {
            await context.reply('⚠️ Pesan tidak boleh kosong!');
            return;
        }

        await context.reply(global.mess.wait);

        try {
            const apiUrl = global.API(
                'kyzz',
                '/api/canvas/quote-nokia',
                {
                    message: message.trim(),
                    sender: sender.trim()
                },
                'apikey'
            );
            const res = await axios.get(apiUrl, { responseType: 'arraybuffer', timeout: 30000 });

            await context.client.sendMessage(
                context.chatJid,
                { image: Buffer.from(res.data) },
                { quoted: context.raw }
            );
        } catch (err: any) {
            await context.reply(`❌ Gagal membuat Quote Nokia: ${err.message || err}`);
        }
    }
};

export default handler;
