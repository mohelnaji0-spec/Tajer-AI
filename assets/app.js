let token = localStorage.getItem('tajer_token') || '';
let user = null;
let todayCount = 0;
let isTrialMode = false;

async function refreshQuota(){
  if(!token) return;
  const r = await fetch('/api/quota', { headers: { Authorization: 'Bearer '+token }});
  const d = await r.json();
  todayCount = d.count || 0;
  document.getElementById('quota').textContent = `المتبقي لك اليوم: ${10 - todayCount} إعلانات نصية`;
}

function isTrialUsed(){ return localStorage.getItem('tajer_trialUsed') === 'yes'; }
function markTrialUsed(){ localStorage.setItem('tajer_trialUsed', 'yes'); }

function startTrial(){
  if(isTrialUsed()){
    alert('لقد استخدمت تجربتك المجانية - سجّل الآن للمتابعة مجاناً');
    return;
  }
  isTrialMode = true;
  document.getElementById('loginBox').style.display='none';
  document.getElementById('tryArea').style.display='none';
  document.getElementById('appBox').style.display='block';
  document.getElementById('userInfo').textContent = 'تجربة مجانية - مرة واحدة فقط';
  document.getElementById('quota').textContent = 'تجربة مجانية - مرة واحدة فقط - بدون تسجيل';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showLoginRequired(){
  document.getElementById('appBox').style.display='none';
  document.getElementById('result').style.display='none';
  document.getElementById('loginRequiredBox').style.display='block';
  document.getElementById('tryArea').style.display='none';
  document.getElementById('trialDoneBox').style.display='block';
  document.getElementById('loginBox').style.display='block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function onGoogleLogin(res){
  fetch('/api/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential: res.credential })
  }).then(r=>r.json()).then(d=>{
    if(d.token){
      token = d.token;
      localStorage.setItem('tajer_token', token);
      user = d.user;
      isTrialMode = false;
      document.getElementById('loginBox').style.display='none';
      document.getElementById('loginRequiredBox').style.display='none';
      document.getElementById('tryArea').style.display='none';
      document.getElementById('trialDoneBox').style.display='none';
      document.getElementById('appBox').style.display='block';
      document.getElementById('userInfo').textContent = `أهلاً بك، ${user.name}`;
      refreshQuota(); loadHistory();
    }
  });
}

function showMonetagAd(){
  if(window.showMonetag) window.showMonetag();
  return new Promise(res=>setTimeout(res, 2000));
}

document.getElementById('adForm')?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  if(isTrialMode){
    if(isTrialUsed()){ alert('لقد استخدمت تجربتك المجانية - سجّل الآن للمتابعة مجاناً'); showLoginRequired(); return; }
  } else {
    if(!token){ alert('يرجى تسجيل الدخول أولاً للمتابعة.'); return; }
    if(todayCount >= 10){ alert('لقد استهلكت حصتك اليومية. يمكنك المحاولة غداً.'); return; }
    if(todayCount === 0){ await showMonetagAd(); }
    else if(todayCount === 3){ await showMonetagAd(); }
  }

  const payload = {
    product: document.getElementById('product').value,
    price: document.getElementById('price').value,
    dialect: document.getElementById('dialect').value,
    country: document.getElementById('country')?.value || '',
    city: document.getElementById('city').value,
    delivery: document.getElementById('delivery').value,
    category: document.getElementById('category')?.value || '',
    whatsapp: document.getElementById('whatsapp')?.value || '',
    lang: document.getElementById('lang')?.value || 'عربي',
    length: document.getElementById('length')?.value || '',
    platform: document.getElementById('platform')?.value || '',
    shopName: document.getElementById('shopName')?.value || '',
    offer: document.getElementById('offer')?.value || '',
    audience: document.getElementById('audience')?.value || '',
    tone: document.getElementById('tone')?.value || '',
    pageLink: document.getElementById('pageLink')?.value || '',
    hasImage: document.getElementById('hasImage')?.value || '',
    serviceLink: document.getElementById('serviceLink')?.value || '',
  };

  const btn = document.getElementById('createBtn');
  btn.disabled = true; btn.textContent = 'جارٍ الإنشاء...';
  const endpoint = isTrialMode ? '/api/generate-trial' : '/api/generate';
  const headers = { 'Content-Type': 'application/json' };
  if(!isTrialMode) headers.Authorization = 'Bearer '+token;
  const r = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(payload) });
  const d = await r.json();
  btn.disabled = false; btn.textContent = 'إنشاء إعلان جديد ✨ - خلال ثوانٍ فقط';
  if(d.error){ alert(d.error); return; }

  document.getElementById('result').style.display='block';
  document.getElementById('adText').value = d.adText;
  document.getElementById('imagePrompt').value = d.imagePrompt;

  if(isTrialMode){
    markTrialUsed();
    setTimeout(()=>{ showLoginRequired(); }, 3000);
  } else {
    const hist = JSON.parse(localStorage.getItem('tajer_history')||'[]');
    hist.unshift({ adText: d.adText, imagePrompt: d.imagePrompt, date: new Date().toLocaleString() });
    localStorage.setItem('tajer_history', JSON.stringify(hist.slice(0,20)));
    loadHistory(); refreshQuota();
  }
});

function loadHistory(){
  const hist = JSON.parse(localStorage.getItem('tajer_history')||'[]');
  document.getElementById('history').innerHTML = hist.map((h,i)=>`
    <div class="card">
      <small>${h.date}</small>
      <p>${h.adText.slice(0,120)}...</p>
      <button onclick="showOld(${i})">عرض + نسخ</button>
    </div>`).join('');
}
function showOld(i){
  const hist = JSON.parse(localStorage.getItem('tajer_history')||'[]');
  const h = hist[i];
  document.getElementById('result').style.display='block';
  document.getElementById('adText').value = h.adText;
  document.getElementById('imagePrompt').value = h.imagePrompt;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function copyText(id){
  const el = document.getElementById(id);
  el.select(); document.execCommand('copy');
  alert('تم النسخ بنجاح ✅ - الصقه في أي مكان');
}

if(!token && isTrialUsed()){
  const t = document.getElementById('tryArea'); if(t) t.style.display='none';
  const d = document.getElementById('trialDoneBox'); if(d) d.style.display='block';
}
if(token){
  document.getElementById('loginBox').style.display='none';
  document.getElementById('tryArea').style.display='none';
  document.getElementById('trialDoneBox').style.display='none';
  document.getElementById('appBox').style.display='block';
  refreshQuota(); loadHistory();
}
