import axios from 'axios';
import type { Plugin, PluginContext } from '../../../types/plugin.js';

const handler: Plugin = {
    command: ['pakustadz', 'ustadz', 'ustad'],
    category: 'maker',
    description: 'Membuat gambar jawaban dari Pak Ustadz',
    owner: false,
    premium: false,
    group: false,
    private: false,
    admin: false,
    botadmin: false,
    execute: async (context: PluginContext): Promise<void> => {
        const query = context.text.trim();
        if (!query) {
            await context.reply(
                `👳‍♂️ *PAK USTADZ MENJAWAB*\n\n` +
                `⚙️ *Format Penggunaan:*\n` +
                `› *${context.usedPrefix || '.'}${context.command} <pertanyaan/teks>*\n\n` +
                `📌 *Contoh:*\n` +
                `› *${context.usedPrefix || '.'}${context.command} Apa hukumnya menyayangi dia yang tak peka?*`
            );
            return;
        }

        await context.reply(global.mess.wait);

        try {
            const apiUrl = global.API('kyzz', '/api/canvas/pak-ustadz', { text: query }, 'apikey');
            const res = await axios.get(apiUrl, { responseType: 'arraybuffer', timeout: 30000 });

            await context.client.sendMessage(
                context.chatJid,
                {
                    image: Buffer.from(res.data),
                    text: `👳‍♂️ *PAK USTADZ MENJAWAB*\n\n❓ *Tanya:* ${query}`
                },
                { quoted: context.raw }
            );
        } catch (err: any) {
            await context.reply(`❌ Gagal membuat Pak Ustadz: ${err.message || err}`);
        }
    }
};

export default handler;
