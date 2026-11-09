"""Validated, reproducible official history for the technical-rules module.

The archived JSON is the durable rebuild input.  This module never fetches,
guesses an old article, edits an existing article body/ID, or commits SQLite.
"""
from __future__ import annotations

from copy import deepcopy
from datetime import date
import hashlib
import json
from pathlib import Path
import re
from urllib.parse import urlsplit

CODES = {'D0070114', 'D0070115', 'D0070116', 'D0070117'}
_SHA = re.compile(r'[0-9a-f]{64}')
_ARTICLE = re.compile(r'[1-9]\d*(?:-[1-9]\d*)?')


def text_sha256(text):
    """Hash the exact UTF-8 text, including meaningful table whitespace."""
    return hashlib.sha256(text.encode('utf-8')).hexdigest()


def _date(value, field):
    if not isinstance(value, str) or not re.fullmatch(r'\d{4}-\d{2}-\d{2}', value):
        raise ValueError(f'{field} must be YYYY-MM-DD')
    date.fromisoformat(value)


def _url(value, field):
    u = urlsplit(value or '')
    if u.scheme != 'https' or not u.hostname or not u.hostname.lower().endswith('.gov.tw') or u.username or u.password:
        raise ValueError(f'{field} must be an official HTTPS .gov.tw URL')


def _unique(items, kind):
    out = {}
    for row in items:
        if not isinstance(row, dict) or not isinstance(row.get('id'), str) or not row['id']:
            raise ValueError(f'{kind} requires a nonempty id')
        if row['id'] in out:
            raise ValueError(f'duplicate {kind} id: {row["id"]}')
        out[row['id']] = row
    return out


def _validate(history, root=None):
    if not isinstance(history, dict) or history.get('schema_version') != 1:
        raise ValueError('official history schema_version must be 1')
    for name in ['sources', 'versions', 'events']:
        if not isinstance(history.get(name), list):
            raise ValueError(f'official history {name} must be a list')
    sources = _unique(history['sources'], 'source')
    versions = _unique(history['versions'], 'version')
    events = _unique(history['events'], 'event')
    for s in sources.values():
        _url(s.get('url'), 'source.url')
        if not _SHA.fullmatch(s.get('sha256', '')):
            raise ValueError('source.sha256 must be a lowercase SHA-256 digest')
        relative = Path(s.get('path', ''))
        if not s.get('path') or relative.is_absolute() or '..' in relative.parts:
            raise ValueError('source.path must stay relative to the database root')
        if root is not None:
            target = (root / relative).resolve()
            if not target.is_relative_to(root.resolve()) or not target.is_file():
                raise ValueError(f'source archive missing or outside root: {s["path"]}')
            digest = hashlib.sha256()
            with target.open('rb') as stream:
                for chunk in iter(lambda: stream.read(1024 * 1024), b''):
                    digest.update(chunk)
            if digest.hexdigest() != s['sha256']:
                raise ValueError(f'source archive checksum mismatch: {s["path"]}')
    for v in versions.values():
        if v.get('pcode') not in CODES or not _ARTICLE.fullmatch(v.get('article_key', '')):
            raise ValueError(f'unsupported law or article: {v["id"]}')
        _date(v.get('publication_date'), 'version.publication_date')
        if v.get('effective_date'):
            _date(v['effective_date'], 'version.effective_date')
        if not isinstance(v.get('text'), str) or not v['text'].strip():
            raise ValueError(f'official full article text is required: {v["id"]}')
        if not _SHA.fullmatch(v.get('text_sha256', '')) or text_sha256(v['text']) != v['text_sha256']:
            raise ValueError(f'article text checksum mismatch: {v["id"]}')
        if v.get('source_id') not in sources:
            raise ValueError(f'unknown source_id: {v["id"]}')
        _url(v.get('source_url'), 'version.source_url')
        for event_id in v.get('event_ids', []):
            if event_id not in events:
                raise ValueError(f'unknown event_id: {event_id}')
    for e in events.values():
        _date(e.get('publication_date'), 'event.publication_date')
        if not isinstance(e.get('text'), str) or not e['text'].strip():
            raise ValueError(f'event original text is required: {e["id"]}')
        if e.get('source_id') not in sources:
            raise ValueError(f'unknown source_id: {e["id"]}')
        if e.get('pcode') is not None and e['pcode'] not in CODES:
            raise ValueError(f'unsupported event pcode: {e["id"]}')
        if e.get('source_url'):
            _url(e['source_url'], 'event.source_url')
    return history


def load_official_history(root):
    """Load and check every archived source and exact article-text digest.

    Return None for older installations with no optional history dataset.
    """
    root = Path(root)
    path = root / 'technical/official-history.json'
    if not path.exists():
        return None
    history = json.loads(path.read_text(encoding='utf-8-sig'))
    return _validate(history, root)


