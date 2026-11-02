import axios from 'axios';
import type { Plugin, PluginContext } from '../../../types/plugin.js';

const handler: Plugin = {
    command: ['fakeovo', 'fake-ovo'],
    category: 'maker',
    description: 'Membuat gambar bukti saldo Fake OVO',
    owner: false,
    premium: false,
    group: false,
    private: false,
    admin: false,
    botadmin: false,
    execute: async (context: PluginContext): Promise<void> => {
        const saldo = context.text.trim();
        if (!saldo) {
            await context.reply(
                `💜 *FAKE OVO CANVAS*\n\n` +
                `⚙️ *Format Penggunaan:*\n` +
                `› *${context.usedPrefix || '.'}${context.command} <saldo>*\n\n` +
                `📌 *Contoh:*\n` +
                `› *${context.usedPrefix || '.'}${context.command} 50000*`
            );
            return;
        }

        await context.reply(global.mess.wait);

        try {
            const apiUrl = global.API('kyzz', '/api/canvas/fake-ovo', { saldo }, 'apikey');
            const res = await axios.get(apiUrl, { responseType: 'arraybuffer', timeout: 30000 });

            await context.client.sendMessage(
                context.chatJid,
                { image: Buffer.from(res.data) },
                { quoted: context.raw }
            );
        } catch (err: any) {
            await context.reply(`❌ Gagal membuat Fake OVO: ${err.message || err}`);
        }
    }
};

export default handler;
