import{getEmailProvider}from"./providers";import type{EmailMessage}from"./provider";
export async function sendMail(input:EmailMessage){return(await getEmailProvider().send(input)).ok}
