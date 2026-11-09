const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),repo=fs.existsSync(path.join(root,'src/technical_article.js'));
const manifest=JSON.parse(fs.readFileSync(path.join(root,repo?'src/interpretation-crops.json':'technical/interpretation-crops.json'),'utf8'));
const sources=JSON.parse(fs.readFileSync(path.join(root,repo?'src/interpretation-images.json':'technical/interpretation-images.json'),'utf8'));
const books=new Map(sources.books.map(b=>[b.id,b]));let count=0;
for(const b of manifest.books)assert.equal(b.source_sha256,books.get(b.id).source_sha256);
for(const r of Object.values(manifest.records)){
 if(r.kind==='blank'){assert.equal(r.pages.length,0);continue}assert(r.pages.length>0);
 for(const p of r.pages){const original=books.get(r.document_id).pages.find(s=>s.page===p.page);assert(original);assert.equal(p.source_sha256,original.sha256);assert.equal(p.source_image,original.image);assert.notEqual(p.image,p.source_image);
  const [x0,y0,x1,y1]=p.box;assert(x0>=0&&y0>=0&&x1<=original.width&&y1<=original.height&&x1>x0&&y1>y0);assert.equal(p.width,x1-x0);assert.equal(p.height,y1-y0);assert(p.width<original.width&&p.height<original.height);
  const data=fs.readFileSync(path.join(root,repo?'docs':'',p.image));assert.equal(crypto.createHash('sha256').update(data).digest('hex'),p.sha256);assert.equal(data.readUInt32BE(16),p.width);assert.equal(data.readUInt32BE(20),p.height);count++;
 }
}
const example=manifest.records.letter_technical_scan_letters_upper_page_0007_0;assert.equal(example.pages.length,1);assert(example.pages[0].box[1]>2200&&example.pages[0].height<1000);
const separated=manifest.records.letter_technical_scan_letters_lower_page_0007_2;assert.equal(separated.pages.length,1,'Next letter on the same page must not be included');assert.equal(separated.pages[0].page,8);
assert.equal(count,manifest.stats.crop_images);console.log(JSON.stringify({passed:true,records:Object.keys(manifest.records).length,verified_crops:count,preserved_source_links:true}));
