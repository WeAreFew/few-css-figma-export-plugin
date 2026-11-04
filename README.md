# Few — Variables and Styles Exporter

A Figma plugin by [Few](https://few.studio). Export your native Figma variable collections and styles to clean, grouped SCSS or CSS — with fluid `clamp()` typography, text style mixins, color styles, and effect styles.

## Installation

### From Figma Community
Search for **"Few — Variables and Styles Exporter"** in the Figma Community plugins tab.

### Development
1. Clone or download this repo
2. In Figma desktop: **Main Menu → Plugins → Development → Import plugin from manifest…**
3. Select `manifest.json`
4. Run via **Plugins → Development → Few — Variables and Styles Exporter**

> **Note:** The `id` field in `manifest.json` must be replaced with your own plugin ID from the Figma developer dashboard before publishing.

## Features

**Variables**
- Reads all local Figma native variable collections
- Groups variables by shared prefix with `// comment` headers
- Numeric scales sorted correctly (50 before 100)
- Alias resolution — keep `$references` or resolve to raw values
- Unitless output for opacity/alpha (as `%`), z-index, and similar
- Multi-mode support — switch between light/dark or other modes
- Clash detection — warns when two variables share the same export name

**Fluid typography**
- `clamp()` generation pairs `h1` + `h1-mobile` into a single fluid expression
- Choose which groups use clamp, with configurable min/max viewports

**Text Styles**
- Exports as `@mixin` (SCSS) or `.class` selectors (CSS/toggle off)
- References your variable names where styles are bound to variables
- Includes font-family, size, weight, style, line-height, letter-spacing, text-transform, text-decoration, paragraph spacing

**Color Styles**
- Solid fills, gradients, image fills
- References variable names when bound
- Single `:root {}` block for CSS

**Effect Styles**
- Box shadows, filters, backdrop filters as `$variables` or `--custom-properties`

**Export**
- SCSS or CSS format
- rem or px units (16px base)
- Hex or rgba color format
- Download single file or zip of all separate files
- One-click copy to clipboard

## Output example

```scss
// base-variables.scss

// ====================================================
// Primitives
// ====================================================

// Size
$size-0: 0rem;
$size-4: 0.25rem;
$size-8: 0.5rem;

// ====================================================
// Typography
// ====================================================

// Font Size Heading
$font-size-heading-h1: clamp(3rem, 3.43vw + 0.57rem, 4.5rem);
$font-size-heading-h2: clamp(2.5rem, 2.86vw + 0.36rem, 4rem);
```

## File Structure

```
few-variables-exporter/
├── manifest.json   Figma plugin config
├── code.js         Plugin backend (Figma sandbox)
├── ui.html         Plugin UI
├── icon.png        Plugin icon (128×128)
└── README.md
```

## Privacy

This plugin reads only your local Figma file's variables and styles. No data is sent to any server. Everything runs locally in the Figma sandbox.
