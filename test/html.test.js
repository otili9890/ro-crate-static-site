import { expect } from 'chai';
import fs from 'fs-extra';
import Path from 'path';
import { Page, HTML } from '../lib/html.js';
import {ROCrate} from 'ro-crate';
import { rootCertificates } from 'tls';
import standardConfig from '../lib/config.js'; // Adjust the path as necessary


describe('Page Class', () => {
  let mockCrate;
  let mockHTML;
  let mockEntity;

  beforeEach(() => {
  });




  it('should render an RO-Crate correctly', () => {
    const crate = new ROCrate({array: true, link: true});
    crate.rootDataset.name = "Test Crate";
    crate.rootDataset.description = "This is a test crate";
    crate.rootDataset.author = {"@id": "https://orcid.org/some_id", "@type": "Person", "name": "Test Author"};
    
    for (let i = 1; i <= 100; i++) {
      const file = {
        "@id": `file${i}`,
        "@type": "Dataset",
        "name": `Test File ${i}`
      };
      crate.addValues(crate.rootDataset, "hasPart", file);
    }
   

    const html = new HTML(crate, standardConfig, "test", "_tmp", "_dist");
                
    const page = new Page(html, crate.rootDataset, crate);

    const template = page.render();
    console.log(template)

    expect(template).to.include('title: "Test Crate"');
    expect(template).to.include('layout: base.njk');
    expect(template).to.include('home_link: index.html');
    expect(template).to.include(' {"entryPoint":"./"');
  });
});