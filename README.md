# ro-crate-static-site


Status: Work in progress / Pre Alpha

Generates a files static-site generator style to make complete HTML sites for crates. This is a work in progress and will change as we learn better ways to do things.


Design goals:

- Make purely static single or multi-page websites from RO-Crates (as opposed to rocrate-html-js which is a single page app for displaying crates)

- Deal with crates of all sizes from small data packages to complete collections 

- Allow for zero-configuration Just Works websites but also allow for any level of customization.

-  Create sites which will work by default in a file:// context, that is they do not require a web server. This involves some design tradeoffs as all Javascript code needs to be embedded in the HTML file and cannot be loaded from the user's computer, which means it is best to have very minimal scripting.  (But the tool could be used to generate sites for deployment on servers)

## Current Architecture:

This currently uses a two-stage approach to building sites from crates.

1. The main script index.js produces a set of markdown files containing chunks of RO-Crate metadata that has been pre-processed to . These are ATM not *really* markdown, they contain only the usual YAML metadata block. 

2. A static site generator generates the actual HTML site. 
   This ships with a javascript static site generator, Eleventy, so that we can provide a working, out of the box solution. An example 11ty template shows how to render the pre-processed crate crate data, we will be adding more example, but the idea is for site developers to make their own.



The current approach (which may change) is to turn an RO-Crate into a series of HTML (or Markdown) pages which consist solely of YAML metadata, then feed that to a site generator, Eleventy by default, but this approach will allow people to use any site generator system they choose.

## Installation

=
- Check out this repo: `git clone git@github.com:Language-Research-Technology/ro-crate-static-site.git`
- Change to the working directory `cd ro-crate-static-site`
- Run `npm install`


## Usage 

To make an HTML site from the sample dataset

```
npm run sample
```

or to run the larger COOEE corpus dataset

```
npm run cooee
```
This will:

- Write out a set of .md files into `./tmp` (deleting `./tmp` first)
- Run eleventy

If you have made some markdown file and want to play with the template then to get a web server running, run:

```
npm run serve
```


To change the look of the site edit the template(s) (there's only one for now) in [`_includes/base.njk`](._includes/base.njk)

This will (Warning: not test by other people yet):

-  Make a website site in dist
-  Serve the site on http://localhost:8080 (or a higher numbered port if 8080 was in use)
-  Allow you to fiddle with the _includes 

# Things to try

- Change lib/config.js to generate different pages

TODO: 

- [ ] Pages by @type:
    - [ ]  Different @types of entity can have different page templates
    - [ ]  Only make pages for certain types 
- [ ] Test with other single site generators
- [ ] Allow user to pass in their own configgit s
