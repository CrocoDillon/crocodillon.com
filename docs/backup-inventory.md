# Hosting backup inventory

Only CrocoDillon is being migrated in this project. The other sites remain in the ignored local backup.

| Site                     | What is present                                                                                                            | Migration effort                                                            |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `crocodillon.com`        | Zend Framework 2 blog, ten published database articles, contact template, illustrations, social images, and demos          | Migrated here to Next.js and MDX                                            |
| `justifygrid.com`        | Static single-page Justify Grid documentation/demo, CSS, JavaScript, illustrations, and verification file; 19 public files | Small static-site migration; no database apparent                           |
| `dillon.nl`              | Minimal HTML placeholder and supporting files; nine public files                                                           | Very small static-site migration                                            |
| `waterpassen.com`        | Static L.W.U. Landmeten, Waterpassen en Uitzetten page with images/CSS; 18 public files                                    | Small static-site migration; review old contact details before republishing |
| `devoor.com`             | Statistics/log directories; no `public_html` or public site content                                                        | No website found in this backup                                             |
| Café Silvestre prototype | Static prototype inside CrocoDillon’s `public_html/temp/cafesilvestre`                                                     | Separate project; not part of the blog                                      |

The emoji demo also contained a PHP guestbook and thousands of archived visitor-message files. These contain visitor information and are excluded from the public repository and deployment. Its public sprite assets and Unicode replacement idea are retained in a browser-only demo. The MongoDB demo is a public sample product dataset, retained at its original URL.

The raw hosting backup also includes account configuration, logs, and other private material. Both `backup/` and `backup.sql` are excluded by Git and by the deployment upload rules. Do not copy a whole backed-up document root into `public/`.
