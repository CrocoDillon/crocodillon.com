# Content migration

The live database is authoritative. All 10 public posts were imported with their original slugs, publication timestamps, last-update timestamps, descriptions, and excerpts. The legacy application used UTC, so timestamps are explicitly UTC.

| Article                                                      | Body matches repository  | Different metadata |
| ------------------------------------------------------------ | ------------------------ | ------------------ |
| welcome-to-my-blog                                           | Yes                      | None               |
| in-javascript-almost-anything-is-an-expression               | Yes                      | None               |
| mongodb-for-dbas-introduction                                | Yes                      | excerpt            |
| mongodb-for-dbas-crud                                        | Trailing whitespace only | None               |
| parsing-emoji-unicode-in-javascript                          | Yes                      | None               |
| how-to-install-sassc-and-libsass-on-ubuntu                   | Yes                      | excerpt            |
| always-catch-localstorage-security-and-quota-exceeded-errors | Trailing whitespace only | excerpt            |
| non-blocking-web-fonts-using-localstorage                    | Yes                      | None               |
| asynchronous-callbacks-in-koa                                | Yes                      | None               |
| reading-query-string-values-in-javascript                    | Yes                      | None               |

All ten article bodies match after ignoring trailing whitespace on individual lines. Eight match without that extra normalization; the other two differ only in trailing whitespace. Three excerpts differ, and the database excerpts are retained. Comparison also ignores outer whitespace and Windows/Unix line endings. SHA-256 hashes before MDX normalization are in content-comparison.json.

MDX normalization changes only markup: standard code-fence language names, JSX attributes, void tags, and asset URLs. Published prose and code examples come from the database.

Content now lives in content/articles/<slug>/index.mdx; images in public/images/articles/<slug>/. Old image URLs redirect to the new locations. Demo routes remain compatible. Private visitor-message archives and other sites' files are excluded from the public app.

Disqus identifiers remain the original slugs. The historical HTTP canonical URL is retained for Disqus thread matching; page SEO uses HTTPS.
