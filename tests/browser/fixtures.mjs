// Small, generated decks: no private speaker files or binary fixtures required.
import { zipSync, strToU8 } from '../../docs/vendor/fflate/esm/browser.js';

export function powerPoint(title = 'Test talk', count = 60) {
  const p = 'http://schemas.openxmlformats.org/presentationml/2006/main';
  const a = 'http://schemas.openxmlformats.org/drawingml/2006/main';
  const r = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
  const files = {};
  const put = (name, xml) => { files[name] = strToU8(xml); };
  const rels = entries => `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${entries}</Relationships>`;
  const rel = (id, type, target) => `<Relationship Id="${id}" Type="${r}/${type}" Target="${target}"/>`;
  put('[Content_Types].xml', '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/></Types>');
  put('_rels/.rels', rels(rel('rId1', 'officeDocument', 'ppt/presentation.xml')));
  put('ppt/presentation.xml', `<p:presentation xmlns:p="${p}" xmlns:r="${r}"><p:sldIdLst>${Array.from({ length: count }, (_, i) => `<p:sldId id="${256 + i}" r:id="rId${i + 1}"/>`).join('')}</p:sldIdLst><p:sldSz cx="9144000" cy="6858000"/></p:presentation>`);
  put('ppt/_rels/presentation.xml.rels', rels(Array.from({ length: count }, (_, i) => rel(`rId${i + 1}`, 'slide', `slides/slide${i + 1}.xml`)).join('')));
  const shape = (id, text, y, link = '') => `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="Shape ${id}">${link}</p:cNvPr><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="500000" y="${y}"/><a:ext cx="8000000" cy="800000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:r><a:rPr sz="2400"/><a:t>${text}</a:t></a:r></a:p></p:txBody></p:sp>`;
  for (let i = 1; i <= count; i++) {
    // Three independent click-to-appear builds on each slide.
    const builds = [3, 4, 5].map((id, j) => `<p:par><p:cTn id="${10 + j}" presetID="1" presetClass="entr" nodeType="clickEffect" dur="100" fill="hold"><p:childTnLst><p:set><p:cBhvr><p:cTn id="${20 + j}" dur="1" fill="hold"/><p:tgtEl><p:spTgt spid="${id}"/></p:tgtEl><p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr><p:to><p:strVal val="visible"/></p:to></p:set></p:childTnLst></p:cTn></p:par>`).join('');
    put(`ppt/slides/slide${i}.xml`, `<p:sld xmlns:p="${p}" xmlns:a="${a}" xmlns:r="${r}"><p:cSld><p:spTree>${shape(2, `${title} slide ${i}`, 400000)}${[3, 4, 5].map((id, j) => shape(id, `Build ${j + 1}`, 1500000 + j * 1000000)).join('')}${shape(6, 'Jump to slide 4', 5500000, '<a:hlinkClick r:id="jump" action="ppaction://hlinksldjump"/>')}</p:spTree></p:cSld><p:timing><p:tnLst><p:par><p:cTn id="1" dur="indefinite" nodeType="tmRoot"><p:childTnLst><p:seq><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst>${builds}</p:childTnLst></p:cTn></p:seq></p:childTnLst></p:cTn></p:par></p:tnLst></p:timing></p:sld>`);
    put(`ppt/slides/_rels/slide${i}.xml.rels`, rels(rel('notes', 'notesSlide', `../notesSlides/notesSlide${i}.xml`) + rel('jump', 'slide', 'slide4.xml')));
    put(`ppt/notesSlides/notesSlide${i}.xml`, `<p:notes xmlns:p="${p}" xmlns:a="${a}"><p:cSld><p:spTree><p:sp><p:nvSpPr><p:cNvPr id="2" name="Notes"/><p:cNvSpPr/><p:nvPr><p:ph type="body"/></p:nvPr></p:nvSpPr><p:txBody><a:bodyPr/><a:lstStyle/>${Array.from({ length: 40 }, (_, j) => `<a:p><a:r><a:t>Slide ${i}, note line ${j + 1}.</a:t></a:r></a:p>`).join('')}</p:txBody></p:sp></p:spTree></p:cSld></p:notes>`);
  }
  return Buffer.from(zipSync(files));
}

export function pdf() {
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R 5 0 R 7 0 R] /Count 3 >>'];
  for (let i = 0; i < 3; i++) {
    const stream = `0.${i + 2} 0.5 0.3 rg 0 0 600 450 re f`;
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 600 450] /Contents ${4 + i * 2} 0 R ${i === 0 ? '/Annots [9 0 R 10 0 R]' : ''} >>`, `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
  }
  // Links at the left edge and in the middle must take their own clicks.
  for (const rect of ['0 330 60 430', '240 330 360 430']) {
    objects.push(`<< /Type /Annot /Subtype /Link /Rect [${rect}] /Border [0 0 0] /Dest [5 0 R /Fit] >>`);
  }
  let text = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((obj, i) => { offsets.push(text.length); text += `${i + 1} 0 obj\n${obj}\nendobj\n`; });
  const start = text.length;
  text += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map(n => `${String(n).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${start}\n%%EOF`;
  return Buffer.from(text);
}
