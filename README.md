# تاجر AI - Tajer AI ✨  
  
**كاتب الإعلانات اللي بيبيع باللهجة السودانية**  
  
موقع مجاني بيستخدم الذكاء الاصطناعي Groq عشان يكتب ليك 3 نسخ إعلانية مقنعة + صورة للمنتج بالـ AI في 5 ثواني بس.  
  
### **المميزات**  
- **سريع**: الإعلان بيتولد في 5 ثواني  
- **متعدد اللهجات**: سوداني، سعودي، مصري، إماراتي  
- **نسخ + تحميل**: انسخ الإعلان او نزله txt  
- **حفظ تلقائي**: اخر 10 إعلانات محفوظة عندك  
- **صور AI**: ولد صورة للمنتج مجاناً  
- **كوتا يومية**: 10 طلبات مجانية لكل مستخدم  
- **مجاني 100%**: شغال على Cloudflare + Groq مجاني  
  
### **التقنيات المستخدمة**  
- **Frontend**: HTML, CSS, JS خام - بدون مكتبات  
- **Backend**: Cloudflare Workers  
- **Database**: Cloudflare KV  
- **AI Text**: Groq Llama3-8b  
- **AI Image**: Pollinations.ai  
- **Analytics**: Google Analytics  
  
### **طريقة التشغيل على جهازك**  
  
#### 1. المتطلبات  
- حساب Cloudflare مجاني  
- 5 مفاتيح API من Groq  
- حساب GitHub  
  
#### 2. خطوات التركيب  
1.  اعمل Fork للمستودع ده  
2.  ادخل https://console.groq.com واعمل 5 مفاتيح API  
3.  ادخل Cloudflare > Workers & Pages > Create KV Namespace وسميه `TAJER_KV`  
4.  ارفع الكود على Cloudflare Pages واربطه بـ GitHub  
5.  امشي Settings > Variables وضيف:  
    ```  
    GROQ_KEY1 = gsk_xxx  
    GROQ_KEY2 = gsk_xxx  
    GROQ_KEY3 = gsk_xxx  
    GROQ_KEY4 = gsk_xxx  
    GROQ_KEY5 = gsk_xxx  
    ```  
6.  اربط الـ KV Namespace باسم `TAJER_KV`  
7.  غير `G-XXXXXXX` في `index.html` بـ Google Analytics ID حقك  
8.  Deploy وخلاص  
  
### **هيكل الملفات**  
