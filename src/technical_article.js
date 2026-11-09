/* Article-first reader layered over the retained source-volume reader. */
(()=>{
// Literal source matches keep formula layout changes tied to the selected text.
const readableFormulaRules=[];
function formulaRule(source,math,label){readableFormulaRules.push({source,math,label})}
const fm={mi:v=>`<mi>${v}</mi>`,mn:v=>`<mn>${v}</mn>`,mo:v=>`<mo>${v}</mo>`,row:(...v)=>`<mrow>${v.join('')}</mrow>`,sub:(v,n)=>`<msub><mi>${v}</mi><mi>${n}</mi></msub>`,numsub:(v,n)=>`<msub><mi>${v}</mi><mn>${n}</mn></msub>`,frac:(a,b)=>`<mfrac>${a}${b}</mfrac>`,sqrt:a=>`<msqrt>${a}</msqrt>`,sup:(a,b)=>`<msup>${a}<mn>${b}</mn></msup>`,text:v=>`<mtext>${v}</mtext>`};
{
 const {mi:i,mn:n,mo:o,row:r,sub:s,numsub:sn,frac:f,sqrt:q,sup:p,text:t}=fm;
 const eq=(a,b)=>r(a,o('='),b),le=(a,b)=>r(a,o('≤'),b),ge=(a,b)=>r(a,o('≥'),b),times=o('×');
 formulaRule('Ａf\n     Ａv=────\n          250√h',eq(s('A','v'),f(s('A','f'),r(n(250),q(i('h'))))),'自然通風管有效斷面積');
 formulaRule('（147-27√Ａ） √Ｈ ≧Ｑ',ge(r(o('('),n(147),o('−'),n(27),q(i('A')),o(')'),q(i('H'))),i('Q')),'煙道最小斷面積');
 formulaRule('Ｌ×Ｓw\n    Ａs≦ ──────\n               2',le(s('A','s'),f(r(i('L'),times,s('S','w')),n(2))),'陰影面積上限');
 formulaRule('    且Ｈ≦ 3.6 (Ｓw+Ｄ)',r(t('且 '),le(i('H'),r(n('3.6'),o('('),s('S','w'),o('+'),i('D'),o(')')))),'建築物高度上限');
 formulaRule('A≧W1^2+W2^2',ge(i('A'),r(p(sn('W',1),2),o('+'),p(sn('W',2),2))),'緩衝區面積');
 formulaRule('Ｃ≧ 0.075  (1-Ｈ／40)  Ｚ',ge(i('C'),r(n('0.075'),o('('),n(1),o('−'),f(i('H'),n(40)),o(')'),i('Z'))),'地下震力分佈係數');
 formulaRule('ＡO ≦（1 ﹢ Q）Ａ／2',le(s('A','O'),f(r(o('('),n(1),o('+'),i('Q'),o(')'),i('A')),n(2))),'地下各層最大樓地板面積');
 formulaRule('nπh\n      Ｓ (％) ＝───×100％\n                  8L',eq(r(i('S'),t('（%）')),r(f(r(i('n'),i('π'),i('h')),r(n(8),i('L'))),times,n(100),o('%'))),'平均坡度');
 formulaRule('H\n               D≧────\n                    2tanθ',ge(i('D'),f(i('H'),r(n(2),i('tan'),i('θ')))),'地滑波及距離');
 formulaRule('Ｈ－３‧６\nＤ≧２＋──────\n        \u3000\u3000４',ge(i('D'),r(n(2),o('+'),f(r(i('H'),o('−'),n('3.6')),n(4)))),'擋土設施退縮距離');
 formulaRule('２Ｒ＋Ｔ≧６４（ＣＭ）且Ｒ≦１８（ＣＭ）',r(ge(r(n(2),i('R'),o('+'),i('T')),r(n(64),t('（CM）'))),t(' 且 '),le(i('R'),r(n(18),t('（CM）')))),'戶外階梯級高與級深');
 formulaRule('A0<（1+Q）A/2',r(sn('A',0),o('&lt;'),f(r(o('('),n(1),o('+'),i('Q'),o(')'),i('A')),n(2))),'地下各層最大樓地板面積');
 formulaRule('法定最大容積率\nH ≦────────×3.6×2\n    法定最大建蔽率',le(i('H'),r(f(t('法定最大容積率'),t('法定最大建蔽率')),times,n('3.6'),times,n(2))),'建築物高度');
 const delta=n=>r(o('△'),sn('FA',n)),sum=r(o('Σ'),o('△'),i('FA'));
 formulaRule('Σ△FA＝△FA1＋△FA2',eq(sum,r(delta(1),o('+'),delta(2))),'增加樓地板面積合計');
 formulaRule('△FA1＝S× I',eq(delta(1),r(i('S'),times,i('I'))),'開放空間增加樓地板面積');
 formulaRule('Σ△FA＝△FA1＋△FA2＋△FA3≦0.2FA',r(eq(sum,r(delta(1),o('+'),delta(2),o('+'),delta(3))),o('≤'),n('0.2'),i('FA')),'老人住宅增加樓地板面積');
 formulaRule('D\n              R﹦23 【1 + ─】\n                          L',eq(i('R'),r(n(23),o('['),n(1),o('+'),f(i('D'),i('L')),o(']'))),'活載重折減百分值');
 for(const value of ['1.5','1.25','1.0']){
  formulaRule('I='+value+(value==='1.25'?'。':' 。'),eq(i('I'),n(value)),'建築物用途係數');
 }
}
function hasReadableFormula(text){return readableFormulaRules.some(rule=>text.includes(rule.source))}
function createReadableFormula(rule){
 const figure=el('figure',undefined,'readable-formula');figure.append(el('figcaption',rule.label));
 const math=new DOMParser().parseFromString('<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">'+rule.math+'</math>','application/xml');
 if(math.querySelector('parsererror'))throw Error('Invalid authored formula layout: '+rule.label);
 const scroll=el('div',undefined,'formula-scroll');scroll.tabIndex=0;scroll.setAttribute('role','region');scroll.setAttribute('aria-label',rule.label);scroll.append(document.importNode(math.documentElement,true));figure.append(scroll);return figure;
}
function appendReadableProse(host,text,tokens){
 let cursor=0;
 while(cursor<text.length){
  let found=null,index=text.length;
  for(const rule of readableFormulaRules){const at=text.indexOf(rule.source,cursor);if(at>=0&&(at<index||(at===index&&rule.source.length>(found?.source.length||0)))){found=rule;index=at}}
  if(!found){appendLegalPlainProse(host,text.slice(cursor),tokens);break}
  if(index>cursor)appendLegalPlainProse(host,text.slice(cursor,index),tokens);
  host.append(createReadableFormula(found));cursor=index+found.source.length;
 }
}

function availableOfficialVisuals(d,u,v){
 if(!v||v.source_kind==='user_import')return[];
 return(globalThis.LEGAL_VISUALS?.records||[]).filter(record=>record.law===d.pcode&&record.article===u.article_key&&record.archive_document_id===v.document_id);
}
function openOfficialFigure(page,title){
 const dialog=el('dialog',undefined,'legal-image-viewer'),header=el('div',undefined,'figure-viewer-head'),scroll=el('div',undefined,'figure-viewer-scroll'),img=el('img');
 img.src=page.image;img.alt=title;img.width=page.width;img.height=page.height;
 const fit=button('符合視窗',()=>{img.style.width='100%';img.style.maxWidth='100%'}),zoom=button('原尺寸放大',()=>{img.style.width=page.width+'px';img.style.maxWidth='none'}),close=button('關閉',()=>dialog.close());
 header.append(el('strong',title),fit,zoom,close);scroll.append(img);dialog.append(header,scroll);document.body.append(dialog);dialog.addEventListener('close',()=>dialog.remove(),{once:true});dialog.showModal();
}
function renderVisualRecord(record){
 const box=el('section',undefined,'official-visual-record');box.dataset.source=record.sha256;
 box.append(el('h4',record.title));const actions=el('div',undefined,'actions');actions.append(link('開啟官方原檔',record.file),link('官方來源連結',record.source_url));box.append(actions);
 const pages=el('div',undefined,'official-visual-pages');
 for(const page of record.pages){
  const figure=el('figure'),label=record.title+'｜第 '+page.page+' 頁',preview=button('',()=>openOfficialFigure(page,label),'figure-preview-button'),img=el('img');
  preview.setAttribute('aria-label','放大 '+label);img.src=page.image;img.alt=label;img.width=page.width;img.height=page.height;img.loading=page.page===1?'eager':'lazy';img.decoding='async';preview.append(img);figure.append(preview,el('figcaption','第 '+page.page+' 頁・點圖放大'));pages.append(figure);
 }box.append(pages);return box;
}
function appendOfficialFigures(host,d,u,v){
 const records=availableOfficialVisuals(d,u,v).filter(r=>!(d.pcode==='D0070115'&&u.article_key==='264'&&r.kind==='fulltext'));
 if(!records.length)return;
 const details=el('details',undefined,'official-figures');details.id='articleFigures';details.open=true;
 details.append(el('summary','官方公式與補充圖例（'+records.reduce((n,r)=>n+r.pages.length,0)+' 頁）'));
 details.append(el('p','全國法規資料庫原檔；收錄日期 '+globalThis.LEGAL_VISUALS.collected_on+'。點圖可放大，亦可開啟原檔。','figure-origin-note'));
 for(const record of records)details.append(renderVisualRecord(record));host.append(details);
}
const officialFigureStyle=el('style');officialFigureStyle.textContent=`
.official-figures{margin:24px 0;border:1px solid #b7c8ce;border-radius:6px;background:#f5f8f9;padding:16px 18px;max-width:100%}.official-figures>summary{font-size:20px;line-height:1.8;font-weight:700;cursor:pointer;color:#07546d}
.figure-origin-note{font-size:15px;line-height:1.9;color:#617267}.official-visual-record{min-width:0;max-width:100%;margin:16px 0 24px}.official-visual-record h4{font-size:19px;line-height:1.8;margin:12px 0}.official-visual-record .actions a{font-size:16px}.official-visual-pages{display:grid;grid-template-columns:minmax(0,1fr);gap:20px}.official-visual-pages figure{margin:0;min-width:0}.official-visual-pages figcaption{font-size:15px;color:#617267;margin-top:7px}
.figure-preview-button{display:block;width:100%;padding:0;border:1px solid #c6d3d8;background:white;cursor:zoom-in;border-radius:3px}.figure-preview-button img{width:100%;height:auto;display:block}.figure-preview-button:focus-visible{outline:3px solid #b49a47;outline-offset:3px}
.legal-image-viewer{width:min(1500px,97vw);height:94vh;max-width:97vw;padding:0;overflow:hidden;border:1px solid #b7c8ce}.figure-viewer-head{display:flex;flex-wrap:wrap;align-items:center;gap:9px;padding:12px 16px;background:#edf3f5;border-bottom:1px solid #b7c8ce;font-size:17px}.figure-viewer-head strong{flex:1;min-width:180px}.figure-viewer-head button{font-size:16px;padding:6px 10px;border:1px solid #b7c8ce;background:white;color:#07546d;border-radius:4px}.figure-viewer-scroll{height:calc(100% - 100px);overflow:auto;background:#e3e9ec;padding:12px}.figure-viewer-scroll img{display:block;max-width:100%;width:100%;height:auto;margin:0 auto;background:white}
#articleText.version-reading .reading,#articleText.version-reading .legal-prose{font-size:22px;line-height:2.05}#articleText.version-reading .legal-table,#articleText.version-reading .usage-table{font-size:19px}#articleText.version-reading .usage-group span,#articleText.version-reading .usage-category span{font-size:18px}
@media(max-width:800px){.official-figures{padding:13px 12px}.official-figures>summary{font-size:19px}.figure-viewer-head strong{width:100%;flex:auto}.figure-viewer-scroll{height:calc(100% - 150px)}#articleText.version-reading .reading,#articleText.version-reading .legal-prose{font-size:21px}#articleText.version-reading .legal-table,#articleText.version-reading .usage-table{font-size:18px}}
@media print{.official-figures{background:white;border:0;padding:0}.official-visual-record .actions,.official-visual-pages figcaption{display:none}.official-visual-pages figure{break-inside:avoid}.figure-preview-button{border:0}.legal-image-viewer{display:none!important}#articleText.version-reading .reading,#articleText.version-reading .legal-prose{font-size:13pt}#articleText.version-reading .legal-table,#articleText.version-reading .usage-table{font-size:10pt}}
`;
document.head.append(officialFigureStyle);

const interpretationCache=new Map();
function openReaderLocation(){
 const query=new URLSearchParams(location.hash.slice(1));
 if(query.get('pcode')&&query.get('letter'))window.technicalApp.openInterpretation(query.get('pcode'),query.get('article'),query.get('letter'));
 else if(query.get('pcode'))window.technicalApp.openArticle(query.get('pcode'),query.get('article'),query.get('version'));
 else if(query.get('unit'))window.technicalApp.openUnit(query.get('unit'));
}
function interpretationRecords(group){
 if(interpretationCache.has(group.id))return interpretationCache.get(group.id);
 let text='',pages=[];
 for(const uid of group.unit_ids){const unit=units.get(uid);if(!unit)continue;pages.push({offset:text.length,page:unit.page_start});text+=unit.text+'\n'}
 const matches=[...text.matchAll(/(?:^|\n)\s*(?:主旨|王旨)\s*[:：·．]?\s*/g)],records=[];
 const flatten=value=>value.replace(/\s+/g,' ').trim();
 for(let index=0;index<matches.length;index++){
  const match=matches[index],start=match.index+match[0].length,end=matches[index+1]?.index??text.length,chunk=text.slice(start,end);
  const split=chunk.search(/(?:^|\n)\s*(?:說明|結論|決議|辦法)\s*[:：·．]?/),subject=flatten(split>=0?chunk.slice(0,split):chunk.slice(0,650));
  if(subject.length<6)continue;
  const explanation=split>=0?chunk.slice(split).trim():'';
  const prefix=text.slice(Math.max(0,match.index-260),match.index).split('\n').map(l=>l.trim()).filter(l=>/^(?:中華民國)?\d{2,3}\s*[年·．.,]/.test(l)&&/字第\s*\d+\s*號/.test(l)).at(-1)||'';
  const page=pages.filter(p=>p.offset<=match.index).at(-1)?.page||group.page_start;
  records.push({id:group.id+'_'+index,groupId:group.id,index,subject,explanation,documentLine:prefix,page});
 }
 if(!records.length){
  const paragraphs=text.split('\n').map(l=>l.trim()).filter(Boolean),start=paragraphs.findIndex(l=>/說明|依據|按|依照|查|結論/.test(l));
  records.push({id:group.id+'_reference',groupId:group.id,index:-1,subject:group.subjects?.join('；')||'本條相關彙編說明',explanation:start>=0?paragraphs.slice(start).join('\n'):text,documentLine:'',page:group.page_start,referenceOnly:true});
 }
 interpretationCache.set(group.id,records);return records;
}
function resourceAnchor(label,href,handler,className='secondary'){
 const a=link(label,href);a.className=className;a.onclick=event=>{if(event.button===0&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&!event.altKey){event.preventDefault();handler()}};return a;
}
function versionHref(d,u,v){return '#'+new URLSearchParams({pcode:d.pcode,article:u.article_key,version:v.id})}
function renderArticleResources(d,u,selectedId){
 const host=el('div',undefined,'article-resource-links'),vs=versions(d,u),rel=related(d,u),years=el('div',undefined,'resource-line version-links');years.append(el('span','年份條文（公布版次）','resource-label'));
 for(let i=0;i<vs.length;i++){
  const v=vs[i],same=i>0&&v.text===vs[i-1].text,label=v.publication_date+(same?'・文字相同':i>0?'・有異動':'');
  const a=resourceAnchor(label,versionHref(d,u,v),()=>{openArticle(d,u,v.id);history.replaceState(null,'',versionHref(d,u,v))});a.dataset.version=v.id;
  if(v.id===(selectedId||vs.at(-1)?.id))a.classList.add('selected-version');years.append(a);
 }
 if(!vs.length)years.append(link('官方條文來源',sourceUrl(d,u)));host.append(years);
 if(rel.length){
  const letters=el('div',undefined,'resource-line interpretation-links');letters.append(el('span','解釋令與函釋','resource-label'));
  for(const group of rel){
   const records=interpretationRecords(group),list=el('div',undefined,'interpretation-link-list');
   records.forEach((record,index)=>{
    const label=(record.referenceOnly?'彙編說明':record.documentLine||'函釋 '+(index+1))+'｜'+record.subject.slice(0,64)+(record.subject.length>64?'…':'');
    const href='#'+new URLSearchParams({pcode:d.pcode,article:u.article_key,letter:record.id});
    const a=resourceAnchor(label,href,()=>{openInterpretation(d,u,record.id);history.replaceState(null,'',href)},'interpretation-link');a.dataset.letter=record.id;
    if(index<6)list.append(a);else{
     let more=list.querySelector('details');if(!more){more=el('details',undefined,'more-interpretations');more.append(el('summary','其餘 '+(records.length-6)+' 件函釋連結'));list.append(more)}more.append(a);
    }
   });letters.append(list);
  }host.append(letters);
 }
 const figures=availableOfficialVisuals(d,u,vs.find(v=>v.id===selectedId)||vs.at(-1));
 if(figures.length){const a=resourceAnchor('官方公式／圖例（'+figures.reduce((n,r)=>n+r.pages.length,0)+' 頁）',versionHref(d,u,vs.at(-1)),()=>{openArticle(d,u,selectedId);document.querySelector('#articleFigures')?.scrollIntoView({block:'start'})});host.append(a)}
 return host;
}
function openInterpretation(d,u,id){
 const group=related(d,u).find(r=>interpretationRecords(r).some(record=>record.id===id));if(!group)return;
 const record=interpretationRecords(group).find(r=>r.id===id),doc=docs.get(group.document_id),body=$('detailbody');
 $('detailtitle').textContent=articleTitle(d,u)+'｜'+(record.referenceOnly?'彙編說明':'解釋令與函釋說明');body.replaceChildren();
 const section=el('article',undefined,'interpretation-reading');section.dataset.letter=record.id;
 section.append(el('h3',record.subject,'interpretation-subject'));if(record.documentLine)section.append(el('p',record.documentLine,'interpretation-document'));
 section.append(el('p',doc.title+'｜PDF 第 '+record.page+' 頁起','meta'));
 const actions=el('div',undefined,'actions');actions.append(link('開啟函釋原 PDF',doc.source_relative+'#page='+record.page),button('返回本條與年份連結',()=>openArticle(d,u)),button('列印函釋說明',()=>window.print()));section.append(actions);
 section.append(el('h3',record.referenceOnly?'相關說明摘錄':'原文說明摘錄'),el('p',record.explanation||'本段未辨識出獨立「說明」欄位，請開啟原 PDF 查閱全文。','interpretation-explanation'));
 section.append(el('p','摘錄來自彙編 OCR，可能含續頁及辨識錯字；請以所附掃描原文核對，函釋效力另依主管機關資料確認。','interpretation-source-note'));
 const source=el('details');source.append(el('summary','查看本組來源頁面與全文'));for(const uid of group.unit_ids){const unit=units.get(uid);source.append(el('h3','PDF 第 '+unit.page_start+' 頁'),el('pre',unit.text,'reading interpretation-explanation'))}section.append(source);
 body.append(section);if(!$('detail').open)$('detail').showModal();$('detail').scrollTop=0;
}
function markVisibleVersionChanges(host,before,after){
 if(!before||before.text===after.text)return;
 if(host.tagName==='PRE'&&host.textContent===after.text){
  host.replaceChildren();for(const [tag,text]of diffSegments(before.text,after.text)){if(tag==='delete')continue;host.append(tag==='insert'?el('ins',text,'version-insert'):document.createTextNode(text))}return;
 }
 const oldTables=splitLegalText(before.text).filter(p=>p.type==='table').map(p=>p.table),newTables=splitLegalText(after.text).filter(p=>p.type==='table').map(p=>p.table);
 [...host.querySelectorAll('.legal-table')].forEach((table,index)=>{const old=oldTables[index],current=newTables[index];if(!old||!current)return;for(const cell of table.querySelectorAll('th,td')){const row=+cell.dataset.sourceRow,col=+cell.dataset.sourceCol,a=old.cells.find(c=>c.row===row&&c.col===col),b=current.cells.find(c=>c.row===row&&c.col===col);if(b&&a?.text!==b.text){cell.classList.add('version-value-changed');cell.title='本版與前一版文字不同'}}});
 const parts=diffSegments(before.text,after.text).filter(([tag,text])=>tag==='insert'&&text.trim());
 const walker=document.createTreeWalker(host,NodeFilter.SHOW_TEXT),nodes=[];while(walker.nextNode()){const node=walker.currentNode;if(!node.parentElement.closest('details,svg,math,figcaption'))nodes.push(node)}
 for(const node of nodes){let chunks=[{text:node.textContent,mark:false}];for(const [,value]of parts){if(value.length<2)continue;chunks=chunks.flatMap(chunk=>{if(chunk.mark||!chunk.text.includes(value))return[chunk];const pieces=chunk.text.split(value),out=[];pieces.forEach((p,i)=>{if(i)out.push({text:value,mark:true});if(p)out.push({text:p,mark:false})});return out})}if(chunks.some(c=>c.mark)){const fragment=document.createDocumentFragment();for(const chunk of chunks)fragment.append(chunk.mark?el('ins',chunk.text,'version-insert'):document.createTextNode(chunk.text));node.replaceWith(fragment)}}
}
function renderVersionReadableBody(d,u,v){
 const text=v?.text||u.text,original=availableOfficialVisuals(d,u,v).find(r=>r.kind==='fulltext');
 if(d.pcode==='D0070115'&&u.article_key==='264'&&original){
  const host=el('div',undefined,'official-formula-original');host.id='articleFigures';host.append(el('p','本條公式依官方完整條文原版呈現。','figure-origin-note'),renderVisualRecord(original));
  const raw=el('details',undefined,'legal-original');raw.append(el('summary','檢視文字資料庫原文'),el('pre',text,'reading'));host.append(raw);return host;
 }
 return renderFormattedLegalText(text)||el('pre',text,'reading');
}
const readingStyle=el('style');readingStyle.textContent=`
.article-resource-links{width:100%;margin:12px 0 4px;padding-top:12px;border-top:1px solid #d4ddd3;display:flex;flex-direction:column;gap:14px}
.resource-line{display:flex;flex-wrap:wrap;align-items:center;gap:9px 12px;max-width:100%}.resource-label{font-size:17px;font-weight:700;color:#31594f;width:100%}
.articlecard .article-resource-links .secondary,.article-resource-links .secondary{font-size:18px;padding:7px 12px;line-height:1.7;white-space:normal}
.selected-version{background:#e0ead9!important;border-color:#759879!important;font-weight:700}
.interpretation-link-list{width:100%;display:flex;flex-direction:column;gap:10px}.interpretation-link{display:block;font-size:19px;line-height:1.8;overflow-wrap:anywhere;text-underline-offset:4px}
.more-interpretations{font-size:18px;line-height:1.9}.more-interpretations summary{cursor:pointer;margin-bottom:8px}
.interpretation-reading{font-size:22px;line-height:2.05;color:#173b35}.interpretation-reading h3{font-size:23px;line-height:1.8}.interpretation-document{font-size:20px;font-weight:700}.interpretation-explanation{font-size:22px!important;line-height:2.1!important;white-space:pre-wrap;overflow-wrap:anywhere}.interpretation-source-note{font-size:16px;line-height:1.9;color:#617267}
.relatedgroup .reading,.relatedpreview,#articleLetters .relatedpreview,.relatedgroup .relatedpreview{font-size:21px;line-height:2}.relatedgroup summary{font-size:19px}.relatedgroup .meta{font-size:15px}
.difftext,.parallel .reading,.parallel .legal-prose,.versionpanel .difftext{font-size:22px!important;line-height:2.05}.versionpanel .notice{font-size:19px;line-height:1.9}.versionpanel .comparecontrols,.versionpanel .comparecontrols select{font-size:18px}.parallel>div>b{font-size:20px}
.version-insert,.legal-table .version-value-changed{background:#dcefd5!important;color:#235522;text-decoration:none;border-bottom:2px solid #649d56}.version-reading-note{font-size:16px;color:#617267;line-height:1.9}
.readable-formula{margin:20px 0;padding:18px 22px;background:#f1f6f7;border:1px solid #b7c8ce;border-left:4px solid #07546d;max-width:100%}.readable-formula figcaption{font-size:16px;color:#496c78;margin-bottom:12px}.formula-scroll{overflow-x:auto;max-width:100%;padding:8px 4px}.formula-scroll math{font-size:26px;margin:0;width:max-content;min-width:100%;color:#163746}.formula-scroll:focus-visible{outline:3px solid #b49a47;outline-offset:3px}
@media(max-width:800px){.interpretation-reading,.interpretation-explanation{font-size:21px!important;line-height:2!important}.interpretation-reading h3{font-size:22px}.difftext,.parallel .reading,.parallel .legal-prose,.versionpanel .difftext{font-size:21px!important}.interpretation-link{font-size:18px}.article-resource-links .secondary{font-size:17px}.readable-formula{padding:14px 12px}.formula-scroll math{font-size:25px}}
@media print{.article-resource-links{display:none}.interpretation-explanation,.difftext,.parallel .reading{font-size:13pt!important}.readable-formula{break-inside:avoid}.formula-scroll{overflow:visible}.formula-scroll math{font-size:17pt}}
`;
document.head.append(readingStyle);

// Source text uses double-width CJK/box glyphs and single-width Latin padding.
function legalGlyphWidth(char){return char.codePointAt(0)>255?2:1}
const legalConnections={
  '─':'LR','│':'UD','┌':'RD','┐':'LD','└':'RU','┘':'LU',
  '├':'RUD','┤':'LUD','┬':'LRD','┴':'LRU','┼':'LRUD'
};
function legalSourceLine(line){
  const chars=[];let x=0;
  for(const char of line.trimStart().trimEnd()){chars.push({x,char});x+=legalGlyphWidth(char)}
  return{chars,byX:new Map(chars.map(c=>[c.x,c.char])),width:x};
}
function legalHorizontalWall(line,left,right){
  if(!legalConnections[line.byX.get(left)]?.includes('R')||!legalConnections[line.byX.get(right)]?.includes('L'))return false;
  for(let x=left+2;x<right;x+=2){const flags=legalConnections[line.byX.get(x)];if(!flags?.includes('L')||!flags.includes('R'))return false}
  return true;
}
function legalCellText(fragments){
  const lines=fragments.map(x=>x.trim());while(lines.length&&!lines[0])lines.shift();while(lines.length&&!lines.at(-1))lines.pop();
  let text='',pendingBreak=false;
  for(const line of lines){
    if(!line){if(text)pendingBreak=true;continue}
    const paragraph=/^(?:[一二三四五六七八九十百]+[、．.]|[（(][一二三四五六七八九十\d]+[）)]|\d+[.、．]|[男女]子[：:]|[A-IＡ-Ｉ]\s*類)/.test(line);
    if(text&&(pendingBreak||paragraph))text+='\n';
    // Keep all source characters; whitespace is layout, not an inferred number/unit.
    text+=line;pendingBreak=false;
  }
  return text;
}
function parseLegalBoxTable(raw){
  const source=raw.split(/\r?\n/).filter(line=>line.trim()).map(legalSourceLine);
  if(source.length<3||source[0].chars[0]?.char!=='┌'||source.at(-1).chars[0]?.char!=='└')return null;
  const boundaries='│┌┐└┘├┤┬┴┼';
  const xs=[...new Set(source.flatMap(line=>line.chars.filter(t=>boundaries.includes(t.char)).map(t=>t.x)))].sort((a,b)=>a-b);
  if(xs[0]!==0||xs.length<3||xs.length>80)return null;
  const width=xs.at(-1);
  if(source.some(line=>line.chars.at(-1)?.x!==width))return null;
  const hwall=(y,col)=>legalHorizontalWall(source[y],xs[col],xs[col+1]);
  const ys=source.map((line,y)=>xs.slice(0,-1).some((_,c)=>hwall(y,c))?y:-1).filter(y=>y>=0);
  if(ys[0]!==0||ys.at(-1)!==source.length-1)return null;
  const rows=ys.length-1,cols=xs.length-1;
  if(rows<2||rows*cols>30000)return null;
  const parent=Array.from({length:rows*cols},(_,i)=>i);
  function find(i){while(parent[i]!==i){parent[i]=parent[parent[i]];i=parent[i]}return i}
  function join(a,b){parent[find(b)]=find(a)}
  function vwall(x,top,bottom){
    if(!legalConnections[source[top].byX.get(x)]?.includes('D')||!legalConnections[source[bottom].byX.get(x)]?.includes('U'))return false;
    for(let y=top+1;y<bottom;y++){const flags=legalConnections[source[y].byX.get(x)];if(!flags?.includes('U')||!flags.includes('D'))return false}
    return true;
  }
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
    const index=r*cols+c;
    if(c+1<cols&&!vwall(xs[c+1],ys[r],ys[r+1]))join(index,index+1);
    if(r+1<rows&&!hwall(ys[r+1],c))join(index,index+cols);
  }
  const components=new Map();
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
    const key=find(r*cols+c);if(!components.has(key))components.set(key,[]);components.get(key).push([r,c]);
  }
  const cells=[];let textCharacterCount=0;
  for(const atoms of components.values()){
    const top=Math.min(...atoms.map(a=>a[0])),bottom=Math.max(...atoms.map(a=>a[0]))+1,left=Math.min(...atoms.map(a=>a[1])),right=Math.max(...atoms.map(a=>a[1]))+1;
    if(atoms.length!==(bottom-top)*(right-left))return null;
    const fragments=[];
    for(let y=ys[top]+1;y<ys[bottom];y++){
      const tokens=source[y].chars.filter(t=>t.x>=xs[left]+2&&t.x<xs[right]);
      // A rectangle cannot contain an unaccounted internal border.
      if(tokens.some(t=>boundaries.includes(t.char)))return null;
      const text=tokens.map(t=>t.char).join('');fragments.push(text);textCharacterCount+=text.replace(/\s/g,'').length;
    }
    cells.push({row:top,col:left,rowSpan:bottom-top,colSpan:right-left,text:legalCellText(fragments),fragments});
  }
  // Independently account for every source character, including dash ranges in cells.
  let expectedCharacters=0;
  for(let y=0;y<source.length;y++)for(const token of source[y].chars){
    if(/\s/.test(token.char)||boundaries.includes(token.char))continue;
    if(token.char==='─'&&xs.slice(0,-1).some((x,c)=>x<=token.x&&token.x<xs[c+1]&&hwall(y,c)))continue;
    expectedCharacters++;
  }
  if(expectedCharacters!==textCharacterCount)return null;
  let headerRows=ys.findIndex((y,i)=>i>0&&i<ys.length-1&&xs.slice(0,-1).every((_,c)=>hwall(y,c)));
  if(headerRows<1||headerRows>4)headerRows=1;
  if(headerRows===1&&cells.some(cell=>cell.row===1&&cell.col===0&&/^(類別|項目|種類)$/.test(cell.text.replace(/\s/g,''))))headerRows=2;
  if(cells.some(cell=>cell.row<headerRows&&cell.row+cell.rowSpan>headerRows))headerRows=0;
  cells.sort((a,b)=>a.row-b.row||a.col-b.col);
  return{rows,cols,xs,ys,headerRows,cells,raw,textCharacterCount,expectedCharacters};
}
function splitLegalText(text){
  const lines=text.split(/\r?\n/),parts=[];let prose=[];
  function flush(){if(prose.length){parts.push({type:'text',text:prose.join('\n')});prose=[]}}
  for(let i=0;i<lines.length;i++){
    if(!lines[i].trimStart().startsWith('┌')){prose.push(lines[i]);continue}
    let end=i+1;while(end<lines.length&&!lines[end].trimStart().startsWith('└'))end++;
    if(end===lines.length){prose.push(lines[i]);continue}
    flush();const raw=lines.slice(i,end+1).join('\n'),table=parseLegalBoxTable(raw);
    parts.push(table?{type:'table',table}:{type:'fixed',text:raw});i=end;
  }
  flush();return parts;
}

