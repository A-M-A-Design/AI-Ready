# WDS Fusion Pipeline — AI-Ready Component Cache

## 🎯 Purpose

Extracted Figma component data for AI consumption. Each JSON file contains structured information about a single design system component.

## 📁 Structure

```
AI-Ready/
├── cache/
│   ├── core_aem/           # Core AEM components (60)
│   │   ├── billboard.json
│   │   ├── billboard-image.json
│   │   └── ...
│   └── core_components/    # Core Components (future)
├── configs/
│   └── core_aem.json       # Component registry with status
├── scripts/
│   └── mcp_extractor_v6_2_single.js
└── PROTOCOL_v9.md          # Extraction protocol
```

## 📊 Component JSON Schema

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
  "tokens": [ ... ],
  "meta": { ... }
}
```

## 🔧 Extraction Workflow

1. Open Figma file with Desktop Bridge plugin
2. Run extraction script via `figma_execute`
3. Push directly to GitHub via MCP
4. Update component status in config

## 📈 Progress

| Source | Total | Extracted | Pending |
|--------|-------|-----------|--------|
| Core AEM | 60 | 4 | 56 |
| Core Components | ~80 | 0 | ~80 |

## 🔗 Links

- **Figma Core AEM**: `sdTj7GavgRf42hiOgJ5XtU`
- **Protocol**: See `PROTOCOL_v9.md`
