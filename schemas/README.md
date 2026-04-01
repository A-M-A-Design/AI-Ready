# WDS Schemas

This directory contains JSON schemas for the WDS Fusion Pipeline.

## Schema Overview

| Schema | File | Purpose | Location |
|--------|------|---------|----------|
| **MCP Extraction** | `mcp-extraction.schema.json` | Raw Figma extraction output | `cache/*/mcp_only/` |
| **AI Content** | `ai-content.schema.json` | Enriched documentation | `cache/*/ai_ready/` |
| **Component** | `component.schema.json` | Legacy/combined schema | — |

---

## Champs communs (identiques)

Ces champs ont le **même format** dans les 2 schemas :

| Champ | Type | Description |
|-------|------|-------------|
| `component` | string | Nom du composant |
| `figma_ids` | array | IDs Figma (ex: `["aem.billboard"]`) |
| `anatomy` | object | Structure hiérarchique |
| `props` | object | Propriétés du composant |
| `variant_diffs` | array | Différences entre variants |

---

## 1. MCP Extraction Schema

**File:** `mcp-extraction.schema.json`

**Purpose:** Validates raw extraction output from the MCP Figma extractor.

**Champs spécifiques MCP :**

| Champ | Type | Description |
|-------|------|-------------|
| `title` | string | Titre Figma (avec 💠) |
| `description` | string | Description brute Figma |
| `vc` | integer | Nombre de variants |
| `dv` | string | Configuration du variant par défaut |
| `tokens` | array | Liste plate de tokens |
| `meta` | object | `{ nid, pid }` |
| `_stats` | object | Statistiques d'extraction |
| `_extracted_at` | datetime | Timestamp ISO |

**Exemple :**
```json
{
  "component": "Billboard",
  "figma_ids": ["aem.billboard"],
  "title": "💠 aem.billboard",
  "vc": 12,
  "dv": "breakpoint=mobile, type=default",
  "tokens": ["breakpoints/wel/sem/sizing/grid/margins", ...],
  "meta": { "nid": "5390:5662", "pid": "64:59" },
  "_extracted_at": "2026-04-01T14:23:08.476Z"
}
```

---

## 2. AI Content Schema

**File:** `ai-content.schema.json`

**Purpose:** Validates enriched documentation ready for AI consumption.

**Champs spécifiques AI Content :**

| Champ | Type | Description |
|-------|------|-------------|
| `$schema` | string | Référence au schema |
| `version` | string | Version semver |
| `intent` | object | Description structurée UX |
| `composition` | object | `{ requires, allows, forbids }` |
| `variant_logic` | object | Guide d'utilisation des variants |
| `rules` | array | Règles Do/Don't |
| `relationships` | object | Relations entre composants |
| `context` | object | `{ modality: ["desktop", ...] }` |
| `tokens` | object | Tokens catégorisés |
| `metadata` | object | Métadonnées complètes |

**Exemple :**
```json
{
  "$schema": "welcome-ai-ready/ai-content.schema.json",
  "version": "2.0.0",
  "component": "Billboard",
  "figma_ids": ["aem.billboard"],
  "intent": {
    "description": "Main promotional molecule for CTAs",
    "solves": "Driving user engagement",
    "use_when": ["Promotional content", "Newsletter signup"],
    "avoid_when": ["Non-promotional content"]
  },
  "tokens": {
    "color": ["colorModes/wel/sem/color/on-surface-hi"],
    "typography": ["breakpoints/wel/sem/fontSizes/display/lg"],
    "spacing": ["breakpoints/wel/sem/sizing/grid/margins"]
  }
}
```

---

## Transformation: MCP → AI Content

| MCP Extraction | AI Content | Transformation |
|----------------|------------|----------------|
| `description` (text) | `intent` (object) | Parse + enrich |
| `tokens` (array) | `tokens` (object) | Categorize by type |
| `vc` | `metadata.variant_count` | Move to metadata |
| `dv` | `metadata.default_variant` | Move to metadata |
| `meta.nid` | `metadata.figma_source.nodeId` | Restructure |
| — | `rules` | Add from Supernova |
| — | `variant_logic` | Generate from context |
| — | `relationships` | Add from Supernova |
| — | `composition` | Infer from anatomy |

---

## Validation

```bash
# Validate MCP extraction file
npx ajv validate -s schemas/mcp-extraction.schema.json -d cache/core_aem/mcp_only/billboard.json

# Validate AI content file
npx ajv validate -s schemas/ai-content.schema.json -d cache/core_aem/ai_ready/billboard.json
```
