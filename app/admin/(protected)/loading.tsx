import { Skeleton } from "@/components/ui/skeleton";
export default function AdminLoading(){return <div aria-busy="true" aria-label="Loading admin page"><Skeleton className="h-8 w-64"/><Skeleton className="mt-3 h-5 w-full max-w-xl"/><div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({length:8},(_,index)=><Skeleton key={index} className="h-32"/>)}</div></div>}
