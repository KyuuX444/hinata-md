import type { Plugin, PluginContext } from '../../../types/plugin.js';

const YT_API = 'https://api.cuki.biz.id/api/search/playyt?apikey=cuki-x&query=';

async function searchYoutube(query: string): Promise<any> {
    try {
        const res = await fetch(`${YT_API}${encodeURIComponent(query)}`, {
            signal: AbortSignal.timeout(20000)
        });
        if (!res.ok) return null;
        const json: any = await res.json();
        if (!json || !json.success || !json.data) return null;
        return json.data;
    } catch {
        return null;
    }
}

async function getThumbBuffer(url: string): Promise<Buffer | undefined> {
    try {
        const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
        if (!res.ok) return undefined;
        return Buffer.from(await res.arrayBuffer());
    } catch {
        return undefined;
    }
}

const handler: Plugin = {
    command: ['play', 'ytplay', 'ytmp3'],
    category: 'search',
    description: 'Mencari dan memutar audio lagu dari YouTube',
    execute: async (context: PluginContext): Promise<void> => {
        const query = context.text.trim();
        if (!query) {
            await context.reply(`Contoh: *${context.usedPrefix}${context.command} Hindia - Evaluasi*`);
            return;
        }

        await context.reply(global.mess.wait);

        const data = await searchYoutube(query);
        if (!data || !data.video || !data.download?.url) {
            await context.reply(`❌ Lagu *"${query}"* tidak ditemukan.`);
            return;
        }

        const { video, download } = data;
        const audioUrl = download.audio?.url || download.url;
        const thumbBuf = await getThumbBuffer(video.thumbnail?.default || video.thumbnail);

        const caption =
            `🎵 *${video.title}*\n\n` +
            `• *Channel:* ${video.author?.name || '-'}\n` +
            `• *Durasi:* ${video.duration?.timestamp || '-'}\n` +
            `• *Views:* ${Number(video.views || 0).toLocaleString('id-ID')}\n` +
            `• *Link:* ${video.url || '-'}\n\n` +
            `_Mengirim audio..._`;

        await context.client.sendMessage(context.chatJid, {
            text: caption,
            header: thumbBuf ? { image: thumbBuf } : undefined
        }, { quoted: context.raw });

        await context.client.sendMessage(context.chatJid, {
            audio: { url: audioUrl },
            mimetype: 'audio/mpeg',
            ptt: false
        }, { quoted: context.raw });
    }
};

export default handler;