const legalLayoutCache=new Map();
function legalCachedParts(text){
  if(legalLayoutCache.has(text))return legalLayoutCache.get(text);
  const parts=splitLegalText(text);legalLayoutCache.set(text,parts);
  if(legalLayoutCache.size>128)legalLayoutCache.delete(legalLayoutCache.keys().next().value);
  return parts;
}
function legalPositionedText(fragments,label){
  const lines=[...fragments];while(lines.length&&!lines[0].trim())lines.shift();while(lines.length&&!lines.at(-1).trim())lines.pop();
  const leading=Math.min(...lines.filter(l=>l.trim()).map(l=>l.match(/^ */)[0].length));
  const prepared=lines.map(l=>l.slice(leading).trimEnd()),unit=8.5,lineHeight=23,pad=8;
  const width=Math.max(...prepared.map(l=>Array.from(l).reduce((n,c)=>n+legalGlyphWidth(c),0)),1)*unit+pad*2,height=prepared.length*lineHeight+pad*2;
  const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox',`0 0 ${width} ${height}`);svg.setAttribute('width',width);svg.setAttribute('height',height);svg.setAttribute('role','img');svg.setAttribute('aria-label',label);svg.classList.add('legal-positioned');
  const desc=document.createElementNS(ns,'desc');desc.textContent=prepared.join('\n');svg.append(desc);
  prepared.forEach((line,row)=>{
    let x=pad;
    for(const char of line){
      const glyph=legalGlyphWidth(char)*unit,centerY=pad+row*lineHeight+lineHeight/2,flags=legalConnections[char];
      if(flags){
        const centerX=x+glyph/2,path=document.createElementNS(ns,'path');let d='';
        if(flags.includes('L'))d+=`M${centerX},${centerY}H${x}`;
        if(flags.includes('R'))d+=`M${centerX},${centerY}H${x+glyph}`;
        if(flags.includes('U'))d+=`M${centerX},${centerY}V${centerY-lineHeight/2}`;
        if(flags.includes('D'))d+=`M${centerX},${centerY}V${centerY+lineHeight/2}`;
        path.setAttribute('d',d);path.setAttribute('fill','none');path.setAttribute('stroke','currentColor');path.setAttribute('stroke-width','1.1');svg.append(path);
      }else if(!/\s/.test(char)){
        const t=document.createElementNS(ns,'text');t.textContent=char;t.setAttribute('x',x);t.setAttribute('y',centerY+5.5);t.setAttribute('font-size','17');t.setAttribute('font-family','Microsoft JhengHei, Noto Sans TC, sans-serif');t.setAttribute('textLength',glyph);t.setAttribute('lengthAdjust','spacingAndGlyphs');svg.append(t);
      }
      x+=glyph;
    }
  });return svg;
}
function legalCellHasPositionedMath(cell){return cell.fragments.some(line=>/^\s*\d+\s*$/.test(line))&&cell.fragments.some(line=>/[A-Za-z]/.test(line))}
function renderLegalBoxTable(model,tokens,label){
  const wrap=el('div',undefined,'legal-table-grid');wrap.tabIndex=0;wrap.setAttribute('role','region');wrap.setAttribute('aria-label',label);
  const table=el('table',undefined,'legal-table');table.setAttribute('aria-label',label);
  const widths=model.xs.slice(1).map((x,i)=>x-model.xs[i]),total=model.xs.at(-1),colgroup=el('colgroup');
  for(const width of widths){const col=el('col');col.style.width=(width/total*100)+'%';colgroup.append(col)}table.append(colgroup);
  const minWidth=Math.max(700,...model.cells.filter(c=>c.colSpan<model.cols).map(c=>48*total/(model.xs[c.col+c.colSpan]-model.xs[c.col])));
  table.style.setProperty('--legal-table-width',Math.ceil(minWidth)+'px');
  const rows=Array.from({length:model.rows},()=>el('tr')),thead=model.headerRows?el('thead'):null,tbody=el('tbody');
  for(let r=0;r<rows.length;r++)(thead&&r<model.headerRows?thead:tbody).append(rows[r]);
  for(const cell of model.cells){
    const heading=model.headerRows?cell.row<model.headerRows:cell.row===0&&cell.rowSpan===1;
    const rowHeading=!heading&&cell.col===0&&cell.colSpan<model.cols;
    const td=el(heading||rowHeading?'th':'td',undefined,heading?'legal-column-heading':rowHeading?'legal-row-heading':undefined);
    if(heading)td.scope=cell.colSpan>1?'colgroup':'col';else if(rowHeading)td.scope=cell.rowSpan>1?'rowgroup':'row';
    td.rowSpan=cell.rowSpan;td.colSpan=cell.colSpan;td.dataset.sourceRow=cell.row;td.dataset.sourceCol=cell.col;
    if(legalCellHasPositionedMath(cell)){td.classList.add('legal-formula-cell');td.append(legalPositionedText(cell.fragments,'依原文位置呈現的表內公式'))}
    else td.append(tokens.length?highlight(cell.text,tokens):document.createTextNode(cell.text));
    rows[cell.row].append(td);
  }
  if(thead)table.append(thead);table.append(tbody);wrap.append(table);return wrap;
}
function appendLegalPlainProse(host,text,tokens){
  const lines=text.split('\n');let prose=[];
  function flush(){const value=prose.join('\n');if(value.trim()){const pre=el('pre',undefined,'reading legal-prose');pre.append(tokens.length?highlight(value,tokens):document.createTextNode(value));host.append(pre)}prose=[]}
  for(let i=0;i<lines.length;i++){
    if(!/[│┼]/.test(lines[i])){prose.push(lines[i]);continue}
    flush();let end=i;
    while(end+1<lines.length&&lines[end+1].trim()&&!/[\u4e00-\u9fff]{2,}/.test(lines[end+1]))end++;
    const diagram=el('div',undefined,'legal-fixed-layout');diagram.tabIndex=0;diagram.setAttribute('role','region');diagram.setAttribute('aria-label','條文原始示意圖');diagram.append(legalPositionedText(lines.slice(i,end+1),'條文原始示意圖'));host.append(diagram);i=end;
  }flush();
}
function renderFormattedLegalText(text,tokens=[]){
  const usage=renderUsageClassification(text,tokens);if(usage)return usage;
  if(!/[┌│┼]/.test(text)&&!hasReadableFormula(text))return null;
  const parts=legalCachedParts(text),host=el('div',undefined,'legal-formatted-text'),tableCount=parts.filter(p=>p.type==='table').length;
  if(!tableCount&&!parts.some(p=>p.type==='fixed')&&!/[│┼]/.test(text)&&!hasReadableFormula(text))return null;
  let tableIndex=0;
  if(tableCount)host.append(el('p','表格可左右滑動，查看完整欄位。','legal-table-hint'));
  for(const part of parts){
    if(part.type==='table'){
      tableIndex++;const figure=el('figure',undefined,'legal-table-figure');
      if(tableCount>1)figure.append(el('figcaption','表 '+tableIndex,'legal-table-caption'));
      figure.append(renderLegalBoxTable(part.table,tokens,'條文表格 '+tableIndex));host.append(figure);
    }else if(part.type==='fixed'){
      const fixed=el('div',undefined,'legal-fixed-layout');fixed.tabIndex=0;fixed.append(legalPositionedText(part.text.split('\n'),'原文框線表格'));host.append(fixed);
    }else appendReadableProse(host,part.text,tokens);
  }
  const raw=el('details',undefined,'legal-original');raw.append(el('summary','檢視原始條文文字'),el('pre',text,'reading'));host.append(raw);return host;
}
const legalTableStyle=el('style');legalTableStyle.textContent=`
.legal-formatted-text{width:100%;min-width:0;max-width:100%;margin:8px 0 20px;white-space:normal;color:#163746}
.legal-table-figure{margin:20px 0;min-width:0;max-width:100%}
.legal-table-caption{font-size:14px;font-weight:700;margin:0 0 8px;color:#07546d}
.legal-table-grid{max-width:100%;width:100%;overflow-x:auto;overscroll-behavior-x:contain}
.legal-table-grid:focus-visible,.legal-fixed-layout:focus-visible{outline:3px solid #b49a47;outline-offset:3px}
.legal-table{table-layout:fixed;border-collapse:collapse;width:100%;min-width:var(--legal-table-width,620px);font-size:17px;line-height:1.9;background:#fff}
.legal-table th,.legal-table td{border:1px solid #b7c8ce;padding:12px 13px;text-align:left;vertical-align:middle;white-space:pre-line;overflow-wrap:anywhere;font-weight:400}
.legal-table .legal-column-heading{background:#07546d;color:#fff;border-color:#47798a;font-weight:700}
.legal-table .legal-row-heading{background:#eaf2f5;color:#07546d;font-weight:500}
.legal-table td[colspan]{background:#f5f8f9}
.legal-table-hint{font-size:13px;color:#596e77;margin:12px 0 0}
.legal-original{font-size:13px;color:#596e77;margin-top:14px;max-width:100%}
.legal-original summary{cursor:pointer}
.legal-original pre.reading{overflow:auto;white-space:pre;font:13px/1.7 monospace!important;max-width:100%}
.legal-fixed-layout{max-width:100%;overflow-x:auto;color:#163746;margin:14px 0}
.legal-positioned{display:block;max-width:100%;height:auto;color:inherit}
.legal-fixed-layout>.legal-positioned{max-width:none}
.legal-formula-cell{padding:6px!important;white-space:normal!important}
.legal-prose{max-width:100%;overflow-wrap:anywhere}
.articlecard .legal-prose{font-size:21px;font-weight:500;line-height:1.95;letter-spacing:.02em;color:#173b35}
@media(max-width:850px){.legal-table{font-size:16px}.legal-table th,.legal-table td{padding:11px 12px}.articlecard .legal-prose{font-size:20px}}
@media print{.legal-original,.legal-table-hint{display:none!important}.legal-table-grid,.legal-fixed-layout{overflow:visible}.legal-table{min-width:0!important;font-size:9.5pt;line-height:1.7}.legal-table th,.legal-table td{padding:6px 7px}.legal-table thead{display:table-header-group}.legal-table tr{break-inside:avoid}.legal-positioned{max-width:100%!important}.legal-table *{print-color-adjust:exact;-webkit-print-color-adjust:exact}.articlecard .legal-prose{font-size:12pt}.legal-table-figure{margin:14px 0}}
`;
document.head.append(legalTableStyle);

