import fs from 'fs-extra'
import * as Path from "path"

const Page = class {
  constructor(HTML, entity, crate){
    this.html = HTML;
    this.entity = entity;
    this.crate = crate;
    this.pagePath = this.makePath(entity["@id"], ".html")
    this.path = Path.dirname(this.pagePath)
    this.getData();
  }

  makePath(id, ext=".md")
   {
    if (id === this.crate.rootDataset["@id"]){
      return this.html.rootPage;
    } else {
        return Path.join(this.html.path, "ro-crate-preview_files", id.replace(/\W/g, "") + ext)
    }
  }

  link(data) {
    // For things that have their own page link to them
    for (let prop of Object.keys(data)) {
      // Process all the properties
      for(let i = 0; i < data[prop].length; i++) {       
          const val = data[prop][i];
          if(val["@id"]) {
           const target = this.crate.getEntity(val["@id"]);
           if (target) {
             var name = "";
             if (data[prop][i]?.name) {
              for (let n of data[prop][i]?.name) {
                if (n["@value"]) {
                  name += n["@value"];
                }
               
              } 
              data[prop][i] = {
                "@path": Path.relative(Path.dirname(this.pagePath), this.makePath(val["@id"], ".html")),
                "@value" :  name || val["@id"] ,
                "description": val.description,
              
            
              }
  
           }
         }
       }
      
    }


  }
}

  getData() { 
    // Get some data for this item -- might have to rewrite this as we will need to gather ALL the data for everything which does not point to a page in its own right
    const data = this.crate.getTree({root: this.entity, depth: 3})
    const reverse = {};
    for (let r of Object.keys(this.entity["@reverse"])) {
      reverse[r] = [];
      for (let entity of this.entity["@reverse"][r]) {
        const e = this.crate.getEntity(entity["@id"]);
        if(e["@id"] === "./"){
          console.log(e, e?.name?.join(", "));
        }

        reverse[r].push({"@id": e["@id"], name: e?.name?.join(", ") || e["@id"], "@type": e["@type"]})
      }
    }
    this.link(data)
    this.link(reverse)
    console.log(reverse);
    this.displayData = data
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
    console.log("Making page path", this.path)
    fs.mkdirpSync(this.path)
    fs.writeFileSync(this.pagePath, template);
    return(template)
    console.log("Wrote", this.pagePath)
  }

  
}
const HTML = class {
  constructor(crate) {
    this.crate = crate;
  }
  write(toPath) {
    console.log("Writing", toPath)
    fs.mkdirpSync(toPath);
    this.path = toPath;
    this.rootPage = Path.join(this.path, "index.html");

    // Write out a page for each entity (TODO -- filter this down to certain types we care about)
    for (let entity of this.crate["@graph"]){
      const p = new Page(this, entity, this.crate);
      p.render()
    }
}
}

export { HTML, Page };
