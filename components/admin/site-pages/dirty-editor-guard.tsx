"use client";
import { useEffect } from "react";
export function DirtyEditorGuard(){
  useEffect(()=>{
    let dirty=false;
    const root=document.querySelector('[data-site-page-editor]');
    const onInput=()=>{dirty=true};
    const onSubmit=()=>{dirty=false};
    const onBeforeUnload=(event:BeforeUnloadEvent)=>{if(!dirty)return;event.preventDefault();event.returnValue=""};
    const onClick=(event:MouseEvent)=>{if(!dirty)return;const target=event.target as HTMLElement|null;const anchor=target?.closest('a');if(!anchor||anchor.target==='_blank'||anchor.hasAttribute('download'))return;const href=anchor.getAttribute('href');if(!href||href.startsWith('#'))return;if(!window.confirm('You have unsaved changes. Leave this page and discard them?')){event.preventDefault();event.stopPropagation()}};
    root?.addEventListener('input',onInput,true);root?.addEventListener('change',onInput,true);root?.addEventListener('submit',onSubmit,true);window.addEventListener('beforeunload',onBeforeUnload);document.addEventListener('click',onClick,true);
    return()=>{root?.removeEventListener('input',onInput,true);root?.removeEventListener('change',onInput,true);root?.removeEventListener('submit',onSubmit,true);window.removeEventListener('beforeunload',onBeforeUnload);document.removeEventListener('click',onClick,true)};
  },[]);
  return null;
}
