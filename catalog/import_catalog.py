#!/usr/bin/env python3
"""Pinned multi-source image/prompt importer. Requires Pillow; no API key.
python3 catalog/import_catalog.py --workers 8
Source IDs, original prompt text, attribution and per-item URLs are preserved.
"""
import argparse, concurrent.futures as cf, hashlib, io, json, re, time, urllib.request, urllib.parse
from pathlib import Path
from collections import defaultdict
from PIL import Image, ImageOps
ROOT=Path(__file__).resolve().parents[1]
CACHE=ROOT/'.catalog-cache'; ASSETS=ROOT/'app/src/main/assets'; THUMBS=ASSETS/'catalog/images'
BLOCK=re.compile(r'\b(nsfw|nude|naked|porn|erotic|lingerie|bikini|gore|bloodbath)\b',re.I)
def read_url(url):
 path=CACHE/hashlib.sha256(url.encode()).hexdigest()
 if path.exists(): return path.read_bytes()
 for attempt in range(3):
  try:
   req=urllib.request.Request(url,headers={'User-Agent':'PromptAtlas-Catalog/0.2'})
   with urllib.request.urlopen(req,timeout=25) as r: data=r.read(20*1024*1024+1)
   if len(data)>20*1024*1024: raise ValueError('File exceeds 20 MiB')
   path.write_bytes(data);return data
  except Exception:
   if attempt==2:raise
   time.sleep(attempt+1)
def raw(s,path):return 'https://raw.githubusercontent.com/'+s['repository']+'/'+s['revision']+'/'+urllib.parse.quote(path,safe='/')
def text(s,path):return read_url(raw(s,path)).decode('utf-8')
def category(value):
 t=value.lower()
 for cat,words in [('portraitPhoto',['portrait','fashion','photograph','selfie']),('scenes',['landscape','cityscape','landmark','architecture','environment','scenery','travel']),('productCommercial',['product','commercial','advertis','branding','packaging','food']),('gameFantasy',['game','fantasy','character','creature','sci-fi']),('designUi',['typography','diagram','infograph','layout','poster','design','ui'])]:
  if any(w in t for w in words):return cat
 return 'artStyles'
def base(s,key,title,prompt,images,**extra):
 return dict(id=s['id']+':'+key,title=title,prompt=prompt,images=images,sourceId=s['id'],sourceName=s['name'],license=s['license'],licenseUrl='https://github.com/'+s['repository']+'/blob/'+s['revision']+'/LICENSE',catalogUrl='https://github.com/'+s['repository'],**extra)
def open_prompts(s):
 for v in json.loads(text(s,'src/data/imports/gpt-image2-prompts.json')):
  if not v.get('prompt') or not v.get('images'):continue
  p=v['prompt'];key=hashlib.sha256((v.get('source_url','')+'\n'+p).encode()).hexdigest()[:20]
  yield base(s,key,v['title'],p,[raw(s,'public/'+im.lstrip('/')) for im in v['images']],description=v.get('description',''),model='GPT Image 2',category=category(v['title']+' '+' '.join(v.get('tags',[]))),tags=v.get('tags',[]),sourceUrl=v.get('source_url'),authorHandle=v.get('user_name'),requiresReference=bool(re.search(r'upload|reference image|attached|input image',p,re.I)))
def chaos_gallery(s):
 index=json.loads(text(s,'works/index.json'));topics={v['id']:v for v in index['topics']};groups=defaultdict(list)
 for v in index['images']:
  if v.get('status')!='done' or v.get('refs') or v.get('generation',{}).get('depends_on') or v.get('generation',{}).get('ref_urls'):continue
  groups[v['topic_id']].append(v)
 ordered=[]
 while any(groups.values()):
  for key in sorted(groups):
   if groups[key]:ordered.append(groups[key].pop(0))
 for v in ordered:yield dict(_source=s,_chaos=v,_topic=topics[v['topic_id']])
def jamez_gallery(s):
 with cf.ThreadPoolExecutor(max_workers=8) as pool:
  list(pool.map(lambda n:text(s,f'cases/{n}/ATTRIBUTION.yml'),range(65,101)))
 blocks=re.split(r'<a id="cases-(\d+)"></a>',text(s,'README_en.md'))
 emitted=0
 for n in range(1,len(blocks)-1,2):
  num,body=blocks[n],blocks[n+1]
  title=re.search(r'### Case \d+: (.*?) \(by ',body);prompt=re.search(r'\*\*Prompt\*\*\s*```[^\n]*\n(.*?)```',body,re.S);images=re.findall(r'<img src="(cases/[^\"]+)"',body)
  if not(title and prompt and images):continue
  attr=text(s,f'cases/{num}/ATTRIBUTION.yml');lic=re.search(r'^license:\s*(.+)$',attr,re.M)
  if not lic or lic[1].strip()!='CC-BY-4.0':continue
  (ROOT/'catalog/attribution').mkdir(exist_ok=True);(ROOT/'catalog/attribution'/f'gpt4o-{num}.yml').write_text(attr)
  author=re.search(r'^prompt_author:\s*"?([^"\n]+)',attr,re.M);p=prompt[1].strip();source=re.search(r'\[Source Link\]\(([^)]+)\)',body)
  yield base(s,num,title[1],p,[raw(s,images[0])],description='Görsel: © 2025 @jamez-bondos · Prompt: '+(author[1] if author else 'kaynak yazarı'),model='GPT-4o / gpt-image-1',category=category(title[1]),tags=[],sourceUrl=source[1] if source else 'https://github.com/'+s['repository']+'#cases-'+num,authorHandle=author[1] if author else None,requiresReference=bool(re.search(r'upload|reference|attached|photo provided|provided image',p,re.I)),attribution='Image © 2025 @jamez-bondos · CC BY 4.0; prompt attribution retained. Preview resized and WebP compressed.')
  emitted+=1
  if emitted>=s['limit']:break
