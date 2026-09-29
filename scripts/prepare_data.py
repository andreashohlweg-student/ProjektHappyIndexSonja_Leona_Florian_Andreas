"""Reproduzierbarer XLSX -> JSON/CSV/PostgreSQL Import. Nur Python-Standardbibliothek.
Kein Download beim normalen App-Start. --download aktualisiert die lokale Rohdatei.
"""
import argparse
import collections
import csv
from datetime import datetime, timezone
import hashlib
import io
import json
import math
from pathlib import Path
import re
import unicodedata
import urllib.request
import xml.etree.ElementTree as ET
import zipfile

ROOT = Path(__file__).resolve().parents[1]
URL = 'https://files.worldhappiness.report/WHR26_Data_Figure_2.1.xlsx'
RAW = ROOT / 'data/raw/WHR26_Data_Figure_2.1.xlsx'
NS = {'x': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
FACTORS = ['gdp', 'socialSupport', 'healthyLife', 'freedom', 'generosity', 'corruption', 'residual']
SQL_FACTORS = ['gdp_contribution', 'social_support_contribution', 'healthy_life_contribution',
               'freedom_contribution', 'generosity_contribution', 'corruption_contribution', 'dystopia_residual']

def read_rows(path):
    with zipfile.ZipFile(path) as z:
        strings = []
        if 'xl/sharedStrings.xml' in z.namelist():
            strings = [''.join(n.itertext()) for n in ET.fromstring(z.read('xl/sharedStrings.xml'))]
        for row in ET.fromstring(z.read('xl/worksheets/sheet1.xml')).findall('.//x:row', NS):
            values = [None] * 13
            for cell in row.findall('x:c', NS):
                letters = re.sub(r'\d', '', cell.attrib['r'])
                col = 0
                for ch in letters:
                    col = col * 26 + ord(ch) - 64
                if col > 13:
                    continue
                v = cell.find('x:v', NS)
                kind = cell.attrib.get('t')
                if kind == 'inlineStr':
                    value = ''.join(cell.find('x:is', NS).itertext())
                elif v is None or v.text is None:
                    value = None
                elif kind == 's':
                    value = strings[int(v.text)]
                elif kind == 'e':
                    raise ValueError(f'Excel error in {cell.attrib["r"]}: {v.text}')
                else:
                    value = float(v.text)
                values[col - 1] = value
            yield values

def slug(name):
    ascii_name = unicodedata.normalize('NFKD', name).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]+', '-', ascii_name.lower()).strip('-')

def sql_value(v):
    if v is None:
        return 'NULL'
    if isinstance(v, (float, int)):
        if not math.isfinite(v):
            raise ValueError('Non-finite numeric value')
        return str(v)
    return "'" + str(v).replace("'", "''") + "'"

def insert(table, columns, rows):
    lines = []
    for pos in range(0, len(rows), 100):
        body = ',\n'.join('(' + ','.join(map(sql_value, row)) + ')' for row in rows[pos:pos+100])
        lines.append(f'INSERT INTO {table} ({",".join(columns)}) VALUES\n{body};')
    return '\n'.join(lines)

