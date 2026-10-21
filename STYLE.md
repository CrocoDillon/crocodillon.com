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
- For new diagrams, keep an editable SVG source and export a crisp PNG at roughly twice its intended display width, typically 1600–2400 pixels. Choose the aspect ratio to fit the explanation. Don't enlarge old screenshots and describe that as improved detail.
- Store source and display assets under `public/images/articles/<slug>/` with descriptive names. Keep diagram backgrounds intentional and opaque so dark mode doesn't make labels disappear. `ArticleImage` uses a light paper background for archived transparent diagrams.

### OG and Twitter cards

- The shared template is `app/lib/social-image.tsx`: the crocodile mark and Inter wordmark/labels, a large Libre Baskerville title, restrained circular outlines, publication information, author, and domain. Preserve generous margins and readable type at thumbnail size; wrap the full title rather than truncating it.
- Render directly at **2400 × 1260** as lossless PNG, twice the conventional 1200 × 630 layout. Both OG and Twitter use the same image. Keep cards comfortably below 1 MB where possible.
- Use the light brand palette consistently, independently of the reader's theme. Fonts are bundled locally; generation must not depend on fetching fonts from another service.
- Every article automatically gets `/blog/<slug>/share.png`; the site-wide fallback is `/opengraph-image`. New frontmatter normally needs no `image` field. An explicit local `image` remains an override when intentionally required. Old image URLs redirect to the new cards.

### Article image loading

Use a static import with the shared component so Next.js supplies dimensions and a small blur placeholder automatically:

```mdx
import diagram from '../../../public/images/articles/my-article/request-flow.png'

<figure>
  <ArticleImage src={diagram} alt="The browser sends a request through the cache to the server." />
  <figcaption>A cache miss continues to the server.</figcaption>
</figure>
```

`ArticleImage` uses responsive image loading at quality 90 and reserves the original aspect ratio. Keep small inline SVG icons as ordinary images. Blur placeholders apply to images on the blog; social platforms control loading of the sharing cards they fetch.
