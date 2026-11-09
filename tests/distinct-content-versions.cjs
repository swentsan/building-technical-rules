const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),repo=fs.existsSync(path.join(root,'src/technical_article.js')),source=fs.readFileSync(path.join(root,repo?'src/technical_article.js':'tools/technical_article.js'),'utf8');
const start=source.includes('const versionTextKeys=')?source.indexOf('const versionTextKeys='):source.indexOf('function distinctContentVersions('),end=source.indexOf('function ',source.indexOf('function contentVersionFor(')+9),scope={};assert(start>=0&&end>start);
vm.runInNewContext(source.slice(start,end)+';globalThis.api={distinctContentVersions,contentVersionFor};',scope);
const {distinctContentVersions:distinct,contentVersionFor:resolve}=scope.api,fixture=(...texts)=>texts.map((text,index)=>({id:'v'+index,text,publication_date:'200'+index+'-01-01'})),ids=vs=>Array.from(vs,v=>v.id);
const same=fixture('A','A','A');assert.deepEqual(ids(distinct(same)),['v0']);assert.equal(resolve(same,'v2'),same[0]);assert.equal(resolve(same),same[0]);assert.equal(resolve(same,'missing'),same[0]);
const changed=fixture('A','A','B','B','A','A');assert.deepEqual(ids(distinct(changed)),['v0','v2','v4']);assert.equal(resolve(changed,'v3'),changed[2]);assert.equal(resolve(changed,'v5'),changed[4]);assert.equal(resolve(changed),changed[4]);assert.equal(changed.length,6);assert.deepEqual(ids(distinct([])),[]);assert.equal(resolve([]),undefined);
assert.equal(distinct(fixture('文字','文 字')).length,1,'Ignore CJK layout spacing');assert.equal(distinct(fixture('甲','乙')).length,2,'Keep changed words');assert.equal(distinct(fixture('A B','AB')).length,2,'Preserve Latin token boundaries');
const data=JSON.parse(fs.readFileSync(process.argv[2]||path.join(root,repo?'data/technical-corpus.json':'technical/corpus.json'),'utf8')),groups=new Map();
for(const v of [...data.article_versions,...data.imported_versions]){const key=v.pcode+'|'+v.article_key;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(v)}
let rawCount=0,visibleCount=0,affected=0;
for(const [key,vs]of groups){vs.sort((a,b)=>a.publication_date.localeCompare(b.publication_date)||a.id.localeCompare(b.id));const shown=distinct(vs);rawCount+=vs.length;visibleCount+=shown.length;if(shown.length<vs.length)affected++;
 assert.equal(shown[0],vs[0]);for(let i=1;i<shown.length;i++)assert.notEqual(shown[i].text,shown[i-1].text);
 for(const v of vs){const representative=resolve(vs,v.id);assert.equal(scope.versionTextKey?scope.versionTextKey(representative):representative.text.replace(/\s+/g,''),scope.versionTextKey?scope.versionTextKey(v):v.text.replace(/\s+/g,''));assert(shown.includes(representative));assert(vs.indexOf(representative)<=vs.indexOf(v));}
}
assert.equal(groups.size,1182);assert.equal(rawCount,5281);assert.equal(visibleCount,2186);assert(affected>1100);
const design1=groups.get('D0070115|1');assert(distinct(design1).length>2);assert.equal(distinct(design1)[0].publication_date,'2001-06-06');
assert(distinct(groups.get('D0070115|141')).length>2);
assert(source.includes('allVersions.find(v=>v.id===selectedId)||allVersions.at(-1)'),'Figure lookup must use the retained source edition');
assert(source.includes('if(v.id===selected?.id)'));
console.log(JSON.stringify({passed:true,articles:groups.size,recorded_versions:rawCount,visible_versions:visibleCount,hidden_repeated_editions:rawCount-visibleCount,fixtures:['consecutive duplicates','A-B-A changes','deep-link aliases','empty list','exact text differences'],all_legacy_ids_resolve:true}));
