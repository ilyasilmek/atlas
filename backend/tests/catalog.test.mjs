import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseQuery,publicItem,escapeLike} from '../overlay/src/lib/mobile/catalog.mjs';
const row={slug:'example',title:'Example',prompt:'Full\nprompt',status:'approved',visibility:'public',images:['/images/a.webp'],submittedBy:null};
test('only approved and public records are returned, even without owner',()=>{
 for(const visibility of ['private','draft'])assert.equal(publicItem({...row,visibility},'https://example.org'),null);
 for(const status of ['pending','rejected'])assert.equal(publicItem({...row,status},'https://example.org'),null);
 assert.equal(publicItem({...row,prompt:' '},'https://example.org'),null);
});
test('image URLs are normalized and unsafe schemes or credentials removed',()=>{
 const p=publicItem({...row,images:['/a.webp','javascript:alert(1)','https://u:p@host/a']},'https://example.org');
 assert.deepEqual(p.images,['https://example.org/a.webp']);assert.equal(p.prompt,'Full\nprompt');assert.equal('submittedBy' in p,false);
});
test('cursors, filters and limits are validated',()=>{
 for(const q of ['limit=0','limit=61','limit=1.5','cursor=-1','cursor=NaN','cursor=999999999999999999',`q=${'x'.repeat(161)}`])assert.throws(()=>parseQuery(new URL(`https://host/?${q}`)));
 assert.equal(parseQuery(new URL('https://host/?cursor=123')).cursor,123);
});
test('search wildcards remain literal',()=>{assert.equal(escapeLike('50%_\\'),'50\\%\\_\\\\');});
