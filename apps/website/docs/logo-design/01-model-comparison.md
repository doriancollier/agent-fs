# Logo Generation Model Comparison

> **Date:** December 2024
> **Models Tested:** 7
> **Total Logos Generated:** 21 (3 per model)

## Overview

This report documents a comparison of AI image generation models on Replicate for logo creation. All models were tested with the same prompt to evaluate their suitability for generating professional logos with wordmarks and icons.

## Test Methodology

### Prompt Used

```
A professional modern logo for a tech startup called 'Lumina'.
The logo features a minimalist lightbulb icon combined with the
wordmark 'LUMINA' in a clean sans-serif font. Clean white background,
vector style, suitable for business use.
```

### Evaluation Criteria

- **Prompt adherence** — Did it follow the brief?
- **Typography quality** — Is the wordmark clean and professional?
- **Icon design** — Is the lightbulb icon minimal and recognizable?
- **Production readiness** — Could this be used with minimal cleanup?
- **Consistency** — Are multiple outputs from the same model similar in quality?
- **Scalability** — Will the design work at small sizes (favicon) and large (billboard)?

---

## Model Rankings

| Rank | Model | Rating | Best For |
|------|-------|--------|----------|
| 1 | Ideogram V3 Turbo | A | Production-ready logos, text rendering |
| 2 | Flux 2 Pro | A- | Polished concepts with modern aesthetics |
| 3 | Flux 1.1 Pro | B+ | Elegant, minimal concepts |
| 4 | Nano Banana Pro | B+ | Creative exploration, high detail |
| 5 | Nano Banana | B | Quick iterations, variety |
| 6 | Recraft V3 SVG | B- | When you *need* vectors (requires cleanup) |
| 7 | Recraft V3 | D | Not recommended for logos |

---

## Detailed Model Analysis

### 1. Ideogram V3 Turbo — Best Overall

**Rating: A**

The standout performer. All three outputs were remarkably consistent, production-ready, and actually usable without modification.

**Strengths:**
- Clean, minimalist lightbulb icon perfectly balanced with wordmark
- Excellent typography — consistent, professional sans-serif
- Perfect icon-to-text proportions
- Horizontal lockup works well for headers, apps, business cards
- Monochrome black treatment is versatile for any context
- Most consistent across multiple generations

**Weaknesses:**
- Used lowercase "lumina" instead of "LUMINA" as requested (though it arguably looks better)
- Limited color exploration

**Technical Details:**
| Metric | Value |
|--------|-------|
| Generation time | ~5 seconds |
| Output format | PNG |
| Estimated cost | ~$0.03 |

**Verdict:** The only model that produced genuinely usable logos out of the box. If you need one model for logo work, this is it.

---

### 2. Black Forest Labs Flux 2 Pro — Best for Polished Concepts

**Rating: A-**

Strong, professional outputs with nice variety across generations.

**Strengths:**
- Beautiful horizontal lockups with gradient treatments
- Clean execution with modern aesthetic
- Excellent prompt adherence on wordmark spelling ("LUMINA")
- Interesting tech-forward concepts (lightbulb with signal waves)
- Professional gradient blue color palette

**Weaknesses:**
- Icon designs are more illustrative than minimal
- May need simplification for very small sizes (favicon)
- Higher variability between generations

**Technical Details:**
| Metric | Value |
|--------|-------|
| Generation time | ~10 seconds |
| Output format | PNG |
| Estimated cost | ~$0.06 |

**Verdict:** Excellent for exploring polished directions. Outputs need minor refinement but provide strong starting points.

---

### 3. Black Forest Labs Flux 1.1 Pro — Most Elegant

**Rating: B+**

Produced the most sophisticated, premium-feeling output of all models.

**Strengths:**
- Ultra-minimal line-art lightbulb with delicate radiating lines
- Very "premium tech startup" aesthetic
- Elegant, refined visual language
- Clean white background as requested

**Weaknesses:**
- Almost *too* delicate — thin lines might disappear at small sizes
- Limited color exploration
- Less variety between generations

**Technical Details:**
| Metric | Value |
|--------|-------|
| Generation time | ~3.5 seconds |
| Output format | PNG |
| Estimated cost | ~$0.04 |

**Verdict:** Best for high-end, sophisticated brand directions. May need line weight adjustments for versatility.

---

### 4. Google Nano Banana Pro — Best Icon Creativity

**Rating: B+**

Creative, well-executed concepts with clever design thinking.

**Strengths:**
- Cleverly integrates "L" letterform into the lightbulb
- Good balance between icon and wordmark
- Bi-color treatment (blue + dark) adds visual interest
- Highest detail output (2.7MB files)
- Good variety between generations

**Weaknesses:**
- "L" inside bulb can be busy at small sizes
- Some outputs overly complex for logo use
- Longer generation time

**Technical Details:**
| Metric | Value |
|--------|-------|
| Generation time | ~28 seconds |
| Output format | PNG |
| Estimated cost | ~$0.05 |

**Verdict:** Great for exploring creative directions and clever icon concepts. Outputs may need simplification.

---

### 5. Google Nano Banana (Standard) — Good Variety

**Rating: B**

Solid outputs with interesting variations, good for rapid exploration.

**Strengths:**
- Good variety across generations
- Interesting concepts (gradient treatments, circuit board elements, geometric shapes)
- Fast generation time
- Low cost per image

**Weaknesses:**
- Some designs too complex for logo use
- Typography quality varies between generations
- Less consistent than Pro version

**Technical Details:**
| Metric | Value |
|--------|-------|
| Generation time | ~5 seconds |
| Output format | PNG |
| Estimated cost | ~$0.01 |

