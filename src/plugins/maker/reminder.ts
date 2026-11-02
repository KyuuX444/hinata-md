import axios from 'axios';
import type { Plugin, PluginContext } from '../../../types/plugin.js';

const handler: Plugin = {
    command: ['reminder'],
    category: 'maker',
    description: 'Membuat gambar pengingat/reminder aesthetic',
    owner: false,
    premium: false,
    group: false,
    private: false,
    admin: false,
    botadmin: false,
    execute: async (context: PluginContext): Promise<void> => {
        if (!context.text) {
            await context.reply(
                `⏰ *REMINDER CANVAS*\n\n` +
                `⚙️ *Format Penggunaan:*\n` +
                `› *${context.usedPrefix || '.'}${context.command} <teks>|<author>*\n\n` +
                `📌 *Contoh:*\n` +
                `› *${context.usedPrefix || '.'}${context.command} Jangan lupa istirahat yaa|Hinata*`
            );
            return;
        }

        const [msg, author = context.pushName || 'Hinata'] = context.text.split('|');
        if (!msg) {
            await context.reply('⚠️ Pesan pengingat tidak boleh kosong!');
            return;
        }

        await context.reply(global.mess.wait);

        try {
            const apiUrl = global.API(
                'kyzz',
                '/api/canvas/reminder',
                {
                    text: msg.trim(),
                    author: author.trim()
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
            await context.reply(`❌ Gagal membuat Reminder: ${err.message || err}`);
        }
    }
};

export default handler;
