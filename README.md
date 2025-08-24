<img src="docs/images/automaticbook-logo.png" alt="Mon logo" width="200"/>

# Markdown-Import

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub release](https://img.shields.io/github/v/release/lab-Spectral/Markdown-Import?include_prereleases&sort=semver)](https://github.com/lab-Spectral/Markdown-Import/releases/latest)

This script for Adobe InDesign automatically imports and transforms a Markdown text into a styled document, ready for layout. It replaces Markdown tags with the corresponding paragraph and character styles, and converts Markdown footnotes into actual InDesign footnotes.

#### Requirements
Adobe InDesign CS6 or newer (macOS/Windows)
➡️ [Download latest release](https://github.com/lab-Spectral/Markdown-Import/releases/latest)



| <img src="docs/images/Markdown-import-screen1.png" style="max-width:100%; height:auto;"/> | <img src="docs/images/Markdown-import-screen2.png" style="max-width:100%; height:auto;"/> |
|---|---|

| <img src="docs/images/Markdown-import-config1.png" style="max-width:100%; height:auto;"/> | <img src="docs/images/Markdown-import-config2.png" style="max-width:100%; height:auto;"/> | <img src="docs/images/Markdown-import-config3.png" style="max-width:100%; height:auto;"/> |
|---|---|---|

---

## Installation

1. Download `Markdown-Import_v1.0b9.jsx`.
2. In InDesign, open **Window → Utilities → Scripts**.
3. Right‑click **User** → **Reveal in Finder/Explorer**, then drop the `.jsx` into the opened folder.
4. Double‑click the script in the **Scripts** panel to run it.

---

## Quick Start

1. Prepare your target text:

   * Select a text frame **or**
   * Use a frame labeled `content`/`contenu` **or**
   * The script will fall back to the **first story** in the document
2. Run the script.
3. In the UI, map Markdown elements to your **Paragraph**/**Character** styles (three tabs).
4. Click **Apply**. The text is converted, footnotes are inserted, and styles are applied.

> The UI suggests likely styles automatically (French/English names).

---

## Configuration with `.mdconfig`

**What it is** — A JSON file that saves the mapping (by **style names**, not IDs) and options.

**Autodetection** — The script searches for a `.mdconfig` near your `.indd` (recursive up to 3 levels). If found under a `config/` subfolder, the script runs in **silent mode** (no UI).

**Example**

```json
{
	"h1":"H1",
	"h2":"H2",
	"h3":"H3",
	"h4":"H4",
	"h5":"H5",
	"h6":"H6",
	"quote":"Citation",
	"bulletlist":"Bulleted list",
	"normal":"Body text",
	
	"italic":"Italic",
	"bold":"Bold",
	"bolditalic":Bold italic,
	"underline":Underline,
	"smallcaps":"Small caps",
	"subscript":"Subscript",
	"superscript":"Superscript",
	"note":"Footnote",
	
	"removeBlankPages":true
}
```

> Place the file next to the document or under `config/` for silent mode.

---

## Target Story Resolution

The script chooses the target story in this order:

1. The story of the **current text selection**, if any
2. A text frame labeled **`content`** or **`contenu`**
3. Otherwise, the **first text frame** in the document

---

## Markdown Support

### Block‑level

* **Headings**: `h1` to `h6`
* **Blockquotes**: lines starting with `>`
* **Bulleted lists**: `-` / `*` / `+` followed by a space

> Not supported yet: **ordered lists** and **nested lists**.

### Inline

* **Bold**: `**text**` / `__text__`
* **Italic**: `*text*` / `_text_`
* **Bold+Italic**: `***text***`, `___text___`, and mixed forms (`**_x_**`, `_**x**_`, etc.)
* **Underline**: `[text]{.underline}`
* **Small caps**: `[text]{.smallcaps}`
* **Superscript**: `^text^`
* **Subscript**: `~text~`

### Footnotes

* **Reference**: `[^id]`
* **Definition**: `[^id]: Note text`
* Native InDesign footnotes are inserted at a **smart anchor** (before trailing spaces/punctuation, handling combining diacritics). Inline formatting is also applied **inside** footnotes.


---

## Cleanup & Finishing

* Collapse **multiple line breaks** to a single paragraph break
* Convert `--` to an **em‑dash** (`—`)
* Optional: **remove blank pages** after the actual end of the imported story; in facing‑pages documents, add a page if needed to keep spreads aligned

> Use the page‑removal option carefully if you keep end matter (colophon, credits, graphics) after the main text.

