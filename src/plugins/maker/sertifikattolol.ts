import axios from 'axios';
import type { Plugin, PluginContext } from '../../../types/plugin.js';

const handler: Plugin = {
    command: ['sertifikattolol', 'sertitolol'],
    category: 'maker',
    description: 'Membuat sertifikat tolol custom',
    owner: false,
    premium: false,
    group: false,
    private: false,
    admin: false,
    botadmin: false,
    execute: async (context: PluginContext): Promise<void> => {
        const text = context.text.trim();
        if (!text) {
            await context.reply(
                `📜 *SERTIFIKAT TOLOL*\n\n` +
                `⚙️ *Format Penggunaan:*\n` +
                `› *${context.usedPrefix || '.'}${context.command} <nama>*\n\n` +
                `📌 *Contoh:*\n` +
                `› *${context.usedPrefix || '.'}${context.command} Ujang*`
            );
            return;
        }

        await context.reply(global.mess.wait);

        try {
            const apiUrl = global.API('kyzz', '/api/canvas/sertifikat-tolol', { name: text }, 'apikey');
            const res = await axios.get(apiUrl, { responseType: 'arraybuffer', timeout: 30000 });

            await context.client.sendMessage(
                context.chatJid,
                {
                    image: Buffer.from(res.data),
                    text: `📜 Sertifikat Tolol: *${text}*`
                },
                { quoted: context.raw }
            );
        } catch (err: any) {
            await context.reply(`❌ Gagal membuat Sertifikat: ${err.message || err}`);
        }
    }
};

export default handler;
