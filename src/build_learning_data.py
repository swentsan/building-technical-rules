"""Build source-only article data for the separate learning workspace.

The source body is retained byte-for-byte as a Python string.  The comparison
key matches technical_article.js versionTextKey: whitespace is layout except
between two ASCII letters/digits, where one space preserves the token boundary.
No article purpose, applicability conclusion or teaching answer is generated.
"""
from pathlib import Path
from collections import defaultdict
import hashlib
import json
import re

BASE = Path(__file__).resolve().parents[1]
ROOT = Path(__file__).resolve().parent
CORPUS = ROOT.parent / 'technical/corpus.json' if ROOT.name == 'tools' else BASE / 'web-repo/data/technical-corpus.json'
OUTPUT = ROOT.parent / 'assets/article-learning-data.js' if ROOT.name == 'tools' else ROOT / 'article-learning-data.js'
ORDER = {'D0070114': 0, 'D0070115': 1, 'D0070116': 2, 'D0070117': 3}
# Exact ECMAScript \s set (Python \s additionally recognizes U+0085, and omits FEFF).
JS_WHITESPACE = re.compile(r'[\t\n\v\f\r \u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+')
ASCII_TOKEN = re.compile(r'[A-Za-z0-9]')


def comparison_key(text):
    def replace(match):
        before = text[match.start() - 1] if match.start() else ''
        after = text[match.end()] if match.end() < len(text) else ''
        return ' ' if ASCII_TOKEN.fullmatch(before) and ASCII_TOKEN.fullmatch(after) else ''
    return JS_WHITESPACE.sub(replace, text)


def article_sort(key):
    return tuple(int(part) for part in key.split('-'))


def version_fields(version, unit=None, document=None):
    # Use a current unit warning only when it belongs to the selected source.
    current_warning = ''
    if unit and document and version.get('document_id') == document['id']:
        current_warning = unit.get('effective_warning', '')
    return {
        'id': version['id'],
        'date': version['publication_date'],
        'text': version['text'],
        'source_url': version.get('source_url') or (unit or {}).get('source_url') or (document or {}).get('official', {}).get('url', ''),
        'effective_warning': version.get('effective_warning') or current_warning,
        'effective_note': version.get('effective_note', ''),
    }


def build(corpus_path=None, output_path=None):
    input_file = Path(corpus_path) if corpus_path is not None else CORPUS
    output_file = Path(output_path) if output_path is not None else OUTPUT
    raw = input_file.read_bytes()
    corpus = json.loads(raw)
    documents = sorted((d for d in corpus['documents'] if d.get('module_kind') == 'official'), key=lambda d: ORDER[d['pcode']])
    assert len(documents) == 4
    docs = {d['id']: d for d in documents}
    current_units = [u for u in corpus['units'] if u['document_id'] in docs and u['kind'] == 'article' and not u.get('is_reference')]
    assert len(current_units) == corpus['counts']['official_articles'], len(current_units)
    groups = defaultdict(list)
    all_versions = corpus['article_versions'] + corpus.get('imported_versions', [])
    for version in all_versions:
        groups[(version['pcode'], version['article_key'])].append(version)
    for versions in groups.values():
        versions.sort(key=lambda v: (v['publication_date'], v['id']))

    articles = []
    alias_count = 0
    visible_count = 0
    for unit in sorted(current_units, key=lambda u: (ORDER[docs[u['document_id']]['pcode']], article_sort(u['article_key']))):
        document = docs[unit['document_id']]
        versions = groups[(document['pcode'], unit['article_key'])]
        assert versions
        latest = versions[-1]
        # Existing current rows are not replaced by the early representative.
        if latest.get('source_kind') == 'archived_official' and latest.get('document_id') == document['id']:
            assert latest['text'] == unit['text'], (document['pcode'], unit['article_key'])
        aliases = {}
        distinct = []
        previous_key = None
        representative = None
        for version in versions:
            key = comparison_key(version['text'])
            if key != previous_key:
                representative = version
                item = version_fields(version)
                item.update(is_history_baseline=bool(version.get('is_history_baseline', False)), amendment_confirmed=version.get('amendment_confirmed'))
                distinct.append(item)
            aliases[version['id']] = representative['id']
            previous_key = key
        assert aliases[latest['id']] in {v['id'] for v in distinct}
        current = version_fields(latest, unit, document)
        assert current['source_url'].startswith('https://')
        raw_sources = [version_fields(v, unit, document) for v in versions]
        assert len(raw_sources) == len(aliases)
        assert {v['id'] for v in raw_sources} == set(aliases)
        articles.append({'pcode': document['pcode'], 'article_key': unit['article_key'], 'heading': unit['heading'], 'current': current, 'versions': distinct, 'raw_sources': raw_sources, 'aliases': aliases})
        alias_count += len(aliases)
        visible_count += len(distinct)

    data = {'schema_version': 1, 'laws': [{'pcode': d['pcode'], 'title': d['title']} for d in documents], 'articles': articles}
    assert len({(a['pcode'], a['article_key']) for a in articles}) == len(current_units)
    expected_aliases = sum(len(groups[(docs[u['document_id']]['pcode'], u['article_key'])]) for u in current_units)
    assert alias_count == expected_aliases, (alias_count, expected_aliases)
    payload = json.dumps(data, ensure_ascii=False, separators=(',', ':')).replace('<', '\\u003c').replace('>', '\\u003e').replace('&', '\\u0026')
    output_file.parent.mkdir(parents=True, exist_ok=True)
    output_file.write_text('globalThis.ARTICLE_LEARNING_DATA=' + payload + ';\n', encoding='utf-8')
    report = {'laws': len(documents), 'current_articles': len(articles), 'raw_version_aliases': alias_count, 'raw_source_versions': sum(len(a['raw_sources']) for a in articles), 'distinct_content_versions': visible_count, 'source_corpus_sha256': hashlib.sha256(raw).hexdigest(), 'output_bytes': output_file.stat().st_size, 'output_sha256': hashlib.sha256(output_file.read_bytes()).hexdigest(), 'per_law': {d['pcode']: {'articles': sum(a['pcode'] == d['pcode'] for a in articles), 'versions': sum(len(a['versions']) for a in articles if a['pcode'] == d['pcode']), 'raw_source_versions': sum(len(a['raw_sources']) for a in articles if a['pcode'] == d['pcode'])} for d in documents}}
    print(json.dumps(report, ensure_ascii=False))
    return report


if __name__ == '__main__':
    build()
