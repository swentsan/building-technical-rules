"""Rebuild the independent reading/teaching workspace without touching notes."""
from pathlib import Path
from contextlib import redirect_stdout
from io import StringIO
import shutil,json
from build_learning_data import build
ROOT=Path(__file__).resolve().parent.parent
def build_learning_page(root=ROOT):
 root=Path(root);assets=root/'assets';assets.mkdir(exist_ok=True)
 with redirect_stdout(StringIO()):report=build(root/'technical/corpus.json',assets/'article-learning-data.js')
 for name in ['article-learning.js','article-learning.css']:shutil.copy2(root/'tools'/name,assets/name)
 html=(root/'tools/analysis.template.html').read_text(encoding='utf-8').replace('__READER__','建築技術規則查詢.html');target=root/'條文分析與教學.html';temp=target.with_suffix('.building.html');temp.write_text(html,encoding='utf-8');temp.replace(target);return report
def publish_learning(root,output):
 root=Path(root);output=Path(output);assets=output/'docs/assets';assets.mkdir(parents=True,exist_ok=True)
 with redirect_stdout(StringIO()):build(root/'technical/corpus.json',assets/'article-learning-data.js')
 for name in ['article-learning.js','article-learning.css']:shutil.copy2(root/'tools'/name,assets/name)
 (output/'docs/analysis.html').write_text((root/'tools/analysis.template.html').read_text(encoding='utf-8').replace('__READER__','technical.html'),encoding='utf-8')
 (output/'src').mkdir(exist_ok=True)
 for name in ['analysis.template.html','article-learning.js','article-learning.css','build_learning_data.py','refresh_learning_ui.py']:shutil.copy2(root/'tools'/name,output/'src'/name)
if __name__=='__main__':print(json.dumps(build_learning_page(),ensure_ascii=False))
