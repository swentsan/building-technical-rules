"""Refresh the independent illustrated classroom and reproducible export."""
from pathlib import Path
import hashlib,shutil
from build_visual_lessons import build
ROOT=Path(__file__).resolve().parent.parent
ASSETS=['article-illustrations.js','article-illustrations.css','visual-scenes.js','article-reading-map.js','article-rule-diagrams.js']
SOURCES=ASSETS+['illustrations.template.html','visual-lessons-source.json','build_visual_lessons.py','refresh_visual_ui.py']
def render_visual(root,reader,analysis):
 html=(root/'tools/illustrations.template.html').read_text(encoding='utf-8').replace('__READER__',reader).replace('__ANALYSIS__',analysis)
 for name in ASSETS:
  version=hashlib.sha256((root/'tools'/name).read_bytes()).hexdigest()[:12]
  html=html.replace('"assets/'+name+'"','"assets/'+name+'?v='+version+'"')
 return html
def build_visual_page(root=ROOT):
 root=Path(root);assets=root/'assets';assets.mkdir(exist_ok=True);report=build(root/'technical/corpus.json',root/'tools/visual-lessons-source.json',assets/'article-visual-lessons.js')
 for name in ASSETS:shutil.copy2(root/'tools'/name,assets/name)
 html=render_visual(root,'建築技術規則查詢.html','條文分析與教學.html');target=root/'條文圖解教室.html';tmp=target.with_suffix('.building.html');tmp.write_text(html,encoding='utf-8');tmp.replace(target);return report
def publish_visual(root,output):
 root=Path(root);output=Path(output);assets=output/'docs/assets';assets.mkdir(parents=True,exist_ok=True);build(root/'technical/corpus.json',root/'tools/visual-lessons-source.json',assets/'article-visual-lessons.js')
 for name in ASSETS:shutil.copy2(root/'tools'/name,assets/name)
 (output/'docs/illustrations.html').write_text(render_visual(root,'technical.html','analysis.html'),encoding='utf-8');(output/'src').mkdir(exist_ok=True)
 for name in SOURCES:shutil.copy2(root/'tools'/name,output/'src'/name)
if __name__=='__main__':print(build_visual_page())
