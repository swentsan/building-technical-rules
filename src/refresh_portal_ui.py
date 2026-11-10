"""Build the four-way entrance while preserving existing article share URLs."""
from pathlib import Path
import hashlib,json,re,shutil

ROOT=Path(__file__).resolve().parent.parent
KEELUNG_OFFICIAL='https://www.klcg.gov.tw/tw/urban/2580.html'
SOURCES=['portal.template.html','portal.css','portal-navigation.js','refresh_portal_ui.py']
LEGACY_ROUTE='''<script>
// Existing shared links opened articles directly on the former homepage.
(() => {const redirect=()=>{const route=new URLSearchParams(location.hash.slice(1));
if(['pcode','article','history','doc','unit','letter','diagram3d','library3d'].some(key=>route.has(key)))
location.replace('technical.html'+location.search+location.hash);};
window.addEventListener('hashchange',redirect);redirect();})();
</script>'''

def atomic(path,text):
    tmp=path.with_name(path.name+'.building')
    tmp.write_text(text,encoding='utf-8');tmp.replace(path)

def render(root,public):
    values={
        '__VISUALS__':'illustrations.html' if public else '條文圖解教室.html',
        '__ANALYSIS__':'analysis.html' if public else '條文分析與教學.html',
        '__READER__':'technical.html' if public else '建築技術規則查詢.html',
        '__KEELUNG__':KEELUNG_OFFICIAL if public else '法規查詢.html',
        '__KEELUNG_NOTE__':'前往市府都市發展處，查找地方建築相關法規。' if public else '查詢地方建築相關規範、來源文件與版次核對資訊。',
        '__KEELUNG_BADGE__':'市府官方法規' if public else 'NAS 地方法規庫',
    }
    html=(root/'tools/portal.template.html').read_text(encoding='utf-8')
    for key,value in values.items():html=html.replace(key,value)
    html=html.replace('<!-- LEGACY_ROUTE -->',LEGACY_ROUTE if public else '')
    assert not re.search(r'__[A-Z_]+__',html),'Unresolved entrance template token'
    return html

def decorate(path,public):
    html=path.read_text(encoding='utf-8')
    html=re.sub(r'<!-- PORTAL_NAV_START -->.*?<!-- PORTAL_NAV_END -->','',html,flags=re.S)
    # New reader routes must always load the matching client code, even for
    # visitors whose browser cached the preceding release's analysis script.
    asset=path.parent/'assets/article-learning.js'
    if 'src="assets/article-learning.js' in html:
        version=hashlib.sha256(asset.read_bytes()).hexdigest()[:12]
        html=re.sub(r'src="assets/article-learning.js(?:\?[^\"]*)?"',f'src="assets/article-learning.js?v={version}"',html)
    home='index.html' if public else '法規研讀入口.html'
    keelung=KEELUNG_OFFICIAL if public else '法規查詢.html'
    block=f'<!-- PORTAL_NAV_START --><script src="assets/portal-navigation.js" data-portal-home="{home}" data-portal-keelung="{keelung}"></script><!-- PORTAL_NAV_END -->'
    assert '</body>' in html
    atomic(path,html.replace('</body>',block+'</body>'))

def build_portal_page(root=ROOT):
    root=Path(root);assets=root/'assets';assets.mkdir(exist_ok=True)
    for name in ['portal.css','portal-navigation.js']:shutil.copy2(root/'tools'/name,assets/name)
    atomic(root/'法規研讀入口.html',render(root,False))
    # A directly opened copy in the shared folder gives the NAS a visible entrance.
    launcher=render(root,False)
    for target in ['assets/portal.css','條文圖解教室.html','條文分析與教學.html','建築技術規則查詢.html','法規查詢.html']:
        launcher=launcher.replace('href="'+target+'"','href="'+root.name+'/'+target+'"')
    atomic(root.parent/'法規研讀入口.html',launcher)
    for name in ['條文圖解教室.html','條文分析與教學.html','建築技術規則查詢.html','法規查詢.html']:
        if (root/name).exists():decorate(root/name,False)
    return {'entrance':'法規研讀入口.html','modules':4}

def publish_portal(root,output):
    root=Path(root);output=Path(output);docs=output/'docs';assets=docs/'assets';assets.mkdir(parents=True,exist_ok=True)
    previous=docs/'index.html';reader=docs/'technical.html'
    # The public builder normally just wrote the technical reader to index.html.
    if previous.exists() and 'data-portal-page' not in previous.read_text(encoding='utf-8'):
        atomic(reader,previous.read_text(encoding='utf-8'))
    assert reader.exists(),'Build the technical reader before its entrance'
    for name in ['portal.css','portal-navigation.js']:shutil.copy2(root/'tools'/name,assets/name)
    atomic(previous,render(root,True))
    for name in ['analysis.html','illustrations.html']:
        path=docs/name
        if path.exists():
            html=path.read_text(encoding='utf-8').replace('href="index.html','href="technical.html')
            html=html.replace('ARTICLE_READER_URL="index.html"','ARTICLE_READER_URL="technical.html"').replace('reader:"index.html"','reader:"technical.html"')
            atomic(path,html)
    for name in ['technical.html','analysis.html','illustrations.html']:decorate(docs/name,True)
    (output/'src').mkdir(exist_ok=True)
    for name in SOURCES:shutil.copy2(root/'tools'/name,output/'src'/name)
    return {'entrance':'index.html','reader':'technical.html','modules':4}

if __name__=='__main__':print(json.dumps(build_portal_page(),ensure_ascii=False))
