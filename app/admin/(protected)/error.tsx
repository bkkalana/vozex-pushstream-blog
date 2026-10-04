"use client";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
export default function AdminError({reset}:{error:Error&{digest?:string};reset:()=>void}){return <ErrorState title="Unable to load this admin screen" description="The request failed safely. Retry the screen; if the problem persists, check the server log using the request context." action={<Button onClick={reset}>Retry</Button>}/>}
