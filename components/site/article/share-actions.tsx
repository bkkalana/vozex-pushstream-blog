"use client";
import { useState } from "react";
import { Check,Copy,Facebook,Linkedin,MessageCircle } from "lucide-react";
export function ShareActions({title=""}:{title?:string}){const [copied,setCopied]=useState(false);function share(base:string){const u=encodeURIComponent(location.href),t=encodeURIComponent(title);window.open(base.replace("{url}",u).replace("{title}",t),"_blank","noopener,noreferrer,width=720,height=640")};async function copy(){await navigator.clipboard.writeText(location.href);setCopied(true);setTimeout(()=>setCopied(false),1600)}return <div className="flex flex-wrap items-center gap-2" aria-label="Share this article">
<button type="button" aria-label="Share on Facebook" onClick={()=>share("https://www.facebook.com/sharer/sharer.php?u={url}")} className="share-btn"><Facebook size={16}/>Facebook</button>
<button type="button" aria-label="Share on LinkedIn" onClick={()=>share("https://www.linkedin.com/sharing/share-offsite/?url={url}")} className="share-btn"><Linkedin size={16}/>LinkedIn</button>
<button type="button" aria-label="Share on X" onClick={()=>share("https://twitter.com/intent/tweet?url={url}&text={title}")} className="share-btn">X</button>
<button type="button" aria-label="Share on WhatsApp" onClick={()=>share("https://wa.me/?text={title}%20{url}")} className="share-btn"><MessageCircle size={16}/>WhatsApp</button>
<button type="button" onClick={copy} className="share-btn" aria-label="Copy article link">{copied?<Check size={16}/>:<Copy size={16}/>} {copied?"Copied":"Copy link"}</button></div>}
