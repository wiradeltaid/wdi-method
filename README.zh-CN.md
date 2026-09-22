# WDI Method

> BMad 所精简保留的审查层 —— 供人类在编写代码前验证技术决策的规范说明框架，根据实际变更规模匹配相应的文档粒度。

[English](README.md) | [Bahasa Indonesia](README.id.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Español](README.es.md) | [Deutsch](README.de.md) | [Français](README.fr.md) | [Português (Brasil)](README.pt-BR.md) | [Русский](README.ru.md)  
[Website](https://wiradelta.id/wdi-method) | [Changelog](CHANGELOG.md) | [Contributing](CONTRIBUTING.md) | [License](LICENSE) | [Security](SECURITY.md) | [Privacy](PRIVACY.md)

---

> **翻译说明：** 本文件是 [README.md](README.md) 的参考译文。如存在任何语义分歧或解释冲突，一律以官方英文版（README.md）为准。所有深度技术文档与法律条款均以英文维护。

[BMad](https://github.com/bmad-code-org/BMAD-METHOD) 负责决定“构建*什么*”以及“*如何*架构良好解决方案”。WDI Method 对其进行封装而非替代，在高阶架构决策与生产代码之间提供可验证的治理层：需求注册表、用例目录、组件边界约束、自动化偏差验证器以及顺畅的自动化日常循环。

> 本仓库为**公开且通用**开源项目。严禁包含任何特定客户名称、商业产品标识或私有仓库链接。产品身份完全由安装本框架的具体仓库定义。

---

## 全局视野：AI 驱动工程开发 (AiDD) vs. 氛围感编码 (Vibe Coding)

缺乏规范的推测性提示词编写（即所谓的“Vibe Coding”）在多月份的生产级系统中必然失败：AI 编码代理极易丢失上下文、虚构任务完成状态，并模糊需求边界。WDI Method 通过三层架构体系确立严谨的 **AI 驱动开发规范 (AiDD)**：

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. 意图与产品战略：BMad Method                                          │
│    负责挖掘用户痛点、起草产品摘要与初始系统架构                         │
├─────────────────────────────────────────────────────────────────────────┤
│ 2. 可验证审查层：WDI Method (SSOT)                                      │
│    确立 5 个关键人工审查关卡，关联 Goal → FR → UC → Ticket → Test 链路， │
│    运行代码-文档防偏差验证器，组织安全的日常自主执行循环                │
├─────────────────────────────────────────────────────────────────────────┤
│ 3. 任务切分与实现：Skills Engines (mattpocock/skills)                   │
│    to-spec & to-tickets 负责切分垂直切片；implement 执行严格 TDD        │
└─────────────────────────────────────────────────────────────────────────┘
```

### 核心不变原则：文档始终跟随代码
文档是对已完成工程实践的客观记录。当决策记录或需求条目与实际代码产生分歧时，**以代码为准并修正文档**。绝不为了迎合过时文档而修改代码。落后于代码的文档是正常迭代状态，只要不包含具有误导性的过时主张，就不应阻碍版本发布。

---

## 10 分钟快速上手

仅需顺序执行三个步骤即可将 WDI Method 引入你的产品仓库。所有交互提示均提供合理默认值，直接按 <kbd>Enter</kbd> 即可确认。

### 第 1 步：安装 BMad Method
在你的产品仓库中安装需求发现引擎：
```bash
cd /path/to/your/product-repo
npx bmad-method install
```

### 第 2 步：引入 6 个工单执行引擎
将底层执行引擎直接引入产品仓库中（可选择复制或软链接）：
```bash
npx skills@latest add mattpocock/skills
```
*勾选由本方法驱动的全部 6 个核心引擎：* `to-spec`, `to-tickets`, `implement`, `tdd`, `code-review`, `domain-modeling`。

> **为什么 Claude Code 用户级插件不满足要求：** 上游引擎自带 `disable-model-invocation: true` 标记。WDI Method 会自动从本地副本中解除此限制，以便无人值守自动化循环调用。仓库无法修改安装在全局用户目录下的插件。

### 第 3 步：安装 WDI Method
启动交互式安装器，并为你所使用的 Agent 平台（Claude Code, Cursor, OpenCode, Windsurf 等）同步技能配置：
```bash
npx wdi-method
```
*(CI 自动化构建环境指令：`npx wdi-method install --yes --agents claude --product "Your Product"`)*

### 你的首个命令：`/wdi-help`
在你的 AI 编码代理环境中（Claude Code、Cursor）运行：
```text
/wdi-help
```
`wdi-help` 会读取 `.control/registry/` 目录状态，并明确指出当前处于哪一道工程审查关卡，无需从聊天历史中盲目推测。

---

## 三种工作流模式

WDI Method 根据任务规模与风险程度灵活调整流程仪式感：

### 模式 A：引导式交付链路（全新产品功能与 G1–G5）
适用于新产品启动、重点模块建设及系统架构重构。人类在每个关卡只需阅读**渲染后的单页文档**即可做出决策：*推进或重构*。

| 关卡 | 回答的核心问题 | 调用技能 | 阅读的单页交付物 | 负责人的决策 |
|---|---|---|---|---|
| **G1 — Problem** | 该问题是否真实存在、责任归属是谁、是否值得投入？ | `/wdi-problem` | `.what-rendered/_product-brief/brief.md` | 确认问题定义或重写 |
| **G2 — Product** | 我们要做什么，用户交互体验是怎样的？ | `/wdi-product`<br>`/wdi-ux` | `.what-rendered/_prd/<slug>/prd.md` | 确认功能承诺 (FR) 与界面契约 |
| **G3 — Blueprint** | 整个系统架构是否能够自洽运转？ *(每个产品仅需一次)* | `/wdi-blueprint` | `.how-rendered/blueprint.md` | 确认系统架构主干 |
| **G4 — Component** | 具体组件该如何构建？ *(在 `mode: catalog` 下自动跳过)* | `/wdi-component` | `.how-rendered/<pc>/SDD-<pc>.md` | 确认软件设计文档 (SDD) |
| **G5 — Build** | 工单切片是否实现完成并得到有效验证？ *(每个规格一次)* | `/wdi-build` | 测试套件输出证据 (红 &rarr; 绿) | 批准合入或退回修改 |

#### 绝不合并的双旋钮：Mode 与 Risk
- **`mode`** 决定了哪些关卡必须存在（例如 `catalog` 跳过 G4，而 `guarded` 与 `deep` 强制要求完整 SDD）。
- **`risk_accepted`** 决定了每个关卡需要呈现多深度的证据支撑（`low`, `medium`, `high`）。将二者混合成单一的“严格度”指标，要么会让简单组件陷入繁文缛节，要么会导致高风险代码未经审查即被放行。

---

### 模式 B：日常自主敏捷执行（阶段 4: Daily Tier）
当架构稳固后，日常开发即进入持续交付节奏。WDI Method 为此提供 4 个开箱即用的日常工具：

1. **`/wdi-daily-what-to-build [reviewer] <notes>`**:  
   将手工测试笔记、QA 反馈或线上缺陷报告迅速整理为结构化规格说明。根据语料库对需求进行分类，在开发分支上起草工单，并派发只读的独立二次评审意见。
2. **`/wdi-daily-autopilot [self-review] [peer] [interval]`**:  
   在负责人批准的授权委任（Mandate）下启动自主工程开发循环。以稳定节奏（默认：`/loop 10m /wdi-autopilot`）无人值守循环执行 TDD，并在每次决策后记录审计账本。
3. **`/wdi-daily-what-to-test [web|mobile|desktop]`**:  
   负责代码合入后的物理测试协调。快进同步开发分支、清理已合入的本地与远程工作树、解除桌面进程占用锁定，并基于提交差分（`before_sync..HEAD`）自动生成物理测试清单。
4. **`/wdi-prune-or-archive [spec-id] [--archive|--prune]`**:  
   维护仓库整洁度，安全地将已关闭的规格说明归档至 `.archive/specs/` 或通过 `git rm` 移除物理文件，同时 100% 保持需求追溯矩阵（RTM）证据链。

---

### 模式 C：极速路径（直接 `/implement`）
对于未触及 `FR`、`UC`、`AD-N` 或领域模型的小型 Bug 修复与微小优化，可直接调用 `/implement` 跳过所有文档关卡。若变更在中途扩展至功能承诺，**必须立即终止并转化为显式规格说明 `S`**，在 G5 关卡接受校验。

---

## 生产级实战技巧与经验准则

来自多平台真实 Agent 协作中总结出的高价值工程经验：

### 1. 构建者必须固定为协调者 (`builder: coordinator`)
在 `wdi-daily-autopilot` 流程中，`.control/custom-dispatch.yaml` 中的 `roles.builder` 必须严格设定为 `coordinator`。若将编码实现委派给子代理（Subagent），极易产生虚假状态幻觉（子代理声称所有单元测试均通过，但实际并未改动任何文件）。由主协调者通过直接 TDD 红绿循环来编写生产代码。

### 2. 独立评审员仅担任只读顾问
外部同行评审（例如通过 `kiro-cli` 调用的 Terra / GPT-5.6-Terra）必须以只读模式运行（`--trust-tools=fs_read` / `--mode plan`）。评审员只负责审查 Diff 差异与边界漏洞，绝不直接修改代码或触发繁重构建。严格保持单一作者准则。

### 3. Windows 文件占用与进程门禁 (Process Gating)
在 Windows 环境下，驻留后台的进程（运行中的应用程序、Gradle 测试守护进程、Java 虚拟机）会独占文件句柄，导致编译或清理工作树时产生 `Access is denied (Exit code 5/32)` 拒绝访问异常。`wdi-daily-what-to-test` 会在执行前检查并终止相关进程。

### 4. Git 工作树隔离原则
规格说明与工单编写在 `main` 上执行，但代码实现与自动化循环（`wdi-autopilot`）**必须在独立的 Git 工作树中运行**（`autopilot/<mandate-id>`）。绝不在处于脏状态的主工作区内运行无人值守循环。

### 5. 单一 PR 触发单次云端 CI
自主循环会在本地为每个工单生成原子提交。若每次循环都触发云端流水线，将迅速耗尽每月 Actions 配额。循环期间以本地测试套件作为权威证据；云端 CI 仅在 PR 标记为准备好审查时**触发一次**。

### 6. 忽略临时冒烟测试资产
冒烟测试同步游标（`.work/smoke/last-sync`）等属于本地机器状态。务必将 `.work/smoke/` 加入 `.gitignore`，避免由于检测到工作区不洁而中断前置检查。

### 7. 本地运行器配置解耦 (`custom-dispatch.yaml`)
与特定机器相关的模型配置与命令行参数保存在 `.control/custom-dispatch.yaml` 中（自动配置 git 忽略）。Git 仅追踪通用的 `.control/custom-dispatch.yaml.example` 模板。

---

## 官方 22 个技能目录 (按领域与调用权限划分)

| 功能领域 | 人工主动调用指令 (Slash Command) | 模型调用 / 自动化循环编排 |
|---|---|---|
| **架构与交付 (G1–G5)** | `/wdi-init` (G0 初始化与组件)<br>`/wdi-problem` (G1 问题定位与简报)<br>`/wdi-product` (G2 PRD 产品承诺)<br>`/wdi-ux` (G2/G3 用户交互契约)<br>`/wdi-blueprint` (G3 架构主干)<br>`/wdi-component` (G4 组件设计 SDD)<br>`/wdi-build` (G5 规格与工单切分) | 在关卡流转期间由协调者按序推进 |
| **日常敏捷自律运维** | `/wdi-daily-what-to-build` (笔记整理与分级)<br>`/wdi-daily-autopilot` (委任循环发射器)<br>`/wdi-daily-what-to-test` (合入后物理测试验证)<br>`/wdi-prune-or-archive` (关闭规格的归档与清理) | `/wdi-autopilot` (由 `/loop` 驱动的无人值守执行引擎) |
| **治理与诊断工具** | `/wdi-help` (上下文关卡导航指南)<br>`/wdi-explain-to-me` (系统架构解说)<br>`/wdi-decision` (技术决策记录 ADR)<br>`/wdi-question` (未决议题跟踪)<br>`/wdi-log` (工程活动日志记录)<br>`/wdi-report` (工期评估与进度汇报)<br>`/wdi-reconcile` (代码-文档偏差审计)<br>`/wdi-review` (独立同行评审)<br>`/wdi-systematic-debugging` (系统性根本原因排查)<br>`/wdi-upgrade` (语料库架构版本升级) | 派发独立只读评审及二次意见征询 |

---

## 仓库组织架构与规范约定

```text
.constitution/
  method/            方法核心引擎 — 每次框架更新均会覆盖；严禁直接修改
  project/           属于产品自有的定制规则及代码分析器 — 框架更新时完整保留
.control/
  registry/          唯一真理来源 (SSOT)：goals.yaml · specs.yaml · components.yaml
  decisions/         已采纳的技术决策与负责人授权委任 (DEC-*.md)
  memlog/            记录自主循环执行过程与决策的审计账本
  test-targets/      各端物理测试目标模板 (desktop.md, web.md, mobile.md)
.scratch/            当前活跃开发的规格说明工作区 (SPEC-*.md 与工单)
.archive/            已归档的历史规格目录，完整保留 RTM 审计追溯
.what/ & .how/       正在维护的核心语料库文件 (PRD, SRS, Blueprint, SDD)
.what-rendered/      面向人类审阅渲染的完整交付文件 (由 validate.py / wdi-report 编译)
```

---

## 贡献指南与架构基础

向 WDI Method 提交的每项贡献都必须回答一个基本问题：**这项改动是让审查层更加值得信赖，还是仅仅让文档变得更厚重？**

### 固定测试语料库与本地验证
所有针对验证器与框架的改进都必须通过内部固定语料库（`tests/fixture/`）的严格检验。在提交 PR 前请执行完整的测试套件：
```bash
npm test
```
测试套件要求 Python PEP 723 脚本（`validate.py`, `timeline.py`, `lifecycle.py`）、多平台同步及套件完整性保持 100% 绿灯。

### 公共通用开源包规则
WDI Method 发布至公共 npm 仓库。严禁泄露特定私有客户名称、商业产品标识、内部网络凭证或本地机器的绝对文件系统路径。

---

## 许可证与商标声明

- **代码许可：** 基于 [MIT 许可证](LICENSE) 发布。
- **隐私与离线优先：** 100% 纯本地离线运行。零遥测、零数据统计、无外部网络连接（详见 [PRIVACY.md](PRIVACY.md) 与 [SECURITY.md](SECURITY.md)）。
- **商标声明：** “Wira Delta Indonesia”、“WDI Method”及工作室标志系 PT Wira Delta Indonesia 之注册商标，与开源代码授权相互独立。
