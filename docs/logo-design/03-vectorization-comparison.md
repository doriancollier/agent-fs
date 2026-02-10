# Vectorization Method Comparison

> **Date:** December 2024
> **Methods Tested:** 4 (2 Node.js, 2 Python)
> **Logos Vectorized:** 3 per method (12 total)

## Overview

This report documents a practical comparison of raster-to-vector conversion tools for logo production. We tested four different libraries by converting the same three AI-generated logos and evaluating the results.

## Test Methodology

### Source Images

Three logos were selected from our model comparison, representing different complexity levels:

| Logo | Source Model | Characteristics |
|------|--------------|-----------------|
| `ideogram-v3-turbo.png` | Ideogram V3 Turbo | Monochrome, simple line art, clean typography |
| `flux-2-pro.png` | Flux 2 Pro | Gradient colors (cyan-to-blue), complex lightbulb icon |
| `flux-1.1-pro.png` | Flux 1.1 Pro | Fine radiating lines, gold filament detail, stacked layout |

### Libraries Tested

| Library | Language | Algorithm | Notes |
|---------|----------|-----------|-------|
| @neplex/vectorizer | Node.js | VTracer (Rust) | Native bindings to VTracer |
| potrace | Node.js | Potrace (C) | Classic algorithm, monochrome only |
| vtracer | Python | VTracer (Rust) | Direct Python bindings |
| img2vector | Python | VTracer | AI-enhanced (claimed) - had installation issues |

---

## Results Summary

### File Sizes

| Logo | @neplex/vectorizer | potrace | vtracer | img2vector* |
|------|-------------------|---------|---------|-------------|
| ideogram-v3-turbo | **15 KB** | 6.9 KB | 17 KB | 17 KB |
| flux-2-pro | 32 KB | 6.9 KB | **27 KB** | 28 KB |
| flux-1.1-pro | **29 KB** | 11 KB | 35 KB | 36 KB |

*img2vector had installation issues; fell back to vtracer directly

### Processing Time

| Library | Avg Time | Notes |
|---------|----------|-------|
| @neplex/vectorizer | ~1 second | Fastest, native Rust bindings |
| potrace | ~1 second | Fast, simple algorithm |
| vtracer | ~1 second | Fast, native Rust bindings |
| img2vector | Failed | Broken package structure |

---

## Detailed Analysis

### 1. @neplex/vectorizer (Node.js) — **Recommended**

**Rating: A**

The best overall choice for Node.js/TypeScript projects. Uses the VTracer engine with excellent color support.

**Strengths:**
- Full color support with accurate reproduction
- Smooth spline curves for professional output
- Smallest file sizes for most logos
- Uses `Preset.Photo` for optimal logo results
- Clean API with TypeScript support

**Weaknesses:**
- Custom configuration has complex TypeScript types (use presets instead)
- Requires native bindings compilation on first install

**Sample Output Analysis:**

The Ideogram logo converted cleanly:
- Lightbulb icon preserved with smooth curves
- Typography ("lumina") rendered accurately
- Background handled appropriately (light gray path)
- 15 KB file size is production-ready

**Verdict:** The go-to choice for Node.js projects. Production-ready output with minimal configuration.

---

### 2. potrace (Node.js) — **Limited Use**

**Rating: C**

Fundamentally unsuitable for color logos due to monochrome-only output.

**Strengths:**
- Very small file sizes (6.9-11 KB)
- Fast processing
- Good curve optimization
- Well-established algorithm

**Critical Limitation:**
- **MONOCHROME ONLY** — Converts all input to black silhouettes
- Loses all color information
- Not suitable for color logos

**Sample Output Analysis:**

All logos converted to single-color silhouettes:
- The Flux 2 Pro gradient became a black shape
- Typography rendered as filled regions
- Lightbulb icons became solid black forms

**When to Use:**
- Simple monochrome logos (wordmarks, symbols)
- When you specifically need a silhouette version
- When you'll manually add colors in a vector editor

**Verdict:** Only use for deliberately monochrome artwork. Not recommended for general logo vectorization.

---

### 3. vtracer (Python) — **Recommended**

**Rating: A**

Identical quality to @neplex/vectorizer (same underlying engine). Best choice for Python projects.

**Strengths:**
- Full color support with excellent quality
- Direct VTracer bindings (same engine as neplex)
- Comprehensive configuration options
- Well-documented parameter controls

**Weaknesses:**
- Slightly larger file sizes than neplex (different default configurations)
- Requires native compilation

**Sample Output Analysis:**

The Flux 2 Pro gradient logo:
- Cyan-to-blue gradient approximated with stacked color layers
- Icon detail preserved
- Typography sharp and clean
- 27 KB file size is acceptable for production

**Verdict:** The Python equivalent of @neplex/vectorizer. Use for Python workflows.

---

### 4. img2vector (Python) — **Not Recommended**

**Rating: D**

**Major Issue:** Package has broken installation structure.

**What Went Wrong:**
- Package installs but imports fail
- The `img2vector` module doesn't export `Img2Vector` class correctly
- Had to fall back to using vtracer directly
- Claims AI-powered image type detection but couldn't test

**Investigation Findings:**
```
ImportError: cannot import name 'Img2Vector' from 'img2vector'
```

The package appears to install files in `core/` but doesn't set up proper imports.

**Verdict:** Avoid until maintainers fix the installation. Use vtracer directly instead.

---

## Visual Quality Comparison

### Ideogram V3 Turbo (Monochrome Line Art)

