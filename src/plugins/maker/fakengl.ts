import axios from 'axios';
import type { Plugin, PluginContext } from '../../../types/plugin.js';

const handler: Plugin = {
    command: ['fakengl', 'fake-ngl'],
    category: 'maker',
    description: 'Membuat gambar pertanyaan NGL custom',
    owner: false,
    premium: false,
    group: false,
    private: false,
    admin: false,
    botadmin: false,
    execute: async (context: PluginContext): Promise<void> => {
        const inputText = context.text.trim();
        if (!inputText) {
            await context.reply(
                `💌 *FAKE NGL CANVAS*\n\n` +
                `⚙️ *Format Penggunaan:*\n` +
                `› *${context.usedPrefix || '.'}${context.command} <teks>*\n\n` +
                `📌 *Contoh:*\n` +
                `› *${context.usedPrefix || '.'}${context.command} Hai manis*`
            );
            return;
        }

        await context.reply(global.mess.wait);

        try {
            const apiUrl = global.API('kyzz', '/api/canvas/fake-ngl', { text: inputText }, 'apikey');
            const res = await axios.get(apiUrl, { responseType: 'arraybuffer', timeout: 30000 });

            await context.client.sendMessage(
                context.chatJid,
                { image: Buffer.from(res.data) },
                { quoted: context.raw }
            );
        } catch (err: any) {
            await context.reply(`❌ Gagal membuat Fake NGL: ${err.message || err}`);
        }
    }
};

export default handler;
