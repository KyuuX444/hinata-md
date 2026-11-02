# 🌸 Hinata-MD — WhatsApp Multi-Device Bot

<p align="center">
  <img src="assets/menu.jpg" alt="Hinata-MD" width="220" style="border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" />
</p>

<p align="center">
  <b>Bot WhatsApp Modular Multi-Device modern berbasis TypeScript (NodeNext ESM) menggunakan zapo-js dan database SQLite3.</b>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Node.js-%E2%89%A520.x-339933?logo=node.js&logoColor=white" alt="Node.js" /></a>
  <a href="#"><img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Library-zapo--js-25D366?logo=whatsapp&logoColor=white" alt="zapo-js" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Database-SQLite3-003B57?logo=sqlite&logoColor=white" alt="SQLite3" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Architecture-Modular%20Plugins-orange" alt="Modular" /></a>
</p>

---

## 📑 Daftar Isi
1. [Fitur Utama](#-fitur-utama)
2. [Persyaratan Sistem](#-persyaratan-sistem)
3. [Panduan Instalasi Lengkap](#-panduan-instalasi-lengkap)
   - [A. Instalasi di VPS / Server Linux (Ubuntu/Debian)](#a-instalasi-di-vps--server-linux-ubuntudebian)
   - [B. Instalasi di Panel Pterodactyl](#b-instalasi-di-panel-pterodactyl)
   - [C. Instalasi di Termux (Android)](#c-instalasi-di-termux-android)
   - [D. Instalasi di Windows](#d-instalasi-di-windows)
4. [Konfigurasi Bot](#-konfigurasi-bot)
5. [Menjalankan Bot & Pengelolaan PM2](#-menjalankan-bot--pengelolaan-pm2)
6. [Struktur Folder](#-struktur-folder)
7. [Troubleshooting & Solusi Masalah](#-troubleshooting--solusi-masalah)
8. [Catatan & Disclaimer](#-catatan--disclaimer)

---

## ✨ Fitur Utama

- ⚡ **Super Cepat & Ringan**: Dibangun dengan TypeScript murni dan SQLite3 yang hemat resource RAM/CPU.
- 🔄 **Hot-Reload Plugins**: Perubahan fitur/plugin otomatis dimuat tanpa harus me-restart bot.
- 🔑 **Pairing Code & QR Code**: Mendukung koneksi tanpa scan kamera, cukup masukkan 8 digit kode pairing.
- 🤖 **Kecerdasan Buatan (AI)**: Terintegrasi ChatGPT (Backend-Anon), DeepSeek (Thinking & Reasoning Engine), NoTrack AI, DeepAI, dan PromptHero.
- 🛠️ **Tools & Media Canggih**:
  - **RVO (Reveal View Once)**: Membuka media 1x lihat dengan auto-resolve LID WhatsApp menjadi nomor asli & tag biru.
  - **OCR (Optical Character Recognition)**: Mengubah gambar menjadi teks digital.
  - **HD / AI Upscaler**: Meningkatkan resolusi foto hingga 4x Ultra HD.
  - **Kode Pos Indonesia**: Integrasi pencarian kode pos Pos Indonesia.
  - **SSWeb & Base62 Tools**: Screenshot otomatis situs web dan utilitas encoding.
- 📥 **Downloader**: TikTok (No WM & Audio), Instagram (Post/Reels/Album), Mediafire, dan Sfile Mobi.
- 🔓 **Bypass**: SFL dan Sub2Unlock shortener bypass.
- 🎨 **Maker & Stiker**: Stiker Brat, Quoted Chat (QC), Fake Bukti Transfer (Dana, GoPay, OVO), Fake KTP, Fake Call, Fake Profil Game, dan Meme Generator.
- 👥 **Group Management**: Antilink, Kick, Promote, Demote, Hidetag, Tagall, Welcome Message, dan Pengaturan Grup.
- 🕌 **Fitur Islami**: Jadwal Sholat otomatis per kota, Doa Harian, dan Kisah 25 Nabi.

---

## 💻 Persyaratan Sistem

Sebelum memulai instalasi, pastikan sistem kamu memenuhi syarat berikut:
- **Node.js**: Versi `20.x` atau `22.x` (LTS direkomendasikan).
- **Git**: Versi terbaru untuk clone repository.
- **Build Tools / Python**: Dibutuhkan oleh node-gyp untuk kompilasi modul SQLite (`better-sqlite3`).
- **RAM**: Minimal 512 MB (1 GB ke atas direkomendasikan).
- **Disk Space**: Minimal 500 MB free storage.

---

## 🚀 Panduan Instalasi Lengkap

### A. Instalasi di VPS / Server Linux (Ubuntu/Debian)

1. **Update sistem & install package pendukung:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   sudo apt install -y git curl build-essential python3 ffmpeg
   ```

2. **Install Node.js (v20 atau v22):**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
   sudo apt install -y nodejs
   ```
   *Cek instalasi:*
   ```bash
   node -v
   npm -v
   ```

3. **Install PM2 secara global (untuk background process manager):**
   ```bash
   sudo npm install -g pm2
   ```

4. **Clone repository & masuk ke direktori bot:**
   ```bash
   git clone https://github.com/username/hinata-md.git
   cd hinata-md
   ```

5. **Install dependencies:**
   ```bash
   npm install
   ```

6. **Konfigurasi bot:**
   Buka file `src/lib/config.ts` menggunakan teks editor (misalnya `nano`):
   ```bash
   nano src/lib/config.ts
   ```
   Sesuaikan `ownerNumbers` dan `pairingPhoneNumber` (lihat bagian [Konfigurasi](#-konfigurasi-bot)).

7. **Compile TypeScript ke JavaScript:**
   ```bash
   npm run build
   ```

8. **Jalankan bot menggunakan PM2:**
   ```bash
   pm2 start index.js --name "hinata-md"
   pm2 logs hinata-md
   ```
   Masukkan kode pairing yang muncul ke WhatsApp Anda: **WhatsApp > Perangkat Tertaut > Tautkan dengan Kode Telepon**.

---

### B. Instalasi di Panel Pterodactyl

1. Pastikan egg yang digunakan mendukung **Node.js 20+**.
2. Upload semua file project ke dalam file manager panel (atau clone via Git).
3. Buka tab **Startup** di panel, pastikan startup command adalah:
   ```bash
   node index.js
   ```
   *(File `build.js` akan otomatis melakukan kompilasi TypeScript jika terdeteksi env Pterodactyl).*
4. Buka tab **Console**, jalankan:
   ```bash
   npm install
   npm run build
   ```
5. Edit konfigurasi di `src/lib/config.ts` sesuai nomor bot Anda.
6. Klik **Start / Restart** panel, lalu salin kode pairing yang muncul di console ke WhatsApp.

---

### C. Instalasi di Termux (Android)

1. **Update package dan install dependencies:**
   ```bash
   pkg update && pkg upgrade -y
   pkg install nodejs-lts git python build-essential ffmpeg -y
   ```

2. **Clone repository:**
   ```bash
   git clone https://github.com/username/hinata-md.git
   cd hinata-md
   ```

3. **Install dependensi project:**
   ```bash
   npm install
   ```

4. **Edit konfigurasi:**
   ```bash
   nano src/lib/config.ts
   ```
   Ubah nomor pemilik dan nomor bot pairing Anda. Tekan `CTRL + O`, `ENTER`, lalu `CTRL + X` untuk menyimpan.

5. **Build & Jalankan:**
   ```bash
   npm run build
   npm start
   ```

---

### D. Instalasi di Windows

1. Install [Node.js (LTS)](https://nodejs.org/) dan [Git for Windows](https://git-scm.com/).
2. Buka **PowerShell** atau **Terminal** sebagai Administrator.
3. Install build tools jika belum ada:
   ```powershell
   npm install --global --production windows-build-tools
   ```
4. Clone repo dan install:
   ```powershell
   git clone https://github.com/username/hinata-md.git
   cd hinata-md
   npm install
   ```
5. Edit konfigurasi pada `src/lib/config.ts`.
6. Compile dan jalankan:
   ```powershell
   npm run build
   npm start
   ```

---

## ⚙️ Konfigurasi Bot

File konfigurasi utama terletak di:
`src/lib/config.ts`

Contoh konfigurasi penting:
```typescript
export const config: BotConfig = {
    botName: 'Hinata Md',                           // Nama bot Anda
    prefixes: ['.', '#', '!'],                      // Prefix command
    ownerNumbers: ['6283150850721'],                // Nomor Owner (Gunakan kode negara tanpa '+')
    premiumNumbers: ['6283150850721'],              // Nomor User Premium
    sessionPath: 'data/session.sqlite',             // File sesi WhatsApp SQLite
    sessionId: 'hinata-session',                    // Session ID
    authMode: 'pairing_code',                       // 'pairing_code' atau 'qr'
    pairingPhoneNumber: '6285728102979',            // Nomor WhatsApp bot untuk meminta pairing code
    thumbnailUrl: 'assets/menu.jpg',                // Path thumbnail menu bot
    mode: 'public',                                 // 'public' (bisa dipakai semua) atau 'self' (hanya owner)
    logLevel: 'info',                               // Level logging
    register: {
        enabled: true,                              // Sistem registrasi user
        defaultLimit: 30                            // Limit harian user non-premium
    }
};
```

> [!TIP]
> **Penting Saat Pairing:** Pastikan `pairingPhoneNumber` diisi nomor bot kamu dengan format internasional (contoh: `6285728102979` tanpa spasi, tanda `-`, atau tanda `+`).

---

## 🔄 Menjalankan Bot & Pengelolaan PM2

### Mode Development (Auto Reload Code):
```bash
npm run dev
```

### Mode Produksi (Kompilasi TypeScript):
```bash
npm run build
npm start
```

### Perintah Pengelolaan PM2:
| Perintah | Deskripsi |
| :--- | :--- |
| `pm2 start index.js --name "hinata-md"` | Menjalankan bot di background |
| `pm2 logs hinata-md` | Melihat log aktivitas bot secara real-time |
| `pm2 restart hinata-md` | Me-restart proses bot |
| `pm2 stop hinata-md` | Menghentikan bot |
| `pm2 monit` | Monitoring CPU & RAM usage |
| `pm2 save && pm2 startup` | Menjaga bot otomatis nyala saat server reboot |

---

## 📂 Struktur Folder

```text
hinata-md/
├── assets/                 # Aset gambar, audio, dan thumbnail
├── data/                   # Database SQLite (session.sqlite & database.sqlite)
├── scrape/                 # Modul scraper mandiri (AI, media, tools, dll.)
│   ├── chatgpt.ts
│   ├── deepseek.ts
│   ├── lirik.ts
│   ├── notrack.ts
│   ├── ocr.ts
│   └── ...
├── src/
│   ├── core/               # Handler koneksi WA, dispatcher, dan hot-loader plugins
│   ├── lib/                # Konfigurasi, helper zapo-js, SQLite database, logger
│   └── plugins/            # Kumpulan modul plugin/command
│       ├── ai/             # Fitur AI (ChatGPT, DeepSeek, NoTrack, PromptHero)
│       ├── bypass/         # Fitur bypass link
│       ├── downloader/     # Fitur pengunduh media
│       ├── group/          # Fitur admin & grup
│       ├── islamic/        # Fitur jadwal sholat, doa, kisah nabi
│       ├── main/           # Menu, ping, runtime, profile
│       ├── maker/          # Pembuat stiker, brat, QC, fake bukti transfer
│       ├── owner/          # Command khusus owner (eval, backup, plugin manager)
│       ├── search/         # Pencarian lirik, pinterest album, ytplay
│       ├── stalk/          # Stalking sosial media
│       └── tools/          # RVO, OCR, HD upscale, kodepos, ssweb
├── types/                  # Definisi antarmuka TypeScript
├── build.js                # Skrip otomatis kompilasi TypeScript
├── index.js                # Entry point aplikasi
├── package.json            # Daftar dependensi & scripts
└── tsconfig.json           # Konfigurasi compiler TypeScript
```

---

## ❓ Troubleshooting & Solusi Masalah

### 1. Error saat `npm install` pada `better-sqlite3`
- **Penyebab:** Sistem belum memiliki build tool C/C++ atau Python untuk mengompilasi native add-on SQLite.
- **Solusi:**
  - Ubuntu/Debian: Jalankan `sudo apt install -y build-essential python3`.
  - Termux: Jalankan `pkg install build-essential python -y`.
  - Windows: Jalankan `npm install --global windows-build-tools`.

### 2. Kode Pairing tidak muncul di konsol
- **Penyebab:** Format nomor salah atau sesi lama masih tersimpan.
- **Solusi:**
  - Pastikan `pairingPhoneNumber` di `src/lib/config.ts` diawali kode negara tanpa `+` (misal `628xxx`).
  - Hapus file sesi lama di `data/session.sqlite` jika ingin pairing ulang.

### 3. Perubahan plugin tidak terbaca
- Hinata-MD menggunakan hot-reloader pada folder `dist/src/plugins`.
- Jika mengedit file di folder `src/`, pastikan jalankan `npm run build` agar file di folder `dist/` ter-update.

---

## 📜 Catatan & Disclaimer

- Bot ini dibuat untuk **tujuan pembelajaran, riset, dan penggunaan pribadi**.
- Patuhi syarat dan ketentuan penggunaan dari **WhatsApp / Meta**. Pengembang tidak bertanggung jawab atas segala bentuk pemblokiran akun akibat penggunaan bot yang melanggar aturan WhatsApp (spam, broadcast liar, dll.).
- Jangan memperjualbelikan script ini secara bebas tanpa izin dari pengembang asli.

---

<p align="center">
  Dibuat dengan ❤️ oleh Hinata-MD Contributors
</p>
