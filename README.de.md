# WDI Method

> Eine Überprüfungsschicht auf BMad: Dokumente, die ein Mensch liest, um technische Entscheidungen zu prüfen, bevor Code geschrieben wird, bemessen an dem, was die Änderung tatsächlich verdient.

[English](README.md) | [Bahasa Indonesia](README.id.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Español](README.es.md) | [Deutsch](README.de.md) | [Français](README.fr.md) | [Português (Brasil)](README.pt-BR.md) | [Русский](README.ru.md)  
[Website](https://wiradelta.id/wdi-method/docs/) | [Changelog](CHANGELOG.md) | [Contributing](CONTRIBUTING.md) | [License](LICENSE) | [Security](SECURITY.md) | [Privacy](PRIVACY.md)

---

> **Übersetzungshinweis:** Diese Datei ist eine Übersetzung von [README.md](README.md) und dient ausschließlich Informationszwecken. Bei Widersprüchen oder Auslegungsunterschieden ist die offizielle englische Originalfassung (`README.md`) maßgeblich. Alle tiefergehenden technischen Dokumentationen und rechtlichen Bedingungen werden auf Englisch geführt.

[BMad](https://github.com/bmad-code-org/BMAD-METHOD) schreibt Dokumente für KI-Agenten. WDI Method fügt Dokumente hinzu, die viele Rollen bereits lesen: Use Cases, C4-Diagramme, API- und Datenbanklisten sowie Designdokumente. Es umschließt BMad, ohne es zu ersetzen: Jeder WDI-Skill übergibt das Schreiben an einen BMad-Skill und prüft das Ergebnis anschließend anhand der Leitfäden der Methode.

> Dieses Repository ist **öffentlich und generisch**. Es DARF KEINEN Kundennamen, keinen kommerziellen Produktnamen und keinen Link zu einem privaten Repository enthalten. Die Produktidentität liegt vollständig in dem Repository, das es installiert.

---

## KI-gestützte Entwicklung (AiDD) vs. Vibe Coding

Auch Vibe Coding nutzt Spezifikationen, aber nicht konsequent: Jede Prompt-Sitzung kann anders ausfallen, die Dokumente sind unstrukturiert, und der Prozess wird nicht systematisch gehalten. Das Ergebnis ist eine deutlich geringere Effizienz und Wirksamkeit und ein reales Risiko, technische Schulden anzuhäufen. Deshalb braucht es ein Framework.

In WDI Method läuft AI-Driven Development (AiDD) in einer festen Reihenfolge: Versprechen, registriert als FR und Use Cases, dann die Gates, dann die Spezifikation, mit `to-spec` und `to-tickets` in Tickets geschnitten, dann jedes Ticket test-first gebaut, dann ein PR, den der Owner prüft und merged.

Drei Schichten erledigen die Arbeit:

| Schicht | Wer | Was sie tut |
|---|---|---|
| 1. Dokumente für Agenten | [BMad](https://github.com/bmad-code-org/BMAD-METHOD) | Schreibt den Product Brief, das PRD, die UX und das Architektur-Rückgrat, jeweils über einen BMad-Skill |
| 2. Überprüfungsschicht | WDI Method | Umschließt diese Skills, fügt die Dokumente hinzu, die andere Rollen lesen, führt fünf menschliche Gates durch, verknüpft Ziel → FR → UC → Ticket → Test und prüft das Korpus auf Drift |
| 3. Tickets und Code | Engines ([mattpocock/skills](https://github.com/mattpocock/skills)) | `to-spec` und `to-tickets` schneiden die Spezifikation in vertikale Tickets; `implement` baut jedes davon test-first |

### Dokumente folgen dem Code (Documents Follow Code)

Ein Dokument, das hinter dem Code zurückliegt, ist in seinem erwarteten Zustand und kein Fehler. Wo der Owner den Code einem Dokument vorgezogen hat, wird das Dokument korrigiert. Ein Dokument, das dem Code voraus ist, etwa eine noch nicht gebaute Spezifikation, ist ebenfalls normal.

---

## Installation in 3 Schritten

### Voraussetzungen

- Node.js 20 oder neuer.
- Git.
- [uv](https://docs.astral.sh/uv/), das die Python-3.11+-Validatoren der Methode ausführt.
- Eine Agentenplattform: Claude Code, Cursor, Codex und andere Agentenplattformen.

Führen Sie die drei Schritte der Reihe nach aus. Der Installer bricht ab, wenn Schritt 1 oder Schritt 2 nicht erledigt ist. Alle Abfragen bieten Standardwerte an; mit <kbd>Enter</kbd> übernehmen Sie sie.

### Schritt 1: BMad Method installieren
```bash
cd /path/to/your/product-repo
npx bmad-method install
```

### Schritt 2: Die sechs Engines hinzufügen
Installieren Sie die Engines in Ihr Repository (wählen Sie "copy" oder "symlink"):
```bash
npx skills@latest add mattpocock/skills
```
*Wählen Sie alle sechs Engines, die die Methode ansteuert:* `to-spec`, `to-tickets`, `implement`, `tdd`, `code-review` und `domain-modeling`.

> **Warum das Claude-Code-Plugin nicht ausreicht:** Drei der sechs Engines (`to-spec`, `to-tickets`, `implement`) werden mit `disable-model-invocation: true` ausgeliefert. Bei jeder Installation und jedem Update entfernt WDI Method diese Zeile aus den Kopien in Ihrem Repository, damit `wdi-build` und `wdi-autopilot` sie ausführen können. Ein Plugin auf Benutzerebene kann es nicht bearbeiten, daher bricht der Installer ab, bis die Engines im Repository liegen. `--skip-engines-check` überspringt diese Prüfung.

### Schritt 3: WDI Method installieren
Startet den interaktiven Installer und legt die Skills dort ab, wo jede Ihrer Agentenplattformen sie liest:
```bash
npx wdi-method
```
*(Nicht interaktiv: `npx wdi-method install --yes --agents claude-code --product "Your Product"`)*

> **Was der Installer an BMad ändert:** Der Installer schaltet außerdem den Modellaufruf für 13 Build- und Sprint-Skills von BMad ab, die die Engines ersetzen, und fügt passende Deny-Regeln in `.claude/settings.json` ein. Sie können sie weiterhin ausführen, indem Sie den Befehl eintippen.

### Ihr erster Befehl: `/wdi-help`
Führen Sie in Ihrem Coding-Agenten aus:
```text
/wdi-help
```
`wdi-help` liest `.control/registry/` und nennt Ihnen das Gate, an dem Ihr Projekt steht, die offenen Spezifikationen und den nächsten Skill, ohne aus dem Gesprächsverlauf zu raten.

---

## Drei Workflow-Optionen

WDI Method bemisst seinen Aufwand an Umfang und Risiko der Aufgabe.

### Option A: Geführter Lieferpfad (G1 bis G5)
Für neue Produkte, größere Initiativen und Architekturänderungen. Sie starten den Skill jedes Gates; der Agent nennt den nächsten und wartet.

**Eine Entscheidung pro Gate.** Jedes Gate entscheidet eine Sache. Bei G1 bis G4 lesen Sie eine gerenderte Seite; bei G5 lesen Sie die RTM-Zeilen der Spezifikation. Sie beantworten eine kurze Checkliste, und ein einziges "Nein" auf eine markierte Frage hält das Gate an.

| Gate | Entscheidet | Skill | Was Sie lesen | Entscheidung des Owners |
|---|---|---|---|---|
| **G1 Problem** | Was das Problem ist, wessen Problem es ist und warum es Arbeit verdient | `/wdi-problem` | `.what-rendered/_product-brief/brief.md` | Die Problemstellung genehmigen |
| **G2 Product** | Was gebaut wird und wie es sich in der Nutzung anfühlt | `/wdi-product`<br>`/wdi-ux` (optional) | `.what-rendered/_prd/<slug>/prd.md` | Die funktionalen Versprechen (FR) genehmigen |
| **G3 Blueprint** | Das Gesamtbild des Produkts, einmal pro Produkt | `/wdi-blueprint` | `.how-rendered/blueprint.md` | Das Architektur-Rückgrat genehmigen |
| **G4 Component** | Wie eine Komponente gebaut wird (übersprungen bei `mode: catalog`) | `/wdi-component` | `.how-rendered/<pc>/SDD-<pc>.md` | Das Softwaredesign genehmigen |
| **G5 Release** | Ob es fertig und nachgewiesen ist | `/wdi-build` | Die RTM-Zeilen der Spezifikation in `.control/generated/` und der Testnachweis jedes Tickets | Die Spezifikation als fertig abnehmen oder zurückgeben |

**Verfeinern, nicht weitergehen.** Ein einziges "Nein" auf eine mit Stern (★) markierte Frage der Checkliste hält das Gate an. Verfeinern Sie das Dokument und führen Sie das Gate erneut aus; genehmigen Sie es nicht mit dem Plan, es später zu korrigieren.

#### Zwei Felder, die nie verschmelzen
- **`mode`** legt fest, wie tief die Dokumente jeder Komponente gehen. `catalog` (Standard): nichts über das Blueprint hinaus, und G4 wird übersprungen. `outline`: vollständige Abläufe für bis zu 3 Use Cases, lokale Geschäftsregeln, eine Entscheidungszusammenfassung. `guarded`: fügt einen Abschnitt `Failure Behaviour` für jede Grenze sowie Dokumente zu Drittanbieter-Integrationen hinzu. `deep`: fügt Robustheitsanalyse, einen Vertrag pro Endpoint, ein Datenwörterbuch, Ablaufdiagramme und Zustandsautomaten hinzu.
- **`risk_accepted`** legt fest, wie streng die Überprüfung ist. `high` (Sie akzeptieren viel Risiko): die grundlegenden Linsen für Struktur und Text. `medium`: fügt die Edge-Case-Linse hinzu. `low`: fügt die Edge-Case-Linse hinzu, und der Code braucht zwei Reviewer, die nicht der Builder sind.

Würde ein Feld beides festlegen, wäre der einzige Weg zu einem schlanken Dokument, mehr Risiko in das Risikoprotokoll zu schreiben, als Sie tatsächlich akzeptieren.

---

### Option B: Autonome Tagesabläufe (Daily Tier)
Sobald die Architektur steht, läuft die tägliche Arbeit als Tagesrhythmus über vier Skills, die Sie in Ihrem Agenten eintippen:

1. **`/wdi-daily-what-to-build [reviewer] <notes>`**  
   Wandelt Notizen aus manuellen Tests, QA-Beobachtungen oder Fehlerberichte in eine geprüfte Spezifikation oder ein geprüftes Ticket auf dem Entwicklungsbranch um, für einen späteren Autopilot-Lauf. Dort hört es auf: Es macht nie einen Commit oder Push und startet nie den Autopilot.
2. **`/wdi-daily-autopilot [self-review] [peer] [interval] [--skip-peer-review]`**  
   Prüft, ob ein akzeptiertes Mandat vorliegt, und führt den Preflight aus, wenn keines vorliegt, ermittelt die Reviewer aus der lokalen Konfiguration und startet die Schleife (Standard `/loop 10m /wdi-autopilot`). Die Schleife arbeitet auf dem Branch `autopilot/<mandate-id>`, schreibt den Code test-first, hält jede Entscheidung in ihrem Ledger fest und endet mit einem PR, der zur Überprüfung bereit ist. Der Owner merged.
3. **`/wdi-daily-what-to-test [web <target> | mobile <target> | desktop]`**  
   Nach einem Merge: synchronisiert den Entwicklungsbranch, räumt gemergte Branches und Worktrees ab, bereitet die App für manuelle Tests vor und erstellt eine Checkliste aus den seit der letzten Synchronisation geschlossenen Tickets (`before_sync..HEAD`). Ohne Argument synchronisiert es nur, räumt ab und erstellt die Checkliste.
4. **`/wdi-prune-or-archive [--spec <id> | --all-closed] [--archive | --prune] [--dry-run]`**  
   Verschiebt geschlossene Spezifikationen aus `.scratch/` nach `.archive/specs/` oder entfernt sie mit `git rm`, über `lifecycle.py`, das zuerst prüft und bei einem Fehler zurückrollt. Die Zeile der Spezifikation bleibt in `specs.yaml`. Ohne Argument fragt es nach.

---

### Option C: Schneller Pfad (`/implement` direkt)
Eine Korrektur darf jedes Gate überspringen, wenn sie kein FR, keinen UC, kein AD-N und nicht das Domänenmodell ändert, höchstens ein Ticket umfasst und weder Geld noch personenbezogene Daten noch eine Drittanbieter-Integration berührt. Sie führen `/implement` direkt aus, ohne Wrapper-Skill. Stellt sich heraus, dass die Korrektur ein FR berührt, stoppt die Arbeit und wird zu einer Spezifikation der Größe S (höchstens 3 Tickets), die über `wdi-build` läuft.

---

## Praxisregeln

Betriebsregeln aus dem Betrieb autonomer Coding-Schleifen in echten Produkt-Repositories:

### 1. Builder fest beim Koordinator (`builder: coordinator`)
In `wdi-daily-autopilot` ist `roles.builder` in `.control/custom-dispatch.yaml` fest auf `coordinator` gesetzt. Das Delegieren von Code an Subagenten führte zu falschen Abschlussmeldungen (ein Subagent behauptete, die Tests seien bestanden, ohne eine Datei bearbeitet zu haben). Die koordinierende Sitzung schreibt den Code selbst, test-first.

### 2. Reviewer nur mit Lesezugriff
Peer-Reviewer laufen nur mit Lesezugriff. Sie hinterfragen Edge Cases und lesen Diffs, ändern aber nie Code und führen nie Builds aus; nur die koordinierende Sitzung schreibt. Bei `risk_accepted: low` wird das Umgehen des Peer-Reviews abgelehnt, weil der Code dort zwei Reviewer braucht, die nicht der Builder sind.

### 3. Dateisperren unter Windows (Desktop Process Gate)
Unter Windows hält ein laufendes App-Binary oder ein Build-Daemon im Hintergrund Datei-Handles offen, und ein Rebuild oder das Löschen eines Worktrees schlägt dann mit `Access is denied` fehl. Mit dem Ziel `desktop` prüft `wdi-daily-what-to-test` vor dem Rebuild, ob das App-Binary noch läuft. Es schließt die App nur, wenn sein eigener vorheriger Smoke-Lauf sie gestartet hat; andernfalls meldet es die PID und hält an, damit Sie sie selbst schließen können. Es beendet nie einen Prozess gewaltsam.

### 4. Die Schleife läuft auf ihrem eigenen Branch
Das Verfassen von Spezifikationen und Tickets geschieht auf dem Entwicklungsbranch. Die Schleife läuft auf ihrem eigenen Branch, `autopilot/<mandate-id>`, in einem isolierten Worktree oder in einem sauberen Checkout, den nur dieser Lauf nutzt. Sie läuft nie auf einem geteilten oder unsauberen Checkout.

### 5. Ein Cloud-CI-Lauf pro Autopilot-Lauf
Die Schleife macht pro Ticket einen Commit, und die lokale Testsuite ist während des Laufs der Nachweis. Cloud CI läuft einmal pro Autopilot-Lauf, am Ende: wenn der eine PR als bereit zur Überprüfung markiert wird oder wenn der Workflow einmal ausgelöst wird. Pushes während des Laufs starten keinen Cloud-Lauf.

### 6. Maschinenlokale Smoke-Dateien
Smoke-Cursor (`.work/smoke/last-sync`) und Runtime-Manifeste gehören zu einer Maschine. Der Installer fügt `.work/smoke/` zu `.gitignore` hinzu, sodass maschinenlokale Smoke-Dateien den Arbeitsbaum nie unsauber hinterlassen.

---

## Konfiguration (`custom-dispatch.yaml`)

Maschinenspezifische Runner-Befehle und Modell-Flags liegen in `.control/custom-dispatch.yaml`. Der Installer erstellt die Datei aus `.control/custom-dispatch.yaml.example`, wenn sie fehlt, und fügt sie zu `.gitignore` hinzu; nur das Beispiel wird committet.

Ein als Reviewer benannter Runner MUSS nur Lesezugriff haben. Das Flag für Lesezugriff je CLI: `claude --permission-mode plan`, `kiro-cli --trust-tools=fs_read`, `cursor-agent --mode plan`. Die Beispiel-Runner in der Vorlage verwenden es alle.

---

## Skill-Verzeichnis (22)

WDI Method installiert 22 Skills: 7 Gate-Skills, 5 für das Daily Tier (einschließlich `wdi-autopilot`) und 10, die Sie jederzeit ausführen.

Wie ein Skill startet:
- **Sie tippen ihn ein**: die vier Daily-Tier-Skills, `wdi-build` und `wdi-explain-to-me` (sie tragen `disable-model-invocation: true`).
- **Sie tippen ihn ein, oder der Agent nennt ihn und wartet auf Ihre Freigabe**: die übrigen Skills.
- **Der Agent darf ihn selbstständig ausführen (nur Lesezugriff)**: `wdi-help`.
- **Ausgelöst durch `/loop` unter einem akzeptierten Mandat**: `wdi-autopilot`. Unter einem Mandat führt `wdi-autopilot` auch die übrigen Skills aus.

| Skill | Was er tut | Wie er startet |
|---|---|---|
| **Gate-Skills** | | |
| `/wdi-init` | Vor G1 und am Ende von G2: richtet Registries, Komponenten, `mode` und `risk_accepted`, die zwei Strukturkarten, die Engine-Prüfung und Inventar-Leser ein. | Sie tippen ihn ein, oder der Agent nennt ihn |
| `/wdi-problem` | G1. Führt den Product-Brief-Skill von BMad aus und prüft den Brief anschließend anhand des Leitfadens der Methode. Schreibt den Brief nie selbst. | Sie tippen ihn ein, oder der Agent nennt ihn |
| `/wdi-product` | G2. Führt den PRD-Skill von BMad für ein neues PRD oder ein geändertes Versprechen aus und prüft es anschließend anhand des PRD-Leitfadens. Schreibt das PRD nie selbst. | Sie tippen ihn ein, oder der Agent nennt ihn |
| `/wdi-ux` | Optional, zusammen mit G2. Führt den UX-Skill von BMad aus und legt die Designergebnisse dort ab, wo sie hingehören. Schreibt nie selbst UX-Inhalte. | Sie tippen ihn ein, oder der Agent nennt ihn |
| `/wdi-blueprint` | G3, einmal pro Produkt. Das Gesamtbild des Produkts: Use Cases, Akteure, Domänenmodell, Geschäftsregeln, Glossar, das Architektur-Rückgrat, C4 sowie die API-, Tabellen- und Bildschirminventare. | Sie tippen ihn ein, oder der Agent nennt ihn |
| `/wdi-component` | G4. Die Tiefe einer Komponente, so tief wie ihr `mode` und nicht tiefer. Übersprungen bei `mode: catalog`. | Sie tippen ihn ein, oder der Agent nennt ihn |
| `/wdi-build` | G5. Eine Spezifikation von offen bis geschlossen: Sie führen `to-spec` und `to-tickets` aus, jedes Ticket geht bis zu einem grünen PR, dann wird die Spezifikation geschlossen. Es merged nie. | Sie tippen ihn ein |
| **Daily Tier** | | |
| `/wdi-daily-what-to-build` | Wandelt Notizen aus manuellen Tests in eine geprüfte Spezifikation oder ein geprüftes Ticket für einen späteren Autopilot-Lauf um. Hält vor Code, Commit oder Push an. | Sie tippen ihn ein |
| `/wdi-daily-autopilot` | Prüft, ob ein akzeptiertes Mandat vorliegt (führt den Preflight aus, wenn keines vorliegt), ermittelt die Reviewer aus der lokalen Konfiguration und startet die Schleife, standardmäßig alle 10 Minuten. | Sie tippen ihn ein |
| `/wdi-autopilot` | Die Schleife selbst: arbeitet jedes FR unter einem akzeptierten Mandat ab, auf einem Branch mit einem PR, und schreibt jede Entscheidung in ein Ledger. | Ausgelöst durch `/loop` unter einem akzeptierten Mandat |
| `/wdi-daily-what-to-test` | Nach einem Merge: synchronisiert den Entwicklungsbranch, räumt gemergte Branches und Worktrees ab, bereitet die App für manuelle Tests vor und erstellt eine Checkliste aus den geschlossenen Tickets. | Sie tippen ihn ein |
| `/wdi-prune-or-archive` | Verschiebt geschlossene Spezifikationen nach `.archive/specs/` oder entfernt sie mit `git rm`, über `lifecycle.py`, das zuerst prüft und bei einem Fehler zurückrollt. Die Zeile der Spezifikation bleibt in `specs.yaml`. | Sie tippen ihn ein |
| **Jederzeit** | | |
| `/wdi-help` | Liest die Status-Registry und nennt Ihnen das aktuelle Gate, die offenen Spezifikationen und den nächsten Skill. | Der Agent darf ihn selbstständig ausführen (nur Lesezugriff) |
| `/wdi-explain-to-me` | Übernimmt das Lesen, bevor Sie entscheiden: recherchiert und informiert Sie dann in sechs festen Abschnitten. Schreibt keine Datei. | Sie tippen ihn ein |
| `/wdi-decision` | Eröffnet, akzeptiert und wendet eine nummerierte Entscheidung (`DEC-`) an und überträgt sie in die Dokumente, die sie regelt. | Sie tippen ihn ein, oder der Agent nennt ihn |
| `/wdi-question` | Legt etwas, das sich jetzt nicht entscheiden lässt, in einer von vier Listen in `.control/questions/` ab und schließt es, wenn die Antwort eintrifft. | Sie tippen ihn ein, oder der Agent nennt ihn |
| `/wdi-log` | Hält ein beendetes Meeting oder eine nicht technische Tatsache fest, die einschränkt, was gebaut werden darf. | Sie tippen ihn ein, oder der Agent nennt ihn |
| `/wdi-report` | Zahlen zum Projekt: Fortschritt, Schätzungen, Aufgabenzeilen für einen Tracker oder ein eigenständiger Brief oder ein eigenständiges PRD. Erfindet nie eine Zahl. | Sie tippen ihn ein, oder der Agent nennt ihn |
| `/wdi-reconcile` | Vor einem Gate oder nach einer Reihe von Änderungen: meldet Drift zwischen `.what`, `.how`, `.control` und den Regeln der Methode. Nur Lesezugriff. | Sie tippen ihn ein, oder der Agent nennt ihn |
| `/wdi-review` | Prüft jedes Korpusdokument und muss vor einem Gate für das Rückgrat, SRS, SDD und SPEC laufen. Seine Linsen folgen `risk_accepted`. Nicht für Code-Reviews. | Sie tippen ihn ein, oder der Agent nennt ihn |
| `/wdi-systematic-debugging` | Für jeden Fehler, fehlschlagenden Test oder fehlgeschlagenen Build, bevor eine Korrektur vorgeschlagen wird: die Grundursache finden und jeweils eine Hypothese testen. | Sie tippen ihn ein, oder der Agent nennt ihn |
| `/wdi-upgrade` | Direkt nach `wdi-method update`: überführt Dokumente und Registry-Dateien, die noch in der alten Form vorliegen, in die neue und prüft anschließend, ob die Validierung grün ist. | Sie tippen ihn ein, oder der Agent nennt ihn |

---

## Repository-Struktur

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

## Mitwirkung

Jeder Beitrag zu WDI Method beantwortet eine Frage: **Macht dies die Überprüfungsschicht vertrauenswürdiger, oder macht es sie nur dicker?** Siehe [CONTRIBUTING.md](CONTRIBUTING.md).

### Fixture Corpus und lokale Verifikation
Änderungen an Validatoren und an der Methode werden gegen das Fixture Corpus (`tests/fixture/`) nachgewiesen. Führen Sie die Suite aus, bevor Sie einen Pull Request öffnen:
```bash
npm test
```
Die Suite führt die vier Python-PEP-723-Skripte (`validate.py`, `timeline.py`, `inventory.py`, `lifecycle.py`) gegen das Fixture aus und prüft die Plattform-Registry, die Dateien, die jede Plattform erhält, sowie die Integrität des Kits.

### Richtlinie für öffentliche generische Pakete
WDI Method wird in der öffentlichen npm-Registry veröffentlicht. Es darf nie private Kundennamen, kommerzielle Produktidentitäten, Zugangsdaten oder absolute Dateisystempfade enthalten.

---

## Lizenz und Datenschutz

- **Code-Lizenz:** [MIT-Lizenz](LICENSE).
- **Datenschutz:** WDI Method selbst macht keine Netzwerkaufrufe; Ihr Coding-Agent kommuniziert weiterhin mit seinem Modellanbieter. Siehe [PRIVACY.md](PRIVACY.md) und [SECURITY.md](SECURITY.md).

## The name and the icon

Maßgeblich ist der folgende englische Text.

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

Wir verwenden dieselbe Methode in Kundenprojekten. [Wira Delta Indonesia kontaktieren](https://wiradelta.id/#contact).
