import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();


export default async function handler(req,res){


const userId=req.headers["x-user-id"];


if(!userId){

return res.status(400).json({
error:"No user"
});

}



const today=new Date()
.toISOString()
.split("T")[0];



const key=
`quota_${userId}_${today}`;



const used=
Number(await redis.get(key)||0);



return res.status(200).json({

quota:10-used

});


}
