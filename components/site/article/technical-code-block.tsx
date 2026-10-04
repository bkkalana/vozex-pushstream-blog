"use client";
import { useMemo,useState } from "react";
import { Check,Copy } from "lucide-react";

const SUPPORTED=new Set(["javascript","typescript","json","bash","sql","php","css","html","python"]);
export function TechnicalCodeBlock({code,language,filename,lineNumbers=false}:{code:string;language?:string|null;filename?:string|null;lineNumbers?:boolean}){
 const [copied,setCopied]=useState(false);const lang=SUPPORTED.has(String(language||"").toLowerCase())?String(language).toLowerCase():"text";
 const lines=useMemo(()=>code.replace(/\n$/," ").split("\n"),[code]);
 async function copy(){await navigator.clipboard.writeText(code);setCopied(true);setTimeout(()=>setCopied(false),1400)}
 return <figure className="my-6 overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 text-slate-100">
  <figcaption className="flex min-h-11 items-center justify-between gap-3 border-b border-slate-700 px-4 py-2 text-xs text-slate-300">
   <span className="min-w-0 truncate">{filename||lang}</span><button type="button" onClick={copy} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-600 px-3 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="Copy code to clipboard">{copied?<Check size={15}/>:<Copy size={15}/>} {copied?"Copied":"Copy"}</button>
  </figcaption>
  <pre className="max-w-full overflow-x-auto p-4 text-[13px] leading-6" tabIndex={0} aria-label={`${lang} code block`}><code>{lines.map((line,i)=><span key={i} className="block min-w-max"><span aria-hidden={!lineNumbers} className={lineNumbers?"mr-4 inline-block w-8 select-none text-right text-slate-500":"hidden"}>{i+1}</span><Highlighted line={line} language={lang}/></span>)}</code></pre>
 </figure>
}
function Highlighted({line,language}:{line:string;language:string}){if(language==="text")return <>{line||" "}</>;const parts=line.split(/(\/\/.*$|#.*$|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:const|let|var|function|return|if|else|for|while|class|import|from|export|async|await|SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|ALTER|true|false|null|None|def|print)\b|\b\d+(?:\.\d+)?\b)/g);return <>{parts.map((p,i)=>{const c=/^(\/\/|#)/.test(p)?"text-emerald-300":/^["']/.test(p)?"text-amber-300":/^\d/.test(p)?"text-cyan-300":/^(const|let|var|function|return|if|else|for|while|class|import|from|export|async|await|SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|ALTER|true|false|null|None|def|print)$/.test(p)?"text-fuchsia-300":"";return <span key={i} className={c}>{p}</span>})}</>}
