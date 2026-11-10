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
function lines(parent,rows,x,y,size=25,color='#173d39',lineHeight=35,weight){const t=add(parent,'text',{x,y,fill:color,'font-family':'"Microsoft JhengHei",system-ui,sans-serif','font-size':size,...(weight?{'font-weight':weight}:{})});rows.forEach((row,i)=>add(t,'tspan',{x,dy:i?lineHeight:0},row));return t}
function render(part,{heading='',date='',compact=false,onSelect}={}){
 const width=compact?420:920,pad=compact?18:32,w=width-pad*2,unit=compact?14:30,size=compact?25:28,uid='rule-diagram-'+(++serial),cards=[];
 const all=range=>{if(typeof onSelect==='function')onSelect(range||part)};
 for(const context of part.contexts||[])cards.push({label:context.label+'（點選看全文）',range:context,text:context.text,type:'scope',context:true});
 if(part.kind==='deleted')cards.push({label:'此版本的狀態',range:part,text:'刪除',type:'deleted'},{label:'查閱方式',text:'從版次選單或法規沿革，查閱歷史原文。',type:'note'});
 else if(part.kind==='table')cards.push({label:'原表保持整塊',text:'逐列核對：分類／條件 → 對應欄位數值。勿跨列套用。',type:'table',range:part},{label:'表格來源',text:part.text,range:part,type:'source'});
 else if(part.kind==='formula')cards.push({label:'原式與符號',text:part.text,range:part,type:'formula'},{label:'代入前核對',text:'原式、符號定義、單位與本條上下文須一起讀。圖中不推算缺少的參數。',type:'note'});
 else{
  if(part.subject)cards.push({label:part.category==='定義與分類'?'本項名詞':part.hasComplexScope?'本句範圍（含複合條件）':'本句的對象／前提',range:part.subject,text:part.subject.text,type:'scope'});
  if(part.requirement)cards.push({label:part.category==='定義與分類'?'定義／分類的原句':part.category==='規定與引用'?'本句規定與引用':'本句的規定',range:part.requirement,text:part.requirement.text,type:'requirement'});
  if(part.exception)cards.push({label:'同句但書／附帶條件',range:part.exception,text:part.exception.text,type:'exception'});
  if(!cards.length)cards.push({label:'本條原文',range:part,text:part.text||'未收錄文字',type:'source'});
 }
 const metrics=cards.map(card=>{const rows=excerpt(card.text,unit,card.type==='formula'?5:card.context?3:4);return{...card,rows,height:68+rows.length*(compact?34:38)}});
 const detailRows=[];
 if(part.quantities.length)detailRows.push({label:'數值／比例（比較方式請看原句）',values:part.quantities});
 if(part.references.length)detailRows.push({label:'本段引用條號',values:part.references});
 const detailLayouts=detailRows.map(row=>{const cols=compact?1:2,cell=(w-12*(cols-1))/cols,font=compact?24:27,items=row.values.map(q=>({q,rows:wrap(q.text,Math.floor((cell-24)/font))})),groups=[];for(let i=0;i<items.length;i+=cols){const cells=items.slice(i,i+cols);groups.push({cells,height:20+Math.max(...cells.map(c=>c.rows.length))*34})}return{label:row.label,cols,cell,font,groups,height:42+groups.reduce((n,g)=>n+g.height+10,0)}});
 let height=104+metrics.reduce((n,c)=>n+c.height+40,0)+detailLayouts.reduce((n,r)=>n+r.height,0)+42;
 const svg=node('svg',{xmlns:NS,viewBox:`0 0 ${width} ${height}`,class:'article-rule-diagram',role:'group','aria-labelledby':uid+'-title','data-rule-kind':part.category,'data-rule-id':part.id});
 add(svg,'title',{id:uid+'-title'},heading+'｜'+part.category+'｜'+part.title);
 add(svg,'desc',{},'按本句用語整理範圍、規定、但書、帶單位數值與引用條號；不自動作合規判定。完整本段原文：\n'+part.text);
 add(svg,'style',{},'.rule-node{cursor:pointer;outline:none}.rule-node:hover .rule-box{fill:#eff3e8}.rule-node:focus-visible .rule-box{stroke:#a18439;stroke-width:5}.rule-detail{cursor:pointer}.rule-detail:focus-visible{outline:3px solid #a18439}');
 add(svg,'rect',{x:1,y:1,width:width-2,height:height-2,rx:16,fill:'#f5f7ee',stroke:'#c4d2bf','stroke-width':2});
 lines(svg,[part.category],pad,36,compact?25:29,'#07546d',36,700);
 lines(svg,[date+'｜'+part.title+'／點節點看原句'],pad,72,compact?18:22,'#607168');
 let y=104;
 const fill={scope:'#e5edf0',requirement:'#fffdf6',exception:'#f8efd9',note:'#edf0e4',source:'#fffdf6',formula:'#fffdf6',table:'#e5edf0',deleted:'#f0e8df'};
 for(let i=0;i<metrics.length;i++){const c=metrics[i],g=add(svg,'g',{class:'rule-node',role:'button',tabindex:0,'aria-label':c.label+'：'+clean(c.text),'data-source-start':c.range?.start,'data-source-end':c.range?.end});
  add(g,'title',{},c.label+'\n'+c.text);
  add(g,'rect',{x:pad,y,width:w,height:c.height,rx:12,fill:fill[c.type],stroke:c.type==='exception'?'#a18439':'#739282','stroke-width':2,class:'rule-box'});
  add(g,'circle',{cx:pad+22,cy:y+28,r:11,fill:c.type==='exception'?'#a18439':'#07546d'});
  lines(g,[String(i+1)],pad+22,y+34,16,'#fff',20,700).setAttribute('text-anchor','middle');
  lines(g,[c.label],pad+42,y+35,compact?18:22,'#526b60',28,700);
  lines(g,c.rows,pad+18,y+78,size,'#173d39',compact?34:38);
  g.addEventListener('click',()=>all(c.range));g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();all(c.range)}});
  y+=c.height;
  if(i<metrics.length-1){const next=metrics[i+1],caption=next.type==='exception'?'同句另有條件':part.hasComplexScope?'依原文核對關係':'合併核對原句';
   add(svg,'path',{d:`M ${width/2} ${y+3} v 23 m -6 -7 6 7 6 -7`,fill:'none',stroke:next.type==='exception'?'#a18439':'#739282','stroke-width':2.5,'stroke-dasharray':next.type==='exception'?'5 3':null});
   lines(svg,[caption],width/2+15,y+23,compact?16:19,'#687969');
  }y+=40;
 }
 for(const row of detailLayouts){lines(svg,[row.label],pad,y+2,compact?17:21,'#526b60',28,700);y+=28;
  for(const group of row.groups){group.cells.forEach(({q,rows},i)=>{const x=pad+i*(row.cell+12),g=add(svg,'g',{class:'rule-detail',role:'button',tabindex:0,'aria-label':row.label+'：'+q.text,'data-source-start':q.start,'data-source-end':q.end});add(g,'rect',{x,y,width:row.cell,height:group.height,rx:7,fill:'#e3ecdf',stroke:'#adc2aa'});lines(g,rows,x+12,y+31,row.font,'#173d39',34);add(g,'title',{},q.text);g.addEventListener('click',()=>all(q));g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();all(q)}})});y+=group.height+10}y+=14;
 }
 return svg;
}
globalThis.ArticleRuleDiagrams={analyze,blocks,render,isDeleted:deleted};
})();
