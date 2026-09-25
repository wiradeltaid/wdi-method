# WDI Method

> BMad の上に載るレビュー層です。コードを書く前に、技術的な決定を人が読んで確認するための文書を、その変更に実際に見合う規模で用意します。

[English](README.md) | [Bahasa Indonesia](README.id.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Español](README.es.md) | [Deutsch](README.de.md) | [Français](README.fr.md) | [Português (Brasil)](README.pt-BR.md) | [Русский](README.ru.md)  
[Website](https://wiradelta.id/wdi-method/docs/) | [Changelog](CHANGELOG.md) | [Contributing](CONTRIBUTING.md) | [License](LICENSE) | [Security](SECURITY.md) | [Privacy](PRIVACY.md)

---

> **翻訳に関する注意事項:** 本ファイルは [README.md](README.md) の便宜的な翻訳です。矛盾や解釈の相違がある場合は、公式の英語版（README.md）が優先されます。詳細な技術文書および法的文書はすべて英語で管理されています。

[BMad](https://github.com/bmad-code-org/BMAD-METHOD) は AI エージェント向けの文書を書きます。WDI Method は、多くの役割の人がすでに読んでいる文書を追加します。ユースケース、C4 図、API とデータベースの一覧、設計文書です。WDI Method は BMad を置き換えずに包み込みます。ブリーフ、PRD、UX、アーキテクチャのスキル（`wdi-problem`、`wdi-product`、`wdi-ux`、スパインについては `wdi-blueprint`）は執筆を BMad のスキルに任せ、その結果をこのメソッドのガイドに照らして確認します。

> 本リポジトリは**パブリックかつ汎用**です。クライアント名、商用製品名、プライベートリポジトリへのリンクを含めてはなりません（MUST NOT）。製品のアイデンティティは、本パッケージをインストールするリポジトリ側にすべて置かれます。

---

## AI 駆動開発 (AiDD) と Vibe Coding

Vibe Coding も仕様を使いますが、一貫していません。プロンプトのセッションごとに内容が変わりうるうえ、文書は構造化されておらず、プロセスも体系的に保たれていません。その結果、効率と効果は大きく下がり、技術的負債が積み上がる現実的なリスクがあります。だからこそフレームワークが必要です。

WDI Method では、AI 駆動開発 (AiDD) は一つの順序で進みます。まず約束を FR とユースケースとして登録し、次にゲートを通り、次に `to-spec` と `to-tickets` で仕様をチケットに切り分け、次に各チケットをテストファーストで作り、最後にオーナーがレビューしてマージする一つの PR にまとめます。

作業は三つの層が担います。

| 層 | 担い手 | 役割 |
|---|---|---|
| 1. エージェント向けの文書 | [BMad](https://github.com/bmad-code-org/BMAD-METHOD) | プロダクトブリーフ、PRD、UX、アーキテクチャのスパインを、それぞれ BMad のスキルを通じて書く |
| 2. レビュー層 | WDI Method | それらのスキルを包み込み、他の役割が読む文書を追加し、五つの人間によるゲートを運用し、Goal → FR → UC → Ticket → Test をつなぎ、コーパスのドリフトを確認する |
| 3. チケットとコード | エンジン（[mattpocock/skills](https://github.com/mattpocock/skills)） | `to-spec` と `to-tickets` が仕様を縦割りのチケットに切り分け、`implement` が各チケットをテストファーストで作る |

### ドキュメントはコードに従う

コードより遅れている文書は想定どおりの状態であり、欠陥ではありません。オーナーが文書よりコードを選んだ場合、修正されるのは文書のほうです。まだ作られていない仕様のように、コードより先行している文書も正常です。

---

## 3 ステップでインストール

### 前提条件

- Node.js 20 以降。
- Git。
- [uv](https://docs.astral.sh/uv/)。このメソッドの Python 3.11+ 検証ツールを実行します。
- エージェントプラットフォーム: Claude Code、Cursor、Codex、その他のエージェントプラットフォーム。

三つのステップを順番に実行してください。ステップ 1 またはステップ 2 が済んでいない場合、インストーラーは停止します。すべてのプロンプトにはデフォルト値があり、<kbd>Enter</kbd> を押すとそれを受け入れます。

### ステップ 1: BMad Method のインストール
```bash
cd /path/to/your/product-repo
npx bmad-method install
```

### ステップ 2: 六つのエンジンの追加
エンジンをリポジトリにインストールします（"copy" か "symlink" のどちらかを選びます）。
```bash
npx skills@latest add mattpocock/skills
```
*このメソッドが動かす六つのエンジンをすべて選択します:* `to-spec`、`to-tickets`、`implement`、`tdd`、`code-review`、`domain-modeling`。

> **Claude Code プラグインだけでは足りない理由:** 六つのエンジンのうち三つ（`to-spec`、`to-tickets`、`implement`）は `disable-model-invocation: true` 付きで配布されています。インストールと更新のたびに、WDI Method はリポジトリ内のコピーからその行を削除し、`wdi-build` と `wdi-autopilot` がそれらを実行できるようにします。ユーザーレベルのプラグインは編集できないため、エンジンがリポジトリに入るまでインストーラーは停止します。`--skip-engines-check` でこの確認を省略できます。

### ステップ 3: WDI Method のインストール
対話型インストーラーを起動し、各エージェントプラットフォームがスキルを読む場所にスキルを配置します。
```bash
npx wdi-method
```
*（非対話型: `npx wdi-method install --yes --agents claude-code --product "Your Product"`）*

> **インストーラーが BMad で変更すること:** インストーラーは、エンジンが置き換える 13 個の BMad のビルドおよびスプリント用スキルについてモデルによる呼び出しをオフにし、対応する拒否ルールを `.claude/settings.json` に追加します。コマンドを入力すれば、それらは引き続き実行できます。

### 最初のコマンド: `/wdi-help`
コーディングエージェントの中で次を実行します。
```text
/wdi-help
```
`wdi-help` は `.control/registry/` を読み、会話から推測することなく、プロジェクトがどのゲートにいるか、開いている仕様、次のスキルを伝えます。

---

## 三つのワークフローオプション

WDI Method は、タスクの規模とリスクに合わせて手続きの重さを調整します。

### オプション A: ガイド付きデリバリートラック（G1 から G5）
新製品、大きな取り組み、アーキテクチャの変更に使います。各ゲートのスキルはあなたが開始し、エージェントは次のスキルを示して待ちます。

**ゲートごとに一つの決定。** 各ゲートは一つのことを決めます。G1 から G4 ではレンダリングされたページを一つ読み、G5 では仕様の RTM 行を読みます。短いチェックリストに答え、星印の付いた質問に一つでも「いいえ」があればゲートは保留になります。

| ゲート | 決めること | スキル | 読むもの | オーナーの決定 |
|---|---|---|---|---|
| **G1 Problem** | 問題は何か、誰の問題か、なぜ作業に値するか | `/wdi-problem` | `.what-rendered/_product-brief/brief.md` | 問題の捉え方を承認する |
| **G2 Product** | 何を作るか、使ったときにどう感じられるか | `/wdi-product`<br>`/wdi-ux`（任意） | `.what-rendered/_prd/<slug>/prd.md` | 機能上の約束（FR）を承認する |
| **G3 Blueprint** | 製品の全体像。製品ごとに一度 | `/wdi-blueprint` | `.how-rendered/blueprint.md` | アーキテクチャのスパインを承認する |
| **G4 Component** | 一つのコンポーネントをどう作るか（`mode: catalog` では省略） | `/wdi-component` | `.how-rendered/<pc>/SDD-<pc>.md` | ソフトウェア設計を承認する |
| **G5 Release** | 完了し、証明されているか | `/wdi-build` | `.control/generated/` にある仕様の RTM 行と、各チケットのテストの証拠 | 仕様を完了として受け入れるか、差し戻す |

**進めずに磨く。** 星印（★）の付いたチェックリストの質問に一つでも「いいえ」があれば、ゲートは保留になります。文書を磨いてからゲートを再実行してください。後で直すつもりで承認してはいけません。

#### 決して統合しない二つのフィールド
- **`mode`** は、各コンポーネントの文書をどこまで深く書くかを決めます。`catalog`（デフォルト）: ブループリント以外には何も書かず、G4 は省略されます。`outline`: 最大 3 件のユースケースの完全なフロー、ローカルなビジネスルール、決定の要約。`guarded`: すべての境界に `Failure Behaviour` セクションを加え、サードパーティ連携の文書を加えます。`deep`: ロバストネス分析、エンドポイントごとの契約、データディクショナリ、フロー図、状態機械を加えます。
- **`risk_accepted`** は、レビューをどこまで厳しくするかを決めます。`high`（多くのリスクを受け入れる）: 基本となる構造と文章の観点。`medium`: エッジケースの観点を加えます。`low`: エッジケースの観点を加え、さらにコードにはビルダー以外のレビュアーが二人必要です。

一つのフィールドで両方を決めてしまうと、薄い文書を得る唯一の方法は、実際に受け入れる以上のリスクをリスク記録に書くことになります。

---

### オプション B: 自律的な日次運用（Daily Tier）
アーキテクチャが整ったら、日々の作業は、エージェントの中で入力する四つのスキルによる日次のリズムで進みます。

1. **`/wdi-daily-what-to-build [reviewer] <notes>`**  
   手動テストのメモ、QA の所見、バグ報告を、後の autopilot 実行のために、開発ブランチ上のレビュー済みの仕様またはチケットに変えます。そこで止まります。コミット、プッシュ、autopilot の開始は一切しません。
2. **`/wdi-daily-autopilot [self-review] [peer] [interval] [--skip-peer-review]`**  
   受け入れ済みのマンデートがあるか確認し、なければプリフライトを実行し、ローカル設定からレビュアーを決定して、ループを開始します（デフォルトは `/loop 10m /wdi-autopilot`）。ループはブランチ `autopilot/<mandate-id>` 上で作業し、コードをテストファーストで書き、すべての決定を台帳に記録し、レビュー準備のできた一つの PR で終わります。マージはオーナーが行います。
3. **`/wdi-daily-what-to-test [web <target> | mobile <target> | desktop]`**  
   マージ後に、開発ブランチを同期し、マージ済みのブランチとワークツリーを整理し、手動テスト用にアプリを準備し、前回の同期以降にクローズされたチケット（`before_sync..HEAD`）からチェックリストを作ります。引数なしの場合は、同期、整理、チェックリスト作成だけを行います。
4. **`/wdi-prune-or-archive [--spec <id> | --all-closed] [--archive | --prune] [--dry-run]`**  
   クローズされた仕様を `.scratch/` から `.archive/specs/` へ移すか、`git rm` で削除します。これは `lifecycle.py` を通じて行われ、`lifecycle.py` は先に確認し、失敗時にはロールバックします。仕様の行は `specs.yaml` に残ります。引数なしの場合は確認を求めます。

---

### オプション C: ファストパス（`/implement` を直接）
FR、UC、AD-N、ドメインモデルのいずれも変えず、チケットが最大一つで、お金、個人データ、サードパーティ連携に触れない修正は、すべてのゲートを省略できます。ラッパースキルを使わず、`/implement` を直接実行します。修正が FR に触れることがわかった場合は作業を止め、サイズ S の仕様（最大 3 チケット）にして `wdi-build` で進めます。

---

## 現場のルール

実際の製品リポジトリで自律コーディングループを運用して得た運用ルールです。

### 1. ビルダーはコーディネーターに固定（`builder: coordinator`）
`wdi-daily-autopilot` では、`.control/custom-dispatch.yaml` の `roles.builder` は `coordinator` に固定されています。コードをサブエージェントに任せると、偽の完了報告が起きました（ファイルを一つも編集していないのに、サブエージェントがテストは通ったと主張する）。コーディネートするセッション自身が、テストファーストでコードを書きます。

### 2. 読み取り専用のレビュアー
ピアレビュアーは読み取り専用で動きます。エッジケースを問いただし、差分を読みますが、コードを変えたりビルドを実行したりはしません。書き込むのはコーディネートするセッションだけです。`risk_accepted: low` ではピアレビューの省略は拒否されます。そこでのコードにはビルダー以外のレビュアーが二人必要だからです。

### 3. Windows のファイルロック（デスクトップのプロセスゲート）
Windows では、実行中のアプリのバイナリやバックグラウンドのビルドデーモンがファイルハンドルを開いたままにするため、再ビルドやワークツリーの削除が `Access is denied` で失敗します。`desktop` ターゲットでは、`wdi-daily-what-to-test` は再ビルドの前にアプリのバイナリがまだ実行中かどうかを確認します。アプリを閉じるのは、自分の前回のスモーク実行がそれを起動した場合だけです。そうでなければ PID を報告して止まり、あなた自身が閉じられるようにします。プロセスを強制終了することはありません。

### 4. ループは専用のブランチで動く
仕様とチケットの執筆は開発ブランチ上で行います。ループは専用のブランチ `autopilot/<mandate-id>` 上で、隔離されたワークツリー、またはその実行だけが使うクリーンなチェックアウトの中で動きます。共有のチェックアウトや未コミットの変更があるチェックアウトの上で動くことはありません。

### 5. autopilot 実行ごとにクラウド CI は一回
ループはチケットごとにコミットし、実行中はローカルのテストスイートが証拠になります。クラウド CI は autopilot 実行ごとに一回、最後に動きます。その一つの PR がレビュー準備完了にされたとき、またはワークフローが一度ディスパッチされたときです。実行中のプッシュではクラウドの実行は始まりません。

### 6. マシンローカルのスモークファイル
スモークのカーソル（`.work/smoke/last-sync`）と実行時のマニフェストは一台のマシンに属します。インストーラーは `.work/smoke/` を `.gitignore` に追加するため、マシンローカルのスモークファイルによって作業ツリーが未コミットの状態になることはありません。

---

## 設定（`custom-dispatch.yaml`）

マシン固有のランナーコマンドとモデルのフラグは `.control/custom-dispatch.yaml` に置きます。このファイルがない場合、インストーラーは `.control/custom-dispatch.yaml.example` から作成し、`.gitignore` に追加します。コミットされるのは example だけです。

レビュアーとして指定されたランナーは読み取り専用でなければなりません（MUST）。CLI ごとの読み取り専用フラグ: `claude --permission-mode plan`、`kiro-cli --trust-tools=fs_read`、`cursor-agent --mode plan`。テンプレートのランナー例はすべてこれを使っています。

---

## スキル一覧（22）

WDI Method は 22 個のスキルをインストールします。ゲートのスキルが 7 個、daily tier のスキルが 5 個（`wdi-autopilot` を含む）、いつでも実行できるスキルが 10 個です。

スキルの起動方法:
- **あなたが入力する**: daily tier の四つのスキルと `wdi-explain-to-me`（これらは `disable-model-invocation: true` を持ちます）。
- **あなたが入力するか、受け入れ済みのマンデートのもとで `wdi-autopilot` が実行する**: `wdi-build`。`wdi-autopilot` がこれを呼び出す必要があるため、`disable-model-invocation` フラグは持ちません。エージェントが自分からこれを始めないというルールは、インストーラーが `CLAUDE.md` と `AGENTS.md` に書き込む Method policy にあります。
- **あなたが入力するか、エージェントが示してあなたの了承を待つ**: その他のスキル。
- **エージェントが自分で実行してよい（読み取り専用）**: `wdi-help`。
- **受け入れ済みのマンデートのもとで `/loop` が起動する**: `wdi-autopilot`。マンデートのもとでは、`wdi-autopilot` が他のスキルも実行します。

| スキル | 役割 | 起動方法 |
|---|---|---|
| **ゲートのスキル** | | |
| `/wdi-init` | G1 の前と G2 の終わりに: レジストリ、コンポーネント、`mode` と `risk_accepted`、二つの構造マップ、エンジンの確認、インベントリの読み取りツールを用意します。 | あなたが入力するか、エージェントが示す |
| `/wdi-problem` | G1。BMad のプロダクトブリーフのスキルを実行し、ブリーフをこのメソッドのガイドに照らして確認します。ブリーフを自分で書くことはありません。 | あなたが入力するか、エージェントが示す |
| `/wdi-product` | G2。新しい PRD や変更された約束について BMad の PRD スキルを実行し、PRD ガイドに照らして確認します。PRD を自分で書くことはありません。 | あなたが入力するか、エージェントが示す |
| `/wdi-ux` | 任意、G2 とともに。BMad の UX スキルを実行し、設計の結果をあるべき場所に収めます。UX の内容を自分で書くことはありません。 | あなたが入力するか、エージェントが示す |
| `/wdi-blueprint` | G3、製品ごとに一度。製品全体の姿: ユースケース、アクター、ドメインモデル、ビジネスルール、用語集、アーキテクチャのスパイン、C4、そして API、テーブル、画面のインベントリ。 | あなたが入力するか、エージェントが示す |
| `/wdi-component` | G4。一つのコンポーネントの深さで、その `mode` が求める深さまで、それ以上は書きません。`mode: catalog` では省略されます。 | あなたが入力するか、エージェントが示す |
| `/wdi-build` | G5。一つの仕様をオープンからクローズまで: あなたが `to-spec` と `to-tickets` を実行し、各チケットがグリーンの PR になり、その後仕様がクローズされます。マージはしません。 | あなたが入力するか、`wdi-autopilot` が実行する |
| **Daily tier** | | |
| `/wdi-daily-what-to-build` | 手動テストのメモを、後の autopilot 実行のためのレビュー済みの仕様またはチケットに変えます。コード、コミット、プッシュの前で止まります。 | あなたが入力する |
| `/wdi-daily-autopilot` | 受け入れ済みのマンデートがあるか確認し（なければプリフライトを実行）、ローカル設定からレビュアーを決定して、デフォルトでは 10 分ごとのループを開始します。 | あなたが入力する |
| `/wdi-autopilot` | ループそのもの: 一つの受け入れ済みマンデートのもとで、一つのブランチと一つの PR で、すべての FR を順に処理し、すべての決定を一つの台帳に書きます。 | 受け入れ済みのマンデートのもとで `/loop` が起動する |
| `/wdi-daily-what-to-test` | マージ後に: 開発ブランチを同期し、マージ済みのブランチとワークツリーを整理し、手動テスト用にアプリを準備し、クローズされたチケットからチェックリストを作ります。 | あなたが入力する |
| `/wdi-prune-or-archive` | クローズされた仕様を `.archive/specs/` へ移すか `git rm` で削除します。これは `lifecycle.py` を通じて行われ、先に確認し、失敗時にはロールバックします。仕様の行は `specs.yaml` に残ります。 | あなたが入力する |
| **いつでも** | | |
| `/wdi-help` | ステータスのレジストリを読み、現在のゲート、開いている仕様、次のスキルを伝えます。 | エージェントが自分で実行してよい（読み取り専用） |
| `/wdi-explain-to-me` | あなたが決める前に読み込みを済ませます: 調査し、六つの決まったセクションで要点を伝えます。ファイルは書きません。 | あなたが入力する |
| `/wdi-decision` | 番号付きの決定（`DEC-`）をオープン、受け入れ、適用し、それが規定する文書に反映します。 | あなたが入力するか、エージェントが示す |
| `/wdi-question` | 今は決められないことを `.control/questions/` の四つのリストのいずれかに収め、答えが出たらクローズします。 | あなたが入力するか、エージェントが示す |
| `/wdi-log` | 終わった会議、または作れるものを制限する非技術的な事実を記録します。 | あなたが入力するか、エージェントが示す |
| `/wdi-report` | プロジェクトに関する数字: 進捗、見積もり、トラッカー用のタスク行、または単独のブリーフや PRD。数字をでっち上げることはありません。 | あなたが入力するか、エージェントが示す |
| `/wdi-reconcile` | ゲートの前、または一連の変更の後に: `.what`、`.how`、`.control` とこのメソッドのルールとの間のドリフトを報告します。読み取り専用です。 | あなたが入力するか、エージェントが示す |
| `/wdi-review` | 任意のコーパス文書をレビューします。スパイン、SRS、SDD、SPEC については、ゲートの前に必ず実行します。観点は `risk_accepted` に従います。コードレビュー用ではありません。 | あなたが入力するか、エージェントが示す |
| `/wdi-systematic-debugging` | あらゆるバグ、失敗したテスト、失敗したビルドについて、修正を提案する前に: 根本原因を見つけ、仮説を一つずつ検証します。 | あなたが入力するか、エージェントが示す |
| `/wdi-upgrade` | `wdi-method update` の直後に: 古い形のままの文書とレジストリファイルを新しい形に移し、検証がグリーンであることを確認します。 | あなたが入力するか、エージェントが示す |

---

## リポジトリ構成

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

## コントリビューション

WDI Method へのすべてのコントリビューションは、一つの問いに答えます。**これはレビュー層をより信頼できるものにするのか、それとも厚くするだけなのか？** [CONTRIBUTING.md](CONTRIBUTING.md) を参照してください。

### フィクスチャコーパスとローカル検証
検証ツールとメソッドの変更は、フィクスチャコーパス（`tests/fixture/`）に対して証明します。プルリクエストを開く前にテストスイートを実行してください。
```bash
npm test
```
テストスイートは、四つの Python PEP 723 スクリプト（`validate.py`、`timeline.py`、`inventory.py`、`lifecycle.py`）をフィクスチャに対して実行し、プラットフォームのレジストリ、各プラットフォームが受け取るファイル、キットの完全性を確認します。

### パブリック汎用パッケージの規則
WDI Method は公開の npm レジストリで公開されています。プライベートなクライアント名、商用製品のアイデンティティ、認証情報、絶対ファイルシステムパスを決して含めてはなりません。

---

## ライセンスとプライバシー

- **コードのライセンス:** [MIT License](LICENSE)。
- **プライバシー:** WDI Method 自体はネットワーク通信を行いません。ただし、コーディングエージェントはそのモデル提供元と通信します。[PRIVACY.md](PRIVACY.md) と [SECURITY.md](SECURITY.md) を参照してください。

## The name and the icon

以下の英語の原文が適用されるテキストです。

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

私たちはクライアントのプロジェクトでも同じメソッドを使っています。[Wira Delta Indonesia に問い合わせる](https://wiradelta.id/#contact)。
