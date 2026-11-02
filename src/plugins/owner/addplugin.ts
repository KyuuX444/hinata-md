import fs from 'node:fs';
import path from 'node:path';
import type { Plugin, PluginContext } from '../../../types/plugin.js';

const handler: Plugin = {
    command: ['addplugin', 'addp', 'ap'],
    category: 'owner',
    description: 'Menambah atau memperbarui file plugin baru',
    owner: true,
    execute: async (context: PluginContext): Promise<void> => {
        let fileName = '';
        let fileContent = '';

        const quotedText =
            context.event.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
            context.event.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text;

        if (quotedText) {
            fileName = context.text.trim();
            fileContent = quotedText;
        } else {
            const firstSpace = context.text.indexOf(' ');
            if (firstSpace === -1) {
                await context.reply(
                    `*Cara Penggunaan:*\n` +
                    `1. Reply pesan yang berisi kode plugin dengan caption:\n` +
                    `   *${context.usedPrefix}${context.command} group/namafile.ts*\n` +
                    `2. Atau tulis langsung: *${context.usedPrefix}${context.command} group/namafile.ts <kode_disini>*`
                );
                return;
            }
            fileName = context.text.substring(0, firstSpace).trim();
            fileContent = context.text.substring(firstSpace + 1).trim();
        }

        if (!fileName || (!fileName.endsWith('.ts') && !fileName.endsWith('.js'))) {
            await context.reply('❌ Nama file harus berakhiran *.ts* atau *.js* (contoh: *group/kick.ts*)');
            return;
        }

        const baseDir = path.resolve('src/plugins');
        const targetPath = path.resolve(baseDir, fileName);

        if (!targetPath.startsWith(baseDir)) {
            await context.reply('❌ Path tidak valid.');
            return;
        }

        try {
            const dir = path.dirname(targetPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            const isUpdate = fs.existsSync(targetPath);
            fs.writeFileSync(targetPath, fileContent, 'utf-8');

            await context.reply(
                `✅ *Plugin Berhasil ${isUpdate ? 'Diperbarui' : 'Ditambahkan'}!*\n` +
                `• File: \`src/plugins/${fileName}\`\n` +
                `_Hot-reload otomatis mendeteksi perubahan ini._`
            );
        } catch (err: any) {
            console.error(err);
            await context.reply(`❌ Gagal menyimpan plugin: ${err.message}`);
        }
    }
};

export default handler;