def main():
    args = argparse.ArgumentParser()
    args.add_argument('--download', action='store_true')
    opt = args.parse_args()
    if opt.download:
        RAW.parent.mkdir(parents=True, exist_ok=True)
        with urllib.request.urlopen(URL, timeout=60) as response:
            RAW.write_bytes(response.read())
        (RAW.parent / 'source.json').write_text(json.dumps({'retrievedOn': datetime.now(timezone.utc).date().isoformat()}, indent=2), encoding='utf-8')
    aliases = json.loads((ROOT / 'data/country-aliases.json').read_text())
    values = list(read_rows(RAW))
    assert values[0][:4] == ['Year', 'Rank', 'Country name', 'Life evaluation (3-year average)'], 'Source schema changed'
    records, countries, keys = [], {}, set()
    alias_count = 0
    for row in values[1:]:
        if row[0] is None:
            continue
        assert isinstance(row[0], (float, int)), f'Unexpected row: {row}'
        year, rank = int(row[0]), int(row[1])
        assert year == row[0] and rank == row[1] and rank > 0
        original = unicodedata.normalize('NFC', str(row[2]).strip())
        name = aliases.get(original, original)
        alias_count += name != original
        cid = slug(name)
        assert cid not in countries or countries[cid] == name, 'Slug collision'
        countries[cid] = name
        assert (cid, year) not in keys, 'Duplicate country/year after alias normalization'
        keys.add((cid, year))
        score, low, high = row[3:6]
        assert score is not None and 0 <= score <= 10
        assert (low is None) == (high is None), 'Partial confidence interval'
        assert low is None or low <= score <= high
        record = {'countryId': cid, 'countryName': name, 'sourceCountryName': original,
                  'year': year, 'rank': rank, 'score': score, 'lower': low, 'upper': high,
                  'factors': dict(zip(FACTORS, row[6:13]))}
        for value in [score, low, high, *record['factors'].values()]:
            assert value is None or math.isfinite(value)
        records.append(record)
    records.sort(key=lambda r: (r['year'], r['rank'], r['countryId']))
    years = sorted({r['year'] for r in records})
    counts = collections.Counter(r['year'] for r in records)
    metadata = {
        'title': 'World Happiness Report 2026 · Figure 2.1', 'sourceUrl': URL,
        'sourcePage': 'https://www.worldhappiness.report/data-sharing/',
        'sourceReportYear': 2026, 'retrievedOn': json.loads((RAW.parent / 'source.json').read_text(encoding='utf-8'))['retrievedOn'],
        'sourceSha256': hashlib.sha256(RAW.read_bytes()).hexdigest(),
        'yearMeaning': 'Originalspalte Year (Quellenjahr), kein einzelnes Befragungsjahr',
        'knownLatestPeriod': {'year': 2025, 'from': 2023, 'to': 2025},
        'years': years, 'missingYears': sorted(set(range(min(years), max(years)+1))-set(years)),
        'rowCount': len(records), 'countryCount': len(countries), 'aliasedRows': alias_count,
        'rowsPerYear': dict(counts),
        'missingFactors': {key: sum(r['factors'][key] is None for r in records) for key in FACTORS},
        'missingConfidenceIntervals': sum(r['lower'] is None for r in records),
        'licenseNote': 'Vom Herausgeber kostenlos zum Download bereitgestellt. Keine ausdrückliche CC0-Lizenz auf der Datenseite gefunden; Quellrechte bleiben beim Herausgeber. Neon-CC0 nicht übertragen.',
        'normalization': ['Unicode NFC und äußere Leerzeichen', 'Swaziland → Eswatini; Originalname erhalten',
                          'Fehlende Werte → null; keine Interpolation', 'Originalpräzision erhalten; Rundung nur in der Anzeige',
                          '2013 nicht ergänzt; keine Vermischung mit Neon 2019'],
    }
    clean = ROOT / 'data/clean'
    clean.mkdir(parents=True, exist_ok=True)
    (clean / 'observations.json').write_text(json.dumps(records, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    (clean / 'metadata.json').write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    country_rows = [{'id': k, 'name': v} for k,v in sorted(countries.items(), key=lambda x:x[1])]
    (clean / 'countries.json').write_text(json.dumps(country_rows, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    with (clean / 'observations.csv').open('w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['country_id','source_country_name','source_year','source_rank','score','ci_lower','ci_upper',*SQL_FACTORS])
        writer.writerows([[r['countryId'],r['sourceCountryName'],r['year'],r['rank'],r['score'],r['lower'],r['upper'],*r['factors'].values()] for r in records])
    schema = '''-- Generated by scripts/prepare_data.py; do not edit generated files.
BEGIN;
CREATE TABLE countries (id text PRIMARY KEY, name text NOT NULL UNIQUE);
CREATE TABLE observations (
 country_id text NOT NULL REFERENCES countries(id), source_country_name text NOT NULL,
 source_year integer NOT NULL, source_rank integer NOT NULL CHECK (source_rank > 0),
 score double precision NOT NULL CHECK (score BETWEEN 0 AND 10),
 ci_lower double precision, ci_upper double precision,
 gdp_contribution double precision, social_support_contribution double precision,
 healthy_life_contribution double precision, freedom_contribution double precision,
 generosity_contribution double precision, corruption_contribution double precision,
 dystopia_residual double precision,
 PRIMARY KEY (country_id, source_year),
 CHECK ((ci_lower IS NULL AND ci_upper IS NULL) OR (ci_lower IS NOT NULL AND ci_upper IS NOT NULL AND ci_lower <= score AND score <= ci_upper))
);
COMMIT;
'''
    (ROOT / 'db/init/001_schema.sql').write_text(schema)
    seed = 'BEGIN;\n' + insert('countries',['id','name'],[[r['id'],r['name']] for r in country_rows]) + '\n'
    columns = ['country_id','source_country_name','source_year','source_rank','score','ci_lower','ci_upper',*SQL_FACTORS]
    seed += insert('observations',columns,[[r['countryId'],r['sourceCountryName'],r['year'],r['rank'],r['score'],r['lower'],r['upper'],*r['factors'].values()] for r in records])
    seed += '\nCOMMIT;\n'
    (ROOT / 'db/init/002_seed.sql').write_text(seed, encoding='utf-8')
    print(json.dumps({'records':len(records),'countries':len(countries),'years':years,'aliases':alias_count,'sha256':metadata['sourceSha256']},ensure_ascii=False))

if __name__ == '__main__':
    main()
