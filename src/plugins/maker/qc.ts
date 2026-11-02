import axios from 'axios';
import FormData from 'form-data';
import type { Plugin, PluginContext } from '../../../types/plugin.js';
import { addExif, imageToWebp } from '../../lib/utils.js';

const DEFAULT_AVATAR = 'https://files.catbox.moe/sd61v3.jpg';

const handler: Plugin = {
    command: ['qc', 'quotechat'],
    category: 'maker',
    description: 'Membuat stiker kutipan obrolan (Quote Chat)',
    owner: false,
    premium: false,
    group: false,
    private: false,
    admin: false,
    botadmin: false,
    execute: async (context: PluginContext): Promise<void> => {
        const quotedMsg = context.event.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const quotedText =
            quotedMsg?.conversation ||
            quotedMsg?.extendedTextMessage?.text ||
            quotedMsg?.imageMessage?.caption ||
            quotedMsg?.videoMessage?.caption;

        const txt = context.text || quotedText || '';

        if (!txt) {
            await context.reply(
                `💬 *QUOTE CHAT STICKER*\n\n` +
                `⚙️ *Format Penggunaan:*\n` +
                `› *${context.usedPrefix || '.'}${context.command} <teks>*\n` +
                `› Atau balas pesan teks dengan *${context.usedPrefix || '.'}${context.command}*\n\n` +
                `📌 *Contoh:*\n` +
                `› *${context.usedPrefix || '.'}${context.command} Halo Semuanya!*`
            );
            return;
        }

        await context.reply(global.mess.wait);

        try {
            const senderName = context.pushName || 'User';

            let pfpBuffer: Buffer | null = null;
            try {
                const fallbackRes = await axios.get(DEFAULT_AVATAR, { responseType: 'arraybuffer', timeout: 10000 });
                pfpBuffer = Buffer.from(fallbackRes.data);
            } catch {
                pfpBuffer = null;
            }

            if (!pfpBuffer) {
                const svgAvatar = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect width="512" height="512" fill="#cfd8dc"/><circle cx="256" cy="190" r="90" fill="#ffffff"/><path d="M256 310 c-110 0 -170 60 -170 140 L426 450 c0 -80 -60 -140 -170 -140 Z" fill="#ffffff"/></svg>`;
                pfpBuffer = Buffer.from(svgAvatar);
            }

            const form = new FormData();
            form.append('media', pfpBuffer, { filename: 'avatar.jpg', contentType: 'image/jpeg' });
            form.append('text', txt);
            form.append('name', senderName);

            const apiUrl = global.API('kyzz', '/api/maker/qc', {}, 'apikey');
            const res = await axios.post(apiUrl, form, {
                headers: form.getHeaders(),
                responseType: 'arraybuffer',
                timeout: 30000
            });

            const contentType = String(res.headers['content-type'] || '');
            let rawBuffer: Buffer;

            if (contentType.includes('application/json')) {
                const jsonStr = Buffer.from(res.data).toString('utf-8');
                const json = JSON.parse(jsonStr);
                if (json.status === false || json.error) {
                    throw new Error(json.message || json.error || 'Gagal membuat Quote Chat.');
                }
                if (json.url || json.result || json.image) {
                    const imgRes = await axios.get(json.url || json.result || json.image, { responseType: 'arraybuffer' });
                    rawBuffer = Buffer.from(imgRes.data);
                } else {
                    throw new Error('Respon API tidak memuat gambar sticker.');
                }
            } else {
                rawBuffer = Buffer.from(res.data);
            }

            let webpBuf: Buffer;
            try {
                webpBuf = await imageToWebp(rawBuffer);
            } catch {
                webpBuf = rawBuffer;
            }

            const stickerBuffer = addExif(webpBuf, 'Hinata MD', 'Kyzz');

            await context.client.sendMessage(
                context.chatJid,
                { sticker: stickerBuffer },
                { quoted: context.raw }
            );
        } catch (err: any) {
            await context.reply(`❌ Gagal membuat Quote Chat: ${err.message || err}`);
        }
    }
};

export default handler;
