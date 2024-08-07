import fs from "fs-extra";
import * as Path from "path";

const Page = class {
  constructor(HTML, entity, crate) {
    this.html = HTML;
    this.entity = entity;
    this.crate = crate;
    this.pagePath = this.makePath(entity["@id"]);
    this.path = Path.dirname(this.pagePath);
    this.getData();
  }

  makePath(id, ext = ".md") {
    if (id === this.crate.rootDataset["@id"]) {
      return this.html.rootPage;
    } else {
      return Path.join(
        this.html.path,
        "ro-crate-preview_files",
        id.replace(/\W/g, "") + ext
      );
    }
  }

  linkItems(data) {
    // Look at all the data for this page and add links to other pages where applicable
    for (let id of Object.keys(data.ids)) {
      // Process all the properties
      this.link(data.ids[id]);
  }
  }

  link(data) {
    // Look at all the data for this page and add links to other pages where applicable
    // TODO -- pay attenttion to what gets its own page, ATM evertything does
      // Process all the properties
      for (let prop of Object.keys(data)) { 
        for (let i = 0; i < data[prop].length; i++) {
          const val = data[prop][i];
          if (val["@id"]) {
            const target = this.crate.getEntity(val["@id"]);
            if (target) {
              var name = "";

              if (target?.name) {
                name = target.name.join(", ");
              }
                data[prop][i] = {
                  "@path": Path.relative(
                    Path.dirname(this.pagePath),
                    this.makePath(val["@id"], ".html")
                  ),
                  "@value": name || val["@id"],
                  description: val.description,
                };

              }
            
          }
        }
      }
    
  }

  getData() {
    // Get some data for this data.ids[id] -- might have to rewrite this as we will need to gather ALL the data for everything which does not point to a page in its own right
    const myId = this.entity["@id"];

    const data = {
      entryPoint: myId,
      ids: {},
    };
    data.ids[myId] = this.crate.getTree({ root: this.entity, depth: 0 });

    
    const reverse = {};
    for (let r of Object.keys(this.entity["@reverse"])) {
      reverse[r] = [];
      for (let entity of this.entity["@reverse"][r]) {
        reverse[r].push(this.crate.getTree({ root: entity, depth: 0 }))
      }
    }
   
    this.link(reverse)
    
    
    this.linkItems(data);
    this.displayData = data;

    this.reverse = reverse
  }

  render() {
    const template = `---
title: ${JSON.stringify(this.entity?.name?.join(", ") || this.entity["@id"])}
layout: base.njk
home_link: ${Path.relative(this.path, this.html.rootPage)}
data: ${JSON.stringify(this.displayData)}
reverse: ${JSON.stringify(this.reverse)}

---

    `;
    fs.mkdirpSync(this.path);
    fs.writeFileSync(this.pagePath, template);
    console.log("Wrote", this.pagePath);
    return template;

  }
};
const HTML = class {
  constructor(crate) {
    this.crate = crate;
  }
  write(toPath) {
    console.log("Writing", toPath);
    fs.mkdirpSync(toPath);
    this.path = toPath;
    this.rootPage = Path.join(this.path, "index.html");

    // Write out a page for each entity (TODO -- filter this down to certain types we care about)
    for (let entity of this.crate["@graph"]) {
      const p = new Page(this, entity, this.crate);
      p.render();
    }
  }
};

export { HTML, Page };
