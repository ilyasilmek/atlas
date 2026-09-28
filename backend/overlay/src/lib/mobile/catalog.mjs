export function parseQuery(url) {
 const l=url.searchParams.get('limit')??'30',cursor=url.searchParams.get('cursor'),limit=Number(l);
 if(!/^\d+$/.test(l)||!Number.isSafeInteger(limit)||limit<1||limit>60)throw new Error('invalid limit');
 if(cursor!==null&&(!/^\d+$/.test(cursor)||!Number.isSafeInteger(Number(cursor))||Number(cursor)<=0))throw new Error('invalid cursor');
 const q=(url.searchParams.get('q')??'').trim(),category=(url.searchParams.get('category')??'').trim(),model=(url.searchParams.get('model')??'').trim();
 if(q.length>160||category.length>100||model.length>100)throw new Error('filter too long');
 return {limit,cursor:cursor===null?null:Number(cursor),q,category,model};
}
export function escapeLike(value){return value.replace(/[\\%_]/g,'\\$&');}
export function publicItem(row,origin){
 if(row.status!=='approved'||row.visibility!=='public'||!row.prompt?.trim())return null;
 const safeUrl=(value)=>{if(typeof value!=='string'||!value.trim())return null;try{const u=new URL(value,origin);return ['https:','http:'].includes(u.protocol)&&!u.username&&!u.password?u.toString():null;}catch{return null;}};
 return {id:row.slug,title:row.title,description:row.description??'',prompt:row.prompt,model:row.model??'',category:row.category??'',tags:(row.tags??[]).filter(x=>typeof x==='string'),images:(row.images??[]).map(safeUrl).filter(Boolean),sourceUrl:safeUrl(row.sourceUrl),authorHandle:row.authorHandle??null,createdAt:row.createdAt?new Date(row.createdAt).toISOString():null};
}
