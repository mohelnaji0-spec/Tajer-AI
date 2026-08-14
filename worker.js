export default {  
  async fetch(request, env) {  
    const url = new URL(request.url);  
    const headers = {'Access-Control-Allow-Origin': '*','Content-Type': 'application/json','Access-Control-Allow-Headers': 'X-User-ID, Content-Type'};  
    if (request.method === 'OPTIONS') return new Response(null, { headers });  
  
    const userId = request.headers.get('X-User-ID');  
    if(!userId) return new Response(JSON.stringify({error: "خطأ في المستخدم"}), {status: 400, headers});  
    const today = new Date().toISOString().split('T')[0];  
    const quotaKey = `quota_${userId}_${today}`;  
  
    if(url.pathname === '/api/get-quota'){  
      const used = await env.TAJER_KV.get(quotaKey) || 0;  
      return new Response(JSON.stringify({quota: 10 - Number(used)}), {headers});  
    }  
    if(url.pathname === '/api/generate'){  
      let used = Number(await env.TAJER_KV.get(quotaKey) || 0);  
      if(used >= 10) return new Response(JSON.stringify({error: "خلصت طلبات اليوم. ارجع بكرة"}), {headers});  
      const body = await request.json();  
      const ad = await generateAd(body, env);  
      await env.TAJER_KV.put(quotaKey, String(used + 1), {expirationTtl: 86400});  
      return new Response(JSON.stringify({ad}), {headers});  
    }  
    if(url.pathname === '/api/gen-image'){  
      let used = Number(await env.TAJER_KV.get(quotaKey) || 0);  
      if(used >= 10) return new Response(JSON.stringify({error: "خلصت طلبات اليوم"}), {headers});  
      const body = await request.json();  
      const image = await generateImage(body.prompt, env);  
      await env.TAJER_KV.put(quotaKey, String(used + 1), {expirationTtl: 86400});  
      return new Response(JSON.stringify({image}), {headers});  
    }  
    return new Response("Not Found", {status: 404});  
  }  
}  
async function generateAd(data, env){  
  const keys = [env.GROQ_KEY1, env.GROQ_KEY2, env.GROQ_KEY3, env.GROQ_KEY4, env.GROQ_KEY5].filter(Boolean);  
  const key = keys[Math.floor(Math.random() * keys.length)];  
  const prompt = `انت "تاجر" خبير تسويق سوداني. اكتب 3 نسخ اعلانية مختلفة لمنتج: ${data.product}. الوصف: ${data.description}. السعر: ${data.price}. الدولة: ${data.country}. اللهجة: ${data.dialect}. الشروط: قصير، مقنع، استخدم ايموجي، CTA قوي.`;  
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {method: "POST",headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },body: JSON.stringify({model: "llama3-8b-8192",messages: [{role:"user", content:prompt}],temperature:0.8,max_tokens: 1000})});  
  const json = await res.json();  
  return json.choices[0].message.content;  
}  
async function generateImage(prompt, env){  
  const res = await fetch(`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true`);  
  return res.url;  
}  
