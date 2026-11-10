"""Publish the curated Keelung lookup and its explicitly linked legal sources.

The shared master database, private backups, browser notes and QA are excluded.
Only source paths named by the lookup projection are eligible for copying.
"""
from collections import defaultdict
from pathlib import Path, PurePosixPath
import copy
import hashlib
import json
import os
import re
import shutil

ASSET_ROOT = 'keelung-assets'
REPORTS = {
    '現行版本核對報告.txt': 'version-audit.txt',
    'official/2026-11-09/version-audit.json': 'version-audit.json',
    '建照審圖檢核表.txt': 'checklist.txt',
    '建照審圖檢核表.json': 'checklist.json',
    '中央法規與條文差異報告.txt': 'article-comparison.txt',
    'official/central/2026-11-09/comparison-coverage.json': 'comparison-coverage.json',
    '使用說明與建庫報告.txt': 'readme.txt',
}


def _embedded(value):
    return json.dumps(value, ensure_ascii=False, separators=(',', ':')).replace('<', '\\u003c').replace('>', '\\u003e').replace('&', '\\u0026')


def _write(path, content):
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_name(path.name + '.building')
    temp.write_text(content, encoding='utf-8')
    temp.replace(path)


def _json_write(path, value):
    _write(path, json.dumps(value, ensure_ascii=False, indent=2))


def _prepare(root):
    """Return a source-derived projection and a finite copy allowlist."""
    root = Path(root)
    original = json.loads((root / 'corpus.json').read_text(encoding='utf-8'))
    data = copy.deepcopy(original)
    data['documents'] = [d for d in data['documents'] if d.get('module_id') != 'building_technical']
    document_ids = {d['id'] for d in data['documents']}
    data['units'] = [u for u in data['units'] if u['document_id'] in document_ids]
    unit_ids = {u['id'] for u in data['units']}
    data['attachments'] = [a for a in data['attachments'] if a['document_id'] in document_ids]
    data['article_diffs'] = [a for a in data['article_diffs'] if a['document_id'] in document_ids]
    data['counts'].update(documents=len(data['documents']), units=len(data['units']), official_attachments=len(data['attachments']))
    for key in list(data['counts']):
        if key.startswith('technical_scan_'):
            del data['counts'][key]
    for key in ['modules', 'technical_article_links', 'technical_imported_versions']:
        data.pop(key, None)

    files = {}
    rewrites = {}

    def allow(relative, sha256=None, size=None):
        if not relative or relative.startswith(('https://', 'http://')):
            return relative
        path = PurePosixPath(relative)
        if path.is_absolute() or '..' in path.parts or '\\' in relative or path.parts[0] not in ('sources', 'official'):
            raise ValueError('A legal-source path is outside the publication allowlist: ' + relative)
        if path.suffix.lower() in ('.exe', '.dll', '.cmd', '.bat', '.ps1', '.sh', '.sqlite3'):
            raise ValueError('An executable or master database is not a lookup source: ' + relative)
        target = ASSET_ROOT + '/' + path.as_posix()
        record = files.setdefault(relative, {'source': relative, 'path': target, 'sha256': sha256, 'bytes_hint': size})
        if sha256:
            if record['sha256'] and record['sha256'] != sha256:
                raise ValueError('Conflicting source checksum: ' + relative)
            record['sha256'] = sha256
        if size is not None:
            record['bytes_hint'] = size
        rewrites[relative] = target
        return target

    for d in data['documents']:
        archive = d['archive_relative']
        target = allow(archive, d.get('sha256'), d.get('byte_size'))
        # Word originals are served from their already archived, hash-named copy.
        rewrites[d['source_relative']] = target
        for key in ['source_relative', 'archive_relative']:
            d[key] = target
    for a in data['attachments']:
        allow(a['path'], a.get('sha256'), a.get('bytes'))
        if a.get('text_path'):
            allow(a['text_path'])

    def collect_local_sources(value):
        if isinstance(value, dict):
            if value.get('local_path'):
                allow(value['local_path'], value.get('sha256'))
            for item in value.values():
                collect_local_sources(item)
        elif isinstance(value, list):
            for item in value:
                collect_local_sources(item)
    collect_local_sources(data)

    def rewrite(value, field=None):
        if isinstance(value, dict):
            return {key: rewrite(item, key) for key, item in value.items()}
        if isinstance(value, list):
            return [rewrite(item, field) for item in value]
        if isinstance(value, str):
            if field in ('source_relative', 'archive_relative', 'source_path', 'path', 'local_path', 'text_path') and re.match(r'^(?:[A-Za-z]:[\\/]|\\\\)', value):
                raise ValueError('Absolute workstation path is not public lookup data')
            if value in rewrites:
                return rewrites[value]
            # Preserve PDF fragment locators when source paths carry a page number.
            base, marker, fragment = value.partition('#')
            if marker and base in rewrites:
                return rewrites[base] + '#' + fragment
            if value.startswith('../建管/'):
                raise ValueError('An original Word path was not mapped to its archive')
        return value
    data = rewrite(data)

    # No legal text or version labels are rewritten by publication.
    original_units = {u['id']: u for u in original['units']}
    for u in data['units']:
        assert u['text'] == original_units[u['id']]['text']
    for item in data.get('checklist', []):
        for reference in item['refs']:
            assert reference['document_id'] in document_ids and reference['unit_id'] in unit_ids
    assert data['version_audit'] == rewrite(original['version_audit'])
    assert all(not r['enabled'] for r in data.get('candidate_rules', []))
    data['publication'] = {'entry': 'keelung.html', 'scope': '既有基隆與中央法規查詢介面及其明列來源', 'master_database_published': False, 'individual_case_records_published': False}
    return data, files


