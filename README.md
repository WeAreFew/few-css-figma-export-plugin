# Few — Variables and Styles Exporter (recovered source)

Figma plugin that exports a file's variable collections and text/color/effect styles as SCSS or CSS
(variables, `@mixin`/class text styles, `clamp()` for mobile/desktop pairs, rem/px, hex/rgba, zip download).

Community listing: https://www.figma.com/community/plugin/1616864676074811900

## Files

| File | What it is |
| --- | --- |
| `manifest.json` | Plugin manifest. `id` matches the published listing, so updates go to the same plugin. |
| `code.js` | Main-thread code (reads variables/styles from the file, posts them to the UI). |
| `ui.html` | The plugin UI: markup, CSS, and all export/formatting logic. |

## Run it locally

1. Figma desktop app → **Plugins → Development → Import plugin from manifest…**
2. Choose `manifest.json` from this folder.
3. Run it from **Plugins → Development**. Edit files, then re-run to see changes.

## Publish an update

Because `manifest.json` keeps the original `id`, publish from the Figma account that owns the listing:
**Plugins → Manage plugins →** (your plugin) **→ Publish new version**.

## Recovery notes — read before trusting this as the original

The original source was lost, so this is a rebuild:

- **`ui.html`** was recovered from the live plugin's DOM. The CSS and script are the original,
  with Figma's injected wrapper code and runtime-rendered output removed. It is two small edits from verbatim:
  - Line height from a percent value now divides by 100 (Figma `150%` → CSS `1.5`).
  - Letter spacing from a percent value now divides by 100 (Figma `5%` → `0.05em`).
  The recovered code divided letter spacing by 1000 and did not divide line height; both are marked
  with `RECOVERY NOTE` comments. Revert them if your original behaviour was intentional.
- **`code.js`** is reconstructed from the messages and data shapes `ui.html` uses (`refresh`, `resize`,
  `setMode` in; one `variables` message out). It was tested against a mock Figma file, not a real one.
  Run it side by side with the published plugin on a real file and diff the output.
- **`manifest.json`** is inferred. The `dev`/`inspect` entries are a guess based on the UI's Dev Mode
  styles, the network allow-list covers the Google Fonts the UI loads, and the name uses the UI's
  `<title>` (the in-app modal showed "Few — Variables Exporter"). Adjust any of these if they differ
  from what you published.
- Small judgement calls in `code.js`: zero letter spacing is skipped, unbound paragraph spacing and
  indent are emitted in `px`, and invisible fills/effects are ignored.

## Don't lose it again

```bash
git init && git add . && git commit -m "Recovered Variables and Styles Exporter"
```

Then push it to the Few GitHub org (there is a `WeAreFew/few-css-figma-export-plugin` repo
that may be related).
