/* Code-native architectural teaching scenes. Geometry is conceptual, never a compliance test. */
(()=>{'use strict';
 const NS='http://www.w3.org/2000/svg',C={ink:'#173d39',teal:'#07546d',paper:'#fffdf6',sage:'#dfead7',gold:'#b39b4d',goldLight:'#f5e8b7',blue:'#d9eaf0',rose:'#e9cbb4',muted:'#65796e',line:'#b9cbbc',white:'#ffffff'};
 let serial=0;
 const node=(tag,attrs={},text)=>{const e=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))if(v!==undefined)e.setAttribute(k,String(v));if(text!==undefined)e.textContent=text;return e};
 const add=(p,...children)=>{p.append(...children);return children.at(-1)};
 function render(scene='generic',options={}){
  const names={stairs:'樓梯與平臺',parking:'停車空間',compartment:'防火區劃',evacuation:'通行與避難動線',daylight:'居室與採光開口',accessibility:'無障礙通行',shelter:'防空避難設備空間',height:'建築物高度',generic:'條文觀察與查證'};
  if(!Object.hasOwn(names,scene))scene='generic';
  const variant=String(options.variant||''),variantNames={'34':'兩個梯段與中間平臺','76':'防火門的門扇、門框與關閉','90':'避難層屋外出入口與道路','92':'走廊地面高低差','95':'兩座直通樓梯與共同路徑'},variantScene={'34':'stairs','76':'compartment','90':'evacuation','92':'evacuation','95':'evacuation'},displayName=(variantScene[variant]===scene&&variantNames[variant])||names[scene];
  const id='article-scene-'+(++serial),step=((Number(options.step)||0)%3+3)%3,focus=String(options.focus||''),title=String(options.title||displayName);
  const svg=node('svg',{xmlns:NS,viewBox:'0 0 720 460',width:720,height:460,style:'display:block;width:100%;height:auto;max-width:100%',role:'img','aria-labelledby':id+'-title '+id+'-desc',preserveAspectRatio:'xMidYMid meet'});
  svg.dataset.scene=scene;svg.dataset.variant=variant;svg.dataset.step=step;svg.dataset.focus=focus;
  add(svg,node('title',{id:id+'-title'},title+'｜'+displayName+'概念示意'),node('desc',{id:id+'-desc'},'以建築幾何、人物與箭頭協助觀察條文。圖形不按比例；沒有表示法定尺寸或個案符合性，應配合所選版本原文核對。'));
  const defs=node('defs'),arrow=node('marker',{id:id+'-arrow',viewBox:'0 0 10 10',refX:8,refY:5,markerWidth:7,markerHeight:7,orient:'auto-start-reverse',markerUnits:'strokeWidth'});
  add(arrow,node('path',{d:'M1 1L9 5L1 9Z',fill:C.teal}));add(defs,arrow);add(svg,defs);
  add(svg,node('rect',{x:2,y:2,width:716,height:456,rx:22,fill:C.paper,stroke:C.line,'stroke-width':2}));
  const g=node('g',{'stroke-linecap':'round','stroke-linejoin':'round','font-family':'Microsoft JhengHei UI, Microsoft JhengHei, system-ui, sans-serif'});add(svg,g);
  const rect=(x,y,w,h,fill=C.white,stroke=C.ink,sw=3,rx=0)=>add(g,node('rect',{x,y,width:w,height:h,rx,fill,stroke,'stroke-width':sw}));
  const line=(x1,y1,x2,y2,stroke=C.ink,sw=3,dash)=>add(g,node('line',{x1,y1,x2,y2,stroke,'stroke-width':sw,'stroke-dasharray':dash}));
  const path=(d,fill='none',stroke=C.ink,sw=3,extra={})=>add(g,node('path',{d,fill,stroke,'stroke-width':sw,...extra}));
  const polygon=(points,fill,stroke=C.ink,sw=3)=>add(g,node('polygon',{points:points.map(p=>p.join(',')).join(' '),fill,stroke,'stroke-width':sw}));
  const circle=(cx,cy,r,fill=C.white,stroke=C.ink,sw=3)=>add(g,node('circle',{cx,cy,r,fill,stroke,'stroke-width':sw}));
  const text=(x,y,label,size=20,fill=C.ink,anchor='start',weight=500)=>add(g,node('text',{x,y,fill,'font-size':size,'text-anchor':anchor,'font-weight':weight},label));
  const active=(index,...words)=>step===index||words.some(w=>w&&focus.includes(w));
  const pill=(x,y,label,index=0)=>{const w=Math.max(78,Array.from(label).length*19+26);rect(x,y-25,w,37,active(index,label)?C.goldLight:C.paper,C.line,1.5,12);text(x+w/2,y,label,18,C.ink,'middle',600);return w};
  const dim=(x1,y1,x2,y2,label,lx,ly,index=0)=>{line(x1,y1,x2,y2,active(index,label)?C.gold:C.teal,2.5);const a=node('line',{x1,y1,x2,y2,stroke:C.teal,'stroke-width':2,'marker-start':'url(#'+id+'-arrow)','marker-end':'url(#'+id+'-arrow)'});add(g,a);if(label)text(lx??(x1+x2)/2,ly??(y1+y2)/2-10,label,18,C.teal,'middle',600)};
  const flow=(d,index=1)=>path(d,'none',active(index,'動線','路線')?C.teal:C.muted,5,{'stroke-dasharray':'10 8','marker-end':'url(#'+id+'-arrow)'});
  const person=(x,y,scale=.85,point=false)=>{
   const p=node('g',{transform:'translate('+x+' '+y+') scale('+scale+')'});add(g,p);
   add(p,node('circle',{cx:0,cy:-61,r:15,fill:'#f0d6bc',stroke:C.ink,'stroke-width':3}),node('path',{d:'M-17-66Q-15-83 0-84Q15-83 17-66Z',fill:C.goldLight,stroke:C.ink,'stroke-width':3}),node('path',{d:'M-21-66H21',stroke:C.ink,'stroke-width':3}),node('circle',{cx:5,cy:-61,r:1.7,fill:C.ink}),node('path',{d:'M1-54Q5-51 9-54',fill:'none',stroke:C.ink,'stroke-width':1.5}),node('path',{d:'M-12-43Q0-48 12-43L15-12H-15Z',fill:C.sage,stroke:C.ink,'stroke-width':3}),node('path',{d:'M-7-12L-9 10H-20M8-12L11 10H23',fill:'none',stroke:C.ink,'stroke-width':4}),node('path',{d:point?'M12-37L31-48L43-44M-12-36L-24-15':'M12-37L25-16M-12-37L-25-17',fill:'none',stroke:C.ink,'stroke-width':4}));
  };
  const car=(x,y,color=C.blue)=>{
   const p=node('g',{transform:'translate('+x+' '+y+')'});add(g,p);
   for(const [wx,wy]of [[-5,18],[-5,77],[67,18],[67,77]])add(p,node('rect',{x:wx,y:wy,width:10,height:25,rx:4,fill:C.ink}));
   add(p,node('rect',{x:0,y:0,width:72,height:120,rx:17,fill:color,stroke:C.ink,'stroke-width':3}),node('path',{d:'M10 23Q36 13 62 23L59 44H13Z',fill:'#f6faf8',stroke:C.ink,'stroke-width':2}),node('path',{d:'M13 85H59L62 103Q36 111 10 103Z',fill:'#f6faf8',stroke:C.ink,'stroke-width':2}),node('rect',{x:15,y:48,width:42,height:31,rx:6,fill:C.paper,stroke:C.ink,'stroke-width':2}));
  };
  const caption=(label)=>{line(30,411,690,411,C.line,1.5);text(360,438,label||'概念示意・不按比例・尺寸與適用條件請核對所選條文',15,C.muted,'middle')};

  if(scene==='stairs'&&variant==='34'){
   rect(91,77,126,91,active(0,'梯寬')?C.goldLight:C.white,C.line,2,5);for(let y=95;y<165;y+=18)line(91,y,217,y,C.teal,2);dim(96,63,212,63,'梯寬 W',154,49,0);text(154,191,'平面觀察',16,C.muted,'middle');
   let first='M80 355';for(let i=0;i<5;i++)first+='h43v-25';first+='h126v22H315L102 377H80Z';path(first,C.sage,C.ink,4);
   let upper='M421 230';for(let i=0;i<5;i++)upper+='h36v-25';upper+='h49v22H621L442 252H421Z';path(upper,C.sage,C.ink,4);
   rect(295,230,126,22,active(1,'平臺')?C.goldLight:C.blue,active(1,'平臺')?C.gold:C.teal,4,2);line(295,229,421,229,active(1,'平臺')?C.gold:C.teal,7);
   dim(62,351,62,235,'',0,0,0);text(38,291,'高度',17,C.teal,'middle');dim(672,224,672,112,'',0,0,0);text(677,260,'高度',17,C.teal,'middle');
   dim(303,280,413,280,'平臺深度 D',358,309,1);pill(290,363,'中間平臺',1);line(356,339,356,321,C.line,2,'5 5');pill(400,59,'逐段檢查高度',0);line(546,74,625,147,C.line,2,'5 5');
   person(139,322,.75,true);person(357,218,.74);person(623,96,.76);text(505,385,'兩個梯段分別觀察',18,C.ink,'middle');caption('第34條概念示意｜梯段高度依第33條欄位核對，平臺深度與梯寬一併檢查');
  }else if(scene==='compartment'&&variant==='76'){
   line(70,352,653,352,C.ink,4);pill(135,74,'常閉式',0);pill(449,74,'常開式',1);
   rect(132,126,154,225,C.paper,active(0,'門框')?C.gold:C.ink,5,3);rect(140,136,138,207,C.blue,C.teal,3,1);line(144,141,144,340,C.ink,3);
   rect(160,142,52,13,active(0,'閉門器')?C.goldLight:C.paper,C.ink,2,3);path('M184 155L207 171L229 150','none',C.ink,2.5);circle(258,239,5,C.gold,C.ink,1.5);line(246,239,259,239,C.ink,3);circle(143,190,3,C.ink,'none');circle(143,291,3,C.ink,'none');person(88,343,.72,true);
   rect(435,126,155,225,C.paper,active(1,'門框')?C.gold:C.ink,5,3);rect(443,134,139,209,'#edf3e8',C.line,1.5,1);rect(460,142,54,13,active(1,'閉門器')?C.goldLight:C.paper,C.ink,2,3);
   if(step===2){rect(443,136,139,207,C.goldLight,C.teal,3,1);line(447,141,447,340,C.ink,3);circle(565,239,5,C.gold,C.ink,1.5);line(553,239,566,239,C.ink,3);path('M482 155L505 171L527 150','none',C.ink,2.5);text(514,111,'訊號後關閉示意',17,C.teal,'middle',600)}
   else{polygon([[443,137],[359,169],[359,366],[443,342]],active(1,'門扇')?C.goldLight:C.rose,C.teal,3);path('M579 352Q483 404 359 368','none',C.teal,2.5,{'stroke-dasharray':'7 6','marker-end':'url(#'+id+'-arrow)'});circle(374,264,4,C.gold,C.ink,1.5);path('M487 155L465 171L418 156','none',C.ink,2.5)}
   pill(83,390,'門扇／門框',0);pill(463,390,step===2?'自動關閉觀察':'開啟範圍',2);line(209,365,209,347,C.line,2,'5 5');caption('第76條概念示意｜分清門的類型，再核對開啟、關閉及例外條件；不是產品認證');
  }else if(scene==='evacuation'&&variant==='92'){
   path('M90 329V103H634V252','none',C.ink,5);line(90,103,634,103,C.ink,5);polygon([[90,329],[288,329],[480,252],[634,252],[634,280],[486,280],[294,357],[90,357]],active(1,'坡')?C.goldLight:C.sage,C.ink,4);
   path('M288 329H386V252H480','none',active(0,'高低差')?C.gold:C.muted,3,{'stroke-dasharray':'7 6'});person(196,319,.85,true);person(559,243,.85);pill(123,75,'走廊',0);pill(399,75,'用途／寬度另查表',2);
   dim(302,337,472,270,'坡道觀察',403,362,1);pill(271,179,'高低差位置',0);line(357,190,386,270,C.line,2,'5 5');pill(103,391,'走廊地面',1);text(501,204,'銜接不同高度',19,C.ink,'middle');caption('第92條第3款｜此圖聚焦走廊高低差；坡度、用途與寬度條件須回原文核對');
  }else if(scene==='evacuation'&&variant==='95'){
   rect(72,111,576,254,C.white,C.ink,5,5);rect(112,140,113,88,active(2,'樓梯')?C.goldLight:C.sage,C.teal,3,2);rect(493,140,113,88,active(2,'樓梯')?C.goldLight:C.sage,C.teal,3,2);
   for(let y=153;y<223;y+=14){line(118,y,219,y,C.teal,2);line(499,y,600,y,C.teal,2)}pill(95,84,'直通樓梯 A',2);pill(479,84,'直通樓梯 B',2);
   rect(278,291,154,66,C.paper,C.line,2,4);line(335,291,377,291,C.paper,5);person(351,344,.58);pill(91,331,'居室任一點',0);line(228,317,312,324,C.line,2,'5 5');
   path('M355 308V255','none',active(0,'共同')?C.gold:C.teal,7,{'stroke-dasharray':'7 6','marker-end':'url(#'+id+'-arrow)'});flow('M355 255H169V233',1);flow('M355 255H550V233',1);circle(355,255,8,C.goldLight,C.ink,2);pill(300,208,'分岔點',1);line(353,222,355,245,C.line,2,'5 5');pill(459,322,'共同路徑 L',0);line(459,304,370,284,C.line,2,'5 5');
   text(358,391,'共同段與分岔後路徑分開觀察',19,C.ink,'middle');caption('第95條概念示意｜先核對設置條件；共同路徑須搭配第93條規定檢查');
  }else if(scene==='evacuation'&&variant==='90'){
   rect(48,365,614,37,active(2,'道路')?C.goldLight:'#e2e5df',C.line,2,3);rect(587,73,75,328,active(2,'道路')?C.goldLight:'#e2e5df',C.line,2,3);line(54,384,249,384,C.white,3,'15 12');line(433,384,583,384,C.white,3,'15 12');line(625,83,625,353,C.white,3,'15 12');text(338,394,'道路（示意）',18,C.ink,'middle');
   rect(173,111,343,215,C.white,C.ink,5,3);rect(286,134,114,85,active(0,'樓梯')?C.goldLight:C.sage,C.teal,3,2);for(let y=146;y<216;y+=14)line(293,y,393,y,C.teal,2);pill(259,81,'直通樓梯',0);text(345,304,'避難層',21,C.ink,'middle',700);
   line(173,229,173,272,C.paper,10);line(516,229,516,272,C.paper,10);line(173,226,173,232,C.teal,6);line(173,270,173,276,C.teal,6);line(516,226,516,232,C.teal,6);line(516,270,516,276,C.teal,6);
   flow('M344 218V251H113V372',1);flow('M344 251H610V122',1);person(344,244,.61,true);pill(64,197,'屋外出口',1);pill(451,197,'屋外出口',1);pill(255,351,'接通道路的路徑',2);line(254,345,125,329,C.line,2,'5 5');
   caption('第90條概念示意｜先核對適用條件，屋外出入口與通往道路的路徑一併觀察');
  }else if(scene==='stairs'){
   rect(66,105,126,130,active(0,'梯寬')?C.goldLight:C.white,C.line,2,5);for(let y=121;y<235;y+=19)line(66,y,192,y,C.teal,2);dim(70,91,188,91,'梯寬',129,77,0);text(129,258,'平面觀察',16,C.muted,'middle');
   let d='M134 352';for(let i=0;i<7;i++)d+='h48v-28';d+='h145v223H134Z';path(d,active(1,'梯級')?C.goldLight:C.sage,C.ink,4);
   let top='M134 352';for(let i=0;i<7;i++)top+='h48v-28';top+='h145';path(top,'none',C.ink,5);
   path('M151 287L462 107H601','none',C.teal,5);for(const [x,y]of [[169,300],[302,222],[438,143],[579,108]])line(x,y,x,y+51,C.teal,3);
   line(470,156,614,156,active(2,'平臺')?C.gold:C.ink,7);dim(183,348,183,327,'',0,0,1);pill(265,319,'梯級',1);line(292,296,255,299,C.line,2);pill(490,72,'平臺',2);line(535,83,535,139,C.line,2,'5 5');person(208,315,.74,true);person(548,148,.8);
   caption();
  }else if(scene==='parking'){
   rect(76,106,568,249,C.paper,C.ink,4,7);rect(79,260,562,91,active(1,'車道')?C.goldLight:C.sage,'none');
   for(const x of [99,225,351,477,614])line(x,112,x,250,C.teal,3);line(99,250,614,250,C.teal,3);rect(228,112,120,134,active(0,'停車格')?C.goldLight:C.white,'none',0);
   car(117,119,C.blue);car(372,119,C.rose);pill(248,74,'停車格',0);line(288,84,288,124,C.line,2,'5 5');dim(233,255,343,255,'寬度',288,282,0);dim(211,118,211,241,'深度',184,187,0);
   line(644,270,644,344,C.paper,9);flow('M112 313H606',1);flow('M663 304H689',2);pill(459,386,'車道／通行空間',1);pill(553,231,'出入口',2);person(551,242,.61);caption('停車格、車道與出入口為觀察部位；圖示不代表法定尺寸');
  }else if(scene==='compartment'){
   rect(85,107,550,252,C.white,active(2,'牆','樓板')?C.gold:C.ink,5,4);rect(91,113,261,240,active(0,'區劃')?C.goldLight:C.sage,'none');rect(366,113,263,240,C.blue,'none');
   line(359,110,359,209,active(0,'區劃')?C.gold:C.ink,9);line(359,265,359,356,active(0,'區劃')?C.gold:C.ink,9);line(359,210,359,264,active(1,'門','開口')?C.gold:C.teal,8);path('M359 211Q307 211 307 263','none',C.teal,2,{'stroke-dasharray':'6 5'});
   text(218,151,'區劃 A',23,C.ink,'middle',700);text(493,151,'區劃 B',23,C.ink,'middle',700);person(214,307,.85);person(510,308,.85,true);
   path('M139 320Q109 292 132 275Q129 292 147 277Q144 248 164 234Q161 265 180 281Q194 308 174 321Z',C.rose,C.ink,2.5);pill(262,76,'區劃邊界',0);line(359,88,359,104,C.line,2);
   pill(277,390,'開口／防火門',1);line(350,363,359,277,C.line,2,'5 5');pill(464,203,'牆與樓板',2);caption('牆、樓板與開口分別核對；防火性能及使用條件依原文確認');
  }else if(scene==='evacuation'){
   rect(78,113,565,246,C.white,C.ink,5,5);rect(85,266,551,85,active(1,'動線')?C.goldLight:C.sage,'none');
   for(const [x,w]of [[108,176],[330,174]]){line(x,137,x+w,137,C.ink,3);line(x,137,x,242,C.ink,3);line(x+w,137,x+w,242,C.ink,3);line(x,242,x+83,242,C.ink,3);line(x+132,242,x+w,242,C.ink,3);path('M'+(x+83)+' 242v-47Q'+(x+130)+' 242 '+(x+130)+' 242','none',C.teal,2)}
   person(185,234,.72);circle(185,206,39,'none',active(0,'起點')?C.gold:C.line,3);pill(120,83,'起點／居室',0);line(179,94,185,158,C.line,2,'5 5');
   line(644,275,644,330,C.paper,10);flow('M228 216V292H672',1);rect(567,166,76,48,active(2,'出口')?C.goldLight:C.sage,C.teal,3,5);text(605,197,'出口',22,C.teal,'middle',700);line(608,216,638,274,C.teal,2,'5 5');pill(282,386,'通行動線',1);text(458,86,'沿路觀察門、轉折與通道',18,C.muted,'middle');caption('起點、路線與出口僅作觀察示意；數量與距離須依條文條件確認');
  }else if(scene==='daylight'){
   path('M115 347V107H593V154M593 267V347H115',active(2,'居室')?'#eef4e8':C.white,C.ink,5);rect(117,329,474,17,C.sage,'none');rect(582,154,20,113,active(0,'採光','開口')?C.goldLight:C.blue,C.teal,3,3);line(592,159,592,262,C.teal,2);
   polygon([[581,163],[581,260],[226,327],[371,327]],active(1,'光')?'#f6e4a0':'#faf0cf','none',0);circle(650,88,28,C.goldLight,C.gold,3);for(const [x1,y1,x2,y2]of [[650,46,650,35],[650,130,650,141],[608,88,596,88],[692,88,703,88],[620,58,612,50],[680,118,689,127],[620,118,611,127],[680,58,689,49]])line(x1,y1,x2,y2,C.gold,3);
   rect(257,282,120,13,C.rose,C.ink,2,4);line(269,296,269,329,C.ink,3);line(365,296,365,329,C.ink,3);person(421,329,.85,true);pill(385,87,'採光開口',0);line(494,99,583,181,C.line,2,'5 5');pill(169,225,'居室',2);text(340,385,'開口、室內空間與外部遮蔽物一起檢視',18,C.ink,'middle');caption('光線為概念表達，不是日照、照度或採光面積計算結果');
  }else if(scene==='accessibility'){
   polygon([[74,344],[452,227],[616,227],[616,266],[457,266],[84,382]],active(0,'坡')?C.goldLight:C.sage,C.ink,4);line(83,305,449,188,C.teal,5);line(449,188,613,188,C.teal,5);for(const [x,y]of [[115,296],[287,242],[451,188],[591,188]])line(x,y,x,y+48,C.teal,3);
   rect(526,103,95,124,active(2,'入口')?C.goldLight:C.blue,C.ink,4,3);line(573,106,573,225,C.ink,2);circle(586,170,4,C.gold,C.ink,1);pill(532,75,'入口',2);pill(390,295,'平臺',1);line(451,270,486,245,C.line,2,'5 5');
   const w=node('g',{transform:'translate(199 312) rotate(-17)'});add(g,w);add(w,node('circle',{cx:0,cy:0,r:30,fill:C.paper,stroke:C.teal,'stroke-width':5}),node('circle',{cx:8,cy:-72,r:13,fill:'#f0d6bc',stroke:C.ink,'stroke-width':3}),node('path',{d:'M5-56L-1-15H31L42 11H55M-1-37H26M-2-12L-16 15',fill:'none',stroke:C.ink,'stroke-width':7}));
   dim(110,371,425,274,'坡道觀察',257,389,0);flow('M301 284L439 240H499',1);pill(247,118,'通行空間',1);text(174,180,'連續通行',19,C.ink,'middle');caption('坡度、寬度、平臺與入口分別檢討；本圖不提供比例或合規判定');
  }else if(scene==='shelter'){
   rect(108,93,503,274,C.white,C.ink,5,4);rect(112,255,495,107,active(0,'防空','附建')?C.goldLight:C.sage,'none');line(50,253,673,253,C.gold,5);text(54,239,'基地地面',17,C.muted);
   line(110,175,609,175,C.ink,4);for(const x of [150,255,360,465]){rect(x,117,59,39,C.blue,C.teal,2,3);rect(x,195,59,39,C.blue,C.teal,2,3)}
   path('M611 183h26v35h-26v35h26v36h-26v36h26v36','none',active(1,'出入口')?C.gold:C.teal,4);line(608,296,608,341,C.teal,8);person(213,347,.8);person(487,236,.72,true);rect(346,333,124,12,C.paper,C.ink,2,3);line(356,345,356,361,C.ink,3);line(460,345,460,361,C.ink,3);
   pill(243,60,'基地／建築條件',2);text(356,293,'防空避難設備空間',23,C.ink,'middle',700);pill(547,394,'出入口',1);caption('附建位置與出入口為概念示意；設置義務及用途須依所選版本核對');
  }else if(scene==='height'){
   line(63,365,658,365,C.ink,5);rect(221,114,265,247,C.white,C.ink,5,3);rect(224,341,259,19,C.sage,'none');rect(303,58,103,56,C.sage,C.ink,4,3);line(220,114,489,114,C.teal,5);
   for(const x of [247,326,405])for(const y of [140,205,270])rect(x,y,53,41,C.blue,C.teal,2,3);person(159,353,.85,true);dim(544,122,544,357,'',0,0,0);text(566,242,'高度檢討',20,C.teal,'start',600);line(487,115,553,115,C.line,2,'5 5');line(487,365,553,365,C.line,2,'5 5');
   pill(63,313,'起算面',0);line(130,328,219,360,C.line,2,'5 5');pill(435,65,'屋頂突出物',1);line(435,77,408,86,C.line,2,'5 5');pill(260,400,'量測終點另依定義確認',2);caption('起算面、量測終點及突出物分開核對；箭頭不是實際高度或上限');
  }else{
   polygon([[234,145],[419,188],[419,347],[234,303]],active(1,'事項')?C.goldLight:C.sage);polygon([[419,188],[550,133],[550,290],[419,347]],C.blue);polygon([[234,145],[363,92],[550,133],[419,188]],C.paper);
   for(const [x,y]of [[266,181],[328,195],[266,244],[328,257]])polygon([[x,y],[x+36,y+9],[x+36,y+42],[x,y+33]],C.paper,C.teal,2);
   for(const [x,y]of [[449,198],[500,177],[449,256],[500,235]])polygon([[x,y],[x+26,y-11],[x+26,y+22],[x,y+33]],C.paper,C.teal,2);
   person(155,347,.95,true);person(608,351,.87);pill(65,92,'對象／條件',0);line(181,103,246,160,C.line,2,'6 5');pill(458,72,'規範事項',1);line(506,84,468,147,C.line,2,'6 5');pill(438,387,'例外／查證',2);line(493,358,456,325,C.line,2,'6 5');
   circle(119,227,31,C.paper,C.teal,4);line(139,250,166,278,C.teal,7);text(119,234,'查',23,C.teal,'middle',700);text(353,43,'先讀原文，再拆解條件',19,C.ink,'middle');caption();
  }
  return svg;
 }
 globalThis.ArticleScenes=Object.freeze({render,scenes:Object.freeze(['stairs','parking','compartment','evacuation','daylight','accessibility','shelter','height','generic'])});
})();