| Aspect | @neplex | potrace | vtracer |
|--------|---------|---------|---------|
| **Lightbulb icon** | Excellent | Silhouette only | Excellent |
| **Typography** | Clean, smooth | Filled black shape | Clean, smooth |
| **Background** | Proper light gray | Black on white | Proper light gray |
| **File size** | 15 KB | 6.9 KB | 17 KB |
| **Production ready** | Yes | No (wrong colors) | Yes |

### Flux 2 Pro (Gradient Colors)

| Aspect | @neplex | potrace | vtracer |
|--------|---------|---------|---------|
| **Gradient handling** | Stacked layers | Black silhouette | Stacked layers |
| **Color fidelity** | Good | None | Good |
| **Icon detail** | Preserved | Lost to fill | Preserved |
| **Typography** | Accurate | Filled black | Accurate |
| **File size** | 32 KB | 6.9 KB | 27 KB |
| **Production ready** | Yes | No | Yes |

### Flux 1.1 Pro (Fine Lines + Detail)

| Aspect | @neplex | potrace | vtracer |
|--------|---------|---------|---------|
| **Radiating lines** | Preserved | Merged to fill | Preserved |
| **Filament detail** | Visible | Lost | Visible |
| **Stacked layout** | Clean | Unclear | Clean |
| **File size** | 29 KB | 11 KB | 35 KB |
| **Production ready** | Yes | No | Yes |

---

## Key Findings

### What Works

1. **VTracer-based tools excel at logos** — Both @neplex/vectorizer and vtracer produce professional results
2. **Color logos vectorize well** — Gradients become stacked color layers (acceptable for most uses)
3. **Typography survives vectorization** — Wordmarks remain readable and clean
4. **File sizes are reasonable** — 15-35 KB is acceptable for production SVGs

### What Doesn't Work

1. **potrace cannot handle color** — Fundamental limitation, not a bug
2. **img2vector has broken installation** — Non-functional package
3. **True gradients not created** — SVG gradients would be better but aren't generated
4. **Some fine detail can be lost** — Very thin lines may need path adjustment

### Gotchas Discovered

| Issue | Discovery |
|-------|-----------|
| potrace monochrome only | Expected but not always documented prominently |
| img2vector broken imports | Package structure doesn't match documented API |
| @neplex custom config | TypeScript enum errors - use presets instead |
| Background handling | Light backgrounds become filled paths (expected) |

---

## Recommended Workflow

### For Node.js/TypeScript Projects

```bash
npm install @neplex/vectorizer
```

```typescript
import { vectorize, Preset } from '@neplex/vectorizer';
import fs from 'fs/promises';

const buffer = await fs.readFile('logo.png');
const svg = await vectorize(buffer, Preset.Photo);
await fs.writeFile('logo.svg', svg);
```

### For Python Projects

```bash
pip install vtracer
```

```python
import vtracer

vtracer.convert_image_to_svg_py(
    'logo.png',
    'logo.svg',
    colormode='color',
    hierarchical='stacked',
    mode='spline',
    filter_speckle=4,
    color_precision=6,
)
```

### Post-Processing (Optional)

For production logos, consider:

1. **SVGO optimization** — Reduce file size by 10-30%
2. **Manual cleanup** — Remove unnecessary paths in Figma/Illustrator
3. **True gradients** — Replace stacked layers with SVG `<linearGradient>` manually
4. **Font replacement** — Replace vectorized text with actual fonts if needed

---

## Decision Matrix

| Scenario | Recommended Tool |
|----------|------------------|
| Node.js project, color logos | @neplex/vectorizer |
| Python project, color logos | vtracer |
| Monochrome logos only | potrace (fastest, smallest) |
| Need AI image type detection | Wait for img2vector fix, or use vtracer |
| Production logo workflow | @neplex/vectorizer + SVGO |
| Quick prototype | Any VTracer-based tool |

---

## Output Location

Test results are saved in:
```
.temp/images/vectorized/
├── neplex-vectorizer/       # @neplex/vectorizer output
│   ├── ideogram-v3-turbo.svg
│   ├── flux-2-pro.svg
│   └── flux-1.1-pro.svg
├── potrace-node/            # potrace output (monochrome)
│   ├── ideogram-v3-turbo.svg
│   ├── flux-2-pro.svg
│   └── flux-1.1-pro.svg
├── vtracer-python/          # vtracer output
│   ├── ideogram-v3-turbo.svg
│   ├── flux-2-pro.svg
│   └── flux-1.1-pro.svg
└── img2vector-python/       # img2vector output (used vtracer fallback)
    ├── ideogram-v3-turbo.svg
    ├── flux-2-pro.svg
    └── flux-1.1-pro.svg
```

---

## Final Recommendation

**Use @neplex/vectorizer** for Node.js projects and **vtracer** for Python projects.

Both produce identical quality (same VTracer engine) with:
- Full color support
- Professional smooth curves
- Reasonable file sizes
- Production-ready output

Avoid potrace for color work and img2vector until its installation issues are fixed.

For the complete logo production pipeline:
1. Generate with **Ideogram V3 Turbo** (best AI model for logos)
2. Vectorize with **@neplex/vectorizer** or **vtracer**
3. Optimize with **SVGO** (optional, reduces file size)
4. Polish in **Figma/Illustrator** (optional, for true gradients)

---

## Appendix: Library Links

- [@neplex/vectorizer](https://www.npmjs.com/package/@neplex/vectorizer) — NPM package
- [potrace](https://www.npmjs.com/package/potrace) — NPM package
- [vtracer](https://pypi.org/project/vtracer/) — PyPI package
- [img2vector](https://pypi.org/project/img2vector/) — PyPI package (broken)
- [VTracer](https://github.com/nicoptere/vtracer) — Original Rust library
