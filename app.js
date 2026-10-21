
"use strict";

const $ = (selector) => document.querySelector(selector);

const STORAGE_KEY = "fahhemni-progress-v2";
const state = {
  language: "ar",
  text: "",
  fileName: "",
  summary: [],
  quiz: [],
  cards: [],
  cardIndex: 0,
  cardRevealed: false,
  quizSubmitted: false,
  stats: loadStats()
};

if (window.pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

function loadStats() {
  const defaults = {
    files: 0,
    xp: 0,
    scores: [],
    attempts: 0,
    lastStudy: "",
    streak: 0,
    bestScore: 0,
    weakWords: {},
    completedQuiz: false
  };

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return { ...defaults, ...saved };
  } catch {
    return defaults;
  }
}

function saveStats() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.stats));
  } catch (error) {
    console.warn("Could not save local progress.", error);
    showMessage(t("تعذر حفظ التقدم في المتصفح.", "Could not save progress in this browser."), true);
  }
}

function t(ar, en) {
  return state.language === "ar" ? ar : en;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function showMessage(message, isError = false) {
  const element = $("#workspaceMessage");
  element.textContent = message;
  element.classList.toggle("error", isError);
}

function normalizeText(text) {
  return String(text || "")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function splitSentences(text) {
  return normalizeText(text)
    .split(/(?<=[.!?؟。])\s+|\n+/u)
    .map(sentence => sentence.trim())
    .filter(sentence => sentence.length >= 25);
}

function tokenize(text) {
  return (text.toLowerCase().match(/[\p{L}\p{N}]{3,}/gu) || [])
    .map(word => word.trim());
}

const STOP_WORDS = new Set((
  "the and for are but not you all any can had her was one our out day get has him his how its " +
  "let may new now old see way who did use that with this from they will would there their what " +
  "when where which while into also have been being more most some such than then them these those " +
  "each other about after before between because through during without within should could very " +
  "over under only same both every much many les des une unee pour dans avec sans sur par est sont " +
  "lesque qui que quoi une des aux leur leurs comme mais donc car pas plus tout tous cette cet " +
  "هذه هذا ذلك تلك التي الذي الذين التي في من إلى على عن مع هو هي هم هن كان تكون يكون يتم حيث كما " +
  "أو ثم قد لقد وهي وهو إذا إن أن ما لا لم لن كل بعض عند بعد قبل بين خلال مثل حيث لأن لأنهم بها له " +
  "لها عليه عليها منهم منها ذلك تلك هذا هذه الذي التي"
).split(/\s+/));

function getKeywords(text, limit = 15) {
  const counts = new Map();

  for (const word of tokenize(text)) {
    if (STOP_WORDS.has(word) || /^\d+$/.test(word)) continue;
    counts.set(word, (counts.get(word) || 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    .slice(0, limit)
    .map(([word]) => word);
}

function makeSummary(text) {
  const sentences = splitSentences(text);
  if (!sentences.length) return [];

  const words = tokenize(text);
  const frequencies = new Map();

  words.forEach(word => {
    if (!STOP_WORDS.has(word)) {
      frequencies.set(word, (frequencies.get(word) || 0) + 1);
    }
  });

  const scored = sentences.map((sentence, index) => {
    const sentenceWords = tokenize(sentence);
    const score = sentenceWords.reduce(
      (sum, word) => sum + (frequencies.get(word) || 0),
      0
    ) / Math.max(sentenceWords.length, 1);

    return { sentence, index, score };
  });

  const limit = Math.min(6, Math.max(2, Math.ceil(sentences.length * 0.25)));
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .sort((a, b) => a.index - b.index)
    .map(item => item.sentence);
}

function renderSummary() {
  const output = $("#summaryOutput");

  if (!state.summary.length) {
    output.className = "output empty-state";
    output.textContent = t("حلّل المحاضرة أولًا لعرض الملخص.", "Analyze a lecture to see the summary.");
    return;
  }

  output.className = "output";
  output.innerHTML = `<ul>${state.summary.map(sentence =>
    `<li>${escapeHTML(sentence)}</li>`
  ).join("")}</ul>`;
}

function buildQuiz(text) {
  const sentences = splitSentences(text);
  const keywords = getKeywords(text, 35);
  const questions = [];

  for (const sentence of sentences) {
    if (questions.length >= 5) break;

    const words = tokenize(sentence);
    const answer = words.find(word =>
      word.length >= 4 &&
      keywords.includes(word) &&
      !STOP_WORDS.has(word)
    );

    if (!answer || sentence.length < 30) continue;

    const escapedAnswer = answer.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const blanked = sentence.replace(
      new RegExp(`\\b${escapedAnswer}\\b`, "i"),
      "______"
    );

    if (blanked === sentence) continue;

    const distractors = keywords.filter(word =>
      word !== answer && !sentence.toLowerCase().includes(word.toLowerCase())
    );

    const options = [answer, ...distractors.slice(0, 3)];
    if (options.length < 2) continue;

    questions.push({
      question: blanked,
      answer,
      options: shuffle([...new Set(options)]).slice(0, 4)
    });
  }

  return questions;
}

function shuffle(array) {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function renderQuiz() {
  const output = $("#quizOutput");

  if (!state.quiz.length) {
    output.className = "output empty-state";
    output.textContent = t(
      "لم يتم إنشاء أسئلة كافية. جرّب نصًا أطول.",
      "Not enough questions could be generated. Try a longer text."
    );
    return;
  }

  state.quizSubmitted = false;
  output.className = "output";
  output.innerHTML = `
    <form id="quizForm">
      ${state.quiz.map((item, index) => `
        <fieldset class="quiz-question">
          <legend>${index + 1}. ${escapeHTML(item.question)}</legend>
          ${item.options.map(option => `
            <label class="quiz-option">
              <input type="radio" name="question-${index}" value="${escapeHTML(option)}">
              <span>${escapeHTML(option)}</span>
            </label>
          `).join("")}
        </fieldset>
      `).join("")}
      <button class="btn btn-primary" type="submit">
        ${t("تصحيح الإجابات", "Check answers")}
      </button>
    </form>
    <div id="quizFeedback" class="quiz-feedback" hidden aria-live="polite"></div>
  `;

  $("#quizForm").addEventListener("submit", gradeQuiz);
}

function gradeQuiz(event) {
  event.preventDefault();
  if (state.quizSubmitted) return;

  state.quizSubmitted = true;

  const form = $("#quizForm");
  const feedback = $("#quizFeedback");
  const answers = new FormData(form);
  const wrong = [];

  let correct = 0;

  state.quiz.forEach((question, index) => {
    const selected = answers.get(`question-${index}`);

    if (selected && selected.toLowerCase() === question.answer.toLowerCase()) {
      correct++;
    } else {
      wrong.push(question.answer);
      state.stats.weakWords[question.answer] =
        (state.stats.weakWords[question.answer] || 0) + 1;
    }
  });

  const percent = Math.round((correct / state.quiz.length) * 100);
  const earned = correct * 10 + (percent === 100 ? 20 : 0);

  state.stats.scores.push(percent);
  state.stats.scores = state.stats.scores.slice(-30);
  state.stats.attempts++;
  state.stats.bestScore = Math.max(state.stats.bestScore, percent);
  state.stats.completedQuiz = true;
  state.stats.xp += earned;
  markStudyDay();
  saveStats();
  renderDashboard();

  feedback.hidden = false;
  feedback.innerHTML = `
    <strong>${t("نتيجتك", "Your score")}: ${correct}/${state.quiz.length} (${percent}%)</strong>
    <p>${t("كسبت", "You earned")} ${earned} XP.</p>
    ${wrong.length
      ? `<p>${t("راجع هذه الكلمات:", "Review these words:")} ${wrong.map(escapeHTML).join("، ")}</p>`
      : `<p>${t("ممتاز! أجبت عن كل الأسئلة بشكل صحيح.", "Great! All answers are correct.")}</p>`}
    <p class="small muted">${t("الأسئلة مولّدة محليًا من النص وليست اختبارًا دلاليًا متقدمًا.", "Questions are generated locally from the text, not by advanced semantic understanding.")}</p>
  `;

  form.querySelectorAll("input, button").forEach(input => input.disabled = true);
  renderDNA();
}

function makeCards(text) {
  return splitSentences(text)
    .filter(sentence => sentence.length >= 35)
    .slice(0, 12)
    .map(sentence => ({
      front: t("ما الفكرة الواردة في هذه الجملة؟", "What idea does this sentence express?"),
      back: sentence
    }));
}

function renderCard() {
  const output = $("#cardsOutput");

  if (!state.cards.length) {
    output.className = "output empty-state";
    output.textContent = t("حلّل محاضرة لإنشاء البطاقات.", "Analyze a lecture to create flashcards.");
    return;
  }

  const card = state.cards[state.cardIndex];
  output.className = "output";
  output.innerHTML = `
    <div class="flashcard" id="flashcard" tabindex="0" role="button"
      aria-label="${t("اضغط لإظهار الإجابة", "Click to reveal the answer")}">
      <span class="muted">${state.cardIndex + 1} / ${state.cards.length}</span>
      <strong>${escapeHTML(state.cardRevealed ? card.back : card.front)}</strong>
      <span class="small muted" style="margin-top:14px">
        ${state.cardRevealed
          ? t("اضغط لإخفاء الإجابة", "Click to hide answer")
          : t("اضغط لإظهار الإجابة", "Click to reveal answer")}
      </span>
    </div>
    <div class="card-controls">
      <button id="prevCard" class="btn btn-secondary" type="button">${t("السابق", "Previous")}</button>
      <button id="nextCard" class="btn btn-secondary" type="button">${t("التالي", "Next")}</button>
      <button id="rememberCard" class="btn btn-primary" type="button">${t("عرفتها ✓", "I knew it ✓")}</button>
    </div>
  `;

  const flip = () => {
    state.cardRevealed = !state.cardRevealed;
    renderCard();
  };

  $("#flashcard").addEventListener("click", flip);
  $("#flashcard").addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      flip();
    }
  });

  $("#prevCard").disabled = state.cardIndex === 0;
  $("#nextCard").disabled = state.cardIndex === state.cards.length - 1;

  $("#prevCard").addEventListener("click", () => {
    state.cardIndex--;
    state.cardRevealed = false;
    renderCard();
  });

  $("#nextCard").addEventListener("click", () => {
    state.cardIndex++;
    state.cardRevealed = false;
    renderCard();
  });

  $("#rememberCard").addEventListener("click", () => {
    state.stats.xp += 2;
    markStudyDay();
    saveStats();
    renderDashboard();

    state.cardIndex = (state.cardIndex + 1) % state.cards.length;
    state.cardRevealed = false;
    renderCard();
    showMessage(t("+2 نقطة خبرة لمراجعة البطاقة!", "+2 XP for reviewing a card!"));
  });
}

function renderMindmap(text) {
  const output = $("#mindmapOutput");
  const sentences = splitSentences(text).slice(0, 6);
  const keywords = getKeywords(text, 1);
  const root = keywords[0] || t("المحاضرة", "Lecture");

  if (!sentences.length) {
    output.className = "output empty-state";
    output.textContent = t("لا يوجد نص كافٍ لإنشاء الخريطة.", "Not enough text to create a map.");
    return;
  }

  output.className = "output";
  output.innerHTML = `
    <div class="mindmap">
      <div class="mindmap-root">${escapeHTML(root)}</div>
      ${sentences.map((sentence, index) => `
        <div class="mindmap-branch">
          <strong>${t("الفكرة", "Idea")} ${index + 1}</strong>
          <div>${escapeHTML(sentence)}</div>
        </div>
      `).join("")}
    </div>
    <p class="small muted">${t("خريطة أولية مبنية على الجمل والكلمات المتكررة.", "A basic map built from sentences and frequent words.")}</p>
  `;
}

async function extractPDF(file) {
  if (!window.pdfjsLib) {
    throw new Error(t(
      "تعذر تحميل مكتبة PDF. تحقق من اتصال الإنترنت ثم أعد المحاولة.",
      "Could not load the PDF library. Check your internet connection and try again."
    ));
  }

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
  let text = "";

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    text += content.items.map(item => item.str).join(" ") + "\n";
  }

  return normalizeText(text);
}

$("#fileInput").addEventListener("change", async event => {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const allowed = /\.(pdf|txt|md|csv)$/i.test(file.name);
  if (!allowed) {
    showMessage(t("اختر ملف PDF أو TXT أو MD أو CSV.", "Choose a PDF, TXT, MD or CSV file."), true);
    return;
  }

  if (file.size > 15 * 1024 * 1024) {
    showMessage(t("حجم الملف أكبر من 15 ميجابايت.", "The file is larger than 15 MB."), true);
    return;
  }

  state.fileName = file.name;
  $("#fileStatus").textContent = file.name;
  showMessage(t("جارٍ قراءة الملف...", "Reading file..."));

  try {
    if (/\.pdf$/i.test(file.name)) {
      state.text = await extractPDF(file);
    } else {
      state.text = normalizeText(await file.text());
    }

    $("#notesInput").value = state.text;
    showMessage(t("تمت قراءة الملف. اضغط تحليل المحاضرة.", "File read successfully. Click Analyze lecture."));
  } catch (error) {
    console.error(error);
    showMessage(error.message || t("تعذرت قراءة الملف.", "Could not read the file."), true);
  }
});

$("#processBtn").addEventListener("click", () => {
  const text = normalizeText($("#notesInput").value || state.text);

  if (text.length < 80) {
    showMessage(t(
      "أضف نصًا أطول قليلًا (80 حرفًا على الأقل) للحصول على نتائج أفضل.",
      "Please add a longer text (at least 80 characters) for better results."
    ), true);
    return;
  }

  state.text = text;
  state.summary = makeSummary(text);
  state.quiz = buildQuiz(text);
  state.cards = makeCards(text);
  state.cardIndex = 0;
  state.cardRevealed = false;

  state.stats.files++;
  state.stats.xp += 5;
  markStudyDay();
  saveStats();

  renderSummary();
  renderDashboard();
  renderDNA();
  showMessage(t(
    "تم تحليل المحاضرة! كسبت 5 نقاط خبرة.",
    "Lecture analyzed! You earned 5 XP."
  ));
});

$("#quizBtn").addEventListener("click", () => {
  if (!state.text) {
    showMessage(t("ارفع ملفًا أو الصق نص المحاضرة أولًا.", "Upload a file or paste lecture text first."), true);
    return;
  }

  state.quiz = buildQuiz(state.text);
  renderQuiz();
});

$("#cardsBtn").addEventListener("click", () => {
  if (!state.text) {
    showMessage(t("حلّل محاضرة أولًا.", "Analyze a lecture first."), true);
    return;
  }

  state.cards = makeCards(state.text);
  state.cardIndex = 0;
  state.cardRevealed = false;
  renderCard();
});

$("#mindmapBtn").addEventListener("click", () => {
  if (!state.text) {
    showMessage(t("حلّل محاضرة أولًا.", "Analyze a lecture first."), true);
    return;
  }

  renderMindmap(state.text);
});

$("#copySummaryBtn").addEventListener("click", async () => {
  if (!state.summary.length) {
    showMessage(t("لا يوجد ملخص لنسخه.", "There is no summary to copy."), true);
    return;
  }

  try {
    await navigator.clipboard.writeText(state.summary.join("\n\n"));
    showMessage(t("تم نسخ الملخص.", "Summary copied."));
  } catch {
    showMessage(t(
      "تعذر النسخ التلقائي. حدّد نص الملخص وانسخه يدويًا.",
      "Automatic copying failed. Select and copy the summary manually."
    ), true);
  }
});

function markStudyDay() {
  const today = new Date().toISOString().slice(0, 10);

  if (state.stats.lastStudy === today) return;

  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().slice(0, 10);

  if (state.stats.lastStudy === yesterday) {
    state.stats.streak++;
  } else {
    state.stats.streak = 1;
  }

  state.stats.lastStudy = today;
}

function renderDashboard() {
  const scores = state.stats.scores || [];
  const average = scores.length
    ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
    : null;

  $("#filesStat").textContent = state.stats.files;
  $("#averageStat").textContent = average === null ? "—" : `${average}%`;
  $("#xpStat").textContent = `${state.stats.xp} XP`;
  $("#streakStat").textContent = state.stats.streak;

  $("#badgeQuiz").textContent = state.stats.completedQuiz ? "✓" : "🔒";
  $("#badgeFiles").textContent = state.stats.files >= 3 ? "✓" : "🔒";
  $("#badgeScore").textContent = state.stats.bestScore >= 80 ? "✓" : "🔒";
  $("#badgeStreak").textContent = state.stats.streak >= 3 ? "✓" : "🔒";

  ["badgeQuiz", "badgeFiles", "badgeScore", "badgeStreak"].forEach(id => {
    const badge = $("#" + id);
    badge.classList.toggle("unlocked", badge.textContent === "✓");
  });
}

function renderDNA() {
  const scores = state.stats.scores || [];
  const average = scores.length
    ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
    : 0;

  $("#dnaPercent").textContent = `${average}%`;
  $("#dnaBar").style.width = `${average}%`;

  $("#dnaMessage").textContent = scores.length
    ? (average >= 80
      ? t("أداؤك جيد! حافظ على المراجعة وحاول أسئلة أصعب.", "Great progress! Keep reviewing and try harder questions.")
      : t("ركّز على الأسئلة التي أخطأت فيها وأعد مراجعتها.", "Focus on missed questions and review them again."))
    : t("حلّ اختبارًا لبدء تحليل أدائك.", "Complete a quiz to start analyzing your performance.");

  const weakWords = Object.entries(state.stats.weakWords || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const container = $("#weakTopics");
  container.innerHTML = weakWords.length
    ? `<span class="small muted">${t("كلمات تحتاج مراجعة:", "Words to review:")}</span>` +
      weakWords.map(([word, count]) =>
        `<span class="topic-chip">${escapeHTML(word)} · ${count}</span>`
      ).join("")
    : `<span class="small muted">${t("ستظهر هنا الكلمات المرتبطة بإجاباتك الخاطئة.", "Words associated with incorrect answers will appear here.")}</span>`;
}

$("#languageBtn").addEventListener("click", () => {
  state.language = state.language === "ar" ? "en" : "ar";

  document.documentElement.lang = state.language;
  document.documentElement.dir = state.language === "ar" ? "rtl" : "ltr";
  $("#languageBtn").textContent = state.language === "ar" ? "English" : "العربية";

  document.querySelectorAll("[data-ar][data-en]").forEach(element => {
    element.textContent = element.getAttribute(
      state.language === "ar" ? "data-ar" : "data-en"
    );
  });

  renderSummary();
  renderDashboard();
  renderDNA();

  if (state.quiz.length) renderQuiz();
  if (state.cards.length) renderCard();
  if (state.text && $("#mindmapOutput").children.length) renderMindmap(state.text);
});

$("#resetBtn").addEventListener("click", () => {
  const confirmed = window.confirm(t(
    "هل تريد مسح الإحصائيات والنقاط المحفوظة في هذا المتصفح؟",
    "Do you want to clear the statistics and points saved in this browser?"
  ));

  if (!confirmed) return;

  localStorage.removeItem(STORAGE_KEY);
  state.stats = loadStats();
  renderDashboard();
  renderDNA();
  showMessage(t("تم مسح التقدم المحلي.", "Local progress has been reset."));
});

renderDashboard();
renderDNA();
renderSummary();
renderQuiz();
renderCard();

