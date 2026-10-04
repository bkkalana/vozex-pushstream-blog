type Node={type?:string;text?:string;attrs?:Record<string,unknown>;content?:Node[]};
export type TocItem={id:string;level:2|3;title:string};
export function plainText(node:Node):string { return node.text ?? (node.content??[]).map(plainText).join(""); }
export function slugifyHeading(input:string){return input.toLowerCase().trim().replace(/[^a-z0-9\s-]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-").slice(0,80)||"section";}
export function extractToc(doc:unknown):TocItem[]{
  const root=doc as Node; const used=new Map<string,number>(); const out:TocItem[]=[];
  for(const n of root?.content??[]){ if(n.type!=="heading")continue; const level=Number(n.attrs?.level??2); if(level!==2&&level!==3)continue; const title=plainText(n).trim(); if(!title)continue; const base=slugifyHeading(title); const count=used.get(base)??0; used.set(base,count+1); out.push({id:count?`${base}-${count+1}`:base,level:level as 2|3,title}); }
  return out;
}
