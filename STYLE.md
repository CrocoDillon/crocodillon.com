# Writing and images

## Dillon's writing voice

Based on all ten published articles, from _Welcome to my blog!_ (2013) through _Reading query string values in JavaScript_ (2016). These are voice references, not current technical advice or evidence of Dillon's present employment, tools, or opinions.

- Write as a developer explaining something he figured out to another developer. Start with the specific problem, surprising behavior, or reason to care. Skip broad industry introductions.
- Use first person for genuine experience, second person when helping the reader, and "we" when working through an example together. Don't invent personal experiences, measurements, or claims of having tested something.
- Sound conversational: contractions, plain verbs, a little enthusiasm, occasional dry humor or a short aside. "I've been there" in the Koa article and "But I digress" in CRUD are typical. Don't scatter catchphrases through every paragraph.
- Assume programming knowledge while explaining the relevant mechanism carefully. Connect each observation to its cause: what you might expect, what actually happens, why, and the working approach. Show concrete errors and edge cases.
- Let examples do real work. Introduce a small runnable snippet, explain its result, then extend it only as needed. Keep identifiers and examples consistent. Diagrams and tables clarify mechanisms or comparisons; they aren't decoration.
- Use short paragraphs, sentence-case descriptive headings, and occasional question headings. Length follows the subject: the query-string article needs no section headings; the MongoDB course notes use a substantial outline. Don't force every article into one template.
- Move supporting references and tangents into footnotes when they would interrupt the explanation. Link to the relevant primary documentation. State version and environment limits where they matter.
- Finish when the useful explanation is complete: a practical caveat, a thing to try, or a brief invitation to share a better approach. No obligatory recap, sales pitch, or engagement prompt.
- Keep spelling and grammar clean. Preserve the direct, slightly informal voice without imitating old typos or repeating outdated browser advice. Use current APIs and verify current technical claims for new articles.
- Use proper typographic punctuation in article prose: curly apostrophes (’), curly quotation marks (“…” and ‘…’), em dashes (—) for asides or breaks, and en dashes (–) for ranges where appropriate. These are normal writing conventions; don’t avoid them because they might be associated with AI writing. Keep straight quotes and hyphens where code, JSX attributes, frontmatter syntax, URLs, or literal output require them.

### Useful reference articles

- [Asynchronous callbacks in Koa](content/articles/asynchronous-callbacks-in-koa/index.mdx): a concrete failure, personal motivation, minimal contrasting examples, then version caveats.
- [LocalStorage errors](content/articles/always-catch-localstorage-security-and-quota-exceeded-errors/index.mdx): challenge a common assumption, demonstrate the failure, handle real-world inconsistencies, end with practical advice.
- [JavaScript expressions](content/articles/in-javascript-almost-anything-is-an-expression/index.mdx): start with a real snippet, explain the mechanism, return to that snippet and work through it.
- [Parsing emoji](content/articles/parsing-emoji-unicode-in-javascript/index.mdx): show the naive attempt, introduce the deeper model only when needed, then build a solution.
- [Non-blocking web fonts](content/articles/non-blocking-web-fonts-using-localstorage/index.mdx): concrete constraints, acknowledge the source of an idea, implementation, improvements, and an unresolved limitation.
- [SassC installation](content/articles/how-to-install-sassc-and-libsass-on-ubuntu/index.mdx): explain the choice before the instructions, state prerequisites, offer alternatives and a final verification step.
- [MongoDB introduction](content/articles/mongodb-for-dbas-introduction/index.mdx) and [CRUD](content/articles/mongodb-for-dbas-crud/index.mdx): learning notes with explicit attribution, theory connected to shell examples, reader experiments, and details kept within scope.
- [Query strings](content/articles/reading-query-string-values-in-javascript/index.mdx): a short answer stays short; one example and one useful caveat can be enough.
- [Welcome](content/articles/welcome-to-my-blog/index.mdx): the editorial premise is difficult or interesting web-development problems and the solutions discovered while working on them.

Before publishing, check that the article has a specific useful point, examples support its claims, and its first-person statements are supplied or confirmed by Dillon.

## Visual style

