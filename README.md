# ro-crate-static-site

EXPERIMENTAL: Generates a files static-site generator style to make complete HTML sites for crates

To make an HTML source site for 11ty to process:

Run index.js, passing in a crate path such as the COOEE corpus (inluded)

```
node index.js test_data/cooeee
```

This will generate new HTML pages in src -- which will be used by eleventy to make a site.

To make the site using 11ty run:

```
npm start
```

This SHOULD:

-  Make a website site in dist
-  Serve the site on http://localhost:8080 (or a higher numbered port if 8080 was in use)

TODO: 

LOTS OF THINGS