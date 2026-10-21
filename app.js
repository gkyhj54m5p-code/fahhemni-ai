const notes = document.getElementById('notes');
const output = document.getElementById('output');
const wordCount = document.getElementById('wordCount');
const langBtn = document.getElementById('langBtn');
let language = 'ar';
const splitSentences = text => text.split(/(?<=[.!?؟])\s+|\n+/).map(s=>s.trim()).filter(Boolean);
const words = text => text.trim() ? text.trim().split(/\s+/).length : 0;
function t(ar,en){return language==='ar'?ar:en}
function updateCount(){wordCount.textContent = language==='ar' ? `${words(notes.value)} كلمة` : `${words(notes.value)} words`}
notes.addEventListener('input',updateCount);
document.getElementById('fileInput').addEventListener('change', async e=>{
  const file=e.target.files[0]; if(!file)return;
  try{notes.value=await file.text();updateCount()}catch{alert(t('تعذرت قراءة الملف.','Could not read this file.'))}
});
function getText(){const text=notes.value.trim();if(!text){output.innerHTML=`<h3>${t('اكتب ملاحظاتك الأول','Add your notes first')}</h3><p>${t('الصق محتوى المحاضرة في المربع فوق، وبعدها اختار الأداة المناسبة.','Paste your lecture into the box above, then choose a tool.')}</p>`;return null}return text}
document.getElementById('summaryBtn').addEventListener('click',()=>{
 const text=getText();if(!text)return;
 const sentences=splitSentences(text);const selected=sentences.length<=4?sentences:sentences.filter((s,i)=>i===0||i===sentences.length-1||i%2===0).slice(0,6);
 output.innerHTML=`<h3>${t('✦ ملخص سريع','✦ Quick summary')}</h3><ul class="result-list">${selected.map(s=>`<li>${escapeHTML(s)}</li>`).join('')}</ul><p class="notice">${t('تم استخراج الجمل بشكل مبسط من النص.','Sentences were selected using simple text processing.')}</p>`;
});
document.getElementById('quizBtn').addEventListener('click',()=>{
 const text=getText();if(!text)return;
 const sentences=splitSentences(text).filter(s=>words(s)>3).slice(0,5);
 if(!sentences.length){output.innerHTML=`<p>${t('أضف جمل أطول لإنشاء أسئلة.','Add longer sentences to create questions.')}</p>`;return}
 output.innerHTML=`<h3>${t('؟ أسئلة تدريبية','? Practice questions')}</h3>${sentences.map((s,i)=>`<div class="quiz-item"><b>${t('سؤال','Question')} ${i+1}:</b> ${t('اشرح الفكرة الأساسية في الجملة التالية:','Explain the main idea in this sentence:')}<p>${escapeHTML(s)}</p><details><summary>${t('عرض الجملة للمراجعة','Reveal reference')}</summary>${escapeHTML(s)}</details></div>`).join('')}`;
});
document.getElementById('cardsBtn').addEventListener('click',()=>{
 const text=getText();if(!text)return;
 const sentences=splitSentences(text).filter(s=>words(s)>2).slice(0,8);
 output.innerHTML=`<h3>${t('▤ بطاقات المراجعة','▤ Review flashcards')}</h3><p>${t('اضغط على البطاقة لعرض محتواها.','Tap a card to view its content.')}</p>${sentences.map((s,i)=>`<details class="flashcard"><summary>${t('بطاقة','Card')} ${i+1}</summary><p>${escapeHTML(s)}</p></details>`).join('')}`;
});
function escapeHTML(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
langBtn.addEventListener('click',()=>{
 language=language==='ar'?'en':'ar';document.documentElement.lang=language;document.documentElement.dir=language==='ar'?'rtl':'ltr';document.body.dir=language==='ar'?'rtl':'ltr';langBtn.textContent=language==='ar'?'EN':'عربي';
 document.querySelectorAll('[data-ar][data-en]').forEach(el=>el.textContent=el.dataset[language]);notes.placeholder=language==='ar'?'الصق المحاضرة أو الملاحظات هنا...':'Paste your lecture notes here...';updateCount();
});
