> Read in [English](README.md) · Terjemahan ringkasan dari `README.md`. Seluruh dokumentasi teknis mendalam dan aturan rekayasa tetap dalam bahasa Inggris sebagai sumber otoritatif.

# WDI Method

**Lapisan tinjauan (review layer) yang melengkapi BMad — dokumen yang dibaca manusia untuk memverifikasi keputusan sebelum kode ditulis, disesuaikan dengan skala perubahan nyata.**

[BMad](https://github.com/bmad-code-org/BMAD-METHOD) menentukan *apa* yang dibangun dan *bagaimana* membangunnya dengan baik. WDI Method membungkusnya — tanpa menggantikannya — dan menambahkan lapisan antara kedua keputusan tersebut dengan kode aplikasi: inventaris sistem, katalog use case, catatan desain komponen, serta mekanisme penentuan kedalaman dokumen sesuai kebutuhan nyata.

> Repositori ini bersifat **publik dan generik**. Repositori ini **TIDAK BOLEH** memuat nama klien, nama produk komersial, atau tautan ke repositori privat. Identitas produk dikonfigurasi sepenuhnya di repositori yang memasangnya.

---

## Prasyarat — Dua Engine Wajib

| Engine | Peran dalam WDI Method | Sumber |
|---|---|---|
| **BMad Method** | Menulis dokumen fondasi di balik G1–G4 (Brief, PRD, Arsitektur, UX) | [github.com/bmad-code-org/BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD) |
| **mattpocock/skills** | Memotong pekerjaan pada G5 (`to-spec`, `to-tickets`); menjalankan Fast Path dan setiap iterasi `wdi-autopilot` (`implement`) | [github.com/mattpocock/skills](https://github.com/mattpocock/skills) |

Installer akan menolak pemasangan jika salah satu engine belum tersedia di repositori produk.

---

## Pemasangan Cepat (Quick Start)

Tiga langkah berurutan di repositori produk Anda:

**1. BMad Method:**
```bash
cd /path/ke/repo-produk-anda
npx bmad-method install
```

**2. mattpocock/skills (enam engine lengkap):**
```bash
npx skills@latest add mattpocock/skills
```
Pilih seluruh 6 engine yang dikendalikan oleh method: `to-spec`, `to-tickets`, `implement`, `tdd`, `code-review`, dan `domain-modeling`.

**3. WDI Method:**
```bash
npx wdi-method
```
Perintah ini akan membuka antarmuka TUI interaktif untuk memeriksa BMad dan engine tiket, mendeteksi mode instalasi vs pembaruan, menanyakan nama produk dan bahasa dokumen, serta memasang skill ke lingkungan agent pilihan Anda (Claude Code, Cursor, Windsurf, OpenCode, Antigravity, dll.).

Untuk pembaruan versi method di kemudian hari:
```bash
npx wdi-method@latest update --yes
```

---

## Lima Gerbang Tinjauan (G1–G5)

Prinsip kerja WDI Method berpusat pada keterlibatan manusia pada titik keputusan krusial:

| Gerbang | Skill | Dokumen yang Dibaca Manusia | Keputusan Pemilik |
|---|---|---|---|
| **G1** | `wdi-problem` | `.what-rendered/_product-brief/brief.md` | Apakah ini masalah nyata, milik siapa, dan layak diselesaikan? |
| **G2** | `wdi-product` | `.what-rendered/_prd/<slug>/prd.md` | Apakah ini solusi yang akan kita bangun dan bagaimana alurnya? |
| **G3** | `wdi-blueprint` | `.how-rendered/blueprint.md` | Apakah seluruh arsitektur sistem saling terhubung utuh? (Sekali per produk) |
| **G4** | `wdi-component` | `.how-rendered/<pc>/SDD-<pc>.md` | Bagaimana komponen teknis dibangun? (Dilewati pada `mode: catalog`) |
| **G5** | `wdi-build` | Bukti pengujian nyata (merah ke hijau) | Apakah tiket telah terimplementasi dan terverifikasi? (Satu kali per spec) |

### Autopilot Otonom (`wdi-autopilot`)
Untuk pekerjaan implementasi bertahap tanpa interupsi pertanyaan di tengah jalan, gunakan `wdi-autopilot`. Pemilik produk menetapkan satu **mandat** di awal (cakupan FR, batasan risiko, interval loop), dan agent akan menjalankan iterasi loop (`/loop 5m /wdi-autopilot`), mencatat setiap keputusan teknis ke dalam ledger, dan berhenti hanya saat mandat tuntas atau terblokir.

### Tingkat Harian Otonom (`/wdi-daily-*`) & Manajemen Siklus Hidup
Untuk alur kerja harian berkecepatan tinggi dengan minim interupsi:
- **`/wdi-prune-or-archive [spec-id] [--archive|--prune]`**: Pembersihan berkas spek tertutup dari `.scratch/` ke `.archive/specs/` atau pembersihan disk secara aman dengan preservasi jejak audit RTM.
- **`/wdi-daily-what-to-build [reviewer] <notes>`**: Klasifikasi catatan uji manual menjadi tiket/spek, draf spek via `wdi-build` langsung di cabang development, dan permohonan second opinion independen tanpa interupsi housekeeping.
- **`/wdi-daily-autopilot [in-session] [peer] [interval] [--skip-peer-review]`**: Menyusun dan meluncurkan rutinitas mandat otonom (`/loop 10m /wdi-autopilot`) dengan integrasi konfigurasi runner lokal (`.control/custom-dispatch.yaml`).
- **`/wdi-daily-what-to-test [web <target>|mobile <target>|desktop]`**: Langkah verifikasi pasca-merge. Sinkronisasi cabang development, pembersihan worktree dan branch remote yang telah dimerge, gate proses desktop untuk mencegah file-locking, penghapusan log smoke sementara, dan penyusunan checklist uji fisik berbasis delta commit (menggunakan template di `.control/test-targets/`).

---

## Ketahanan Proses & Lingkungan Eksekusi

Sesi autonomous agent yang menjalankan loop panjang wajib menjaga keberlangsungan proses (*process survivability*):
- **Linux / Remote SSH:** Wajib dijalankan di dalam session manager seperti `tmux` (`tmux new -s autopilot`) atau `screen` agar terputusnya koneksi SSH tidak menghentikan loop mandat.
- **Windows (PowerShell / Windows Terminal):** Jalankan di tab/jendela Windows Terminal terpisah yang dibiarkan terbuka, atau melalui alat subagent latar belakang (`run_in_background`). Jangan memaksakan ketergantungan `tmux` secara native pada Windows PowerShell.

---

## Lisensi & Merek Dagang

- **Lisensi Kode:** Seluruh kode sumber WDI Method didistribusikan di bawah [MIT License](LICENSE).
- **Kebijakan Privasi & Keamanan:** Sepenuhnya offline-first tanpa telemetri atau soket jaringan luar (lihat [PRIVACY.md](PRIVACY.md) dan [SECURITY.md](SECURITY.md)).
- **Nama dan Ikon (The Name and the Icon):** Nama "Wira Delta Indonesia", "WDI Method", dan simbol/logo monogram studio adalah merek dagang sah milik PT Wira Delta Indonesia dan terpisah dari lisensi terbuka kode (lihat klausul di `README.md` §The name and the icon).
