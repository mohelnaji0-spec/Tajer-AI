// Worker - تاجر AI - نصوص + برومبت صورة - بدون Kaggle - بدون توليد صور
async function callMeta(env, prompt){
  const keys = [env.META_MODEL_KEY1, env.META_MODEL_KEY2].filter(Boolean);
  for(const key of keys){
    try{
      const res = await fetch(`${env.META_MODEL_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'Llama-4-Maverick-17B-128E-Instruct',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 800
        })
      });
      if(!res.ok) continue;
      const d = await res.json();
      const text = d.choices?.[0]?.message?.content;
      if(text) return text;
    }catch(e){ continue; }
  }
  throw new Error('Meta API فشل في المفتاحين');
}

function verifyToken(env, req){
  const auth = req.headers.get('Authorization') || '';
  const token = auth.replace('Bearer ','');
  if(!token) return null;
  try{
    const parts = token.split('.');
    if(parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  }catch{ return null; }
}

async function buildPrompts(body){
  const { product, price, dialect, country, city, delivery, category, whatsapp, lang, length, platform, shopName, offer, audience, tone, pageLink, hasImage, serviceLink } = body;
  const textPrompt = `اكتب إعلان تسويقي جاهز للنشر باللهجة ${dialect || 'سودانية'} للمنتج: ${product} - السعر: ${price || 'غير مذكور'} - الدولة: ${country || ''} - المدينة: ${city || ''} - الفئة: ${category || ''} - التوصيل: ${delivery || ''} - المتجر: ${shopName || ''} - العرض: ${offer || 'لا يوجد'} - الجمهور: ${audience || 'الجميع'} - النبرة: ${tone || 'حماسية'} - اللغة: ${lang || 'عربي'} - الطول: ${length || ''} - المنصة: ${platform || ''} - واتساب: ${whatsapp || ''}. الإعلان لازم يكون: عنوان جذاب + وصف مقنع + السعر + دعوة للشراء + إيموجي مناسب. اكتب بالعربي فقط.`;
  const imagePromptText = `Write an image prompt in English for this product ad: Product: ${product}, Price: ${price}, Country: ${country}, City: ${city}, Category: ${category}, Shop: ${shopName}, Offer: ${offer}, Tone: ${tone}, Platform: ${platform}, Style: professional advertising photo, bright natural light, high quality, 4K, attractive background related to ${city}.`;
  return { textPrompt, imagePromptText };
}

export default {
  async fetch(request, env, ctx){
    const url = new URL(request.url);
    if(url.pathname === '/api/auth/google' && request.method === 'POST'){
      const { credential } = await request.json();
      const payload = JSON.parse(atob(credential.split('.')[1]));
      const user = { email: payload.email, name: payload.name };
      const header = btoa(JSON.stringify({alg:'HS256',typ:'JWT'}));
      const body = btoa(JSON.stringify({ ...user, exp: Date.now()+ 7*24*3600*1000 }));
      const token = `${header}.${body}.sig`;
      return Response.json({ token, user });
    }
    if(url.pathname === '/api/quota'){
      const user = verifyToken(env, request);
      if(!user) return Response.json({ error: 'يرجى تسجيل الدخول أولاً للمتابعة.' }, { status: 401 });
      const today = new Date().toISOString().slice(0,10);
      const key = `count:${user.email}:${today}`;
      const count = parseInt(await env.TAJER_KV.get(key) || '0');
      return Response.json({ count, remaining: 10-count });
    }
    if(url.pathname === '/api/generate-trial' && request.method === 'POST'){
      const body = await request.json();
      if(!body.product) return Response.json({ error: 'يرجى إدخال اسم المنتج / الخدمة' }, { status: 400 });
      const { textPrompt, imagePromptText } = await buildPrompts(body);
      const adText = await callMeta(env, textPrompt);
      const imagePrompt = await callMeta(env, imagePromptText);
      return Response.json({ adText, imagePrompt, trial: true });
    }
    if(url.pathname === '/api/generate' && request.method === 'POST'){
      const user = verifyToken(env, request);
      if(!user) return Response.json({ error: 'يرجى تسجيل الدخول أولاً للمتابعة.' }, { status: 401 });
      const today = new Date().toISOString().slice(0,10);
      const key = `count:${user.email}:${today}`;
      let count = parseInt(await env.TAJER_KV.get(key) || '0');
      if(count >= 10) return Response.json({ error: 'لقد استهلكت حصتك اليومية. يمكنك المحاولة غداً.' }, { status: 429 });
      const body = await request.json();
      const { textPrompt, imagePromptText } = await buildPrompts(body);
      const adText = await callMeta(env, textPrompt);
      const imagePrompt = await callMeta(env, imagePromptText);
      await env.TAJER_KV.put(key, String(count+1), { expirationTtl: 86400 });
      return Response.json({ adText, imagePrompt });
    }
    return new Response('Not Found', { status: 404 });
  }
};
