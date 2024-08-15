  
import * as Path from "path";

const config = {
  pages: ["Dataset", "RepositoryObject", "File", "Person", "DefinedTerm", "CreativeWork"], // Example types that have always their own pages
  navCategories: ["RepositoryObject", "Person"],
  hasOwnPageLookup: {},


  makeGlobalNavigation(page) {  
    // Protoype for global navigation
    const nav =  {props: {}};
    for (let entity of page.crate["@graph"]) {
        if (!entity["prov:specializationOf"]) {  // TODO: Make this check more robust
        for (let t of entity["@type"]) {
            if (this.navCategories.includes(t)) {
                if (!nav.props[t]) {
                    nav.props[t] = {
                        label: t,
                        data: []
                    }
                }
                const entry = {
                    "@id": entity["@id"],
                    "@value": entity?.name.join(", ") || entity["@id"]
                }
              

                if (this.hasOwnPage(entity)) {
                    entry["@path"] = Path.relative( Path.dirname(page.pagePath), page.makePath(entity["@id"], ".html"));
                    
                }
            nav.props[t].data.push(entry);
            }
        }
        }
    }
    page.nav = nav;
  },

  hasOwnPage(entity) {
    const id = entity["@id"];
    if (this.hasOwnPageLookup.hasOwnProperty(id)){
        return this.hasOwnPageLookup[id];
    }
    // Don't give own pages to instances that are likely to be one-offs
    if (entity["prov:specializationOf"]){
        this.hasOwnPageLookup[id] = false
        return false;
    }
    // Anything that has a lot of back-links gets its own page
    for (let r of Object.keys(entity?.["@reverse"]) || []) {
        if (entity["@reverse"][r].length > 10) {
            this.hasOwnPageLookup[id] = true
            return true;
        }
    }
    for (let t of entity["@type"]) {
      if (this.pages.includes(t)) {
        this.hasOwnPageLookup[id] = true;
        return true;
      }
    }
    this.hasOwnPageLookup[id] = false
    return false;
  }
  
};

export default config;