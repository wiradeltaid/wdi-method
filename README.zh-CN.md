# WDI Method

> 构建在 BMad 之上的审查层：在编写代码之前，由人阅读文档来检查技术决策，文档规模与变更实际所需相匹配。

[English](README.md) | [Bahasa Indonesia](README.id.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Español](README.es.md) | [Deutsch](README.de.md) | [Français](README.fr.md) | [Português (Brasil)](README.pt-BR.md) | [Русский](README.ru.md)  
[Website](https://wiradelta.id/wdi-method/docs/) | [Changelog](CHANGELOG.md) | [Contributing](CONTRIBUTING.md) | [License](LICENSE) | [Security](SECURITY.md) | [Privacy](PRIVACY.md)

---

> **翻译说明：** 本文件是 [README.md](README.md) 的参考译文。如存在任何语义分歧或解释冲突，一律以官方英文版（README.md）为准。所有深度技术文档与法律条款均以英文维护。

[BMad](https://github.com/bmad-code-org/BMAD-METHOD) 为 AI 代理编写文档。WDI Method 补充了许多角色本来就会阅读的文档：用例、C4 图、API 与数据库清单，以及设计文档。它封装 BMad 而不替代它：简报、PRD、UX 和架构技能（`wdi-problem`、`wdi-product`、`wdi-ux`，以及负责架构主干的 `wdi-blueprint`）把写作交给一个 BMad 技能，然后按照本方法的指南检查结果。

> 本仓库是**公开且通用的**。它不得（MUST NOT）包含客户名称、商业产品名称或指向私有仓库的链接。产品身份完全存放在安装它的仓库中。

---

## AI 驱动开发 (AiDD) 与氛围编码 (Vibe Coding)

氛围编码也会使用规格说明，但并不一致：每次提示会话都可能不同，文档没有结构，过程也没有保持系统化。结果是效率和效果低得多，并且存在累积技术债务的真实风险。这就是需要一个框架的原因。

在 WDI Method 中，AI 驱动开发 (AiDD) 按一个顺序运行：先把承诺登记为 FR 和用例，然后经过各道关卡，然后用 `to-spec` 和 `to-tickets` 把规格说明切分为工单，然后每个工单以测试先行的方式构建，最后由负责人审查并合并一个 PR。

三个层级分工完成这些工作：

| 层级 | 由谁负责 | 做什么 |
|---|---|---|
| 1. 面向代理的文档 | [BMad](https://github.com/bmad-code-org/BMAD-METHOD) | 编写产品简报、PRD、UX 和架构主干，每项都通过一个 BMad 技能完成 |
| 2. 审查层 | WDI Method | 封装这些技能，补充其他角色阅读的文档，运行五道人工关卡，串联 Goal → FR → UC → Ticket → Test，并检查语料库是否出现偏差 |
| 3. 工单与代码 | 引擎（[mattpocock/skills](https://github.com/mattpocock/skills)） | `to-spec` 和 `to-tickets` 把规格说明切分为垂直工单；`implement` 以测试先行的方式构建每一个工单 |

### 文档跟随代码

落后于代码的文档处于预期状态，不是缺陷。当负责人选择以代码而非文档为准时，被修正的是文档。领先于代码的文档，例如尚未构建的规格说明，也是正常的。

---

## 3 步安装

### 前提条件

- Node.js 20 或更高版本。
- Git。
- [uv](https://docs.astral.sh/uv/)，用于运行本方法的 Python 3.11+ 验证器。
- 一个代理平台：Claude Code、Cursor、Codex 以及其他代理平台。

按顺序执行这三个步骤。如果第 1 步或第 2 步尚未完成，安装器会停止。所有提示都提供默认值；按 <kbd>Enter</kbd> 即接受默认值。

### 第 1 步：安装 BMad Method
```bash
cd /path/to/your/product-repo
npx bmad-method install
```

### 第 2 步：添加六个引擎
把引擎安装到你的仓库中（选择 "copy" 或 "symlink" 之一）：
```bash
npx skills@latest add mattpocock/skills
```
*选择本方法驱动的全部六个引擎：* `to-spec`、`to-tickets`、`implement`、`tdd`、`code-review` 和 `domain-modeling`。

> **为什么 Claude Code 插件不够用：** 六个引擎中有三个（`to-spec`、`to-tickets`、`implement`）自带 `disable-model-invocation: true`。每次安装和更新时，WDI Method 都会从你仓库中的副本里删除这一行，使 `wdi-build` 和 `wdi-autopilot` 能够运行它们。它无法编辑用户级插件，因此在引擎进入仓库之前，安装器会停止。`--skip-engines-check` 可以跳过这项检查。

### 第 3 步：安装 WDI Method
启动交互式安装器，并把技能放到你的每个代理平台读取它们的位置：
```bash
npx wdi-method
```
*（非交互式：`npx wdi-method install --yes --agents claude-code --product "Your Product"`）*

> **安装器在 BMad 中改变了什么：** 安装器还会为被引擎取代的 13 个 BMad 构建与 sprint 技能关闭模型调用，并在 `.claude/settings.json` 中添加相应的拒绝规则。你仍然可以通过输入命令来运行它们。

### 你的第一个命令：`/wdi-help`
在你的编码代理中运行：
```text
/wdi-help
```
`wdi-help` 读取 `.control/registry/`，告诉你项目所处的关卡、未关闭的规格说明以及下一个技能，而不是从对话中猜测。

---

## 三种工作流选项

WDI Method 根据任务的规模和风险调整流程的繁简程度。

### 选项 A：引导式交付路线（G1 到 G5）
适用于新产品、重大举措和架构变更。每个关卡技能由你启动；代理会指出下一个技能并等待。

**每道关卡一个决定。** 每道关卡只决定一件事。在 G1 到 G4，你阅读一个渲染后的页面；在 G5，你阅读该规格说明的 RTM 行。你回答一份简短的检查清单，带星号的问题只要有一个"否"，关卡就会被搁置。

| 关卡 | 决定什么 | 技能 | 你阅读什么 | 负责人的决定 |
|---|---|---|---|---|
| **G1 Problem** | 问题是什么、是谁的问题，以及为什么值得投入工作 | `/wdi-problem` | `.what-rendered/_product-brief/brief.md` | 批准问题的界定 |
| **G2 Product** | 构建什么，以及使用起来是什么感觉 | `/wdi-product`<br>`/wdi-ux`（可选） | `.what-rendered/_prd/<slug>/prd.md` | 批准功能承诺（FR） |
| **G3 Blueprint** | 产品的整体图景，每个产品一次 | `/wdi-blueprint` | `.how-rendered/blueprint.md` | 批准架构主干 |
| **G4 Component** | 一个组件如何构建（在 `mode: catalog` 下跳过） | `/wdi-component` | `.how-rendered/<pc>/SDD-<pc>.md` | 批准软件设计 |
| **G5 Release** | 是否已完成并得到证明 | `/wdi-build` | `.control/generated/` 中该规格说明的 RTM 行，以及每个工单的测试证据 | 接受该规格说明为已完成，或将其退回 |

**完善，而不是推进。** 带星号（★）的检查清单问题只要有一个"否"，关卡就会被搁置。完善文档后再次运行关卡；不要带着以后再修的打算批准它。

#### 两个永不合并的字段
- **`mode`** 设定每个组件的文档写到多深。`catalog`（默认）：蓝图之外不写任何内容，并跳过 G4。`outline`：最多 3 个用例的完整流程、本地业务规则、决策摘要。`guarded`：为每个边界增加 `Failure Behaviour` 一节，并增加第三方集成文档。`deep`：增加健壮性分析、每个端点一份契约、数据字典、流程图和状态机。
- **`risk_accepted`** 设定审查有多严格。`high`（你接受较多风险）：基线的结构与行文视角。`medium`：增加边界情况视角。`low`：增加边界情况视角，并且代码需要两位非构建者的审查者。

如果由一个字段同时设定两者，那么想得到一份精简文档的唯一办法，就是在风险记录中写入比你实际接受的更多的风险。

---

### 选项 B：自主日常运作（Daily Tier）
架构就位后，日常工作以每日节奏运行，通过你在代理中输入的四个技能完成：

1. **`/wdi-daily-what-to-build [reviewer] <notes>`**  
   把手工测试笔记、QA 观察或缺陷报告转化为开发分支上一份经过审查的规格说明或工单，供之后的 autopilot 运行使用。它到此为止：从不提交、推送或启动 autopilot。
2. **`/wdi-daily-autopilot [self-review] [peer] [interval] [--skip-peer-review]`**  
   检查是否有已接受的授权（mandate），没有则运行预检，从本地配置解析审查者，然后启动循环（默认 `/loop 10m /wdi-autopilot`）。循环在分支 `autopilot/<mandate-id>` 上工作，以测试先行的方式编写代码，把每个决定记录到它的账本中，最后产出一个可供审查的 PR。由负责人合并。
3. **`/wdi-daily-what-to-test [web <target> | mobile <target> | desktop]`**  
   合并之后：同步开发分支，清理已合并的分支和工作树，为手工测试准备应用，并根据自上次同步以来关闭的工单（`before_sync..HEAD`）生成检查清单。不带参数时，它只做同步、清理和生成检查清单。
4. **`/wdi-prune-or-archive [--spec <id> | --all-closed] [--archive | --prune] [--dry-run]`**  
   通过 `lifecycle.py` 把已关闭的规格说明从 `.scratch/` 移到 `.archive/specs/`，或用 `git rm` 删除它们；`lifecycle.py` 会先做检查，失败时回滚。规格说明的行保留在 `specs.yaml` 中。不带参数时，它会询问。

---

### 选项 C：快速路径（直接 `/implement`）
如果一个修复不改变任何 FR、UC、AD-N 或领域模型，最多一个工单，并且不涉及资金、个人数据或第三方集成，就可以跳过所有关卡。你直接运行 `/implement`，不经过任何封装技能。如果修复最终涉及某个 FR，工作就会停止，转为一个 S 规模的规格说明（最多 3 个工单），通过 `wdi-build` 运行。

---

## 实践规则

在真实产品仓库上运行自主编码循环时总结出的运作规则：

### 1. 构建者固定为协调者（`builder: coordinator`）
在 `wdi-daily-autopilot` 中，`.control/custom-dispatch.yaml` 里的 `roles.builder` 固定为 `coordinator`。把代码委派给子代理曾导致虚假的完成报告（子代理声称测试通过，却没有编辑任何文件）。由协调会话自己以测试先行的方式编写代码。

### 2. 只读审查者
同行审查者以只读方式运行。他们质询边界情况、阅读 diff，但从不修改代码或运行构建；只有协调会话负责写入。在 `risk_accepted: low` 下，跳过同行审查的请求会被拒绝，因为那里的代码需要两位非构建者的审查者。

### 3. Windows 文件锁（桌面进程门禁）
在 Windows 上，正在运行的应用二进制文件或后台构建守护进程会保持文件句柄打开，随后重新构建或删除工作树就会以 `Access is denied` 失败。使用 `desktop` 目标时，`wdi-daily-what-to-test` 会在重新构建前检查应用二进制文件是否仍在运行。只有当应用是由它自己上一次冒烟运行启动的，它才会关闭该应用；否则它会报告 PID 并停止，由你自己关闭。它从不强制终止进程。

### 4. 循环在自己的分支上运行
规格说明和工单的编写在开发分支上进行。循环在它自己的分支 `autopilot/<mandate-id>` 上运行，位于一个隔离的工作树中，或位于一个只供该次运行使用的干净检出中。它从不在共享的或有未提交改动的检出上运行。

### 5. 每次 autopilot 运行只有一次云端 CI 运行
循环按工单提交，运行期间以本地测试套件作为证据。云端 CI 在每次 autopilot 运行中只运行一次，在结束时：当那一个 PR 被标记为可供审查时，或当工作流被派发一次时。运行期间的推送不会启动云端运行。

### 6. 机器本地的冒烟文件
冒烟游标（`.work/smoke/last-sync`）和运行时清单属于某一台机器。安装器会把 `.work/smoke/` 加入 `.gitignore`，因此机器本地的冒烟文件不会让工作树处于有改动的状态。

---

## 配置（`custom-dispatch.yaml`）

与机器相关的运行器命令和模型参数存放在 `.control/custom-dispatch.yaml` 中。该文件缺失时，安装器会从 `.control/custom-dispatch.yaml.example` 创建它，并把它加入 `.gitignore`；只有示例文件会被提交。

被指定为审查者的运行器必须（MUST）是只读的。各 CLI 的只读参数：`claude --permission-mode plan`、`kiro-cli --trust-tools=fs_read`、`cursor-agent --mode plan`。模板中的示例运行器都使用了它。

---

## 技能目录（22）

WDI Method 安装 22 个技能：7 个关卡技能，5 个日常层（daily tier）技能（包括 `wdi-autopilot`），以及 10 个可随时运行的技能。

技能如何启动：
- **由你输入**：四个日常层技能和 `wdi-explain-to-me`（它们带有 `disable-model-invocation: true`）。
- **由你输入，或在已接受的授权下由 `wdi-autopilot` 运行**：`wdi-build`。它不带 `disable-model-invocation` 标志，因为 `wdi-autopilot` 必须能调用它；代理不会自行启动它的规则，写在安装器写入 `CLAUDE.md` 和 `AGENTS.md` 的 Method policy 中。
- **由你输入，或由代理指出并等待你同意**：其他技能。
- **代理可以自行运行（只读）**：`wdi-help`。
- **在已接受的授权下由 `/loop` 触发**：`wdi-autopilot`。在授权下，`wdi-autopilot` 也会运行其他技能。

| 技能 | 做什么 | 如何启动 |
|---|---|---|
| **关卡技能** | | |
| `/wdi-init` | 在 G1 之前和 G2 结束时：建立注册表、组件、`mode` 和 `risk_accepted`、两份结构图、引擎检查以及清单读取器。 | 由你输入，或由代理指出 |
| `/wdi-problem` | G1。运行 BMad 的产品简报技能，然后按照本方法的指南检查简报。从不自己编写简报。 | 由你输入，或由代理指出 |
| `/wdi-product` | G2。为新的 PRD 或变更的承诺运行 BMad 的 PRD 技能，然后按照 PRD 指南检查它。从不自己编写 PRD。 | 由你输入，或由代理指出 |
| `/wdi-ux` | 可选，随 G2 进行。运行 BMad 的 UX 技能，并把设计结果归档到应在的位置。从不自己编写 UX 内容。 | 由你输入，或由代理指出 |
| `/wdi-blueprint` | G3，每个产品一次。产品的整体图景：用例、参与者、领域模型、业务规则、术语表、架构主干、C4，以及 API、数据表和界面清单。 | 由你输入，或由代理指出 |
| `/wdi-component` | G4。一个组件的深度，深到其 `mode` 要求为止，不再更深。在 `mode: catalog` 下跳过。 | 由你输入，或由代理指出 |
| `/wdi-build` | G5。一份规格说明从打开到关闭：你运行 `to-spec` 和 `to-tickets`，每个工单达到一个绿色的 PR，然后规格说明关闭。它从不合并。 | 由你输入，或由 `wdi-autopilot` 运行 |
| **日常层** | | |
| `/wdi-daily-what-to-build` | 把手工测试笔记转化为一份经过审查的规格说明或工单，供之后的 autopilot 运行使用。在代码、提交或推送之前停止。 | 由你输入 |
| `/wdi-daily-autopilot` | 检查是否有已接受的授权（没有则运行预检），从本地配置解析审查者，然后启动循环，默认每 10 分钟一次。 | 由你输入 |
| `/wdi-autopilot` | 循环本身：在一份已接受的授权下处理每一个 FR，使用一个分支和一个 PR，并把每个决定写入一个账本。 | 在已接受的授权下由 `/loop` 触发 |
| `/wdi-daily-what-to-test` | 合并之后：同步开发分支，清理已合并的分支和工作树，为手工测试准备应用，并根据已关闭的工单生成检查清单。 | 由你输入 |
| `/wdi-prune-or-archive` | 通过 `lifecycle.py` 把已关闭的规格说明移到 `.archive/specs/` 或用 `git rm` 删除它们；`lifecycle.py` 会先做检查，失败时回滚。规格说明的行保留在 `specs.yaml` 中。 | 由你输入 |
| **随时可用** | | |
| `/wdi-help` | 读取状态注册表，告诉你当前的关卡、未关闭的规格说明以及下一个技能。 | 代理可以自行运行（只读） |
| `/wdi-explain-to-me` | 在你做决定之前先完成阅读：调查，然后用六个固定小节向你简要汇报。不写任何文件。 | 由你输入 |
| `/wdi-decision` | 打开、接受并应用一个编号的决定（`DEC-`），并把它带入它所约束的文档。 | 由你输入，或由代理指出 |
| `/wdi-question` | 把暂时无法决定的事项归入 `.control/questions/` 中四份清单之一，并在答案到来时关闭它。 | 由你输入，或由代理指出 |
| `/wdi-log` | 记录一次已结束的会议，或一项限制可构建内容的非技术事实。 | 由你输入，或由代理指出 |
| `/wdi-report` | 关于项目的数字：进度、估算、用于跟踪工具的任务行，或一份独立的简报或 PRD。从不编造数字。 | 由你输入，或由代理指出 |
| `/wdi-reconcile` | 在关卡之前或一批变更之后：报告 `.what`、`.how`、`.control` 与本方法规则之间的偏差。只读。 | 由你输入，或由代理指出 |
| `/wdi-review` | 审查任何语料库文档，并且对于主干、SRS、SDD 和 SPEC，必须在关卡之前运行。其审查视角遵循 `risk_accepted`。不用于代码审查。 | 由你输入，或由代理指出 |
| `/wdi-systematic-debugging` | 针对任何缺陷、失败的测试或失败的构建，在提出修复之前：找到根本原因，并一次检验一个假设。 | 由你输入，或由代理指出 |
| `/wdi-upgrade` | 在 `wdi-method update` 之后立即运行：把仍是旧形态的文档和注册表文件迁移到新形态，然后检查验证是否为绿色。 | 由你输入，或由代理指出 |

---

## 仓库结构

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

## 贡献

对 WDI Method 的每项贡献都回答一个问题：**这是让审查层更值得信赖，还是只让它更厚重？** 参见 [CONTRIBUTING.md](CONTRIBUTING.md)。

### 固定测试语料库与本地验证
验证器和方法的变更要在固定测试语料库（`tests/fixture/`）上得到证明。在发起拉取请求之前运行测试套件：
```bash
npm test
```
测试套件针对固定测试语料库运行四个 Python PEP 723 脚本（`validate.py`、`timeline.py`、`inventory.py`、`lifecycle.py`），并检查平台注册表、每个平台接收的文件以及套件的完整性。

### 公开通用包规则
WDI Method 发布在公共 npm 仓库上。它绝不能包含私有客户名称、商业产品标识、凭证或绝对文件系统路径。

---

## 许可证与隐私

- **代码许可证：** [MIT 许可证](LICENSE)。
- **隐私：** WDI Method 本身不发起任何网络调用；你的编码代理仍会与其模型提供方通信。参见 [PRIVACY.md](PRIVACY.md) 和 [SECURITY.md](SECURITY.md)。

## The name and the icon

以下英文原文为适用文本。

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

我们在客户项目中也使用同样的方法。[联系 Wira Delta Indonesia](https://wiradelta.id/#contact)。
