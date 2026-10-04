
export type MenuStructureNode={id:string;parentId:string|null;sortOrder:number};
export function validateMenuStructure(nodes:MenuStructureNode[],maxDepth=4){
  const ids=new Set(nodes.map(x=>x.id));if(ids.size!==nodes.length)throw new Error("Duplicate menu item IDs");
  const parentMap=new Map(nodes.map(n=>[n.id,n.parentId]));
  for(const n of nodes){
    if(n.parentId&&(!ids.has(n.parentId)||n.parentId===n.id))throw new Error("Invalid menu nesting");
    let p=n.parentId,depth=0;
    while(p){if(p===n.id)throw new Error("Menu nesting cycle detected");if(depth++>=maxDepth)throw new Error("Menu nesting depth limit exceeded");p=parentMap.get(p)??null}
  }
  return true;
}
