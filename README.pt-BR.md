# WDI Method

> Uma camada de revisão sobre o BMad: documentos que um humano lê para verificar decisões técnicas antes de o código ser escrito, dimensionados para o que a mudança realmente merece.

[English](README.md) | [Bahasa Indonesia](README.id.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Español](README.es.md) | [Deutsch](README.de.md) | [Français](README.fr.md) | [Português (Brasil)](README.pt-BR.md) | [Русский](README.ru.md)  
[Website](https://wiradelta.com/wdi-method/docs/) | [Changelog](CHANGELOG.md) | [Contributing](CONTRIBUTING.md) | [License](LICENSE) | [Security](SECURITY.md) | [Privacy](PRIVACY.md)

---

> **Aviso de tradução:** Este arquivo é uma tradução de [README.md](README.md) fornecida apenas para fins de conveniência. Em caso de divergências ou conflitos de interpretação, a versão oficial em inglês (`README.md`) prevalece como fonte autoritativa. Toda a documentação técnica aprofundada e documentos jurídicos são mantidos em inglês.

O [BMad](https://github.com/bmad-code-org/BMAD-METHOD) escreve documentos para agentes de IA. O WDI Method adiciona documentos que muitos papéis já leem: casos de uso, diagramas C4, listas de API e de banco de dados, e documentos de design. Ele envolve o BMad sem substituí-lo: as habilidades do brief, do PRD, da UX e da arquitetura (`wdi-problem`, `wdi-product`, `wdi-ux` e `wdi-blueprint` para a espinha dorsal) entregam a redação a uma habilidade do BMad e depois verificam o resultado com base nos guias do método.

> Este repositório é **público e genérico**. NÃO DEVE conter nome de cliente, nome de produto comercial nem link para um repositório privado. A identidade do produto fica inteiramente no repositório que o instala.

---

## Desenvolvimento Guiado por IA (AiDD) vs. Vibe Coding

O vibe coding também usa especificações, mas não de forma consistente: cada sessão de prompts pode ser diferente, os documentos não têm estrutura e o processo não é mantido de forma sistemática. O resultado é eficiência e eficácia muito menores, e um risco real de acumular dívida técnica. Por isso é preciso um framework.

No WDI Method, o Desenvolvimento Guiado por IA (AiDD) segue uma ordem: promessas registradas como FR e casos de uso, depois os gates, depois a especificação dividida em tickets com `to-spec` e `to-tickets`, depois cada ticket construído com testes primeiro, depois um PR que o responsável revisa e faz merge.

Três camadas fazem o trabalho:

| Camada | Quem | O que faz |
|---|---|---|
| 1. Documentos para agentes | [BMad](https://github.com/bmad-code-org/BMAD-METHOD) | Escreve o product brief, o PRD, a UX e a espinha dorsal da arquitetura, cada um por meio de uma habilidade do BMad |
| 2. Camada de revisão | WDI Method | Envolve essas habilidades, adiciona os documentos que outros papéis leem, executa cinco gates humanos, liga Objetivo → FR → UC → Ticket → Teste e verifica o desvio do corpus |
| 3. Tickets e código | Motores ([mattpocock/skills](https://github.com/mattpocock/skills)) | `to-spec` e `to-tickets` dividem a especificação em tickets verticais; `implement` constrói cada um com testes primeiro |

### Documentos Seguem o Código (Documents Follow Code)

Um documento atrás do código está em seu estado esperado, não é um defeito. Quando o responsável escolheu o código em vez de um documento, é o documento que é corrigido. Um documento à frente do código, como uma especificação ainda não construída, também é normal.

---

## Instalação em 3 Passos

### Pré-requisitos

- Node.js 20 ou posterior.
- Git.
- [uv](https://docs.astral.sh/uv/), que executa os validadores Python 3.11+ do método.
- Uma plataforma de agentes: Claude Code, Cursor, Codex e outras plataformas de agentes.

Execute os três passos em ordem. O instalador para se o passo 1 ou o passo 2 não tiver sido feito. Todos os prompts oferecem valores padrão; pressionar <kbd>Enter</kbd> os aceita.

### Passo 1: Instalar o BMad Method
```bash
cd /path/to/your/product-repo
npx bmad-method install
```

### Passo 2: Adicionar os Seis Motores
Instale os motores no seu repositório (escolha "copy" ou "symlink"):
```bash
npx skills@latest add mattpocock/skills
```
*Selecione os seis motores que o método aciona:* `to-spec`, `to-tickets`, `implement`, `tdd`, `code-review` e `domain-modeling`.

> **Por que o plugin do Claude Code não basta:** Três dos seis motores (`to-spec`, `to-tickets`, `implement`) são distribuídos com `disable-model-invocation: true`. Em cada instalação e atualização, o WDI Method remove essa linha das cópias no seu repositório, para que `wdi-build` e `wdi-autopilot` possam executá-los. Ele não pode editar um plugin no nível do usuário, então o instalador para até que os motores estejam no repositório. `--skip-engines-check` pula essa verificação.

### Passo 3: Instalar o WDI Method
Inicia o instalador interativo e coloca as habilidades onde cada uma das suas plataformas de agentes as lê:
```bash
npx wdi-method
```
*(Não interativo: `npx wdi-method install --yes --agents claude-code --product "Your Product"`)*

> **O que o instalador muda no BMad:** O instalador também desativa a invocação pelo modelo em 13 habilidades de build e de sprint do BMad que os motores substituem, e adiciona as regras de negação correspondentes a `.claude/settings.json`. Você ainda pode executá-las digitando o comando.

### Seu Primeiro Comando: `/wdi-help`
Dentro do seu agente de codificação, execute:
```text
/wdi-help
```
`wdi-help` lê `.control/registry/` e informa o gate em que seu projeto está, as especificações abertas e a próxima habilidade, sem adivinhar a partir da conversa.

---

## Três Opções de Fluxo de Trabalho

O WDI Method dimensiona sua cerimônia de acordo com a escala e o risco da tarefa.

### Opção A: Trilha de Entrega Guiada (G1 a G5)
Para produtos novos, iniciativas grandes e mudanças de arquitetura. Você inicia a habilidade de cada gate; o agente indica a próxima e espera.

**Uma Decisão por Gate.** Cada gate decide uma coisa. De G1 a G4 você lê uma página renderizada; em G5 você lê as linhas RTM da especificação. Você responde a um checklist curto, e um único "não" em uma pergunta com estrela segura o gate.

| Gate | Decide | Habilidade | O que você lê | Decisão do responsável |
|---|---|---|---|---|
| **G1 Problem** | Qual é o problema, de quem ele é e por que merece trabalho | `/wdi-problem` | `.what-rendered/_product-brief/brief.md` | Aprovar a formulação do problema |
| **G2 Product** | O que é construído e como é a sensação de usá-lo | `/wdi-product`<br>`/wdi-ux` (opcional) | `.what-rendered/_prd/<slug>/prd.md` | Aprovar as promessas funcionais (FR) |
| **G3 Blueprint** | O quadro completo do produto, uma vez por produto | `/wdi-blueprint` | `.how-rendered/blueprint.md` | Aprovar a espinha dorsal da arquitetura |
| **G4 Component** | Como um componente é construído (pulado com `mode: catalog`) | `/wdi-component` | `.how-rendered/<pc>/SDD-<pc>.md` | Aprovar o design de software |
| **G5 Release** | Se está pronto e comprovado | `/wdi-build` | As linhas RTM da especificação em `.control/generated/` e a evidência de testes de cada ticket | Aceitar a especificação como pronta, ou devolvê-la |

**Refinar, Não Avançar.** Um único "não" em uma pergunta com estrela (★) do checklist segura o gate. Refine o documento e execute o gate de novo; não o aprove com o plano de corrigir depois.

#### Dois Campos que Nunca se Fundem
- **`mode`** define a profundidade dos documentos de cada componente. `catalog` (padrão): nada além do blueprint, e G4 é pulado. `outline`: fluxos completos para até 3 casos de uso, regras de negócio locais, um resumo de decisões. `guarded`: adiciona uma seção `Failure Behaviour` para cada fronteira e documentos de integração com terceiros. `deep`: adiciona análise de robustez, um contrato por endpoint, um dicionário de dados, diagramas de fluxo e máquinas de estado.
- **`risk_accepted`** define o rigor da revisão. `high` (você aceita muito risco): as lentes básicas de estrutura e de texto. `medium`: adiciona a lente de casos extremos. `low`: adiciona a lente de casos extremos, e o código precisa de dois revisores que não sejam quem o construiu.

Se um único campo definisse as duas coisas, a única forma de obter um documento enxuto seria registrar no registro de riscos mais risco do que você realmente aceita.

---

### Opção B: Operações Diárias Autônomas (Daily Tier)
Com a arquitetura estabelecida, o trabalho do dia a dia segue um ritmo diário por meio de quatro habilidades que você digita dentro do seu agente:

1. **`/wdi-daily-what-to-build [reviewer] <notes>`**  
   Transforma anotações de testes manuais, observações de QA ou relatórios de bugs em uma especificação ou um ticket revisado na branch de desenvolvimento, para uma execução posterior do autopilot. Para aí: nunca faz commit nem push, e nunca inicia o autopilot.
2. **`/wdi-daily-autopilot [self-review] [peer] [interval] [--skip-peer-review]`**  
   Verifica se há um mandato aceito e executa o preflight se não houver, resolve os revisores a partir da configuração local e inicia o loop (padrão `/loop 10m /wdi-autopilot`). O loop trabalha na branch `autopilot/<mandate-id>`, escreve o código com testes primeiro, registra cada decisão no seu livro de registro e termina com um PR pronto para revisão. O responsável faz o merge.
3. **`/wdi-daily-what-to-test [web <target> | mobile <target> | desktop]`**  
   Depois de um merge: sincroniza a branch de desenvolvimento, remove branches e worktrees já mesclados, prepara o app para testes manuais e monta um checklist a partir dos tickets fechados desde a última sincronização (`before_sync..HEAD`). Sem argumento, apenas sincroniza, remove e monta o checklist.
4. **`/wdi-prune-or-archive [--spec <id> | --all-closed] [--archive | --prune] [--dry-run]`**  
   Move especificações fechadas de `.scratch/` para `.archive/specs/`, ou as remove com `git rm`, por meio de `lifecycle.py`, que verifica primeiro e reverte em caso de falha. A linha da especificação permanece em `specs.yaml`. Sem argumento, ele pergunta.

---

### Opção C: Caminho Rápido (`/implement` Diretamente)
Uma correção pode pular todos os gates quando não altera nenhum FR, UC, AD-N nem o modelo de domínio, ocupa no máximo um ticket e não toca em dinheiro, dados pessoais nem integração com terceiros. Você executa `/implement` diretamente, sem habilidade envoltória. Se a correção acabar tocando um FR, o trabalho para e vira uma especificação de tamanho S (no máximo 3 tickets), que passa por `wdi-build`.

---

## Regras de Campo

Regras operacionais aprendidas ao executar loops de codificação autônomos em repositórios de produtos reais:

### 1. Construtor Fixado no Coordenador (`builder: coordinator`)
Em `wdi-daily-autopilot`, `roles.builder` em `.control/custom-dispatch.yaml` é fixado em `coordinator`. Delegar código a subagentes levou a relatórios de conclusão falsos (um subagente afirmando que os testes passaram sem ter editado nenhum arquivo). A sessão coordenadora escreve o código ela mesma, com testes primeiro.

### 2. Revisores Somente Leitura
Os revisores pares são executados em modo somente leitura. Eles questionam casos extremos e leem diffs, mas nunca alteram código nem executam builds; apenas a sessão coordenadora escreve. Com `risk_accepted: low`, pular a revisão por pares é recusado, porque ali o código precisa de dois revisores que não sejam quem o construiu.

### 3. Bloqueios de Arquivo no Windows (Desktop Process Gate)
No Windows, um binário do app em execução ou um daemon de build em segundo plano mantém handles de arquivo abertos, e então uma recompilação ou a exclusão de um worktree falha com `Access is denied`. Com o alvo `desktop`, `wdi-daily-what-to-test` verifica se o binário do app ainda está em execução antes de recompilar. Ele só fecha o app se a sua própria execução de smoke anterior o iniciou; caso contrário, informa o PID e para, para que você mesmo o feche. Ele nunca força o encerramento de um processo.

### 4. O Loop Roda na Própria Branch
A redação de especificações e tickets acontece na branch de desenvolvimento. O loop roda na própria branch, `autopilot/<mandate-id>`, em um worktree isolado ou em um checkout limpo usado apenas por essa execução. Ele nunca roda em um checkout compartilhado ou com alterações pendentes.

### 5. Uma Execução de Cloud CI por Execução do Autopilot
O loop faz um commit por ticket, e a suíte de testes local é a evidência durante a execução. O Cloud CI roda uma vez por execução do autopilot, no final: quando o único PR é marcado como pronto para revisão, ou quando o workflow é disparado uma vez. Os pushes durante a execução não iniciam nenhuma execução na nuvem.

### 6. Arquivos de Smoke Locais da Máquina
Os cursores de smoke (`.work/smoke/last-sync`) e os manifestos de runtime pertencem a uma máquina. O instalador adiciona `.work/smoke/` ao `.gitignore`, de modo que os arquivos de smoke locais nunca deixam a árvore de trabalho com alterações pendentes.

---

## Configuração (`custom-dispatch.yaml`)

Os comandos de runner e as flags de modelo específicos de cada máquina ficam em `.control/custom-dispatch.yaml`. O instalador o cria a partir de `.control/custom-dispatch.yaml.example` quando ele não existe, e o adiciona ao `.gitignore`; apenas o exemplo é commitado.

Um runner indicado como revisor DEVE ser somente leitura. A flag de somente leitura por CLI: `claude --permission-mode plan`, `kiro-cli --trust-tools=fs_read`, `cursor-agent --mode plan`. Todos os runners de exemplo do template a usam.

---

## Diretório de Habilidades (22)

O WDI Method instala 22 habilidades: 7 habilidades de gate, 5 para o daily tier (incluindo `wdi-autopilot`) e 10 que você executa a qualquer momento.

Como uma habilidade é iniciada:
- **Você a digita**: as quatro habilidades do daily tier e `wdi-explain-to-me` (elas trazem `disable-model-invocation: true`).
- **Você a digita, ou `wdi-autopilot` a executa sob um mandato aceito**: `wdi-build`. Ela não traz a flag `disable-model-invocation`, porque `wdi-autopilot` precisa invocá-la; a regra de que agentes não a iniciam por conta própria está na Method policy que o instalador escreve em `CLAUDE.md` e `AGENTS.md`.
- **Você a digita, ou o agente a indica e espera sua autorização**: as demais habilidades.
- **O agente pode executá-la por conta própria (somente leitura)**: `wdi-help`.
- **Disparada por `/loop` sob um mandato aceito**: `wdi-autopilot`. Sob um mandato, `wdi-autopilot` também executa as demais habilidades.

| Habilidade | O que faz | Como é iniciada |
|---|---|---|
| **Habilidades de gate** | | |
| `/wdi-init` | Antes de G1 e ao final de G2: configura registros, componentes, `mode` e `risk_accepted`, os dois mapas de estrutura, a verificação dos motores e os leitores de inventário. | Você a digita, ou o agente a indica |
| `/wdi-problem` | G1. Executa a habilidade de product brief do BMad e depois verifica o brief com base no guia do método. Nunca escreve o brief ela mesma. | Você a digita, ou o agente a indica |
| `/wdi-product` | G2. Executa a habilidade de PRD do BMad para um PRD novo ou uma promessa alterada e depois o verifica com base no guia do PRD. Nunca escreve o PRD ela mesma. | Você a digita, ou o agente a indica |
| `/wdi-ux` | Opcional, junto com G2. Executa a habilidade de UX do BMad e arquiva os resultados de design onde eles pertencem. Nunca escreve conteúdo de UX ela mesma. | Você a digita, ou o agente a indica |
| `/wdi-blueprint` | G3, uma vez por produto. O quadro completo do produto: casos de uso, atores, modelo de domínio, regras de negócio, glossário, a espinha dorsal da arquitetura, C4 e os inventários de API, tabelas e telas. | Você a digita, ou o agente a indica |
| `/wdi-component` | G4. A profundidade de um componente, tão profunda quanto o seu `mode` e não mais. Pulada com `mode: catalog`. | Você a digita, ou o agente a indica |
| `/wdi-build` | G5. Uma especificação de aberta a fechada: você executa `to-spec` e `to-tickets`, cada ticket chega a um PR verde e depois a especificação é fechada. Nunca faz merge. | Você a digita, ou `wdi-autopilot` a executa |
| **Daily tier** | | |
| `/wdi-daily-what-to-build` | Transforma anotações de testes manuais em uma especificação ou um ticket revisado para uma execução posterior do autopilot. Para antes de código, commit ou push. | Você a digita |
| `/wdi-daily-autopilot` | Verifica se há um mandato aceito (executa o preflight se não houver), resolve os revisores a partir da configuração local e inicia o loop, a cada 10 minutos por padrão. | Você a digita |
| `/wdi-autopilot` | O próprio loop: percorre cada FR sob um mandato aceito, em uma branch com um PR, e escreve cada decisão em um livro de registro. | Disparada por `/loop` sob um mandato aceito |
| `/wdi-daily-what-to-test` | Depois de um merge: sincroniza a branch de desenvolvimento, remove branches e worktrees já mesclados, prepara o app para testes manuais e monta um checklist a partir dos tickets fechados. | Você a digita |
| `/wdi-prune-or-archive` | Move especificações fechadas para `.archive/specs/` ou as remove com `git rm`, por meio de `lifecycle.py`, que verifica primeiro e reverte em caso de falha. A linha da especificação permanece em `specs.yaml`. | Você a digita |
| **A qualquer momento** | | |
| `/wdi-help` | Lê o registro de status e informa o gate atual, as especificações abertas e a próxima habilidade. | O agente pode executá-la por conta própria (somente leitura) |
| `/wdi-explain-to-me` | Faz a leitura antes de você decidir: investiga e depois informa você em seis seções fixas. Não escreve nenhum arquivo. | Você a digita |
| `/wdi-decision` | Abre, aceita e aplica uma decisão numerada (`DEC-`), e a leva para os documentos que ela rege. | Você a digita, ou o agente a indica |
| `/wdi-question` | Arquiva algo que não pode ser decidido agora em uma de quatro listas em `.control/questions/`, e o fecha quando a resposta chega. | Você a digita, ou o agente a indica |
| `/wdi-log` | Registra uma reunião encerrada ou um fato não técnico que limita o que pode ser construído. | Você a digita, ou o agente a indica |
| `/wdi-report` | Números sobre o projeto: progresso, estimativas, linhas de tarefas para um tracker, ou um brief ou PRD independente. Nunca inventa um número. | Você a digita, ou o agente a indica |
| `/wdi-reconcile` | Antes de um gate ou depois de um lote de mudanças: relata o desvio entre `.what`, `.how`, `.control` e as regras do método. Somente leitura. | Você a digita, ou o agente a indica |
| `/wdi-review` | Revisa qualquer documento do corpus, e deve ser executada antes de um gate para a espinha dorsal, o SRS, o SDD e o SPEC. Suas lentes seguem `risk_accepted`. Não serve para revisão de código. | Você a digita, ou o agente a indica |
| `/wdi-systematic-debugging` | Para qualquer bug, teste com falha ou build com falha, antes de propor uma correção: encontrar a causa raiz e testar uma hipótese por vez. | Você a digita, ou o agente a indica |
| `/wdi-upgrade` | Logo após `wdi-method update`: move documentos e arquivos de registro ainda no formato antigo para o novo e depois verifica se a validação está verde. | Você a digita, ou o agente a indica |

---

## Estrutura do Repositório

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

## Contribuição

Toda contribuição ao WDI Method responde a uma pergunta: **isto torna a camada de revisão mais confiável, ou apenas a torna mais grossa?** Veja [CONTRIBUTING.md](CONTRIBUTING.md).

### Fixture Corpus e Verificação Local
Mudanças nos validadores e no método são comprovadas contra o fixture corpus (`tests/fixture/`). Execute a suíte antes de abrir um pull request:
```bash
npm test
```
A suíte executa os quatro scripts Python PEP 723 (`validate.py`, `timeline.py`, `inventory.py`, `lifecycle.py`) contra o fixture, e verifica o registro de plataformas, os arquivos que cada plataforma recebe e a integridade do kit.

### Regra do Pacote Genérico Público
O WDI Method é publicado no registro público do npm. Ele nunca deve conter nomes de clientes privados, identidades de produtos comerciais, credenciais ou caminhos absolutos do sistema de arquivos.

---

## Licença e Privacidade

- **Licença do código:** [Licença MIT](LICENSE).
- **Privacidade:** O WDI Method em si não faz chamadas de rede; seu agente de codificação continua se comunicando com o provedor do modelo. Veja [PRIVACY.md](PRIVACY.md) e [SECURITY.md](SECURITY.md).

## The name and the icon

O texto em inglês abaixo é o que se aplica.

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

Usamos o mesmo método em projetos de clientes. [Fale com a Wira Delta Indonesia](https://wiradelta.com/studio/#contact).
