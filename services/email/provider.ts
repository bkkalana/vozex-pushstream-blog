export type EmailMessage={to:string;subject:string;text:string;html?:string|null;replyTo?:string|null};
export interface EmailProvider{readonly name:string;send(message:EmailMessage):Promise<{ok:boolean;id?:string}>}
