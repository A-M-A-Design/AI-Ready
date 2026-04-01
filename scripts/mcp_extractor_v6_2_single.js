/**
 * WDS MCP Extractor v6.2 — Single Component Extraction
 * 
 * Version optimisée pour extraction 1-par-1 avec push GitHub direct.
 * 
 * Usage:
 *   Remplacer les placeholders:
 *   - __COMPONENT_NAME__ : Nom d'affichage (ex: "Billboard")
 *   - __NODE_ID__ : Node ID Figma (ex: "5390:5662")
 *   - __FIGMA_ID__ : ID pour le code (ex: "aem.billboard")
 * 
 *   Appeler: figma_execute({ code: <this>, timeout: 30000 })
 * 
 * Output:
 *   JSON complet prêt pour push GitHub.
 *   Vérifier _error pour les échecs.
 */

const COMPONENT_NAME = "__COMPONENT_NAME__";
const NODE_ID = "__NODE_ID__";
const FIGMA_ID = "__FIGMA_ID__";
const MAX_DEPTH = 4;
const MAX_SINGLE_AXIS_DIFFS = 15;

// ══════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════

function createEmptyResult(error) {
  return {
    component: COMPONENT_NAME,
    figmaId: FIGMA_ID,
    title: "",
    description: "",
    vc: null,
    dv: null,
    props: {},
    anatomy: {},
    variant_diffs: [],
    tokens: [],
    meta: { nid: NODE_ID },
    _error: error,
    _extracted_at: new Date().toISOString()
  };
}

function parseCfg(name) {
  const c = {};
  if (!name) return c;
  for (const p of name.split(", ")) {
    const eq = p.indexOf("=");
    if (eq > 0) c[p.slice(0, eq).trim()] = p.slice(eq + 1).trim();
  }
  return c;
}

function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

// ══════════════════════════════════════════════════════════════
// COLLECTORS
// ══════════════════════════════════════════════════════════════

const globalAliases = new Set();
const globalInstances = [];

function collectAll(node, depth) {
  if (!node || depth > MAX_DEPTH) return;
  if (node.type === "INSTANCE") globalInstances.push(node);
  try {
    const bv = node.boundVariables || {};
    for (const [, val] of Object.entries(bv)) {
      if (Array.isArray(val)) {
        for (const a of val) {
          if (a && a.type === "VARIABLE_ALIAS") globalAliases.add(a.id);
        }
      } else if (val && val.type === "VARIABLE_ALIAS") {
        globalAliases.add(val.id);
      } else if (val && typeof val === "object" && !Array.isArray(val)) {
        for (const k of Object.keys(val)) {
          const sv = val[k];
          if (sv && sv.type === "VARIABLE_ALIAS") globalAliases.add(sv.id);
        }
      }
    }
  } catch (_) {}
  if ("children" in node && node.children) {
    for (const c of node.children) collectAll(c, depth + 1);
  }
}

// ══════════════════════════════════════════════════════════════
// MAIN EXTRACTION
// ══════════════════════════════════════════════════════════════

