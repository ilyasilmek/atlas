#!/usr/bin/env python3
"""Validate the actual bundled collection, not generated fixtures."""
import hashlib,json
from pathlib import Path
from collections import Counter
from PIL import Image
root=Path(__file__).resolve().parents[1];assets=root/'app/src/main/assets'
p=json.loads((assets/'catalog/catalog.json').read_text());items=p['items'];ids=set();prompts=set();image_hashes=set();counts=Counter()
assert len(items)>=1000
for v in items:
 assert v['id'] not in ids;ids.add(v['id'])
 h=hashlib.sha256(' '.join(v['prompt'].lower().split()).encode()).hexdigest()
 assert h not in prompts;prompts.add(h)
 assert v['prompt'].strip() and v['title'].strip() and v['images']
 assert v['sourceName'] and v['sourceId'] and v['license'] and v['licenseUrl'].startswith('https://')
 assert all(im.startswith('https://') for im in v['images'])
 assert v.get('demoArtwork') is None
 path=assets/v['previewImage'].removeprefix('file:///android_asset/')
 image_hash=hashlib.sha256(path.read_bytes()).hexdigest()
 assert image_hash not in image_hashes;image_hashes.add(image_hash)
 with Image.open(path) as im:im.verify()
 counts[v['sourceId']]+=1
assert len(counts)==3 and p['total']==len(items)
print(json.dumps({'verifiedPairs':len(items),'sources':dict(counts),'uniqueIds':len(ids),'uniquePrompts':len(prompts)},indent=2))
