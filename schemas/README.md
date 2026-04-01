# WDS Schemas

This directory contains JSON schemas for the WDS Fusion Pipeline.

## Schema Overview

| Schema | File | Purpose | Location |
|--------|------|---------|----------|
| **MCP Extraction** | `mcp-extraction.schema.json` | Raw Figma extraction output | `cache/*/mcp_only/` |
| **AI Content** | `ai-content.schema.json` | Enriched documentation | `cache/*/ai_ready/` |

---

## Champs communs (identiques dans les 2 schemas)

| Champ | Type | Description |
|-------|------|-------------|
| `component` | string | Nom du composant |
| `figma_ids` | array | IDs Figma (ex: `["aem.billboard"]`) |
| `anatomy` | object | Structure hiérarchique |
| `props` | object | Propriétés du composant |
| `variant_diffs` | array | Différences entre variants |
| `metadata` | object | Métadonnées |

---

## Différences clés

| Aspect | MCP Extraction | AI Content |
|--------|----------------|------------|
| **Tokens** | Array plat | Objet catégorisé |
| **Description** | Texte brut | `intent` structuré |
| **UX Content** | — | `rules`, `variant_logic`, `relationships` |
| **Schema ref** | — | `$schema`, `version` |

---

## 1. MCP Extraction Schema

**File:** `mcp-extraction.schema.json`

**Champs spécifiques MCP :**

| Champ | Type | Description |
|-------|------|-------------|
| `title` | string | Titre Figma (avec 💠) |
| `description` | string | Description brute Figma |
| `tokens` | array | Liste plate de tokens |

**Exemple :**
```json
{
  "component": "Billboard",
  "figma_ids": ["aem.billboard"],
  "title": "💠 aem.billboard",
  "tokens": ["breakpoints/wel/sem/sizing/grid/margins", ...],
  "metadata": {
    "figma_source": { "nodeId": "5390:5662", "pageId": "64:59" },
    "variant_count": 12,
    "default_variant": "breakpoint=mobile, type=default",
    "extracted_at": "2026-04-01T14:23:08.476Z"
  }
}
```

---

## 2. AI Content Schema

**File:** `ai-content.schema.json`

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
  },
  "metadata": {
    "figma_source": { "nodeId": "5390:5662", "pageId": "64:59" },
    "variant_count": 12,
    "default_variant": "breakpoint=mobile, type=default",
    "variant_diffs_count": 3,
    "ai_content_source": "supernova",
    "fusion_date": "2026-04-01T15:00:00.000Z",
    "pipeline_version": "9.0.0"
  }
}
```

---

## Transformation: MCP → AI Content

| MCP Extraction | AI Content | Transformation |
|----------------|------------|----------------|
| `description` (text) | `intent` (object) | Parse + enrich |
| `tokens` (array) | `tokens` (object) | Categorize by type |
| `metadata.extracted_at` | `metadata.fusion_date` | Rename |
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