try {
  // Get component set
  const cs = await figma.getNodeByIdAsync(NODE_ID);
  
  if (!cs) return createEmptyResult("node_not_found");
  if (cs.type !== "COMPONENT_SET") return createEmptyResult("not_component_set: " + cs.type);
  if (!cs.children || cs.children.length === 0) return createEmptyResult("no_variants");
  
  // Find default variant
  const dv = cs.children.find(c => /state=default/.test(c.name))
    || cs.children.find(c => /breakpoint=mobile/.test(c.name))
    || cs.children[0];
  
  const defaultCfg = parseCfg(dv.name);
  collectAll(dv, 0);
  
  // Collect single-axis diff variants
  const singleAxis = [];
  for (const v of cs.children) {
    if (v.id === dv.id) continue;
    const cfg = parseCfg(v.name);
    const diffs = Object.keys(cfg).filter(k => cfg[k] !== defaultCfg[k]);
    if (diffs.length === 1) {
      singleAxis.push(v);
      collectAll(v, 0);
    }
    if (singleAxis.length >= MAX_SINGLE_AXIS_DIFFS) break;
  }
  
  // ════════════════════════════════════════════════════════════
  // RESOLVE VARIABLES & INSTANCES
  // ════════════════════════════════════════════════════════════
  
  const varCache = {};
  const instCache = {};
  const aliasIds = [...globalAliases];
  
  await Promise.all([
    // Resolve variables in batches of 50
    ...(function () {
      const batches = [];
      for (let i = 0; i < aliasIds.length; i += 50) {
        batches.push(Promise.all(aliasIds.slice(i, i + 50).map(async (id) => {
          try {
            const v = await figma.variables.getVariableByIdAsync(id);
            if (!v) { varCache[id] = null; return; }
            const col = await figma.variables.getVariableCollectionByIdAsync(v.variableCollectionId);
            varCache[id] = (col ? col.name + "/" : "") + v.name;
          } catch (_) { varCache[id] = null; }
        })));
      }
      return batches;
    })(),
    // Resolve instances
    Promise.all(globalInstances.map(async (inst) => {
      try {
        const mc = await inst.getMainComponentAsync();
        if (mc) instCache[inst.id] = mc.name.replace(/^💠\s*/, "");
      } catch (_) {}
    }))
  ]);
  
  // ════════════════════════════════════════════════════════════
  // EXTRACTION FUNCTIONS
  // ════════════════════════════════════════════════════════════
  
  function rv(alias) {
    return (alias && alias.type === "VARIABLE_ALIAS") ? (varCache[alias.id] || null) : null;
  }
  
  function isRealToken(t) {
    const tl = t.toLowerCase();
    return !tl.includes("helper") && !tl.includes("⚙️") && !tl.includes("_documentation")
      && !tl.includes("-helpers") && !tl.includes("-file cover");
  }
  
  function resolveStyles(node) {
    const s = {};
    try {
      const bv = node.boundVariables || {};
      for (const [p, val] of Object.entries(bv)) {
        if (Array.isArray(val)) {
          for (const a of val) { const r = rv(a); if (r) s[p] = r; }
        } else if (val && val.type === "VARIABLE_ALIAS") {
          const r = rv(val); if (r) s[p] = r;
        } else if (val && typeof val === "object" && !Array.isArray(val)) {
          for (const k of Object.keys(val)) {
            const sv = val[k];
            if (sv && sv.type === "VARIABLE_ALIAS") { const r = rv(sv); if (r) s[p] = r; }
          }
        }
      }
    } catch (_) {}
    
    // Layout properties
    if (node.layoutMode && node.layoutMode !== "NONE") s.layoutMode = node.layoutMode;
    if (node.primaryAxisAlignItems) s.primaryAxisAlignItems = node.primaryAxisAlignItems;
    if (node.counterAxisAlignItems) s.counterAxisAlignItems = node.counterAxisAlignItems;
    if (node.itemSpacing) s.itemSpacing = node.itemSpacing;
    if (node.paddingLeft) s.paddingLeft = node.paddingLeft;
    if (node.paddingTop) s.paddingTop = node.paddingTop;
    if (node.paddingRight) s.paddingRight = node.paddingRight;
    if (node.paddingBottom) s.paddingBottom = node.paddingBottom;
    if (node.width) s.width = Math.round(node.width);
    if (node.height) s.height = Math.round(node.height);
    if (!node.visible) s.visible = false;
    
    return s;
  }
  
  function extractTree(node, parentName, depth) {
    if (depth > MAX_DEPTH) return {};
    const result = {};
    const el = {};
    
    el.type = node.type === "INSTANCE" ? "instance"
      : node.type === "TEXT" ? "text"
      : node.type === "VECTOR" ? "vector"
      : "container";
    
    if (parentName) el.parent = parentName;
    if ("children" in node && node.children && node.children.length > 0) {
      el.children = node.children.map(c => c.name);
    }
    
    if (node.type === "INSTANCE" && instCache[node.id]) {
      el.instanceOf = instCache[node.id];
    }
    
    const styles = resolveStyles(node);
    if (Object.keys(styles).length > 0) el.styles = styles;
    
    const nodeName = depth === 0 ? "root" : node.name;
    result[nodeName] = el;
    
    if ("children" in node && node.children) {
      for (const c of node.children) {
        Object.assign(result, extractTree(c, nodeName, depth + 1));
      }
    }
    return result;
  }
  
  // ════════════════════════════════════════════════════════════
  // EXTRACT ANATOMY
  // ════════════════════════════════════════════════════════════
  
  const anatomy = extractTree(dv, null, 0);
  const defaultStyles = {};
  for (const [n, el] of Object.entries(anatomy)) defaultStyles[n] = el.styles || {};
  
  // ════════════════════════════════════════════════════════════
  // EXTRACT VARIANT DIFFS
  // ════════════════════════════════════════════════════════════
  
  const variant_diffs = [];
  for (const variant of singleAxis) {
    const vTree = extractTree(variant, null, 0);
    const changes = {};
    
    for (const [eName, eData] of Object.entries(vTree)) {
      const defS = defaultStyles[eName] || {};
      const varS = eData.styles || {};
      const delta = {};
      for (const [k, v] of Object.entries(varS)) {
        if (JSON.stringify(v) !== JSON.stringify(defS[k])) delta[k] = v;
      }
      if (!anatomy[eName]) delta._added = true;
      if (Object.keys(delta).length > 0) changes[eName] = delta;
    }
    
    for (const eName of Object.keys(anatomy)) {
      if (eName === "root") continue;
      if (!vTree[eName]) changes[eName] = { _removed: true };
    }
    
    if (Object.keys(changes).length > 0) {
      const cfg = parseCfg(variant.name);
      const diffKeys = Object.keys(cfg).filter(k => cfg[k] !== defaultCfg[k]);
      const dc = {};
      for (const k of diffKeys) dc[k] = cfg[k];
      variant_diffs.push({ configuration: dc, changes });
    }
  }
  
  // ════════════════════════════════════════════════════════════
  // EXTRACT PROPS
  // ════════════════════════════════════════════════════════════
  
  const props = {};
  for (const [rawK, d] of Object.entries(cs.componentPropertyDefinitions || {})) {
    const ck = rawK.replace(/#\d+:\d+$/, "");
    const p = {};
    
    if (d.type === "VARIANT") {
      p.type = "string"; p.default = d.defaultValue; p.enum = d.variantOptions;
    } else if (d.type === "BOOLEAN") {
      p.type = "boolean"; p.default = d.defaultValue;
    } else if (d.type === "TEXT") {
      p.type = "string"; p.default = d.defaultValue;
    } else if (d.type === "INSTANCE_SWAP") {
      p.type = "instance_swap"; p.default = d.defaultValue;
    }
    
    if (d.type !== "VARIANT") {
      let target = ck;
      if (ck.startsWith("-> ")) target = ck.replace("-> ", "");
      else if (ck.startsWith("→ ")) target = ck.replace("→ ", "");
      p.binding = {
        element: target,
        affects: d.type === "BOOLEAN" ? "visible"
          : d.type === "TEXT" ? "content"
          : "mainComponent"
      };
    }
    props[ck] = p;
  }
  
  // ════════════════════════════════════════════════════════════
  // COLLECT TOKENS
  // ════════════════════════════════════════════════════════════
  
  const compTokens = new Set();
  function collectTokensFromTree(tree) {
    for (const el of Object.values(tree)) {
      if (el.styles) {
        for (const v of Object.values(el.styles)) {
          if (typeof v === "string" && v.includes("/")) compTokens.add(v);
        }
      }
    }
  }
  collectTokensFromTree(anatomy);
  for (const vd of variant_diffs) {
    for (const ch of Object.values(vd.changes)) {
      if (typeof ch === "object" && !ch._removed) {
        for (const v of Object.values(ch)) {
          if (typeof v === "string" && v.includes("/")) compTokens.add(v);
        }
      }
    }
  }
  
  // ════════════════════════════════════════════════════════════
  // RETURN RESULT
  // ════════════════════════════════════════════════════════════
  
  return {
    component: COMPONENT_NAME,
    figmaId: FIGMA_ID,
    title: cs.name,
    description: cs.description || "",
    vc: cs.children.length,
    dv: dv.name,
    props,
    anatomy,
    variant_diffs,
    tokens: [...compTokens].filter(isRealToken).sort(),
    meta: { nid: cs.id, pid: cs.parent?.id },
    _stats: {
      aliases: aliasIds.length,
      resolved: Object.values(varCache).filter(Boolean).length,
      instances: globalInstances.length,
      resolvedInstances: Object.keys(instCache).length
    },
    _extracted_at: new Date().toISOString()
  };
  
} catch (error) {
  return createEmptyResult(error.message || "unknown_error");
}
