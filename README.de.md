# WDI Method

> Die Überprüfungsschicht, die BMad schlank hält — verifizierbare Spezifikationen, die ein Mensch liest, um technische Entscheidungen vor dem Schreiben von Code zu prüfen, abgestimmt auf den tatsächlichen Umfang der Änderung.

[English](README.md) | [Bahasa Indonesia](README.id.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Español](README.es.md) | [Deutsch](README.de.md) | [Français](README.fr.md) | [Português (Brasil)](README.pt-BR.md) | [Русский](README.ru.md)  
[Website](https://wiradelta.id/wdi-method) | [Changelog](CHANGELOG.md) | [Contributing](CONTRIBUTING.md) | [License](LICENSE) | [Security](SECURITY.md) | [Privacy](PRIVACY.md)

---

> **Übersetzungshinweis:** Diese Datei ist eine Übersetzung von [README.md](README.md) und dient ausschließlich Informationszwecken. Bei Widersprüchen oder Auslegungsunterschieden ist die offizielle englische Originalfassung (`README.md`) maßgeblich. Alle tiefergehenden technischen Dokumentationen und rechtlichen Bedingungen werden auf Englisch geführt.

[BMad](https://github.com/bmad-code-org/BMAD-METHOD) entscheidet, *was* gebaut werden soll und *wie* Lösungen sauber strukturiert werden. WDI Method umschließt es — ohne es zu ersetzen — und stellt die überprüfbare Governance-Schicht zwischen übergeordneten Architekturentscheidungen und funktionierendem Code bereit: Anforderungsregister, Use-Case-Kataloge, Komponentengrenzen, automatische Drift-Validatoren und ungehinderte autonome Tagesschleifen.

> Dieses Repository ist **öffentlich und generisch**. Es DARF KEINE privaten Kundennamen, kommerziellen Produktbezeichnungen oder Links zu privaten Repositories enthalten. Die Produktidentität wird vollständig in dem Repository definiert, das dieses Paket installiert.

---

## Gesamtüberblick: KI-gestützte Entwicklung (AiDD) vs. Vibe Coding

Spekulatives Prompting ohne Spezifikationen („Vibe Coding“) scheitert bei langlebigen Produktionssystemen unweigerlich: KI-Codierungsagenten verlieren den Kontext, halluzinieren den Abschluss von Aufgaben und verwischen Anforderungsgrenzen. WDI Method etabliert disziplinierte **AI-Driven Development (AiDD)** durch eine dreistufige Architekturtriade:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. Absicht & Produktstrategie: BMad Method                              │
│    Benutzerprobleme erfassen, Product Briefs und Architektur entwerfen  │
├─────────────────────────────────────────────────────────────────────────┤
│ 2. Überprüfbare Governance-Schicht: WDI Method (SSOT)                   │
│    Verwaltet 5 menschliche Gates, verknüpft Ziel → FR → UC → Tickets,   │
│    führt Drift-Validatoren aus und steuert autonome Tagesschleifen      │
├─────────────────────────────────────────────────────────────────────────┤
│ 3. Zerlegung & Implementierung: Skill-Engines (mattpocock/skills)       │
│    to-spec & to-tickets schneiden vertikale Tracer; implement fährt TDD │
└─────────────────────────────────────────────────────────────────────────┘
```

### Die goldene Invariante: Dokumente folgen dem Code (Documents Follow Code)
Dokumente sind die Aufzeichnungen bereits abgeschlossener Arbeit. Wenn ein Entscheidungsdatensatz oder eine Anforderungszeile dem Code widerspricht, **gewinnt der Code und das Dokument wird korrigiert**. Code wird niemals an veraltete Dokumentation angepasst. Ein Dokument, das dem Code schlicht hinterherhinkt, befindet sich in seinem erwarteten Zustand und blockiert niemals den Lieferprozess, es sei denn, es enthält kritische Fehler.

---

## 10-Minuten-Schnellstart

Installieren Sie WDI Method in Ihrem Produkt-Repository in drei aufeinanderfolgenden Schritten. Alle Eingabeaufforderungen bieten sinnvolle Standardwerte; drücken Sie <kbd>Enter</kbd>, um sie zu akzeptieren.

### Schritt 1: BMad Method installieren
Installiert die Discovery-Engine in Ihrem Produkt-Repository:
```bash
cd /pfad/zu/ihrem/produkt-repo
npx bmad-method install
```

### Schritt 2: Die sechs Ticket-Engines hinzufügen
Installieren Sie die Ausführungs-Engines direkt in Ihrem Repository (wählen Sie „copy“ oder „symlink“):
```bash
npx skills@latest add mattpocock/skills
```
*Wählen Sie alle sechs vom Framework gesteuerten Engines aus:* `to-spec`, `to-tickets`, `implement`, `tdd`, `code-review` und `domain-modeling`.

> **Warum das Claude-Code-Plugin allein nicht ausreicht:** Upstream-Engines werden mit `disable-model-invocation: true` ausgeliefert. WDI Method entfernt dieses Flag automatisch aus den lokalen Kopien, damit autonome Schleifen ohne menschliche Bestätigung laufen können. Ein Plugin auf Benutzerebene kann vom Repository aus nicht angepasst werden.

### Schritt 3: WDI Method installieren
Startet das interaktive Installationsprogramm und richtet die Skills auf Ihren Agentenplattformen (Claude Code, Cursor etc.) ein:
```bash
npx wdi-method
```
*(Für automatisierte CI-Umgebungen: `npx wdi-method install --yes --agents claude --product "Ihr Produkt"`)*

### Ihr erster Befehl: `/wdi-help`
Führen Sie in Ihrem KI-Codierungsagenten folgenden Befehl aus:
```text
/wdi-help
```
`wdi-help` prüft `.control/registry/` und meldet das genaue Gate, an dem sich Ihr Projekt befindet, ohne Vermutungen aus dem Chatverlauf anzustellen.

---

## Drei Workflow-Optionen

WDI Method passt die Zeremonie an den Umfang und das Risiko der jeweiligen Aufgabe an:

### Option A: Geführter Lieferpfad (Neue Initiativen & G1–G5)
Für neue Produkte, Hauptinitiativen und wesentliche Architekturänderungen. Ein Mensch liest **eine gerenderte Seite** pro Gate und entscheidet: *Freigeben oder verfeinern*.

| Gate | Beantwortete Fragestellung | Aufgerufener Skill | Gerenderte Seite zur Prüfung | Eigentümer-Entscheidung |
|---|---|---|---|---|
| **G1 — Problem** | Ist das Problem real und rechtfertigt es Arbeit? | `/wdi-problem` | `.what-rendered/_product-brief/brief.md` | Problemstellung genehmigen |
| **G2 — Produkt** | Was bauen wir und wie fühlt sich das UI an? | `/wdi-product`<br>`/wdi-ux` | `.what-rendered/_prd/<slug>/prd.md` | Funktionale Zusagen (FR) genehmigen |
| **G3 — Bauplan** | Hält die gesamte Systemarchitektur zusammen? *(1x/Repo)* | `/wdi-blueprint` | `.how-rendered/blueprint.md` | Architekturrückgrat genehmigen |
| **G4 — Komponente** | Wie ist die Komponente aufgebaut? *(Nicht in catalog)* | `/wdi-component` | `.how-rendered/<pc>/SDD-<pc>.md` | Softwaredesign (SDD) genehmigen |
| **G5 — Build** | Ist das Ticket gebaut, verifiziert und erprobt? *(Pro Spec)* | `/wdi-build` | Test-Runner-Ausgabe (Red → Green) | Gemergten Code annehmen |

#### Zwei Regler, die niemals verschmelzen: Mode vs. Risk
- **`mode`** legt fest, welche Gates existieren (`catalog` überspringt G4; `guarded` und `deep` fordern gründliches SDD).
- **`risk_accepted`** bestimmt die Tiefe der erforderlichen Prüfnachweise (`low`, `medium`, `high`). Beide in einen einzigen Regler zu zwingen, erstickt einfache Komponenten in Bürokratie oder lässt riskante Änderungen unbemerkt passieren.

---

### Option B: Autonome Tagesabläufe (Fase 4 Daily Tier)
Sobald die Architektur steht, wird die tägliche Entwicklung zu einem kontinuierlichen Rhythmus:

1. **`/wdi-daily-what-to-build [reviewer] <notizen>`**:  
   Wandelt manuelle Testnotizen, QA-Beobachtungen oder Fehlerberichte in strukturierte Spezifikationen um. Klassifiziert Anforderungen und fordert eine unabhängige, rein lesende Beratung an.
2. **`/wdi-daily-autopilot [self-review] [peer] [interval]`**:  
   Startet die autonome Entwicklungsroutine unter einem formalen Mandat (Standard: `/loop 10m /wdi-autopilot`). Führt TDD-Zyklen aus und führt das Buchungsjournal.
3. **`/wdi-daily-what-to-test [web|mobile|desktop]`**:  
   Koordinator für physische Tests nach dem Merge. Synchronisiert den Entwicklungszweig, bereinigt gemergte Worktrees und leitet aus dem Git-Delta eine Checkliste für physische Tests ab.
4. **`/wdi-prune-or-archive [spec-id] [--archive|--prune]`**:  
   Sichert die Repository-Hygiene durch Archivieren oder Bereinigen abgeschlossener Spezifikationen bei 100%iger RTM-Rückverfolgbarkeit.

---

### Option C: Schneller Pfad (Direkt `/implement`)
Kleine Fehlerkorrekturen oder Verfeinerungen, die keine `FR`, `UC`, `AD-N` oder Domänenmodelle berühren, überspringen alle Dokumenten-Gates und führen `/implement` direkt aus. Berührt die Änderung eine funktionale Anforderung, **stoppt sie sofort und wird zu einer expliziten Spezifikation `S`**.

---

## Praxiserprobte Regeln & Betriebswissen

Erprobte Invarianten aus dem produktiven Betrieb mit multiplen Agenten:

1. **Builder fest auf Koordinator (`builder: coordinator`):** In `wdi-daily-autopilot` schreibt die koordinierende Session den Code direkt im TDD-Zyklus. Das Delegieren der Codeerstellung an Unteragenten führt zu Testbericht-Halluzinationen.
2. **Unabhängige beratende Reviewer:** Peer-Reviewer (wie Terra) arbeiten ausschließlich im Nur-Lese-Modus (`--trust-tools=fs_read` / `--mode plan`). Sie prüfen Grenzfälle und Diff-Dateien, verändern jedoch niemals Code. Das Single-Writer-Prinzip bleibt strikt gewahrt.
3. **Vermeidung von Windows-Dateisperren (Process Gating):** Unter Windows halten Hintergrundprozesse Dateihandles geöffnet, was zu `Access is denied (Exit code 5/32)` beim Kompilieren oder Bereinigen führt. `wdi-daily-what-to-test` beendet verbleibende Prozesse vor dem Kompilieren.
4. **Zwingende Git-Worktree-Isolierung:** Autonome Codierungsschleifen (`wdi-autopilot`) **müssen in einem isolierten Git-Worktree** (`autopilot/<mandate-id>`) ausgeführt werden. Führen Sie niemals Schleifen im Hauptarbeitsverzeichnis aus.
5. **Ein einzelner Cloud-CI-Trigger pro PR:** Autonome Schleifen committen lokal pro Ticket. Cloud-CI bei jeder Iteration erschöpft das Monatskontingent schnell. Lokale Testsuiten liefern verbindliche Nachweise; Cloud-CI wird **einmalig** ausgelöst, wenn der PR prüfbereit ist.
6. **Hygiene flüchtiger Smoke-Test-Artefakte:** Smoke-Test-Cursor und Runtime-Manifeste sind maschinenlokal. Stellen Sie sicher, dass `.work/smoke/` in der `.gitignore` registriert ist.

---

## Verzeichnis der 22 offiziellen Skills

| Domäne | Benutzer-Befehle (Direkte Entwickleraufrufe) | Modell-Befehle / Agenten-Orchestrierung |
|---|---|---|
| **Lieferung & Architektur (G1–G5)** | `/wdi-init`, `/wdi-problem`, `/wdi-product`, `/wdi-ux`, `/wdi-blueprint`, `/wdi-component`, `/wdi-build` | Sequentiell vom Koordinator über Gates hinweg ausgeführt |
| **Autonome Tagesabläufe** | `/wdi-daily-what-to-build`, `/wdi-daily-autopilot`, `/wdi-daily-what-to-test`, `/wdi-prune-or-archive` | `/wdi-autopilot` (Autonomer Schleifenmotor via `/loop`) |
| **Governance & Diagnose** | `/wdi-help`, `/wdi-explain-to-me`, `/wdi-decision`, `/wdi-question`, `/wdi-log`, `/wdi-report`, `/wdi-reconcile`, `/wdi-review`, `/wdi-systematic-debugging`, `/wdi-upgrade` | Beratendes Peer-Review und Einholen von Zweitmeinungen |

---

## Repository-Struktur & Invarianten

```text
.constitution/
  method/            Methoden-Engine — wird bei jedem Update überschrieben; niemals manuell ändern
  project/           Produkteigene Regeln und Inventar-Reader — bleiben bei Updates erhalten
.control/
  registry/          Single Source of Truth: goals.yaml · specs.yaml · components.yaml
  decisions/         Akzeptierte Entscheidungen und Eigentümer-Mandate (DEC-*.md)
  memlog/            Audit-Journale zur Aufzeichnung autonomer Schleifenentscheidungen
  test-targets/      Physische Testvorlagen (desktop.md, web.md, mobile.md)
.scratch/            Aktive Spezifikations-Workspaces (SPEC-*.md und Tickets)
.archive/            Bereinigte historische Spezifikationen mit intakten RTM-Auditlinks
.what/ & .how/       Arbeits-Korpusdokumente (PRD, SRS, Blueprint, SDD)
.what-rendered/      Menschlich lesbare Ausgaben (generiert durch validate.py / wdi-report)
```

---

## Mitwirkung & Architekturgrundsätze

Jeder Beitrag zu WDI Method muss eine Kernfrage beantworten: **Macht diese Änderung die Prüfung vertrauenswürdiger oder bläht sie sie lediglich auf?**

### Fixture Corpus & Lokale Verifikation
Alle Änderungen an Validatoren und Framework werden gegen den internen Testkorpus (`tests/fixture/`) geprüft. Führen Sie vor dem Erstellen eines Pull Requests die gesamte Testsuite aus:
```bash
npm test
```

### Richtlinie für generische Pakete
WDI Method wird in der öffentlichen npm-Registry veröffentlicht. Es darf niemals vertrauliche Kundennamen, kommerzielle Produktbezeichnungen, interne Zugangsdaten oder absolute Dateipfade preisgeben.

---

## Lizenz und Markenhinweis

- **Code-Lizenz:** Veröffentlicht unter der [MIT-Lizenz](LICENSE).
- **Datenschutz und Telemetrie:** 100% offline-first. Keine Telemetrie, keine Analysen, keine ausgehenden Netzwerksockets (siehe [PRIVACY.md](PRIVACY.md) und [SECURITY.md](SECURITY.md)).
- **Markenhinweis:** „Wira Delta Indonesia“, „WDI Method“ und das Studio-Markenmonogramm sind Marken der PT Wira Delta Indonesia und separat von der Open-Source-Codelizenz geschützt.
