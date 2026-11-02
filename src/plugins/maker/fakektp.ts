import axios from 'axios';
import FormData from 'form-data';
import type { Plugin, PluginContext } from '../../../types/plugin.js';

const generateNIK = (): string => {
    const rand = Math.floor(100000000000 + Math.random() * 900000000000);
    return `3273${rand}`;
};

const handler: Plugin = {
    command: ['fakektp', 'ktpmaker'],
    category: 'maker',
    description: 'Membuat simulasi e-KTP Indonesia custom',
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
                `🪪 *FAKE KTP MAKER*\n\n` +
                `⚙️ *Format Penggunaan:*\n` +
                `› Reply atau kirim foto (pas photo) dengan caption:\n` +
                `› *${context.usedPrefix || '.'}${context.command} NAMA|NIK|TTL|JENIS_KELAMIN|GOLDAR|ALAMAT|RT_RW|KEL_DESA|KECAMATAN|AGAMA|STATUS|PEKERJAAN|KEWARGANEGARAAN|MASA_BERLAKU|TERBUAT|KOTA|PROVINSI*`
            );
            return;
        }

        await context.reply(global.mess.wait);

        try {
            const imgBuffer = await context.client.downloadMedia(targetMessage);
            if (!imgBuffer || imgBuffer.length === 0) {
                throw new Error('Gagal mengunduh gambar pas photo.');
            }

            const pushName = (context.pushName || 'USER').toUpperCase();
            const defaultKota = 'BANDUNG';

            const fields: Record<string, string> = {
                provinsi: 'JAWA BARAT',
                kota: defaultKota,
                nik: generateNIK(),
                nama: pushName,
                ttl: 'BANDUNG, 01-01-2000',
                jenis_kelamin: 'LAKI-LAKI',
                golongan_darah: 'O',
                alamat: 'JL. MERDEKA NO. 1',
                rt_rw: '001/002',
                kel_desa: 'CIBADUYUT',
                kecamatan: 'BOJONGLOA KIDUL',
                agama: 'ISLAM',
                status: 'BELUM KAWIN',
                pekerjaan: 'SWASTA',
                kewarganegaraan: 'WNI',
                masa_berlaku: 'SEUMUR HIDUP',
                terbuat: `${defaultKota}, 01-01-2020`
            };

            const text = context.text.trim();
            if (text) {
                if (text.includes('=')) {
                    const pairs = text.split('|');
                    for (const pair of pairs) {
                        const [key, ...valArr] = pair.split('=');
                        const k = key.trim().toLowerCase().replace('/', '_');
                        const v = valArr.join('=').trim();
                        if (k && v) {
                            if (k === 'rt_rw' || k === 'rtrw' || k === 'rt') fields.rt_rw = v;
                            else if (k === 'kel_desa' || k === 'kelurahan' || k === 'desa' || k === 'kel') fields.kel_desa = v;
                            else if (k === 'jk' || k === 'gender' || k === 'jenis_kelamin') fields.jenis_kelamin = v;
                            else if (k === 'goldar' || k === 'golongan_darah') fields.golongan_darah = v;
                            else fields[k] = v;
                        }
                    }
                } else {
                    const parts = text.split('|').map(v => v.trim());
                    if (parts[0]) fields.nama = parts[0];
                    if (parts[1]) fields.nik = parts[1];
                    if (parts[2]) fields.ttl = parts[2];
                    if (parts[3]) fields.jenis_kelamin = parts[3];
                    if (parts[4]) fields.golongan_darah = parts[4];
                    if (parts[5]) fields.alamat = parts[5];
                    if (parts[6]) fields.rt_rw = parts[6];
                    if (parts[7]) fields.kel_desa = parts[7];
                    if (parts[8]) fields.kecamatan = parts[8];
                    if (parts[9]) fields.agama = parts[9];
                    if (parts[10]) fields.status = parts[10];
                    if (parts[11]) fields.pekerjaan = parts[11];
                    if (parts[12]) fields.kewarganegaraan = parts[12];
                    if (parts[13]) fields.masa_berlaku = parts[13];
                    if (parts[14]) fields.terbuat = parts[14];
                    if (parts[15]) fields.kota = parts[15];
                    if (parts[16]) fields.provinsi = parts[16];
                }
            }

            const form = new FormData();
            form.append('provinsi', fields.provinsi);
            form.append('kota', fields.kota);
            form.append('nik', fields.nik);
            form.append('nama', fields.nama);
            form.append('ttl', fields.ttl);
            form.append('jenis_kelamin', fields.jenis_kelamin);
            form.append('golongan_darah', fields.golongan_darah);
            form.append('alamat', fields.alamat);
            form.append('rt_rw', fields.rt_rw);
            form.append('rt/rw', fields.rt_rw);
            form.append('kel_desa', fields.kel_desa);
            form.append('kel/desa', fields.kel_desa);
            form.append('kecamatan', fields.kecamatan);
            form.append('agama', fields.agama);
            form.append('status', fields.status);
            form.append('pekerjaan', fields.pekerjaan);
            form.append('kewarganegaraan', fields.kewarganegaraan);
            form.append('masa_berlaku', fields.masa_berlaku);
            form.append('terbuat', fields.terbuat);

            form.append('pas_photo', imgBuffer, {
                filename: 'pas_photo.jpg',
                contentType: 'image/jpeg'
            });

            const apiUrl = global.API('kyzz', '/api/canvas/fake-ktp', {}, 'apikey');
            const res = await axios.post(apiUrl, form, {
                headers: form.getHeaders(),
                responseType: 'arraybuffer'
            });

            await context.client.sendMessage(
                context.chatJid,
                {
                    image: Buffer.from(res.data),
                    text: `🪪 *E-KTP GENERATOR*\n\n` +
                          `› NIK: *${fields.nik}*\n` +
                          `› Nama: *${fields.nama}*\n` +
                          `› TTL: *${fields.ttl}*\n` +
                          `› Kota: *${fields.kota}*\n` +
                          `› Provinsi: *${fields.provinsi}*`
                },
                { quoted: context.raw }
            );
        } catch (err: any) {
            await context.reply(`❌ Gagal membuat Fake KTP: ${err.message || err}`);
        }
    }
};

export default handler;
