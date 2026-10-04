import{prisma}from"@/lib/db/prisma";import{sendMail}from"./mailer";
const safe=(s:string)=>s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]!));
function render(template:string,vars:Record<string,string>){return template.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g,(_,k)=>safe(vars[k]??""))}
export const emailTemplateService={
 async send(key:string,to:string,vars:Record<string,string>){const t=await prisma.emailTemplate.findUnique({where:{key}});if(!t||!t.active)throw new Error("EMAIL_TEMPLATE_NOT_AVAILABLE");return sendMail({to,subject:render(t.subject,vars),text:render(t.textBody,vars),html:t.htmlBody?render(t.htmlBody,vars):undefined})},
 async list(){return prisma.emailTemplate.findMany({orderBy:{name:"asc"}})}
};
