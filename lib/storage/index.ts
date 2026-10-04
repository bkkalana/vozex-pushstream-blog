import type {StorageProvider} from "./types";import {LocalStorageProvider} from "./local-storage";
let provider:StorageProvider|null=null;export function storageProvider():StorageProvider{if(provider)return provider;const configured=(process.env.STORAGE_PROVIDER||"local").toLowerCase();if(configured!=="local")throw new Error(`Storage provider ${configured} is not configured in this build. Use local now; S3/R2 adapters can implement StorageProvider without changing media services.`);provider=new LocalStorageProvider();return provider}
export type {StorageProvider,StoredObject} from "./types";
