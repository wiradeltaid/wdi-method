# WDI Method

> BMad 위에 얹는 검토 계층입니다. 코드를 작성하기 전에 사람이 읽고 기술적 결정을 확인하는 문서를, 변경이 실제로 필요로 하는 규모에 맞춰 제공합니다.

[English](README.md) | [Bahasa Indonesia](README.id.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Español](README.es.md) | [Deutsch](README.de.md) | [Français](README.fr.md) | [Português (Brasil)](README.pt-BR.md) | [Русский](README.ru.md)  
[Website](https://wiradelta.id/wdi-method/docs/) | [Changelog](CHANGELOG.md) | [Contributing](CONTRIBUTING.md) | [License](LICENSE) | [Security](SECURITY.md) | [Privacy](PRIVACY.md)

---

> **번역 안내:** 본 문서는 편의를 위해 [README.md](README.md)를 번역한 참고용 문서입니다. 내용상 상충이나 해석의 차이가 있을 경우 영문 공식 문서(`README.md`)가 우선합니다. 세부 기술 문서 및 법적 문서는 영어로 관리됩니다.

[BMad](https://github.com/bmad-code-org/BMAD-METHOD)는 AI 에이전트를 위한 문서를 작성합니다. WDI Method는 여러 역할의 사람들이 이미 읽고 있는 문서를 추가합니다. 유스케이스, C4 다이어그램, API 및 데이터베이스 목록, 설계 문서입니다. WDI Method는 BMad를 대체하지 않고 감쌉니다. 브리프, PRD, UX, 아키텍처 스킬(`wdi-problem`, `wdi-product`, `wdi-ux`, 스파인의 경우 `wdi-blueprint`)은 작성을 BMad 스킬에 맡긴 뒤, 그 결과를 이 방법론의 가이드에 비추어 확인합니다.

> 본 저장소는 **공개 및 범용**입니다. 고객명, 상용 제품명 또는 비공개 저장소로 연결되는 링크를 포함해서는 안 됩니다(MUST NOT). 제품의 정체성은 전적으로 이 패키지를 설치하는 저장소에 있습니다.

---

## AI 주도 개발 (AiDD) vs. 바이브 코딩 (Vibe Coding)

바이브 코딩도 사양을 사용하지만 일관되지 않습니다. 프롬프트 세션마다 내용이 달라질 수 있고, 문서는 구조화되어 있지 않으며, 프로세스도 체계적으로 유지되지 않습니다. 그 결과 효율과 효과가 크게 떨어지고, 기술 부채가 쌓일 실제 위험이 생깁니다. 그래서 프레임워크가 필요합니다.

WDI Method에서 AI 주도 개발(AiDD)은 하나의 순서로 진행됩니다. 먼저 약속을 FR과 유스케이스로 등록하고, 다음으로 게이트를 거치고, 다음으로 `to-spec`과 `to-tickets`로 사양을 티켓으로 나누고, 다음으로 각 티켓을 테스트 우선으로 구축하고, 마지막으로 오너가 검토하고 병합하는 하나의 PR로 마무리합니다.

세 계층이 일을 나누어 맡습니다.

| 계층 | 담당 | 하는 일 |
|---|---|---|
| 1. 에이전트를 위한 문서 | [BMad](https://github.com/bmad-code-org/BMAD-METHOD) | 제품 브리프, PRD, UX, 아키텍처 스파인을 각각 BMad 스킬을 통해 작성 |
| 2. 검토 계층 | WDI Method | 그 스킬들을 감싸고, 다른 역할이 읽는 문서를 추가하고, 다섯 개의 사람 게이트를 운영하고, Goal → FR → UC → Ticket → Test를 연결하고, 코퍼스의 드리프트를 확인 |
| 3. 티켓과 코드 | 엔진([mattpocock/skills](https://github.com/mattpocock/skills)) | `to-spec`과 `to-tickets`가 사양을 수직 티켓으로 나누고, `implement`가 각 티켓을 테스트 우선으로 구축 |

### 문서는 코드를 따른다

코드보다 뒤처진 문서는 예상된 상태이며 결함이 아닙니다. 오너가 문서보다 코드를 선택한 경우, 수정되는 쪽은 문서입니다. 아직 구축되지 않은 사양처럼 코드보다 앞선 문서도 정상입니다.

---

## 3단계 설치

### 사전 요구 사항

- Node.js 20 이상.
- Git.
- [uv](https://docs.astral.sh/uv/). 이 방법론의 Python 3.11+ 검증기를 실행합니다.
- 에이전트 플랫폼: Claude Code, Cursor, Codex 및 기타 에이전트 플랫폼.

세 단계를 순서대로 실행하세요. 1단계 또는 2단계가 완료되지 않았으면 설치 프로그램이 멈춥니다. 모든 프롬프트에는 기본값이 있으며, <kbd>Enter</kbd>를 누르면 기본값을 받아들입니다.

### 1단계: BMad Method 설치
```bash
cd /path/to/your/product-repo
npx bmad-method install
```

### 2단계: 여섯 개의 엔진 추가
엔진을 저장소에 설치합니다("copy" 또는 "symlink" 중 하나를 선택).
```bash
npx skills@latest add mattpocock/skills
```
*이 방법론이 구동하는 여섯 개의 엔진을 모두 선택합니다:* `to-spec`, `to-tickets`, `implement`, `tdd`, `code-review`, `domain-modeling`.

> **Claude Code 플러그인만으로는 부족한 이유:** 여섯 개의 엔진 중 세 개(`to-spec`, `to-tickets`, `implement`)는 `disable-model-invocation: true`가 설정된 채로 배포됩니다. 설치와 업데이트 때마다 WDI Method는 저장소 안의 사본에서 그 줄을 제거하여 `wdi-build`와 `wdi-autopilot`가 이를 실행할 수 있게 합니다. 사용자 수준의 플러그인은 편집할 수 없으므로, 엔진이 저장소에 들어올 때까지 설치 프로그램이 멈춥니다. `--skip-engines-check`로 이 확인을 건너뛸 수 있습니다.

### 3단계: WDI Method 설치
대화형 설치 프로그램을 실행하고, 각 에이전트 플랫폼이 스킬을 읽는 위치에 스킬을 배치합니다.
```bash
npx wdi-method
```
*(비대화형: `npx wdi-method install --yes --agents claude-code --product "Your Product"`)*

> **설치 프로그램이 BMad에서 바꾸는 것:** 설치 프로그램은 엔진이 대체하는 13개의 BMad 빌드 및 스프린트 스킬에 대해 모델 호출을 끄고, 이에 맞는 거부 규칙을 `.claude/settings.json`에 추가합니다. 명령을 입력하면 여전히 실행할 수 있습니다.

### 첫 번째 명령어: `/wdi-help`
코딩 에이전트 안에서 다음을 실행합니다.
```text
/wdi-help
```
`wdi-help`는 `.control/registry/`를 읽고, 대화에서 추측하지 않고 프로젝트가 있는 게이트, 열려 있는 사양, 다음 스킬을 알려 줍니다.

---

## 세 가지 워크플로 옵션

WDI Method는 작업의 규모와 위험에 맞춰 절차의 무게를 조정합니다.

### 옵션 A: 가이드 딜리버리 트랙 (G1부터 G5까지)
새 제품, 주요 이니셔티브, 아키텍처 변경에 사용합니다. 각 게이트 스킬은 사용자가 시작하고, 에이전트는 다음 스킬을 알려 주고 기다립니다.

**게이트마다 하나의 결정.** 각 게이트는 한 가지를 결정합니다. G1부터 G4까지는 렌더링된 페이지 하나를 읽고, G5에서는 사양의 RTM 행을 읽습니다. 짧은 체크리스트에 답하며, 별표가 붙은 질문 하나에서라도 "아니요"가 나오면 게이트는 보류됩니다.

| 게이트 | 결정하는 것 | 스킬 | 읽는 것 | 오너의 결정 |
|---|---|---|---|---|
| **G1 Problem** | 문제가 무엇인지, 누구의 문제인지, 왜 작업할 가치가 있는지 | `/wdi-problem` | `.what-rendered/_product-brief/brief.md` | 문제 정의를 승인 |
| **G2 Product** | 무엇을 만드는지, 사용할 때 어떻게 느껴지는지 | `/wdi-product`<br>`/wdi-ux` (선택) | `.what-rendered/_prd/<slug>/prd.md` | 기능 약속(FR)을 승인 |
| **G3 Blueprint** | 제품의 전체 그림, 제품당 한 번 | `/wdi-blueprint` | `.how-rendered/blueprint.md` | 아키텍처 스파인을 승인 |
| **G4 Component** | 하나의 컴포넌트를 어떻게 만드는지 (`mode: catalog`에서는 건너뜀) | `/wdi-component` | `.how-rendered/<pc>/SDD-<pc>.md` | 소프트웨어 설계를 승인 |
| **G5 Release** | 완료되었고 입증되었는지 | `/wdi-build` | `.control/generated/`에 있는 사양의 RTM 행과 각 티켓의 테스트 증거 | 사양을 완료로 받아들이거나 되돌려 보냄 |

**진행하지 말고 다듬기.** 별표(★)가 붙은 체크리스트 질문 하나에서라도 "아니요"가 나오면 게이트는 보류됩니다. 문서를 다듬고 게이트를 다시 실행하세요. 나중에 고칠 계획으로 승인해서는 안 됩니다.

#### 결코 합쳐지지 않는 두 필드
- **`mode`**는 각 컴포넌트의 문서를 얼마나 깊게 쓸지 정합니다. `catalog`(기본값): 블루프린트 외에는 아무것도 쓰지 않으며 G4는 건너뜁니다. `outline`: 최대 3개 유스케이스의 전체 흐름, 로컬 비즈니스 규칙, 결정 요약. `guarded`: 모든 경계에 대한 `Failure Behaviour` 섹션과 서드파티 연동 문서를 추가합니다. `deep`: 견고성 분석, 엔드포인트별 계약, 데이터 사전, 흐름도, 상태 머신을 추가합니다.
- **`risk_accepted`**는 검토를 얼마나 엄격하게 할지 정합니다. `high`(많은 위험을 받아들임): 기본 구조 및 문장 관점. `medium`: 엣지 케이스 관점을 추가합니다. `low`: 엣지 케이스 관점을 추가하고, 코드에는 빌더가 아닌 검토자 두 명이 필요합니다.

하나의 필드가 둘 다 정한다면, 얇은 문서를 얻는 유일한 방법은 실제로 받아들이는 것보다 더 많은 위험을 위험 기록에 적는 것이 됩니다.

---

### 옵션 B: 자율 일일 운영 (Daily Tier)
아키텍처가 자리 잡으면, 일상 작업은 에이전트 안에서 입력하는 네 개의 스킬을 통해 매일의 리듬으로 진행됩니다.

1. **`/wdi-daily-what-to-build [reviewer] <notes>`**  
   수동 테스트 메모, QA 관찰 내용 또는 버그 보고를, 이후의 autopilot 실행을 위해 개발 브랜치 위의 검토된 사양이나 티켓으로 바꿉니다. 거기서 멈춥니다. 커밋, 푸시, autopilot 시작은 절대 하지 않습니다.
2. **`/wdi-daily-autopilot [self-review] [peer] [interval] [--skip-peer-review]`**  
   수락된 위임(mandate)이 있는지 확인하고 없으면 사전 점검(preflight)을 실행하며, 로컬 설정에서 검토자를 정하고, 루프를 시작합니다(기본값 `/loop 10m /wdi-autopilot`). 루프는 브랜치 `autopilot/<mandate-id>`에서 작업하고, 코드를 테스트 우선으로 작성하며, 모든 결정을 원장에 기록하고, 검토 준비가 된 하나의 PR로 끝납니다. 병합은 오너가 합니다.
3. **`/wdi-daily-what-to-test [web <target> | mobile <target> | desktop]`**  
   병합 후에: 개발 브랜치를 동기화하고, 병합된 브랜치와 워크트리를 정리하고, 수동 테스트를 위해 앱을 준비하고, 마지막 동기화 이후 닫힌 티켓(`before_sync..HEAD`)으로 체크리스트를 만듭니다. 인수가 없으면 동기화, 정리, 체크리스트 작성만 합니다.
4. **`/wdi-prune-or-archive [--spec <id> | --all-closed] [--archive | --prune] [--dry-run]`**  
   닫힌 사양을 `.scratch/`에서 `.archive/specs/`로 옮기거나 `git rm`으로 제거합니다. 이 작업은 `lifecycle.py`를 통해 이루어지며, `lifecycle.py`는 먼저 확인하고 실패하면 롤백합니다. 사양 행은 `specs.yaml`에 남습니다. 인수가 없으면 물어봅니다.

---

### 옵션 C: 패스트 패스 (`/implement` 직접 실행)
FR, UC, AD-N 또는 도메인 모델을 바꾸지 않고, 티켓이 최대 하나이며, 돈, 개인 데이터 또는 서드파티 연동에 닿지 않는 수정은 모든 게이트를 건너뛸 수 있습니다. 래퍼 스킬 없이 `/implement`를 직접 실행합니다. 수정이 FR에 닿는 것으로 드러나면 작업을 멈추고 크기 S의 사양(최대 3개 티켓)으로 바꾸어 `wdi-build`로 진행합니다.

---

## 현장 규칙

실제 제품 저장소에서 자율 코딩 루프를 운영하며 얻은 운영 규칙입니다.

### 1. 빌더는 코디네이터로 고정 (`builder: coordinator`)
`wdi-daily-autopilot`에서 `.control/custom-dispatch.yaml`의 `roles.builder`는 `coordinator`로 고정됩니다. 코드를 서브에이전트에 위임하자 거짓 완료 보고가 발생했습니다(서브에이전트가 파일을 하나도 편집하지 않고 테스트가 통과했다고 주장). 코디네이팅 세션이 직접 테스트 우선으로 코드를 작성합니다.

### 2. 읽기 전용 검토자
동료 검토자는 읽기 전용으로 실행됩니다. 엣지 케이스를 따져 묻고 diff를 읽지만, 코드를 바꾸거나 빌드를 실행하지는 않습니다. 쓰는 것은 코디네이팅 세션뿐입니다. `risk_accepted: low`에서는 동료 검토 생략이 거부됩니다. 그곳의 코드에는 빌더가 아닌 검토자 두 명이 필요하기 때문입니다.

### 3. Windows 파일 잠금 (데스크톱 프로세스 게이트)
Windows에서는 실행 중인 앱 바이너리나 백그라운드 빌드 데몬이 파일 핸들을 연 채로 두기 때문에, 다시 빌드하거나 워크트리를 삭제할 때 `Access is denied`로 실패합니다. `desktop` 대상에서 `wdi-daily-what-to-test`는 다시 빌드하기 전에 앱 바이너리가 아직 실행 중인지 확인합니다. 앱을 닫는 것은 자신의 이전 스모크 실행이 그 앱을 시작한 경우뿐입니다. 그렇지 않으면 PID를 보고하고 멈추어, 사용자가 직접 닫을 수 있게 합니다. 프로세스를 강제 종료하는 일은 없습니다.

### 4. 루프는 자기 브랜치에서 실행
사양과 티켓 작성은 개발 브랜치에서 이루어집니다. 루프는 자기 브랜치 `autopilot/<mandate-id>`에서, 격리된 워크트리 안이나 그 실행만 사용하는 깨끗한 체크아웃 안에서 실행됩니다. 공유된 체크아웃이나 커밋되지 않은 변경이 있는 체크아웃에서는 절대 실행되지 않습니다.

### 5. autopilot 실행당 클라우드 CI 실행은 한 번
루프는 티켓마다 커밋하며, 실행 중에는 로컬 테스트 스위트가 증거가 됩니다. 클라우드 CI는 autopilot 실행당 한 번, 마지막에 실행됩니다. 그 하나의 PR이 검토 준비 상태로 표시될 때, 또는 워크플로가 한 번 디스패치될 때입니다. 실행 중의 푸시는 클라우드 실행을 시작하지 않습니다.

### 6. 머신 로컬 스모크 파일
스모크 커서(`.work/smoke/last-sync`)와 런타임 매니페스트는 한 대의 머신에 속합니다. 설치 프로그램이 `.work/smoke/`를 `.gitignore`에 추가하므로, 머신 로컬 스모크 파일 때문에 작업 트리가 커밋되지 않은 변경 상태로 남는 일은 없습니다.

---

## 설정 (`custom-dispatch.yaml`)

머신별 러너 명령과 모델 플래그는 `.control/custom-dispatch.yaml`에 둡니다. 이 파일이 없으면 설치 프로그램이 `.control/custom-dispatch.yaml.example`에서 만들고 `.gitignore`에 추가합니다. 커밋되는 것은 example뿐입니다.

검토자로 지정된 러너는 읽기 전용이어야 합니다(MUST). CLI별 읽기 전용 플래그: `claude --permission-mode plan`, `kiro-cli --trust-tools=fs_read`, `cursor-agent --mode plan`. 템플릿의 예시 러너는 모두 이를 사용합니다.

---

## 스킬 목록 (22)

WDI Method는 22개의 스킬을 설치합니다. 게이트 스킬 7개, daily tier 스킬 5개(`wdi-autopilot` 포함), 언제든 실행할 수 있는 스킬 10개입니다.

스킬이 시작되는 방식:
- **사용자가 입력**: 네 개의 daily tier 스킬과 `wdi-explain-to-me`(이들은 `disable-model-invocation: true`를 가집니다).
- **사용자가 입력하거나, 수락된 위임 아래에서 `wdi-autopilot`가 실행**: `wdi-build`. `wdi-autopilot`가 이를 호출해야 하므로 `disable-model-invocation` 플래그를 가지지 않습니다. 에이전트가 스스로 이를 시작하지 않는다는 규칙은 설치 프로그램이 `CLAUDE.md`와 `AGENTS.md`에 쓰는 Method policy에 있습니다.
- **사용자가 입력하거나, 에이전트가 알려 주고 사용자의 승인을 기다림**: 나머지 스킬.
- **에이전트가 스스로 실행할 수 있음(읽기 전용)**: `wdi-help`.
- **수락된 위임 아래에서 `/loop`가 실행**: `wdi-autopilot`. 위임 아래에서는 `wdi-autopilot`가 다른 스킬도 실행합니다.

| 스킬 | 하는 일 | 시작 방식 |
|---|---|---|
| **게이트 스킬** | | |
| `/wdi-init` | G1 전과 G2 끝에: 레지스트리, 컴포넌트, `mode`와 `risk_accepted`, 두 개의 구조 맵, 엔진 확인, 인벤토리 리더를 준비합니다. | 사용자가 입력하거나, 에이전트가 알려 줌 |
| `/wdi-problem` | G1. BMad의 제품 브리프 스킬을 실행한 뒤, 브리프를 이 방법론의 가이드에 비추어 확인합니다. 브리프를 직접 쓰지 않습니다. | 사용자가 입력하거나, 에이전트가 알려 줌 |
| `/wdi-product` | G2. 새 PRD나 바뀐 약속에 대해 BMad의 PRD 스킬을 실행한 뒤, PRD 가이드에 비추어 확인합니다. PRD를 직접 쓰지 않습니다. | 사용자가 입력하거나, 에이전트가 알려 줌 |
| `/wdi-ux` | 선택, G2와 함께. BMad의 UX 스킬을 실행하고 설계 결과를 제자리에 정리합니다. UX 내용을 직접 쓰지 않습니다. | 사용자가 입력하거나, 에이전트가 알려 줌 |
| `/wdi-blueprint` | G3, 제품당 한 번. 제품 전체 그림: 유스케이스, 액터, 도메인 모델, 비즈니스 규칙, 용어집, 아키텍처 스파인, C4, 그리고 API, 테이블, 화면 인벤토리. | 사용자가 입력하거나, 에이전트가 알려 줌 |
| `/wdi-component` | G4. 하나의 컴포넌트의 깊이로, 그 `mode`가 요구하는 만큼만 깊게 쓰고 그 이상은 쓰지 않습니다. `mode: catalog`에서는 건너뜁니다. | 사용자가 입력하거나, 에이전트가 알려 줌 |
| `/wdi-build` | G5. 하나의 사양을 열림부터 닫힘까지: 사용자가 `to-spec`과 `to-tickets`를 실행하고, 각 티켓이 녹색 PR에 도달한 뒤 사양이 닫힙니다. 병합은 하지 않습니다. | 사용자가 입력하거나, `wdi-autopilot`가 실행 |
| **Daily tier** | | |
| `/wdi-daily-what-to-build` | 수동 테스트 메모를 이후의 autopilot 실행을 위한 검토된 사양이나 티켓으로 바꿉니다. 코드, 커밋, 푸시 전에 멈춥니다. | 사용자가 입력 |
| `/wdi-daily-autopilot` | 수락된 위임이 있는지 확인하고(없으면 사전 점검 실행), 로컬 설정에서 검토자를 정하고, 기본적으로 10분마다 도는 루프를 시작합니다. | 사용자가 입력 |
| `/wdi-autopilot` | 루프 자체: 하나의 수락된 위임 아래에서, 하나의 브랜치와 하나의 PR로 모든 FR을 처리하고, 모든 결정을 하나의 원장에 기록합니다. | 수락된 위임 아래에서 `/loop`가 실행 |
| `/wdi-daily-what-to-test` | 병합 후에: 개발 브랜치를 동기화하고, 병합된 브랜치와 워크트리를 정리하고, 수동 테스트를 위해 앱을 준비하고, 닫힌 티켓으로 체크리스트를 만듭니다. | 사용자가 입력 |
| `/wdi-prune-or-archive` | 닫힌 사양을 `.archive/specs/`로 옮기거나 `git rm`으로 제거합니다. 이 작업은 `lifecycle.py`를 통해 이루어지며, 먼저 확인하고 실패하면 롤백합니다. 사양 행은 `specs.yaml`에 남습니다. | 사용자가 입력 |
| **언제든** | | |
| `/wdi-help` | 상태 레지스트리를 읽고 현재 게이트, 열려 있는 사양, 다음 스킬을 알려 줍니다. | 에이전트가 스스로 실행할 수 있음(읽기 전용) |
| `/wdi-explain-to-me` | 사용자가 결정하기 전에 읽는 일을 해 둡니다: 조사한 뒤 여섯 개의 고정된 섹션으로 브리핑합니다. 파일을 쓰지 않습니다. | 사용자가 입력 |
| `/wdi-decision` | 번호가 붙은 결정(`DEC-`)을 열고, 수락하고, 적용하며, 그 결정이 규율하는 문서에 반영합니다. | 사용자가 입력하거나, 에이전트가 알려 줌 |
| `/wdi-question` | 지금 결정할 수 없는 사항을 `.control/questions/`의 네 목록 중 하나에 넣고, 답이 나오면 닫습니다. | 사용자가 입력하거나, 에이전트가 알려 줌 |
| `/wdi-log` | 끝난 회의, 또는 만들 수 있는 것을 제한하는 비기술적 사실을 기록합니다. | 사용자가 입력하거나, 에이전트가 알려 줌 |
| `/wdi-report` | 프로젝트에 관한 숫자: 진행 상황, 추정치, 트래커용 작업 행, 또는 독립된 브리프나 PRD. 숫자를 지어내지 않습니다. | 사용자가 입력하거나, 에이전트가 알려 줌 |
| `/wdi-reconcile` | 게이트 전이나 일련의 변경 후에: `.what`, `.how`, `.control`과 이 방법론의 규칙 사이의 드리프트를 보고합니다. 읽기 전용입니다. | 사용자가 입력하거나, 에이전트가 알려 줌 |
| `/wdi-review` | 어떤 코퍼스 문서든 검토하며, 스파인, SRS, SDD, SPEC에 대해서는 게이트 전에 반드시 실행해야 합니다. 관점은 `risk_accepted`를 따릅니다. 코드 리뷰용이 아닙니다. | 사용자가 입력하거나, 에이전트가 알려 줌 |
| `/wdi-systematic-debugging` | 모든 버그, 실패한 테스트, 실패한 빌드에 대해 수정을 제안하기 전에: 근본 원인을 찾고 한 번에 하나의 가설을 검증합니다. | 사용자가 입력하거나, 에이전트가 알려 줌 |
| `/wdi-upgrade` | `wdi-method update` 직후에: 아직 예전 형태인 문서와 레지스트리 파일을 새 형태로 옮긴 뒤, 검증이 녹색인지 확인합니다. | 사용자가 입력하거나, 에이전트가 알려 줌 |

---

## 저장소 구조

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

## 기여

WDI Method에 대한 모든 기여는 한 가지 질문에 답합니다. **이것이 검토 계층을 더 신뢰할 수 있게 만드는가, 아니면 더 두껍게만 만드는가?** [CONTRIBUTING.md](CONTRIBUTING.md)를 참고하세요.

### 픽스처 코퍼스와 로컬 검증
검증기와 방법론의 변경은 픽스처 코퍼스(`tests/fixture/`)에 대해 입증합니다. 풀 리퀘스트를 열기 전에 테스트 스위트를 실행하세요.
```bash
npm test
```
테스트 스위트는 네 개의 Python PEP 723 스크립트(`validate.py`, `timeline.py`, `inventory.py`, `lifecycle.py`)를 픽스처에 대해 실행하고, 플랫폼 레지스트리, 각 플랫폼이 받는 파일, 키트의 무결성을 확인합니다.

### 공개 범용 패키지 규칙
WDI Method는 공개 npm 레지스트리에 게시됩니다. 비공개 고객명, 상용 제품 정체성, 자격 증명, 절대 파일 시스템 경로를 절대 포함해서는 안 됩니다.

---

## 라이선스와 개인정보

- **코드 라이선스:** [MIT License](LICENSE).
- **개인정보:** WDI Method 자체는 네트워크 호출을 하지 않습니다. 다만 코딩 에이전트는 여전히 모델 제공자와 통신합니다. [PRIVACY.md](PRIVACY.md)와 [SECURITY.md](SECURITY.md)를 참고하세요.

## The name and the icon

아래의 영어 원문이 적용되는 텍스트입니다.

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

저희는 고객 프로젝트에도 같은 방법론을 사용합니다. [Wira Delta Indonesia에 문의하기](https://wiradelta.id/#contact).
