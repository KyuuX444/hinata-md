import type { Plugin, PluginContext } from '../../../types/plugin.js';
import {
    createGuerrillaMail,
    generateOneAccount,
    generateBulkAccounts,
    fetchGuerrillaInbox,
    sendAmLink,
    verifyAmAccount,
    MAX_BULK_ACCOUNTS
} from '../../../scrape/alightmotion.js';

async function react(context: PluginContext, emoji: string): Promise<void> {
    try {
        if (typeof (context.m as any)?.react === 'function') {
            await (context.m as any).react(emoji);
        } else {
            const key = (context.raw as any)?.key || (context.m as any)?.key;
            if (key) {
                await context.client.sendMessage(context.chatJid, {
                    react: { text: emoji, key }
                } as any);
            }
        }
    } catch {
        // Abaikan jika reaction gagal
    }
}

const handler: Plugin = {
    command: ['amprem', 'ampremgen', 'ampremauto', 'inbox', 'cekinbox', 'gurinbox', 'amprem-verif', 'ampremverif'],
    category: 'tools',
    description: 'Alight Motion Premium generator & verifier serta Guerrilla Mail inbox checker',
    execute: async (context: PluginContext): Promise<void> => {
        const cmd = context.command.toLowerCase();
        let input = context.text.trim();

        if (!input) {
            const quotedText =
                context.event.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                context.event.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text;

            if (quotedText) {
                input = quotedText.trim();
            }
        }

        // 1. INBOX GUERRILLA MAIL
        if (cmd === 'inbox' || cmd === 'cekinbox' || cmd === 'gurinbox') {
            if (!input) {
                await context.reply(
                    `📬 *GUERRILLA MAIL INBOX*\n\n` +
                    `⚙️ *Format Penggunaan:*\n` +
                    `› *${context.usedPrefix || '.'}${context.command} <email/username>*\n\n` +
                    `📌 *Contoh:*\n` +
                    `› *${context.usedPrefix || '.'}${context.command} user@guerrillamailblock.com*\n` +
                    `› *${context.usedPrefix || '.'}${context.command} user123*`
                );
                return;
            }

            await react(context, '⏳');

            try {
                const inbox = await fetchGuerrillaInbox(input, 3);

                if (!inbox.messages.length) {
                    await react(context, '📭');
                    await context.reply(
                        `📭 *INBOX KOSONG*\n\n` +
                        `Belum ada email masuk untuk: \`${inbox.email}\`\n\n` +
                        `Silakan minta link login di aplikasi Alight Motion dengan email tersebut, lalu cek lagi dengan:\n` +
                        `\`${context.usedPrefix || '.'}${context.command} ${inbox.email}\``
                    );
                    return;
                }

                await react(context, '📬');

                let caption = `📬 *INBOX GUERRILLA MAIL*\n`;
                caption += `• *Email:* \`${inbox.email}\`\n`;
                caption += `• *Total Pesan:* ${inbox.total}\n`;
                caption += `═══════════════════════\n`;

                inbox.messages.forEach((msg, i) => {
                    caption += `\n*[ PESAN #${i + 1} ]*\n`;
                    caption += `• *Dari:* ${msg.from}\n`;
                    caption += `• *Subjek:* ${msg.subject}\n`;
                    caption += `• *Waktu:* ${msg.date}\n`;

                    if (msg.magicLink) {
                        caption += `• *Link Login Alight Motion:*\n${msg.magicLink}\n`;
                    } else {
                        caption += `• *Isi:* ${msg.snippet}...\n`;
                    }
                    caption += `───────────────────────\n`;
                });

                caption += `\n📌 *Cara Login:* Buka Link Login di atas melalui browser di HP kamu untuk langsung masuk ke aplikasi Alight Motion.`;
                await context.reply(caption.trim());
            } catch (err: any) {
                await react(context, '❌');
                await context.reply(`❌ *Gagal Membaca Inbox:*\n${err.message || err}`);
            }
            return;
        }

        // 2. VERIFIKASI AKUN ALIGHT MOTION
        if (cmd === 'amprem-verif' || cmd === 'ampremverif') {
            if (!input || !input.includes('|')) {
                await context.reply(
                    `🔐 *ALIGHT MOTION PREMIUM — VERIFIKASI*\n\n` +
                    `Verifikasi akun Alight Motion menggunakan email dan link dari pesan masuk.\n\n` +
                    `⚙️ *Format Penggunaan:*\n` +
                    `› *${context.usedPrefix || '.'}${context.command} <email>|<link_magic>*\n\n` +
                    `📌 *Contoh:*\n` +
                    `› *${context.usedPrefix || '.'}${context.command} akunanda@gmail.com|https://alightcreative.com?link=...oobCode=...*`
                );
                return;
            }

            const [rawEmail, ...restLink] = input.split('|');
            const email = rawEmail.trim();
            const link = restLink.join('|').trim();

            if (!email || !link) {
                await context.reply(`⚠️ Format tidak lengkap!\nContoh: \`${context.usedPrefix || '.'}${context.command} akunanda@gmail.com|https://alightcreative.com?link=...\``);
                return;
            }

            await react(context, '⏳');

            try {
                const data = await verifyAmAccount(email, link);
                await react(context, '✅');

                let caption = `🎉 *VERIFIKASI ALIGHT MOTION SUKSES!*\n\n`;
                caption += `• *Email:* ${email}\n`;
                if (data.message) caption += `• *Status:* ${data.message}\n`;
                if (data.orderId) caption += `• *Order ID:* ${data.orderId}\n`;
                if (data.uid) caption += `• *UID:* ${data.uid}\n`;

                await context.reply(caption.trim());
            } catch (err: any) {
                await react(context, '❌');
                const errMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Gagal memverifikasi akun.';
                await context.reply(`❌ *Gagal Verifikasi:*\n${errMsg}`);
            }
            return;
        }

        // 3. GENERATE ALIGHT MOTION PREMIUM (SINGLE / BULK / MANUAL EMAIL)
        if (cmd === 'amprem' || cmd === 'ampremgen' || cmd === 'ampremauto') {
            // Jika user memasukkan email manual
            if (input && input.includes('@')) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(input)) {
                    await context.reply(`⚠️ Format email tidak valid. Masukkan alamat email yang benar!\n\nContoh:\n*${context.usedPrefix || '.'}${context.command} akunanda@gmail.com*`);
                    return;
                }

                await react(context, '⏳');

                try {
                    const data = await sendAmLink(input);
                    await react(context, '✅');

                    let caption = `📬 *LINK VERIFIKASI BERHASIL DIKIRIM!*\n\n`;
                    caption += `• *Email:* ${input}\n`;
                    if (data.message) caption += `• *Status:* ${data.message}\n`;
                    caption += `\nSilakan cek inbox/spam email kamu, lalu salin link verifikasinya dan verifikasi dengan perintah:\n`;
                    caption += `\`${context.usedPrefix || '.'}amprem-verif ${input}|<link_dari_email>\``;

                    await context.reply(caption.trim());
                } catch (err: any) {
                    await react(context, '❌');
                    const errMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Gagal mengirim link verifikasi.';
                    await context.reply(`❌ *Gagal Mengirim Link:*\n${errMsg}`);
                }
                return;
            }

            // Jumlah akun yang diminta
            let requestedCount = 1;
            if (input && !isNaN(Number(input))) {
                requestedCount = parseInt(input, 10);
            }

            if (requestedCount > MAX_BULK_ACCOUNTS) {
                await context.reply(`⚠️ Batas maksimal pembuatan sekaligus adalah *${MAX_BULK_ACCOUNTS} akun* agar tidak terkena rate limit.\n\nContoh: \`${context.usedPrefix || '.'}${context.command} ${MAX_BULK_ACCOUNTS}\``);
                return;
            }

            await react(context, '⏳');

            // 1 Akun
            if (requestedCount <= 1) {
                await context.reply(`✨ Sedang membuat 1 akun Alight Motion Premium menggunakan Guerrilla Mail... Mohon tunggu sebentar ya kak~ ₍ ˶ᵔ ᵕ ᵔ˶ ₎`);

                try {
                    const acc = await generateOneAccount();
                    await react(context, '✅');

                    let caption = `🎉 *ALIGHT MOTION PREMIUM BERHASIL DIBUAT!*\n\n`;
                    caption += `• *Email:* \`${acc.email}\`\n`;
                    caption += `• *Status:* Premium Aktif ✅\n`;
                    caption += `• *Order ID:* ${acc.orderId}\n`;
                    caption += `• *UID:* ${acc.uid}\n\n`;
                    caption += `🔗 *Login / Magic Link:*\n${acc.magicLink}\n\n`;
                    caption += `📌 *Cara Login:*\n1. Buka tautan link di atas di browser HP kamu untuk langsung masuk ke akun.\n2. Jika ingin login ulang lewat aplikasi di kemudian hari, masukkan email di atas di app Alight Motion, lalu cek linknya dengan perintah:\n\`${context.usedPrefix || '.'}inbox ${acc.email}\``;

                    await context.reply(caption.trim());
                } catch (err: any) {
                    await react(context, '❌');
                    const errMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Gagal membuat akun.';
                    await context.reply(`❌ *Gagal Auto Generate Akun:*\n${errMsg}`);
                }
                return;
            }

            // Bulk Akun
            await context.reply(`⚡ Sedang membuat *${requestedCount} Akun Alight Motion Premium* secara paralel... Mohon ditunggu sebentar ya kak~ ₍ ˶ᵔ ᵕ ᵔ˶ ₎`);

            try {
                const { total, successList, failedList } = await generateBulkAccounts(requestedCount);

                if (successList.length === 0) {
                    await react(context, '❌');
                    await context.reply(`❌ Semua pembuatan akun gagal.\nError: ${failedList.map((f) => f.error).join(', ')}`);
                    return;
                }

                await react(context, '✅');

                let caption = `🎉 *BULK GENERATE ALIGHT MOTION SUKSES!*\n\n`;
                caption += `• *Total Diminta:* ${total}\n`;
                caption += `• *Total Berhasil:* ${successList.length}\n`;
                if (failedList.length > 0) caption += `• *Total Gagal:* ${failedList.length}\n`;
                caption += `\n═══════════════════════\n`;

                successList.forEach((acc, i) => {
                    caption += `\n*[ AKUN #${i + 1} ]*\n`;
                    caption += `• *Email:* \`${acc.email}\`\n`;
                    caption += `• *Order ID:* ${acc.orderId}\n`;
                    caption += `• *UID:* ${acc.uid}\n`;
                    caption += `• *Login Link:* ${acc.magicLink}\n`;
                    caption += `───────────────────────\n`;
                });

                caption += `\n📌 *Cara Login:* Buka tautan Login Link di HP atau baca inbox ulang dengan \`${context.usedPrefix || '.'}inbox <email>\`.`;

                await context.reply(caption.trim());
            } catch (err: any) {
                await react(context, '❌');
                await context.reply(`❌ *Gagal Bulk Generate:*\n${err.message || err}`);
            }
        }
    }
};

export default handler;
