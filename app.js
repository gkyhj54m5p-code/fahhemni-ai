const $ = (s) => document.querySelector(s);
const sourceText = $("#sourceText"), outputContent = $("#outputContent");
let activities=0, currentLang="ar", quizData=[], cardData=[], cardIndex=0, uploadedFileName="";
const tr={
ar:{brand:"فهّمني",workspace:"مساحة المذاكرة",studyTools:"أدوات المذاكرة",quizMode:"اختبر نفسك",flashcards:"كروت المراجعة",demoMode:"AI متصل",demoDesc:"متصل بخدمة الذكاء الاصطناعي",topEyebrow:"مساحة تعلمك الذكية",headline:"افهم أكتر، واحفظ أقل.",subheadline:"ارفع محاضرتك وحوّلها إلى ملخص وأسئلة ومراجعة في مكان واحد.",welcomeTitle:"أهلًا بيك في Fahhemni",welcomeText:"ارفع ملف PDF أو الصق نص المحاضرة، ثم اختار الأداة المناسبة.",studentProject:"مشروع طلابي",startHere:"ابدأ من هنا",yourMaterial:"محتوى المذاكرة",trySample:"جرّب مثالًا جاهزًا ↗",pasteTitle:"ارفع ملف أو الصق المحاضرة",pasteDesc:"يدعم ملفات PDF النصية وملفات TXT وMD وCSV.",uploadText:"رفع PDF أو نص",makeSummary:"لخّص المحتوى",privacyNote:"يتم إرسال النص الذي تختاره إلى خدمة AI لمعالجته. لا تضع بيانات شخصية أو حساسة.",studyToolsEyebrow:"أدوات عملية",chooseTool:"اختار اللي محتاجه",summaryTool:"تلخيص المحاضرة",summaryToolDesc:"أهم الأفكار في نقاط واضحة",quizTool:"إنشاء أسئلة",quizToolDesc:"اختبر فهمك للمحتوى",cardsTool:"مراجعة ذكية",cardsToolDesc:"بطاقات سؤال وجواب",explainTool:"اشرح لي",explainDesc:"تبسيط محتوى المحاضرة",importantTool:"حدد المهم",importantDesc:"النقاط والتعريفات الأساسية",yourResults:"النتيجة",readyTitle:"جاهز نبدأ؟",waiting:"في انتظار المحتوى",emptyTitle:"محتواك هيظهر هنا",emptyDesc:"ارفع محاضرة أو الصق نصًا، ثم اختار تلخيص أو أسئلة أو شرح.",yourProgress:"تقدّمك",todayActivity:"نشاط الجلسة",activities:"أنشطة مكتملة",smallSteps:"كل خطوة بتفرق",studyTip:"نصيحة للمذاكرة",tipTitle:"اختبر نفسك قبل ما تراجع الإجابة",tipText:"استرجاع المعلومة من الذاكرة بيساعدك تعرف إيه اللي فهمته وإيه اللي محتاج مراجعة.",comingSoon:"عن النسخة الحالية",comingSoonText:"أدوات المذاكرة متصلة الآن بخدمة AI عبر خادم وسيط يحافظ على سرية مفتاح API.",planned:"نسخة تجريبية",footerNote:"نسخة تعليمية أولية • Demo build",words:"كلمة",noText:"ارفع ملفًا أو اكتب نص المحاضرة أولًا.",sampleLoaded:"تم تحميل المثال. اختار إحدى أدوات المذاكرة.",summaryTitle:"ملخص المحاضرة",summaryBadge:"ملخص تلقائي",quizTitle:"اختبر نفسك",quizBadge:"أسئلة تدريبية",cardsTitle:"مراجعة ذكية",cardsBadge:"بطاقات تفاعلية",explainTitle:"شرح مبسط",importantTitle:"أهم النقاط",summaryIntro:"أبرز الأفكار في المحتوى:",notAI:"تم إنشاء هذه النتيجة بواسطة خدمة الذكاء الاصطناعي.",quizIntro:"اختر الجملة التي تجيب عن السؤال. الأسئلة مستخرجة من نص المحاضرة.",cardsIntro:"حاول تذكر الفكرة قبل إظهار الإجابة.",reveal:"اكشف الإجابة",nextCard:"التالي",previousCard:"السابق",next:"التالي",finishQuiz:"إنهاء الاختبار",score:"نتيجتك",of:"من",correct:"إجابات صحيحة",tryAgain:"إعادة الاختبار",noQuestions:"النص المستخرج قصير جدًا لإنشاء أسئلة مناسبة. جرّب ملفًا آخر أو الصق النص يدويًا.",fileOnly:"اختر ملف PDF أو TXT أو MD أو CSV.",fileReadError:"تعذرت قراءة الملف. جرّب ملفًا آخر.",pdfLoading:"جارٍ قراءة صفحات ملف PDF…",pdfReady:"تم استخراج نص المحاضرة من ملف PDF.",pdfEmpty:"لم نجد نصًا قابلًا للاستخراج في الملف. قد يكون PDF عبارة عن صور ويحتاج إلى OCR.",pdfError:"تعذرت قراءة PDF. تأكد أنه ملف سليم وحاول مرة أخرى.",fileName:"الملف",copied:"تم نسخ النص.",copy:"نسخ الملخص",questionPrefix:"أي جملة تجيب عن السؤال؟",answer:"الإجابة",question:"سؤال",revealed:"الإجابة المقترحة",noSentences:"لم نتمكن من تقسيم النص إلى جمل واضحة.",navStudy:"أدوات المذاكرة",navQuiz:"اختبر نفسك",navCards:"كروت المراجعة",explainIntro:"شرح مبسط لأفكار المحاضرة:",importantIntro:"ركز على التعريفات والجمل التي تحتوي على مصطلحات أو أرقام أو علاقات مهمة:",explainNote:"لشرح أعمق وأمثلة جديدة مخصصة، اربط الموقع بخدمة AI عبر خادم آمن."},
en:{brand:"Fahhemni",workspace:"STUDY WORKSPACE",studyTools:"Study tools",quizMode:"Quiz yourself",flashcards:"Flashcards",demoMode:"AI connected",demoDesc:"Connected to AI service",topEyebrow:"YOUR SMART LEARNING SPACE",headline:"Understand more. Memorize less.",subheadline:"Upload a lecture and turn it into summaries, questions, and review tools.",welcomeTitle:"Welcome to Fahhemni",welcomeText:"Upload a PDF or paste lecture notes, then choose a study tool.",studentProject:"Student Project",startHere:"START HERE",yourMaterial:"Study material",trySample:"Try a sample ↗",pasteTitle:"Upload a file or paste notes",pasteDesc:"Supports text-based PDFs, TXT, MD, and CSV files.",uploadText:"Upload PDF or text",makeSummary:"Summarize content",privacyNote:"The text you submit is sent to the AI service for processing. Do not include sensitive personal data.",studyToolsEyebrow:"PRACTICAL TOOLS",chooseTool:"Choose what you need",summaryTool:"Lecture summary",summaryToolDesc:"Key ideas in clear points",quizTool:"Create questions",quizToolDesc:"Check your understanding",cardsTool:"Smart review",cardsToolDesc:"Question and answer cards",explainTool:"Explain it",explainDesc:"Simplify lecture content",importantTool:"Key points",importantDesc:"Core ideas and definitions",yourResults:"YOUR RESULTS",readyTitle:"Ready to begin?",waiting:"Waiting for content",emptyTitle:"Your content will appear here",emptyDesc:"Upload a lecture or paste text, then choose summary, questions, or explanation.",yourProgress:"YOUR PROGRESS",todayActivity:"Session activity",activities:"activities completed",smallSteps:"Every step counts",studyTip:"STUDY TIP",tipTitle:"Test yourself before checking the answer",tipText:"Retrieving information from memory helps you see what you understand and what needs review.",comingSoon:"About this version",comingSoonText:"Study tools now connect to an AI service through a backend that keeps the API key private.",planned:"Prototype",footerNote:"Educational prototype • Demo build",words:"words",noText:"Upload a file or enter lecture text first.",sampleLoaded:"Sample loaded. Choose a study tool.",summaryTitle:"Lecture summary",summaryBadge:"Automatic summary",quizTitle:"Quiz yourself",quizBadge:"Practice questions",cardsTitle:"Smart review",cardsBadge:"Interactive flashcards",explainTitle:"Simplified explanation",importantTitle:"Key points",summaryIntro:"Main ideas in this material:",notAI:"This result was generated by the AI service.",quizIntro:"Choose the sentence that answers the question. Questions are extracted from the lecture text.",cardsIntro:"Try to recall the idea before revealing the answer.",reveal:"Reveal answer",nextCard:"Next",previousCard:"Previous",next:"Next",finishQuiz:"Finish quiz",score:"Your score",of:"of",correct:"correct answers",tryAgain:"Try again",noQuestions:"The extracted text is too short to create useful questions. Try another file or paste text manually.",fileOnly:"Choose a PDF, TXT, MD, or CSV file.",fileReadError:"Could not read the file. Please try another one.",pdfLoading:"Reading PDF pages…",pdfReady:"Lecture text extracted from the PDF.",pdfEmpty:"No selectable text was found. This may be a scanned PDF that needs OCR.",pdfError:"Could not read this PDF. Check the file and try again.",fileName:"File",copied:"Text copied.",copy:"Copy summary",questionPrefix:"Which sentence answers the question?",answer:"Answer",question:"Question",revealed:"Suggested answer",noSentences:"Could not split the text into clear sentences.",navStudy:"Study tools",navQuiz:"Quiz yourself",navCards:"Flashcards",explainIntro:"A simplified walkthrough of the lecture:",importantIntro:"Focus on definitions and sentences containing terms, numbers, or important relationships:",explainNote:"For deeper explanations and custom examples, connect an AI service through a secure backend."}
};
function t(k){return tr[currentLang][k]||k}
function esc(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function toast(msg){const el=$("#toast");el.textContent=msg;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),3500)}
function updateCount(){const n=sourceText.value.trim()?sourceText.value.trim().split(/\s+/).length:0;$('#wordCount').textContent=`${n} ${t('words')}`}
function sentences(text){return text.replace(/\r/g,'').split(/(?<=[.!?؟。])\s+|\n+/).map(s=>s.trim()).filter(s=>s.length>18)}
function setOutput(title,badge,html){$('#outputTitle').textContent=title;$('#outputBadge').textContent=badge;outputContent.className='output-content';outputContent.innerHTML=html;$('#outputPanel').scrollIntoView({behavior:'smooth',block:'nearest'})}
function mark(){activities++;$('#activityCount').textContent=activities;const pct=Math.min(100,activities*15);$('#progressBar').style.width=pct+'%';$('#progressPercent').textContent=pct+'%'}
function ensure(){if(!sourceText.value.trim()){toast(t('noText'));return false}return true}
function pickedSentences(){return sentences(sourceText.value)}
const FAHEMNI_AI_API = "https://fahhemni-ai-api.jnj4mvm2cr.workers.dev/";

