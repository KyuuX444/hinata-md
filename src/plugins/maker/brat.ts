import axios from 'axios';
import type { Plugin, PluginContext } from '../../../types/plugin.js';
import { addExif, imageToWebp, videoToWebp } from '../../lib/utils.js';

const activeSessions = new Set<string>();

const themes: Record<string, string> = {
    white: 'White',
    black: 'Black',
    green: 'Green',
    pink: 'Pink'
};

const handler: Plugin = {
    command: [
        'brat', 'bratpink', 'bratgreen', 'bratblack',
        'bratv2', 'bratv2_guide',
        'bratvid', 'bratv', 'bratvidv2', 'bratvidpink', 'bratvidgreen', 'bratvidblack',
        'bratgojo', 'bratgojov', 'bratvidgojo',
        'bratvermeil', 'bratvermail', 'bratvidvermeil', 'bratvidvermail', 'bratvermeilv', 'bratvermailv'
    ],
    category: 'maker',
    description: 'Membuat stiker teks gaya Brat dan variasinya',
    owner: false,
    premium: false,
    group: false,
    private: false,
    admin: false,
    botadmin: false,
    execute: async (context: PluginContext): Promise<void> => {
        const cmdLower = context.command.toLowerCase();
        const text = context.text.trim();

        if (cmdLower === 'bratv2_guide') {
            await context.reply(
                `*PANDUAN FORMAT BRAT V2*\n\n` +
                `Fitur brat v2 membutuhkan pemisah tanda garis (\`|\`)\n\n` +
                `Contoh penggunaan:\n` +
                `› *${context.usedPrefix || '.'}bratv2 baris satu | baris dua | baris tiga*\n\n` +
                `Catatan:\n` +
                `• Minimal 1 baris, maksimal 3 baris teks.`
            );
            return;
        }

        if (!text) {
            await context.reply(
                `*BRAT STICKER GENERATOR*\n\n` +
                `*Brat Standar:*\n` +
                `› *${context.usedPrefix || '.'}brat <teks>*\n` +
                `› *${context.usedPrefix || '.'}bratpink <teks>*\n` +
                `› *${context.usedPrefix || '.'}bratgreen <teks>*\n` +
                `› *${context.usedPrefix || '.'}bratblack <teks>*\n\n` +
                `*Brat Multi Baris:*\n` +
                `› *${context.usedPrefix || '.'}bratv2 <teks1 | teks2 | teks3>*\n\n` +
                `*Brat Video:*\n` +
                `› *${context.usedPrefix || '.'}bratvid <teks>*\n` +
                `› *${context.usedPrefix || '.'}bratvidv2 <teks>*\n` +
                `› *${context.usedPrefix || '.'}bratvidpink <teks>*\n` +
                `› *${context.usedPrefix || '.'}bratvidgreen <teks>*\n` +
                `› *${context.usedPrefix || '.'}bratvidblack <teks>*\n\n` +
                `*Special Character:*\n` +
                `› *${context.usedPrefix || '.'}bratgojo <teks>*\n` +
                `› *${context.usedPrefix || '.'}bratgojov <teks>*\n` +
                `› *${context.usedPrefix || '.'}bratvermeil <teks>*\n` +
                `› *${context.usedPrefix || '.'}bratvidvermeil <teks>*`
            );
            return;
        }

        const userJid = context.senderJid;
        if (activeSessions.has(userJid)) {
            await context.reply('⚠️ Masih ada proses pembuatan brat yang sedang berlangsung.');
            return;
        }

        let mode = 'brat';
        let directTheme = 'white';

        if (cmdLower === 'bratgojo') {
            mode = 'gojo';
        } else if (cmdLower === 'bratgojov' || cmdLower === 'bratvidgojo') {
            mode = 'gojov';
        } else if (cmdLower === 'bratvermeil' || cmdLower === 'bratvermail') {
            mode = 'vermeil';
        } else if (cmdLower === 'bratvidvermeil' || cmdLower === 'bratvidvermail' || cmdLower === 'bratvermeilv' || cmdLower === 'bratvermailv') {
            mode = 'vermeilv';
        } else if (cmdLower === 'bratvidv2') {
            mode = 'bratvidv2';
        } else if (cmdLower === 'bratvid' || cmdLower === 'bratv') {
            mode = 'bratvid';
        } else if (cmdLower === 'bratv2') {
            mode = 'bratv2';
        } else if (cmdLower === 'bratpink') {
            directTheme = 'pink';
        } else if (cmdLower === 'bratgreen') {
            directTheme = 'green';
        } else if (cmdLower === 'bratblack') {
            directTheme = 'black';
        } else if (cmdLower === 'bratvidpink') {
            mode = 'bratvid';
            directTheme = 'pink';
        } else if (cmdLower === 'bratvidgreen') {
            mode = 'bratvid';
            directTheme = 'green';
        } else if (cmdLower === 'bratvidblack') {
            mode = 'bratvid';
            directTheme = 'black';
        }

        const isGif = /--gif/i.test(text) || mode === 'bratvid' || mode === 'bratvidv2' || mode === 'gojov' || mode === 'vermeilv';
        let cleanText = text.replace(/--gif/gi, '').trim();
        let teksInput = cleanText;
        let themeInput = directTheme;

        if (cleanText.includes('|') && mode === 'brat') {
            const parts = cleanText.split('|').map(s => s.trim());
            const lastPart = parts[parts.length - 1].toLowerCase();
            if (themes[lastPart]) {
                themeInput = lastPart;
                parts.pop();
                teksInput = parts.join('|');
            } else {
                mode = 'bratv2';
            }
        }

        activeSessions.add(userJid);
        const sessionTimeout = setTimeout(() => {
            activeSessions.delete(userJid);
        }, 60000);

        await context.reply(global.mess.wait);

        try {
            let apiUrl = '';
            if (mode === 'gojo') {
                apiUrl = global.API('kyzz', '/api/maker/brat-gojo', { text: teksInput }, 'apikey');
            } else if (mode === 'gojov') {
                apiUrl = global.API('kyzz', '/api/maker/brat-gojov', { text: teksInput }, 'apikey');
            } else if (mode === 'vermeil') {
                apiUrl = global.API('kyzz', '/api/maker/brat-vermail', { text: teksInput }, 'apikey');
            } else if (mode === 'vermeilv') {
                apiUrl = global.API('kyzz', '/api/maker/bratvid-vermeil', { text: teksInput }, 'apikey');
            } else if (mode === 'bratvidv2') {
                apiUrl = global.API('kyzz', '/api/maker/bratvid-v2', {
                    text: teksInput.replace(/\|/g, ' '),
                    theme: themeInput,
                    format: 'gif'
                }, 'apikey');
            } else if (mode === 'bratvid') {
                apiUrl = global.API('kyzz', '/api/maker/bratvid', {
                    text: teksInput.replace(/\|/g, ' '),
                    theme: themeInput,
                    format: 'gif'
                }, 'apikey');
            } else if (mode === 'bratv2') {
                const parts = teksInput.split('|').map(s => s.trim()).filter(Boolean);
                const query: Record<string, string> = {
                    text1: parts[0] || teksInput,
                    theme: themeInput
                };
                if (parts[1]) query.text2 = parts[1];
                if (parts[2]) query.text3 = parts[2];
                apiUrl = global.API('kyzz', '/api/maker/brat-v2', query, 'apikey');
            } else {
                apiUrl = global.API('kyzz', '/api/maker/brat', {
                    text: teksInput,
                    theme: themeInput
                }, 'apikey');
            }

            const res = await axios.get(apiUrl, { responseType: 'arraybuffer', timeout: 60000 });
            const buff = Buffer.from(res.data);

            let stickerBuff: Buffer;
            if (isGif) {
                const webpBuff = await videoToWebp(buff);
                stickerBuff = addExif(webpBuff, 'Hinata MD', 'Kyzz');
            } else {
                const webpBuff = await imageToWebp(buff);
                stickerBuff = addExif(webpBuff, 'Hinata MD', 'Kyzz');
            }

            await context.client.sendMessage(
                context.chatJid,
                { sticker: stickerBuff },
                { quoted: context.raw }
            );
        } catch (err: any) {
            await context.reply(`❌ Gagal membuat Brat: ${err.message || err}`);
        } finally {
            clearTimeout(sessionTimeout);
            activeSessions.delete(userJid);
        }
    }
};

export default handler;