**Verdict:** Best for quick, cheap iterations when exploring directions. Cherry-pick the best outputs for refinement.

---

### 6. Recraft V3 SVG — Best for Production (Vector)

**Rating: B-**

The only model outputting true SVG vectors, which is essential for production logos. However, significant caveats apply.

**Strengths:**
- Native SVG output — scalable to any size
- Editable vector paths
- Includes complete wordmark "LUMINA"

**Weaknesses:**
- Doesn't understand "logo" aesthetics — outputs illustrations instead
- SVG code is extremely complex (thousands of path points)
- One output completely missed the brief (artistic woman illustration)
- Requires significant manual cleanup

**Technical Details:**
| Metric | Value |
|--------|-------|
| Generation time | ~11 seconds |
| Output format | SVG |
| Estimated cost | ~$0.04 |

**Sample SVG Complexity:**
```
File size: ~23 KB
Path elements: 40+
Total path points: 2000+
```

**Verdict:** Use when you absolutely need vector output from generation. Plan for substantial cleanup work in a vector editor.

---

### 7. Recraft V3 (Raster) — Wrong Style

**Rating: D**

Completely missed the brief. Not suitable for logo generation.

**Strengths:**
- Strong execution of what it *did* produce
- Would work well for vintage/retro illustration projects

**Weaknesses:**
- Outputs look like vintage poster art, not corporate logos
- Retro/distressed texture inappropriate for tech startup
- Bold colors (orange, green, teal) don't match brief
- The `digital_illustration/2d_art_poster` style is fundamentally wrong for logos

**Technical Details:**
| Metric | Value |
|--------|-------|
| Generation time | ~7 seconds |
| Output format | WebP |
| Estimated cost | ~$0.04 |
| Style used | `digital_illustration/2d_art_poster` |

**Note:** Recraft V3 doesn't have a "logo" style option. The available styles are oriented toward illustration, not brand identity work.

**Verdict:** Not recommended for logo generation. Use for illustration projects only.

---

## Key Findings

### What Works

1. **Ideogram excels at text** — Superior wordmark rendering compared to all other models
2. **Flux models understand "professional"** — Clean, modern outputs that feel business-appropriate
3. **Simple prompts work best** — Over-specifying can confuse models
4. **Horizontal lockups are easiest** — Models struggle with stacked icon/wordmark layouts

### What Doesn't Work

1. **Recraft for logos** — Despite having an SVG model, it doesn't understand logo aesthetics
2. **Specific case requests** — Most models ignore "LUMINA" vs "lumina" preferences
3. **Complex iconography** — Models default to generic lightbulb representations
4. **Color specifications** — Hard to get specific brand colors without fine-tuning

### Gotchas Discovered

| Issue | Discovery |
|-------|-----------|
| `laion-ai/erlich` | Logo-specific model is deprecated (404) |
| Recraft V3 `style: "logo"` | Doesn't exist — use `digital_illustration/2d_art_poster` |
| SVG complexity | Recraft SVG outputs need path simplification |
| Ideogram casing | Prefers lowercase despite prompt |

---

## Recommended Workflow

### For Quick Concepts
```
1. Generate 3-5 options with Ideogram V3 Turbo
2. Pick the strongest direction
3. Iterate with Flux 2 Pro for variations
4. Vectorize the winner (see vectorization report)
```

### For Production Logos
```
1. Generate concepts with Ideogram V3 Turbo
2. Vectorize with @neplex/vectorizer
3. Clean up paths in Figma/Illustrator
4. Create lockup variations manually
5. Export final assets
```

### For Exploration
```
1. Quick iterations: Nano Banana (~$0.01/image)
2. Creative concepts: Nano Banana Pro
3. Polished directions: Flux 2 Pro
4. Production winner: Ideogram V3 Turbo
```

---

## Cost Analysis

| Model | Cost/Image | 10 Logos | 50 Logos |
|-------|------------|----------|----------|
| Nano Banana | $0.01 | $0.10 | $0.50 |
| Ideogram V3 Turbo | $0.03 | $0.30 | $1.50 |
| Flux 1.1 Pro | $0.04 | $0.40 | $2.00 |
| Recraft V3 | $0.04 | $0.40 | $2.00 |
| Recraft V3 SVG | $0.04 | $0.40 | $2.00 |
| Nano Banana Pro | $0.05 | $0.50 | $2.50 |
| Flux 2 Pro | $0.06 | $0.60 | $3.00 |

**Recommended budget for a logo project:** $2-5 (40-100 generations across models)

---

## File Organization

Generated logos are stored in:
```
.temp/images/logo-comparison/
├── README.md
├── nano-banana/           # 3 PNG files
├── nano-banana-pro/       # 3 PNG files
├── flux-1.1-pro/          # 3 PNG files
├── flux-2-pro/            # 3 PNG files
├── recraft-v3/            # 3 WebP files
├── recraft-v3-svg/        # 3 SVG files
└── ideogram-v3-turbo/     # 3 PNG files
```

---

## Appendix: Model Links

- [google/nano-banana](https://replicate.com/google/nano-banana)
- [google/nano-banana-pro](https://replicate.com/google/nano-banana-pro)
- [black-forest-labs/flux-1.1-pro](https://replicate.com/black-forest-labs/flux-1.1-pro)
- [black-forest-labs/flux-2-pro](https://replicate.com/black-forest-labs/flux-2-pro)
- [recraft-ai/recraft-v3-svg](https://replicate.com/recraft-ai/recraft-v3-svg)
- [recraft-ai/recraft-v3](https://replicate.com/recraft-ai/recraft-v3)
- [ideogram-ai/ideogram-v3-turbo](https://replicate.com/ideogram-ai/ideogram-v3-turbo)
