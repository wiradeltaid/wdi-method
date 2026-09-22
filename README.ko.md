# WDI Method

> BMad가 얇게 남겨둔 검토 계층 — 코드가 작성되기 전에 사람이 기술적 결정을 검증할 수 있는 검증 가능한 사양 프레임워크로, 실제 변경 규모에 적합한 문서 깊이를 제공합니다.

[English](README.md) | [Bahasa Indonesia](README.id.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Español](README.es.md) | [Deutsch](README.de.md) | [Français](README.fr.md) | [Português (Brasil)](README.pt-BR.md) | [Русский](README.ru.md)  
[Website](https://wiradelta.id/wdi-method) | [Changelog](CHANGELOG.md) | [Contributing](CONTRIBUTING.md) | [License](LICENSE) | [Security](SECURITY.md) | [Privacy](PRIVACY.md)

---

> **번역 안내:** 본 문서는 편의를 위해 [README.md](README.md)를 번역한 참고용 문서입니다. 내용상 상충이나 해석의 차이가 있을 경우 영문 공식 문서(`README.md`)가 우선합니다. 세부 기술 문서 및 법적 문서는 영어로 관리됩니다.

[BMad](https://github.com/bmad-code-org/BMAD-METHOD)는 *무엇을* 구축하고 솔루션을 *어떻게* 체계화할지 결정합니다. WDI Method는 이를 대체하는 것이 아니라 감싸 안으며, 고수준의 아키텍처 결정과 실제 작동하는 코드 사이의 검증 가능한 거버넌스 계층을 제공합니다: 요구사항 레지스트리, 유스케이스 카탈로그, 컴포넌트 경계, 자동 드리프트 검증기 및 원활한 자율 데일리 루프.

> 본 저장소는 **공개 및 범용** 오픈소스 프로젝트입니다. 특정 고객명, 상용 제품명 또는 비공개 저장소로 연결되는 링크를 절대 포함해서는 안 됩니다. 제품의 정체성은 이 패키지를 설치하는 개별 저장소에서 완전히 정의됩니다.

---

## 전체 개요: AI 주도 엔지니어링 개발 (AiDD) vs. 무분별한 코딩 (Vibe Coding)

사양과 검증이 없는 추측성 프롬프트 작성(이른바 "Vibe Coding")은 장기 프로덕션 시스템에서 반드시 실패합니다: AI 코딩 에이전트는 맥락을 잃고, 완료 상태를 왜곡하며(환각), 요구사항 경계를 흐리게 만듭니다. WDI Method는 세 가지 아키텍처 레이어를 통해 규율 있는 **AI 주도 개발(Ai-Driven Development - AiDD)**을 확립합니다:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. 의도 및 제품 전략: BMad Method                                      │
│    사용자 문제 발견, 제품 브리프 및 아키텍처 초안 작성                  │
├─────────────────────────────────────────────────────────────────────────┤
│ 2. 검증 가능한 검토 계층: WDI Method (SSOT)                             │
│    5단계 휴먼 게이트 관리, 목표 → FR → UC → 티켓 → 테스트 체인 연결,   │
│    자동화된 드리프트 검증기 실행 및 일일 자율 엔지니어링 루프 조율       │
├─────────────────────────────────────────────────────────────────────────┤
│ 3. 슬라이싱 및 구현: 스킬 엔진 (mattpocock/skills)                      │
│    to-spec 및 to-tickets로 수직 추적자 분할; implement는 TDD 사이클 실행 │
└─────────────────────────────────────────────────────────────────────────┘
```

### 황금 불변 원칙: 문서는 코드를 따른다 (Documents Follow Code)
문서는 이미 수행된 작업이 남긴 기록입니다. 의사결정 기록이나 요구사항 항목이 코드와 모순될 경우, **코드가 우선하며 문서가 수정되어야 합니다**. 레거시 문서에 맞추기 위해 코드를 변형하지 않습니다. 단순히 코드보다 뒤처진 문서는 정상적인 상태이며, 치명적인 오류를 유발하지 않는 한 작업 흐름을 차단하지 않습니다.

---

## 10분 퀵스타트

제품 저장소에 세 단계로 WDI Method를 순차적으로 설치합니다. 모든 프롬프트는 합리적인 기본값을 제공하며, <kbd>Enter</kbd>를 누르면 기본값이 적용됩니다.

### 1단계: BMad Method 설치
제품 저장소에 디스커버리 엔진을 설치합니다:
```bash
cd /path/to/your/product-repo
npx bmad-method install
```

### 2단계: 6가지 티켓 엔진 추가
실행 엔진을 저장소에 직접 설치합니다("copy" 또는 "symlink" 선택):
```bash
npx skills@latest add mattpocock/skills
```
*프레임워크에서 구동하는 6가지 엔진을 모두 선택합니다:* `to-spec`, `to-tickets`, `implement`, `tdd`, `code-review`, `domain-modeling`.

> **Claude Code 플러그인만으로는 부족한 이유:** 업스트림 엔진은 `disable-model-invocation: true` 플래그와 함께 배포됩니다. WDI Method는 로컬 복사본에서 이 플래그를 자동으로 제거하여 자율 루프가 사람의 개입 없이 실행될 수 있도록 합니다. 사용자 수준 플러그인은 저장소 단위에서 수정할 수 없습니다.

### 3단계: WDI Method 설치
대화형 설치 프로그램을 실행하고 사용하는 에이전트 플랫폼(Claude Code, Cursor 등) 전반에 걸쳐 스킬을 구성합니다:
```bash
npx wdi-method
```
*(자동화된 CI 환경: `npx wdi-method install --yes --agents claude --product "Your Product"`)*

### 첫 번째 명령어: `/wdi-help`
AI 코딩 에이전트 내부에서 다음 명령을 실행합니다:
```text
/wdi-help
```
`wdi-help`는 대화 맥락을 추측하지 않고 `.control/registry/`를 검사하여 프로젝트가 현재 위치한 정확한 게이트를 안내합니다.

---

## 세 가지 작업 흐름 옵션

WDI Method는 작업의 규모와 위험도에 맞춰 거버넌스를 조정합니다:

### 옵션 A: 가이드 딜리버리 트랙 (신규 프로젝트 및 G1–G5)
새로운 제품, 주요 이니셔티브 및 아키텍처 변경을 위한 트랙입니다. 사람이 게이트당 **하나의 렌더링된 페이지**를 읽고 *진행할지 다듬을지* 결정합니다.

| 게이트 | 해결하는 질문 | 호출 스킬 | 검토하는 렌더링 페이지 | 소유자 결정 |
|---|---|---|---|---|
| **G1 — 문제** | 이 문제가 실재하며 작업할 가치가 있는가? | `/wdi-problem` | `.what-rendered/_product-brief/brief.md` | 문제 프레이밍 승인 |
| **G2 — 제품** | 무엇을 만들고 사용자 인터페이스는 어떠한가? | `/wdi-product`<br>`/wdi-ux` | `.what-rendered/_prd/<slug>/prd.md` | 기능적 요구사항(FR) 승인 |
| **G3 — 청사진** | 전체 아키텍처가 견고하게 유지되는가? *(저장소당 1회)* | `/wdi-blueprint` | `.how-rendered/blueprint.md` | 아키텍처 척추 승인 |
| **G4 — 컴포넌트** | 이 컴포넌트는 어떻게 구축되는가? *(catalog 모드 제외)* | `/wdi-component` | `.how-rendered/<pc>/SDD-<pc>.md` | 소프트웨어 설계 승인 |
| **G5 — 빌드** | 티켓 슬라이스가 구축, 검증 및 입증되었는가? *(사양별)* | `/wdi-build` | 테스트 러너 출력 (Red → Green) | 머지된 코드 수락 |

#### 결코 하나로 합쳐지지 않는 두 개의 다이얼: Mode vs. Risk
- **`mode`**는 게이트의 존재 여부를 설정합니다(`catalog`는 G4를 건너뛰며, `guarded` 및 `deep`은 철저한 SDD를 요구합니다).
- **`risk_accepted`**는 필요한 검토 증명 수준을 설정합니다(`low`, `medium`, `high`). 이를 하나의 다이얼로 합치면 단순한 컴포넌트가 관료주의에 갇히거나 고위험 변경 사항이 검증을 우회하게 됩니다.

---

### 옵션 B: 자율 일일 운영 (Fase 4 Daily Tier)
아키텍처가 확립된 후, 일상적인 엔지니어링은 연속적인 일일 리듬으로 작동합니다:

1. **`/wdi-daily-what-to-build [reviewer] <notes>`**:  
   수동 테스트 노트, QA 관찰 사항 또는 버그 리포트를 정형화된 사양으로 변환합니다. 요구사항을 분류하고 티켓을 작성하며 읽기 전용 자문 검토를 요청합니다.
2. **`/wdi-daily-autopilot [self-review] [peer] [interval]`**:  
   승인된 위임하에 자율 엔지니어링 루틴을 실행합니다(기본값: `/loop 10m /wdi-autopilot`). TDD 사이클을 실행하고 원장을 기록합니다.
3. **`/wdi-daily-what-to-test [web|mobile|desktop]`**:  
   머지 후 물리 테스트 코디네이터입니다. 브랜치를 동기화하고 머지된 작업 트리를 정리하며 git 델타에서 실행 가능한 물리 테스트 체크리스트를 도출합니다.
4. **`/wdi-prune-or-archive [spec-id] [--archive|--prune]`**:  
   완료된 사양을 안전하게 보관하거나 정리하면서 100% RTM 추적성을 유지합니다.

---

### 옵션 C: 패스트 패스 (직접 `/implement` 실행)
FR, UC, AD-N 또는 도메인 모델을 건드리지 않는 사소한 버그 수정은 모든 문서 게이트를 건너뛰고 `/implement`를 직접 실행합니다. 기능 요구사항을 건드리는 순간 즉시 중단되고 명시적 사양 `S`로 전환됩니다.

---

## 실전 필드 팁 및 운영 지식

실제 다중 에이전트 환경에서 검증된 핵심 규칙:

1. **빌더 코디네이터 고정 (`builder: coordinator`):** `wdi-daily-autopilot`에서 빌더 역할은 코디네이터 세션이 직접 TDD 사이클로 코드를 작성합니다. 하위 에이전트에 코드 작성을 위임하면 테스트 통과 상태를 허위 보고하는 환각 현상이 발생합니다.
2. **독립 자문 리뷰어:** 동료 리뷰어(Terra 등)는 반드시 읽기 전용 모드(`--trust-tools=fs_read` / `--mode plan`)로 작동하여 코드를 직접 변형하지 않고 자문 의견만 제시합니다. 단일 작성자(Single-Writer) 원칙을 철저히 준수합니다.
3. **Windows 파일 잠금 방지 (Process Gating):** Windows에서는 백그라운드 프로세스가 파일 핸들을 점유하여 컴파일 또는 워크트리 정리 시 `Access is denied (Exit code 5/32)` 오류를 유발합니다. `wdi-daily-what-to-test`는 컴파일 전 잔류 프로세스를 감지하고 종료합니다.
4. **Git 워크트리 격리 필수:** 자율 코딩 루프(`wdi-autopilot`)는 반드시 독립된 git 워크트리(`autopilot/<mandate-id>`)에서 실행되어야 합니다. 메인 작업 트리에서 방치된 루프를 실행하지 마십시오.
5. **PR당 단일 Cloud CI 트리거:** 자율 루프는 로컬에서 티켓별로 커밋합니다. 모든 이터레이션마다 Cloud CI를 실행하면 월간 러너 한도가 소진됩니다. 로컬 테스트가 권위 있는 증거를 제공하며, Cloud CI는 PR이 검토 준비 상태가 되었을 때 한 번만 트리거합니다.
6. **임시 스모크 아티팩트 관리:** 스모크 테스트 커서와 런타임 매니페스트는 로컬 전용입니다. `.work/smoke/`가 `.gitignore`에 등록되어 있는지 확인하십시오.

---

## 22개 공식 스킬 디렉토리

WDI Method는 기능 도메인과 호출 권한에 따라 체계화된 22개 공식 스킬을 제공합니다:

| 도메인 | 사용자 호출 스킬 (개발자 직접 명령) | 모델 호출 / 에이전트 조율 스킬 |
|---|---|---|
| **딜리버리 및 아키텍처 (G1–G5)** | `/wdi-init`, `/wdi-problem`, `/wdi-product`, `/wdi-ux`, `/wdi-blueprint`, `/wdi-component`, `/wdi-build` | 게이트 전환에 따라 코디네이터가 순차 구동 |
| **자율 일일 운영** | `/wdi-daily-what-to-build`, `/wdi-daily-autopilot`, `/wdi-daily-what-to-test`, `/wdi-prune-or-archive` | `/wdi-autopilot` (`/loop` 기반 자율 루프 엔진) |
| **거버넌스 및 진단** | `/wdi-help`, `/wdi-explain-to-me`, `/wdi-decision`, `/wdi-question`, `/wdi-log`, `/wdi-report`, `/wdi-reconcile`, `/wdi-review`, `/wdi-systematic-debugging`, `/wdi-upgrade` | 자문형 동료 검토 및 세컨드 오피니언 디스패치 |

---

## 저장소 구조 및 불변 원칙

```text
.constitution/
  method/            메소드 엔진 — 업데이트 시마다 덮어쓰임; 직접 편집 금지
  project/           프로덕트 소유 규칙 및 커스텀 인벤토리 리더 — 업데이트 시 보존됨
.control/
  registry/          단일 진실 공급원 (SSOT): goals.yaml · specs.yaml · components.yaml
  decisions/         승인된 의사결정 및 위임 문서 (DEC-*.md)
  memlog/            자율 루프 의사결정을 기록하는 감사 원장
  test-targets/      물리 테스트 템플릿 (desktop.md, web.md, mobile.md)
.scratch/            활성 사양 작업 영역 (SPEC-*.md 및 티켓)
.archive/            RTM 감사 추적성을 보존하며 보관된 과거 사양
.what/ & .how/       작업 코퍼스 문서 (PRD, SRS, Blueprint, SDD)
.what-rendered/      렌더링된 산출물 (validate.py / wdi-report 생성)
```

---

## 기여 및 아키텍처 기초

WDI Method에 대한 모든 기여는 다음 한 가지 질문에 답해야 합니다: **이 변경 사항이 검토 계층을 더 신뢰할 수 있게 만드는가, 아니면 단순히 더 두껍게 만드는가?**

### 픽스처 코퍼스 및 로컬 검증
모든 유효성 검사기 및 프레임워크 변경 사항은 내부 픽스처 코퍼스(`tests/fixture/`)에서 검증됩니다. 풀 리퀘스트를 제출하기 전에 전체 테스트 스위트를 실행하십시오:
```bash
npm test
```

### 공개 범용 패키지 규칙
WDI Method는 공개 npm 레지스트리에 게시됩니다. 비공개 고객 이름, 상업적 제품 식별자, 내부 네트워크 자격 증명 또는 로컬 파일 시스템 경로가 절대 유출되어서는 안 됩니다.

---

## 라이선스 및 상표권 고지

- **코드 라이선스:** [MIT License](LICENSE)에 따라 배포됩니다.
- **개인정보 보호 및 원격 측정:** 100% 오프라인 우선. 원격 측정 0, 외부 네트워크 소켓 0 ([PRIVACY.md](PRIVACY.md) 및 [SECURITY.md](SECURITY.md) 참조).
- **상표권 고지:** "Wira Delta Indonesia", "WDI Method" 및 스튜디오 브랜드 모노그램은 PT Wira Delta Indonesia의 상표이며 오픈소스 코드 라이선스와 별도로 보호됩니다.
