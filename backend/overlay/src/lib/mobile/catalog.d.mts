export function parseQuery(url: URL): {limit:number;cursor:number|null;q:string;category:string;model:string};
export function escapeLike(value:string):string;
export function publicItem(row:{slug:string;title:string;status:string;visibility:string;prompt:string|null;description?:string|null;model?:string|null;category?:string|null;tags?:string[]|null;images?:string[]|null;sourceUrl?:string|null;authorHandle?:string|null;createdAt?:Date|string|null},origin:string):Record<string,unknown>|null;