// Rebuild the source article's text table; never substitute another law/version.
function parseUsageClassification(text){
  if(!text.includes('建築物用途分類之類別、組別定義')||!text.includes('┌'))return null;
  const categories=[];let category=null,group=null;
  const clean=value=>value.replace(/[\s\u2500-\u257f]/g,'');
  for(const line of text.split(/\r?\n/)){
    if(!line.startsWith('│'))continue;
    const cells=line.replace(/[├┤┼]/g,'│').split('│').slice(1,-1).map(clean);
    if(cells.length!==5)continue;
    const code=cells[0].normalize('NFKC');
    if(/^[A-I]$/.test(code)){
      category={code,name:'',definition:'',groups:[]};categories.push(category);group=null;
    }
    if(!category)continue;
    category.name+=cells[1];category.definition+=cells[2];
    const groupCode=cells[3].normalize('NFKC');
    if(/^[A-I](?:-[1-5])?$/.test(groupCode)){
      group={code:groupCode,name:'',definition:''};category.groups.push(group);
    }else if(group){group.name+=cells[3]}
    if(group)group.definition+=cells[4];
  }
  const expected='A-1,A-2,B-1,B-2,B-3,B-4,C-1,C-2,D-1,D-2,D-3,D-4,D-5,E,F-1,F-2,F-3,F-4,G-1,G-2,G-3,H-1,H-2,I';
  if(categories.map(c=>c.code).join('')!=='ABCDEFGHI'||categories.flatMap(c=>c.groups.map(g=>g.code)).join(',')!==expected)return null;
  if(categories.some(c=>!c.name||!c.definition||c.groups.some(g=>!g.name||!g.definition)))return null;
  return{intro:text.slice(0,text.indexOf('┌')).trim(),categories};
}
function renderUsageClassification(text,tokens=[]){
  const parsed=parseUsageClassification(text);if(!parsed)return null;
  const host=el('div',undefined,'usage-classification');
  const fill=(node,value)=>{node.append(tokens.length?highlight(value,tokens):document.createTextNode(value));return node};
  host.append(fill(el('p',undefined,'usage-intro'),parsed.intro));
  const hint=el('p','小螢幕可左右滑動表格，查看完整定義。','usage-scroll-hint');host.append(hint);
  const wrap=el('div',undefined,'usage-grid');wrap.tabIndex=0;wrap.setAttribute('role','region');wrap.setAttribute('aria-label','建築物用途分類完整表，九大類二十四組');
  const table=el('table',undefined,'usage-table');table.setAttribute('aria-label','建築物用途分類，A 至 I 類');
  const cols=el('colgroup');for(const width of ['13%','29%','16%','42%']){const col=el('col');col.style.width=width;cols.append(col)}table.append(cols);
  const thead=el('thead'),header=el('tr');for(const label of ['類別','類別定義','組別','組別定義']){const cell=el('th',label);cell.scope='col';header.append(cell)}thead.append(header);table.append(thead);
  for(const category of parsed.categories){
    const tbody=el('tbody');tbody.dataset.category=category.code;
    category.groups.forEach((group,index)=>{
      const row=el('tr');row.dataset.group=group.code;
      if(index===0){
        const label=el('th',undefined,'usage-category');label.scope='rowgroup';label.rowSpan=category.groups.length;
        label.append(fill(el('strong'),category.code+' 類'),fill(el('span'),category.name));
        const definition=fill(el('td',undefined,'usage-category-definition'),category.definition.replace('需–特別照顧','需特別照顧'));definition.rowSpan=category.groups.length;
        row.append(label,definition);
      }
      const groupLabel=el('th',undefined,'usage-group');groupLabel.scope='row';groupLabel.append(fill(el('strong'),group.code),fill(el('span'),group.name));
      row.append(groupLabel,fill(el('td'),group.definition));tbody.append(row);
    });table.append(tbody);
  }
  wrap.append(table);host.append(wrap);
  host.append(el('p','A 至 I 共 9 大類、24 個組別。','usage-count'));
  const raw=el('details',undefined,'usage-original');raw.append(el('summary','檢視原始條文文字'),el('pre',text,'reading'));host.append(raw);
  return host;
}
const usageStyle=el('style');usageStyle.textContent=`
.usage-classification{width:100%;max-width:100%;min-width:0;margin:8px 0 20px;color:#163746;font-weight:400;letter-spacing:normal;white-space:normal}
.usage-intro{font-size:21px;line-height:1.95;margin:8px 0 20px;overflow-wrap:break-word}
.usage-grid{width:100%;max-width:100%;overflow-x:auto;overscroll-behavior-x:contain}
.usage-grid:focus-visible{outline:3px solid #b49a47;outline-offset:3px}
.usage-table{width:100%;min-width:780px;border-collapse:collapse;table-layout:fixed;font-size:17px;line-height:1.85;background:#fff}
.usage-table th,.usage-table td{border:1px solid #b7c8ce;padding:16px 18px;text-align:left;vertical-align:middle;overflow-wrap:break-word;white-space:normal;font-weight:400}
.usage-table thead th{background:#07546d;border-color:#47798a;color:#fff;font-weight:700;padding:12px 18px}
.usage-table tbody+tbody>tr:first-child>*{border-top:2px solid #6d96a5}
.usage-table .usage-category{background:#eaf2f5;text-align:center}
.usage-table .usage-category strong,.usage-table .usage-group strong{display:block;font-size:21px;color:#07546d;font-weight:700;line-height:1.6}
.usage-table .usage-category span,.usage-table .usage-group span{display:block;font-size:16px;line-height:1.7}
.usage-table .usage-category span{font-weight:700}
.usage-table .usage-category-definition{background:#f5f8f9}
.usage-table .usage-group{background:#fafcfc}
.usage-scroll-hint{display:none;font-size:13px;color:#596e77;margin:0 0 10px}
.usage-count{font-size:13px;color:#596e77;margin:12px 0 8px}
.usage-original{font-size:13px;color:#596e77;margin-top:12px;max-width:100%}
.usage-original summary{cursor:pointer}
.usage-original pre.reading{overflow:auto;white-space:pre;font:13px/1.7 monospace!important;max-width:100%}
@media(max-width:850px){.usage-intro{font-size:20px}.usage-scroll-hint{display:block}.usage-table{font-size:16px}.usage-table th,.usage-table td{padding:13px 15px}}
@media print{.usage-original,.usage-scroll-hint{display:none!important}.usage-grid{overflow:visible}.usage-table{min-width:0;font-size:10pt;line-height:1.7}.usage-table th,.usage-table td{padding:8px 9px}.usage-table .usage-category strong,.usage-table .usage-group strong{font-size:12pt}.usage-table .usage-category span,.usage-table .usage-group span{font-size:10pt}.usage-table thead{display:table-header-group}.usage-table tbody{break-inside:avoid}.usage-intro{font-size:12pt}.usage-table *{print-color-adjust:exact;-webkit-print-color-adjust:exact}}
`;
document.head.append(usageStyle);

