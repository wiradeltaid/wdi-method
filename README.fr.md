# WDI Method

> Une couche de révision au-dessus de BMad : des documents qu'un humain lit pour vérifier les décisions techniques avant l'écriture du code, dimensionnés selon ce que le changement mérite réellement.

[English](README.md) | [Bahasa Indonesia](README.id.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Español](README.es.md) | [Deutsch](README.de.md) | [Français](README.fr.md) | [Português (Brasil)](README.pt-BR.md) | [Русский](README.ru.md)  
[Website](https://wiradelta.id/wdi-method/docs/) | [Changelog](CHANGELOG.md) | [Contributing](CONTRIBUTING.md) | [License](LICENSE) | [Security](SECURITY.md) | [Privacy](PRIVACY.md)

---

> **Avis de traduction :** Ce fichier est une traduction de [README.md](README.md) fournie uniquement à titre indicatif. En cas de divergence ou de conflit d'interprétation, la version officielle en langue anglaise (`README.md`) prévaut. L'ensemble de la documentation technique approfondie et des documents juridiques est maintenu en anglais.

[BMad](https://github.com/bmad-code-org/BMAD-METHOD) écrit des documents pour les agents IA. WDI Method ajoute des documents que de nombreux rôles lisent déjà : cas d'utilisation, diagrammes C4, listes d'API et de base de données, et documents de conception. Il englobe BMad sans le remplacer : les compétences du brief, du PRD, de l'UX et de l'architecture (`wdi-problem`, `wdi-product`, `wdi-ux` et `wdi-blueprint` pour la colonne vertébrale) confient la rédaction à une compétence BMad, puis vérifient le résultat par rapport aux guides de la méthode.

> Ce dépôt est **public et générique**. Il NE DOIT contenir aucun nom de client, aucun nom de produit commercial ni aucun lien vers un dépôt privé. L'identité du produit réside entièrement dans le dépôt qui l'installe.

---

## Développement Piloté par l'IA (AiDD) vs. Vibe Coding

Le vibe coding utilise lui aussi des spécifications, mais pas de manière cohérente : chaque session de prompts peut différer, les documents ne sont pas structurés et le processus n'est pas tenu de façon systématique. Le résultat est une efficience et une efficacité bien moindres, et un risque réel d'accumuler de la dette technique. C'est pourquoi un framework est nécessaire.

Dans WDI Method, le Développement Piloté par l'IA (AiDD) suit un ordre : des promesses enregistrées comme FR et cas d'utilisation, puis les gates, puis la spécification découpée en tickets avec `to-spec` et `to-tickets`, puis chaque ticket construit en commençant par les tests, puis une PR que le propriétaire révise et fusionne.

Trois couches font le travail :

| Couche | Qui | Ce qu'elle fait |
|---|---|---|
| 1. Documents pour les agents | [BMad](https://github.com/bmad-code-org/BMAD-METHOD) | Rédige le product brief, le PRD, l'UX et la colonne vertébrale de l'architecture, chacun via une compétence BMad |
| 2. Couche de révision | WDI Method | Englobe ces compétences, ajoute les documents que lisent les autres rôles, exécute cinq gates humains, relie Objectif → FR → UC → Ticket → Test et vérifie la dérive du corpus |
| 3. Tickets et code | Moteurs ([mattpocock/skills](https://github.com/mattpocock/skills)) | `to-spec` et `to-tickets` découpent la spécification en tickets verticaux ; `implement` construit chacun en commençant par les tests |

### Les Documents Suivent le Code (Documents Follow Code)

Un document en retard sur le code est dans son état attendu, ce n'est pas un défaut. Lorsque le propriétaire a choisi le code plutôt qu'un document, c'est le document qui est corrigé. Un document en avance sur le code, comme une spécification pas encore construite, est également normal.

---

## Installation en 3 Étapes

### Prérequis

- Node.js 20 ou ultérieur.
- Git.
- [uv](https://docs.astral.sh/uv/), qui exécute les validateurs Python 3.11+ de la méthode.
- Une plateforme d'agents : Claude Code, Cursor, Codex et d'autres plateformes d'agents.

Exécutez les trois étapes dans l'ordre. L'installateur s'arrête si l'étape 1 ou l'étape 2 n'a pas été faite. Toutes les invites proposent des valeurs par défaut ; appuyez sur <kbd>Enter</kbd> pour les accepter.

### Étape 1 : Installer BMad Method
```bash
cd /path/to/your/product-repo
npx bmad-method install
```

### Étape 2 : Ajouter les Six Moteurs
Installez les moteurs dans votre dépôt (choisissez "copy" ou "symlink") :
```bash
npx skills@latest add mattpocock/skills
```
*Sélectionnez les six moteurs que pilote la méthode :* `to-spec`, `to-tickets`, `implement`, `tdd`, `code-review` et `domain-modeling`.

> **Pourquoi le plugin Claude Code ne suffit pas :** Trois des six moteurs (`to-spec`, `to-tickets`, `implement`) sont livrés avec `disable-model-invocation: true`. À chaque installation et mise à jour, WDI Method retire cette ligne des copies présentes dans votre dépôt, afin que `wdi-build` et `wdi-autopilot` puissent les exécuter. Il ne peut pas modifier un plugin au niveau utilisateur, donc l'installateur s'arrête tant que les moteurs ne sont pas dans le dépôt. `--skip-engines-check` ignore cette vérification.

### Étape 3 : Installer WDI Method
Lance l'installateur interactif et place les compétences là où chacune de vos plateformes d'agents les lit :
```bash
npx wdi-method
```
*(Non interactif : `npx wdi-method install --yes --agents claude-code --product "Your Product"`)*

> **Ce que l'installateur modifie dans BMad :** L'installateur désactive aussi l'invocation par le modèle pour 13 compétences BMad de build et de sprint que les moteurs remplacent, et ajoute les règles de refus correspondantes à `.claude/settings.json`. Vous pouvez toujours les exécuter en tapant la commande.

### Votre Première Commande : `/wdi-help`
Dans votre agent de codage, exécutez :
```text
/wdi-help
```
`wdi-help` lit `.control/registry/` et vous indique le gate où se trouve votre projet, les spécifications ouvertes et la compétence suivante, sans deviner à partir de la conversation.

---

## Trois Options de Flux de Travail

WDI Method dimensionne son cérémonial selon l'ampleur et le risque de la tâche.

### Option A : Parcours de Livraison Guidé (G1 à G5)
Pour les nouveaux produits, les initiatives majeures et les changements d'architecture. Vous lancez la compétence de chaque gate ; l'agent nomme la suivante et attend.

**Une Décision par Gate.** Chaque gate décide une chose. De G1 à G4, vous lisez une page générée ; à G5, vous lisez les lignes RTM de la spécification. Vous répondez à une courte liste de contrôle, et un seul « non » à une question étoilée bloque le gate.

| Gate | Décide | Compétence | Ce que vous lisez | Décision du propriétaire |
|---|---|---|---|---|
| **G1 Problem** | Quel est le problème, à qui il appartient et pourquoi il mérite du travail | `/wdi-problem` | `.what-rendered/_product-brief/brief.md` | Approuver la formulation du problème |
| **G2 Product** | Ce qui est construit, et l'impression qu'il donne à l'usage | `/wdi-product`<br>`/wdi-ux` (optionnel) | `.what-rendered/_prd/<slug>/prd.md` | Approuver les promesses fonctionnelles (FR) |
| **G3 Blueprint** | La vue d'ensemble du produit, une fois par produit | `/wdi-blueprint` | `.how-rendered/blueprint.md` | Approuver la colonne vertébrale de l'architecture |
| **G4 Component** | Comment un composant est construit (ignoré avec `mode: catalog`) | `/wdi-component` | `.how-rendered/<pc>/SDD-<pc>.md` | Approuver la conception logicielle |
| **G5 Release** | S'il est terminé et prouvé | `/wdi-build` | Les lignes RTM de la spécification dans `.control/generated/` et les preuves de test de chaque ticket | Accepter la spécification comme terminée, ou la renvoyer |

**Affiner, Ne Pas Avancer.** Un seul « non » à une question étoilée (★) de la liste de contrôle bloque le gate. Affinez le document et relancez le gate ; ne l'approuvez pas avec l'idée de corriger plus tard.

#### Deux Champs qui Ne Fusionnent Jamais
- **`mode`** fixe la profondeur des documents de chaque composant. `catalog` (par défaut) : rien au-delà du blueprint, et G4 est ignoré. `outline` : flux complets pour jusqu'à 3 cas d'utilisation, règles métier locales, un résumé des décisions. `guarded` : ajoute une section `Failure Behaviour` pour chaque frontière et des documents d'intégration tierce. `deep` : ajoute une analyse de robustesse, un contrat par endpoint, un dictionnaire de données, des diagrammes de flux et des machines à états.
- **`risk_accepted`** fixe la sévérité de la révision. `high` (vous acceptez beaucoup de risque) : les lentilles de base de structure et de rédaction. `medium` : ajoute la lentille des cas limites. `low` : ajoute la lentille des cas limites, et le code a besoin de deux relecteurs qui ne sont pas le constructeur.

Si un seul champ fixait les deux, la seule façon d'obtenir un document mince serait d'inscrire dans le registre des risques plus de risque que vous n'en acceptez réellement.

---

### Option B : Opérations Quotidiennes Autonomes (Daily Tier)
Une fois l'architecture en place, le travail quotidien suit un rythme journalier à travers quatre compétences que vous tapez dans votre agent :

1. **`/wdi-daily-what-to-build [reviewer] <notes>`**  
   Transforme des notes de tests manuels, des observations QA ou des rapports de bugs en une spécification ou un ticket révisé sur la branche de développement, pour une exécution ultérieure de l'autopilot. Il s'arrête là : il ne fait jamais de commit ni de push et ne lance jamais l'autopilot.
2. **`/wdi-daily-autopilot [self-review] [peer] [interval] [--skip-peer-review]`**  
   Vérifie l'existence d'un mandat accepté et exécute le preflight s'il n'y en a pas, détermine les relecteurs à partir de la configuration locale et lance la boucle (par défaut `/loop 10m /wdi-autopilot`). La boucle travaille sur la branche `autopilot/<mandate-id>`, écrit le code en commençant par les tests, consigne chaque décision dans son registre et se termine par une PR prête pour la révision. Le propriétaire fusionne.
3. **`/wdi-daily-what-to-test [web <target> | mobile <target> | desktop]`**  
   Après une fusion : synchronise la branche de développement, supprime les branches et worktrees fusionnés, prépare l'application pour les tests manuels et construit une liste de contrôle à partir des tickets fermés depuis la dernière synchronisation (`before_sync..HEAD`). Sans argument, il se contente de synchroniser, de supprimer et de construire la liste de contrôle.
4. **`/wdi-prune-or-archive [--spec <id> | --all-closed] [--archive | --prune] [--dry-run]`**  
   Déplace les spécifications fermées de `.scratch/` vers `.archive/specs/`, ou les supprime avec `git rm`, via `lifecycle.py`, qui vérifie d'abord et annule en cas d'échec. La ligne de la spécification reste dans `specs.yaml`. Sans argument, il pose la question.

---

### Option C : Voie Rapide (`/implement` Directement)
Un correctif peut ignorer tous les gates lorsqu'il ne modifie aucun FR, UC, AD-N ni le modèle de domaine, tient en un ticket au plus et ne touche ni à l'argent, ni aux données personnelles, ni à une intégration tierce. Vous exécutez `/implement` directement, sans compétence d'encapsulation. Si le correctif s'avère toucher un FR, le travail s'arrête et devient une spécification de taille S (3 tickets au plus), qui passe par `wdi-build`.

---

## Règles de Terrain

Règles opérationnelles tirées de l'exécution de boucles de codage autonomes sur de vrais dépôts de produits :

### 1. Constructeur Fixé au Coordinateur (`builder: coordinator`)
Dans `wdi-daily-autopilot`, `roles.builder` dans `.control/custom-dispatch.yaml` est fixé à `coordinator`. Déléguer le code à des sous-agents a produit de faux rapports d'achèvement (un sous-agent affirmant que les tests passaient sans avoir modifié le moindre fichier). La session coordinatrice écrit elle-même le code, en commençant par les tests.

### 2. Relecteurs en Lecture Seule
Les relecteurs pairs s'exécutent en lecture seule. Ils remettent en question les cas limites et lisent les diffs, mais ne modifient jamais le code et ne lancent jamais de build ; seule la session coordinatrice écrit. Avec `risk_accepted: low`, le contournement de la revue par les pairs est refusé, car le code y a besoin de deux relecteurs qui ne sont pas le constructeur.

### 3. Verrous de Fichiers sous Windows (Desktop Process Gate)
Sous Windows, un binaire d'application en cours d'exécution ou un démon de build en arrière-plan garde des descripteurs de fichiers ouverts, et une recompilation ou la suppression d'un worktree échoue alors avec `Access is denied`. Avec la cible `desktop`, `wdi-daily-what-to-test` vérifie si le binaire de l'application tourne encore avant de recompiler. Il ne ferme l'application que si sa propre exécution smoke précédente l'a lancée ; sinon, il signale le PID et s'arrête, pour que vous puissiez la fermer vous-même. Il ne force jamais l'arrêt d'un processus.

### 4. La Boucle Tourne sur sa Propre Branche
La rédaction des spécifications et des tickets se fait sur la branche de développement. La boucle tourne sur sa propre branche, `autopilot/<mandate-id>`, dans un worktree isolé ou dans un checkout propre utilisé uniquement par cette exécution. Elle ne tourne jamais sur un checkout partagé ou contenant des modifications non validées.

### 5. Une Exécution de Cloud CI par Exécution de l'Autopilot
La boucle fait un commit par ticket, et la suite de tests locale constitue la preuve pendant l'exécution. Cloud CI s'exécute une fois par exécution de l'autopilot, à la fin : lorsque l'unique PR est marquée prête pour la révision, ou lorsque le workflow est déclenché une fois. Les push pendant l'exécution ne lancent aucune exécution dans le cloud.

### 6. Fichiers Smoke Locaux à la Machine
Les curseurs smoke (`.work/smoke/last-sync`) et les manifestes d'exécution appartiennent à une seule machine. L'installateur ajoute `.work/smoke/` à `.gitignore`, de sorte que les fichiers smoke locaux ne laissent jamais l'arbre de travail avec des modifications non validées.

---

## Configuration (`custom-dispatch.yaml`)

Les commandes de runner et les flags de modèle propres à chaque machine se trouvent dans `.control/custom-dispatch.yaml`. L'installateur le crée à partir de `.control/custom-dispatch.yaml.example` lorsqu'il est absent, et l'ajoute à `.gitignore` ; seul l'exemple est commité.

Un runner désigné comme relecteur DOIT être en lecture seule. Le flag de lecture seule par CLI : `claude --permission-mode plan`, `kiro-cli --trust-tools=fs_read`, `cursor-agent --mode plan`. Les runners d'exemple du modèle l'utilisent tous.

---

## Répertoire des Compétences (22)

WDI Method installe 22 compétences : 7 compétences de gate, 5 pour le daily tier (dont `wdi-autopilot`) et 10 que vous exécutez à tout moment.

Comment une compétence démarre :
- **Vous la tapez** : les quatre compétences du daily tier et `wdi-explain-to-me` (elles portent `disable-model-invocation: true`).
- **Vous la tapez, ou `wdi-autopilot` l'exécute sous un mandat accepté** : `wdi-build`. Elle ne porte pas le flag `disable-model-invocation`, car `wdi-autopilot` doit l'invoquer ; la règle selon laquelle les agents ne la lancent pas d'eux-mêmes figure dans la Method policy que l'installateur écrit dans `CLAUDE.md` et `AGENTS.md`.
- **Vous la tapez, ou l'agent la nomme et attend votre feu vert** : les autres compétences.
- **L'agent peut l'exécuter de lui-même (lecture seule)** : `wdi-help`.
- **Déclenchée par `/loop` sous un mandat accepté** : `wdi-autopilot`. Sous un mandat, `wdi-autopilot` exécute aussi les autres compétences.

| Compétence | Ce qu'elle fait | Comment elle démarre |
|---|---|---|
| **Compétences de gate** | | |
| `/wdi-init` | Avant G1 et à la fin de G2 : met en place les registres, les composants, `mode` et `risk_accepted`, les deux cartes de structure, la vérification des moteurs et les lecteurs d'inventaire. | Vous la tapez, ou l'agent la nomme |
| `/wdi-problem` | G1. Exécute la compétence de product brief de BMad, puis vérifie le brief par rapport au guide de la méthode. N'écrit jamais le brief elle-même. | Vous la tapez, ou l'agent la nomme |
| `/wdi-product` | G2. Exécute la compétence PRD de BMad pour un nouveau PRD ou une promesse modifiée, puis le vérifie par rapport au guide du PRD. N'écrit jamais le PRD elle-même. | Vous la tapez, ou l'agent la nomme |
| `/wdi-ux` | Optionnelle, avec G2. Exécute la compétence UX de BMad et range les résultats de conception là où ils doivent aller. N'écrit jamais de contenu UX elle-même. | Vous la tapez, ou l'agent la nomme |
| `/wdi-blueprint` | G3, une fois par produit. La vue d'ensemble du produit : cas d'utilisation, acteurs, modèle de domaine, règles métier, glossaire, la colonne vertébrale de l'architecture, C4, et les inventaires d'API, de tables et d'écrans. | Vous la tapez, ou l'agent la nomme |
| `/wdi-component` | G4. La profondeur d'un composant, aussi profonde que son `mode` et pas davantage. Ignorée avec `mode: catalog`. | Vous la tapez, ou l'agent la nomme |
| `/wdi-build` | G5. Une spécification de l'ouverture à la clôture : vous exécutez `to-spec` et `to-tickets`, chaque ticket aboutit à une PR au vert, puis la spécification est clôturée. Elle ne fusionne jamais. | Vous la tapez, ou `wdi-autopilot` l'exécute |
| **Daily tier** | | |
| `/wdi-daily-what-to-build` | Transforme des notes de tests manuels en une spécification ou un ticket révisé pour une exécution ultérieure de l'autopilot. S'arrête avant le code, le commit ou le push. | Vous la tapez |
| `/wdi-daily-autopilot` | Vérifie l'existence d'un mandat accepté (exécute le preflight s'il n'y en a pas), détermine les relecteurs à partir de la configuration locale et lance la boucle, toutes les 10 minutes par défaut. | Vous la tapez |
| `/wdi-autopilot` | La boucle elle-même : traite chaque FR sous un mandat accepté, sur une branche avec une PR, et consigne chaque décision dans un registre. | Déclenchée par `/loop` sous un mandat accepté |
| `/wdi-daily-what-to-test` | Après une fusion : synchronise la branche de développement, supprime les branches et worktrees fusionnés, prépare l'application pour les tests manuels et construit une liste de contrôle à partir des tickets fermés. | Vous la tapez |
| `/wdi-prune-or-archive` | Déplace les spécifications fermées vers `.archive/specs/` ou les supprime avec `git rm`, via `lifecycle.py`, qui vérifie d'abord et annule en cas d'échec. La ligne de la spécification reste dans `specs.yaml`. | Vous la tapez |
| **À tout moment** | | |
| `/wdi-help` | Lit le registre d'état et vous indique le gate actuel, les spécifications ouvertes et la compétence suivante. | L'agent peut l'exécuter de lui-même (lecture seule) |
| `/wdi-explain-to-me` | Fait la lecture avant que vous ne décidiez : enquête, puis vous informe en six sections fixes. N'écrit aucun fichier. | Vous la tapez |
| `/wdi-decision` | Ouvre, accepte et applique une décision numérotée (`DEC-`), et la reporte dans les documents qu'elle régit. | Vous la tapez, ou l'agent la nomme |
| `/wdi-question` | Classe ce qui ne peut pas être décidé maintenant dans l'une des quatre listes de `.control/questions/`, et le clôt lorsque la réponse arrive. | Vous la tapez, ou l'agent la nomme |
| `/wdi-log` | Consigne une réunion terminée ou un fait non technique qui limite ce qui peut être construit. | Vous la tapez, ou l'agent la nomme |
| `/wdi-report` | Des chiffres sur le projet : avancement, estimations, lignes de tâches pour un tracker, ou un brief ou un PRD autonome. N'invente jamais un chiffre. | Vous la tapez, ou l'agent la nomme |
| `/wdi-reconcile` | Avant un gate ou après une série de changements : signale la dérive entre `.what`, `.how`, `.control` et les règles de la méthode. Lecture seule. | Vous la tapez, ou l'agent la nomme |
| `/wdi-review` | Révise n'importe quel document du corpus, et doit s'exécuter avant un gate pour la colonne vertébrale, le SRS, le SDD et le SPEC. Ses lentilles suivent `risk_accepted`. Pas pour la revue de code. | Vous la tapez, ou l'agent la nomme |
| `/wdi-systematic-debugging` | Pour tout bug, test en échec ou build échoué, avant de proposer un correctif : trouver la cause racine et tester une hypothèse à la fois. | Vous la tapez, ou l'agent la nomme |
| `/wdi-upgrade` | Juste après `wdi-method update` : fait passer les documents et fichiers de registre encore dans l'ancienne forme à la nouvelle, puis vérifie que la validation est au vert. | Vous la tapez, ou l'agent la nomme |

---

## Structure du Dépôt

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

## Contribution

Chaque contribution à WDI Method répond à une question : **cela rend-il la couche de révision plus digne de confiance, ou seulement plus épaisse ?** Voir [CONTRIBUTING.md](CONTRIBUTING.md).

### Fixture Corpus et Vérification Locale
Les modifications des validateurs et de la méthode sont démontrées sur le fixture corpus (`tests/fixture/`). Exécutez la suite avant d'ouvrir une pull request :
```bash
npm test
```
La suite exécute les quatre scripts Python PEP 723 (`validate.py`, `timeline.py`, `inventory.py`, `lifecycle.py`) sur le fixture, et vérifie le registre des plateformes, les fichiers que reçoit chaque plateforme, ainsi que l'intégrité du kit.

### Règle du Paquet Générique Public
WDI Method est publié sur le registre npm public. Il ne doit jamais contenir de noms de clients privés, d'identités de produits commerciaux, d'identifiants ni de chemins absolus du système de fichiers.

---

## Licence et Confidentialité

- **Licence du code :** [Licence MIT](LICENSE).
- **Confidentialité :** WDI Method lui-même n'effectue aucun appel réseau ; votre agent de codage communique toujours avec son fournisseur de modèle. Voir [PRIVACY.md](PRIVACY.md) et [SECURITY.md](SECURITY.md).

## The name and the icon

C'est le texte anglais ci-dessous qui s'applique.

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

Nous utilisons la même méthode sur les projets de nos clients. [Contacter Wira Delta Indonesia](https://wiradelta.id/#contact).
