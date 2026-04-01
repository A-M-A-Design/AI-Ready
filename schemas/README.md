# WDS Schemas

This directory contains JSON schemas for the WDS Fusion Pipeline.

## Schema Overview

| Schema | File | Purpose | Location |
|--------|------|---------|----------|
| **MCP Extraction** | `mcp-extraction.schema.json` | Raw Figma extraction output | `cache/*/mcp_only/` |
| **AI Content** | `ai-content.schema.json` | Enriched documentation | `cache/*/ai_ready/` |
| **Component** | `component.schema.json` | Legacy/combined schema | — |

---

## 1. MCP Extraction Schema

**File:** `mcp-extraction.schema.json`

**Purpose:** Validates raw extraction output from the MCP Figma extractor (`mcp_extractor_v6_2_single.js`).

**Key fields:**
```json
{
  "component": "Billboard",
  "figmaId": "aem.billboard",
  "title": "💠 aem.billboard",
  "description": "...",
  "vc": 12,
  "dv": "breakpoint=mobile, type=default",
  "props": { ... },
  "anatomy": { ... },
  "variant_diffs": [ ... ],
  "tokens": [ "path/to/token", ... ],
  "meta": { "nid": "5390:5662", "pid": "64:59" },
  "_extracted_at": "2026-04-01T14:23:08.476Z"
}
```

**Characteristics:**
- `figmaId` is a **string** (single ID)
- `tokens` is a **flat array** of token paths
- `description` is **raw text** from Figma
- No AI-enriched content

---

## 2. AI Content Schema

**File:** `ai-content.schema.json`

**Purpose:** Validates enriched documentation ready for AI consumption.

**Key fields:**
```json
{
  "$schema": "welcome-ai-ready/ai-content.schema.json",
  "version": "2.0.0",
  "component": "Billboard",
  "figma_ids": ["aem.billboard"],
  "intent": {
    "description": "Main promotional molecule for CTAs",
    "solves": "...",
    "task_context": [...],
    "use_when": [...],
    "avoid_when": [...]
  },
  "anatomy": { ... },
  "composition": { "requires": [], "allows": [], "forbids": [] },
  "props": { ... },
  "variant_diffs": [ ... ],
  "variant_logic": { ... },
  "rules": [ ... ],
  "relationships": { ... },
  "invalid_combinations": [ ... ],
  "context": { "modality": ["desktop", "tablet", "mobile"] },
  "tokens": {
    "border": [...],
    "typography": [...],
    "spacing": [...],
    "color": [...]
  },
  "metadata": { ... }
}
```

**Characteristics:**
- `figma_ids` is an **array** (multiple IDs possible)
- `tokens` is a **categorized object**
- `intent` contains **structured UX guidance**
- `rules`, `variant_logic`, `relationships` are **AI-enriched**

---

## Transformation: MCP → AI Content

| MCP Extraction | AI Content | Transformation |
|----------------|------------|----------------|
| `figmaId` (string) | `figma_ids` (array) | Wrap in array |
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
