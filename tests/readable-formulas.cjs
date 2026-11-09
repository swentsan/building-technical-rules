/* Run with Node: node tests/readable-formulas.cjs [corpus.json] */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),isRepo=fs.existsSync(path.join(root,'src/technical_article.js'));
const source=fs.readFileSync(path.join(root,isRepo?'src/technical_article.js':'tools/technical_article.js'),'utf8');
const start=source.indexOf('const readableFormulaRules=[];'),end=source.indexOf('function createReadableFormula',start);assert(start>=0&&end>start);
const scope={};vm.runInNewContext(source.slice(start,end)+';globalThis.rules=readableFormulaRules;globalThis.has=hasReadableFormula;',scope);
const corpusPath=process.argv[2]||path.join(root,isRepo?'data/technical-corpus.json':'technical/corpus.json'),data=JSON.parse(fs.readFileSync(corpusPath,'utf8'));
const docMap=new Map(data.documents.map(d=>[d.id,d]));
const rule=s=>scope.rules.find(r=>r.source===s);
assert(rule('A0<（1+Q）A/2').math.includes('&lt;'),'Strict less-than must not turn into less-than-or-equal');
assert(rule('ＡO ≦（1 ﹢ Q）Ａ／2').math.includes('≤'),'Non-strict inequality must be retained');
const ventilation=scope.rules.find(r=>r.label==='自然通風管有效斷面積');assert(ventilation.math.includes('<mfrac>')&&ventilation.math.includes('<mn>250</mn><msqrt><mi>h</mi></msqrt>'));
const buffer=rule('A≧W1^2+W2^2');assert.equal((buffer.math.match(/<msup>/g)||[]).length,2);assert(buffer.math.includes('<msub><mi>W</mi><mn>1</mn></msub>'));
const full='Σ△FA＝△FA1＋△FA2＋△FA3≦0.2FA',candidates=scope.rules.filter(r=>full.includes(r.source));assert.equal(candidates.sort((a,b)=>b.source.length-a.source.length)[0].source,full,'The longer formula must win over its two-term prefix');
assert(!scope.has('未知的新公式 X = 新數值'),'Unknown future text must not be rewritten');
for(const r of scope.rules)assert(data.units.some(u=>u.text.includes(r.source)),'A formatting rule must match preserved source text: '+r.label);
let blocks=0,articles=0;
for(const unit of data.units.filter(u=>docMap.get(u.document_id)?.module_kind==='official')){
 let cursor=0,count=0;
 while(cursor<unit.text.length){let found=null,index=unit.text.length;for(const r of scope.rules){const at=unit.text.indexOf(r.source,cursor);if(at>=0&&(at<index||(at===index&&r.source.length>(found?.source.length||0)))){index=at;found=r}}if(!found)break;count++;cursor=index+found.source.length}
 if(count)articles++;blocks+=count;
}
const manifestPath=path.join(root,isRepo?'src/legal-visuals.json':'technical/legal-visuals.json'),manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));let verified=0;
for(const record of manifest.records)for(const file of [{file:record.file,sha256:record.sha256},...record.pages.map(p=>({file:p.image,sha256:p.sha256}))]){
 const target=path.join(root,isRepo?'docs':'',file.file);assert.equal(crypto.createHash('sha256').update(fs.readFileSync(target)).digest('hex'),file.sha256,file.file);verified++;
}
console.log(JSON.stringify({passed:true,formula_blocks:blocks,formula_articles:articles,verified_originals_and_previews:verified,official_pages:manifest.stats.pages}));