const css=document.createElement('style');css.textContent=`
.articlelayout{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);gap:24px;margin-top:20px}.articlelayout>section{min-width:0}.articlelayout h3{border-bottom:2px solid #b9c8a5;padding-bottom:10px}.relatedgroup{padding:14px;background:#f0f3e7;border:1px solid var(--line);border-radius:6px;margin:12px 0}.relatedgroup summary{font-weight:bold;cursor:pointer}.relatedgroup .reading{font-size:13px;line-height:1.9}.relatedgroup details{margin:10px 0}.relatedpreview{font-size:13px;white-space:pre-wrap;line-height:1.9}.relcount{font-size:11px;padding:3px 8px;border-radius:4px;background:#e4edda;margin:4px 5px 10px 0}.versionpanel{border-top:2px solid #b9c8a5;margin-top:26px;padding-top:15px}.comparecontrols{display:flex;gap:10px;flex-wrap:wrap;margin:12px 0}.comparecontrols select{padding:7px;max-width:100%}.parallel{display:grid;grid-template-columns:1fr 1fr;gap:16px}.parallel>div{padding:14px;background:#f4f4ec;border:1px solid var(--line);min-width:0}.difftext{white-space:pre-wrap;font-size:14px;line-height:2;padding:15px;border:1px solid var(--line)}ins{background:#dcefd5;color:#235522;text-decoration:none;border-bottom:2px solid #649d56}del{background:#f6deda;color:#8d322b;text-decoration:line-through}.updateform{display:grid;grid-template-columns:1fr 1fr;gap:14px;padding:20px;border:1px solid var(--line);background:#fffdf7;border-radius:7px}.updateform label{display:flex;flex-direction:column;gap:6px;font-size:13px}.updateform input,.updateform select,.updateform textarea{font:inherit;padding:9px;border:1px solid var(--line);border-radius:4px;min-width:0;width:100%;background:white}.updateform .wide{grid-column:1/-1}.updateform textarea{min-height:120px}.updateform .fulltext{min-height:260px}.articlemeta{display:flex;gap:5px;flex-wrap:wrap}.pending{background:#f4e0ce;padding:8px 12px;color:#81462c;font-size:13px}.updatepreview{margin:20px 0}.artifactstatus{font-size:13px;color:var(--muted)}.articlelayout .actions{margin:12px 0}@media(max-width:800px){.articlelayout,.parallel,.updateform{grid-template-columns:1fr}.updateform .wide{grid-column:auto}.articlelayout{gap:15px}}@media print{.comparecontrols,.updateform{display:none}.articlelayout,.parallel{display:block}.relatedgroup{break-inside:avoid}}`;
document.head.append(css);
css.textContent+="\n.foldable-panel.versionpanel{padding:0;border:1px solid var(--line);border-radius:7px;background:#f5f6ee;margin-top:24px}\n.foldable-panel>summary{display:flex;align-items:center;gap:10px;cursor:pointer;padding:15px 18px;font-size:17px;font-weight:600;list-style:none}\n.foldable-panel>summary::-webkit-details-marker{display:none}\n.foldable-panel>summary::before{content:\"▸\";color:var(--green)}\n.foldable-panel[open]>summary::before{content:\"▾\"}\n.foldable-panel .fold-state{margin-left:auto;white-space:nowrap;font-size:12px;font-weight:400;color:var(--muted)}\n.foldable-panel>:not(summary){margin-left:18px;margin-right:18px}\n.foldable-panel[open]{padding-bottom:16px}\n";
css.textContent+='#articleLetters{max-height:none;overflow:visible;margin-top:24px;padding:0;border:1px solid var(--line);border-radius:7px;background:#f5f6ee}#articleLetters>summary{display:flex;align-items:center;gap:10px;cursor:pointer;padding:15px 18px;font-size:17px;font-weight:600;list-style:none}#articleLetters>summary::-webkit-details-marker{display:none}#articleLetters>summary::before{content:"▸";color:var(--green)}#articleLetters[open]>summary::before{content:"▾"}#articleLetters>summary .fold-state{margin-left:auto;white-space:nowrap;font-size:12px;font-weight:400;color:var(--muted)}#articleLetters>p,#articleLetters>.relatedgroup{margin-left:18px;margin-right:18px}#articleLetters[open]{padding-bottom:8px}';
// Make legal text the main reading surface; metadata remains secondary.
css.textContent+=`
.article-results{grid-template-columns:minmax(0,1fr);gap:16px}
.articlecard{padding:24px 28px}
.articlehead{display:flex;align-items:baseline;gap:14px;flex-wrap:wrap;width:100%;margin-bottom:8px}
.articlehead h3{font-size:23px;line-height:1.45;margin:0}
.articlehead .tag{font-size:12px;background:transparent;border:0;padding:0;color:var(--muted);margin:0}
.articlecard .clause-preview{font-size:21px;font-weight:500;line-height:1.95;color:#173b35;white-space:pre-wrap;margin:8px 0 18px;width:100%;letter-spacing:.02em}
.articlefooter{display:flex;align-items:center;gap:8px 16px;flex-wrap:wrap;width:100%;border-top:1px solid #e7ebe1;padding-top:11px;margin-top:0}
.articlefooter .meta{font-size:12px;margin:0}
.articlefooter .articlemeta{gap:6px}
.articlefooter .relcount{font-size:11px;font-weight:400;background:#edf1e6;padding:2px 7px;margin:0;color:#61715f}
.articlecard .actions{margin-top:13px;gap:8px}
.articlecard .actions .secondary{font-size:12px;padding:5px 10px}
main>h1{font-size:clamp(26px,2.8vw,34px);margin:18px 0 8px}
.stats{margin:18px 0}.stat{padding:11px 18px}.stat b{font-size:26px}
dialog{width:min(1280px,96vw)}
.articlelayout{display:block}
#articleText .reading{font-size:21px;font-weight:500;line-height:2.05;letter-spacing:.02em;color:#173b35}
.articlelayout h3{font-size:17px}
.relatedpreview{font-size:14px}
.difftext,.parallel .reading{font-size:18px;line-height:2}
@media(max-width:800px){.articlecard{padding:19px 18px}.articlehead{gap:6px 12px}.articlehead h3{font-size:21px}.articlecard .clause-preview{font-size:20px;line-height:1.95;margin-bottom:16px}.articlefooter{gap:7px 12px}.articlelayout{grid-template-columns:minmax(0,1fr);gap:20px}#articleText .reading{font-size:20px;line-height:2}.difftext,.parallel .reading{font-size:17px}}
@media print{.articlecard .clause-preview,#articleText .reading{font-size:14pt}.articlecard{padding:14px 0}.article-results{display:block}}
`;
document.querySelector('.asidefoot').innerHTML='條文查詢 → 相關解釋函 → 版本比對<br><br>一般查詢可離線使用。<br>新增異動請使用資料夾內的維護入口。';
const linkMap=new Map(),versionMap=new Map(),baseDocs=new Map(DB.documents.filter(d=>d.module_kind==='official').map(d=>[d.pcode,d]));
for(const r of DB.article_links||[]){const k=r.pcode+'|'+r.article_key;if(!linkMap.has(k))linkMap.set(k,[]);linkMap.get(k).push(r)}
for(const v of [...(DB.article_versions||[]),...(DB.imported_versions||[])]){const k=v.pcode+'|'+v.article_key;if(!versionMap.has(k))versionMap.set(k,[]);versionMap.get(k).push(v)}
for(const vs of versionMap.values())vs.sort((a,b)=>a.publication_date.localeCompare(b.publication_date)||a.id.localeCompare(b.id));
$('stats').replaceChildren();for(const [n,label]of [[DB.counts.official_volumes,'編技術規則'],[DB.counts.official_articles.toLocaleString(),'條官方條文'],[DB.counts.linked_articles,'條有彙編對應'],[DB.counts.interpretation_groups,'組解釋函分類']]){const s=el('div',undefined,'stat');s.append(el('b',n),el('span',label,'small'));$('stats').append(s)}
const oldRender=render,oldOpen=openUnit,oldShow=showView;let articleMode=true,lastArticle=null;
const lawArticles=index.filter(x=>x.d.module_kind==='official').map(x=>{const vs=versionMap.get(x.d.pcode+'|'+x.u.article_key)||[],v=vs.at(-1);return{...x,u:v?{...x.u,text:v.text,version_id:v.id}:x.u,version:v,text:norm(x.d.title+' '+x.u.heading+' '+(v?.text||x.u.text))}});
// New articles are included even when no archived official unit existed yet.
for(const [k,vs]of versionMap){if(lawArticles.some(x=>x.d.pcode+'|'+x.u.article_key===k))continue;const v=vs.at(-1),d=baseDocs.get(v.pcode);if(!d)continue;lawArticles.push({d,u:{id:v.id,article_key:v.article_key,document_id:d.id,heading:v.heading,text:v.text,source_url:v.source_url},version:v,text:norm(d.title+v.heading+v.text)})}
lawArticles.sort((a,b)=>a.d.number-b.d.number||articleOrder(a.u.article_key,b.u.article_key));
function articleOrder(a,b){const x=a.split('-').map(Number),y=b.split('-').map(Number);return x[0]-y[0]||(x[1]||0)-(y[1]||0)}
function related(d,u,kind='interpretation'){return(linkMap.get(d.pcode+'|'+u.article_key)||[]).filter(r=>r.kind===kind)}
function versions(d,u){return versionMap.get(d.pcode+'|'+u.article_key)||[]}
function articleTitle(d,u){return d.title+' '+u.heading}
const nav=document.querySelector('aside nav'),refnav=button('解釋函與原冊搜尋',()=>enter(false),'nav');refnav.id='referenceNav';nav.insertBefore(refnav,nav.children[1]);
const updatenav=button('新增條文異動',()=>{oldShow('about');$('aboutview').classList.add('hidden');$('updatesview').classList.remove('hidden');document.querySelectorAll('aside .nav').forEach(e=>e.classList.remove('active'));updatenav.classList.add('active')},'nav');updatenav.id='updateNav';nav.insertBefore(updatenav,nav.children[2]);
document.querySelector('[data-view="search"]').textContent='建築技術規則條文';document.querySelector('h1').textContent='查條文，同步閱讀相關解釋函。';document.querySelector('main>.intro').textContent='先選編別或輸入條號，條文下方直接提供年份、解釋令說明及官方圖例連結。';
$('query').placeholder='查詢條號或條文內容，例如：第79條、防火區劃';
const extra=el('label'),linkedOnly=el('input');linkedOnly.type='checkbox';linkedOnly.id='linkedOnly';extra.append(linkedOnly,document.createTextNode('僅列有解釋函的條文'));document.querySelector('.filters').insertBefore(extra,$('clear'));
const updateSection=el('section',undefined,'hidden');updateSection.id='updatesview';document.querySelector('footer').before(updateSection);
const aboutCards=$('aboutview').querySelectorAll('.aboutgrid article');if(aboutCards[1]){aboutCards[1].replaceChildren(el('h3','條文與解釋函對應'),el('p','主查詢按「編別＋條號」列出條文。解釋函依彙編頁首的條文分類建立關聯，排除目錄、索引與停止適用函釋附錄；不以內文任意提到同號條文作直接對應。'),el('p','目前建立 '+DB.counts.interpretation_groups+' 組分類、對應 '+DB.counts.linked_articles+' 條條文。其中 '+(DB.relation_stats.manually_checked_headers||0)+' 頁頁首已核看原 PDF 補正。'+(DB.relation_stats.unmapped_letter_pages?'另有 '+DB.relation_stats.unmapped_letter_pages+' 頁保留在原冊搜尋中，不自動歸類。':'')))}if(aboutCards[3])aboutCards[3].replaceChildren(el('h3','未來新增條文異動'),el('p','以資料夾內「啟動建築技術規則維護.cmd」開啟本機維護模式，即可新增全文、公布日期、施行日期、官方來源與異動說明，預覽新舊差異後寫入同一資料庫。'),el('p','舊版本與異動紀錄持續保留；重新建庫也會保留人工新增版本。一般離線模式可預覽、匯出更新檔。'),link('建庫報告','建築技術規則建庫報告.txt'));
function setVolumeOptions(all){const previous=$('volume').value;$('volume').replaceChildren(new Option(all?'全部冊別':'全部編別',''));for(const d of DB.documents.filter(d=>all||d.module_kind==='official'))$('volume').append(new Option(d.title,d.id));if([...$('volume').options].some(o=>o.value===previous))$('volume').value=previous}
function enter(isArticle){articleMode=isArticle;$('updatesview').classList.add('hidden');oldShow('search');$('kind').closest('label').classList.toggle('hidden',isArticle);extra.classList.toggle('hidden',!isArticle);setVolumeOptions(!isArticle);$('kind').value=isArticle?'official':'letters';page=1;$('volume').value='';render();refnav.classList.toggle('active',!isArticle);document.querySelector('[data-view="search"]').classList.toggle('active',isArticle);updatenav.classList.remove('active')}
showView=function(v){$('updatesview').classList.add('hidden');refnav.classList.remove('active');updatenav.classList.remove('active');if(v==='search')enter(true);else oldShow(v)};
document.querySelectorAll('[data-view]').forEach(e=>e.onclick=()=>showView(e.dataset.view));
render=function(){
 $('results').classList.toggle('article-results',articleMode);if(!articleMode)return oldRender();
 activeTokens=queryTokens();const vol=$('volume').value;
 filtered=lawArticles.filter(x=>(!vol||x.d.id===vol)&&(!linkedOnly.checked||related(x.d,x.u).length)&&activeTokens.every(t=>x.text.includes(t)));
 if($('sort').value==='hits'&&activeTokens.length)filtered.sort((a,b)=>score(b.text)-score(a.text));
 const pages=Math.max(1,Math.ceil(filtered.length/pageSize));page=Math.max(1,Math.min(page,pages));
 $('resultcount').textContent=filtered.length.toLocaleString()+' 條符合 · 下方提供年份與函釋連結';$('results').replaceChildren();
 for(const {u,d,version}of filtered.slice((page-1)*pageSize,page*pageSize)){
  const c=el('article',undefined,'card articlecard');c.dataset.unit=u.id;const rel=related(d,u),vs=versions(d,u);
  const head=el('div',undefined,'articlehead'),h=el('h3');h.append(button(u.heading,()=>openArticle(d,u),'titlebtn'));
  head.append(h,el('span',d.title.replace('建築技術規則',''),'tag official'));c.append(head);
  const table=d.pcode==='D0070115'&&u.article_key==='264'&&availableOfficialVisuals(d,u,version).length?renderVersionReadableBody(d,u,version):renderFormattedLegalText(u.text,$('query').value.trim().split(/\s+/).filter(Boolean));
  if(table)c.append(table);else{
    const p=el('p',undefined,'snippet clause-preview'),preview=u.text;
    p.append(highlight(preview,$('query').value.trim().split(/\s+/)));c.append(p);
  }
  const footer=el('div',undefined,'articlefooter'),badges=el('div',undefined,'articlemeta');
  if(rel.length)badges.append(el('span','相關解釋函彙編 '+rel.length+' 組','relcount'));
  if(vs.length>1)badges.append(el('span',vs.length+' 版可比較','relcount'));
  footer.append(el('p','公布版次 '+(version?.publication_date||d.header_dates.at(-1)),'meta'),badges);c.append(footer);
  const a=el('div',undefined,'actions');c.append(renderArticleResources(d,u));$('results').append(c)
 }
 if(!filtered.length)$('results').append(el('p','沒有符合條件的條文，請調整關鍵字或編別。','empty'));
 $('pagination').replaceChildren();if(pages>1){const a=button('上一頁',()=>{page--;render()}),b=button('下一頁',()=>{page++;render()});a.disabled=page===1;b.disabled=page===pages;$('pagination').append(a,el('span',page+' / '+pages),b)}
};
linkedOnly.onchange=()=>{page=1;render()};$('clear').onclick=()=>{$('query').value='';$('volume').value='';$('kind').value=articleMode?'official':'';$('sort').value='source';linkedOnly.checked=false;page=1;render()};
openUnit=function(id){const x=lawArticles.find(x=>x.u.id===id)||(units.has(id)?lawArticles.find(x=>x.d.id===units.get(id).document_id&&x.u.article_key===units.get(id).article_key):null);if(x)return openArticle(x.d,x.u);oldOpen(id);if(lastArticle)$('detailbody').prepend(button('← 返回 '+lastArticle.u.heading+' 與解釋函',()=>openArticle(lastArticle.d,lastArticle.u)))};
function groupElement(r,compactView=false){const d=docs.get(r.document_id),box=el('article',undefined,'relatedgroup');box.dataset.link=r.id;if(r.kind==='interpretation'){const links=el('div',undefined,'actions');for(const record of interpretationRecords(r)){const d0=baseDocs.get(r.pcode),u0=lawArticles.find(x=>x.d.pcode===r.pcode&&x.u.article_key===r.article_key)?.u;if(d0&&u0)links.append(button((record.referenceOnly?'彙編說明':record.subject.slice(0,70)),()=>openInterpretation(d0,u0,record.id)))}box.append(links)}box.append(el('b',r.label),el('p',d.title+'｜PDF '+r.page_start+(r.page_end!==r.page_start?'–'+r.page_end:'')+' 頁','meta'));if(r.subjects?.length)for(const s of r.subjects.slice(0,3))box.append(el('p','主旨：'+s,'relatedpreview'));const first=units.get(r.unit_ids[0]);if(first&&!compactView)box.append(el('p',first.text.slice(0,850)+(first.text.length>850?'…':''),'relatedpreview'));const a=el('div',undefined,'actions');a.append(link('開啟原 PDF',d.source_relative+'#page='+r.page_start),button('逐頁閱讀',()=>openUnit(r.unit_ids[0])));box.append(a);if(!compactView){const detail=el('details');detail.append(el('summary','展開本組全文（'+r.unit_ids.length+' 頁，含跨頁內容）'));detail.ontoggle=()=>{if(!detail.open||detail.dataset.loaded)return;detail.dataset.loaded='1';for(const id of r.unit_ids){const u=units.get(id);detail.append(el('p','PDF 第'+u.page_start+'頁','meta'),el('pre',u.text,'reading'))}};box.append(detail)}return box}
function openArticle(d,u,selectedVersionId){
 lastArticle={d,u};const body=$('detailbody'),vs=versions(d,u),v=vs.find(v=>v.id===selectedVersionId)||vs.at(-1),rel=related(d,u),selectedIndex=vs.indexOf(v),previous=selectedIndex>0?vs[selectedIndex-1]:null;
 $('detailtitle').textContent=articleTitle(d,u)+(v?'｜'+v.publication_date+' 版':'');body.replaceChildren();
 body.append(el('p','已收錄公布版次：'+(v?.publication_date||d.header_dates.at(-1))+(v?.effective_date?'｜施行日期：'+v.effective_date:''),'meta'));
 const actions=el('div',undefined,'actions');actions.append(link('該年份官方條文',v?.source_url||sourceUrl(d,u)),button('新增本條異動',()=>{$('detail').close();editVersion(d,u)}),button('列印本條及關聯資料',()=>window.print()));body.append(actions);
 const warning=v?.source_kind==='user_import'?(v.effective_warning||''):(v?.effective_warning||(v?.document_id===d.id?u.effective_warning:''));if(warning)body.append(el('p',warning,'pending'));
 if(v?.effective_date&&v.effective_date>new Date().toLocaleDateString('sv-SE'))body.append(el('p','本新增版本尚未到所填施行日期；請於下方比較較早版本。','pending'));
 const grid=el('div',undefined,'articlelayout'),left=el('section',undefined,'version-reading'),right=el('details');left.id='articleText';right.id='articleLetters';
 left.append(el('h3','條文全文'));const content=renderVersionReadableBody(d,u,v);left.append(content);
 if(previous&&v&&previous.text!==v.text){left.prepend(el('p','本版新增文字以綠底標記；刪除內容及完整差異列於下方年份比對。','version-reading-note'));markVisibleVersionChanges(content,previous,v)}
 appendOfficialFigures(left,d,u,v);
 const letterSummary=el('summary','解釋令、函釋與說明（'+rel.length+' 組來源）'),foldState=el('span','展開','fold-state');letterSummary.append(foldState);right.append(letterSummary);right.ontoggle=()=>{foldState.textContent=right.open?'收合':'展開'};
 if(rel.length){right.append(el('p','下方連結提供各件主旨、原文說明摘錄與彙編 PDF。','small'));for(const r of rel)right.append(groupElement(r))}else right.append(el('p','目前收錄資料未建立本條的解釋令連結。','small'));
 grid.append(left,right);body.append(grid,renderArticleResources(d,u,v?.id));renderVersionsFor(body,d,u,vs,selectedVersionId);
 const refs=related(d,u,'revision_reference');if(refs.length){const sec=foldPanel('歷年修正原文與修正說明（彙編）','revisionReferences');sec.append(el('p','以下保留修正彙編原頁。','small'));for(const r of refs)sec.append(groupElement(r,true));body.append(sec)}
 if(!$('detail').open)$('detail').showModal();$('detail').scrollTop=0;
}

