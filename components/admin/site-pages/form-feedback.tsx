"use client";
import { useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
export function FormFeedback({successMessage="Saved"}:{successMessage?:string}){const {pending}=useFormStatus();const wasPending=useRef(false);useEffect(()=>{if(pending)wasPending.current=true;else if(wasPending.current){wasPending.current=false;toast.success(successMessage)}},[pending,successMessage]);return null}
