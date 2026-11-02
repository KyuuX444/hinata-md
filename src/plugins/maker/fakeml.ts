import axios from 'axios';
import FormData from 'form-data';
import type { Plugin, PluginContext } from '../../../types/plugin.js';

const VALID_RANKS = ['epic', 'glory', 'gm', 'honor', 'imo'];
const DEFAULT_AVATAR = 'https://files.catbox.moe/sd61v3.jpg';

async function uploadToCatbox(buffer: Buffer): Promise<string> {
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', buffer, { filename: 'avatar.jpg', contentType: 'image/jpeg' });

    const res = await axios.post('https://catbox.moe/user/api.php', form, {
        headers: form.getHeaders(),
        timeout: 30000
    });
    return String(res.data).trim();
}

const handler: Plugin = {
    command: ['fakeml', 'fake-ml'],
    category: 'maker',
    description: 'Membuat gambar lobby Mobile Legends custom',
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

        if (!context.text && !isImage) {
            await context.reply(
                `⚔️ *FAKE MOBILE LEGENDS CANVAS*\n\n` +
                `⚙️ *Format Penggunaan:*\n` +
                `› *${context.usedPrefix || '.'}${context.command} <username>|<rank>|<border (1-16)>|<avatar_url (opsional)>*\n\n` +
                `🖼️ *Atau Reply Gambar dengan Caption:*\n` +
                `› *${context.usedPrefix || '.'}${context.command} <username>|<rank>|<border (1-16)>*\n\n` +
                `📌 *Pilihan Rank:* epic, glory, gm, honor, imo\n` +
                `📌 *Pilihan Border:* 1 - 16\n\n` +
                `📌 *Contoh:*\n` +
                `› *${context.usedPrefix || '.'}${context.command} Hinata|glory|1*`
            );
            return;
        }

        const parts = context.text ? context.text.split('|').map(v => v?.trim()) : [];
        let avatar = DEFAULT_AVATAR;
        let username = '';
        let rank = '';
        let border = '0';

        if (isImage) {
            try {
                const imgBuff = await context.client.downloadMedia(targetMessage);
                if (imgBuff && imgBuff.length) {
                    const uploaded = await uploadToCatbox(imgBuff).catch(() => '');
                    if (uploaded && uploaded.startsWith('http')) {
                        avatar = uploaded;
                    }
                }
            } catch {}
            [username, rank, border] = parts;
        } else {
            if (parts.length >= 4 && /^https?:\/\//i.test(parts[3])) {
                [avatar, username, rank, border] = parts;
            } else {
                [username, rank, border, avatar] = parts;
                if (!avatar || !/^https?:\/\//i.test(avatar)) avatar = DEFAULT_AVATAR;
            }
        }

        if (!username || !rank) {
            await context.reply(
                `⚠️ Username dan Rank wajib diisi!\n\n` +
                `› *Contoh: ${context.usedPrefix || '.'}${context.command} Hinata|glory|1*\n` +
                `› *Rank tersedia:* ${VALID_RANKS.join(', ')}`
            );
            return;
        }

        const rankLower = rank.toLowerCase();
        if (!VALID_RANKS.includes(rankLower)) {
            await context.reply(`⚠️ Rank tidak valid! Silakan pilih salah satu: *${VALID_RANKS.join(', ')}*`);
            return;
        }

        const borderNum = parseInt(border, 10) || 0;

        await context.reply(global.mess.wait);

        try {
            const apiUrl = global.API('kyzz', '/api/canvas/fake-ml', {
                avatar,
                username,
                rank: rankLower,
                border: borderNum
            }, 'apikey');

            const res = await axios.get(apiUrl, { responseType: 'arraybuffer', timeout: 30000 });

            await context.client.sendMessage(
                context.chatJid,
                { image: Buffer.from(res.data) },
                { quoted: context.raw }
            );
        } catch (err: any) {
            await context.reply(`❌ Gagal membuat Fake ML: ${err.message || err}`);
        }
    }
};

export default handler;
