import axios from 'axios';
import type { Plugin, PluginContext } from '../../../types/plugin.js';

const handler: Plugin = {
    command: ['ffduo', 'ff-duo'],
    category: 'maker',
    description: 'Membuat gambar lobby Free Fire Duo custom',
    owner: false,
    premium: false,
    group: false,
    private: false,
    admin: false,
    botadmin: false,
    execute: async (context: PluginContext): Promise<void> => {
        const [user1, user2, templateInput] = context.text.split('|').map(v => v?.trim());
        if (!user1 || !user2) {
            await context.reply(
                `👩‍❤️‍👨 *FREE FIRE DUO CANVAS*\n\n` +
                `⚙️ *Format Penggunaan:*\n` +
                `› *${context.usedPrefix || '.'}${context.command} <user1>|<user2>|<template (1-11, opsional)>*\n\n` +
                `📌 *Contoh:*\n` +
                `› *${context.usedPrefix || '.'}${context.command} Hinata|Naruto*\n` +
                `› *${context.usedPrefix || '.'}${context.command} Hinata|Naruto|5*`
            );
            return;
        }

        let template: string | number = 'random';
        if (templateInput) {
            const tempNum = parseInt(templateInput, 10);
            if (!isNaN(tempNum) && tempNum >= 1 && tempNum <= 11) {
                template = tempNum;
            }
        }

        await context.reply(global.mess.wait);

        try {
            const apiUrl = global.API('kyzz', '/api/canvas/ffduo', { user1, user2, template }, 'apikey');
            const res = await axios.get(apiUrl, { responseType: 'arraybuffer', timeout: 30000 });

            await context.client.sendMessage(
                context.chatJid,
                { image: Buffer.from(res.data) },
                { quoted: context.raw }
            );
        } catch (err: any) {
            await context.reply(`❌ Gagal membuat FF Duo: ${err.message || err}`);
        }
    }
};

export default handler;
