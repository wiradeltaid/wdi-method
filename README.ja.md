# WDI Method

[English](README.md) | [Bahasa Indonesia](README.id.md) | [日本語](README.ja.md) | [简体中文](README.zh.md)  
[Changelog](CHANGELOG.md) | [Contributing](CONTRIBUTING.md) | [License](LICENSE) | [Security](SECURITY.md) | [Privacy](PRIVACY.md)

**BMadが薄く残したレビュー層 — コードを書く前に技術的な決定を人間が検証するための仕様書フレームワーク。変更規模に応じて適切な粒度を提供します。**

[BMad](https://github.com/bmad-code-org/BMAD-METHOD) は「*何を*構築するか」と「*どのように*ソリューションを構成するか」を決定します。WDI Methodはそれを置き換えるのではなく包摂し、高レベルのアーキテクチャ上の決定と実際の動作コードとの間に検証可能なガバナンス層を提供します。これには、要件レジストリ、ユースケースカタログ、コンポーネント境界、自動ドリフト検証ツール、そして自律的なデイリーループが含まれます。

> 本リポジトリは**パブリックかつ汎用**です。クライアント名、商用製品名、プライベートリポジトリへのリンクを含めてはなりません。製品のアイデンティティは、本パッケージをインストールするリポジトリ側で完全に定義されます。

---

## 概要: AI駆動開発 (AiDD) と Vibe Coding の違い

仕様なきプロンプティング（いわゆる「Vibe Coding」）は、数ヶ月に及ぶ本番システム開発において必ず破綻します。AIコーディングエージェントがコンテキストを見失い、完了状態を幻覚（ハルシネーション）し、要件の境界線を曖昧にしてしまうためです。WDI Methodは、以下の3層アーキテクチャを通じて規律ある**AI駆動開発（Ai-Driven Development - AiDD）**を確立します。

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. 意図と戦略: BMad Method                                              │
│    ユーザーの課題発見、プロダクトブリーフ草案、初期アーキテクチャ策定   │
├─────────────────────────────────────────────────────────────────────────┤
│ 2. 検証可能なレビュー層: WDI Method (SSOT)                              │
│    5つの人間レビューゲート、Goal → FR → UC → Ticket → Test の追跡性、   │
│    自動ドリフト検証、デイリーループの安全な自律運用                     │
├─────────────────────────────────────────────────────────────────────────┤
│ 3. チケット分割と実装: Skills Engines (mattpocock/skills)               │
│    to-spec & to-tickets で垂直スライス分割; implement で TDD 実装        │
└─────────────────────────────────────────────────────────────────────────┘
```

### 黄金の不変原則: ドキュメントは常にコードに従う
ドキュメントは、すでに行われた作業の記録です。決定記録や要件行がコードと矛盾する場合、**コードが常に優先され、ドキュメント側が修正されます**。古いドキュメントに合わせてコードを退行させてはなりません。コードより遅れているドキュメントは自然な状態であり、致命的な誤情報を含まない限り、リリースを妨げるべきではありません。

---

## 10分クイックスタート

3つのステップでプロダクトリポジトリにインストールできます。すべての対話プロンプトには適切なデフォルト値が設定されており、<kbd>Enter</kbd> を押すだけで承認できます。

### ステップ 1: BMad Method のインストール
プロダクトリポジトリにディスカバリーエンジンをインストールします:
```bash
cd /path/to/your/product-repo
npx bmad-method install
```

### ステップ 2: 6つのチケットエンジンの追加
実行エンジンをリポジトリに直接インストールします（copy または symlink を選択）:
```bash
npx skills@latest add mattpocock/skills
```
*メソッドが駆動する6つのエンジンすべてを選択します:* `to-spec`, `to-tickets`, `implement`, `tdd`, `code-review`, `domain-modeling`。

> **Claude Codeプラグインが不十分な理由:** アップストリームのエンジンには `disable-model-invocation: true` が設定されています。WDI Methodはローカルコピーからこのフラグを自動的に解除し、自律ループが無人実行できるようにします。ユーザーレベルのプラグインはリポジトリ側から編集できません。

### ステップ 3: WDI Method のインストール
対話型インストーラーを起動し、使用しているエージェント環境（Claude Code, Cursor, OpenCode, Windsurf など）にスキルをセットアップします:
```bash
npx wdi-method
```
*(CI自動化環境の場合: `npx wdi-method install --yes --agents claude --product "Your Product"`)*

### 最初のコマンド: `/wdi-help`
AIコーディングエージェント（Claude Code、Cursor）内で以下を実行します:
```text
/wdi-help
```
`wdi-help` は `.control/registry/` を検査し、会話コンテキストから推測することなく、プロジェクトが現在どのゲートにあるかを正確に回答します。

---

## 3つのワークフローオプション

タスクの規模とリスクに応じて、適用するセレモニーの重さを柔軟に調整できます。

### オプション A: ガイド付きデリバリートラック (新規イニシアチブ & G1–G5)
新製品、主要機能の追加、アーキテクチャの変更向け。人間がゲートごとに**レンダリングされた1ページ**を読み、進めるか修正するかを判断します。

| ゲート | 回答される問い | 実行スキル | 人間が読むレンダリングページ | オーナーの判断 |
|---|---|---|---|---|
| **G1 — Problem** | この問題は実在し、誰のもので、取り組む価値があるか？ | `/wdi-problem` | `.what-rendered/_product-brief/brief.md` | 課題定義の承認または修正 |
| **G2 — Product** | 何を構築し、どのようなユーザー体験になるか？ | `/wdi-product`<br>`/wdi-ux` | `.what-rendered/_prd/<slug>/prd.md` | 機能要件（FR）とUI契約の承認 |
| **G3 — Blueprint** | システムアーキテクチャ全体が統合されているか？ *(製品ごとに1回)* | `/wdi-blueprint` | `.how-rendered/blueprint.md` | アーキテクチャ背骨の承認 |
| **G4 — Component** | コンポーネントはどのように構築されるか？ *(mode: catalog では省略)* | `/wdi-component` | `.how-rendered/<pc>/SDD-<pc>.md` | ソフトウェア設計（SDD）の承認 |
| **G5 — Build** | チケットスライスは構築され、検証され、証明されたか？ *(仕様ごと)* | `/wdi-build` | テストランナー出力（Red &rarr; Green） | マージの承認または差し戻し |

#### 決して統合してはならない2つのノブ: Mode と Risk
- **`mode`** はどのゲートが存在するかを決定します（`catalog` は G4 を省略し、`guarded` や `deep` は完全な SDD を要求）。
- **`risk_accepted`** はゲートが要求する検証の深さを決定します（`low`, `medium`, `high`）。これらを単一の「厳格さ」ダイヤルにまとめると、低リスクなコンポーネントが官僚主義に埋もれるか、高リスクな変更が無検証で通過してしまいます。

---

### オプション B: 自律デイリー運用 (Fase 4 Daily Tier)
アーキテクチャが整った後の日常的な開発フロー向け。WDI Methodは4つの専用ツールを提供します:

1. **`/wdi-daily-what-to-build [reviewer] <notes>`**:  
   手動テストのメモ、QAフィードバック、バグ報告を構造化された仕様書に変換します。コーパスに対して要件を分類し、開発ブランチ上にドラフトチケットを作成し、読み取り専用のセカンドオピニオンをディスパッチします。
2. **`/wdi-daily-autopilot [self-review] [peer] [interval]`**:  
   承認されたマンデート（権限委譲規定）のもとで自律エンジニアリングルーチンを実行します。無人ループ（デフォルト: `/loop 10m /wdi-autopilot`）でTDDを実行し、判断ごとに台帳（ledger）を更新します。
3. **`/wdi-daily-what-to-test [web|mobile|desktop]`**:  
   マージ後の物理テストコーディネーター。開発ブランチのファストフォワード同期、マージ済みブランチやワークツリーの削除、デスクトッププロセスのロック解除、コミット差分（`before_sync..HEAD`）に基づいた検証チェックリストの生成を行います。
4. **`/wdi-prune-or-archive [spec-id] [--archive|--prune]`**:  
   クローズされた仕様書を `.scratch/` から `.archive/specs/` に安全に退避、または `git rm` でクリーンアップし、100%のRTM追跡可能性を維持します。

---

### オプション C: ファストパス (`/implement` 直行)
`FR`、`UC`、`AD-N`、ドメインモデルに一切触れない小さなバグ修正やスタイルの微調整は、すべてのドキュメントゲートをスキップして直接 `/implement` を実行できます。変更が機能要件（FR）に波及した場合は、**直ちに停止して明示的な仕様 `S` に昇格**させ、G5で検証します。

---

## 実践的な運用ノウハウと現場のルール

複数のマルチプラットフォームエージェント運用から得られた実戦知見:

### 1. ビルダーはコーディネーターに固定 (`builder: coordinator`)
`wdi-daily-autopilot` において、`.control/custom-dispatch.yaml` の `roles.builder` は厳格に `coordinator` に固定されます。サブエージェントに実装を委譲すると、ファイルを1行も変更していないのに「全テスト合格」と虚偽報告するハルシネーションが発生します。コーディネーター自身が直接TDDサイクルを回します。

### 2. 独立レビューアはアドバイザリー（読み取り専用）
外部ピアレビューア（Terra / GPT-5.6-Terra など）は必ず読み取り専用モード（`--trust-tools=fs_read` / `--mode plan`）でディスパッチします。レビューアは差分を精査しコーナーケースを指摘しますが、コードの改変やビルドの実行は行いません。単一執筆者原則を守ります。

### 3. Windowsファイルロックの防止 (Process Gating)
Windows環境では、バックグラウンドに残存するプロセス（実行中のバイナリ、Gradle Test Daemon、Java VM）がファイルハンドルを保持し、コンパイル時やワークツリー削除時に `Access is denied (Exit code 5/32)` エラーを引き起こします。`wdi-daily-what-to-test` はビルド前に残存プロセスを検査・終了します。

### 4. ワークツリー分離の不変原則
仕様書の作成は `main` で行いますが、自律コーディングループ（`wdi-autopilot`）は**必ず独立した Git ワークツリー（`autopilot/<mandate-id>`）内で実行**しなければなりません。ダーティな共有環境で無人ループを回してはなりません。

### 5. クラウドCIトリガーの節約
自律ループはチケットごとにローカルコミットを作成します。毎回のコミットでクラウドCIを走らせると、実行時間枠を浪費します。ループ中の検証は高速なローカルテストで担保し、クラウドCIはPRがレビュー可能になった段階で**1回だけ**起動させます。

### 6. 一時的なスモークテスト成果物の無視
スモークテストの同期カーソル（`.work/smoke/last-sync`）などはマシン固有のファイルです。`.work/smoke/` を必ず `.gitignore` に登録し、クリーンな作業ツリーを要求する事前チェックが停止しないようにします。

### 7. ローカルマシン固有のランナー設定 (`custom-dispatch.yaml`)
マシン固有のランナーコマンドやモデルフラグは `.control/custom-dispatch.yaml` に記述します（自動的にgit除外されます）。テンプレートである `.control/custom-dispatch.yaml.example` のみがGitで追跡されます。

---

## 公式22スキル一覧 (機能ドメインと起動権限)

| ドメイン | ユーザー呼び出し (スラッシュコマンド) | モデル呼び出し / 自動オーケストレーション |
|---|---|---|
| **設計・デリバリー (G1–G5)** | `/wdi-init` (G0 セットアップ & コンポーネント)<br>`/wdi-problem` (G1 課題定義 & ブリーフ)<br>`/wdi-product` (G2 PRD 要件定義)<br>`/wdi-ux` (G2/G3 UIフロー & 契約)<br>`/wdi-blueprint` (G3 アーキテクチャ背骨)<br>`/wdi-component` (G4 コンポーネント SDD)<br>`/wdi-build` (G5 仕様策定 & チケット分割) | ゲート遷移時にコーディネーターが順次実行 |
| **自律デイリー運用** | `/wdi-daily-what-to-build` (メモの仕様化・トリアージ)<br>`/wdi-daily-autopilot` (自律ルーチン起動)<br>`/wdi-daily-what-to-test` (マージ後の物理テスト検証)<br>`/wdi-prune-or-archive` (クローズ済み仕様のアーカイブ・削除) | `/wdi-autopilot` (`/loop` で駆動される無人ループエンジン) |
| **ガバナンス & 診断** | `/wdi-help` (コンテキストに応じた現在ゲート案内)<br>`/wdi-explain-to-me` (アーキテクチャ解説)<br>`/wdi-decision` (ADR 意思決定記録)<br>`/wdi-question` (未解決事項トラッカー)<br>`/wdi-log` (活動記録ログ)<br>`/wdi-report` (見積もり & 進捗レポート)<br>`/wdi-reconcile` (コードと文書のドリフト監査)<br>`/wdi-review` (独立ピアレビュー)<br>`/wdi-systematic-debugging` (根本原因調査)<br>`/wdi-upgrade` (コーパススキーマ移行) | アドバイザリーピアレビューおよびセカンドオピニオン |

---

## リポジトリ構成と原則

```text
.constitution/
  method/            メソッドエンジン — 更新時に上書きされます。直接編集禁止
  project/           製品固有のルールやカスタムインベントリリーダー — 更新時も保持
.control/
  registry/          信頼できる唯一の情報源 (SSOT): goals.yaml · specs.yaml · components.yaml
  decisions/         承認された意思決定およびオーナーマンデート (DEC-*.md)
  memlog/            自律ループの決定を記録する監査台帳 (ledger)
  test-targets/      物理テスト用テンプレート (desktop.md, web.md, mobile.md)
.scratch/            進行中の仕様書ワークスペース (SPEC-*.md とチケット)
.archive/            RTMリンクを保持した過去の仕様書アーカイブ
.what/ & .how/       作業コーパス文書 (PRD, SRS, Blueprint, SDD)
.what-rendered/      人間が閲覧するレンダリング済み文書 (validate.py / wdi-report で生成)
```

---

## コントリビューション & 設計思想

WDI Methodへの貢献は、常に一つの問いに答えなければなりません: **「この変更はレビュー層の信頼性を高めるか、単に書類を分厚くするだけか？」**

### フィクスチャコーパスとローカル検証
すべてのバリデータおよびフレームワークの変更は、内部のフィクスチャコーパス（`tests/fixture/`）で検証されます。プルリクエストを送信する前にテストスイートを実行してください:
```bash
npm test
```
テストスイートは、Python PEP 723スクリプト（`validate.py`, `timeline.py`, `lifecycle.py`）、プラットフォーム同期、およびキットの整合性において100%グリーンベースラインを強制します。

### パブリック汎用パッケージの規則
WDI Methodはnpmパブリックレジストリに公開されます。プライベートな顧客名、商用製品名、内部ネットワーク認証情報、ローカルマシンの絶対パスを含めることは固く禁止されています。

---

## ライセンス & 商標について

- **コードライセンス:** [MIT License](LICENSE) のもとで配布されます。
- **プライバシーとテレメトリ:** 100% オフラインファースト。テレメトリ、アナリティクス、外部ネットワーク接続は一切ありません（[PRIVACY.md](PRIVACY.md) および [SECURITY.md](SECURITY.md) を参照）。
- **商標について:** 「Wira Delta Indonesia」、「WDI Method」、およびスタジオのブランドモノグラムは PT Wira Delta Indonesia の商標であり、オープンソースコードライセンスとは区別されて保持されます。
