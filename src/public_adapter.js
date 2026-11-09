/* Public Pages interface: searchable publication plus portable update drafts. */
globalThis.TECHNICAL_HOSTED_READONLY=true;
document.querySelector('.offline').textContent='● 公開查詢版';
document.querySelector('.asidefoot').innerHTML='條文查詢 → 相關解釋函 → 版本比對<br><br>公開版提供查詢及更新草稿匯出。<br>正式資料由管理者更新後發布。';
const publicRepoLink=document.querySelector('aside nav a');publicRepoLink.href='https://github.com/swentsan/building-technical-rules';publicRepoLink.textContent='GitHub 原始碼';
const publicSave=[...document.querySelectorAll('#versionForm button')].find(e=>e.textContent==='寫入共用資料庫');if(publicSave)publicSave.remove();
document.querySelector('#updateStatus').textContent='公開查詢版可預覽新舊差異並匯出更新檔。正式版本須由管理者匯回共用資料庫後重新發布。';
const publicHint=document.createElement('p');publicHint.className='notice';publicHint.textContent='這裡建立的是更新草稿。預覽與匯出不會更動公開條文。';document.querySelector('#versionForm').before(publicHint);
const publicAbout=document.querySelectorAll('#aboutview .aboutgrid article');
if(publicAbout[0]){publicAbout[0].replaceChildren();const h=document.createElement('h3');h.textContent='共用資料庫的公開查詢版本';const p=document.createElement('p');p.textContent='本網站由建築法規共用資料庫產生，提供條文、彙編頁面、函釋分類及版本比較。管理者更新本機主資料庫後，再同步發布本站。';publicAbout[0].append(h,p)}
if(publicAbout[3]){publicAbout[3].replaceChildren();const h=document.createElement('h3');h.textContent='條文異動草稿';const p=document.createElement('p');p.textContent='選擇條文，填入新版全文、公布日期、施行日期、來源與異動說明，即可預覽差異並匯出 JSON 更新檔。管理者可在本機維護模式讀取後寫入共用資料庫，保留舊版本及修改紀錄。';publicAbout[3].append(h,p)}
document.querySelector('#footer').textContent='資料收錄日 '+DB.built_on+' · '+DB.counts.official_articles+' 條官方封存條文 · '+DB.counts.interpretation_groups+' 組函釋彙編分類 · '+DB.counts.scan_pages+' 頁掃描索引';