async function askFahhemniAI(message) {
  const response = await fetch(FAHEMNI_AI_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message })
  });

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("استجابة غير مفهومة من الخادم. راجع إعدادات Cloudflare Worker.");
  }

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error("الموقع غير مسموح له بالاتصال. راجع ALLOWED_ORIGIN في Cloudflare Worker.");
    }
    if (response.status === 500) {
      throw new Error("مفتاح Gemini غير مضبوط أو يوجد خطأ في إعدادات Worker.");
    }
    throw new Error(data.error || `فشل الاتصال بخدمة AI (${response.status})`);
  }

  if (typeof data.reply !== "string" || !data.reply.trim()) {
    throw new Error("خدمة AI لم تُرجع إجابة نصية.");
  }
  return data.reply.trim();
}

async function runAIStudyTool(title, badge, instruction) {
  if (!ensure()) return;
  const material = sourceText.value.trim();
  setOutput(title, badge, `<p>${currentLang === "ar" ? "جارٍ تجهيز الإجابة من الذكاء الاصطناعي…" : "Generating an AI answer…"}</p>`);
  try {
    const reply = await askFahhemniAI(
      `${instruction}\n\n${currentLang === "ar" ? "محتوى المحاضرة:" : "Lecture material:"}\n${material}`
    );
    const safeReply = esc(reply).replace(/\r\n?/g, "\n").replace(/\n/g, "<br>");
    setOutput(title, badge, `<div class="ai-answer">${safeReply}</div><p class="fine-print">${t("notAI")}</p>`);
    mark();
  } catch (error) {
    console.error("Fahhemni AI error:", error);
    setOutput(title, currentLang === "ar" ? "تعذر الاتصال" : "Connection error",
      `<p>${esc(error.message || "تعذر الاتصال بخدمة AI")}</p><p>${currentLang === "ar" ? "تأكد من نشر Worker وضبط GEMINI_API_KEY و ALLOWED_ORIGIN." : "Check that the Worker is deployed and GEMINI_API_KEY and ALLOWED_ORIGIN are configured."}</p>`);
    toast(error.message || (currentLang === "ar" ? "تعذر الاتصال بخدمة AI" : "Could not connect to AI"));
  }
}

