import { ROCrate } from "ro-crate";
const CrateData = class {
  // Create a database

  constructor(crate, options) {
    this.types = options.types || [];
    this.crate = crate;
    this.data = {};
    this.root = crate.rootDataset["@id"];
  }
  async load() {
    const typeIndex = {};
    for (let t of this.types) {
      typeIndex[t] = [];
    }
    
    for (let entity of this.crate["@graph"]) {
      this.data[entity["@id"]] = {}
      const entityData = this.data[entity["@id"]]
      entityData.props = {};
      entityData.id = entity["@id"];
      entityData.label = entity?.name?.join(", ") || entity["@id"]; // Backup value
      for (let p of Object.keys(entity)) {
        entityData.props[p] = [];

        // Add a lookup to this entity TODO - actually use it
        for (let t of this.types) {
          if (entity["@type"].includes(t)) {
            typeIndex[t].push(entity);
          }
        }
        if (p === "@id") {
          // Do something
        } else if (p === "@reverse") {
          // Do another thing which is possibly nothing
          
        } else {
          for (let v of entity[p]) {
            // Values apart from @id are always arrays
            const prop = {
              source: entity["@id"],
              property: p,
              target: null,
              label: null,
            };
            if (v["@id"]) {
              // This is a reference to another item
              if(this.crate.getEntity(v["@id"])) {
                prop.target = v["@id"];
              } else {
                prop.url = v["@id"];
              }
              if (v.name) {
                prop.label = v.name.join(", ");
              }
            } else {
              prop.label = v;
            }
            entityData.props[p].push(prop)
          }
        }

        for (let t of this.types) {
          if (entity["@type"].includes(t)) {
            typeIndex[t].push(entity);
          }
        }
      }
      entityData.reverse = {}
      for (let r of Object.keys(entity["@reverse"])) { 
        entityData.reverse[r] = [];
        for (let v of entity["@reverse"][r]) {
          const prop = {
            target: v['@id'],
            property: r,
            source: entity["@id"],
            label: v?.name?.join(",") || null,
          };
          entityData.reverse[r].push(prop)
      }
      }
      this.typeIndex = typeIndex;

    }
  }
};

export { CrateData };
