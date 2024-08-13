

import {ROCrate} from "ro-crate";
import {CrateData} from "./lib/cratedata.js"
import {HTML} from "./lib/html.js"
import { Command, Option }  from 'commander';
import fs from 'fs-extra'
import * as Path from "path"


// Creates a bunch of Markown files for an RO-Crate for 11ty or other static site generators to process

// TODO - write these to some kind of temp dir 
// Config says which pages to generate -- todo use JsonPath to match more complicated patterns
const config = {
  "pages" : [
    "Person", 
    "PersonSnapshot",
    "RepositoryObject",
    "DefinedTerm",
    "File", "Dataset"
  ],
  xpages: []
}

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
  program.addOption(new Option("-d, --dist [dist]", "Output files to distribution directory").default("./dist"))
  program.addOption(new Option("-t --tmp [tmp]", "Output files to distribution directory").default("./tmp"))


  program.parse(process.argv);

  console.log(program.opts());

  if (!program.rawArgs.length || !crateDir) program.help();

  program.crateDir = crateDir


async function main (program) {
    const crate = new ROCrate(fs.readJSONSync(Path.join(program.crateDir, "ro-crate-metadata.json")), {array: true, link: true})
    //const data = new CrateData(crate, {types: types})
    //await data.load();
    const html = new HTML(crate, config, crateDir, program.opts().tmp, program.opts().dist);
    html.write(); // to temp path
}

main(program);

