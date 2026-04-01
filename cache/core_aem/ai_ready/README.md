# AI-Ready — Schema-Compliant Documentation

This folder contains **AI-Ready** component documentation that conforms to the WDS AI-Ready Schema.

## Schema Reference

- **Schema**: `/schemas/component.schema.json`
- **Template**: `/schemas/component.template.json`

## Required Structure

Every file MUST include:

```json
{
  "$schema": "welcome-ai-ready/component.schema.json",
  "version": "2.0.0",
  "component": "...",
  "figma_ids": [...],
  "intent": { ... },
  "anatomy": { ... },
  "composition": { ... },
  "props": { ... },
  "variant_diffs": [...],
  "variant_logic": { ... },
  "rules": [...],
  "relationships": { ... },
  "invalid_combinations": [...],
  "context": { ... },
  "tokens": { ... },
  "metadata": { ... }
}
```

## Status

🚧 **No files yet** — Fusion transformation pending.

## Source

Generated from `../mcp_only/` files via the WDS Fusion Pipeline.
