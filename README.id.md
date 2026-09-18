# WDI Method

[English](README.md) | [Bahasa Indonesia](README.id.md) | [日本語](README.ja.md) | [简体中文](README.zh.md)

**Lapisan tinjauan yang melengkapi BMad — spesifikasi terverifikasi yang dibaca manusia untuk memeriksa keputusan teknis sebelum kode ditulis, disesuaikan dengan skala perubahan nyata.**

[BMad](https://github.com/bmad-code-org/BMAD-METHOD) menentukan *apa* yang dibangun dan *bagaimana* menyusun solusi dengan baik. WDI Method membungkusnya — tanpa menggantikannya — menyediakan lapisan tata kelola terverifikasi antara keputusan arsitektur tingkat tinggi dan kode aplikasi: registri kebutuhan, katalog use case, batasan komponen, validator deviasi otomatis, dan loop harian otonom yang andal.

> Repositori ini bersifat **publik dan generik**. Repositori ini **TIDAK BOLEH** memuat nama klien, nama produk komersial, atau tautan ke repositori privat. Identitas produk dikonfigurasi sepenuhnya di repositori yang memasangnya.

---

## Pandangan Menyeluruh: AI-Driven Development (AiDD) vs. Vibe Coding

Prompting spekulatif ("vibe coding") pasti gagal pada sistem produksi jangka panjang: AI coding agent kehilangan konteks, berhalusinasi menyatakan tugas selesai, dan mengaburkan batasan kebutuhan. WDI Method menegakkan disiplin **AI-Driven Development (AiDD)** melalui triad arsitektur tiga lapis:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. Tujuan & Strategi: BMad Method                                       │
│    Menggali masalah pengguna, draf brief produk, dan arsitektur awal    │
├─────────────────────────────────────────────────────────────────────────┤
│ 2. Lapisan Tinjauan Terverifikasi: WDI Method (SSOT)                    │
│    Mengawal 5 gerbang manusia, menghubungkan Goal → FR → UC → Ticket,   │
│    menjalankan validator deviasi, dan memandu loop otonom harian        │
├─────────────────────────────────────────────────────────────────────────┤
│ 3. Pemotongan & Implementasi: Skills Engines (mattpocock/skills)        │
│    to-spec & to-tickets memotong tracer-bullet; implement memandu TDD   │
└─────────────────────────────────────────────────────────────────────────┘
```

### Invarian Utama: Dokumen Selalu Mengikuti Kode
Dokumen adalah catatan yang ditinggalkan oleh pekerjaan yang sudah selesai. Jika catatan keputusan atau baris kebutuhan bertentangan dengan kode aplikasi, **kode yang menang dan dokumen yang diperbaiki**. Kode tidak boleh diubah agar cocok dengan dokumen usang. Dokumen yang tertinggal dari kode adalah keadaan wajar dan tidak boleh memblokir rilis kecuali memuat klaim basi yang menyesatkan.

---

## Panduan Memulai dalam 10 Menit

Pasang WDI Method ke dalam repositori produk Anda melalui tiga langkah berurutan. Seluruh prompt menyediakan jawaban default yang dapat disetujui dengan menekan <kbd>Enter</kbd>.

### Langkah 1: Pasang BMad Method
Memasang mesin perumusan masalah ke repositori produk Anda:
```bash
cd /path/ke/repo-produk-anda
npx bmad-method install
```

### Langkah 2: Tambahkan Enam Engine Tiket
Pasang engine eksekusi langsung ke repositori produk (pilih "copy" atau "symlink"):
```bash
npx skills@latest add mattpocock/skills
```
*Pilih seluruh 6 engine yang dikendalikan oleh method:* `to-spec`, `to-tickets`, `implement`, `tdd`, `code-review`, dan `domain-modeling`.

> **Kenapa plugin Claude Code tidak mencukupi:** Engine hulu membawa flag `disable-model-invocation: true`. WDI Method secara otomatis mencopot flag ini dari salinan lokal agar loop otonom dapat menjalankannya tanpa pengawasan manusia. Plugin tingkat pengguna tidak dapat dimodifikasi oleh repositori.

### Langkah 3: Pasang WDI Method
Membuka installer interaktif dan menyinkronkan skill ke platform agent Anda (Claude Code, Cursor, OpenCode, Windsurf, dll.):
```bash
npx wdi-method
```
*(Untuk lingkungan otomasi CI: `npx wdi-method install --yes --agents claude --product "Nama Produk"`)*

### Perintah Pertama Anda: `/wdi-help`
Di dalam AI coding agent Anda (Claude Code, Cursor), jalankan:
```text
/wdi-help
```
`wdi-help` memeriksa folder `.control/registry/` dan langsung memberi tahu gerbang mana yang sedang aktif tanpa menebak dari riwayat percakapan.

---

## Tiga Opsi Alur Kerja

WDI Method menyesuaikan tata kelolanya dengan skala dan risiko pekerjaan:

### Opsi A: Alur Pengiriman Terarah (Inisiatif Baru & Gerbang G1–G5)
Untuk produk baru, inisiatif besar, dan perubahan arsitektur. Manusia membaca **satu halaman ter-render** per gerbang dan memutuskan: *lanjut atau perbaiki*.

| Gerbang | Pertanyaan yang Dijawab | Skill yang Dijalankan | Halaman yang Dibaca | Keputusan Pemilik |
|---|---|---|---|---|
| **G1 — Problem** | Apakah masalah ini nyata, milik siapa, dan layak dikerjakan? | `/wdi-problem` | `.what-rendered/_product-brief/brief.md` | Setujui rumusan masalah |
| **G2 — Product** | Apa yang kita bangun, dan bagaimana alur pengalamannya? | `/wdi-product`<br>`/wdi-ux` | `.what-rendered/_prd/<slug>/prd.md` | Setujui janji fungsional (FR) |
| **G3 — Blueprint** | Apakah keseluruhan arsitektur terhubung utuh? *(Sekali per repo)* | `/wdi-blueprint` | `.how-rendered/blueprint.md` | Setujui pondasi arsitektur |
| **G4 — Component** | Bagaimana komponen teknis dibangun? *(Dilewati pada `mode: catalog`)* | `/wdi-component` | `.how-rendered/<pc>/SDD-<pc>.md` | Setujui desain perangkat lunak |
| **G5 — Build** | Apakah irisan tiket selesai, terverifikasi, dan terbukti? *(Per spek)* | `/wdi-build` | Bukti runner pengujian (merah &rarr; hijau) | Terima kode yang dimerge |

#### Dua Tombol yang Tidak Pernah Digabung: Mode vs. Risiko
- **`mode`** menentukan gerbang mana yang wajib ada (`catalog` melewati G4; `guarded` dan `deep` mewajibkan SDD menyeluruh).
- **`risk_accepted`** menentukan kedalaman bukti verifikasi yang diminta (`low`, `medium`, `high`). Menggabungkannya menjadi satu tombol "rigor" akan membebani komponen kecil dengan birokrasi atau meloloskan perubahan berisiko tinggi tanpa pengujian.

---

### Opsi B: Operasi Harian Otonom (Fase 4 Daily Tier)
Setelah arsitektur ditegakkan, rekayasa sehari-hari adalah ritme kerja harian. WDI Method menyediakan 4 perkakas praktis:

1. **`/wdi-daily-what-to-build [reviewer] <notes>`**:  
   Mengubah catatan uji manual, umpan balik QA, atau laporan bug menjadi spesifikasi teknis terstruktur. Mengklasifikasikan kebutuhan terhadap korpus, menyusun draf tiket di cabang development, dan meminta second opinion independen read-only.
2. **`/wdi-daily-autopilot [self-review] [peer] [interval]`**:  
   Meluncurkan rutinitas otonom di bawah mandat yang disetujui pemilik produk. Berjalan tanpa interupsi dengan ritme loop (default: `/loop 10m /wdi-autopilot`), menjalankan siklus TDD dan memperbarui ledger setelah setiap keputusan.
3. **`/wdi-daily-what-to-test [web|mobile|desktop]`**:  
   Koordinator pengujian fisik pasca-merge. Sinkronisasi cabang development, pembersihan worktree dan branch remote yang telah dimerge, pencegahan file-lock desktop, dan penyusunan checklist uji fisik berbasis delta commit (`before_sync..HEAD`).
4. **`/wdi-prune-or-archive [spec-id] [--archive|--prune]`**:  
   Menjaga kebersihan repositori dengan memindahkan spesifikasi tertutup dari `.scratch/` ke `.archive/specs/` atau membersihkan folder fisik via `git rm`, dengan preservasi 100% jejak audit RTM.

---

### Opsi C: Jalur Cepat (`/implement` Langsung)
Perbaikan bug kecil atau penyesuaian kosmetik yang tidak menyentuh `FR`, `UC`, `AD-N`, atau domain model dapat melewati seluruh gerbang dokumen dan menjalankan `/implement` langsung. Jika perubahan meluas menyentuh kebutuhan fungsional, proses **wajib berhenti seketika dan dijadikan spek eksplisit `S`** yang dievaluasi pada Gerbang G5.

---

## Panduan Lapangan Praktis & Pengetahuan Operasional

Aturan teruji lapangan yang ditemukan dari eksekusi nyata pada berbagai platform agen:

### 1. Builder Mutlak Koordinator (`builder: coordinator`)
Pada `wdi-daily-autopilot`, konfigurasi `roles.builder` di `.control/custom-dispatch.yaml` wajib disetel ke `coordinator`. Mendelegasikan koding ke subagent memicu halusinasi status (subagent melapor seluruh tes lulus tanpa mengubah satu berkas pun). Koordinator sesi aktif menulis kode langsung melalui siklus TDD merah ke hijau.

### 2. Peninjau Sejawat Bersifat Penasihat Read-Only
Peninjau independen (seperti Terra / GPT-5.6-Terra via `kiro-cli`) wajib dijalankan dalam mode baca saja (`--trust-tools=fs_read` / `--mode plan`). Peninjau memeriksa kasus batas dan diff kode, tetapi dilarang mengubah berkas atau memicu proses build panjang. Disiplin penulis tunggal tetap terjaga.

### 3. Pencegahan File-Locking Windows (Process Gating)
Di sistem operasi Windows, proses latar belakang (aplikasi yang sedang berjalan, Gradle Test Daemon, Java VM) menahan handle terbuka pada berkas biner, memicu kegagalan `Access is denied (Exit code 5/32)` saat kompilasi atau penghapusan worktree. `wdi-daily-what-to-test` memeriksa dan mematikan proses aktif sebelum proses build atau peluncuran dimulai.

### 4. Invarian Isolasi Worktree
Penyusunan spek dan tiket dilakukan di cabang `main`, namun tahap penulisan kode dan loop otonom (`wdi-autopilot`) **wajib berjalan di git worktree terpisah** (`autopilot/<mandate-id>`). Jangan pernah menjalankan loop tanpa pengawasan di working tree utama yang kotor.

### 5. Satu Pemicu Cloud CI Per PR
Loop otonom membuat commit lokal per tiket. Menjalankan Cloud CI di setiap iterasi lokal akan menghabiskan kuota runner bulanan dengan cepat. Rangkaian tes lokal menyediakan bukti authoritative selama loop; Cloud CI dipicu **satu kali**, saat Pull Request ditandai siap ditinjau (*ready for review*).

### 6. Kebersihan Artefak Smoke Sementara
Kursor uji smoke (`.work/smoke/last-sync`) dan manifes runtime bersifat lokal per mesin. Pastikan `.work/smoke/` didaftarkan di `.gitignore` agar pemeriksaan kebersihan working tree preflight tidak pernah gagal secara tak terduga.

### 7. Konfigurasi Runner Lokal Mesin (`custom-dispatch.yaml`)
Perintah runner khusus mesin dan model flag disimpan di `.control/custom-dispatch.yaml` (otomatis di-ignore git). Hanya templat `.control/custom-dispatch.yaml.example` yang dilacak ke git.

---

## Direktori 22 Skill Resmi

WDI Method menyediakan 22 skill resmi yang terstruktur berdasarkan bidang kerja dan wewenang pemanggilan:

| Bidang Kerja | Pemanggilan Langsung Pengguna (Slash Command) | Orkestrasi Model / Agen Otomatis |
|---|---|---|
| **Pengiriman &amp; Arsitektur (G1–G5)** | `/wdi-init` (Setup G0 &amp; komponen)<br>`/wdi-problem` (G1 brief masalah)<br>`/wdi-product` (G2 PRD solusi)<br>`/wdi-ux` (G2/G3 alur UX &amp; kontrak)<br>`/wdi-blueprint` (G3 arsitektur sistem)<br>`/wdi-component` (G4 desain komponen SDD)<br>`/wdi-build` (G5 pemotongan tiket spek) | Dijalankan berurutan oleh koordinator pada transisi gerbang |
| **Operasi Harian Otonom** | `/wdi-daily-what-to-build` (triage catatan uji ke spek)<br>`/wdi-daily-autopilot` (peluncur loop mandat otonom)<br>`/wdi-daily-what-to-test` (verifikasi fisik pasca-merge)<br>`/wdi-prune-or-archive` (arsip/pembersihan spek tertutup) | `/wdi-autopilot` (mesin loop mandat via `/loop`) |
| **Tata Kelola &amp; Diagnostik** | `/wdi-help` (panduan gerbang kontekstual)<br>`/wdi-explain-to-me` (penjelas arsitektur sistem)<br>`/wdi-decision` (pencatatan keputusan teknis ADR)<br>`/wdi-question` (pelacak pertanyaan terbuka)<br>`/wdi-log` (pencatatan aktivitas audit)<br>`/wdi-report` (laporan progres &amp; estimasi)<br>`/wdi-reconcile` (audit deviasi kode-dokumen)<br>`/wdi-review` (peninjauan independen)<br>`/wdi-systematic-debugging` (investigasi akar masalah)<br>`/wdi-upgrade` (migrasi skema korpus) | Dispatch peninjau independen dan second opinion |

---

## Struktur Repositori & Invarian

```text
.constitution/
  method/            Mesin method — ditimpa setiap pembaruan; jangan pernah diedit langsung
  project/           Aturan produk dan reader inventori khusus — dipertahankan saat pembaruan
.control/
  registry/          Sumber Kebenaran Tunggal: goals.yaml · specs.yaml · components.yaml
  decisions/         Keputusan yang diterima dan mandat pemilik (DEC-*.md)
  memlog/            Ledger audit yang mencatat keputusan loop otonom
  test-targets/      Templat pengujian fisik (desktop.md, web.md, mobile.md)
.scratch/            Ruang kerja spesifikasi aktif (SPEC-*.md dan tiket)
.archive/            Spesifikasi historis yang diarsipkan dengan preservasi link RTM
.what/ & .how/       Dokumen kerja korpus (PRD, SRS, Blueprint, SDD)
.what-rendered/      Hasil render dokumen manusia (dibangkitkan oleh validate.py / wdi-report)
```

---

## Panduan Kontribusi & Fondasi Arsitektur

Setiap kontribusi ke WDI Method harus menjawab satu pertanyaan kunci: **apakah perubahan ini membuat lapisan tinjauan lebih dapat dipercaya, atau hanya membuatnya lebih tebal?**

### Fixture Corpus & Verifikasi Lokal
Seluruh perubahan validator dan framework wajib dibuktikan terhadap fixture corpus internal (`tests/fixture/`). Jalankan seluruh rangkaian tes sebelum mengajukan pull request:
```bash
npm test
```
Suite pengujian menegakkan baseline 100% hijau pada script Python PEP 723 (`validate.py`, `timeline.py`, `lifecycle.py`), sinkronisasi platform, dan integritas kit.

### Aturan Paket Publik Generik
WDI Method dipublikasikan ke registri npm publik. Repositori ini tidak boleh memuat nama klien privat, identitas produk komersial, kredensial jaringan internal, atau path absolut sistem berkas mesin lokal.

---

## Lisensi & Merek Dagang

- **Lisensi Kode:** Didistribusikan di bawah [MIT License](LICENSE).
- **Privasi & Telemetri:** 100% offline-first. Bebas telemetri, bebas analitik, bebas soket jaringan luar (lihat [PRIVACY.md](PRIVACY.md) dan [SECURITY.md](SECURITY.md)).
- **Merek Dagang:** Nama "Wira Delta Indonesia", "WDI Method", dan simbol monogram studio adalah merek dagang sah milik PT Wira Delta Indonesia dan terpisah dari lisensi terbuka kode.
