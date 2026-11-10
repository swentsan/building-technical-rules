/* Source-order reading diagram. It locates original text; it makes no legal decision. */
(()=>{'use strict';
 const NS='http://www.w3.org/2000/svg',BOX=/[┌┐└┘├┤┬┴┼│─━┃┏┓┗┛┣┫┳┻╋]/u,MATH=/[=＝√∑∫≤≥≦≧]/u;
 const ITEM=/^\s*(?:[一二三四五六七八九十百千零〇]+[、．.]|[（(][一二三四五六七八九十百千零〇\d]+[）)]|\d+[、．.])/u;
 let serial=0;
 function shortMath(line){const s=line.trim();return s.length>0&&s.length<=65&&!ITEM.test(s)&&!/[。；;：:，、]/u.test(s)&&/[A-Za-zＡ-Ｚａ-ｚα-ωΑ-Ω\d０-９]/u.test(s)}
 function extract(value){
  const text=String(value??'');if(!text.trim())return[];
  if(/^[（(]?刪除[）)]?[。．.]?$/u.test(text.replace(/\s+/g,'')))return[{id:'part-1',label:'此版已刪除',text,kind:'deleted',start:0,end:text.length}];
  const lines=[];for(const m of text.matchAll(/[^\n]*(?:\n|$)/g)){if(!m[0])continue;lines.push({start:m.index,end:m.index+m[0].length,body:m[0].replace(/\r?\n$/,'')})}
  const groups=[];let start=0,blank=false,lastBody='';
  for(const line of lines){
   const body=line.body.trim(),last=groups.at(-1);
   if(!body){if(last){last.end=line.end;start=line.end}blank=true;lastBody='';continue}
   const boxed=BOX.test(body),formula=MATH.test(body),table=boxed||formula;
   if(table){
    if(last?.kind==='table'){last.end=line.end;last.formula=last.formula||formula}
    else if(formula&&last?.kind==='paragraph'&&shortMath(text.slice(last.start,last.end))){last.kind='table';last.formula=true;last.end=line.end}
    else groups.push({start,end:line.end,kind:'table',formula});
   }else if(last?.kind==='table'&&last.formula&&shortMath(body)&&!blank){last.end=line.end}
   else if(last?.kind==='paragraph'&&!blank&&!ITEM.test(body)&&lastBody&&!/[。；;：:]$/u.test(lastBody)){last.end=line.end}
   else groups.push({start,end:line.end,kind:'paragraph'});
   start=line.end;blank=false;lastBody=body;
  }
  if(groups.length)groups.at(-1).end=text.length;
  let kept=groups;
  if(groups.length>6){const rest=groups.slice(5);kept=[...groups.slice(0,5),{start:rest[0].start,end:text.length,kind:rest.some(p=>p.kind==='table')?'table':'paragraph',includesRemainder:true,sourcePartCount:rest.length}]}
  return kept.map((part,index)=>({id:'part-'+(index+1),label:part.kind==='table'?'表格／公式原文':'原文第'+(index+1)+'段',text:text.slice(part.start,part.end),kind:part.kind,start:part.start,end:part.end,...(part.includesRemainder?{includesRemainder:true,sourcePartCount:part.sourcePartCount}:{})}));
 }
 function element(tag,attrs={},text){const e=document.createElementNS(NS,tag);for(const [name,value]of Object.entries(attrs))if(value!==undefined&&value!==null)e.setAttribute(name,String(value));if(text!==undefined)e.textContent=String(text);return e}
 function add(parent,tag,attrs,text){const e=element(tag,attrs,text);parent.append(e);return e}
 function visibleExcerpt(text,max=40){const plain=String(text).replace(/\s+/g,' ').trim(),chars=Array.from(plain);return chars.slice(0,max).join('')+(chars.length>max?'…':'')}
 function wrap(text,maxUnits=14.6,maxLines=3){const rows=[];let line='',units=0;for(const char of Array.from(text)){const next=/[\x20-\x7e]/.test(char)?0.55:1;if(units+next>maxUnits&&line){rows.push(line);line='';units=0}line+=char;units+=next}if(line)rows.push(line);if(rows.length>maxLines){const kept=rows.slice(0,maxLines);kept[maxLines-1]=kept[maxLines-1].replace(/…?$/,'…');return kept}return rows}
 function textLines(parent,text,x,y,options={}){const attrs={x,y,fill:'#173d39','font-family':'"Microsoft JhengHei",system-ui,sans-serif','font-size':options.size||24,...options.attrs},node=add(parent,'text',attrs);const rows=wrap(text,options.maxUnits||14.6,options.maxLines||3);rows.forEach((row,index)=>add(node,'tspan',{x,dy:index?options.lineHeight||33:0},row));return node}
 function documentIcon(parent,x,y,scale=1,color='#07546d'){
  const group=add(parent,'g',{transform:'translate('+x+' '+y+') scale('+scale+')','aria-hidden':'true'});
  add(group,'path',{d:'M 0 0 H 25 L 38 13 V 49 H 0 Z',fill:'#fffdf6',stroke:color,'stroke-width':2.6,'stroke-linejoin':'round'});
  add(group,'path',{d:'M 25 0 V 13 H 38',fill:'none',stroke:color,'stroke-width':2.6});
  for(const yy of [22,30,38])add(group,'line',{x1:8,y1:yy,x2:30,y2:yy,stroke:color,'stroke-width':2.6,'stroke-linecap':'round'});
  return group;
 }
 function render({heading='',text='',date='',onSelect}={}){
  const source=String(text??''),parts=extract(source),rows=Math.max(1,Math.ceil(parts.length/2)),height=parts[0]?.kind==='deleted'?390:rows*200+100,uid='article-reading-map-'+(++serial),svg=element('svg',{xmlns:NS,viewBox:'0 0 1000 '+height,role:'group','aria-labelledby':uid+'-title','aria-describedby':uid+'-desc',class:'article-reading-map',preserveAspectRatio:'xMidYMid meet'});
  add(svg,'title',{id:uid+'-title'},String(heading||'條文')+'｜原文閱讀圖'+(date?'｜'+date:''));
  add(svg,'desc',{id:uid+'-desc'},'依原始段落閱讀順序排列，不自動判定義務、例外或適用結論。節點可用滑鼠、Enter 或空白鍵選取完整原文。'+(parts.length&&parts.at(-1).includesRemainder?'最後一節保留其後全部原文。':'')+'\n完整原文：\n'+source);
  const defs=add(svg,'defs');const marker=add(defs,'marker',{id:uid+'-arrow',viewBox:'0 0 12 12',refX:10,refY:6,markerWidth:9,markerHeight:9,orient:'auto-start-reverse',markerUnits:'userSpaceOnUse'});add(marker,'path',{d:'M 1 1 L 11 6 L 1 11 Z',fill:'#6c8a79'});
  add(svg,'style',{},'.article-reading-map .reading-map-node{cursor:pointer;outline:none}.article-reading-map .reading-map-node:hover .reading-node-body{fill:#eef3e5}.article-reading-map .reading-map-node:focus-visible .reading-node-body{stroke:#b39b4d;stroke-width:5}.article-reading-map .reading-map-node[aria-pressed="true"] .reading-node-body{stroke:#b39b4d;stroke-width:4;fill:#f5f2df}@media(prefers-reduced-motion:reduce){.article-reading-map *{animation:none!important;transition:none!important}}');
  add(svg,'rect',{x:1,y:1,width:998,height:height-2,rx:18,fill:'#f6f7ee',stroke:'#d3ddcf','stroke-width':2,'aria-hidden':'true'});
  textLines(svg,visibleExcerpt(String(heading||'條文')+'｜原文閱讀圖',40),42,39,{size:28,maxUnits:32,maxLines:1,attrs:{'font-weight':700}});
  add(svg,'text',{x:42,y:70,fill:'#5d7469','font-family':'"Microsoft JhengHei",system-ui,sans-serif','font-size':23},date?'所選來源：'+date+'　・　依原文順序選取段落':'依原文順序選取段落');
  if(!parts.length){documentIcon(svg,465,130,1.5,'#7b9184');textLines(svg,'此版本未收錄原文',500,245,{size:27,maxUnits:25,maxLines:1,attrs:{'text-anchor':'middle'}});return svg}
  const nodes=[],w=430,h=156;
  function activate(part,group){for(const node of nodes)node.setAttribute('aria-pressed',String(node===group));if(typeof onSelect==='function')onSelect(part)}
  function interactiveGroup(part,index,x,y,width=w,nodeHeight=h){
   const id=uid+'-part-'+(index+1),group=add(svg,'g',{transform:'translate('+x+' '+y+')',class:'reading-map-node',role:'button',tabindex:0,focusable:'true','aria-label':part.label+'，選取查看完整原文','aria-describedby':id+'-desc','aria-pressed':'false','data-part-id':part.id,'data-kind':part.kind});nodes.push(group);
   add(group,'title',{},part.label+'\n'+part.text);add(group,'desc',{id:id+'-desc'},(part.includesRemainder?'本節含其後 '+part.sourcePartCount+' 個原始區塊。':'')+'完整原文：\n'+part.text);
   add(group,'rect',{x:0,y:0,width,height:nodeHeight,rx:15,fill:'#fffdf6',stroke:'#93ad9b','stroke-width':2.3,class:'reading-node-body'});
   group.addEventListener('click',()=>activate(part,group));group.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '||event.key==='Spacebar'){event.preventDefault();event.stopPropagation();activate(part,group)}});return group;
  }
  if(parts[0].kind==='deleted'){
   const part=parts[0],group=interactiveGroup(part,0,200,110,600,220);documentIcon(group,37,49,1.8,'#6b8174');textLines(group,'此版已刪除',145,78,{size:32,maxUnits:15,maxLines:1,attrs:{'font-weight':700}});textLines(group,'保留刪除狀態，請由版次與沿革查閱歷史原文。',145,127,{size:25,maxUnits:16,maxLines:3,lineHeight:34});return svg;
  }
  const positions=parts.map((part,index)=>{const row=Math.floor(index/2),col=row%2?1-index%2:index%2;return{x:parts.length===1?285:42+col*486,y:92+row*200}});
  for(let index=0;index<positions.length-1;index++){
   const a=positions[index],b=positions[index+1];let x1,y1,x2,y2;
   if(a.y===b.y){const right=b.x>a.x;x1=right?a.x+w+9:a.x-9;x2=right?b.x-9:b.x+w+9;y1=y2=a.y+h/2}
   else{x1=x2=a.x+w/2;y1=a.y+h+9;y2=b.y-9}
   add(svg,'line',{x1,y1,x2,y2,stroke:'#6c8a79','stroke-width':4,'stroke-linecap':'round','marker-end':'url(#'+uid+'-arrow)','aria-hidden':'true'});
  }
  for(const [index,part]of parts.entries()){
   const pos=positions[index],group=interactiveGroup(part,index,pos.x,pos.y);add(group,'circle',{cx:29,cy:31,r:18,fill:'#07546d','aria-hidden':'true'});add(group,'text',{x:29,y:39,'text-anchor':'middle',fill:'#fffdf6','font-family':'system-ui,sans-serif','font-size':24,'font-weight':700,'aria-hidden':'true'},index+1);
   textLines(group,part.label,59,40,{size:25,maxUnits:13,maxLines:1,attrs:{'font-weight':700}});documentIcon(group,w-45,14,.65,part.kind==='table'?'#8d7742':'#5c7d6c');
   textLines(group,visibleExcerpt(part.text),24,78,{size:24,maxUnits:15.5,maxLines:3,lineHeight:32});
  }
  return svg;
 }
 globalThis.ArticleReadingMap={extract,render};
})();
