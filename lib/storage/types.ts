export type StoredObject={key:string;publicUrl:string;size:number;contentType:string};
export interface StorageProvider{readonly name:string;upload(input:{key:string;bytes:Uint8Array;contentType:string}):Promise<StoredObject>;delete(keyOrUrl:string):Promise<void>;getPublicUrl(key:string):string;exists?(key:string):Promise<boolean>}
