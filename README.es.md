# WDI Method

> La capa de revisión que BMad deja delgada: especificaciones verificables que un humano lee para validar decisiones técnicas antes de escribir código, dimensionadas según el impacto real del cambio.

[English](README.md) | [Bahasa Indonesia](README.id.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Español](README.es.md) | [Deutsch](README.de.md) | [Français](README.fr.md) | [Português (Brasil)](README.pt-BR.md) | [Русский](README.ru.md)  
[Website](https://wiradelta.id/wdi-method) | [Changelog](CHANGELOG.md) | [Contributing](CONTRIBUTING.md) | [License](LICENSE) | [Security](SECURITY.md) | [Privacy](PRIVACY.md)

---

> **Aviso de traducción:** Este archivo es una traducción de [README.md](README.md) sólo para fines de conveniencia. En caso de discrepancia o conflicto de interpretación, la versión oficial en inglés (`README.md`) prevalece como autorizada. Toda la documentación técnica profunda y los documentos legales se mantienen en inglés.

[BMad](https://github.com/bmad-code-org/BMAD-METHOD) decide *qué* construir y *cómo* estructurar soluciones con solvencia. WDI Method lo complementa — sin reemplazarlo — proporcionando la capa de gobernanza verificable entre las decisiones arquitectónicas de alto nivel y el código en producción: registros de requisitos, catálogos de casos de uso, límites de componentes, validadores automáticos de desviación y ciclos diarios autónomos continuos.

> Este repositorio es **público y genérico**. NO DEBE incluir nombres de clientes privados, nombres de productos comerciales ni enlaces a repositorios privados. La identidad del producto se define por completo en el repositorio que lo instala.

---

## Panorama General: Desarrollo Impulsado por IA (AiDD) vs. Vibe Coding

El desarrollo especulativo sin especificaciones rigurosas ("vibe coding") fracasa inevitablemente en sistemas de producción a largo plazo: los agentes de codificación de IA pierden el contexto, alucinan estados de finalización y difuminan los límites de los requisitos. WDI Method establece un **Desarrollo Disciplinado Impulsado por IA (AiDD)** a través de una tríada arquitectónica de tres niveles:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. Intención y Estrategia: BMad Method                                  │
│    Descubre problemas del usuario, redacta product briefs y arquitectura│
├─────────────────────────────────────────────────────────────────────────┤
│ 2. Capa de Revisión Verificable: WDI Method (SSOT)                      │
│    Gobierna 5 compuertas humanas, vincula Objetivo → FR → UC → Tickets  │
│    ejecuta validadores de desviación y coordina ciclos diarios autónomos│
├─────────────────────────────────────────────────────────────────────────┤
│ 3. Desglose e Implementación: Motores de Habilidades (mattpocock/skills)│
│    to-spec y to-tickets trazan cortes verticales; implement ejecuta TDD │
└─────────────────────────────────────────────────────────────────────────┘
```

### El Invariante Dorado: Los Documentos Siguen al Código (Documents Follow Code)
Los documentos son el registro que deja el trabajo que ya se ejecutó. Cuando un registro de decisión o una fila de requisitos contradice el código, **el código prevalece y el documento se corrige**. Nunca se modifica el código para adaptarlo a documentación obsoleta. Un documento que simplemente va detrás del código está en su estado natural y nunca bloquea la entrega a menos que contenga un desajuste crítico.

---

## Inicio Rápido en 10 Minutos

Instale WDI Method en el repositorio de su producto en tres pasos secuenciales. Todas las solicitudes ofrecen valores predeterminados razonables; presione <kbd>Enter</kbd> para aceptarlos.

### Paso 1: Instalar BMad Method
Instala el motor de descubrimiento en su repositorio:
```bash
cd /ruta/a/su/repositorio-de-producto
npx bmad-method install
```

### Paso 2: Agregar los Seis Motores de Tickets
Instale los motores de ejecución directamente en su repositorio (elija "copy" o "symlink"):
```bash
npx skills@latest add mattpocock/skills
```
*Seleccione los seis motores que impulsa el método:* `to-spec`, `to-tickets`, `implement`, `tdd`, `code-review`, y `domain-modeling`.

> **Por qué el plugin de Claude Code no basta:** Los motores upstream se publican con `disable-model-invocation: true`. WDI Method elimina automáticamente esta restricción de las copias locales para que los ciclos autónomos puedan ejecutarse sin supervisión humana. Un plugin a nivel de usuario no se puede editar desde el repositorio.

### Paso 3: Instalar WDI Method
Inicie el instalador interactivo y configure las habilidades en sus plataformas de agentes (Claude Code, Cursor, etc.):
```bash
npx wdi-method
```
*(Para entornos de CI automatizados: `npx wdi-method install --yes --agents claude --product "Su Producto"`)*

### Su Primer Comando: `/wdi-help`
Dentro de su agente de codificación de IA, ejecute:
```text
/wdi-help
```
`wdi-help` inspecciona `.control/registry/` e indica la compuerta exacta en la que se encuentra su proyecto, sin conjeturar a partir del historial del chat.

---

## Tres Opciones de Flujo de Trabajo

WDI Method adapta la rigurosidad al alcance y riesgo de cada tarea:

### Opción A: Vía Guiada de Entrega (Nuevas Iniciativas y G1–G5)
Para productos nuevos, iniciativas principales y cambios de arquitectura. Un humano lee **una página generada** por compuerta y decide: *avanzar o refinar*.

| Compuerta | Pregunta Respondida | Habilidad Invocada | Entregable Renderizado | Decisión del Propietario |
|---|---|---|---|---|
| **G1 — Problema** | ¿Es este problema real y merece trabajo? | `/wdi-problem` | `.what-rendered/_product-brief/brief.md` | Aprobar planteamiento del problema |
| **G2 — Producto** | ¿Qué construimos y cómo se percibe la interfaz? | `/wdi-product`<br>`/wdi-ux` | `.what-rendered/_prd/<slug>/prd.md` | Aprobar requisitos funcionales (FR) |
| **G3 — Plano** | ¿Se sostiene toda la arquitectura del sistema? *(1 vez/repo)* | `/wdi-blueprint` | `.how-rendered/blueprint.md` | Aprobar espina dorsal arquitectónica |
| **G4 — Componente** | ¿Cómo se construye este componente? *(Omitido en modo catalog)* | `/wdi-component` | `.how-rendered/<pc>/SDD-<pc>.md` | Aprobar diseño de software (SDD) |
| **G5 — Construcción** | ¿Está el ticket construido, verificado y probado? *(Por especificación)* | `/wdi-build` | Salida del runner de pruebas (Red → Green) | Aceptar código fusionado |

#### Dos Parámetros que Nunca se Fusionan: Mode vs. Risk
- **`mode`** determina qué compuertas existen (`catalog` omite G4; `guarded` y `deep` exigen SDD riguroso).
- **`risk_accepted`** determina la profundidad de verificación requerida (`low`, `medium`, `high`). Fusionarlos en un solo dial burocratiza componentes simples o permite que cambios de alto riesgo eludan el escrutinio.

---

### Opción B: Operaciones Diarias Autónomas (Fase 4 Daily Tier)
Una vez establecida la arquitectura, la ingeniería diaria se convierte en un ritmo continuo:

1. **`/wdi-daily-what-to-build [reviewer] <notas>`**:  
   Convierte notas de pruebas manuales, observaciones de QA o informes de errores en especificaciones estructuradas. Clasifica requisitos y solicita una revisión consultiva externa de solo lectura.
2. **`/wdi-daily-autopilot [self-review] [peer] [interval]`**:  
   Lanza la rutina de ingeniería autónoma bajo un mandato formal aprobado (por defecto: `/loop 10m /wdi-autopilot`). Ejecuta ciclos TDD y actualiza el libro contable tras cada decisión.
3. **`/wdi-daily-what-to-test [web|mobile|desktop]`**:  
   Coordinador de pruebas físicas posteriores a la fusión. Sincroniza la rama de desarrollo, depura árboles de trabajo fusionados y extrae una lista de verificación de pruebas físicas a partir del delta de git.
4. **`/wdi-prune-or-archive [spec-id] [--archive|--prune]`**:  
   Mantiene la higiene del repositorio archivando o podando especificaciones cerradas mientras preserva el 100% de la trazabilidad RTM.

---

### Opción C: Vía Rápida (Ejecutar `/implement` Directamente)
Correcciones menores de errores o mejoras cosméticas que no tocan ningún `FR`, `UC`, `AD-N` o modelo de dominio omiten todas las compuertas documentales y ejecutan `/implement` directamente. Si el cambio se expande y toca un requisito funcional, **se detiene de inmediato y se convierte en una especificación explícita `S`**.

---

## Reglas de Campo y Conocimiento Operativo Real

Reglas indispensables descubiertas a través de despliegues reales con múltiples agentes:

1. **Constructor Fijado al Coordinador (`builder: coordinator`):** En `wdi-daily-autopilot`, el rol constructor recae siempre en la sesión coordinadora, que redacta código directamente mediante ciclos TDD rojo-a-verde. Delegar la escritura de código a subagentes genera alucinaciones en los reportes de pruebas.
2. **Revisores Consultivos Independientes:** Los revisores pares (como Terra) operan exclusivamente en modo de solo lectura (`--trust-tools=fs_read` / `--mode plan`). Analizan casos límite y revisan diffs, pero nunca mutan código. Se preserva rigurosamente el principio de escritor único (*Single-Writer*).
3. **Prevención de Bloqueo de Archivos en Windows (Process Gating):** En Windows, los procesos activos en segundo plano retienen identificadores de archivos, causando errores de `Access is denied (Exit code 5/32)` al compilar o limpiar worktrees. `wdi-daily-what-to-test` detecta y termina procesos residuales antes de iniciar.
4. **Invariante de Aislamiento de Worktree Git:** Los ciclos autónomos de codificación (`wdi-autopilot`) **deben ejecutarse dentro de un git worktree aislado** (`autopilot/<mandate-id>`). Nunca ejecute bucles desatendidos en el árbol de trabajo principal.
5. **Único Disparador de Cloud CI por PR:** Los bucles autónomos realizan commits locales por cada ticket. Ejecutar Cloud CI en cada iteración agota rápidamente las cuotas mensuales. Las pruebas locales proporcionan evidencia autorizada; Cloud CI se activa **una sola vez**, cuando el Pull Request está listo para revisión.
6. **Higiene de Artefactos de Prueba Efímeros:** Los cursores de prueba de humo y manifiestos de runtime son locales de cada máquina. Asegúrese de que `.work/smoke/` esté registrado en `.gitignore`.

---

## Directorio de 22 Habilidades Oficiales

| Dominio | Invocadas por Usuario (Comandos del Desarrollador) | Invocadas por Modelo / Coordinadas por Agente |
|---|---|---|
| **Entrega y Arquitectura (G1–G5)** | `/wdi-init`, `/wdi-problem`, `/wdi-product`, `/wdi-ux`, `/wdi-blueprint`, `/wdi-component`, `/wdi-build` | Ejecutadas secuencialmente por el coordinador |
| **Operaciones Diarias Autónomas** | `/wdi-daily-what-to-build`, `/wdi-daily-autopilot`, `/wdi-daily-what-to-test`, `/wdi-prune-or-archive` | `/wdi-autopilot` (motor de bucle autónomo con `/loop`) |
| **Gobernanza y Diagnóstico** | `/wdi-help`, `/wdi-explain-to-me`, `/wdi-decision`, `/wdi-question`, `/wdi-log`, `/wdi-report`, `/wdi-reconcile`, `/wdi-review`, `/wdi-systematic-debugging`, `/wdi-upgrade` | Despacho de revisión par consultiva y segunda opinión |

---

## Estructura del Repositorio e Invariantes

```text
.constitution/
  method/            Motor del método — sobrescrito en cada actualización; nunca editar aquí
  project/           Reglas del producto y lectores personalizados — preservados entre actualizaciones
.control/
  registry/          Fuente Única de Verdad (SSOT): goals.yaml · specs.yaml · components.yaml
  decisions/         Decisiones aceptadas y mandatos del propietario (DEC-*.md)
  memlog/            Libros contables de auditoría que registran decisiones autónomas
  test-targets/      Plantillas de pruebas físicas (desktop.md, web.md, mobile.md)
.scratch/            Espacios de trabajo de especificaciones activas (SPEC-*.md y tickets)
.archive/            Especificaciones históricas podadas con enlaces de auditoría RTM preservados
.what/ & .how/       Documentos de trabajo (PRD, SRS, Blueprint, SDD)
.what-rendered/      Entregables legibles por humanos generados por validate.py / wdi-report
```

---

## Contribución y Fundamentos de Arquitectura

Toda contribución a WDI Method debe responder a una pregunta clave: **¿hace esto que la capa de revisión sea más confiable, o simplemente la hace más pesada?**

### Fixture Corpus y Verificación Local
Todos los cambios en validadores y framework se verifican contra el fixture corpus interno (`tests/fixture/`). Ejecute la suite de pruebas completa antes de enviar un pull request:
```bash
npm test
```

### Regla de Paquete Genérico Público
WDI Method se publica en el registro público de npm. Nunca debe filtrar nombres de clientes privados, identidades comerciales, credenciales de red interna o rutas absolutas del sistema de archivos.

---

## Licencia y Aviso de Marca Registrada

- **Licencia de Código:** Distribuido bajo la [Licencia MIT](LICENSE).
- **Privacidad y Telemetría:** 100% offline-first. Cero telemetría, cero analíticas, cero sockets de red externa (consulte [PRIVACY.md](PRIVACY.md) y [SECURITY.md](SECURITY.md)).
- **Aviso de Marca:** "Wira Delta Indonesia", "WDI Method" y el monograma de la marca del estudio son marcas comerciales de PT Wira Delta Indonesia y se protegen por separado de la licencia de código abierto.
