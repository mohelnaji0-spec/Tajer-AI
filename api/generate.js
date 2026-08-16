imporimport { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();


export default async function handler(req,res){


res.setHeader(
"Access-Control-Allow-Origin",
"*"
);


res.setHeader(
"Access-Control-Allow-Headers",
"X-User-ID, Content-Type"
);


if(req.method==="OPTIONS")
return res.status(200).end();



if(req.method!=="POST")
return res.status(405).json({
error:"Method not allowed"
});



const userId=req.headers["x-user-id"];


if(!userId)
return res.status(400).json({
error:"خطأ في المستخدم"
});



const today=new Date()
.toISOString()
.split("T")[0];


const quotaKey=
`quota_${userId}_${today}`;



let used=Number(
await redis.get(quotaKey) || 0
);



if(used>=10){

return res.status(429).json({

error:"خلصت طلبات اليوم. ارجع بكرة"

});

}



const body =
typeof req.body==="string"
?
JSON.parse(req.body)
:
req.body;



const ad=await generateAd(body);



await redis.set(
quotaKey,
used + 1,
{
ex:86400
}
);



return res.status(200).json({
ad
});

}




async function generateAd(data){


const keys=[

process.env.GROQ_KEY1,
process.env.GROQ_KEY2,
process.env.GROQ_KEY3,
process.env.GROQ_KEY4,
process.env.GROQ_KEY5

].filter(Boolean);



if(keys.length===0)
throw new Error("No Groq keys");



const key=
keys[
Math.floor(Math.random()*keys.length)
];



const prompt=`

أنت تاجر خبير في التسويق.

اكتب 3 إعلانات مختلفة.

المنتج:
${data.product}

الوصف:
${data.description}

السعر:
${data.price}

الدولة:
${data.country}

اللهجة:
${data.dialect}


الشروط:
- إعلان قصير
- مقنع
- استخدم ايموجي
- ضع دعوة شراء قوية

`;



const response=await fetch(

"https://api.groq.com/openai/v1/chat/completions",

{

method:"POST",

headers:{

"Authorization":
`Bearer ${key}`,

"Content-Type":
"application/json"

},

body:JSON.stringify({

model:"llama3-8b-8192",

messages:[

{
role:"user",
content:prompt
}

],

temperature:0.8,

max_tokens:1000


})

}

);



const json=await response.json();


return json.choices[0].message.content;


  }
