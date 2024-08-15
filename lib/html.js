import fs from "fs-extra";
import * as Path from "path";

const Page = class {
  constructor(HTML, entity, crate) {
    this.html = HTML;
    this.config = HTML.config;
    this.entity = entity;
    this.crate = crate;
    this.pagePath = this.makePath(entity["@id"]);
    this.path = Path.dirname(this.pagePath);
    this.getData();
  }

  

  makePath(id, ext = ".md") {
    if (id === this.crate.rootDataset["@id"]) {
      return this.html.rootSourceFile.replace(".md", ext);
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
      const newEntity = {props: {}, _: {}};

      // Look for more dataß
      for (let prop in entity) {
        if (entity.hasOwnProperty(prop)) {
          if (["@type", "@id"].includes(prop)) {
            newEntity[prop] = entity[prop];
            continue;
          }
          const propUri = this.crate.resolveTerm(prop) || prop;
          newEntity.props[propUri] = {
            label: prop,
            data: []
          }
          for (let i = 0; i < entity[prop].length; i++) {
            const val = entity[prop][i];
            const newVal = {...val}; //Shallow copy
            if (val["@id"]) {
              const target = this.crate.getEntity(val["@id"]);
              if (target ) { 
                var name = "";
                if (target?.name) {
                  name = target.name.join(", ");
                  newVal["@id"] = val["@id"],
                  newVal["@value"] = name
               }

                if (this.config.hasOwnPage(target)) {
                  newVal["@path"] = Path.relative(
                      Path.dirname(this.pagePath),
                      this.makePath(val["@id"], ".html")
                    );
                    newVal[ "@value"] = val["@id"]
                } else {
                  // Add the target to the stack for further processing
                  if (!data.ids[val["@id"]]) {
                    data.ids[val["@id"]] = "pending"
                    toLink.push(this.crate.getTree({ root: target, depth: 0 }));
                  }
                }
              } else {
                newVal["@path"] =  val["@id"];     
              }
            }
              newEntity.props[propUri].data.push(newVal)
          
        }
      }
      
      const types = entity["@type"];
      // store a reference to the relative file path for this entity so we can use it in the HTML page context
      if ((types.includes("Dataset") || types.includes("File") || types.includes("ImageObject") || types.includes("MediaObject"))) { 
        newEntity._.relPath = Path.relative(Path.dirname(this.pagePath), Path.join("/", entity["@id"]))
        // TODO: add config to specity whether to copy files or not
        try {
          fs.copySync(Path.join(this.html.cratePath, entity["@id"]), Path.join(this.html.distPath,  entity["@id"]));
        } catch (err) {
          console.error(err);
        }
      }
      this.processReverse(entity, newEntity, data, toLink);
      data.ids[entity["@id"]] = newEntity;

      
    }


 

  }

    
    this.displayData = data;
  }

  processReverse(ent, newEntity, data, toLink) {
    
    const entity = this.crate.getEntity(ent["@id"])
    for (let prop of Object.keys(entity["@reverse"])) {
      const propUri = this.crate.resolveTerm(prop) || prop
      if (!newEntity.props[propUri]) {
        newEntity.props[propUri] = {
        label: prop,
       }
       
      }
      newEntity.props[propUri].reverse = []

      for (let rev of entity["@reverse"][prop]) {
            // There's another page that points to this
            if (this.config.hasOwnPage(rev)) {
              newEntity.props[propUri].reverse.push({
                "@path": Path.relative(
                  Path.dirname(this.pagePath),
                  this.makePath(rev["@id"], ".html")
                ),
                "@value": rev?.name?.join(", ") || rev["@id"],
              });
            } else {
              newEntity.props[propUri].reverse.push({
                "@id": rev["@id"],
                "@value": rev?.name?.join(", ")  ||   rev["@id"]
              });
             if (!data.ids[rev["@id"]]) {
                data.ids[rev["@id"]] = "pending";
                toLink.push(this.crate.getTree({ root: rev, depth: 0 }));
            } 
          }
        }
      }
  
  }

  render() {
    return `---
title: ${JSON.stringify(this.entity?.name?.join(", ") || this.entity["@id"])}
layout: base.njk
nav: ${JSON.stringify(this.nav)}
home_link: ${Path.relative(this.path, this.makePath(this.crate.rootDataset["@id"], ".html"))}
data: ${JSON.stringify(this.displayData)}
---

    `;
  }
  save() {
    const template = this.render();
    fs.mkdirpSync(this.path);
    fs.writeFileSync(this.pagePath, template);
    console.log("Wrote", this.pagePath);
    return  this.pagePath;
  }
};

const HTML = class {
  constructor(crate, config, cratePath, tmpPath, distPath) {
    this.crate = crate;
    this.config = config;
    this.path = tmpPath;
    this.rootSourceFile = Path.join(this.path, "index.md");
    this.distPath = distPath;
    this.cratePath = cratePath;
  }


  write() {
    console.log("Writing site to:", this.path);
    fs.mkdirpSync(this.path);

    // Write out a page for each entity (TODO -- filter this down to certain types we care about)
    for (let entity of this.crate["@graph"]) {
      if (this.config.hasOwnPage(entity)) {
        const p = new Page(this, entity, this.crate);
        if(entity["@id"] === this.crate.rootDataset["@id"]) {
          this.config.makeGlobalNavigation(p);
        }
        p.save();
      }
    }
  }
};

export { HTML, Page };