def plan_keelung(root):
    """Return a compact dry-run inventory without copying the source collection."""
    data, files = _prepare(root)
    known = [f['bytes_hint'] for f in files.values() if f['bytes_hint'] is not None]
    # Directory enumeration avoids hundreds of separate SMB metadata probes.
    groups = defaultdict(set)
    for name in files:
        path = PurePosixPath(name)
        groups[path.parent.as_posix()].add(path.name)
    source_bytes = 0
    for directory, names in groups.items():
        with os.scandir(Path(root) / directory) as entries:
            found = {e.name: e.stat(follow_symlinks=False).st_size for e in entries if e.name in names}
        if names != found.keys():
            raise FileNotFoundError('Missing allowlisted legal sources: ' + ', '.join(directory + '/' + n for n in names - found.keys()))
        source_bytes += sum(found.values())
    return {'documents': len(data['documents']), 'units': len(data['units']), 'default_regulations': data['counts']['search_default_documents'], 'local_regulations': data['counts']['local_regulations'], 'attachments': len(data['attachments']), 'checklist_items': len(data['checklist']), 'source_files': len(files), 'source_bytes': source_bytes, 'known_source_bytes': sum(known), 'source_files_without_size_hint': len(files) - len(known), 'embedded_projection_bytes': len(_embedded(data).encode('utf-8')), 'source_text_preserved': True, 'all_source_files_exist': True}


def _reports(data):
    checked = data['version_audit']['checked_on']
    audit = ['基隆地方資料版本核對', '查核日：' + checked, '保留來源查核結果；版次相符不等於逐字校定或個案適用。', '']
    for a in data['version_audit']['records']:
        audit += [str(a['number']) + '. ' + a['local_title'], a['status'] + '｜本地：' + (a['local_dates'][-1] if a['local_dates'] else '日期未辨識') + '｜官方：' + (a.get('official_date') or '尚未定位'), a['note']]
        audit += [s['role'] + '：' + s['url'] for s in a.get('sources', [])]
        audit += ['']
    checklist = ['建照審圖人工檢核表', '查核日：' + checked, '狀態及個案備註儲存在使用者瀏覽器，未包含於本公開資料。', '']
    for item in data['checklist']:
        checklist += [item['id'] + '｜' + item['topic'] + '｜' + item['title'], item['action'], '證據：' + item['evidence'], '適用：' + item['applicability']]
        checklist += [r['law_title'] + '｜' + r['heading'] + '｜' + r['official_url'] + '\n' + r['quote'] for r in item['refs']]
        checklist += ['']
    comparison = ['條文版本比較收錄範圍', '查核日：' + checked, '文字差異不等於修法理由、圖面差異或個案適用結論。', '']
    for c in data['central_coverage']:
        comparison += [c['title'] + '｜' + c['version'] + '｜前版：' + (c.get('previous_date') or '尚未取得'), c.get('gap') or json.dumps(c['counts'], ensure_ascii=False), c['url'], '']
    readme = ['基隆建築法規資料庫｜公開查詢版', '沿用共用資料庫既有查詢頁，包含中央及基隆地方資料、版本稽核、條文差異與人工審圖檢核表。', '查核日：' + checked, '查詢內容及來源為封存快照；個案適用與後續異動仍應核對所選版次及來源。', '來源文件版本：' + str(len(data['documents'])), '預設法規：' + str(data['counts']['search_default_documents']), '基隆地方原項目：' + str(data['counts']['local_regulations']), '來源附件：' + str(len(data['attachments'])), '人工檢核項目：' + str(len(data['checklist'])), '案件名稱、狀態與備註僅儲存在使用者瀏覽器；跨裝置可匯出及匯入。', '公開投影不含共用SQLite主檔、備份、QA或個案紀錄。']
    return {
        'version-audit.txt': '\n'.join(audit),
        'version-audit.json': json.dumps(data['version_audit'], ensure_ascii=False, indent=2),
        'checklist.txt': '\n'.join(checklist),
        'checklist.json': json.dumps(data['checklist'], ensure_ascii=False, indent=2),
        'article-comparison.txt': '\n'.join(comparison),
        'comparison-coverage.json': json.dumps({'central': data['central_coverage'], 'local': data['local_comparison_coverage']}, ensure_ascii=False, indent=2),
        'readme.txt': '\n'.join(readme),
    }


