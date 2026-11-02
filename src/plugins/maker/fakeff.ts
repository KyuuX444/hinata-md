import axios from 'axios';
import type { Plugin, PluginContext } from '../../../types/plugin.js';

const handler: Plugin = {
    command: ['fakeff', 'fake-ff'],
    category: 'maker',
    description: 'Membuat gambar lobby Free Fire custom',
    owner: false,
    premium: false,
    group: false,
    private: false,
    admin: false,
    botadmin: false,
    execute: async (context: PluginContext): Promise<void> => {
        const [username, lobby] = context.text.split('|').map(v => v?.trim());
        if (!username || !lobby) {
            await context.reply(
                `🎮 *FAKE FF LOBBY CANVAS*\n\n` +
                `⚙️ *Format Penggunaan:*\n` +
                `› *${context.usedPrefix || '.'}${context.command} <username>|<lobby (1-30)>*\n\n` +
                `📌 *Contoh:*\n` +
                `› *${context.usedPrefix || '.'}${context.command} Hinata|11*`
            );
            return;
        }

        const lobbyNum = parseInt(lobby, 10);
        if (isNaN(lobbyNum) || lobbyNum < 1 || lobbyNum > 30) {
            await context.reply('⚠️ Lobby harus berupa angka antara 1 sampai 30!');
            return;
        }

        await context.reply(global.mess.wait);

        try {
            const apiUrl = global.API('kyzz', '/api/canvas/fake-ff', { username, lobby: lobbyNum }, 'apikey');
            const res = await axios.get(apiUrl, { responseType: 'arraybuffer', timeout: 30000 });

            await context.client.sendMessage(
                context.chatJid,
                { image: Buffer.from(res.data) },
                { quoted: context.raw }
            );
        } catch (err: any) {
            await context.reply(`❌ Gagal membuat Fake FF: ${err.message || err}`);
        }
    }
};

export default handler;
