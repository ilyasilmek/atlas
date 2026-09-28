#!/usr/bin/env python3
"""Fetch pinned Open Prompts source and add mobile API. Does not deploy."""
from pathlib import Path
import shutil
import subprocess
root=Path(__file__).resolve().parent
dest=root/'open-prompts'
revision='91c6b951e08d3033abe06f6b130e914e2178d0b9'
if dest.exists():raise SystemExit('backend/open-prompts zaten var; mevcut dosyalar korunuyor.')
subprocess.run(['git','clone','https://github.com/rudy2steiner/open-prompts.git',str(dest)],check=True)
subprocess.run(['git','-C',str(dest),'checkout',revision],check=True)
shutil.copytree(root/'overlay',dest,dirs_exist_ok=True)
shutil.copy2(dest/'.env.example',dest/'.env.local')
print('Hazır:',dest)
print('.env.local dosyasını doldurun; npm install, migrasyonlar ve npm run dev adımlarını izleyin.')