New images follow the current site branding. Historical screenshots and diagrams remain source material, not a requirement to copy the old cyan/green palette or framework logos.

- Use the quiet field-notes aesthetic: warm paper `#f8f9f5`, dark ink `#20291e`, moss `#3a643f`, muted text `#677061`, pale leaf `#e9efdf`, and rules `#dce1d6`. Plenty of space; restrained linework and simple geometry.
- Article images should explain one thing: a sequence, relationship, data structure, comparison, or real interface state. Prefer clear diagrams and genuine screenshots. Avoid stock developer imagery, decorative code, invented charts, neon gradients, 3D effects, and ornamental detail.
- Keep diagram labels short and readable at the actual article width. Use consistent strokes, arrows, spacing, and alignment. Distinguish concepts with labels or shapes as well as color. Add accurate alt text and a caption when interpretation or attribution is needed.
- Diagrams use a single editable SVG, rendered inline as a React component. Co-locate it under `content/articles/<slug>/images/` with a descriptive name. Keep its `viewBox` and intrinsic aspect ratio; don't export raster or separate theme variants. Genuine screenshots and photos use raster images at roughly twice their intended display width, typically 1600–2400 pixels. Don't enlarge old screenshots and describe that as improved detail.
- Use the site's CSS color variables with light fallbacks, for example `var(--color-moss, #3a643f)`, so inline diagrams follow the selected theme before hydration. `--color-diagram-panel` provides light and dark panel fills. Standalone SVGs use `:root.article-diagram` inside a dark media query as a system-theme fallback; this must not override the manual theme when inline. Photos, screenshots, and sharing cards keep their original colors.
- Scope SVG styles to `svg.article-diagram`, prefix IDs with the diagram name (including title/description, markers, and patterns), and include a meaningful `<title>`, `<desc>`, and `aria-labelledby`. Use the existing diagrams as references. Only import reviewed repository SVGs: they become inline page markup.

### Interactive examples

Use `content/demos/theme.css` for the shared demo palette, typography, spacing,
and light/dark colors. Keep example-specific layout in the article’s demo folder.
For component libraries, map their theme tokens to this palette instead of
restyling individual internal elements. The sync command copies the shared
stylesheet into each Pen; re-sync examples when adopting a shared style change.

Use `<ArticleDemo>` for the article frame and explicit “Run example” interaction.
Keep runnable source and pinned dependencies in Git beside the article. CodePen
provides the execution and editor; a successful build must also be checked in
the browser before embedding it.

### OG and Twitter cards

- The shared template is `app/lib/social-image.tsx`: the crocodile mark and Inter wordmark/labels, a large Libre Baskerville title, restrained circular outlines, publication information, author, and domain. Preserve generous margins and readable type at thumbnail size; wrap the full title rather than truncating it.
- Render directly at **2400 × 1260** as lossless PNG, twice the conventional 1200 × 630 layout. Both OG and Twitter use the same image. Keep cards comfortably below 1 MB where possible.
- Use the light brand palette consistently, independently of the reader's theme. Fonts are bundled locally; generation must not depend on fetching fonts from another service.
- Every article automatically gets `/blog/<slug>/share.png`; the site-wide fallback is `/opengraph-image`. New frontmatter normally needs no `image` field. An explicit local `image` remains an override when intentionally required. Old image URLs redirect to the new cards.

### Article image loading

Import a diagram directly. SVGR compiles article SVG imports into Server Components; no browser loader or separate image request is needed:

```mdx
import RequestFlow from './images/request-flow.svg'

<figure>
  <RequestFlow />
  <figcaption>A cache miss continues to the server.</figcaption>
</figure>
```

SVG diagrams are sharp at every size and need no blur placeholder. For photos and screenshots, use a static raster import with `ArticleImage` for responsive loading, reserved dimensions, and an automatic blur placeholder:

```mdx
import screenshot from './images/cache-inspector.png'

<figure>
  <ArticleImage src={screenshot} alt="The cache inspector shows one stored response." />
</figure>
```

`ArticleImage` uses responsive image loading at quality 90 and preserves the original colors. Keep small inline emoji-demo icons as ordinary images. Social platforms control loading of the sharing cards they fetch.
