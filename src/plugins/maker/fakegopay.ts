import axios from 'axios';
import type { Plugin, PluginContext } from '../../../types/plugin.js';

const handler: Plugin = {
    command: ['fakegopay', 'fake-gopay'],
    category: 'maker',
    description: 'Membuat gambar bukti saldo Fake GoPay',
    owner: false,
    premium: false,
    group: false,
    private: false,
    admin: false,
    botadmin: false,
    execute: async (context: PluginContext): Promise<void> => {
        const [saldo, koin, terpakai, bulan] = context.text.split('|').map(v => v?.trim());
        if (!saldo || !koin || !terpakai || !bulan) {
            await context.reply(
                `💚 *FAKE GOPAY CANVAS*\n\n` +
                `⚙️ *Format Penggunaan:*\n` +
                `› *${context.usedPrefix || '.'}${context.command} saldo|koin|terpakai|bulan*\n\n` +
                `📌 *Contoh:*\n` +
                `› *${context.usedPrefix || '.'}${context.command} 50000|1000|25000|mei*`
            );
            return;
        }

        await context.reply(global.mess.wait);

        try {
            const apiUrl = global.API('kyzz', '/api/canvas/fake-gopay', { saldo, koin, terpakai, bulan }, 'apikey');
            const res = await axios.get(apiUrl, { responseType: 'arraybuffer', timeout: 30000 });

            await context.client.sendMessage(
                context.chatJid,
                { image: Buffer.from(res.data) },
                { quoted: context.raw }
            );
        } catch (err: any) {
            await context.reply(`❌ Gagal membuat Fake GoPay: ${err.message || err}`);
        }
    }
};

export default handler;
