/* node tests/interpretation-images.cjs [corpus.json] */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),repo=fs.existsSync(path.join(root,'src/technical_article.js'));
const source=fs.readFileSync(path.join(root,repo?'src/technical_article.js':'tools/technical_article.js'),'utf8');
const manifest=JSON.parse(fs.readFileSync(path.join(root,repo?'src/interpretation-images.json':'technical/interpretation-images.json'),'utf8'));
const corpus=JSON.parse(fs.readFileSync(process.argv[2]||path.join(root,repo?'data/technical-corpus.json':'technical/corpus.json'),'utf8'));
const scope={INTERPRETATION_IMAGES:manifest,docs:new Map(corpus.documents.map(d=>[d.id,d])),units:new Map(corpus.units.map(u=>[u.id,u]))};
const recordStart=source.indexOf('function interpretationRecords(group){'),recordEnd=source.indexOf('function resourceAnchor(',recordStart);
const imageStart=source.indexOf('const interpretationBookMap='),imageEnd=source.indexOf('function renderInterpretationSourceImages',imageStart);
assert(recordStart>=0&&recordEnd>recordStart&&imageStart>=0&&imageEnd>imageStart);
vm.runInNewContext('const interpretationCache=new Map();'+source.slice(recordStart,recordEnd)+source.slice(imageStart,imageEnd)+';globalThis.records=interpretationRecords;globalThis.pages=interpretationSourcePages;',scope);
let pages=0,groups=0,records=0;
for(const book of manifest.books){
 assert.equal(book.source_sha256,scope.docs.get(book.id).sha256);assert.equal(book.pages.length,book.pdf_pages);
 assert.equal(new Set(book.pages.map(p=>p.page)).size,book.pdf_pages);
 for(const p of book.pages){assert(p.page>=1&&p.page<=book.pdf_pages&&p.width>0&&p.height>0&&p.is_scan);assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,repo?'docs':'',p.image))).digest('hex'),p.sha256);pages++}
}
for(const group of corpus.article_links.filter(r=>r.kind==='interpretation')){
 assert.equal(scope.pages(group).length,group.page_end-group.page_start+1);groups++;
 for(const record of scope.records(group)){assert.equal(scope.pages(group,record).length,record.endPage-record.page+1);assert(record.page>=group.page_start&&record.endPage<=group.page_end);records++}
}
assert.equal(pages,manifest.stats.pages);console.log(JSON.stringify({passed:true,source_pages:pages,groups,records}));
