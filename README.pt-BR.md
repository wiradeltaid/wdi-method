# WDI Method

> A camada de revisão que o BMad mantém enxuta — especificações verificáveis lidas por humanos para validar decisões técnicas antes da escrita do código, dimensionadas para o impacto real da mudança.

[English](README.md) | [Bahasa Indonesia](README.id.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Español](README.es.md) | [Deutsch](README.de.md) | [Français](README.fr.md) | [Português (Brasil)](README.pt-BR.md) | [Русский](README.ru.md)  
[Website](https://wiradelta.id/wdi-method) | [Changelog](CHANGELOG.md) | [Contributing](CONTRIBUTING.md) | [License](LICENSE) | [Security](SECURITY.md) | [Privacy](PRIVACY.md)

---

> **Aviso de tradução:** Este arquivo é uma tradução de [README.md](README.md) fornecida apenas para fins de conveniência. Em caso de divergências ou conflitos de interpretação, a versão oficial em inglês (`README.md`) prevalece como fonte autoritativa. Toda a documentação técnica aprofundada e documentos jurídicos são mantidos em inglês.

O [BMad](https://github.com/bmad-code-org/BMAD-METHOD) decide *o que* construir e *como* estruturar soluções robustas. O WDI Method o envolve — sem substituí-lo — fornecendo a camada de governança verificável entre decisões arquiteturais de alto nível e o código em produção: registros de requisitos, catálogos de casos de uso, limites de componentes, validadores automáticos de desvio e loops diários autônomos sem atrito.

> Este repositório é **público e genérico**. NÃO DEVE conter nomes de clientes privados, marcas de produtos comerciais nem links para repositórios privados. A identidade do produto é definida inteiramente no repositório que instala este pacote.

---

## Visão Panorâmica: Desenvolvimento Guiado por IA (AiDD) vs. Vibe Coding

O desenvolvimento baseado em prompting especulativo ("vibe coding") inevitavelmente falha em sistemas de produção de longo prazo: agentes de codificação perdem o contexto, alucinam estados de conclusão e diluem os limites dos requisitos. O WDI Method estabelece um **Desenvolvimento Disciplinado Guiado por IA (AiDD)** por meio de uma tríade arquitetural em três camadas:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. Intenção e Estratégia de Produto: BMad Method                        │
│    Descoberta de problemas do usuário, elaboração de briefs e arquit.   │
├─────────────────────────────────────────────────────────────────────────┤
│ 2. Camada de Revisão Verificável: WDI Method (SSOT)                     │
│    Governa 5 portões humanos, vincula Meta → FR → UC → Tickets → Testes,│
│    executa validadores de desvio e orquestra loops diários autônomos    │
├─────────────────────────────────────────────────────────────────────────┤
│ 3. Fatiamento e Implementação: Motores de Habilidades (mattpocock)      │
│    to-spec & to-tickets fatiam traçadores verticais; implement roda TDD │
└─────────────────────────────────────────────────────────────────────────┘
```

### O Invariante Dourado: Documentos Seguem o Código (Documents Follow Code)
Os documentos são o registro deixado pelo trabalho que já foi executado. Quando um registro de decisão ou linha de requisito contradiz o código, **o código vence e o documento é corrigido**. O código nunca é mutado para se adequar a documentações obsoletas. Um documento meramente atrasado em relação ao código está em seu estado esperado e nunca bloqueia a entrega, a menos que traga um erro crítico.

---

## Início Rápido em 10 Minutos

Instale o WDI Method no repositório do seu produto em três etapas sequenciais. Todos os prompts oferecem padrões sensatos; pressione <kbd>Enter</kbd> para aceitá-los.

### Passo 1: Instalar o BMad Method
Instala o motor de descoberta no seu repositório:
```bash
cd /caminho/para/seu/repositorio-de-produto
npx bmad-method install
```

### Passo 2: Adicionar os Seis Motores de Tickets
Instale os motores de execução diretamente no seu repositório (escolha "copy" ou "symlink"):
```bash
npx skills@latest add mattpocock/skills
```
*Selecione todos os seis motores orientados pelo método:* `to-spec`, `to-tickets`, `implement`, `tdd`, `code-review`, e `domain-modeling`.

> **Por que o plugin do Claude Code não basta:** Os motores upstream são distribuídos com `disable-model-invocation: true`. O WDI Method remove automaticamente essa restrição das cópias locais para que os loops autônomos possam ser executados sem confirmações manuais. Um plugin no nível do usuário não pode ser editado pelo repositório.

### Passo 3: Instalar o WDI Method
Inicia o instalador interativo e configura as habilidades em suas plataformas de agentes (Claude Code, Cursor, etc.):
```bash
npx wdi-method
```
*(Para ambientes de CI automatizados: `npx wdi-method install --yes --agents claude --product "Seu Produto"`)*

### Seu Primeiro Comando: `/wdi-help`
Dentro do seu agente de codificação por IA, execute:
```text
/wdi-help
```
O `wdi-help` inspeciona `.control/registry/` e informa o portão exato em que seu projeto se encontra, sem adivinhar a partir do histórico de conversa.

---

## Três Opções de Fluxo de Trabalho

O WDI Method adapta o rigor ao escopo e risco de cada tarefa:

### Opção A: Trilha de Entrega Guiada (Novas Iniciativas e G1–G5)
Para novos produtos, grandes iniciativas e mudanças arquiteturais. Um humano lê **uma página gerada** por portão e decide: *avançar ou refinar*.

| Portão | Pergunta Respondida | Habilidade Invocada | Entregável Renderizado | Decisão do Proprietário |
|---|---|---|---|---|
| **G1 — Problema** | Esse problema é real e justifica o trabalho? | `/wdi-problem` | `.what-rendered/_product-brief/brief.md` | Aprovar enquadramento do problema |
| **G2 — Produto** | O que construiremos e como é a interface? | `/wdi-product`<br>`/wdi-ux` | `.what-rendered/_prd/<slug>/prd.md` | Aprovar promessas funcionais (FR) |
| **G3 — Planta (Blueprint)** | Toda a arquitetura do sistema se sustenta? *(1x/repo)* | `/wdi-blueprint` | `.how-rendered/blueprint.md` | Aprovar espinha dorsal arquitetural |
| **G4 — Componente** | Como este componente é construído? *(Omitido em catalog)* | `/wdi-component` | `.how-rendered/<pc>/SDD-<pc>.md` | Aprovar design de software (SDD) |
| **G5 — Construção** | O ticket está construído, verificado e testado? *(Por spec)* | `/wdi-build` | Saída do executor de testes (Red → Green) | Aceitar código mesclado |

#### Dois Ajustes que Nunca se Fundem: Mode vs. Risk
- **`mode`** define quais portões existem (`catalog` pula G4; `guarded` e `deep` exigem SDD detalhado).
- **`risk_accepted`** define o rigor da comprovação exigida (`low`, `medium`, `high`). Fundi-los em um único seletor burocratiza componentes simples ou permite que mudanças arriscadas passem sem escrutínio.

---

### Opção B: Operações Diárias Autônomas (Fase 4 Daily Tier)
Com a arquitetura estabelecida, a engenharia cotidiana torna-se um ritmo contínuo:

1. **`/wdi-daily-what-to-build [reviewer] <notas>`**:  
   Converte notas de teste manual ou relatos de bugs em especificações estruturadas. Classifica requisitos e solicita revisão consultiva em modo somente leitura.
2. **`/wdi-daily-autopilot [self-review] [peer] [interval]`**:  
   Inicia a rotina autônoma de engenharia sob um mandato formal aprovado (padrão: `/loop 10m /wdi-autopilot`). Executa ciclos TDD e atualiza o livro-razão de decisões.
3. **`/wdi-daily-what-to-test [web|mobile|desktop]`**:  
   Coordenador de testes físicos pós-merge. Sincroniza a branch de desenvolvimento, limpa worktrees mescladas e gera uma checklist de testes físicos a partir do delta git.
4. **`/wdi-prune-or-archive [spec-id] [--archive|--prune]`**:  
   Mantém a higiene do repositório arquivando ou podando especificações fechadas com 100% de rastreabilidade RTM preservada.

---

### Opção C: Caminho Rápido (Executar `/implement` Diretamente)
Correções pontuais de bugs que não afetam `FR`, `UC`, `AD-N` ou modelos de domínio pulam todos os portões documentais e executam `/implement` diretamente. Se a alteração se expandir para requisitos funcionais, **ela é interrompida de imediato e torna-se uma especificação formal `S`**.

---

## Regras de Campo e Práticas Operacionais Reais

Regras essenciais comprovadas em ambientes reais com múltiplos agentes:

1. **Construtor Fixo no Coordenador (`builder: coordinator`):** No `wdi-daily-autopilot`, a sessão coordenadora escreve o código diretamente por meio de ciclos TDD vermelho-para-verde. Delegar a escrita a subagentes provoca alucinações sobre aprovações em testes.
2. **Revisores Consultivos Independentes:** Revisores pares (como Terra) operam estritamente em modo somente leitura (`--trust-tools=fs_read` / `--mode plan`). Eles inspecionam diffs e casos limite, mas nunca mutam código. O princípio de escritor único (*Single-Writer*) é rigorosamente mantido.
3. **Prevenção de Travamento de Arquivos no Windows (Process Gating):** No Windows, processos em segundo plano mantêm identificadores de arquivos abertos, provocando erros de `Access is denied (Exit code 5/32)` ao compilar ou podar worktrees. O `wdi-daily-what-to-test` encerra processos residuais antes de iniciar.
4. **Isolamento Obrigatório em Git Worktree:** Loops autônomos de codificação (`wdi-autopilot`) **devem obrigatoriamente rodar dentro de uma git worktree isolada** (`autopilot/<mandate-id>`). Nunca execute loops autônomos na árvore de trabalho principal.
5. **Disparo Único de Cloud CI por PR:** Loops autônomos realizam commits locais por ticket. Executar Cloud CI a cada iteração esgota as cotas mensais. Testes locais fornecem a comprovação autoritativa; o Cloud CI é acionado **uma única vez**, quando o PR está pronto para revisão.
6. **Higiene de Artefatos Efêmeros de Teste:** Cursores de smoke test e manifestos de runtime são restritos à máquina local. Garanta que `.work/smoke/` esteja registrado no `.gitignore`.

---

## Diretório das 22 Habilidades Oficiais

| Domínio | Invocadas pelo Usuário (Comandos de Desenvolvedor) | Invocadas por Modelo / Coordenadas por Agentes |
|---|---|---|
| **Entrega e Arquitetura (G1–G5)** | `/wdi-init`, `/wdi-problem`, `/wdi-product`, `/wdi-ux`, `/wdi-blueprint`, `/wdi-component`, `/wdi-build` | Conduzidas em sequência pelo coordenador |
| **Operações Diárias Autônomas** | `/wdi-daily-what-to-build`, `/wdi-daily-autopilot`, `/wdi-daily-what-to-test`, `/wdi-prune-or-archive` | `/wdi-autopilot` (motor de loop autônomo via `/loop`) |
| **Governança e Diagnóstico** | `/wdi-help`, `/wdi-explain-to-me`, `/wdi-decision`, `/wdi-question`, `/wdi-log`, `/wdi-report`, `/wdi-reconcile`, `/wdi-review`, `/wdi-systematic-debugging`, `/wdi-upgrade` | Revisão consultiva por pares e obtenção de segunda opinião |

---

## Estrutura do Repositório e Invariantes

```text
.constitution/
  method/            Motor do método — sobrescrito a cada atualização; nunca edite aqui
  project/           Regras do produto e leitores de inventário — preservados entre atualizações
.control/
  registry/          Fonte Única da Verdade (SSOT): goals.yaml · specs.yaml · components.yaml
  decisions/         Decisões aceitas e mandatos formais do proprietário (DEC-*.md)
  memlog/            Livros-razão de auditoria registrando decisões de loops autônomos
  test-targets/      Modelos de testes físicos (desktop.md, web.md, mobile.md)
.scratch/            Espaços de trabalho de especificações ativas (SPEC-*.md e tickets)
.archive/            Especificações históricas podadas com rastreabilidade RTM preservada
.what/ & .how/       Documentos de trabalho (PRD, SRS, Blueprint, SDD)
.what-rendered/      Entregáveis gerados por validate.py / wdi-report
```

---

## Contribuição e Fundamentos Arquiteturais

Toda contribuição ao WDI Method deve responder a uma pergunta central: **isto torna a camada de revisão mais confiável ou apenas mais densa?**

### Fixture Corpus e Verificação Local
Todas as alterações em validadores e framework são comprovadas no fixture corpus interno (`tests/fixture/`). Execute a suíte completa de testes antes de abrir um pull request:
```bash
npm test
```

### Regra do Pacote Genérico Público
O WDI Method é publicado no registro público do npm. Ele nunca deve vazar nomes de clientes privados, identidades comerciais de produtos, credenciais de rede interna ou caminhos absolutos do sistema de arquivos.

---

## Licença e Aviso de Marca Registrada

- **Licença de Código:** Distribuído sob a [Licença MIT](LICENSE).
- **Privacidade e Telemetria:** 100% offline-first. Zero telemetria, zero análises, zero sockets de rede externa (consulte [PRIVACY.md](PRIVACY.md) e [SECURITY.md](SECURITY.md)).
- **Aviso de Marca:** "Wira Delta Indonesia", "WDI Method" e o monograma da marca do estúdio são marcas comerciais da PT Wira Delta Indonesia e são protegidos separadamente da licença de código aberto.
