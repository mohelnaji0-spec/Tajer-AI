let userId = localStorage.getItem('tajer_userId');  
if(!userId){ userId = crypto.randomUUID(); localStorage.setItem('tajer_userId', userId); gtag('event','new_user'); }  
let lastAd = "";  
  
document.getElementById('showFormBtn').onclick = () => {document.getElementById('formCard').classList.remove('hidden');loadHistory();gtag('event','open_form');}  
  
document.getElementById('adForm').onsubmit = async (e) => {  
  e.preventDefault();  
  const btn = document.getElementById('genBtn'); btn.innerText = 'جاري التوليد...'; btn.disabled = true;gtag('event','generate_click');  
  const data = Object.fromEntries(new FormData(e.target));  
  const res = await fetch('/api/generate', {method: 'POST',headers: { 'Content-Type': 'application/json', 'X-User-ID': userId },body: JSON.stringify(data)});  
  const result = await res.json();  
  if(result.error){ alert(result.error);gtag('event','quota_exceeded');}  
  else {  
    lastAd = result.ad;  
    document.getElementById('result').innerHTML = `<pre>${result.ad}</pre><button onclick="copyAd()" class="btn-gold">نسخ الإعلان</button><button onclick="downloadAd()" class="btn-gold" style="background:#444;">تحميل TXT</button><button onclick="genImage('${data.product}')" class="btn-gold" style="background:#0A84FF;">توليد صورة بالAI</button><div id="imageResult"></div>`;  
    document.getElementById('result').classList.remove('hidden');loadQuota();saveToHistory(data.product, result.ad);gtag('event','ad_generated');  
  }  
  btn.innerText = 'ولّد لي الإعلان'; btn.disabled = false;  
};  
  
function copyAd(){navigator.clipboard.writeText(lastAd);alert("تم النسخ!");}  
function downloadAd(){const blob = new Blob([lastAd], {type: 'text/plain'});const url = URL.createObjectURL(blob);const a = document.createElement('a');a.href = url; a.download = "اعلان_تاجر.txt";a.click();}  
function saveToHistory(product, ad){let history = JSON.parse(localStorage.getItem('tajer_history') || '[]');history.unshift({product, ad, date: new Date().toLocaleDateString('ar')});if(history.length > 10) history.pop();localStorage.setItem('tajer_history', JSON.stringify(history));loadHistory();}  
function loadHistory(){let history = JSON.parse(localStorage.getItem('tajer_history') || '[]');let html = "<h3>الإعلانات السابقة</h3>";history.forEach(item => html += `<div class="card"><b>${item.product}</b> - ${item.date}<pre>${item.ad}</pre></div>`);document.getElementById('history').innerHTML = html;}  
async function genImage(product){document.getElementById('imageResult').innerHTML = "جاري توليد الصورة...";const res = await fetch('/api/gen-image', {method: 'POST',headers: { 'Content-Type': 'application/json', 'X-User-ID': userId },body: JSON.stringify({prompt: `منتج ${product} تصوير احترافي للاعلان خلفية بيضاء`})});const result = await res.json();document.getElementById('imageResult').innerHTML = `<img src="${result.image}" style="width:100%;border-radius:10px">`;}  
async function loadQuota() {const res = await fetch('/api/get-quota', { headers: { 'X-User-ID': userId } });const data = await res.json(); document.getElementById('quota').innerText = `المتبقي لك اليوم: ${data.quota} طلبات`;}  
loadQuota();loadHistory();  
