# MCP Only — Raw Extraction Output

This folder contains **raw extraction outputs** from the MCP Figma extractor (`mcp_extractor_v6_2_single.js`).

## Structure

These files are **NOT** AI-Ready compliant. They use the extraction schema:

```json
{
  "component": "Component Name",
  "figmaId": "aem.component-name",
  "title": "💠 aem.component-name",
  "description": "...",
  "vc": 12,
  "dv": "breakpoint=mobile, ...",
  "props": { ... },
  "anatomy": { ... },
  "variant_diffs": [ ... ],
  "tokens": [ ... ],
  "meta": { "nid": "...", "pid": "..." },
  "_stats": { ... },
  "_extracted_at": "..."
}
```

## Files

| File | Type | Components |
|------|------|------------|
| `batch_1.json` | Batch | Billboard, Billboard Image, Bloc Maps |
| `batch_2.json` | Batch | Booking Engine (3 components) |
| `booking-engine-*.json` | Single | Individual component extractions |

## Next Step

Transform these files to AI-Ready format using the Fusion Pipeline and store in `../ai_ready/`.
