import { NextResponse } from 'next/server';
import { and,count,desc,eq,ilike,lt,or,sql,type SQL } from 'drizzle-orm';
import { getDb } from '~/db/client';
import { prompts } from '~/db/schema';
import { escapeLike,parseQuery,publicItem } from '~/lib/mobile/catalog.mjs';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
/** Read-only mobile API. Explicit visibility filtering includes legacy owner-less rows. */
export async function GET(request:Request){
 const url=new URL(request.url);let query:ReturnType<typeof parseQuery>;
 try{query=parseQuery(url);}catch{return NextResponse.json({error:'invalid_query'},{status:400,headers});}
 const db=getDb();if(!db)return NextResponse.json({error:'database_not_configured'},{status:503,headers});
 try{
  const publicOnly=and(eq(prompts.status,'approved'),eq(prompts.visibility,'public'),sql`length(trim(${prompts.prompt})) > 0`);
  const filters:SQL[]=[publicOnly!];
  if(query.q){const pattern=`%${escapeLike(query.q)}%`;filters.push(or(ilike(prompts.title,pattern),ilike(prompts.prompt,pattern),ilike(prompts.description,pattern),ilike(prompts.model,pattern),sql`array_to_string(${prompts.tags}, ' ') ILIKE ${pattern}`)!);}
  if(query.category)filters.push(eq(prompts.category,query.category));
  if(query.model)filters.push(eq(prompts.model,query.model));
  const paging=[...filters];if(query.cursor!==null)paging.push(lt(prompts.id,query.cursor));
  const [rows,totals,categories,models]=await Promise.all([
   db.select().from(prompts).where(and(...paging)).orderBy(desc(prompts.id)).limit(query.limit+1),
   db.select({value:count()}).from(prompts).where(and(...filters)),
   db.selectDistinct({value:prompts.category}).from(prompts).where(publicOnly),
   db.selectDistinct({value:prompts.model}).from(prompts).where(publicOnly),
  ]);
  const selected=rows.slice(0,query.limit);
  return NextResponse.json({apiVersion:1,items:selected.map(row=>publicItem(row,process.env.NEXT_PUBLIC_SITE_URL?.trim()||url.origin)).filter(Boolean),nextCursor:rows.length>query.limit?String(selected[selected.length-1].id):null,total:Number(totals[0]?.value??0),categories:categories.map(r=>r.value).filter((x):x is string=>!!x).sort(),models:models.map(r=>r.value).filter((x):x is string=>!!x).sort()},{headers});
 }catch{return NextResponse.json({error:'catalog_unavailable'},{status:500,headers});}
}
