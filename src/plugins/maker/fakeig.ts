import axios from 'axios';
import FormData from 'form-data';
import type { Plugin, PluginContext } from '../../../types/plugin.js';

const handler: Plugin = {
    command: ['fakeig', 'fakeigprofile'],
    category: 'maker',
    description: 'Membuat mockup profil Instagram custom',
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
                `📸 *FAKE INSTAGRAM PROFILE MAKER*\n\n` +
                `⚙️ *Format Penggunaan:*\n` +
                `› Kirim/reply foto dengan caption:\n` +
                `› *${context.usedPrefix || '.'}${context.command} username|bio|pengikut|mengikuti|postingan*\n\n` +
                `📌 *Contoh:*\n` +
                `› *${context.usedPrefix || '.'}${context.command} Hinata|Just living my life ✨|100k|1|727*`
            );
            return;
        }

        const parts = context.text ? context.text.split('|').map(v => v?.trim()) : [];
        const username = parts[0] || context.pushName || 'user_instagram';
        const bio = parts[1] || 'Welcome to my profile!';
        const pengikut = parts[2] || '10.5k';
        const mengikuti = parts[3] || '250';
        const postingan = parts[4] || '12';

        await context.reply(global.mess.wait);

        try {
            let profileBuffer: Buffer | null = null;

            if (isImage) {
                profileBuffer = await context.client.downloadMedia(targetMessage).catch(() => null);
            }

            if (!profileBuffer) {
                try {
                    const fallbackPfp = 'https://files.catbox.moe/sd61v3.jpg';
                    const imgRes = await axios.get(fallbackPfp, { responseType: 'arraybuffer', timeout: 15000 });
                    profileBuffer = Buffer.from(imgRes.data);
                } catch {
                    profileBuffer = null;
                }
            }

            if (!profileBuffer) {
                throw new Error('Gagal memuat foto profil.');
            }

            const form = new FormData();
            form.append('profile', profileBuffer, { filename: 'profile.jpg', contentType: 'image/jpeg' });
            form.append('username', username);
            form.append('bio', bio);
            form.append('pengikut', pengikut);
            form.append('mengikuti', mengikuti);
            form.append('postingan', postingan);

            const apiUrl = global.API('kyzz', '/api/canvas/fakeigprofile', {}, 'apikey');
            const res = await axios.post(apiUrl, form, {
                headers: form.getHeaders(),
                responseType: 'arraybuffer',
                timeout: 60000
            });

            const contentType = String(res.headers['content-type'] || '');
            let resultBuffer: Buffer;

            if (contentType.includes('application/json')) {
                const jsonStr = Buffer.from(res.data).toString('utf-8');
                const json = JSON.parse(jsonStr);
                if (json.status === false || json.error) {
                    throw new Error(json.message || json.error || 'Gagal membuat Fake IG Profile.');
                }
                if (json.url || json.result || json.image) {
                    const imgRes = await axios.get(json.url || json.result || json.image, { responseType: 'arraybuffer' });
                    resultBuffer = Buffer.from(imgRes.data);
                } else {
                    throw new Error('Respon API tidak memuat gambar.');
                }
            } else {
                resultBuffer = Buffer.from(res.data);
            }

            await context.client.sendMessage(
                context.chatJid,
                { image: resultBuffer },
                { quoted: context.raw }
            );
        } catch (err: any) {
            await context.reply(`❌ Gagal membuat Fake IG Profile: ${err.message || err}`);
        }
    }
};

export default handler;
