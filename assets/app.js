let userId = localStorage.getItem('tajer_userId');  
if(!userId){ userId = crypto.randomUUID(); localStorage.setItem('tajer_userId', userId); }  
  
document.getElementById('showFormBtn').onclick = () => document.getElementById('formCard').classList.remove('hidden');  
  
document.getElementById('adForm').onsubmit = async (e) => {  
  e.preventDefault();  
  const btn = document.getElementById('genBtn'); btn.innerText = 'جاري التوليد...'; btn.disabled = true;  
  const data = Object.fromEntries(new FormData(e.target));  
  const res = await fetch('/api/generate', {  
    method: 'POST',  
    headers: { 'Content-Type': 'application/json', 'X-User-ID': userId },  
    body: JSON.stringify(data)  
  });  
  const result = await res.json();  
  if(result.error){ alert(result.error); }  
  else { document.getElementById('result').innerText = result.ad; document.getElementById('result').classList.remove('hidden'); loadQuota(); }  
  btn.innerText = 'ولّد لي الإعلان'; btn.disabled = false;  
};  
  
async function loadQuota() {  
  const res = await fetch('/api/get-quota', { headers: { 'X-User-ID': userId } });  
  const data = await res.json(); document.getElementById('quota').innerText = `المتبقي لك اليوم: ${data.quota} طلبات`;  
}  
loadQuota();  
