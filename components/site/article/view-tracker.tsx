"use client";
import { useEffect } from "react";
export function ViewTracker({postId}:{postId:string}){useEffect(()=>{const timer=setTimeout(()=>{void fetch("/api/analytics/view",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({postId}),keepalive:true})},2500);return()=>clearTimeout(timer)},[postId]);return null}
