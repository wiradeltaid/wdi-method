# WDI Method

> La couche de révision que BMad laisse mince — des spécifications vérifiables qu'un humain lit pour valider les décisions techniques avant l'écriture du code, calibrées selon l'ampleur réelle du changement.

[English](README.md) | [Bahasa Indonesia](README.id.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Español](README.es.md) | [Deutsch](README.de.md) | [Français](README.fr.md) | [Português (Brasil)](README.pt-BR.md) | [Русский](README.ru.md)  
[Website](https://wiradelta.id/wdi-method) | [Changelog](CHANGELOG.md) | [Contributing](CONTRIBUTING.md) | [License](LICENSE) | [Security](SECURITY.md) | [Privacy](PRIVACY.md)

---

> **Avis de traduction :** Ce fichier est une traduction de [README.md](README.md) fournie uniquement à titre indicatif. En cas de divergence ou de conflit d'interprétation, la version officielle en langue anglaise (`README.md`) prévaut. L'ensemble de la documentation technique approfondie et des documents juridiques est maintenu en anglais.

[BMad](https://github.com/bmad-code-org/BMAD-METHOD) détermine *quoi* construire et *comment* structurer solidement les solutions. WDI Method l'englobe — sans le remplacer — en fournissant la couche de gouvernance vérifiable entre les décisions d'architecture de haut niveau et le code en production : registres d'exigences, catalogues de cas d'utilisation, limites de composants, validateurs automatiques de dérive et boucles quotidiennes autonomes sans friction.

> Ce dépôt est **public et générique**. Il NE DOIT contenir aucun nom de client privé, aucun nom de produit commercial ni aucun lien vers un dépôt privé. L'identité du produit est entièrement définie au sein du dépôt qui installe ce paquet.

---

## Vue d'Ensemble : Développement Piloté par l'IA (AiDD) vs. Vibe Coding

Le prompting spéculatif sans spécifications (« vibe coding ») échoue inévitablement sur les systèmes de production au long cours : les agents de codage IA perdent le contexte, hallucinent des états d'achèvement et brouillent les limites des exigences. WDI Method établit une démarche rigoureuse de **Développement Piloté par l'IA (AiDD)** à travers une triade architecturale à trois niveaux :

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. Intention et Stratégie Produit : BMad Method                         │
│    Découverte des problèmes utilisateurs, rédaction du brief et archi   │
├─────────────────────────────────────────────────────────────────────────┤
│ 2. Couche de Révision Vérifiable : WDI Method (SSOT)                    │
│    Gouverne 5 jalons humains, lie Objectif → FR → UC → Tickets → Tests, │
│    exécute les validateurs de dérive et orchestre les boucles autonomes │
├─────────────────────────────────────────────────────────────────────────┤
│ 3. Découpage et Implémentation : Moteurs de Compétences (mattpocock)    │
│    to-spec & to-tickets découpent en traceurs ; implement exécute TDD   │
└─────────────────────────────────────────────────────────────────────────┘
```

### L'Invariant d'Or : Les Documents Suivent le Code (Documents Follow Code)
Les documents constituent la trace laissée par le travail déjà accompli. Lorsqu'un enregistrement de décision ou une exigence contredit le code, **le code l'emporte et le document est corrigé**. On ne modifie jamais le code pour l'adapter à une documentation obsolète. Un document simplement en retard sur le code est dans son état normal et ne bloque jamais la livraison sauf s'il induit une erreur critique.

---

## Démarrage Rapide en 10 Minutes

Installez WDI Method dans votre dépôt de produit en trois étapes séquentielles. Toutes les invites proposent des valeurs par défaut pertinentes ; appuyez sur <kbd>Entrée</kbd> pour valider.

### Étape 1 : Installer BMad Method
Installe le moteur de découverte dans votre dépôt :
```bash
cd /chemin/vers/votre/depot-produit
npx bmad-method install
```

### Étape 2 : Ajouter les Six Moteurs de Tickets
Installez les moteurs d'exécution directement dans votre dépôt (choisissez « copy » ou « symlink ») :
```bash
npx skills@latest add mattpocock/skills
```
*Sélectionnez les six moteurs pilotés par la méthode :* `to-spec`, `to-tickets`, `implement`, `tdd`, `code-review`, et `domain-modeling`.

> **Pourquoi le plugin Claude Code ne suffit pas :** Les moteurs amont sont distribués avec `disable-model-invocation: true`. WDI Method retire automatiquement ce drapeau des copies locales afin que les boucles autonomes puissent s'exécuter sans interruption humaine. Un plugin au niveau utilisateur ne peut pas être modifié depuis le dépôt.

### Étape 3 : Installer WDI Method
Lance l'installateur interactif et configure les compétences sur vos plateformes d'agents (Claude Code, Cursor, etc.) :
```bash
npx wdi-method
```
*(Pour les environnements CI automatisés : `npx wdi-method install --yes --agents claude --product "Votre Produit"`)*

### Votre Première Commande : `/wdi-help`
Au sein de votre agent de codage IA, exécutez :
```text
/wdi-help
```
`wdi-help` inspecte `.control/registry/` et indique le jalon précis où se situe votre projet, sans deviner à partir de l'historique de conversation.

---

## Trois Options de Flux de Travail

WDI Method adapte son niveau de cérémonie à l'envergure et au risque de la tâche :

### Option A : Parcours de Livraison Guidé (Nouvelles Initiatives et G1–G5)
Pour les nouveaux produits, initiatives majeures et refontes d'architecture. Un humain lit **une page générée** par jalon et décide : *valider ou affiner*.

| Jalon | Question Traitée | Compétence Invoquée | Livrable Rendu à Valider | Décision du Propriétaire |
|---|---|---|---|---|
| **G1 — Problème** | Le problème est-il réel et mérite-t-il du travail ? | `/wdi-problem` | `.what-rendered/_product-brief/brief.md` | Approuver le cadrage |
| **G2 — Produit** | Que construisons-nous et quel est le ressenti de l'interface ? | `/wdi-product`<br>`/wdi-ux` | `.what-rendered/_prd/<slug>/prd.md` | Approuver les promesses fonctionnelles (FR) |
| **G3 — Plan d'Ensemble** | L'architecture globale tient-elle ensemble ? *(1x/dépôt)* | `/wdi-blueprint` | `.how-rendered/blueprint.md` | Approuver la colonne vertébrale |
| **G4 — Composant** | Comment ce composant est-il conçu ? *(Ignoré en mode catalog)* | `/wdi-component` | `.how-rendered/<pc>/SDD-<pc>.md` | Approuver la conception logicielle (SDD) |
| **G5 — Construction** | Le ticket est-il construit, vérifié et prouvé ? *(Par spec)* | `/wdi-build` | Sortie du test runner (Red → Green) | Accepter le code fusionné |

#### Deux Curseurs qui Ne Fusionnent Jamais : Mode vs. Risk
- **`mode`** définit les jalons applicables (`catalog` ignore G4 ; `guarded` et `deep` imposent un SDD complet).
- **`risk_accepted`** détermine la profondeur de preuve de révision exigée (`low`, `medium`, `high`). Fusionner ces deux réglages alourdit inutilement les composants simples ou laisse passer des changements critiques sans vérification.

---

### Option B : Opérations Quotidiennes Autonomes (Fase 4 Daily Tier)
Une fois l'architecture établie, l'ingénierie courante devient un rythme quotidien continu :

1. **`/wdi-daily-what-to-build [reviewer] <notes>`** :  
   Transforme des notes de test manuel ou rapports de bugs en spécifications structurées. Classe les exigences et sollicite un avis consultatif en lecture seule.
2. **`/wdi-daily-autopilot [self-review] [peer] [interval]`** :  
   Lance la routine d'ingénierie autonome sous mandat formel approuvé (par défaut : `/loop 10m /wdi-autopilot`). Exécute des cycles TDD et tient à jour le registre d'audit.
3. **`/wdi-daily-what-to-test [web|mobile|desktop]`** :  
   Coordinateur des tests physiques post-fusion. Synchronise la branche de développement, nettoie les worktrees fusionnés et compile une checklist de tests physiques à partir du delta git.
4. **`/wdi-prune-or-archive [spec-id] [--archive|--prune]`** :  
   Maintient l'hygiène du dépôt en archivant ou nettoyant les spécifications closes tout en préservant 100% de traçabilité RTM.

---

### Option C : Voie Rapide (Exécuter `/implement` Directement)
Une correction mineure de bug qui ne touche aucun `FR`, `UC`, `AD-N` ou modèle de domaine saute tous les jalons documentaires et exécute directement `/implement`. Si la modification s'étend et touche une exigence fonctionnelle, **elle s'arrête immédiatement et devient une spécification explicite `S`**.

---

## Règles de Terrain & Savoir-Faire Opérationnel

Règles éprouvées en conditions réelles avec agents multiples :

1. **Rôle Builder Fixé au Coordinateur (`builder: coordinator`) :** Dans `wdi-daily-autopilot`, la session coordinatrice écrit le code directement via cycles TDD rouge-vert. Déléguer l'écriture à des sous-agents produit des hallucinations de tests réussis.
2. **Réviseurs Consultatifs Indépendants :** Les réviseurs pairs (tels que Terra) opèrent strictement en lecture seule (`--trust-tools=fs_read` / `--mode plan`). Ils examinent les cas limites sans jamais muter le code. Le principe de rédacteur unique (*Single-Writer*) est strictement préservé.
3. **Prévention des Verrous de Fichiers Windows (Process Gating) :** Sous Windows, les processus actifs en arrière-plan maintiennent des descripteurs ouverts, provoquant des erreurs `Access is denied (Exit code 5/32)` lors de la compilation ou du nettoyage de worktree. `wdi-daily-what-to-test` termine les processus résiduels avant compilation.
4. **Isolation Obligatoire en Git Worktree :** Les boucles autonomes de codage (`wdi-autopilot`) **doivent obligatoirement s'exécuter dans un git worktree isolé** (`autopilot/<mandate-id>`). Ne lancez jamais de boucles sans surveillance sur le répertoire principal.
5. **Déclenchement Unique de la CI Cloud par PR :** Les boucles autonomes committent localement par ticket. Lancer la CI cloud à chaque itération épuise rapidement les quotas mensuels. Les tests locaux fournissent la preuve faisant foi ; la CI cloud est déclenchée **une seule fois**, lorsque la Pull Request est prête pour revue.
6. **Hygiène des Artefacts de Smoke Tests Éphémères :** Les curseurs de smoke test et manifestes d'exécution sont locaux à la machine. Assurez-vous que `.work/smoke/` est inscrit dans le fichier `.gitignore`.

---

## Répertoire des 22 Compétences Officielles

| Domaine | Invoquées par l'Utilisateur (Commandes Développeur) | Invoquées par le Modèle / Orchestrées par Agent |
|---|---|---|
| **Livraison & Architecture (G1–G5)** | `/wdi-init`, `/wdi-problem`, `/wdi-product`, `/wdi-ux`, `/wdi-blueprint`, `/wdi-component`, `/wdi-build` | Pilotées séquentiellement par le coordinateur |
| **Opérations Quotidiennes Autonomes** | `/wdi-daily-what-to-build`, `/wdi-daily-autopilot`, `/wdi-daily-what-to-test`, `/wdi-prune-or-archive` | `/wdi-autopilot` (moteur de boucle autonome via `/loop`) |
| **Gouvernance & Diagnostics** | `/wdi-help`, `/wdi-explain-to-me`, `/wdi-decision`, `/wdi-question`, `/wdi-log`, `/wdi-report`, `/wdi-reconcile`, `/wdi-review`, `/wdi-systematic-debugging`, `/wdi-upgrade` | Revue consultative entre pairs et recueil de second avis |

---

## Structure du Dépôt et Invariants

```text
.constitution/
  method/            Moteur de la méthode — écrasé à chaque mise à jour ; ne jamais modifier ici
  project/           Règles propres au produit et lecteurs d'inventaire — préservés lors des mises à jour
.control/
  registry/          Source Unique de Vérité (SSOT) : goals.yaml · specs.yaml · components.yaml
  decisions/         Décisions acceptées et mandats formels du propriétaire (DEC-*.md)
  memlog/            Registres d'audit traçant les décisions des boucles autonomes
  test-targets/      Modèles de tests physiques (desktop.md, web.md, mobile.md)
.scratch/            Espaces de travail des spécifications actives (SPEC-*.md et tickets)
.archive/            Spécifications archivées avec liens d'audit RTM intacts
.what/ & .how/       Documents du corpus de travail (PRD, SRS, Blueprint, SDD)
.what-rendered/      Livrables générés par validate.py / wdi-report
```

---

## Contribution et Fondements Architecturaux

Toute contribution à WDI Method doit répondre à cette question fondamentale : **cette modification rend-elle la couche de révision plus fiable, ou la rend-elle simplement plus lourde ?**

### Fixture Corpus & Vérification Locale
Toutes les évolutions des validateurs et du framework sont éprouvées sur le corpus interne (`tests/fixture/`). Exécutez l'ensemble des tests avant de soumettre une pull request :
```bash
npm test
```

### Règle du Paquet Générique Public
WDI Method est publié sur le registre public npm. Il ne doit jamais divulguer de noms de clients privés, d'identités commerciales, d'identifiants réseau internes ou de chemins absolus de fichiers.

---

## Licence et Mention de Marque

- **Licence du Code :** Distribué sous [Licence MIT](LICENSE).
- **Confidentialité et Télémétrie :** 100% offline-first. Zéro télémétrie, zéro analyse, zéro socket réseau sortant (voir [PRIVACY.md](PRIVACY.md) et [SECURITY.md](SECURITY.md)).
- **Mention de Marque :** « Wira Delta Indonesia », « WDI Method » et le monogramme du studio sont des marques de PT Wira Delta Indonesia protégées séparément de la licence de code open source.
