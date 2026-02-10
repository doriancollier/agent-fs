# Logo Vectorization Options

> **Date:** December 2024
> **Focus:** Converting AI-generated raster logos to scalable SVG vectors

## Overview

AI image generation models primarily output raster formats (PNG, WebP, JPEG). For production logo use, these need to be converted to vector formats (SVG) for:

- **Scalability** — Crisp at any size from favicon to billboard
- **Editability** — Modify colors, shapes, and paths
- **File size** — Vectors are typically smaller for simple graphics
- **Print production** — Required for high-quality print output

This report evaluates options for automated vectorization.

---

## Quick Recommendation

| Stack | Recommended Library | Why |
|-------|---------------------|-----|
| **Node.js/TypeScript** | [@neplex/vectorizer](https://github.com/neplextech/vectorizer) | Rust-based, fastest, best quality |
| **Python** | [vtracer](https://pypi.org/project/vtracer/) | Same VTracer engine, native bindings |
| **Python + AI** | [img2vector](https://pypi.org/project/img2vector/) | Auto-detects image type, optimizes params |

### Node.js Example
```typescript
import { vectorize, ColorMode } from '@neplex/vectorizer';
import { readFile, writeFile } from 'node:fs/promises';

const src = await readFile('./logo.png');
const svg = await vectorize(src, { colorMode: ColorMode.Color });
await writeFile('./logo.svg', svg);
```

### Python Example
```python
import vtracer

vtracer.convert_image_to_svg_py('logo.png', 'logo.svg', colormode='color')
```

---

## AI Vectorization (Replicate)

### Available Options

| Approach | Status | Notes |
|----------|--------|-------|
| Raster-to-SVG AI model | **Not available** | No model exists on Replicate |
| Recraft V3 SVG | Text-to-SVG only | Cannot convert existing images |

### Commercial AI Vectorizers

These services use AI for vectorization but aren't self-hostable:

| Service | Quality | API Available | Pricing |
|---------|---------|---------------|---------|
| [Vectorizer.AI](https://vectorizer.ai/) | Excellent | Yes | $0.10-0.50/image |
| [Vector Magic](https://vectormagic.com/) | Excellent | Limited | Subscription |

**Verdict:** No viable AI vectorization option for self-hosted use. Use traditional tracing libraries instead.

---

## Node.js/TypeScript Libraries

### Comparison Matrix

| Library | Engine | Speed | Colors | Types | Maintenance |
|---------|--------|-------|--------|-------|-------------|
| **@neplex/vectorizer** | VTracer (Rust) | Fastest | Yes | Yes | Active |
| @image-tracer-ts/nodejs | Native TS | Medium | Yes | Yes | Active |
| imagetracerjs | Pure JS | Slow | Yes | No | Stable |
| potrace | Potrace port | Medium | No | Yes | Stable |

### Detailed Analysis

#### 1. @neplex/vectorizer (Recommended)

**Repository:** [github.com/neplextech/vectorizer](https://github.com/neplextech/vectorizer)

Wraps VTracer (Rust) with Node.js bindings. The best choice for production use.

**Installation:**
```bash
pnpm add @neplex/vectorizer
```

**Usage:**
```typescript
import { vectorize, ColorMode, Hierarchical, PathSimplifyMode } from '@neplex/vectorizer';
import { readFile, writeFile } from 'node:fs/promises';

const src = await readFile('./input.png');

const svg = await vectorize(src, {
  colorMode: ColorMode.Color,           // or ColorMode.Binary
  hierarchical: Hierarchical.Stacked,   // Stacked or Cutout
  mode: PathSimplifyMode.Spline,        // Spline, Polygon, or None
  filterSpeckle: 4,                     // Remove small artifacts
  colorPrecision: 6,                    // Color quantization (1-8)
  layerDifference: 16,                  // Color layer separation
  cornerThreshold: 60,                  // Corner detection angle
  lengthThreshold: 4.0,                 // Segment length threshold
  spliceThreshold: 45,                  // Splice angle threshold
  pathPrecision: 3,                     // Decimal places in paths
});

await writeFile('./output.svg', svg);
```

**Pros:**
- 4.67x faster than pure JS alternatives
- O(n) algorithm complexity
- Handles multi-color images
- Compact SVG output (fewer shapes)
- TypeScript support
- Active maintenance

**Cons:**
- Native dependency (Rust bindings)
- Larger package size

---

#### 2. @image-tracer-ts/nodejs

**Repository:** [github.com/mringler/image-tracer-ts](https://github.com/mringler/image-tracer-ts)

Native TypeScript implementation. Good for TypeScript-first projects.

**Installation:**
```bash
pnpm add @image-tracer-ts/nodejs
```

**Usage:**
```typescript
import { ImageTracerNodejs } from '@image-tracer-ts/nodejs';

const tracer = new ImageTracerNodejs();

// From file
const svg = await tracer.traceFile('./input.png', {
  // Presets: 'default', 'posterized1', 'posterized2', 'posterized3', 'curvy', 'sharp', 'detailed'
  preset: 'default',
});

// Or with custom options
const svg = await tracer.traceFile('./input.png', {
  colorsampling: 2,      // 0: disabled, 1: random, 2: deterministic
  numberofcolors: 16,    // Color palette size
  mincolorratio: 0,      // 0-1, filter small color areas
  colorquantcycles: 3,   // Color quantization iterations
  ltres: 1,              // Line tracer resolution
  qtres: 1,              // Quadratic spline resolution
  pathomit: 8,           // Omit paths shorter than this
  blurradius: 0,         // Pre-processing blur
  blurdelta: 20,         // Blur threshold
});

await writeFile('./output.svg', svg);
```

**Pros:**
- Pure TypeScript (no native deps)
- Multiple presets for common use cases
- Works in browser and Node.js
- Good documentation

**Cons:**
- Slower than Rust-based alternatives
- Output can be verbose

---

#### 3. imagetracerjs

**Repository:** [github.com/jankovicsandras/imagetracerjs](https://github.com/jankovicsandras/imagetracerjs)

The original JavaScript image tracer. Simple and well-tested.

**Installation:**
```bash
pnpm add imagetracerjs
```

**Usage:**
```javascript
const ImageTracer = require('imagetracerjs');

// Trace from file
ImageTracer.imageToSVG(
  './input.png',
  (svgString) => {
    fs.writeFileSync('./output.svg', svgString);
  },
  'posterized2'  // Preset name
);

// Available presets:
// 'default', 'posterized1', 'posterized2', 'posterized3',
// 'curvy', 'sharp', 'detailed', 'smoothed', 'grayscale', 'fixedpalette', 'randomsampling1', 'randomsampling2', 'artistic1', 'artistic2', 'artistic3', 'artistic4'
```

**Pros:**
- Battle-tested, stable
- Many presets
- Public domain license
- Works in browser

**Cons:**
- Callback-based API (not Promise)
- No TypeScript types
- Slower than alternatives
- Larger output files

---

#### 4. potrace

**Repository:** [npmjs.com/package/potrace](https://www.npmjs.com/package/potrace)

Port of the classic Potrace algorithm. Best for black & white artwork.

**Installation:**
```bash
pnpm add potrace
```

**Usage:**
```typescript
import Potrace from 'potrace';
import { writeFile } from 'node:fs/promises';

// Basic tracing (black & white)
Potrace.trace('./input.png', (err, svg) => {
  if (err) throw err;
  writeFile('./output.svg', svg);
});

// With options
Potrace.trace('./input.png', {
  threshold: 128,        // 0-255, binarization threshold
  turdSize: 2,           // Suppress speckles up to this size
  optCurve: true,        // Optimize curves
  alphaMax: 1,           // Corner threshold (0=sharp, 1.334=smooth)
  optTolerance: 0.2,     // Curve optimization tolerance
}, callback);

// Posterize (multiple thresholds)
Potrace.posterize('./input.png', {
  steps: 4,              // Number of color levels
  // ... other options
}, callback);
```

**Pros:**
- Classic, proven algorithm
- Good for silhouettes and line art
- TypeScript types available
- Small package

**Cons:**
- Black & white only (posterize adds limited color)
- O(n²) algorithm (slower for complex images)
- Callback-based API

---

## Python Libraries

Python has excellent vectorization options, often with more mature ecosystems for image processing.

### Comparison Matrix

| Library | Engine | Speed | Colors | AI Features | Maintenance |
|---------|--------|-------|--------|-------------|-------------|
| **vtracer** | VTracer (Rust) | Fastest | Yes | No | Active |
| **img2vector** | VTracer + AI | Fast | Yes | Yes | Active (2025) |
| potracer | Pure Python | Slow | No | No | Stable |
| pypotrace | C bindings | Fast | No | No | Outdated |

### Detailed Analysis

#### 1. vtracer (Recommended for Python)

**Repository:** [pypi.org/project/vtracer](https://pypi.org/project/vtracer/)

Official Python bindings for VTracer. Same engine as @neplex/vectorizer.

**Installation:**
```bash
pip install vtracer
```

**Usage:**
```python
import vtracer

# Simple conversion
vtracer.convert_image_to_svg_py('input.png', 'output.svg')

# With options
vtracer.convert_image_to_svg_py(
    'input.png',
    'output.svg',
    colormode='color',          # 'color' or 'binary'
    hierarchical='stacked',     # 'stacked' or 'cutout'
    mode='spline',              # 'spline', 'polygon', or 'none'
    filter_speckle=4,           # Remove small artifacts
    color_precision=6,          # Color quantization (1-8)
    layer_difference=16,        # Color layer separation
    corner_threshold=60,        # Corner detection angle
    length_threshold=4.0,       # Segment length (3.5-10)
    max_iterations=10,          # Processing iterations
    splice_threshold=45,        # Splice detection
    path_precision=3,           # Decimal places in paths
)

# For binary (B&W) - faster
vtracer.convert_image_to_svg_py('input.png', 'output.svg', colormode='binary')
```

**Pros:**
- Same high-quality VTracer engine as Node.js version
- Native Rust bindings (fast)
- Full parameter control
- Active maintenance

**Cons:**
- Native dependency (may have install issues on some systems)

---

#### 2. img2vector (AI-Enhanced)

**Repository:** [pypi.org/project/img2vector](https://pypi.org/project/img2vector/)

Wraps VTracer with AI-powered optimization that auto-detects image type.

**Installation:**
```bash
pip install img2vector
```

**Usage:**
```python
from img2vector import convert_image

# Simple (auto-optimizes based on detected image type)
convert_image('input.jpg', 'output.svg')

# Advanced usage
from img2vector import Img2Vector

converter = Img2Vector()
converter.convert(
    'input.jpg',
    output_path='output.svg',
    auto_optimize=True,           # AI detection + optimization
    preprocessing_level='medium', # 'none', 'light', 'medium', 'heavy'
    colormode='binary',           # 'color' or 'binary'
)
```

**AI Features:**
- Auto-detects image type: Line Drawing, Technical Drawing, Geometric Shapes, Diagram, Photo
- Applies optimal parameters for each type
- Preprocessing pipeline (OpenCV-based)

**Pros:**
- AI-powered parameter optimization
- Handles diverse image types well
- Built-in preprocessing
- Gradio web UI included
- MIT license

**Cons:**
- Larger dependency footprint (OpenCV, Pillow)
- Newer library (less battle-tested)

---

#### 3. potracer (Pure Python Potrace)

**Repository:** [pypi.org/project/potracer](https://pypi.org/project/potracer/)

Pure Python implementation of Potrace. No compilation required.

**Installation:**
```bash
pip install potracer

# With CLI
pip install potracer[cli]
```

**Usage:**
```python
from PIL import Image
import potrace

# Load image and convert to bitmap
image = Image.open('input.png').convert('L')  # Grayscale
bitmap = potrace.Bitmap(image)

# Trace
path = bitmap.trace(
    turdsize=2,        # Suppress speckles
    turnpolicy=potrace.TURNPOLICY_MINORITY,
    alphamax=1.0,      # Corner smoothness
    opticurve=True,    # Optimize curves
    opttolerance=0.2,  # Optimization tolerance
)

# Export to SVG
with open('output.svg', 'w') as f:
    f.write(path.to_svg())
```

**CLI Usage:**
```bash
potracer input.png -o output.svg --backend svg
```

**Pros:**
- Pure Python (no compilation issues)
- Works everywhere Python runs
- Drop-in replacement for pypotrace API
- CLI included

**Cons:**
- ~500x slower than C potrace (still fast enough for most uses)
- Black & white only
- Requires numpy

---

#### 4. pypotrace (C Bindings - Legacy)

**Repository:** [pypi.org/project/pypotrace](https://pypi.org/project/pypotrace/)

Original C bindings to Potrace. Fast but has installation issues.

**Installation:**
```bash
pip install pypotrace
```

**Note:** Often fails to install due to C compilation requirements. Use `potracer` instead for better compatibility.

**Pros:**
- Fast (C implementation)

**Cons:**
- Installation issues on many systems
- Outdated (last release 2021)
- Black & white only
- Requires C compiler

---

### Python Workflow Example

```python
#!/usr/bin/env python3
"""Batch vectorize logos with optimal settings."""

import vtracer
from pathlib import Path

def vectorize_logo(
    input_path: str,
    output_path: str,
    colors: int = 4
) -> None:
    """Vectorize a logo with settings optimized for clean graphics."""
    vtracer.convert_image_to_svg_py(
        input_path,
        output_path,
        colormode='color',
        hierarchical='stacked',
        mode='spline',
        filter_speckle=4,
        color_precision=min(colors, 8),
        layer_difference=24,
        corner_threshold=60,
        length_threshold=4.0,
        splice_threshold=45,
        path_precision=2,
    )
    print(f"Vectorized: {input_path} → {output_path}")


def batch_vectorize(input_dir: str, output_dir: str) -> None:
    """Vectorize all PNG files in a directory."""
    input_path = Path(input_dir)
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    for png_file in input_path.glob('*.png'):
        svg_file = output_path / f"{png_file.stem}.svg"
        vectorize_logo(str(png_file), str(svg_file))


if __name__ == '__main__':
    batch_vectorize(
        '.temp/images/logo-comparison/ideogram-v3-turbo',
        '.temp/images/logo-comparison/vectorized'
    )
```

---

## Algorithm Comparison

### VTracer vs Potrace

| Aspect | VTracer | Potrace |
|--------|---------|---------|
| **Input** | Color images | Binary (B&W) only |
| **Algorithm** | O(n) | O(n²) |
| **Output** | Stacked shapes | Shapes with holes |
| **Compactness** | More compact | More verbose |
| **Speed** | Faster | Slower for complex |
| **Best for** | Logos, illustrations | Line art, silhouettes |

### How VTracer Works

```
1. CLUSTERING    →  Group pixels by color similarity
2. PATH TRACING  →  Convert pixel groups to paths
3. SIMPLIFICATION →  Reduce points in paths
4. SMOOTHING     →  Apply Bezier curve fitting
```

### How Potrace Works

```
1. BINARIZATION  →  Convert to black/white
2. DECOMPOSITION →  Find connected components
3. TRACING       →  Generate polygon paths
4. OPTIMIZATION  →  Fit Bezier curves
```

---

## Quality Optimization

### For Logo Vectorization

Logos typically have:
- Few colors (2-5)
- Clean edges
- Simple shapes

**Recommended settings for @neplex/vectorizer:**
```typescript
const svg = await vectorize(src, {
  colorMode: ColorMode.Color,
  filterSpeckle: 4,        // Remove noise artifacts
  colorPrecision: 4,       // Fewer colors = simpler paths
  layerDifference: 24,     // Merge similar colors
  cornerThreshold: 60,     // Preserve sharp corners
  pathPrecision: 2,        // Fewer decimal places
});
```

### Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| Jagged edges | Low source resolution | Use higher res input or increase `lengthThreshold` |
| Too many colors | Color precision too high | Reduce `colorPrecision` |
| Missing details | Speckle filter too aggressive | Reduce `filterSpeckle` |
| Rounded corners | Corner threshold too low | Increase `cornerThreshold` |
| Large file size | Too many path points | Increase `pathPrecision` (fewer decimals) |

---

## Recommended Workflow

### Complete Logo Vectorization Pipeline

```typescript
// vectorize-logo.ts
import { vectorize, ColorMode, Hierarchical, PathSimplifyMode } from '@neplex/vectorizer';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

interface VectorizeOptions {
  input: string;
  output: string;
  colors?: number;
  filterNoise?: boolean;
}

async function vectorizeLogo({
  input,
  output,
  colors = 4,
  filterNoise = true
}: VectorizeOptions): Promise<void> {
  const src = await readFile(input);

  const svg = await vectorize(src, {
    colorMode: ColorMode.Color,
    hierarchical: Hierarchical.Stacked,
    mode: PathSimplifyMode.Spline,
    filterSpeckle: filterNoise ? 4 : 0,
    colorPrecision: Math.min(colors, 8),
    layerDifference: 24,
    cornerThreshold: 60,
    lengthThreshold: 4.0,
    spliceThreshold: 45,
    pathPrecision: 2,
  });

  // Ensure output directory exists
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, svg);

  console.log(`Vectorized: ${input} → ${output}`);
}

// Usage
await vectorizeLogo({
  input: '.temp/images/logo-comparison/ideogram-v3-turbo/lumina-logo.png',
  output: '.temp/images/logo-comparison/vectorized/lumina-logo.svg',
  colors: 2,  // Black + white
});
```

### Batch Processing

```typescript
import { glob } from 'glob';

async function batchVectorize(pattern: string, outputDir: string) {
  const files = await glob(pattern);

  await Promise.all(files.map(async (file) => {
    const outputPath = `${outputDir}/${basename(file, extname(file))}.svg`;
    await vectorizeLogo({ input: file, output: outputPath });
  }));
}

// Vectorize all Ideogram outputs
await batchVectorize(
  '.temp/images/logo-comparison/ideogram-v3-turbo/*.png',
  '.temp/images/logo-comparison/vectorized'
);
```

---

## Post-Processing

Automated vectorization rarely produces perfect results. Plan for these manual steps:

### In Figma/Illustrator

1. **Simplify paths** — Reduce anchor points
2. **Unite shapes** — Merge overlapping elements
3. **Align to grid** — Snap to pixel grid for crisp rendering
4. **Optimize colors** — Reduce to exact brand colors
5. **Create variants** — Horizontal, stacked, icon-only lockups

### SVG Optimization

After manual cleanup, optimize the SVG:

```bash
# Using SVGO (install globally: npm i -g svgo)
svgo input.svg -o output.svg

# Or programmatically
pnpm add svgo
```

```typescript
import { optimize } from 'svgo';
import { readFile, writeFile } from 'node:fs/promises';

const svg = await readFile('./logo.svg', 'utf8');
const result = optimize(svg, {
  multipass: true,
  plugins: [
    'preset-default',
    'removeDimensions',
    { name: 'removeViewBox', active: false },
  ],
});
await writeFile('./logo.min.svg', result.data);
```

---

## Decision Matrix

### By Language/Stack

| Scenario | Recommended Tool |
|----------|------------------|
| **Node.js/TypeScript** | @neplex/vectorizer |
| **Python** | vtracer |
| **Python + auto-optimization** | img2vector |
| **Browser** | imagetracerjs |
| **Any language (CLI)** | vtracer CLI or potracer CLI |

### By Use Case

| Scenario | Recommended Tool |
|----------|------------------|
| Production pipeline (Node.js) | @neplex/vectorizer |
| Production pipeline (Python) | vtracer |
| TypeScript-first project | @image-tracer-ts/nodejs |
| Diverse image types | img2vector (AI detection) |
| Browser-based tool | imagetracerjs |
| B&W line art / silhouettes | potrace (Node) or potracer (Python) |
| No native dependencies | potracer (pure Python) or imagetracerjs |
| Highest quality (budget available) | Vectorizer.AI API |
| One-off manual work | Adobe Illustrator Image Trace |

---

## References

### Node.js/TypeScript Libraries
- [@neplex/vectorizer](https://github.com/neplextech/vectorizer) — Rust-based Node.js vectorizer
- [image-tracer-ts](https://github.com/mringler/image-tracer-ts) — TypeScript tracer
- [imagetracerjs](https://github.com/jankovicsandras/imagetracerjs) — Original JS implementation
- [potrace (npm)](https://www.npmjs.com/package/potrace) — Classic algorithm port
- [SVGO](https://github.com/svg/svgo) — SVG optimizer

### Python Libraries
- [vtracer (PyPI)](https://pypi.org/project/vtracer/) — Official VTracer Python bindings
- [img2vector (PyPI)](https://pypi.org/project/img2vector/) — AI-enhanced vectorization
- [potracer (PyPI)](https://pypi.org/project/potracer/) — Pure Python Potrace
- [pypotrace (PyPI)](https://pypi.org/project/pypotrace/) — C bindings (legacy)

### Core Libraries
- [VTracer](https://github.com/visioncortex/vtracer) — Core Rust library (powers both Node.js and Python options)
- [Potrace](https://potrace.sourceforge.net/) — Original C library by Peter Selinger

### Resources
- [image2svg-awesome](https://github.com/fromtheexchange/image2svg-awesome) — Comprehensive resource list
- [Potrace algorithm paper](http://potrace.sourceforge.net/potrace.pdf) — Technical details

### Commercial Services
- [Vectorizer.AI](https://vectorizer.ai/) — AI-powered vectorization API
- [Vector Magic](https://vectormagic.com/) — Desktop and online tool
