import type { Plugin, PluginContext } from '../../../types/plugin.js';
import { scrapePinterest } from '../../../scrape/pinterest.js';

const handler: Plugin = {
    command: ['pinterest'],
    category: 'search',
    description: 'Cari gambar Pinterest dalam bentuk album',
    execute: async (context: PluginContext): Promise<void> => {
        const { conn, m, chatJid, text, usedPrefix, command, reply } = context;
        const query = text.trim();
        if (!query) {
            await reply(`Contoh: *${usedPrefix}${command} anime aesthetic*`);
            return;
        }

        await reply(global.mess?.wait || '⏳ Mohon tunggu...');

        const result = await scrapePinterest(query, 5);
        if (!result.status || result.results.length < 2) {
            await reply(result.error || `❌ Gambar Pinterest untuk *"${query}"* tidak ditemukan.`);
            return;
        }

        const medias = result.results.map((item, index) => ({
            image: { url: item.image },
            caption: `📌 *Pinterest #${index + 1}*\n*Keyword:* ${query}\n${item.title ? `*Title:* ${item.title}\n` : ''}🔗 ${item.url}`
        }));

        await conn.sendAlbumMessage(m?.chat || chatJid, medias, { quoted: m || context.event });
    }
};

export default handler;