def publish_keelung(root, output):
    """Render the existing lookup and copy only allowlisted source artifacts."""
    root = Path(root)
    output = Path(output)
    docs = output / 'docs'
    data, files = _prepare(root)
    manifest = []
    for relative, entry in sorted(files.items()):
        target = docs / entry['path']
        target.parent.mkdir(parents=True, exist_ok=True)
        expected = entry['sha256']
        if expected and target.exists() and hashlib.sha256(target.read_bytes()).hexdigest() == expected:
            content = None
            size = target.stat().st_size
            actual = expected
        else:
            content = (root / relative).read_bytes()
            size = len(content)
            actual = hashlib.sha256(content).hexdigest()
            if expected and expected != actual:
                raise ValueError('Legal source checksum mismatch: ' + relative)
            temporary = target.with_name(target.name + '.building')
            temporary.write_bytes(content)
            temporary.replace(target)
        manifest.append({'path': entry['path'], 'source_path': relative, 'sha256': actual, 'bytes': size})

    by_doc = defaultdict(list)
    for u in data['units']:
        by_doc[u['document_id']].append(u)
    for d in data['documents']:
        text = d['title'] + '\n來源：' + d['source_relative'] + '\n\n'
        text += '\n\n'.join(u['heading'] + '\n' + u['text'] for u in by_doc[d['id']])
        _write(docs / ASSET_ROOT / 'text' / (d['id'] + '.txt'), text)
    for name, text in _reports(data).items():
        _write(docs / ASSET_ROOT / 'reports' / name, text)
    # This download has the same complete projection as the embedded lookup;
    # compact JSON avoids an additional large pretty-printed copy on hosting.
    _write(docs / ASSET_ROOT / 'corpus.json', _embedded(data))
    _json_write(docs / ASSET_ROOT / 'source-manifest.json', {'entry': 'keelung.html', 'source_files': len(manifest), 'source_bytes': sum(f['bytes'] for f in manifest), 'files': manifest})

    template = (root / 'tools/query_v3.template.html').read_text(encoding='utf-8')
    # These are interface paths, not replacements within legal-source wording.
    template = template.replace("technicalEntry.href='建築技術規則查詢.html'", "technicalEntry.href='technical.html'")
    template = template.replace("link('純文字版本','text/'+d.id+'.txt')", "link('純文字版本','keelung-assets/text/'+d.id+'.txt')")
    template = re.sub(r'<a\b[^>]*href="regulations\.sqlite3"[^>]*>.*?</a>', '', template, flags=re.S)
    template = template.replace('href="corpus.json"', 'href="keelung-assets/corpus.json"')
    for old, new in REPORTS.items():
        template = template.replace('href="' + old + '"', 'href="keelung-assets/reports/' + new + '"')
    template = template.replace('● 可離線使用', '● 整理版查詢')
    template = template.replace('</head>', '<meta name="description" content="我們整理的基隆地方與中央建築法規查詢，含版次核對、來源附件、條文差異及人工審圖檢核。"></head>')
    assert template.count('__CORPUS_JSON__') == 1
    html = template.replace('__CORPUS_JSON__', _embedded(data))
    assert '../建管/' not in html and 'regulations.sqlite3' not in html
    _write(docs / 'keelung.html', html)

    (output / 'src').mkdir(exist_ok=True)
    for source, target in [(root / 'tools/query_v3.template.html', output / 'src/query_v3.template.html'), (Path(__file__), output / 'src/build_keelung_public.py')]:
        if source.absolute() != target.absolute():
            shutil.copy2(source, target)
    site_bytes = sum(p.stat().st_size for p in docs.rglob('*') if p.is_file())
    if site_bytes >= 1_000_000_000:
        raise ValueError('The public site exceeds its 1 GB publication budget; no deployment was started')
    return {'entry': 'keelung.html', 'documents': len(data['documents']), 'units': len(data['units']), 'regulations': data['counts']['search_default_documents'], 'local_regulations': data['counts']['local_regulations'], 'attachments': len(data['attachments']), 'checklist_items': len(data['checklist']), 'source_files': len(manifest), 'source_bytes': sum(f['bytes'] for f in manifest), 'site_bytes': site_bytes, 'site_under_1gb': True, 'source_text_preserved': True, 'master_database_published': False}
