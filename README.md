# ro-crate-static-site

EXPERIMENTAL: Generates a files static-site generator style to make complete HTML sites for crates. This is a work in progress and will change as we learn better ways to do things.

Design goals:

- Make purely static multi-page websites from RO-Crates (as opposed to rocrate-html-js which is a single page app for displaying crates)

- Allow for zero-configuration Just Works websites but also allow for any level of customization.

## Current approach

The current approach (which may change) is to turn an RO-Crate into a series of HTML (or Markdown) pages which consist solely of YAML metadata, then feed that to a site generator, Eleventy by default, but this approach will allow people to use any site-gen system they choose.

## Usage 

To make an HTML source site for 11ty to process:

Run index.js, passing in a crate path such as the COOEE corpus from the test data.

```
node index.js test_data/cooeee
```

This will generate new HTML pages in src -- which will be used by eleventy to make a site.

To make the site using 11ty run:

```
npm start
```

This SHOULD (Warning: not test by other people yet):

-  Make a website site in dist
-  Serve the site on http://localhost:8080 (or a higher numbered port if 8080 was in use)

TODO: 

- [ ] Pages by @type:
    - [ ]  Different @types of entity can have different page templates
    - [ ]  Only make pages for certain types 
    - 