def apply_official_history(projection, history):
    """Return a new projection; never change an existing version ID/body.

    Same law/article/date overlaps are attached as provenance to the retained
    raw version only when its exact text matches.  Different text is reported,
    not silently promoted to an amendment or used to replace the old body.
    """
    result = deepcopy(projection)
    if history is None:
        return result
    _validate(history)
    all_versions = result.setdefault('article_versions', [])
    imported = result.get('imported_versions', [])
    by_date, by_id = {}, {}
    for v in all_versions + imported:
        key = (v['pcode'], v['article_key'], v['publication_date'])
        by_date.setdefault(key, []).append(v)
        by_id[v['id']] = v
    report = {'appended': 0, 'matched_existing': 0, 'conflicts': [], 'effective_metadata_conflicts': []}
    for item in sorted(history['versions'], key=lambda v: (v['publication_date'], v['id'])):
        v = deepcopy(item)
        key = (v['pcode'], v['article_key'], v['publication_date'])
        existing = by_date.get(key, [])
        matched = [x for x in existing if text_sha256(x['text']) == v['text_sha256']]
        if existing:
            if not matched:
                report['conflicts'].append({
                    'history_version_id': v['id'], 'pcode': v['pcode'], 'article_key': v['article_key'],
                    'publication_date': v['publication_date'], 'existing_ids': [x['id'] for x in existing],
                    'history_text_sha256': v['text_sha256'],
                    'existing_text_sha256': [text_sha256(x['text']) for x in existing],
                    'whitespace_equivalent': any(re.sub(r'\s+', '', x['text']) == re.sub(r'\s+', '', v['text']) for x in existing),
                })
                continue
            provenance = {k: deepcopy(value) for k, value in v.items() if k != 'text'}
            for target in matched:
                if target['id'] != v['id']:
                    refs = target.setdefault('official_history_provenance', [])
                    if not any(x['id'] == v['id'] for x in refs):
                        refs.append(provenance)
                target.setdefault('history_source_url', v['source_url'])
                if v.get('event_ids'):
                    target['event_ids'] = list(dict.fromkeys(target.get('event_ids', []) + v['event_ids']))
                for field in ['source_id', 'comparison_url', 'explanation_url', 'is_history_baseline', 'baseline_note', 'article_status', 'is_historical_only', 'effective_note', 'effective_date_note', 'snapshot_id', 'text_sha256', 'article_links', 'article_images', 'note']:
                    if field in v and target.get(field) in [None, '', []]:
                        target[field] = deepcopy(v[field])
                for field in ['effective_date', 'effective_warning', 'article_amendment_date', 'publication_order']:
                    if v.get(field) is None:
                        continue
                    if target.get(field) in [None, '']:
                        target[field] = deepcopy(v[field])
                    elif target[field] != v[field]:
                        report['effective_metadata_conflicts'].append({'id': target['id'], 'field': field, 'existing': target[field], 'official_history': v[field]})
            report['matched_existing'] += 1
            continue
        if v['id'] in by_id:
            raise ValueError(f'history version ID collides with another retained version: {v["id"]}')
        v.setdefault('heading', '第' + v['article_key'] + '條')
        v.setdefault('source_kind', 'official_history')
        v.setdefault('history_source_url', v['source_url'])
        v.setdefault('effective_date', None)
        v.setdefault('note', '')
        v.setdefault('is_preferred', False)
        all_versions.append(v)
        by_date[key] = [v]
        by_id[v['id']] = v
        report['appended'] += 1
    result['official_history_sources'] = deepcopy(history['sources'])
    result['official_history_events'] = deepcopy(history['events'])
    result['official_history_coverage'] = deepcopy(history.get('coverage', {}))
    result['official_history_import_report'] = report
    result.setdefault('counts', {}).update(official_history_versions=len(history['versions']), official_history_events=len(history['events']), official_history_sources=len(history['sources']))
    return result


def write_official_history_tables(con, history):
    """Replace dedicated official-history tables inside the caller's transaction.

    No commit or connection close is performed.  Rebuilds reproduce these
    tables from the validated durable JSON, leaving manual-update tables alone.
    Original metadata keys are retained in metadata_json.
    """
    if history is None:
        return {'skipped': True}
    _validate(history)
    if not con.in_transaction:
        con.execute('BEGIN')
    con.execute('CREATE TABLE IF NOT EXISTS technical_official_history_sources(id TEXT PRIMARY KEY,url TEXT NOT NULL,sha256 TEXT NOT NULL,metadata_json TEXT NOT NULL)')
    con.execute('CREATE TABLE IF NOT EXISTS technical_official_history_versions(id TEXT PRIMARY KEY,pcode TEXT NOT NULL,article_key TEXT NOT NULL,publication_date TEXT NOT NULL,effective_date TEXT,source_id TEXT NOT NULL REFERENCES technical_official_history_sources(id),text_sha256 TEXT NOT NULL,metadata_json TEXT NOT NULL)')
    con.execute('CREATE TABLE IF NOT EXISTS technical_official_history_events(id TEXT PRIMARY KEY,publication_date TEXT NOT NULL,source_id TEXT NOT NULL REFERENCES technical_official_history_sources(id),metadata_json TEXT NOT NULL)')
    con.execute('CREATE INDEX IF NOT EXISTS technical_official_history_article ON technical_official_history_versions(pcode,article_key,publication_date)')
    for table in ['technical_official_history_versions', 'technical_official_history_events', 'technical_official_history_sources']:
        con.execute('DELETE FROM ' + table)
    payload = lambda row: json.dumps(row, ensure_ascii=False, sort_keys=True)
    con.executemany('INSERT INTO technical_official_history_sources VALUES(?,?,?,?)', [(s['id'], s['url'], s['sha256'], payload(s)) for s in history['sources']])
    con.executemany('INSERT INTO technical_official_history_versions VALUES(?,?,?,?,?,?,?,?)', [(v['id'], v['pcode'], v['article_key'], v['publication_date'], v.get('effective_date'), v['source_id'], v['text_sha256'], payload(v)) for v in history['versions']])
    con.executemany('INSERT INTO technical_official_history_events VALUES(?,?,?,?)', [(e['id'], e['publication_date'], e['source_id'], payload(e)) for e in history['events']])
    return {'sources': len(history['sources']), 'versions': len(history['versions']), 'events': len(history['events'])}
