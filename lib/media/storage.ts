import {storageProvider} from "@/lib/storage";
export function storage(){return storageProvider()}
export function publicUploadPath(parts:string[],file:string){return storage().getPublicUrl([...parts,file].join("/"))}
export async function saveBytes(key:string,bytes:Uint8Array,contentType="application/octet-stream"){return storage().upload({key,bytes,contentType})}
export async function removeStored(keyOrUrl:string){return storage().delete(keyOrUrl)}
