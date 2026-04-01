# WDS Fusion Pipeline — Protocole d'exécution v9.0

## 🎯 NOUVELLE APPROCHE : 1 COMPOSANT = 1 FICHIER = 1 PUSH

### Workflow simplifié

```
figma_execute(composant_N) → github:create_or_update_file() → ✅ Done
```

**Plus de sauvegarde locale** — Push direct vers GitHub après chaque extraction.

---

## 📁 STRUCTURE DES FICHIERS

```
cache/core_aem/
├── billboard.json
├── billboard-image.json
├── bloc-maps.json
├── booking-engine-aem-full-option.json
├── booking-engine-aem-light.json
└── ... (1 fichier par composant)
```

### Nommage des fichiers

| Composant Figma | Fichier |
|-----------------|--------|
| Billboard | `billboard.json` |
| Billboard Image | `billboard-image.json` |
| Card Image Default Container | `card-image-default-container.json` |

Règle : `kebab-case` du nom du composant.

---

## 🔧 SCRIPT D'EXTRACTION (Single Component)

Utiliser `mcp_extractor_v6_2_single.js` avec :
- `__COMPONENT_NAME__` : Nom du composant
- `__NODE_ID__` : Node ID Figma
- `__FIGMA_ID__` : ID pour le code (ex: `aem.billboard`)

### Paramètres

| Paramètre | Valeur |
|-----------|--------|
| MAX_DEPTH | 4 |
| MAX_SINGLE_AXIS_DIFFS | 15 |
| Timeout | 30000ms |

---

## 📤 PUSH GITHUB

### Via MCP (Claude)

```javascript
github:create_or_update_file({
  owner: "A-M-A-Design",
  repo: "AI-Ready",
  branch: "main",
  path: "cache/core_aem/{component-slug}.json",
  content: <JSON complet>,
  message: "✨ {Component Name} — {vc} variants, {tokens.length} tokens"
})
```

### Informations repository

| Setting | Value |
|---------|-------|
| Repository | `A-M-A-Design/AI-Ready` |
| Branch | `main` |
| URL | https://github.com/A-M-A-Design/AI-Ready |

---

## 📋 CHECKLIST PAR COMPOSANT

```
□ 1. figma_execute avec script single
□ 2. Vérifier: _error absent, anatomy/props/tokens présents
□ 3. github:create_or_update_file
□ 4. Confirmer commit SHA reçu
□ 5. Passer au composant suivant
```

---

## 🚨 GESTION DES ERREURS

### Erreurs extraction

| Erreur | Action |
|--------|--------|
| `node_not_found` | Vérifier nodeId dans config |
| `not_component_set` | Le nœud n'est pas un COMPONENT_SET |
| `timeout` | Augmenter timeout ou simplifier |

### Erreurs GitHub

| Erreur | Action |
|--------|--------|
| `422` | SHA manquant pour update |
| `404` | Vérifier owner/repo/path |

---

## 📊 STRUCTURE JSON OUTPUT

```json
{
  "component": "Billboard",
  "figmaId": "aem.billboard",
  "title": "💠 aem.billboard",
  "description": "...",
  "vc": 12,
  "dv": "breakpoint=mobile, type=default",
  "props": {
    "kicker": {"type": "boolean", "default": true, "binding": {...}},
    "breakpoint": {"type": "string", "enum": [...], "default": "..."},
    ...
  },
  "anatomy": {
    "root": {"type": "container", "children": [...], "styles": {...}},
    ...
  },
  "variant_diffs": [
    {"configuration": {...}, "changes": {...}},
    ...
  ],
  "tokens": [
    "breakpoints/wel/sem/...",
    "colorModes/wel/sem/...",
    ...
  ],
  "meta": {"nid": "...", "pid": "..."},
  "_stats": {"aliases": N, "resolved": N, "instances": N},
  "_extracted_at": "ISO timestamp"
}
```

---

## 📈 PROGRESSION CORE AEM

### Simple (55 composants, ≤30 variants)

Extraire séquentiellement, 1 par 1.

### Complex (5 composants, >30 variants)

| Composant | Variants | Approche |
|-----------|----------|----------|
| Booking Engine Next Version Full Option | 94 | MAX_DEPTH=3 |
| Card Image Default Container | 52 | MAX_DEPTH=3 |
| List V3 | 48 | MAX_DEPTH=3 |
| Callout Editorial Container | 44 | MAX_DEPTH=3 |
| Card Image Logo Container | 32 | MAX_DEPTH=4 |

---

## 🔄 REPRISE APRÈS INTERRUPTION

1. Consulter GitHub : https://github.com/A-M-A-Design/AI-Ready/tree/main/cache/core_aem
2. Identifier le dernier composant pushé
3. Reprendre avec le composant suivant dans `core_aem.json`

---

**Fin du protocole v9.0**
