const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),repo=fs.existsSync(path.join(root,'src/technical_article.js')),read=f=>JSON.parse(fs.readFileSync(path.join(root,(repo?'src/':'technical/')+f),'utf8'));
const data=JSON.parse(fs.readFileSync(process.argv[2]||path.join(root,repo?'data/technical-corpus.json':'technical/corpus.json'),'utf8')),topics=read('interpretation-topics.json'),crops=read('interpretation-crops.json'),images=read('interpretation-images.json');
const source=fs.readFileSync(path.join(root,repo?'src/technical_article.js':'tools/technical_article.js'),'utf8'),scope={docs:new Map(data.documents.map(d=>[d.id,d])),units:new Map(data.units.map(u=>[u.id,u])),INTERPRETATION_IMAGES:images,INTERPRETATION_CROPS:crops,INTERPRETATION_TOPICS:topics};
const from=source.indexOf('const interpretationBookMap='),to=source.indexOf('function renderInterpretationSourceImages(',from),a=source.indexOf('function interpretationRecords(group){'),b=source.indexOf('function resourceAnchor(',a);
vm.runInNewContext(source.slice(from,to)+'\nconst interpretationCache=new Map();'+source.slice(a,b)+';globalThis.api={records:interpretationRecords,label:interpretationImageLinkLabel,topic:interpretationTopic,describe:describeInterpretationLink};',scope);
const groups=data.article_links.filter(g=>g.kind==='interpretation'),seen=new Set(),examples=[];
for(const g of groups){for(const [index,r]of scope.api.records(g).entries()){
 assert(!seen.has(r.id));seen.add(r.id);const entry=topics.records[r.id];assert(entry,r.id);assert.equal(entry.source_subject,r.subject);assert.equal(scope.api.topic(g,r),entry.topic);assert(entry.topic.length<=32);
 const label=scope.api.label(g,r,index);assert(label);assert(!/PDF|待整理|待確認/.test(label));
 if(crops.records[r.id].kind==='blank')assert.equal(label,'彙編留白頁');else assert.equal(label,`函釋原圖 ${index+1}｜${entry.topic}`);
 const attrs={},anchor={dataset:{},textContent:label,setAttribute:(k,v)=>attrs[k]=v};scope.api.describe(anchor,g,r);assert.equal(anchor.dataset.letter,r.id);assert(anchor.title.includes('PDF 第 '+crops.records[r.id].source_page));assert(attrs['aria-label'].startsWith(label+'；'));
 if(r.id==='letter_technical_scan_letters_upper_page_0072_0')assert.equal(label,'函釋原圖 1｜太陽光電');
 if(examples.length<5)examples.push(label);
}}
assert.deepEqual([...seen].sort(),Object.keys(topics.records).sort());assert.equal(seen.size,1376);assert.equal(topics.stats.records,seen.size);
const g=groups.find(g=>g.id==='letter_technical_scan_letters_upper_page_0072'),r=scope.api.records(g)[0],entry=topics.records[r.id];
entry.source_subject+='changed';assert.equal(scope.api.topic(g,r),'函釋主題待整理');entry.source_subject=r.subject;
const book=topics.books.find(b=>b.id===g.document_id),hash=book.source_sha256;book.source_sha256='changed';assert.equal(scope.api.topic(g,r),'函釋主題待整理');book.source_sha256=hash;
console.log(JSON.stringify({passed:true,records:seen.size,source_binding:true,page_metadata:true,solar_label:'函釋原圖 1｜太陽光電',examples}));