async function summarize(){
  return runAIStudyTool(t("summaryTitle"), t("summaryBadge"),
    currentLang === "ar"
      ? "لخّص محتوى المحاضرة باللغة العربية في نقاط واضحة، واشرح المصطلحات الأساسية، ولا تضف معلومات غير موجودة إلا إذا وضحت أنها معلومة إضافية."
      : "Summarize the lecture in clear bullet points, explain key terms, and do not add unsupported information."); 
}
async function createQuiz(){
  return runAIStudyTool(t("quizTitle"), t("quizBadge"),
    currentLang === "ar"
      ? "أنشئ 5 أسئلة اختيار من متعدد عن المحتوى. لكل سؤال 4 اختيارات، ثم اكتب الإجابة الصحيحة وسبب صحتها. اجعل الأسئلة متنوعة ومن المحتوى فقط."
      : "Create 5 multiple-choice questions about the material. Give 4 options per question, then provide the correct answer and explain why. Use the material only."); 
}
function renderQuiz(){const html=quizData.map((q,i)=>`<div class="question-card"><h4>${i+1}. ${t('questionPrefix')}</h4>${q.options.map((o,j)=>`<button class="answer-option" data-q="${i}" data-opt="${j}">${esc(o)}</button>`).join('')}<div class="answer-feedback" id="feedback-${i}"></div></div>`).join('');setOutput(t('quizTitle'),t('quizBadge'),`<p>${t('quizIntro')}</p>${html}<div class="result-actions"><button id="finishQuiz">${t('finishQuiz')}</button></div><p class="fine-print">${t('notAI')}</p>`);outputContent.querySelectorAll('.answer-option').forEach(b=>b.onclick=()=>{const qi=+b.dataset.q,oi=+b.dataset.opt,q=quizData[qi];if(q.answered)return;q.answered=true;q.correct=q.options[oi]===q.sentence;outputContent.querySelectorAll(`[data-q="${qi}"]`).forEach(x=>{x.disabled=true;if(x.textContent===q.sentence)x.classList.add('correct')});if(!q.correct)b.classList.add('wrong');$(`#feedback-${qi}`).textContent=q.correct?(currentLang==='ar'?'صح! إجابة صحيحة.':'Correct!'):`${t('answer')}: ${q.sentence}`});$('#finishQuiz').onclick=()=>{const score=quizData.filter(q=>q.correct).length;setOutput(t('score'),t('quizBadge'),`<div class="flashcard"><span class="fc-label">${t('score')}</span><div class="fc-text">${score} ${t('of')} ${quizData.length}</div><div>${t('correct')}</div></div><div class="result-actions"><button id="retryQuiz">${t('tryAgain')}</button></div>`);$('#retryQuiz').onclick=createQuiz;mark()}}
async function createCards(){
  return runAIStudyTool(t("cardsTitle"), t("cardsBadge"),
    currentLang === "ar"
      ? "أنشئ حتى 10 كروت مراجعة. اكتب كل كارت بصيغة: سؤال: ... ثم إجابة: ...، وركّز على أهم المفاهيم والتعريفات."
      : "Create up to 10 study flashcards. Format each as Question: ... then Answer: ... Focus on key concepts and definitions."); 
}
function renderCard(){const s=cardData[cardIndex];setOutput(t('cardsTitle'),t('cardsBadge'),`<p>${t('cardsIntro')}</p><div class="flashcard"><span class="fc-label">${t('question')} ${cardIndex+1} / ${cardData.length}</span><div class="fc-text" id="flashText">${t('reveal')}</div><button class="secondary-btn" id="revealCard">${t('reveal')}</button></div><div class="result-actions"><button id="prevCard">${t('previousCard')}</button><button id="nextCard">${t('nextCard')}</button></div><p class="fine-print">${t('notAI')}</p>`);$('#revealCard').onclick=()=>{$('#flashText').textContent=s;$('#revealCard').disabled=true};$('#prevCard').onclick=()=>{cardIndex=(cardIndex-1+cardData.length)%cardData.length;renderCard()};$('#nextCard').onclick=()=>{cardIndex=(cardIndex+1)%cardData.length;renderCard()}}
async function explain(){
  return runAIStudyTool(t("explainTitle"), t("summaryBadge"),
    currentLang === "ar"
      ? "اشرح محتوى المحاضرة خطوة بخطوة بلغة عربية بسيطة، مع أمثلة واضحة وتشبيه عند الحاجة، ثم اختم بثلاث نقاط للتأكد من الفهم."
      : "Explain the lecture step by step in simple English, with clear examples and analogies when useful. End with three quick comprehension checks."); 
}
async function important(){
  return runAIStudyTool(t("importantTitle"), t("summaryBadge"),
    currentLang === "ar"
      ? "استخرج أهم النقاط والتعريفات والقوانين والأرقام من المحاضرة، ورتبها حسب الأهمية، واشرح بإيجاز لماذا كل نقطة مهمة."
      : "Extract the most important points, definitions, formulas, and numbers from the lecture. Rank them by importance and briefly explain each."); 
}
async function readPdf(file){if(!window.pdfjsLib)throw new Error('PDF library not loaded');pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';const data=await file.arrayBuffer();const pdf=await pdfjsLib.getDocument({data}).promise;let pages=[];for(let i=1;i<=pdf.numPages;i++){const page=await pdf.getPage(i);const content=await page.getTextContent();const line=content.items.map(x=>x.str).filter(Boolean).join(' ');if(line.trim())pages.push(`--- ${currentLang==='ar'?'صفحة':'Page'} ${i} ---\n${line}`)}return {text:pages.join('\n\n'),pages:pdf.numPages}}
async function handleFile(e){const file=e.target.files?.[0];if(!file)return;uploadedFileName=file.name;const ext=file.name.split('.').pop().toLowerCase();try{if(ext==='pdf'){toast(t('pdfLoading'));const result=await readPdf(file);if(!result.text.trim()){toast(t('pdfEmpty'));return}sourceText.value=result.text;updateCount();toast(`${t('pdfReady')} (${result.pages} ${currentLang==='ar'?'صفحة':'pages'})`)}else if(['txt','md','csv'].includes(ext)){sourceText.value=await file.text();updateCount();toast(t('sampleLoaded'))}else{toast(t('fileOnly'))}}catch(err){console.error(err);toast(ext==='pdf'?t('pdfError'):t('fileReadError'))}finally{e.target.value=''}}
function loadSample(){const ar='الذاكرة العشوائية RAM هي ذاكرة مؤقتة تستخدم لتخزين البيانات والتعليمات التي يحتاجها المعالج أثناء تشغيل البرامج. تفقد ذاكرة RAM محتوياتها عند انقطاع الكهرباء، لذلك تُعد ذاكرة متطايرة. أما ذاكرة ROM فتحتفظ بمحتوياتها حتى عند إيقاف تشغيل الجهاز. وحدة المعالجة المركزية CPU تنفذ التعليمات وتعالج البيانات داخل الحاسوب. تتواصل مكونات الحاسوب مع بعضها عبر النواقل التي تنقل البيانات والعناوين وإشارات التحكم.';const en='Random Access Memory (RAM) is temporary memory used to store data and instructions needed by the processor while programs are running. RAM loses its contents when power is turned off, so it is volatile memory. Read-only memory (ROM) retains its contents even when the device is powered off. The Central Processing Unit (CPU) executes instructions and processes data inside a computer. Computer components communicate through buses that carry data, addresses, and control signals.';sourceText.value=currentLang==='ar'?ar:en;updateCount();toast(t('sampleLoaded'))}
function setLanguage(lang){currentLang=lang;document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';document.querySelectorAll('[data-i18n]').forEach(el=>{const k=el.dataset.i18n;if(tr[lang][k])el.textContent=tr[lang][k]});sourceText.placeholder=lang==='ar'?sourceText.dataset.placeholderAr:sourceText.dataset.placeholderEn;$('#langToggle').textContent=lang==='ar'?'🌐 English':'🌐 العربية';document.querySelectorAll('.nav-item').forEach((el,i)=>{el.querySelector('span:last-child').textContent=[t('navStudy'),t('navQuiz'),t('navCards')][i]});updateCount()}
sourceText.addEventListener('input',updateCount);$('#loadSample').addEventListener('click',loadSample);$('#generateSummary').addEventListener('click',summarize);$('#makeSummaryCard').addEventListener('click',summarize);$('#makeQuiz').addEventListener('click',createQuiz);$('#makeCards').addEventListener('click',createCards);$('#makeExplain').addEventListener('click',explain);$('#makeImportant').addEventListener('click',important);$('#langToggle').addEventListener('click',()=>setLanguage(currentLang==='ar'?'en':'ar'));$('#fileInput').addEventListener('change',handleFile);document.querySelectorAll('.nav-item').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.nav-item').forEach(b=>b.classList.remove('active'));btn.classList.add('active');if(btn.dataset.tab==='quiz')createQuiz();else if(btn.dataset.tab==='cards')createCards();else $('#sourceText').focus()}));
setLanguage('ar');updateCount();