ADAPTERS={'open_prompts':open_prompts,'chaos_gallery':chaos_gallery,'jamez_gallery':jamez_gallery}
def complete(v):
 try:
  if '_chaos' in v:
   s,c,t=v['_source'],v['_chaos'],v['_topic'];m=json.loads(text(s,c['meta_path']));p=m.get('prompt','')
   if not p.strip() or m.get('refs') or m.get('generation',{}).get('ref_urls'):return None
   v=base(s,c['id'],t['title']+' · '+c['title'],p,[raw(s,c['image'])],description=c.get('description',''),model='GPT Image 2',category=category((t.get('category') or '')+' '+t['title']),tags=c.get('tags',[]),sourceUrl='https://github.com/'+s['repository']+'/blob/'+s['revision']+'/'+c['meta_path'],authorHandle='ChaosRealmsAI',requiresReference=False)
   v['_thumb']=raw(s,str(Path(c['image']).with_name('image.w400.webp')))
  if BLOCK.search(v['title']+' '+v['prompt']) or not v.get('prompt','').strip():return None
  data=read_url(v.pop('_thumb',v['images'][0]));im=Image.open(io.BytesIO(data));im.load()
  if min(im.size)<64:raise ValueError('Tiny image')
  im=ImageOps.exif_transpose(im).convert('RGB');im.thumbnail((360,360))
  name=hashlib.sha256(v['id'].encode()).hexdigest()[:24]+'.webp';im.save(THUMBS/name,'WEBP',quality=72,method=4)
  v['previewImage']='file:///android_asset/catalog/images/'+name
  v.setdefault('attribution','Kaynak ve prompt korunmuştur. Önizleme küçültülmüş ve WebP biçiminde sıkıştırılmıştır.')
  return v
 except Exception as e:return {'_error':str(e),'id':v.get('id',v.get('_chaos',{}).get('id'))}
def main():
 parser=argparse.ArgumentParser();parser.add_argument('--workers',type=int,default=8);args=parser.parse_args()
 CACHE.mkdir(exist_ok=True);THUMBS.mkdir(parents=True,exist_ok=True)
 sources=json.loads((ROOT/'catalog/sources.json').read_text());allrows=[];errors=[];seen=set();counts={}
 for s in sources:
  print('Importing',s['name'],flush=True);(ROOT/'catalog/licenses').mkdir(exist_ok=True)
  license_text=text(s,'LICENSE')
  (ROOT/'catalog/licenses'/f"{s['id']}.txt").write_text(license_text)
  (ASSETS/'catalog/licenses').mkdir(exist_ok=True)
  (ASSETS/'catalog/licenses'/f"{s['id']}.txt").write_text(license_text)
  candidates=list(ADAPTERS[s['adapter']](s));accepted=[]
  with cf.ThreadPoolExecutor(max_workers=args.workers) as pool:
   for start in range(0,len(candidates),64):
    for v in pool.map(complete,candidates[start:start+64]):
     if v and '_error' in v:errors.append(v)
     elif v:
      h=hashlib.sha256(' '.join(v['prompt'].lower().split()).encode()).hexdigest()
      if h not in seen and len(accepted)<s['limit']:seen.add(h);accepted.append(v)
    print(s['id'],min(start+64,len(candidates)),'checked,',len(accepted),'accepted;',len(errors),'download failures',flush=True)
    if len(accepted)>=s['limit']:break
  counts[s['id']]=len(accepted);allrows.append(accepted);print('Accepted',s['name'],len(accepted),flush=True)
 result=[]
 while any(allrows):
  for group in allrows:
   if group:result.append(group.pop(0))
 unique=[];image_hashes=set()
 for v in result:
  h=hashlib.sha256((THUMBS/v['previewImage'].split('/')[-1]).read_bytes()).hexdigest()
  if h not in image_hashes:image_hashes.add(h);unique.append(v)
 result=unique
 counts={s['id']:sum(v['sourceId']==s['id'] for v in result) for s in sources}
 if len(result)<1000:raise RuntimeError(f'Only {len(result)} items; existing catalog preserved. Errors: {errors[:3]}')
 page={'apiVersion':1,'items':result,'total':len(result),'categories':sorted({v['category'] for v in result}),'models':sorted({v['model'] for v in result})}
 (ASSETS/'catalog/catalog.json').write_text(json.dumps(page,ensure_ascii=False,indent=2))
 retained={v['previewImage'].split('/')[-1] for v in result}
 for p in THUMBS.glob('*.webp'):
  if p.name not in retained:p.unlink()
 report={'count':len(result),'sources':counts,'failedDownloads':errors,'imageCount':len(retained),'duplicatePolicy':'normalized exact prompt hash and exact encoded preview hash','revisions':{s['id']:s['revision'] for s in sources}}
 (ROOT/'catalog/import-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report)[:1500],flush=True)
if __name__=='__main__':main()
