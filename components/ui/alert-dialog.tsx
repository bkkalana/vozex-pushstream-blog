"use client";
import { Dialog } from "./dialog";
import { Button } from "./button";
export function AlertDialog({open,title,description,confirmLabel="Confirm",onConfirm,onClose,danger=false}:{open:boolean;title:string;description:string;confirmLabel?:string;onConfirm:()=>void;onClose:()=>void;danger?:boolean}) { return <Dialog open={open} title={title} description={description} onClose={onClose}><div className="flex justify-end gap-2"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button variant={danger?"danger":"primary"} onClick={onConfirm}>{confirmLabel}</Button></div></Dialog>; }
