

import {ROCrate} from "ro-crate";
import {CrateData} from "./lib/cratedata.js"
import {HTML} from "./lib/html.js"
import { Command, Option }  from 'commander';
import fs from 'fs-extra'
import * as Path from "path"


// Creates a bunch of Markown files for an RO-Crate for 11ty or other static site generators to process

// TODO - write these to some kind of temp dir 


var crateDir;
const program = new Command();
program
  .version("0.1.0")
  .description(
    "Generates a static website from an RO-Crate using 11ty templates."
  )
  .arguments("<dir>", "Crate directory for input")
  .option("-i, --index.html", "Use index.html as a filename rather than ro-crate-preview.html")
  .action((dir) => { crateDir = dir })
program.addOption(new Option("-o, --out [out]", "Output to a different directory").default("./src"))

  program.parse(process.argv);

  console.log(program.opts());

  if (!program.rawArgs.length || !crateDir) program.help();

  program.crateDir = crateDir


async function main (program) {
    const crate = new ROCrate(fs.readJSONSync(Path.join(program.crateDir, "ro-crate-metadata.json")), {array: true, link: true})
    const defaultTypePages = ["Person", "RepositoryObject", "DefinedTerm"]

    //const data = new CrateData(crate, {types: types})
    //await data.load();

    const html = new HTML(crate);
    html.write(program.opts().out);
}

main(program);