function diffSegments(a,b){if(a===b)return[['equal',a]];let prefix=0;while(prefix<a.length&&prefix<b.length&&a[prefix]===b[prefix])prefix++;let end=0;while(end<a.length-prefix&&end<b.length-prefix&&a[a.length-1-end]===b[b.length-1-end])end++;const x=Array.from(a.slice(prefix,a.length-end)),y=Array.from(b.slice(prefix,b.length-end)),out=[];if(prefix)out.push(['equal',a.slice(0,prefix)]);if(x.length*y.length<=1500000){const width=y.length+1,dp=new Uint32Array((x.length+1)*width);for(let i=x.length-1;i>=0;i--)for(let j=y.length-1;j>=0;j--)dp[i*width+j]=x[i]===y[j]?1+dp[(i+1)*width+j+1]:Math.max(dp[(i+1)*width+j],dp[i*width+j+1]);let i=0,j=0;while(i<x.length||j<y.length){if(i<x.length&&j<y.length&&x[i]===y[j]){out.push(['equal',x[i]]);i++;j++}else if(i<x.length&&(j===y.length||dp[(i+1)*width+j]>=dp[i*width+j+1]))out.push(['delete',x[i++]]);else out.push(['insert',y[j++]])}}else{if(x.length)out.push(['delete',x.join('')]);if(y.length)out.push(['insert',y.join('')])}if(end)out.push(['equal',a.slice(a.length-end)]);const merged=[];for(const [tag,text]of out){if(merged.at(-1)?.[0]===tag)merged.at(-1)[1]+=text;else merged.push([tag,text])}return merged}
function showDiff(host,a,b,stored){host.replaceChildren();const note=b.note||stored?.editor_note;host.append(el('h3','異動說明'),el('p',note||(a.text===b.text?'所選兩版條文文字相同。':'以下以紅色刪線及綠底標記兩版條文的不同處。'),'notice'));if(b.effective_date)host.append(el('p','填列施行日期：'+b.effective_date,'meta'));if(stored?.summary?.length){const ul=el('ul');for(const s of stored.summary)ul.append(el('li',s));const det=el('details');det.append(el('summary','文字差異摘錄'),ul);host.append(det)}host.append(el('p','紅色刪線：舊版文字；綠底：新版文字。文字差異不直接代表法律適用結論。','small'));const seg=stored&&stored.before_text===a.text&&stored.after_text===b.text?stored.segments:diffSegments(a.text,b.text),diff=el('div',undefined,'difftext');for(const [tag,text]of seg)diff.append(tag==='equal'?document.createTextNode(text):el(tag==='insert'?'ins':'del',text));host.append(diff);const parallel=el('details');parallel.append(el('summary','展開新舊全文並列'));const grid=el('div',undefined,'parallel');for(const v of [a,b]){const col=el('div');col.append(el('b',v.publication_date+(v.source_kind==='user_import'?'（人工新增）':'')),renderFormattedLegalText(v.text)||el('pre',v.text,'reading'),link('版本來源',v.source_url));grid.append(col)}parallel.append(grid);host.append(parallel)}
function foldPanel(title,id){const sec=el('details',undefined,'versionpanel foldable-panel');sec.id=id;const summary=el('summary',title),state=el('span','展開','fold-state');summary.append(state);sec.append(summary);sec.ontoggle=()=>{state.textContent=sec.open?'收合':'展開'};return sec}
function renderVersionsFor(body,d,u,vs,selectedId){const sec=foldPanel('條文異動與版本比對','articleVersions');sec.open=!!selectedId&&vs.length>1;if(vs.length<2){if(vs[0]?.note)sec.append(el('p',vs[0].note,'notice'));sec.append(el('p','本條目前僅收錄一個全文版本。新增版本後即可在此比對。','small'));body.append(sec);return}const controls=el('div',undefined,'comparecontrols'),a=el('select'),b=el('select');a.id='beforeVersion';b.id='afterVersion';a.setAttribute('aria-label','舊版條文');b.setAttribute('aria-label','新版條文');for(const v of vs){const label=v.publication_date+(v.source_kind==='user_import'?'（人工新增）':'（官方封存）');a.append(new Option(label,v.id));b.append(new Option(label,v.id))}const selectedIndex=vs.findIndex(v=>v.id===selectedId);a.value=selectedIndex>=0?vs[Math.max(0,selectedIndex-1)].id:vs.at(-2).id;b.value=selectedIndex===0?vs[1].id:selectedIndex>0?vs[selectedIndex].id:vs.at(-1).id;controls.append(el('span','舊版'),a,el('span','新版'),b);sec.append(controls);const target=el('div');target.id='versionComparison';sec.append(target);function draw(){const before=vs.find(v=>v.id===a.value),after=vs.find(v=>v.id===b.value),stored=(DB.article_diffs||[]).find(x=>x.heading===u.heading&&x.before_date===before.publication_date&&x.after_date===after.publication_date&&x.document_id===d.id);showDiff(target,before,after,stored)}a.onchange=b.onchange=draw;draw();body.append(sec)}
function field(label,id,type='text',wide=false){const l=el('label',label,wide?'wide':undefined),input=el(type==='textarea'?'textarea':type==='select'?'select':'input');input.id=id;if(input.tagName==='INPUT')input.type=type;l.append(input);return l}
updateSection.append(el('h2','新增條文版本與異動說明'),el('p','選擇編別與條號，填入新版全文、公布與施行日期、來源及異動說明。先預覽新舊差異，再儲存至共用資料庫。','intro'));
const form=el('form',undefined,'updateform');form.id='versionForm';for(const args of [['編別','updateLaw','select'],['條號（例如 79 或 79-1）','updateArticle'],['公布日期','updateDate','date'],['施行日期（另定時可留空）','updateEffective','date'],['官方來源網址','updateSource','url',true],['新版條文全文','updateText','textarea',true],['異動說明／修正依據／施行註記','updateNote','textarea',true]])form.append(field(...args));$('updatesview').append(form);$('updateText').classList.add('fulltext');for(const [code,d]of baseDocs)$('updateLaw').append(new Option(d.title,code));const buttons=el('div',undefined,'actions wide');buttons.append(button('載入目前條文',loadCurrent),button('預覽差異',previewUpdate),button('寫入共用資料庫',saveUpdate,'primary'),button('匯出條文更新檔',exportUpdate));form.append(buttons);const status=el('p',location.protocol==='file:'?'目前為離線查詢模式。可預覽與匯出更新檔；要寫入共用資料庫，請開啟資料夾內「啟動建築技術規則維護.cmd」。':'可預覽異動後寫入本資料夾的共用資料庫。','artifactstatus wide');status.id='updateStatus';form.append(status);const preview=el('section',undefined,'updatepreview');preview.id='updatePreview';updateSection.append(preview);form.onsubmit=e=>e.preventDefault();
function editVersion(d,u){updatenav.click();$('updateLaw').value=d.pcode;$('updateArticle').value=u.article_key;loadCurrent()}
function loadCurrent(){const key=$('updateArticle').value.trim().replace(/^第|條$/g,''),vs=versionMap.get($('updateLaw').value+'|'+key)||[];if(!vs.length){$('updateText').value='';$('updateStatus').textContent='尚未收錄本條，可直接新增全文與資料來源。';return}const v=vs.at(-1);$('updateText').value=v.text;$('updateSource').value=v.source_url;$('updateNote').value='';$('updateStatus').textContent='已載入 '+v.publication_date+' 版本，請填入新公布日期並修改全文。'}
function updateRecord(){const article=$('updateArticle').value.trim().replace(/^第|條$/g,''),date=$('updateDate').value,source=$('updateSource').value.trim(),text=$('updateText').value.trim();if(!/^\d+(?:-\d+)?$/.test(article))throw Error('請輸入正確條號，例如 79 或 79-1。');if(!date||!text||!source)throw Error('請填入公布日期、官方來源與新版全文。');const url=new URL(source);if(url.protocol!=='https:')throw Error('來源網址請使用 https。');return{pcode:$('updateLaw').value,article_key:article,publication_date:date,effective_date:$('updateEffective').value||null,source_url:source,text,note:$('updateNote').value.trim()}}
function previewUpdate(){try{const r=updateRecord(),vs=versionMap.get(r.pcode+'|'+r.article_key)||[],before=vs.filter(v=>v.publication_date<r.publication_date).at(-1)||vs.at(-1)||{publication_date:'尚未收錄',text:'',source_url:r.source_url};showDiff(preview,before,r);return r}catch(e){toast(e.message);return null}}
function exportUpdate(){const r=previewUpdate();if(!r)return;const url=URL.createObjectURL(new Blob([JSON.stringify({format:'building-technical-update-v1',records:[r]},null,2)],{type:'application/json'})),a=link('下載',url);a.download='建築技術規則_條文更新_'+r.publication_date+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
const importFile=el('input');importFile.type='file';importFile.accept='.json';importFile.hidden=true;importFile.id='versionUpdateFile';buttons.append(button('讀取條文更新檔',()=>importFile.click()),importFile);importFile.onchange=async()=>{try{const payload=JSON.parse(await importFile.files[0].text());if(payload.format!=='building-technical-update-v1'||!Array.isArray(payload.records)||payload.records.length!==1)throw Error('此表單一次讀取一條，請選擇本系統匯出的單條更新檔。');const r=payload.records[0];if(!baseDocs.has(r.pcode))throw Error('編別不正確');$('updateLaw').value=r.pcode;for(const [id,key]of [['updateArticle','article_key'],['updateDate','publication_date'],['updateEffective','effective_date'],['updateSource','source_url'],['updateText','text'],['updateNote','note']])$(id).value=r[key]||'';previewUpdate();status.textContent='已讀取更新檔，請核對差異後寫入共用資料庫。'}catch(e){toast(e.message)}finally{importFile.value=''}};
async function saveUpdate(){const r=previewUpdate();if(!r)return;if(location.protocol==='file:'){status.textContent='預覽已完成。請以資料夾內「啟動建築技術規則維護.cmd」開啟後寫入共用資料庫；亦可匯出更新檔留存。';return}status.textContent='正在寫入共用資料庫並更新查詢頁面…';try{const response=await fetch('/api/technical/updates',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({records:[r]})}),result=await response.json();if(!response.ok)throw Error(result.error||'儲存失敗');status.textContent='已寫入共用資料庫。正在重新載入條文與版本比對…';location.hash=new URLSearchParams({pcode:r.pcode,article:r.article_key});location.reload()}catch(e){status.textContent=e.message}}
// Volume searches remain available as a secondary route.
for(const c of $('volumes').children){const b=[...c.querySelectorAll('button')].find(b=>b.textContent==='查詢本冊');if(b){const d=DB.documents.find(d=>d.title===c.querySelector('h3').textContent);b.onclick=()=>{enter(false);$('kind').value='';$('volume').value=d.id;page=1;render()}}}
window.technicalApp={...window.technicalApp,openUnit,openArticle:(pcode,key,versionId)=>{const x=lawArticles.find(x=>x.d.pcode===pcode&&x.u.article_key===key);if(x)openArticle(x.d,x.u,versionId)},openInterpretation:(pcode,key,id)=>{const x=lawArticles.find(x=>x.d.pcode===pcode&&x.u.article_key===key);if(x)openInterpretation(x.d,x.u,id)},render,showView,enter,versionCount:(pcode,key)=>(versionMap.get(pcode+'|'+key)||[]).length,diffSegments};
window.addEventListener('hashchange',openReaderLocation);document.head.append(readingStyle,officialFigureStyle);enter(true);const hash=new URLSearchParams(location.hash.slice(1));if(hash.get('pcode')&&hash.get('letter'))window.technicalApp.openInterpretation(hash.get('pcode'),hash.get('article'),hash.get('letter'));else if(hash.get('pcode'))window.technicalApp.openArticle(hash.get('pcode'),hash.get('article'),hash.get('version'));else if(hash.get('unit'))openUnit(hash.get('unit'));
})();
