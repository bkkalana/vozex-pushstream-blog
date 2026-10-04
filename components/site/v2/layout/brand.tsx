import Link from "next/link";
import { Waves } from "lucide-react";

export function PublicBrand({siteName,logoUrl,className=""}:{siteName:string;logoUrl?:string;className?:string}){
  return <Link href="/" aria-label={`${siteName} home`} className={`inline-flex min-w-0 items-center gap-2.5 ${className}`}>
    {logoUrl ? <span className="flex h-9 w-[168px] shrink-0 items-center"><img src={logoUrl} alt={siteName} width={168} height={36} className="h-9 w-auto max-w-[168px] object-contain"/></span> : <>
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--ps-blue-soft)] text-[var(--ps-blue)]"><Waves size={22} strokeWidth={3} aria-hidden="true"/></span>
      <span className="text-[1.45rem] font-black leading-none tracking-[-.045em] text-[var(--ps-navy)]">
        {siteName.startsWith("Push") ? <><span>Push</span><span>Stream</span></> : siteName}
      </span>
    </>}
  </Link>
}
