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

  hasOwnPage(entity) {
    for (let t of entity["@type"]) {
      if (this.html.config.pages.includes(t)) {
        return true;
      }
    }
    return false;
  }

  makePath(id, ext = ".md") {
 
    if (id === this.crate.rootDataset["@id"]) {
      return this.html.rootPage;
    } else {
      if (id.endsWith("/")){
        id += "index"
      }
      return Path.join(
      
        this.html.path,
        "ro-crate-preview_files",
        id.replace(/\W+/g, "-/") + ext
      );
    }
  }

 

 
  getData() {
    // Get some data for this page
    const myId = this.entity["@id"];
    const data = {
      entryPoint: myId,
      ids: {},
    };
    data.ids[myId] = true;

    const entry = this.crate.getTree({ root: this.entity, depth: 0 });

    // Set up a queue
    const toLink = [entry];

    while (toLink.length > 0) {
      // look for more data
      const entity = toLink.pop();
      // Look for more data

      for (let prop in entity) {
        if (entity.hasOwnProperty(prop)) {
          for (let i = 0; i < entity[prop].length; i++) {
            const val = entity[prop][i];
            if (val["@id"]) {
              const target = this.crate.getEntity(val["@id"]);
              if (target ) {
                //data.ids[val["@id"]] = true // Placeholder to stop endless recursion / looping
                var name = "";

                if (target?.name) {
                  name = target.name.join(", ");
                }
                if (this.hasOwnPage(target)) {
                  entity[prop][i] = {
                    "@path": Path.relative(
                      Path.dirname(this.pagePath),
                      this.makePath(val["@id"], ".html")
                    ),
                    "@value": name || val["@id"],
                  };
                } else {
                  // Add the target to the stack for further processing
                  toLink.push(this.crate.getTree({ root: target, depth: 0 }));
                }
              } else {
                entity[prop][i] = {
                  "@path": val["@id"],
                  "@id": val["@id"],
                  "@value": val["@id"]
                }
              }
            }
          }


        }
      }
      const types = entity["@type"];
      // store a reference to the relative file path for this entity so we can use it in the HTML page context
      if ((types.includes("Dataset") || types.includes("File") || types.includes("ImageObject") || types.includes("MediaObject"))) { 
        entity._relPath = Path.relative(Path.dirname(this.pagePath), Path.join("/", entity["@id"]))
        // TODO: add config to specity whether to copy files or not
        try {
          console.log("Copying", entity["@id"], "to", Path.join(this.html.distPath,  entity["@id"]))
          fs.copySync(Path.join(this.html.cratePath, entity["@id"]), Path.join(this.html.distPath,  entity["@id"]));
        } catch (err) {
          console.error(err);
        }
      }
      data.ids[entity["@id"]] = entity;

      
    }
    const originalEntity = this.crate.getEntity(entry["@id"])
      entry["@reverse"] = {};
      for (let prop of Object.keys(originalEntity["@reverse"])) {
          entry["@reverse"][prop] = [];
          for (let rev of originalEntity["@reverse"][prop]) {
                // There's another page that points to this
                if (this.hasOwnPage(rev)) {
                  entry["@reverse"][prop].push({
                    "@path": Path.relative(
                      Path.dirname(this.pagePath),
                      this.makePath(rev["@id"], ".html")
                    ),
                    "@value": rev?.name?.join(", ") || rev["@id"],
                  });
                } else if (data.ids[rev["@id"]]) {

                  entry["@reverse"][prop].push({
                    "@id": rev["@id"],
                    "@value": rev?.name?.join(", ")  ||   rev["@id"]
                  });

              } 
              }
            }
          

    this.displayData = data;
  }
  

  render() {
    const template = `---
title: ${JSON.stringify(this.entity?.name?.join(", ") || this.entity["@id"])}
layout: base.njk
home_link: ${Path.relative(this.path, this.html.rootPage)}
data: ${JSON.stringify(this.displayData)}

---

    `;
    fs.mkdirpSync(this.path);
    fs.writeFileSync(this.pagePath, template);
    console.log("Wrote", this.pagePath);
    return template;
  }
};
const HTML = class {
  constructor(crate, config, cratePath, tmpPath, distPath) {
    this.crate = crate;
    this.config = config;
    this.tmpPath = tmpPath;
    this.distPath = distPath;
    this.cratePath = cratePath;
  }
  write() {
    const toPath = this.tmpPath;
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
