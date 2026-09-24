# WDI Method

> Una capa de revisión sobre BMad: documentos que un humano lee para revisar las decisiones técnicas antes de escribir código, dimensionados según lo que el cambio realmente merece.

[English](README.md) | [Bahasa Indonesia](README.id.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Español](README.es.md) | [Deutsch](README.de.md) | [Français](README.fr.md) | [Português (Brasil)](README.pt-BR.md) | [Русский](README.ru.md)  
[Website](https://wiradelta.id/wdi-method/docs/) | [Changelog](CHANGELOG.md) | [Contributing](CONTRIBUTING.md) | [License](LICENSE) | [Security](SECURITY.md) | [Privacy](PRIVACY.md)

---

> **Aviso de traducción:** Este archivo es una traducción de [README.md](README.md) sólo para fines de conveniencia. En caso de discrepancia o conflicto de interpretación, la versión oficial en inglés (`README.md`) prevalece como autorizada. Toda la documentación técnica profunda y los documentos legales se mantienen en inglés.

[BMad](https://github.com/bmad-code-org/BMAD-METHOD) escribe documentos para agentes de IA. WDI Method añade documentos que muchos roles ya leen: casos de uso, diagramas C4, listas de API y de base de datos, y documentos de diseño. Envuelve a BMad sin reemplazarlo: cada skill de WDI delega la redacción a una skill de BMad y después verifica el resultado contra las guías del método.

> Este repositorio es **público y genérico**. NO DEBE incluir un nombre de cliente, un nombre de producto comercial ni un enlace a un repositorio privado. La identidad del producto vive por completo en el repositorio que lo instala.

---

## Desarrollo Impulsado por IA (AiDD) vs. Vibe Coding

El vibe coding también usa especificaciones, pero no de forma consistente: cada sesión de prompts puede ser distinta, los documentos no tienen estructura y el proceso no se mantiene sistemático. El resultado es una eficiencia y una eficacia mucho menores, y un riesgo real de acumular deuda técnica. Por eso hace falta un framework.

En WDI Method, el Desarrollo Impulsado por IA (AiDD) sigue un orden: promesas registradas como FR y casos de uso, luego las compuertas, luego la especificación dividida en tickets con `to-spec` y `to-tickets`, luego cada ticket construido con pruebas primero y, por último, un PR que el propietario revisa y fusiona.

Tres capas hacen el trabajo:

| Capa | Quién | Qué hace |
|---|---|---|
| 1. Documentos para agentes | [BMad](https://github.com/bmad-code-org/BMAD-METHOD) | Escribe el product brief, el PRD, la UX y la espina dorsal de la arquitectura, cada uno mediante una skill de BMad |
| 2. Capa de revisión | WDI Method | Envuelve esas skills, añade los documentos que leen otros roles, ejecuta cinco compuertas humanas, vincula Objetivo → FR → UC → Ticket → Prueba y verifica que el corpus no se desvíe |
| 3. Tickets y código | Motores ([mattpocock/skills](https://github.com/mattpocock/skills)) | `to-spec` y `to-tickets` dividen la especificación en tickets verticales; `implement` construye cada uno con pruebas primero |

### Los Documentos Siguen al Código (Documents Follow Code)

Un documento que va detrás del código está en su estado esperado, no es un defecto. Cuando el propietario eligió el código en lugar de un documento, lo que se corrige es el documento. Un documento que va por delante del código, como una especificación aún no construida, también es normal.

---

## Instalación en 3 Pasos

### Requisitos previos

- Node.js 20 o posterior.
- Git.
- [uv](https://docs.astral.sh/uv/), que ejecuta los validadores del método en Python 3.11+.
- Una plataforma de agentes: Claude Code, Cursor, Codex y otras plataformas de agentes.

Ejecute los tres pasos en orden. El instalador se detiene si no se ha hecho el paso 1 o el paso 2. Todas las solicitudes ofrecen valores predeterminados; presione <kbd>Enter</kbd> para aceptarlos.

### Paso 1: Instalar BMad Method
```bash
cd /path/to/your/product-repo
npx bmad-method install
```

### Paso 2: Agregar los Seis Motores
Instale los motores en su repositorio (elija "copy" o "symlink"):
```bash
npx skills@latest add mattpocock/skills
```
*Seleccione los seis motores que usa el método:* `to-spec`, `to-tickets`, `implement`, `tdd`, `code-review` y `domain-modeling`.

> **Por qué el plugin de Claude Code no basta:** Tres de los seis motores (`to-spec`, `to-tickets`, `implement`) se publican con `disable-model-invocation: true`. En cada instalación y actualización, WDI Method elimina esa línea de las copias de su repositorio para que `wdi-build` y `wdi-autopilot` puedan ejecutarlos. No puede editar un plugin a nivel de usuario, así que el instalador se detiene hasta que los motores estén en el repositorio. `--skip-engines-check` omite esta verificación.

### Paso 3: Instalar WDI Method
Inicia el instalador interactivo y coloca las skills donde cada una de sus plataformas de agentes las lee:
```bash
npx wdi-method
```
*(No interactivo: `npx wdi-method install --yes --agents claude-code --product "Your Product"`)*

> **Qué cambia el instalador en BMad:** El instalador también desactiva la invocación por el modelo en 13 skills de construcción y de sprint de BMad que los motores reemplazan, y añade las reglas de denegación correspondientes a `.claude/settings.json`. Todavía puede ejecutarlas escribiendo el comando.

### Su Primer Comando: `/wdi-help`
Dentro de su agente de codificación, ejecute:
```text
/wdi-help
```
`wdi-help` lee `.control/registry/` y le indica la compuerta en la que está su proyecto, las especificaciones abiertas y la siguiente skill, sin conjeturar a partir de la conversación.

---

## Tres Opciones de Flujo de Trabajo

WDI Method ajusta su ceremonia a la escala y al riesgo de la tarea.

### Opción A: Vía Guiada de Entrega (G1 a G5)
Para productos nuevos, iniciativas principales y cambios de arquitectura. Usted inicia la skill de cada compuerta; el agente nombra la siguiente y espera.

**Una Decisión por Compuerta.** Cada compuerta decide una cosa. En G1 a G4 usted lee una página generada; en G5 lee las filas RTM de la especificación. Responde una lista de verificación breve, y un solo "no" en una pregunta marcada con estrella detiene la compuerta.

| Compuerta | Decide | Skill | Qué lee usted | Decisión del propietario |
|---|---|---|---|---|
| **G1 Problem** | Cuál es el problema, de quién es y por qué merece trabajo | `/wdi-problem` | `.what-rendered/_product-brief/brief.md` | Aprobar el planteamiento del problema |
| **G2 Product** | Qué se construye y cómo se siente al usarlo | `/wdi-product`<br>`/wdi-ux` (opcional) | `.what-rendered/_prd/<slug>/prd.md` | Aprobar las promesas funcionales (FR) |
| **G3 Blueprint** | La imagen completa del producto, una vez por producto | `/wdi-blueprint` | `.how-rendered/blueprint.md` | Aprobar la espina dorsal de la arquitectura |
| **G4 Component** | Cómo se construye un componente (se omite con `mode: catalog`) | `/wdi-component` | `.how-rendered/<pc>/SDD-<pc>.md` | Aprobar el diseño de software |
| **G5 Release** | Si está terminado y demostrado | `/wdi-build` | Las filas RTM de la especificación en `.control/generated/` y la evidencia de pruebas de cada ticket | Aceptar la especificación como terminada, o devolverla |

**Refinar, No Avanzar.** Un solo "no" en una pregunta marcada con estrella (★) de la lista de verificación detiene la compuerta. Refine el documento y ejecute la compuerta otra vez; no la apruebe con la idea de corregirlo después.

#### Dos Campos que Nunca se Fusionan
- **`mode`** fija la profundidad de los documentos de cada componente. `catalog` (predeterminado): nada más allá del blueprint, y G4 se omite. `outline`: flujos completos para hasta 3 casos de uso, reglas de negocio locales y un resumen de decisiones. `guarded`: añade una sección `Failure Behaviour` para cada frontera y documentos de integración con terceros. `deep`: añade análisis de robustez, un contrato por endpoint, un diccionario de datos, diagramas de flujo y máquinas de estado.
- **`risk_accepted`** fija la dureza de la revisión. `high` (usted acepta mucho riesgo): las lentes base de estructura y de prosa. `medium`: añade la lente de casos límite. `low`: añade la lente de casos límite, y el código necesita dos revisores que no sean quien lo construyó.

Si un solo campo fijara ambas cosas, la única forma de obtener un documento delgado sería registrar en el registro de riesgos más riesgo del que realmente acepta.

---

### Opción B: Operaciones Diarias Autónomas (Daily Tier)
Una vez establecida la arquitectura, el trabajo diario se ejecuta como un ritmo diario mediante cuatro skills que usted escribe dentro de su agente:

1. **`/wdi-daily-what-to-build [reviewer] <notes>`**  
   Convierte notas de pruebas manuales, observaciones de QA o informes de errores en una especificación o un ticket revisado en la rama de desarrollo, para una ejecución posterior del autopilot. Se detiene ahí: nunca hace commit ni push, ni inicia el autopilot.
2. **`/wdi-daily-autopilot [self-review] [peer] [interval] [--skip-peer-review]`**  
   Comprueba si hay un mandato aceptado y ejecuta el preflight si no lo hay, resuelve los revisores desde la configuración local e inicia el bucle (por defecto `/loop 10m /wdi-autopilot`). El bucle trabaja en la rama `autopilot/<mandate-id>`, escribe el código con pruebas primero, registra cada decisión en su libro de registro y termina con un PR listo para revisión. El propietario lo fusiona.
3. **`/wdi-daily-what-to-test [web <target> | mobile <target> | desktop]`**  
   Después de una fusión: sincroniza la rama de desarrollo, elimina las ramas y los worktrees fusionados, prepara la aplicación para pruebas manuales y construye una lista de verificación a partir de los tickets cerrados desde la última sincronización (`before_sync..HEAD`). Sin argumento, solo sincroniza, elimina y construye la lista de verificación.
4. **`/wdi-prune-or-archive [--spec <id> | --all-closed] [--archive | --prune] [--dry-run]`**  
   Mueve las especificaciones cerradas de `.scratch/` a `.archive/specs/`, o las elimina con `git rm`, mediante `lifecycle.py`, que verifica primero y revierte si algo falla. La fila de la especificación permanece en `specs.yaml`. Sin argumento, pregunta.

---

### Opción C: Vía Rápida (`/implement` Directamente)
Una corrección puede omitir todas las compuertas cuando no cambia ningún FR, UC, AD-N ni el modelo de dominio, ocupa como máximo un ticket y no toca dinero, datos personales ni integraciones con terceros. Usted ejecuta `/implement` directamente, sin skill envolvente. Si la corrección resulta tocar un FR, el trabajo se detiene y se convierte en una especificación de tamaño S (como máximo 3 tickets), que se ejecuta mediante `wdi-build`.

---

## Reglas de Campo

Reglas operativas aprendidas al ejecutar bucles de codificación autónomos en repositorios de productos reales:

### 1. Constructor Fijado al Coordinador (`builder: coordinator`)
En `wdi-daily-autopilot`, `roles.builder` en `.control/custom-dispatch.yaml` está fijado a `coordinator`. Delegar el código a subagentes produjo informes de finalización falsos (un subagente que afirmaba que las pruebas pasaban sin haber editado ningún archivo). La sesión coordinadora escribe el código ella misma, con pruebas primero.

### 2. Revisores de Solo Lectura
Los revisores pares se ejecutan en modo de solo lectura. Cuestionan los casos límite y leen los diffs, pero nunca cambian el código ni ejecutan builds; solo escribe la sesión coordinadora. Con `risk_accepted: low` se rechaza omitir la revisión par, porque ahí el código necesita dos revisores que no sean quien lo construyó.

### 3. Bloqueos de Archivos en Windows (Desktop Process Gate)
En Windows, un binario de la aplicación en ejecución o un daemon de build en segundo plano mantiene abiertos identificadores de archivo, y entonces una recompilación o la eliminación de un worktree falla con `Access is denied`. Con el objetivo `desktop`, `wdi-daily-what-to-test` comprueba si el binario de la aplicación sigue en ejecución antes de recompilar. Solo cierra la aplicación si la inició su propia ejecución de smoke anterior; si no, informa el PID y se detiene, para que usted la cierre. Nunca fuerza la terminación de un proceso.

### 4. El Bucle se Ejecuta en su Propia Rama
La redacción de especificaciones y tickets ocurre en la rama de desarrollo. El bucle se ejecuta en su propia rama, `autopilot/<mandate-id>`, en un worktree aislado o en un checkout limpio que solo usa esa ejecución. Nunca se ejecuta en un checkout compartido o con cambios pendientes.

### 5. Una Ejecución de Cloud CI por Ejecución del Autopilot
El bucle hace un commit por ticket, y la suite de pruebas local es la evidencia durante la ejecución. Cloud CI se ejecuta una vez por ejecución del autopilot, al final: cuando el único PR se marca como listo para revisión, o cuando el workflow se despacha una vez. Los push durante la ejecución no inician ninguna ejecución en la nube.

### 6. Archivos de Smoke Locales de la Máquina
Los cursores de smoke (`.work/smoke/last-sync`) y los manifiestos de runtime pertenecen a una sola máquina. El instalador añade `.work/smoke/` a `.gitignore`, de modo que los archivos de smoke locales nunca dejan el árbol de trabajo con cambios pendientes.

---

## Configuración (`custom-dispatch.yaml`)

Los comandos de runner y los flags de modelo específicos de cada máquina viven en `.control/custom-dispatch.yaml`. El instalador lo crea a partir de `.control/custom-dispatch.yaml.example` cuando falta y lo añade a `.gitignore`; solo se hace commit del ejemplo.

Un runner nombrado como revisor DEBE ser de solo lectura. El flag de solo lectura por CLI: `claude --permission-mode plan`, `kiro-cli --trust-tools=fs_read`, `cursor-agent --mode plan`. Todos los runners de ejemplo de la plantilla lo usan.

---

## Directorio de Skills (22)

WDI Method instala 22 skills: 7 skills de compuerta, 5 del daily tier (incluida `wdi-autopilot`) y 10 que usted ejecuta en cualquier momento.

Cómo se inicia una skill:
- **Usted la escribe**: las cuatro skills del daily tier, `wdi-build` y `wdi-explain-to-me` (llevan `disable-model-invocation: true`).
- **Usted la escribe, o el agente la nombra y espera su aprobación**: las demás skills.
- **El agente puede ejecutarla por sí mismo (solo lectura)**: `wdi-help`.
- **Disparada por `/loop` bajo un mandato aceptado**: `wdi-autopilot`. Bajo un mandato, `wdi-autopilot` también ejecuta las demás skills.

| Skill | Qué hace | Cómo se inicia |
|---|---|---|
| **Skills de compuerta** | | |
| `/wdi-init` | Antes de G1 y al final de G2: configura los registros, los componentes, `mode` y `risk_accepted`, los dos mapas de estructura, la verificación de motores y los lectores de inventario. | Usted la escribe, o el agente la nombra |
| `/wdi-problem` | G1. Ejecuta la skill de product brief de BMad y después verifica el brief contra la guía del método. Nunca escribe el brief ella misma. | Usted la escribe, o el agente la nombra |
| `/wdi-product` | G2. Ejecuta la skill de PRD de BMad para un PRD nuevo o una promesa modificada y después lo verifica contra la guía del PRD. Nunca escribe el PRD ella misma. | Usted la escribe, o el agente la nombra |
| `/wdi-ux` | Opcional, junto con G2. Ejecuta la skill de UX de BMad y archiva los resultados de diseño donde corresponden. Nunca escribe contenido de UX ella misma. | Usted la escribe, o el agente la nombra |
| `/wdi-blueprint` | G3, una vez por producto. La imagen completa del producto: casos de uso, actores, modelo de dominio, reglas de negocio, glosario, la espina dorsal de la arquitectura, C4 y los inventarios de API, tablas y pantallas. | Usted la escribe, o el agente la nombra |
| `/wdi-component` | G4. La profundidad de un componente, tan profunda como su `mode` y no más. Se omite con `mode: catalog`. | Usted la escribe, o el agente la nombra |
| `/wdi-build` | G5. Una especificación de abierta a cerrada: usted ejecuta `to-spec` y `to-tickets`, cada ticket llega a un PR en verde y después la especificación se cierra. Nunca fusiona. | Usted la escribe |
| **Daily tier** | | |
| `/wdi-daily-what-to-build` | Convierte notas de pruebas manuales en una especificación o un ticket revisado para una ejecución posterior del autopilot. Se detiene antes del código, el commit o el push. | Usted la escribe |
| `/wdi-daily-autopilot` | Comprueba si hay un mandato aceptado (ejecuta el preflight si no lo hay), resuelve los revisores desde la configuración local e inicia el bucle, cada 10 minutos por defecto. | Usted la escribe |
| `/wdi-autopilot` | El bucle en sí: recorre cada FR bajo un mandato aceptado, en una rama con un PR, y escribe cada decisión en un libro de registro. | Disparada por `/loop` bajo un mandato aceptado |
| `/wdi-daily-what-to-test` | Después de una fusión: sincroniza la rama de desarrollo, elimina las ramas y los worktrees fusionados, prepara la aplicación para pruebas manuales y construye una lista de verificación a partir de los tickets cerrados. | Usted la escribe |
| `/wdi-prune-or-archive` | Mueve las especificaciones cerradas a `.archive/specs/` o las elimina con `git rm`, mediante `lifecycle.py`, que verifica primero y revierte si algo falla. La fila de la especificación permanece en `specs.yaml`. | Usted la escribe |
| **En cualquier momento** | | |
| `/wdi-help` | Lee el registro de estado y le indica la compuerta actual, las especificaciones abiertas y la siguiente skill. | El agente puede ejecutarla por sí mismo (solo lectura) |
| `/wdi-explain-to-me` | Hace la lectura antes de que usted decida: investiga y después le informa en seis secciones fijas. No escribe ningún archivo. | Usted la escribe |
| `/wdi-decision` | Abre, acepta y aplica una decisión numerada (`DEC-`), y la lleva a los documentos que gobierna. | Usted la escribe, o el agente la nombra |
| `/wdi-question` | Archiva algo que no se puede decidir ahora en una de cuatro listas en `.control/questions/`, y lo cierra cuando llega la respuesta. | Usted la escribe, o el agente la nombra |
| `/wdi-log` | Registra una reunión terminada o un hecho no técnico que limita lo que se puede construir. | Usted la escribe, o el agente la nombra |
| `/wdi-report` | Cifras sobre el proyecto: progreso, estimaciones, filas de tareas para un tracker, o un brief o PRD independiente. Nunca inventa una cifra. | Usted la escribe, o el agente la nombra |
| `/wdi-reconcile` | Antes de una compuerta o después de un lote de cambios: informa de la desviación entre `.what`, `.how`, `.control` y las reglas del método. Solo lectura. | Usted la escribe, o el agente la nombra |
| `/wdi-review` | Revisa cualquier documento del corpus, y debe ejecutarse antes de una compuerta para la espina dorsal, el SRS, el SDD y el SPEC. Sus lentes siguen `risk_accepted`. No sirve para revisar código. | Usted la escribe, o el agente la nombra |
| `/wdi-systematic-debugging` | Para cualquier error, prueba fallida o build fallido, antes de proponer una corrección: encontrar la causa raíz y probar una hipótesis cada vez. | Usted la escribe, o el agente la nombra |
| `/wdi-upgrade` | Justo después de `wdi-method update`: mueve los documentos y los archivos de registro que siguen en la forma antigua a la nueva, y después comprueba que la validación esté en verde. | Usted la escribe, o el agente la nombra |

---

## Estructura del Repositorio

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

## Contribución

Toda contribución a WDI Method responde a una pregunta: **¿hace esto que la capa de revisión sea más confiable, o solo la hace más gruesa?** Consulte [CONTRIBUTING.md](CONTRIBUTING.md).

### Fixture Corpus y Verificación Local
Los cambios en los validadores y en el método se demuestran contra el fixture corpus (`tests/fixture/`). Ejecute la suite antes de abrir un pull request:
```bash
npm test
```
La suite ejecuta los cuatro scripts Python PEP 723 (`validate.py`, `timeline.py`, `inventory.py`, `lifecycle.py`) contra el fixture, y verifica el registro de plataformas y los archivos que recibe cada plataforma, así como la integridad del kit.

### Regla de Paquete Genérico Público
WDI Method se publica en el registro público de npm. Nunca debe incluir nombres de clientes privados, identidades de productos comerciales, credenciales ni rutas absolutas del sistema de archivos.

---

## Licencia y Privacidad

- **Licencia del código:** [Licencia MIT](LICENSE).
- **Privacidad:** WDI Method por sí mismo no hace llamadas de red; su agente de codificación sigue comunicándose con su proveedor de modelos. Consulte [PRIVACY.md](PRIVACY.md) y [SECURITY.md](SECURITY.md).

## The name and the icon

El texto en inglés que sigue es el que se aplica.

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

Usamos el mismo método en proyectos de clientes. [Contacte con Wira Delta Indonesia](https://wiradelta.id/#contact).
