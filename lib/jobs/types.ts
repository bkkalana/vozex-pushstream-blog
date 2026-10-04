export type SupportedJobType = "SCHEDULED_PUBLISH"|"ANALYTICS_AGGREGATE"|"MAINTENANCE"|"WEBHOOK_DELIVERY";
export type QueueInput = {type:SupportedJobType; payload?:Record<string,unknown>; dedupeKey?:string; runAt?:Date; priority?:number; maxAttempts?:number};
export interface JobQueue { enqueue(input:QueueInput):Promise<{id:string}>; processBatch(args:{workerId:string;limit?:number}):Promise<{claimed:number;completed:number;failed:number}>; }
