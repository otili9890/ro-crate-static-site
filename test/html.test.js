import { expect } from 'chai';
import fs from 'fs-extra';
import Path from 'path';
import { Page } from '../lib/html.js'; 
describe('Page Class', () => {
  let mockCrate;
  let mockHTML;
  let mockEntity;

  beforeEach(() => {
    mockHTML = { rootPage: 'root.html', path: 'some/path' };
    mockEntity = { "@id": "entity1", "@reverse": {} };
    mockCrate = {
      rootDataset: { "@id": "root" },
      getEntity: () => {},
      getTree: () => ({}),
    };
  });

  it('constructor initializes properties correctly', () => {
    const page = new Page(mockHTML, mockEntity, mockCrate);
    expect(page.html).to.equal(mockHTML);
    expect(page.entity).to.equal(mockEntity);
  });

  it('getData method processes data correctly', () => {
    mockEntity["@reverse"] = {
      "relation": [
        { "@id": "related1", "name": ["Related Entity 1"], "@type": "Type1" },
        { "@id": "related2", "@type": "Type2" }
      ]
    };
    const page = new Page(mockHTML, mockEntity, mockCrate);
    page.getData();
    expect(page.reverse).to.have.property('relation');
    expect(page.reverse.relation).to.be.an('array').that.has.lengthOf(2);
    expect(page.reverse.relation[0]).to.deep.equal({ "@id": "related1", name: "Related Entity 1", "@type": "Type1" });
    expect(page.reverse.relation[1]).to.deep.equal({ "@id": "related2", name: "related2", "@type": "Type2" });
  });

  it('render method creates the correct template', () => {
    const page = new Page(mockHTML, mockEntity, mockCrate);
    page.displayData = { some: 'data' };
    page.reverse = { some: 'reverse' };
    const template = page.render();
    console.log(template);
    expect(template).to.include('title: "entity1"');
    expect(template).to.include('layout: base.njk');
    expect(template).to.include('home_link: ../../../root.html');
    expect(template).to.include('data: {"some":"data"}');
    expect(template).to.include('reverse: {"some":"reverse"}');
  });
});