# WDS AI-Ready Component Schema

## Overview

This folder contains the JSON Schema definition for AI-ready component documentation in the Welcome Design System.

## Files

| File | Description |
|------|-------------|
| `component.schema.json` | JSON Schema (draft 2020-12) defining the structure |
| `component.template.json` | Empty template with all required fields |

## Schema Structure

```
{
  "$schema": "welcome-ai-ready/component.schema.json",
  "version": "2.0.0",
  "component": "Button",
  "figma_ids": ["web.button-bb"],
  
  "intent": { ... },        // UX purpose & usage guidance
  "anatomy": { ... },       // Component structure (from Figma)
  "composition": { ... },   // Child component rules
  "props": { ... },         // Component properties
  "variant_diffs": [ ... ], // Style changes per variant
  "variant_logic": { ... }, // When to use each variant
  "rules": [ ... ],         // Do/Don't guidelines
  "relationships": { ... }, // Related components
  "invalid_combinations": [],
  "context": { ... },       // Supported modalities
  "tokens": { ... },        // Design tokens (categorized)
  "metadata": { ... }       // Extraction info
}
```

## Key Principles

### Structure Preservation

**If no data, keep empty structure — never omit fields.**

```json
// ✅ Correct: Empty but present
"intent": {
  "description": "",
  "solves": "",
  "task_context": [],
  "use_when": [],
  "avoid_when": []
}

// ❌ Wrong: Missing field
"intent": {
  "description": "Some text"
}
```

### JSON Formatting

**Always use 2-space indentation.**

```javascript
// When pushing to GitHub:
const content = JSON.stringify(data, null, 2);
```

### Token References

Tokens are stored as path strings:

```json
"fills": "colorModes/wel/comp/btn/primary/bg-color"
```

Not as resolved values.

## Validation

```bash
# Validate a component file against the schema
npx ajv validate -s schemas/component.schema.json -d output/button.ai-ready.json
```

## Version History

| Version | Date | Changes |
|---------|------|--------|
| 2.0.0 | 2026-04 | Initial schema definition |
