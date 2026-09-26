# WDI Method

> Lapisan review di atas BMad: dokumen yang dibaca manusia untuk memeriksa keputusan teknis sebelum kode ditulis, disesuaikan dengan apa yang benar-benar dibutuhkan perubahan itu.

[English](README.md) | [Bahasa Indonesia](README.id.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Español](README.es.md) | [Deutsch](README.de.md) | [Français](README.fr.md) | [Português (Brasil)](README.pt-BR.md) | [Русский](README.ru.md)  
[Website](https://wiradelta.com/wdi-method/docs/) | [Changelog](CHANGELOG.md) | [Contributing](CONTRIBUTING.md) | [License](LICENSE) | [Security](SECURITY.md) | [Privacy](PRIVACY.md)

---

> **Pemberitahuan terjemahan:** Berkas ini merupakan terjemahan dari [README.md](README.md) untuk kenyamanan pembaca. Jika terdapat perbedaan makna atau penafsiran, berkas resmi berbahasa Inggris (`README.md`) yang menjadi acuan otoritatif. Seluruh dokumen teknis mendalam dan dokumen hukum dikelola dalam Bahasa Inggris.

[BMad](https://github.com/bmad-code-org/BMAD-METHOD) menulis dokumen untuk AI agent. WDI Method menambahkan dokumen yang sudah biasa dibaca banyak peran: use case, diagram C4, daftar API dan database, dan dokumen desain. WDI Method membungkus BMad tanpa menggantikannya: skill untuk brief, PRD, UX, dan arsitektur (`wdi-problem`, `wdi-product`, `wdi-ux`, dan `wdi-blueprint` untuk architecture spine) menyerahkan penulisan ke skill BMad, lalu memeriksa hasilnya terhadap panduan metode.

> Repositori ini bersifat **publik dan generik**. Repositori ini **TIDAK BOLEH** memuat nama klien, nama produk komersial, atau tautan ke repositori privat. Identitas produk sepenuhnya berada di repositori yang memasangnya.

---

## AI-Driven Development (AiDD) vs. Vibe Coding

Vibe coding juga memakai spesifikasi, tetapi tidak konsisten: setiap sesi prompt bisa berbeda, dokumennya tidak terstruktur, dan prosesnya tidak dijaga tetap sistematis. Akibatnya efisiensi dan efektivitas jauh lebih rendah, dan ada risiko nyata menumpuk technical debt. Itulah alasan sebuah framework dibutuhkan.

Di WDI Method, AI-Driven Development (AiDD) berjalan dalam satu urutan: janji dicatat sebagai FR dan use case, lalu gerbang, lalu spec dipotong menjadi tiket dengan `to-spec` dan `to-tickets`, lalu setiap tiket dibangun dengan test lebih dulu, lalu satu PR yang di-review dan di-merge pemilik.

Tiga lapisan menjalankan pekerjaannya:

| Lapisan | Siapa | Yang Dikerjakan |
|---|---|---|
| 1. Dokumen untuk agent | [BMad](https://github.com/bmad-code-org/BMAD-METHOD) | Menulis product brief, PRD, UX, dan architecture spine, masing-masing lewat skill BMad |
| 2. Lapisan review | WDI Method | Membungkus skill tersebut, menambahkan dokumen yang dibaca peran lain, menjalankan lima gerbang manusia, menghubungkan Goal → FR → UC → Ticket → Test, dan memeriksa drift pada korpus |
| 3. Tiket dan kode | Engine ([mattpocock/skills](https://github.com/mattpocock/skills)) | `to-spec` dan `to-tickets` memotong spec menjadi tiket vertikal; `implement` membangun setiap tiket dengan test lebih dulu |

### Dokumen Mengikuti Kode

Dokumen yang tertinggal dari kode adalah keadaan wajar, bukan cacat. Bila pemilik memilih kode daripada dokumen, dokumennya yang diperbaiki. Dokumen yang mendahului kode, misalnya spec yang belum dibangun, juga wajar.

---

## Pasang dalam 3 Langkah

### Prasyarat

- Node.js 20 atau lebih baru.
- Git.
- [uv](https://docs.astral.sh/uv/), untuk menjalankan validator Python 3.11+ milik metode ini.
- Platform agent: Claude Code, Cursor, Codex, dan platform agent lainnya.

Jalankan ketiga langkah secara berurutan. Installer berhenti bila langkah 1 atau langkah 2 belum dikerjakan. Semua prompt menyediakan jawaban default; tekan <kbd>Enter</kbd> untuk menerimanya.

### Langkah 1: Pasang BMad Method
```bash
cd /path/to/your/product-repo
npx bmad-method install
```

### Langkah 2: Tambahkan Enam Engine
Pasang engine ke repositori Anda (pilih "copy" atau "symlink"):
```bash
npx skills@latest add mattpocock/skills
```
*Pilih keenam engine yang dijalankan metode ini:* `to-spec`, `to-tickets`, `implement`, `tdd`, `code-review`, dan `domain-modeling`.

> **Mengapa Plugin Claude Code Tidak Cukup:** Tiga dari enam engine (`to-spec`, `to-tickets`, `implement`) dirilis dengan `disable-model-invocation: true`. Setiap install dan update, WDI Method menghapus baris itu dari salinan di repo Anda, supaya `wdi-build` dan `wdi-autopilot` bisa menjalankannya. Plugin tingkat pengguna tidak bisa diubah, jadi installer berhenti sampai engine ada di repo. `--skip-engines-check` melewati pemeriksaan ini.

### Langkah 3: Pasang WDI Method
Membuka installer interaktif dan menaruh skill di tempat yang dibaca setiap platform agent Anda:
```bash
npx wdi-method
```
*(Non-interaktif: `npx wdi-method install --yes --agents claude-code --product "Your Product"`)*

> **Yang diubah installer di BMad:** Installer juga mematikan pemanggilan oleh model untuk 13 skill build dan sprint BMad yang digantikan engine, dan menambahkan aturan deny yang sama ke `.claude/settings.json`. Anda tetap bisa menjalankannya dengan mengetik perintahnya.

### Perintah Pertama Anda: `/wdi-help`
Di dalam coding agent Anda, jalankan:
```text
/wdi-help
```
`wdi-help` membaca `.control/registry/` dan memberi tahu gerbang tempat proyek Anda berada, spec yang terbuka, dan skill berikutnya, tanpa menebak dari percakapan.

---

## Tiga Pilihan Alur Kerja

WDI Method menyesuaikan seremoninya dengan skala dan risiko pekerjaan.

### Opsi A: Jalur Delivery Terpandu (G1 sampai G5)
Untuk produk baru, inisiatif besar, dan perubahan arsitektur. Anda memulai setiap skill gerbang; agent menyebut skill berikutnya dan menunggu.

**Satu Keputusan per Gerbang.** Setiap gerbang memutuskan satu hal. Di G1 sampai G4 Anda membaca satu halaman terender; di G5 Anda membaca baris RTM spec. Anda menjawab daftar periksa singkat, dan satu jawaban "tidak" pada pertanyaan bertanda bintang menahan gerbang.

| Gerbang | Yang Diputuskan | Skill | Yang Anda Baca | Keputusan Pemilik |
|---|---|---|---|---|
| **G1 Problem** | Apa masalahnya, milik siapa, dan mengapa layak dikerjakan | `/wdi-problem` | `.what-rendered/_product-brief/brief.md` | Setujui rumusan masalah |
| **G2 Product** | Apa yang dibangun, dan bagaimana rasanya dipakai | `/wdi-product`<br>`/wdi-ux` (opsional) | `.what-rendered/_prd/<slug>/prd.md` | Setujui janji fungsional (FR) |
| **G3 Blueprint** | Gambaran utuh produk, sekali per produk | `/wdi-blueprint` | `.how-rendered/blueprint.md` | Setujui architecture spine |
| **G4 Component** | Bagaimana satu komponen dibangun (dilewati pada `mode: catalog`) | `/wdi-component` | `.how-rendered/<pc>/SDD-<pc>.md` | Setujui desain perangkat lunak |
| **G5 Release** | Apakah sudah selesai dan terbukti | `/wdi-build` | Baris RTM spec di `.control/generated/` dan bukti test setiap tiket | Terima spec sebagai selesai, atau kembalikan |

**Perbaiki, Jangan Lanjutkan.** Satu jawaban "tidak" pada pertanyaan daftar periksa bertanda bintang (★) menahan gerbang. Perbaiki dokumennya lalu jalankan gerbang lagi; jangan menyetujuinya dengan rencana memperbaikinya nanti.

#### Dua Parameter yang Tidak Boleh Digabung
- **`mode`** menentukan kedalaman dokumen setiap komponen. `catalog` (default): tidak ada dokumen di luar blueprint, dan G4 dilewati. `outline`: alur lengkap untuk paling banyak 3 use case, aturan bisnis lokal, dan ringkasan keputusan. `guarded`: menambah bagian `Failure Behaviour` untuk setiap batas dan dokumen integrasi pihak ketiga. `deep`: menambah analisis robustness, kontrak per endpoint, kamus data, diagram alur, dan state machine.
- **`risk_accepted`** menentukan seberapa keras review. `high` (Anda menerima banyak risiko): lensa dasar structure dan prose. `medium`: menambah lensa edge case. `low`: menambah lensa edge case, dan kode butuh dua reviewer yang bukan builder.

Bila satu field mengatur keduanya, satu-satunya cara mendapat dokumen tipis adalah menulis risiko yang lebih besar daripada yang sebenarnya Anda terima.

---

### Opsi B: Operasi Harian Otonom (Daily Tier)
Setelah arsitektur siap, pekerjaan sehari-hari berjalan sebagai ritme harian lewat empat skill yang Anda ketik di dalam agent:

1. **`/wdi-daily-what-to-build [reviewer] <notes>`**  
   Mengubah catatan uji manual, temuan QA, atau laporan bug menjadi spec atau tiket yang sudah ditinjau di development branch, untuk run autopilot berikutnya. Skill ini berhenti di situ: tidak pernah melakukan commit, push, atau memulai autopilot.
2. **`/wdi-daily-autopilot [self-review] [peer] [interval] [--skip-peer-review]`**  
   Memeriksa mandat yang sudah diterima dan menjalankan preflight bila belum ada, menentukan reviewer dari konfigurasi lokal, lalu memulai loop (default `/loop 10m /wdi-autopilot`). Loop bekerja di branch `autopilot/<mandate-id>`, menulis kode dengan test lebih dulu, mencatat setiap keputusan di ledger-nya, dan berakhir dengan satu PR yang siap di-review. Pemilik yang melakukan merge.
3. **`/wdi-daily-what-to-test [web <target> | mobile <target> | desktop]`**  
   Sesudah merge: menyinkronkan development branch, memangkas branch dan worktree yang sudah di-merge, menyiapkan aplikasi untuk uji manual, dan menyusun checklist dari tiket yang ditutup sejak sinkronisasi terakhir (`before_sync..HEAD`). Tanpa argumen, skill ini hanya menyinkronkan, memangkas, dan menyusun checklist.
4. **`/wdi-prune-or-archive [--spec <id> | --all-closed] [--archive | --prune] [--dry-run]`**  
   Memindahkan spec yang sudah ditutup dari `.scratch/` ke `.archive/specs/`, atau menghapusnya dengan `git rm`, lewat `lifecycle.py` yang memeriksa dulu dan membatalkan perubahan bila gagal. Baris spec tetap di `specs.yaml`. Tanpa argumen, skill ini bertanya.

---

### Opsi C: Jalur Cepat (`/implement` Langsung)
Sebuah perbaikan boleh melewati semua gerbang bila tidak mengubah FR, UC, AD-N, atau domain model, paling banyak satu tiket, dan tidak menyentuh uang, data pribadi, atau integrasi pihak ketiga. Anda menjalankan `/implement` langsung, tanpa skill pembungkus. Bila ternyata menyentuh FR, pekerjaan berhenti dan menjadi spec ukuran S (paling banyak 3 tiket) yang dijalankan lewat `wdi-build`.

---

## Aturan Lapangan

Aturan operasional dari menjalankan loop coding otonom di repositori produk nyata:

### 1. Builder Tetap di Koordinator (`builder: coordinator`)
Di `wdi-daily-autopilot`, `roles.builder` di `.control/custom-dispatch.yaml` ditetapkan ke `coordinator`. Menyerahkan penulisan kode ke subagent menghasilkan laporan selesai yang palsu (subagent mengaku test lulus tanpa mengubah satu file pun). Sesi koordinator menulis kodenya sendiri, dengan test lebih dulu.

### 2. Reviewer Hanya Membaca
Peer reviewer berjalan dalam mode hanya membaca. Mereka menguji edge case dan membaca diff, tetapi tidak pernah mengubah kode atau menjalankan build; hanya sesi koordinator yang menulis. Pada `risk_accepted: low`, permintaan melewati peer review ditolak, karena kode di sana butuh dua reviewer yang bukan builder.

### 3. File Lock di Windows (Desktop Process Gate)
Di Windows, binary aplikasi yang sedang berjalan atau daemon build di latar belakang menahan handle file tetap terbuka, sehingga build ulang atau penghapusan worktree gagal dengan `Access is denied`. Dengan target `desktop`, `wdi-daily-what-to-test` memeriksa apakah binary aplikasi masih berjalan sebelum build ulang. Aplikasi hanya ditutup bila dijalankan oleh smoke run sebelumnya; selain itu skill melaporkan PID dan berhenti, supaya Anda menutupnya sendiri. Proses tidak pernah dihentikan paksa.

### 4. Loop Berjalan di Branch Sendiri
Penulisan spec dan tiket dilakukan di development branch. Loop berjalan di branch-nya sendiri, `autopilot/<mandate-id>`, di worktree terisolasi atau checkout bersih yang hanya dipakai run itu. Loop tidak pernah berjalan di checkout bersama atau yang kotor.

### 5. Satu Cloud CI Run per Run Autopilot
Loop melakukan commit per tiket, dan rangkaian test lokal menjadi bukti selama run. Cloud CI berjalan sekali per run autopilot, di akhir: saat satu-satunya PR ditandai siap di-review, atau saat workflow dijalankan sekali secara manual. Push selama run tidak memicu cloud run.

### 6. File Smoke Khusus Mesin Lokal
Kursor smoke (`.work/smoke/last-sync`) dan manifes runtime milik satu mesin. Installer menambahkan `.work/smoke/` ke `.gitignore`, jadi file smoke khusus mesin lokal tidak pernah membuat working tree kotor.

---

## Konfigurasi (`custom-dispatch.yaml`)

Perintah runner dan flag model khusus mesin disimpan di `.control/custom-dispatch.yaml`. Installer membuatnya dari `.control/custom-dispatch.yaml.example` bila belum ada, lalu menambahkannya ke `.gitignore`; hanya contohnya yang di-commit.

Runner yang ditunjuk sebagai reviewer WAJIB hanya membaca. Flag hanya membaca per CLI: `claude --permission-mode plan`, `kiro-cli --trust-tools=fs_read`, `cursor-agent --mode plan`. Semua contoh runner di templat memakainya.

---

## Direktori Skill (22)

WDI Method memasang 22 skill: 7 skill gerbang, 5 untuk daily tier (termasuk `wdi-autopilot`), dan 10 yang bisa Anda jalankan kapan saja.

Cara sebuah skill dimulai:
- **Anda mengetiknya**: empat skill daily tier dan `wdi-explain-to-me` (membawa `disable-model-invocation: true`).
- **Anda mengetiknya, atau `wdi-autopilot` menjalankannya di bawah mandat yang diterima**: `wdi-build`. Skill ini tidak membawa flag `disable-model-invocation`, karena `wdi-autopilot` harus bisa memanggilnya; aturan bahwa agent tidak memulainya sendiri ada di Method policy yang ditulis installer ke `CLAUDE.md` dan `AGENTS.md`.
- **Anda mengetiknya, atau agent menyebutnya dan menunggu izin Anda**: skill lainnya.
- **Agent boleh menjalankannya sendiri (hanya membaca)**: `wdi-help`.
- **Dijalankan `/loop` di bawah mandat yang diterima**: `wdi-autopilot`. Di bawah mandat, `wdi-autopilot` juga menjalankan skill lain.

| Skill | Yang Dikerjakan | Cara Mulai |
|---|---|---|
| **Skill gerbang** | | |
| `/wdi-init` | Sebelum G1 dan di akhir G2: menyiapkan registri, komponen, `mode` dan `risk_accepted`, dua peta struktur, pemeriksaan engine, dan pembaca inventaris. | Anda mengetiknya, atau agent menyebutnya |
| `/wdi-problem` | G1. Menjalankan skill product brief BMad, lalu memeriksa brief terhadap panduan metode. Tidak pernah menulis brief sendiri. | Anda mengetiknya, atau agent menyebutnya |
| `/wdi-product` | G2. Menjalankan skill PRD BMad untuk PRD baru atau janji yang berubah, lalu memeriksanya terhadap panduan PRD. Tidak pernah menulis PRD sendiri. | Anda mengetiknya, atau agent menyebutnya |
| `/wdi-ux` | Opsional, bersama G2. Menjalankan skill UX BMad dan menaruh hasil desain di tempatnya. Tidak pernah menulis isi UX sendiri. | Anda mengetiknya, atau agent menyebutnya |
| `/wdi-blueprint` | G3, sekali per produk. Gambaran utuh produk: use case, aktor, domain model, aturan bisnis, glosarium, architecture spine, C4, serta inventaris API, tabel, dan layar. | Anda mengetiknya, atau agent menyebutnya |
| `/wdi-component` | G4. Kedalaman satu komponen, sedalam `mode`-nya dan tidak lebih. Dilewati pada `mode: catalog`. | Anda mengetiknya, atau agent menyebutnya |
| `/wdi-build` | G5. Satu spec dari dibuka sampai ditutup: Anda menjalankan `to-spec` dan `to-tickets`, setiap tiket sampai PR hijau, lalu spec ditutup. Tidak pernah melakukan merge. | Anda mengetiknya, atau `wdi-autopilot` menjalankannya |
| **Daily tier** | | |
| `/wdi-daily-what-to-build` | Mengubah catatan uji manual menjadi spec atau tiket yang sudah ditinjau untuk run autopilot berikutnya. Berhenti sebelum kode, commit, atau push. | Anda mengetiknya |
| `/wdi-daily-autopilot` | Memeriksa mandat yang sudah diterima (menjalankan preflight bila belum ada), menentukan reviewer dari konfigurasi lokal, lalu memulai loop, default setiap 10 menit. | Anda mengetiknya |
| `/wdi-autopilot` | Loop-nya sendiri: mengerjakan semua FR di bawah satu mandat yang diterima, di satu branch dengan satu PR, dan menulis setiap keputusan ke satu ledger. | Dijalankan `/loop` di bawah mandat yang diterima |
| `/wdi-daily-what-to-test` | Sesudah merge: menyinkronkan development branch, memangkas branch dan worktree yang sudah di-merge, menyiapkan aplikasi untuk uji manual, dan menyusun checklist dari tiket yang ditutup. | Anda mengetiknya |
| `/wdi-prune-or-archive` | Memindahkan spec yang sudah ditutup ke `.archive/specs/` atau menghapusnya dengan `git rm`, lewat `lifecycle.py` yang memeriksa dulu dan membatalkan perubahan bila gagal. Baris spec tetap di `specs.yaml`. | Anda mengetiknya |
| **Kapan saja** | | |
| `/wdi-help` | Membaca registri status dan memberi tahu gerbang saat ini, spec yang terbuka, dan skill berikutnya. | Agent boleh menjalankannya sendiri (hanya membaca) |
| `/wdi-explain-to-me` | Membaca dulu sebelum Anda memutuskan: menyelidiki, lalu memberi ringkasan dalam enam bagian tetap. Tidak menulis file. | Anda mengetiknya |
| `/wdi-decision` | Membuka, menerima, dan menerapkan keputusan bernomor (`DEC-`), lalu membawanya ke dokumen yang diaturnya. | Anda mengetiknya, atau agent menyebutnya |
| `/wdi-question` | Mencatat hal yang belum bisa diputuskan ke salah satu dari empat daftar di `.control/questions/`, dan menutupnya saat jawaban datang. | Anda mengetiknya, atau agent menyebutnya |
| `/wdi-log` | Mencatat rapat yang sudah selesai atau fakta non-teknis yang membatasi apa yang boleh dibangun. | Anda mengetiknya, atau agent menyebutnya |
| `/wdi-report` | Angka tentang proyek: progres, estimasi, baris tugas untuk tracker, atau brief atau PRD yang berdiri sendiri. Tidak pernah mengarang angka. | Anda mengetiknya, atau agent menyebutnya |
| `/wdi-reconcile` | Sebelum gerbang atau sesudah sekumpulan perubahan: melaporkan drift antara `.what`, `.how`, `.control`, dan aturan metode. Hanya membaca. | Anda mengetiknya, atau agent menyebutnya |
| `/wdi-review` | Meninjau dokumen korpus mana pun, dan wajib dijalankan sebelum gerbang untuk spine, SRS, SDD, dan SPEC. Lensanya mengikuti `risk_accepted`. Bukan untuk review kode. | Anda mengetiknya, atau agent menyebutnya |
| `/wdi-systematic-debugging` | Untuk bug, test yang gagal, atau build yang gagal, sebelum perbaikan diusulkan: cari akar masalah dan uji satu hipotesis setiap kali. | Anda mengetiknya, atau agent menyebutnya |
| `/wdi-upgrade` | Tepat sesudah `wdi-method update`: memindahkan dokumen dan file registri yang masih berbentuk lama ke bentuk baru, lalu memastikan validasi hijau. | Anda mengetiknya, atau agent menyebutnya |

---

## Struktur Repositori

```text
.constitution/
  method/                  The method itself: overwritten by every update; never edit here
  project/                 Product-owned rules and inventory readers: kept across updates
.control/
  registry/                The registries: index.yaml · goals.yaml · specs.yaml · components.yaml
  generated/               Status and RTM projections written by validate.py (never by hand)
  decisions/               Decisions and owner mandates (DEC-*.md)
  memlog/                  Ledgers recording autonomous loop decisions
  test-targets/            Hand-testing templates (desktop.md, web.md, mobile.md)
.scratch/<spec-id>-<slug>/ Active spec workspaces (SPEC.md and tickets)
.archive/                  Archived closed specs
.what/ & .how/             Working corpus documents (brief, PRD, SRS, blueprint, SDD)
.what-rendered/            Rendered pages for G1 and G2 (generated)
.how-rendered/             Rendered pages for G3 and G4 (generated)
.work/                     Scratch that empties when a task closes
```

---

## Kontribusi

Setiap kontribusi ke WDI Method menjawab satu pertanyaan: **apakah perubahan ini membuat lapisan review lebih dapat dipercaya, atau hanya membuatnya lebih tebal?** Lihat [CONTRIBUTING.md](CONTRIBUTING.md).

### Fixture Corpus dan Verifikasi Lokal
Perubahan validator dan metode dibuktikan terhadap fixture corpus (`tests/fixture/`). Jalankan rangkaian test sebelum membuka pull request:
```bash
npm test
```
Rangkaian test menjalankan empat script Python PEP 723 (`validate.py`, `timeline.py`, `inventory.py`, `lifecycle.py`) terhadap fixture, lalu memeriksa registri platform, file yang diterima setiap platform, dan integritas kit.

### Aturan Paket Publik Generik
WDI Method dipublikasikan ke registri npm publik. Paket ini tidak boleh memuat nama klien privat, identitas produk komersial, kredensial, atau path absolut sistem file.

---

## Lisensi dan Privasi

- **Lisensi kode:** [MIT License](LICENSE).
- **Privasi:** WDI Method sendiri tidak melakukan panggilan jaringan; coding agent Anda tetap berkomunikasi dengan penyedia modelnya. Lihat [PRIVACY.md](PRIVACY.md) dan [SECURITY.md](SECURITY.md).

## The name and the icon

Naskah berbahasa Inggris di bawah ini yang berlaku.

The MIT License grants broad rights over the code. It says nothing about names or logos,
and it does not oblige the studio to hand over either — so the licence above covers this
repository's code, not the name **WDI Method**, not **Wira Delta Indonesia**, and not any
associated visual marks or logos.

You may use those names to refer to this project: "based on WDI Method", "a fork of WDI Method",
or "compatible with WDI Method". You may not use them as the name of your own product or
methodology, or in a way that suggests you are this project or endorsed by it.

If you publish a modified distribution or fork, please give it your own name, so the
engineers using it know whom to ask when something behaves unexpectedly. The code is yours
to take; the name is not.

---

Kami memakai metode yang sama di proyek klien. [Hubungi Wira Delta Indonesia](https://wiradelta.com/id/studio/#contact).
