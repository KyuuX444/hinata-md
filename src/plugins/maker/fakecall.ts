import axios from 'axios';
import FormData from 'form-data';
import type { Plugin, PluginContext } from '../../../types/plugin.js';

const handler: Plugin = {
    command: ['fakecall', 'fc', 'fakevc'],
    category: 'maker',
    description: 'Membuat gambar simulasi fake WhatsApp call',
    owner: false,
    premium: false,
    group: false,
    private: false,
    admin: false,
    botadmin: false,
    execute: async (context: PluginContext): Promise<void> => {
        const quotedMsg = context.event.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const targetMessage = quotedMsg || context.event.message;
        const isImage = Boolean(targetMessage?.imageMessage);

        if (!isImage) {
            await context.reply(
                `📞 *FAKE CALL CANVAS*\n\n` +
                `⚙️ *Format Penggunaan:*\n` +
                `› Kirim atau balas gambar dengan caption:\n` +
                `› *${context.usedPrefix || '.'}${context.command} <nama> | <durasi>*\n\n` +
                `📌 *Contoh:*\n` +
                `› *${context.usedPrefix || '.'}${context.command} Ayang | 01:08:00*`
            );
            return;
        }

        let nama = context.pushName || 'Ayang';
        let durasi = '00:15:30';

        const input = context.text.trim();
        if (input) {
            if (input.includes('|')) {
                const parts = input.split('|');
                nama = parts[0].trim() || nama;
                durasi = parts[1].trim() || durasi;
            } else {
                nama = input;
            }
        }

        await context.reply(global.mess.wait);

        try {
            const mediaBuffer = await context.client.downloadMedia(targetMessage);
            if (!mediaBuffer || mediaBuffer.length === 0) {
                throw new Error('Gagal mengunduh foto profil.');
            }

            const form = new FormData();
            form.append('profile', mediaBuffer, { filename: 'profile.jpg', contentType: 'image/jpeg' });
            form.append('nama', nama);
            form.append('durasi', durasi);

            const apiUrl = global.API('kyzz', '/api/canvas/fake-call', {}, 'apikey');
            const response = await axios.post(apiUrl, form, {
                headers: form.getHeaders(),
                responseType: 'arraybuffer',
                timeout: 60000
            });

            await context.client.sendMessage(
                context.chatJid,
                {
                    image: Buffer.from(response.data),
                    text: `📞 *FAKE CALL*\n\n👤 *Nama:* ${nama}\n⏱️ *Durasi:* ${durasi}`
                },
                { quoted: context.raw }
            );
        } catch (err: any) {
            await context.reply(`❌ Gagal membuat Fake Call: ${err.message || err}`);
        }
    }
};

export default handler;
