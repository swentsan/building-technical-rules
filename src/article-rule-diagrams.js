/* Source-bound rule diagrams. No compliance outcome is inferred. */
(() => {'use strict';
const NS='http://www.w3.org/2000/svg';
const ITEM=/^\s*(?:[一二三四五六七八九十百千零〇]+[、．.]|[（(][一二三四五六七八九十百千零〇\d０-９]+[）)]|[\d０-９]+[、．.](?![\d０-９]))/u;
const BOX=/[┌┐└┘├┤┬┴┼│─━┃┏┓┗┛┣┫┳┻╋]/u;
const MATH=/[=＝√∑∫≤≥≦≧]/u;
const REFERENCES=/第[一二三四五六七八九十百千零〇\d]+(?:之[一二三四五六七八九十百千零〇\d]+)?條(?:之[一二三四五六七八九十百千零〇\d]+)?(?:第[一二三四五六七八九十百千零〇\d]+[項款目])*/gu;
const DIGITS='零〇○一二三四五六七八九十百千萬億兩壹貳參肆伍陸柒捌玖拾佰仟\\d０-９';
const NUMBER='[-－−+＋]?['+DIGITS+']+(?:[,，、]\\s*['+DIGITS+']{3})*(?:[.．點点]['+DIGITS+']+)?(?:[eEＥｅ][-－−+＋]?[\\d０-９]+)?';
const FRACTION='(?:['+DIGITS+']+分之\\s*)?'+NUMBER+'(?:\\s*[\\/／]\\s*'+NUMBER+')?';
const QUANTITY=new RegExp(FRACTION+'(?:\\s*[至~～－–]\\s*'+FRACTION+')?\\s*(?:平方公尺|平方公分|立方公尺|立方公分|公尺|公分|毫米|公厘|公頃|平方毫米|小時|分鐘|秒鐘|公斤|公噸|百分比|百分點|[mｍ][²³23]|[mｍ][mｍ]|[kK][gG]|[kK][nN]|[mM][pP][aA]|[kK][pP][aA]|[mM]2|[mM]|％|%|﹪|度|層|人|倍)','gu');
const NUMBER_TAIL=new RegExp('['+DIGITS+'.．點点,，、/／×*^eEＥｅ+＋\\-－−]$','u');
const RATIOS=new RegExp('['+DIGITS+']+分之\\s*'+NUMBER+'|'+NUMBER+'\\s*[\\/／]\\s*'+NUMBER,'gu');
const MODAL=/不得|不應|不准|禁止|應予|應依|應有|應設|應|必須|須|得免|免予|得|可/u;
let serial=0;
const clean=s=>String(s??'').replace(/\s+/g,' ').trim();
const deleted=text=>/^[（(]?刪除[）)]?[。．.]?$/u.test(String(text).replace(/\s+/g,''));
function modalIn(text){for(const match of text.matchAll(new RegExp(MODAL.source,'gu'))){const before=text[match.index-1]||'',after=text[match.index+match[0].length]||'';if(match[0].startsWith('應')&&(/[反相對適供響效呼回]/u.test(before)||/^[力變用急對]/u.test(after)))continue;if(match[0]==='得'&&/[取所獲求可]/u.test(before))continue;if(match[0]==='可'&&/[許認核不無]/u.test(before))continue;return match}return null}
function listRank(text){const s=text.trimStart();if(/^[一二三四五六七八九十百千零〇]+[、．.]/u.test(s))return 1;if(/^[（(][一二三四五六七八九十百千零〇]+[）)]/u.test(s))return 2;if(/^[\d０-９]+[、．.](?![\d０-９])/u.test(s))return 3;if(/^[（(][\d０-９]+[）)]/u.test(s))return 4;return 0}

function blocks(value){
 const text=String(value??'');if(!text)return[{id:'rule-1',start:0,end:0,text:'',kind:'empty'}];
 if(deleted(text))return[{id:'rule-1',start:0,end:text.length,text,kind:'deleted'}];
 const lines=[];for(const m of text.matchAll(/[^\n]*(?:\n|$)/g))if(m[0])lines.push({start:m.index,end:m.index+m[0].length,text:m[0]});
 const grouped=[];let start=0,lastBody='',blank=false;
 for(const line of lines){const body=line.text.trim(),last=grouped.at(-1),boxed=BOX.test(body),math=MATH.test(body);
  if(!body){if(last)last.end=line.end;else start=line.end;blank=true;lastBody='';continue}
  if(boxed){if(last?.kind==='table'&&!blank)last.end=line.end;else grouped.push({start:grouped.length?line.start:0,end:line.end,kind:'table'})}
  else if(math){if(last?.kind==='formula'&&!blank)last.end=line.end;else grouped.push({start:grouped.length?line.start:0,end:line.end,kind:'formula'})}
  else if(last?.kind==='formula'&&!blank&&!ITEM.test(body)&&body.length<100&&!/[。；]/u.test(lastBody))last.end=line.end;
  else if(last?.kind==='prose'&&!blank&&!ITEM.test(body)&&!/[。；;：:]$/u.test(lastBody))last.end=line.end;
  else grouped.push({start:grouped.length?line.start:0,end:line.end,kind:'prose'});
  start=line.end;lastBody=body;blank=false;
 }
 if(!grouped.length)return[{id:'rule-1',start:0,end:text.length,text,kind:'empty'}];
 grouped.at(-1).end=text.length;
 // Sentence boundaries give long clauses their own diagrams; box tables and
 // formula blocks remain intact, even when they contain punctuation.
 const out=[];
 for(const b of grouped){const body=text.slice(b.start,b.end),meta={groupStart:b.start,groupEnd:b.end,groupText:body,listRank:listRank(body)};if(b.kind!=='prose'){out.push({...b,...meta});continue}let at=b.start;
  for(const m of body.matchAll(/[。](?:\s*)/gu)){const end=b.start+m.index+m[0].length;if(end-at>=55&&end<b.end){out.push({start:at,end,kind:'prose',...meta});at=end}}
  if(at<b.end)out.push({start:at,end:b.end,kind:'prose',...meta});
 }
 // Keep any whitespace between blocks in the preceding source interval.
 for(let i=0;i<out.length-1;i++)out[i].end=out[i+1].start;
 return out.map((b,i)=>({...b,id:'rule-'+(i+1),text:text.slice(b.start,b.end)}));
}

function ranges(text,regex,offset){return [...text.matchAll(regex)].map(m=>({text:m[0],start:offset+m.index,end:offset+m.index+m[0].length}))}
function portion(block,start,end){return{text:block.text.slice(start,end),start:block.start+start,end:block.start+end}}
function analyze(value){
 const source=String(value??''),parts=blocks(source),stack=new Map();let previous=null,previousProse=null;
 const firstList=parts.find(p=>p.listRank),preamble=firstList&&firstList.groupStart>0?{text:source.slice(0,firstList.groupStart),start:0,end:firstList.groupStart}:null,definitionArticle=/用語.*定義|名詞.*定義|其定義/u.test(preamble?.text||parts[0]?.text||'');
 return parts.map((part,index)=>{
  const text=part.text,plain=clean(text),references=ranges(text,REFERENCES,part.start),itemPrefix=text.match(ITEM)?.[0]||'',scanStart=part.start+itemPrefix.length,numberText=text.slice(itemPrefix.length),ambiguousItemNumber=!!itemPrefix&&new RegExp('^['+DIGITS+']{3}\\s*(?:平方|立方|公|層|人|倍|度)').test(numberText.trimStart());
  const quantities=[...ranges(numberText,QUANTITY,scanStart),...ranges(numberText,RATIOS,scanStart)].sort((a,b)=>a.start-b.start||b.end-a.end).filter((q,i,all)=>{const prefix=source.slice(Math.max(scanStart,q.start-12),q.start).replace(/\s+/g,''),numericPrefix=(/分之|[\/／]/u.test(q.text)&&/[,，、]$/u.test(prefix))?'':prefix,after=source[q.end]||'';return !(ambiguousItemNumber&&q.start===scanStart+numberText.search(/\S/u))&&!NUMBER_TAIL.test(numericPrefix)&&!/(?:第|民國|分之|負|零下)$/u.test(prefix)&&!(q.text.startsWith('一層')&&/[任每各]$/u.test(prefix))&&!/[\/／]/u.test(after)&&!all.some((r,j)=>j<i&&r.start<=q.start&&r.end>=q.end)});
  const rank=part.listRank||0,group={text:part.groupText||text,start:part.groupStart??part.start,end:part.groupEnd??part.end,rank};
  if(rank&&part.start===group.start)for(const k of [...stack.keys()])if(k>=rank)stack.delete(k);
  const contexts=[];const context=(range,label)=>{if(range&&range.text.trim()&&!(range.start===part.start&&range.end===part.end)&&!contexts.some(c=>c.start===range.start&&c.end===range.end))contexts.push({...range,label})};
  if(rank){context(preamble,'列項之前的原文');for(const [k,parent]of stack)if(k<rank)context(parent,'上層列項原文')}
  if(group.start!==part.start||group.end!==part.end)context(group,'同項完整原文');
  if(part.kind==='formula'||part.kind==='table'){context(preamble,'列項之前的原文');for(const [,parent]of stack)context(parent,'上層列項原文');context(previousProse,'表格／公式之前的原文')}
  if(!rank&&/^\s*前項/u.test(text)&&part.start>0)context({text:source.slice(0,part.start),start:0,end:part.start},'前項完整原文');
  if(/^\s*但/u.test(part.text))context(previous,'轉折之前的原句');
  let category='規範內容',subject=null,requirement=null,exception=null;
  if(part.kind==='deleted')category='刪除狀態';
  else if(part.kind==='table')category='表格對照';
  else if(part.kind==='formula')category='公式與符號';
  else{
   const butMatch=text.match(/(?:^|[，,。；;\n])\s*但/u),but=butMatch?butMatch.index+butMatch[0].lastIndexOf('但'):-1;const mainEnd=but>=0?but:text.length;const main=text.slice(0,mainEnd),modal=modalIn(main);
   if(but>=0)exception=portion(part,but,text.length);
   const colon=definitionArticle&&rank===1?main.indexOf('：'):-1;
   if(colon>=0){subject=portion(part,0,colon+1);requirement=portion(part,colon+1,mainEnd);category='定義與分類'}
   else if(modal){const at=modal.index;
    subject=at>0&&clean(main.slice(0,at)).replace(ITEM,'').trim().length>1?portion(part,0,at):null;
    requirement=portion(part,at,mainEnd);
    category=/^(?:不得|不應|不准|禁止)/u.test(modal[0])?'限制與禁止':/^(?:得|可|免)/u.test(modal[0])?'允許／免除條件':'對象與要求';
   }else if(/所稱|係指|定義|指下列|分為|分類/u.test(main)){category='定義與分類';requirement=portion(part,0,mainEnd)}
   else if(references.length){category='規定與引用';requirement=portion(part,0,mainEnd)}
   else requirement=portion(part,0,mainEnd);
  }
  const inherited=contexts[0]||null;
  const title=plain.match(/^([一二三四五六七八九十百千零〇\d]+[、．.]|[（(][一二三四五六七八九十百千零〇\d]+[）)])/)?.[0]||'第 '+(index+1)+' 組';
  const result={...part,index,category,title,subject,requirement,exception,inherited,contexts,references,quantities,hasComplexScope:!!subject&&/除|非|不|或|且|及|之一|以外/u.test(subject.text)};
  if(rank)stack.set(rank,group);previous=part;if(part.kind==='prose')previousProse=group;
  return result;
 });
}

function node(tag,attrs={},text){const n=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))if(v!==undefined&&v!==null)n.setAttribute(k,String(v));if(text!==undefined)n.textContent=String(text);return n}
function add(parent,tag,attrs,text){const n=node(tag,attrs,text);parent.append(n);return n}
function wrap(value,units){const rows=[];let row='',width=0;for(const ch of Array.from(clean(value))){const w=/[\x20-\x7e]/u.test(ch)?.55:1;if(width+w>units&&row){rows.push(row);row='';width=0}row+=ch;width+=w}if(row)rows.push(row);return rows}
function excerpt(value,units,maxLines){const rows=wrap(value,units);if(rows.length>maxLines){rows.length=maxLines;rows[maxLines-1]=rows[maxLines-1].replace(/[，、；。]?$/u,'…')}return rows}
function lines(parent,rows,x,y,size=25,color='#173d39',lineHeight=35,weight,family='"Microsoft JhengHei",system-ui,sans-serif'){const t=add(parent,'text',{x,y,fill:color,'font-family':family,'font-size':size,'xml:space':'preserve',style:'white-space:pre',...(weight?{'font-weight':weight}:{})});rows.forEach((row,i)=>add(t,'tspan',{x,dy:i?lineHeight:0},row));return t}
function visualUnits(value){return Array.from(String(value)).reduce((n,ch)=>n+(/[\x20-\x7e]/u.test(ch)?.62:1),0)}
function sourceRows(value,units,preserve=false){if(!preserve)return wrap(value,units);const out=[];for(const line of String(value).split(/\r?\n/u)){let row='',used=0;for(const ch of Array.from(line)){const size=/[\x20-\x7e]/u.test(ch)?.62:1;if(row&&used+size>units){out.push(row);row='';used=0}row+=ch;used+=size}out.push(row)}return out}
function render(part,{heading='',date='',compact=false,onSelect}={}){
 const pad=compact?18:28,inner=compact?20:28,bodySize=compact?26:30,bodyLine=compact?43:48,labelSize=compact?19:22,labelLine=compact?28:32,uid='rule-diagram-'+(++serial),cards=[];
 let width=compact?420:920;
 if(part.kind==='table'){const longest=Math.max(0,...String(part.text).split(/\r?\n/u).map(visualUnits));width=Math.max(width,Math.min(1800,Math.ceil(longest*(compact?22:24)+2*(pad+inner))))}
 const w=width-pad*2;
 const all=range=>{if(typeof onSelect==='function')onSelect(range||part)};
 for(const context of part.contexts||[])cards.push({label:context.label,range:context,text:context.text,type:'scope',context:true});
 if(part.kind==='deleted')cards.push({label:'此版本的狀態',range:part,text:'刪除',type:'deleted'},{label:'查閱方式',text:'從版次選單或法規沿革，查閱歷史原文。',type:'note'});
 else if(part.kind==='table')cards.push({label:'表格對照方式',text:'逐列核對分類、條件及對應數值，勿跨列套用。',type:'table',range:part},{label:'完整來源表格',text:part.text,range:part,type:'source',preserve:true});
 else if(part.kind==='formula')cards.push({label:'原式與符號',text:part.text,range:part,type:'formula'},{label:'代入前核對',text:'原式、符號定義、單位與本條上下文須一起讀。圖中不推算缺少的參數。',type:'note'});
 else{
  if(part.subject)cards.push({label:part.category==='定義與分類'?'本項名詞':part.hasComplexScope?'適用範圍與條件':'適用對象／前提',range:part.subject,text:part.subject.text,type:'scope'});
  if(part.requirement)cards.push({label:part.category==='定義與分類'?'定義／分類':part.category==='規定與引用'?'規定與引用':'規定',range:part.requirement,text:part.requirement.text,type:'requirement'});
  if(part.exception)cards.push({label:'但書／附帶條件',range:part.exception,text:part.exception.text,type:'exception'});
  if(!cards.length)cards.push({label:'本條原文',range:part,text:part.text||'未收錄文字',type:'source'});
 }
 const metrics=cards.map(card=>{
  const size=card.preserve?compact?22:24:card.type==='formula'?compact?24:27:bodySize,lineHeight=card.preserve?compact?33:36:card.type==='formula'?compact?38:43:bodyLine;
  const preserve=card.preserve||card.type==='formula',rows=sourceRows(card.text,Math.max(8,preserve?(w-2*inner)/size:Math.floor((w-2*inner)/size)),preserve);
  const labels=wrap(card.label,Math.max(8,Math.floor((w-2*inner-42)/labelSize)));
  return{...card,rows,labels,size,lineHeight,height:48+labels.length*labelLine+18+Math.max(1,rows.length)*lineHeight};
 });
 const detailRows=[];
 if(part.quantities.length)detailRows.push({label:'數值與比例',help:'比較方式與單位請連同原句核對',values:part.quantities});
 if(part.references.length)detailRows.push({label:'引用條號',help:'',values:part.references});
 const detailLayouts=detailRows.map(row=>{const cols=compact?1:2,gap=14,cell=(w-gap*(cols-1))/cols,font=compact?25:28,lineHeight=40,items=row.values.map(q=>({q,rows:wrap(q.text,Math.max(8,Math.floor((cell-36)/font)))})),groups=[];for(let i=0;i<items.length;i+=cols){const cells=items.slice(i,i+cols);groups.push({cells,height:32+Math.max(...cells.map(c=>c.rows.length))*lineHeight})}const labelRows=wrap(row.label,Math.floor(w/(compact?21:24))),helpRows=row.help?wrap(row.help,Math.floor(w/18)):[];return{...row,cols,gap,cell,font,lineHeight,labelRows,helpRows,groups,headingHeight:labelRows.length*34+helpRows.length*29+16,height:28+labelRows.length*34+helpRows.length*29+16+groups.reduce((n,g)=>n+g.height+12,0)}});
 const titleSize=compact?26:30,titleLine=compact?37:43,titleRows=wrap(heading||part.category,Math.max(8,Math.floor(w/titleSize))),metaRows=wrap([date?date+' 原文版次':'',part.title].filter(Boolean).join('  ·  '),Math.floor(w/18)),headHeight=28+titleRows.length*titleLine+metaRows.length*28+24;
 const gap=compact?20:26,height=headHeight+metrics.reduce((n,c)=>n+c.height+gap,0)+detailLayouts.reduce((n,r)=>n+r.height,0)+22;
 const svg=node('svg',{xmlns:NS,viewBox:`0 0 ${width} ${height}`,class:'article-rule-diagram',role:'group','aria-labelledby':uid+'-title','data-rule-kind':part.category,'data-rule-id':part.id});
 add(svg,'title',{id:uid+'-title'},heading+'｜'+part.category+'｜'+part.title);
 add(svg,'desc',{},'按本句用語整理範圍、規定、但書、帶單位數值與引用條號；不自動作合規判定。完整本段原文：\n'+part.text);
 add(svg,'style',{},'.rule-node,.rule-detail{cursor:pointer;outline:none}.rule-node:hover .rule-box{stroke:#80968c}.rule-node:focus-visible .rule-box,.rule-detail:focus-visible .rule-value-box{stroke:#946f25;stroke-width:4}');
 add(svg,'rect',{x:0,y:0,width,height,fill:'#fffdf8'});
 lines(svg,titleRows,pad,28+titleSize,titleSize,'#173d39',titleLine,700);
 lines(svg,metaRows,pad,28+titleRows.length*titleLine+24,18,'#64756c',28);
 let y=headHeight;
 const roles={scope:{fill:'#f0f5f5',bar:'#426c78',ink:'#345b67'},requirement:{fill:'#fff',bar:'#285f50',ink:'#285f50'},exception:{fill:'#fff5df',bar:'#aa7a26',ink:'#866020'},note:{fill:'#f6f7f1',bar:'#83917b',ink:'#5c6e58'},source:{fill:'#fff',bar:'#6a8278',ink:'#52685e'},formula:{fill:'#fff',bar:'#426c78',ink:'#345b67'},table:{fill:'#f0f5f5',bar:'#426c78',ink:'#345b67'},deleted:{fill:'#f5efea',bar:'#8d7768',ink:'#796151'}};
 for(let i=0;i<metrics.length;i++){const c=metrics[i],g=add(svg,'g',{class:'rule-node',role:'button',tabindex:0,'aria-label':c.label+'：'+clean(c.text),'data-source-start':c.range?.start,'data-source-end':c.range?.end});
  const role=roles[c.type];
  add(g,'title',{},c.label+'\n'+c.text);
  add(g,'rect',{x:pad,y,width:w,height:c.height,rx:10,fill:role.fill,stroke:'#d7e1db','stroke-width':1,class:'rule-box'});
  add(g,'rect',{x:pad,y:y+10,width:5,height:c.height-20,rx:2,fill:role.bar});
  lines(g,[String(i+1).padStart(2,'0')],pad+inner,y+24+labelSize,compact?18:20,role.ink,labelLine,700);
  lines(g,c.labels,pad+inner+42,y+24+labelSize,labelSize,role.ink,labelLine,700);
  lines(g,c.rows,pad+inner,y+24+c.labels.length*labelLine+18+c.size,c.size,'#173d39',c.lineHeight,400,c.preserve||c.type==='formula'?'Consolas,"Microsoft JhengHei",monospace':undefined);
  g.addEventListener('click',()=>all(c.range));g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();all(c.range)}});
  y+=c.height+gap;
 }
 for(const row of detailLayouts){y+=28;lines(svg,row.labelRows,pad,y+(compact?21:24),compact?21:24,'#345b4b',34,700);y+=row.labelRows.length*34;if(row.helpRows.length){lines(svg,row.helpRows,pad,y+18,18,'#64756c',29);y+=row.helpRows.length*29}y+=16;
  for(const group of row.groups){group.cells.forEach(({q,rows},i)=>{const x=pad+i*(row.cell+row.gap),g=add(svg,'g',{class:'rule-detail',role:'button',tabindex:0,'aria-label':row.label+'：'+q.text,'data-source-start':q.start,'data-source-end':q.end});add(g,'rect',{x,y,width:row.cell,height:group.height,rx:8,fill:'#f0f5ed',stroke:'#d7e1d2','stroke-width':1,class:'rule-value-box'});lines(g,rows,x+18,y+16+row.font,row.font,'#224a3c',row.lineHeight);add(g,'title',{},q.text);g.addEventListener('click',()=>all(q));g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();all(q)}})});y+=group.height+12}
 }
 return svg;
}
globalThis.ArticleRuleDiagrams={analyze,blocks,render,isDeleted:deleted};
})();
