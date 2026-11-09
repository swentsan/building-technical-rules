/* Run: node tests/legal-tables.cjs [corpus.json]
 * The same file can run as tools/verify_table_layout.cjs on the NAS.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const sourcePath=fs.existsSync(path.join(root,'src/technical_article.js'))?path.join(root,'src/technical_article.js'):path.join(root,'tools/technical_article.js');
const source=fs.readFileSync(sourcePath,'utf8');
const start=source.indexOf('function legalGlyphWidth'),end=source.indexOf('const legalLayoutCache');
assert(start>=0&&end>start,'Source-table parser must be present');
const sandbox={};vm.runInNewContext(source.slice(start,end)+';globalThis.split=splitLegalText;',sandbox);
const corpusPath=process.argv[2]||(fs.existsSync(path.join(root,'data/technical-corpus.json'))?path.join(root,'data/technical-corpus.json'):path.join(root,'technical/corpus.json'));
const data=JSON.parse(fs.readFileSync(corpusPath,'utf8')),docs=new Map(data.documents.map(d=>[d.id,d]));
const articles=data.units.filter(u=>docs.get(u.document_id)?.module_kind==='official');
const allTables=text=>sandbox.split(text).filter(p=>p.type==='table').map(p=>p.table);
const tablesFor=(law,key)=>allTables(articles.find(u=>docs.get(u.document_id).pcode===law&&u.article_key===key).text);
let currentTables=0,versionTables=0;
for(const unit of articles){
 const expected=(unit.text.match(/┌/g)||[]).length,parts=sandbox.split(unit.text),tables=parts.filter(p=>p.type==='table');
 assert.equal(tables.length,expected,unit.id+' must retain every table');
 assert(!parts.some(p=>p.type==='fixed'),unit.id+' must not need an unstructured fallback');
 for(const p of tables)assert.equal(p.table.textCharacterCount,p.table.expectedCharacters,unit.id+' must account for every source value');
 currentTables+=tables.length;
}
for(const version of [...(data.article_versions||[]),...(data.imported_versions||[])]){
 const expected=(version.text.match(/┌/g)||[]).length,tables=allTables(version.text);
 assert.equal(tables.length,expected,version.id+' must retain its own version tables');versionTables+=tables.length;
}
const at=(table,row,col)=>table.cells.find(c=>c.row<=row&&row<c.row+c.rowSpan&&c.col<=col&&col<c.col+c.colSpan);
const parking=tablesFor('D0070115','59')[0];
assert.equal(parking.headerRows,2);
assert.equal(at(parking,0,2).text,'都市計畫內區域');assert.equal(at(parking,0,2).colSpan,2);
assert.equal(at(parking,0,4).text,'都市計畫外區域');
assert.equal(at(parking,2,0).text,'第一類');assert.equal(at(parking,2,0).rowSpan,2);
assert.equal(at(parking,2,3).text,'免設。');
assert.equal(at(parking,3,3).text,'每一百五十平方公尺設置一輛。');
assert.equal(at(parking,3,5).text,'每二百五十平方公尺設置一輛。');
const finishes=tablesFor('D0070115','88')[0];
assert.equal(at(finishes,2,6).text,'耐燃二級以上');assert.equal(at(finishes,2,6).rowSpan,3);
assert.equal(tablesFor('D0070115','69')[0].headerRows,2);
assert.equal(tablesFor('D0070115','262').length,3);
const sanitation=tablesFor('D0070117','37')[0];
assert.equal(sanitation.rows,39);assert.equal(sanitation.cells.length,223);
assert(at(sanitation,2,2).text.includes('男子：每五十人一個。'));
assert(at(sanitation,2,2).text.includes('女子：每十人一個。'));
assert.equal(at(sanitation,2,5).text,'男子：每三十人一個。');
assert(tablesFor('D0070117','56')[0].cells.some(c=>c.text.includes('一 ─ 三○')),'Range dashes are values, not borders');
const energy=tablesFor('D0070115','312')[0];
for(const [row,coefficient] of [[1,'146.2X'],[2,'273.3X'],[3,'348.4X']]){
 const cell=at(energy,row,2);assert.equal(cell.fragments[0].trim(),'2');assert(cell.fragments[1].includes(coefficient));
 assert(cell.fragments[0].indexOf('2')>0,'Exponent position must remain available to the renderer');
}
const malformed='┌─┬─┐\n│一│二三│\n└─┴─┘';
assert.equal(sandbox.split(malformed)[0].type,'fixed','Malformed geometry must preserve its source instead of guessing cells');
console.log(JSON.stringify({passed:true,currentTables,versionTables,semanticChecks:['parking thresholds and region columns','fire rating row spans','male and female fixture quantities','dash-separated numerical ranges','square exponent positions','multiple tables and historical versions','lossless malformed-source fallback']}));
