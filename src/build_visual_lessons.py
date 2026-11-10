"""Build source-bound visual lessons; no legal explanation is generated here."""
from pathlib import Path
import json,hashlib
ROOT=Path(__file__).resolve().parent
def build(corpus_path=None,source_path=None,output_path=None):
 corpus_path=Path(corpus_path or ROOT.parent/'technical/corpus.json');source_path=Path(source_path or ROOT/'visual-lessons-source.json');output_path=Path(output_path or ROOT.parent/'assets/article-visual-lessons.js')
 corpus=json.loads(corpus_path.read_text(encoding='utf-8'));lessons=json.loads(source_path.read_text(encoding='utf-8'));available={(v['pcode'],v['article_key'],hashlib.sha256(v['text'].encode('utf-8')).hexdigest()) for v in corpus['article_versions']+corpus.get('imported_versions',[])};kept=[];skipped=[]
 for lesson in lessons:
  text=lesson['source_text'];digest=hashlib.sha256(text.encode('utf-8')).hexdigest();assert digest==lesson['source_text_sha256'],lesson['id']+' source checksum'
  assert 3<=len(lesson['panels'])<=5
  for quote in lesson['source_quotes']:assert quote in text,lesson['id']+' quote not in source'
  for panel in lesson['panels']:assert panel['quote'] in lesson['source_quotes'],lesson['id']+' panel quote not verified'
  if (lesson['pcode'],lesson['article_key'],digest) in available:kept.append(lesson)
  else:skipped.append(lesson['id'])
 output_path.parent.mkdir(parents=True,exist_ok=True);payload=json.dumps(kept,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c').replace('>','\\u003e').replace('&','\\u0026');output_path.write_text('globalThis.ARTICLE_VISUAL_LESSONS='+payload+';\n',encoding='utf-8');return{'lessons':len(kept),'panels':sum(len(l['panels']) for l in kept),'source_quotes':sum(len(l['source_quotes']) for l in kept),'unavailable_source_lessons':skipped}
if __name__=='__main__':print(json.dumps(build(),ensure_ascii=False))
