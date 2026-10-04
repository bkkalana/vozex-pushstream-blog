import "dotenv/config";import {databaseJobQueue,enqueueRecurringJobs} from "../services/jobs/job-queue.service";
const workerId=`pm2-${process.pid}`;const sleep=(ms:number)=>new Promise(r=>setTimeout(r,ms));
async function main(){for(;;){try{await enqueueRecurringJobs();const r=await databaseJobQueue.processBatch({workerId,limit:20});await sleep(r.claimed?1000:15000)}catch(e){console.error("job-worker",e);await sleep(15000)}}}
main().catch(e=>{console.error(e);process.exit(1)});
