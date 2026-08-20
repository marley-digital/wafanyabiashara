(function () {
  'use strict';

  /* =========================================================
     CONFIG — replace this number before deploying.
     ========================================================= */
  var WHATSAPP_NUMBER = '255XXXXXXXXX';

  var PREFERS_REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var STORAGE_KEY = 'tathmini_state_v1';

  /* =========================================================
     QUIZ DATA
     ========================================================= */
  var QUESTIONS = [
    {
      id: 'q1', type: 'single',
      text: 'Kwa sasa biashara yako imesajiliwa kwa muundo gani?',
      options: [
        { label: 'Haijasajiliwa kabisa', score: 0, tag: 'unregistered' },
        { label: 'Imesajiliwa kama jina la biashara/sole proprietor', score: 1, tag: 'sole' },
        { label: 'Imesajiliwa kama kampuni', score: 2, tag: 'company' },
        { label: 'Sifahamu vizuri muundo wake', score: 0, tag: 'unsure' }
      ]
    },
    {
      id: 'q2', type: 'single', scored: false,
      text: 'Kwa wastani, biashara yako inaingiza kiasi gani kwa mwezi kabla ya kutoa gharama?',
      options: [
        { label: 'Chini ya TZS 1,000,000', tag: 'low' },
        { label: 'TZS 1,000,000–5,000,000', tag: 'mid' },
        { label: 'TZS 5,000,001–20,000,000', tag: 'high' },
        { label: 'Zaidi ya TZS 20,000,000', tag: 'vhigh' },
        { label: 'Mapato hubadilika na sijawahi kuyahesabu vizuri', tag: 'unknown' }
      ]
    },
    {
      id: 'q3', type: 'single', scored: false,
      text: 'Wateja wako wengi wanakulipa kwa njia gani?',
      options: [
        { label: 'Fedha taslimu', tag: 'cash' },
        { label: 'Simu—M-Pesa, Airtel Money, Mixx by Yas na mingine', tag: 'mobile' },
        { label: 'Benki', tag: 'bank' },
        { label: 'Mchanganyiko wa fedha taslimu na kidigitali', tag: 'mixed' },
        { label: 'Mfumo wa malipo wa mtandaoni', tag: 'online' }
      ]
    },
    {
      id: 'q4', type: 'single',
      text: 'Unatenganisha fedha zako binafsi na fedha za biashara?',
      options: [
        { label: 'Ndiyo, nina akaunti au mfumo tofauti', score: 2, tag: 'separate' },
        { label: 'Kwa kiasi fulani, lakini wakati mwingine nazichanganya', score: 1, tag: 'partial' },
        { label: 'Hapana, fedha zote zinapitia sehemu moja', score: 0, tag: 'mixed' },
        { label: 'Sina uhakika namna sahihi ya kuzitenganisha', score: 0, tag: 'unsure' }
      ]
    },
    {
      id: 'q5', type: 'single',
      text: 'Unaweka kumbukumbu na ushahidi wa gharama za biashara?',
      subtext: 'Mfano: risiti, ankara, mikataba, mishahara, kodi ya pango, manunuzi na matangazo.',
      options: [
        { label: 'Ndiyo, nina kumbukumbu kamili', score: 2, tag: 'complete' },
        { label: 'Nina baadhi, lakini si zote', score: 1, tag: 'some' },
        { label: 'Mara chache', score: 0, tag: 'rare' },
        { label: 'Sina mfumo wowote wa kuhifadhi kumbukumbu', score: 0, tag: 'none' }
      ]
    },
    {
      id: 'q6', type: 'multi', scored: false,
      text: 'Biashara yako ina hali yoyote kati ya hizi?',
      subtext: 'Chagua zote zinazohusika.',
      options: [
        { label: 'Ina wafanyakazi', tag: 'employees' },
        { label: 'Ina mshirika au wamiliki zaidi ya mmoja', tag: 'partners' },
        { label: 'Ina mali au vifaa vya thamani', tag: 'assets' },
        { label: 'Inataka kuomba zabuni au mikataba mikubwa', tag: 'tenders' },
        { label: 'Inatafuta mkopo au uwekezaji', tag: 'loan' },
        { label: 'Ina madeni au hatari zinazoweza kuathiri mali zangu binafsi', tag: 'liability' },
        { label: 'Hakuna kati ya hizo', tag: 'none' }
      ]
    },
    {
      id: 'q7', type: 'single',
      text: 'Kwa sasa, hali yako kuhusu kodi ikoje?',
      options: [
        { label: 'Nafahamu na kutimiza majukumu yangu', score: 2, tag: 'compliant' },
        { label: 'Nalipa, lakini sielewi vizuri jinsi kodi inavyokokotolewa', score: 1, tag: 'unsure_calc' },
        { label: 'Nimewahi kupata makadirio au barua ambayo sikujiandaa nayo', score: 0, tag: 'surprised' },
        { label: 'Sijaanza kushughulikia masuala ya kodi', score: 0, tag: 'not_started' },
        { label: 'Sina uhakika kuhusu hali yangu', score: 0, tag: 'unsure' }
      ]
    },
    {
      id: 'q8', type: 'single', scored: false,
      text: 'Ni jambo gani linakupa wasiwasi zaidi kuhusu biashara yako?',
      options: [
        { label: 'Kupokea makadirio makubwa ya kodi', tag: 'estimates' },
        { label: 'Kuchanganya mali binafsi na biashara', tag: 'mixing' },
        { label: 'Kukosa kumbukumbu za kuthibitisha gharama', tag: 'records' },
        { label: 'Kukosa mikataba, zabuni au fursa kubwa', tag: 'contracts' },
        { label: 'Kutojua kama nisajili kampuni', tag: 'registration' },
        { label: 'Kutokujua hatua ya kuanzia', tag: 'unsure_start' },
        { label: 'Nataka tu kuhakikisha nimejiandaa vizuri', tag: 'reassurance' }
      ]
    }
  ];

  var FINDING_TEXT = {
    q1: {
      unregistered: 'Biashara yako haijasajiliwa kabisa — hii inakuweka kwenye hatari kubwa ya kutokuwa na ulinzi wa kisheria na kukosa uwazi mbele ya mamlaka.',
      unsure: 'Hufahamu vizuri muundo wa usajili wa biashara yako — hali hii inaweza kuleta changamoto endapo utahitajika kuuthibitisha.',
      sole: 'Biashara yako imesajiliwa kama jina la biashara pekee — muundo huu hautenganishi mali zako binafsi na madeni ya biashara.',
      company: 'Biashara yako imesajiliwa kama kampuni — msingi mzuri, lakini bado unahitaji taratibu sahihi za uhasibu zinazoendana na muundo huu.'
    },
    q4: {
      mixed: 'Fedha za biashara na fedha zako binafsi zinapitia sehemu moja — hii inafanya iwe vigumu kuthibitisha mapato halisi na kukuweka kwenye hatari ya kuchanganya madeni.',
      unsure: 'Hujui namna sahihi ya kutenganisha fedha za biashara na fedha binafsi — hatua hii ni muhimu kuepusha hatari kwa mali zako binafsi.',
      partial: 'Bado unachanganya fedha za biashara na fedha binafsi mara kwa mara — hii inaweza kuathiri usahihi wa taarifa zako za kifedha.',
      separate: 'Tayari unatenganisha fedha za biashara na fedha binafsi — hatua nzuri, hakikisha mfumo huu unadumishwa kwa uthabiti.'
    },
    q5: {
      none: 'Huna mfumo wowote wa kuhifadhi kumbukumbu za gharama — bila ushahidi wa gharama, mapato yako yote yanaweza kuonekana kama faida mbele ya mamlaka.',
      rare: 'Unaweka kumbukumbu za gharama mara chache tu — pengo hili linaweza kukugharimu wakati wa kuthibitisha gharama halisi za biashara.',
      some: 'Una baadhi tu ya kumbukumbu za gharama, si zote — mapungufu haya yanaweza kupunguza uwezo wako wa kuthibitisha gharama zote halali.',
      complete: 'Una kumbukumbu kamili za gharama za biashara — jambo zuri, hakikisha nyaraka hizo zimepangwa kwa utaratibu unaokidhi mahitaji ya kikodi.'
    },
    q7: {
      surprised: 'Umeshawahi kupokea makadirio au barua ya kodi uliyokuwa hujajiandaa nayo — ishara kuwa mfumo wako wa sasa haukutoshi kukukinga.',
      not_started: 'Bado hujaanza kushughulikia masuala ya kodi ya biashara yako — kuchelewa huku kunaweza kuongeza hatari na gharama za baadaye.',
      unsure: 'Hujui vizuri hali yako ya kikodi kwa sasa — hali hii inaweza kukushtua ukipata mawasiliano kutoka TRA.',
      unsure_calc: 'Unalipa kodi lakini hufahamu vizuri jinsi inavyokokotolewa — hii inaweza kukufanya ushindwe kupanga bajeti sahihi.',
      compliant: 'Unafahamu na kutimiza majukumu yako ya kikodi — msingi mzuri, lakini bado kuna nafasi ya kuboresha upangaji wa kodi kwa ufanisi zaidi.'
    }
  };

  var Q8_LINES = {
    estimates: 'Kwa kuwa wasiwasi wako mkubwa ni kupokea makadirio makubwa ya kodi, hatua ya kwanza ni kuweka kumbukumbu sahihi za gharama zako ili uwe na uwezo wa kuthibitisha faida yako halisi.',
    mixing: 'Kwa kuwa unahofia kuchanganya mali binafsi na za biashara, kutenganisha fedha zako mapema ndiyo hatua muhimu zaidi utakayochukua sasa.',
    records: 'Kwa kuwa unahofia kukosa kumbukumbu za kuthibitisha gharama, kuweka mfumo wa nyaraka sahihi ndiyo eneo la kuanzia kwako.',
    contracts: 'Kwa kuwa unataka kuwa tayari kwa mikataba na zabuni kubwa, muundo sahihi wa biashara na nyaraka kamili ndiyo msingi utakaokufungulia fursa hizo.',
    registration: 'Kwa kuwa hujui kama unapaswa kusajili kampuni, tutakusaidia kuelewa muundo unaofaa zaidi kwa hatua uliyopo ya biashara yako.',
    unsure_start: 'Kwa kuwa hujui hatua ya kuanzia, tutakuongoza hatua kwa hatua kulingana na hali halisi ya biashara yako.',
    reassurance: 'Kwa kuwa unataka tu uhakika kuwa umejiandaa vizuri, tathmini hii ni mwanzo mzuri — tutakupitia maeneo yanayohitaji kuimarishwa.'
  };

  /* =========================================================
     STATE
     ========================================================= */
  var state = loadState();

  function defaultState() {
    return {
      currentQuestionIndex: 0,
      answers: {},
      lead: { jina: '', whatsapp: '', biashara: '' },
      currentView: 'landing'
    };
  }

  function loadState() {
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      var parsed = JSON.parse(raw);
      return Object.assign(defaultState(), parsed);
    } catch (e) {
      return defaultState();
    }
  }

  function saveState() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) { /* ignore */ }
  }

  /* =========================================================
     VIEW ROUTER
     ========================================================= */
  var views = {};
  document.querySelectorAll('.view').forEach(function (el) {
    views[el.getAttribute('data-view')] = el;
  });

  function showView(name) {
    var next = views[name];
    var current = document.querySelector('.view.is-active');
    if (!next || next === current) return;

    state.currentView = name;
    saveState();
    window.scrollTo({ top: 0, behavior: 'auto' });

    if (PREFERS_REDUCED_MOTION || !current) {
      if (current) {
        current.classList.remove('is-active');
      }
      next.classList.add('is-active');
      onViewShown(name);
      return;
    }

    current.classList.add('is-animating-out');
    window.setTimeout(function () {
      current.classList.remove('is-active', 'is-animating-out');
      next.classList.add('is-active', 'is-animating-in');
      onViewShown(name);
      window.setTimeout(function () {
        next.classList.remove('is-animating-in');
      }, 320);
    }, 260);
  }

  function onViewShown(name) {
    if (name === 'quiz') renderQuestion();
    if (name === 'results') renderResults();
  }

  /* =========================================================
     LANDING — CTA buttons + scroll reveal
     ========================================================= */
  document.querySelectorAll('[data-start-quiz]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.currentQuestionIndex = 0;
      saveState();
      showView('quiz');
    });
  });

  if ('IntersectionObserver' in window && !PREFERS_REDUCED_MOTION) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* =========================================================
     QUIZ ENGINE
     ========================================================= */
  var quizBody = document.getElementById('quiz-body');
  var progressFill = document.getElementById('progress-fill');
  var progressLabel = document.getElementById('progress-label');
  var backBtn = document.getElementById('quiz-back');

  backBtn.addEventListener('click', function () {
    if (state.currentQuestionIndex > 0) {
      state.currentQuestionIndex -= 1;
      saveState();
      renderQuestion();
    }
  });

  function renderQuestion() {
    var idx = state.currentQuestionIndex;
    var q = QUESTIONS[idx];
    if (!q) { showView('form'); return; }

    var pct = ((idx + 1) / QUESTIONS.length) * 100;
    progressFill.style.width = pct + '%';
    progressLabel.textContent = 'Swali ' + (idx + 1) + ' kati ya ' + QUESTIONS.length;
    backBtn.hidden = idx === 0;

    var block = document.createElement('div');
    block.className = 'q-block';

    var h = document.createElement('div');
    h.className = 'q-text';
    h.textContent = q.text;
    block.appendChild(h);

    if (q.subtext) {
      var sub = document.createElement('div');
      sub.className = 'q-subtext';
      sub.textContent = q.subtext;
      block.appendChild(sub);
    }

    if (q.type === 'multi') {
      var hint = document.createElement('div');
      hint.className = 'q-hint';
      hint.textContent = 'Chagua zote zinazohusika';
      block.appendChild(hint);
    }

    var existingAnswer = state.answers[q.id];
    var selectedSet = q.type === 'multi'
      ? new Set(Array.isArray(existingAnswer) ? existingAnswer : [])
      : null;

    q.options.forEach(function (opt, optIdx) {
      var card = document.createElement('button');
      card.type = 'button';
      card.className = 'option-card';
      card.setAttribute('data-idx', optIdx);

      if (q.type === 'multi' && selectedSet.has(optIdx)) {
        card.classList.add('is-selected');
      }
      if (q.type === 'single' && existingAnswer === optIdx) {
        card.classList.add('is-selected');
      }

      var label = document.createElement('span');
      label.textContent = opt.label;
      card.appendChild(label);

      var check = document.createElement('span');
      check.className = 'check';
      check.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#0b2438" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      card.appendChild(check);

      card.addEventListener('click', function () {
        if (q.type === 'multi') {
          handleMultiSelect(q, optIdx, card);
        } else {
          handleSingleSelect(q, optIdx, card, block);
        }
      });

      block.appendChild(card);
    });

    if (q.type === 'multi') {
      var continueBtn = document.createElement('button');
      continueBtn.type = 'button';
      continueBtn.className = 'btn btn-cta multi-continue';
      continueBtn.textContent = 'ENDELEA';
      continueBtn.addEventListener('click', function () {
        goToNextQuestion();
      });
      block.appendChild(continueBtn);
    }

    quizBody.innerHTML = '';
    quizBody.appendChild(block);
  }

  function handleSingleSelect(q, optIdx, card, block) {
    block.querySelectorAll('.option-card').forEach(function (c) {
      c.classList.remove('is-selected');
    });
    card.classList.add('is-selected');
    state.answers[q.id] = optIdx;
    saveState();

    window.setTimeout(function () {
      goToNextQuestion();
    }, 250);
  }

  function handleMultiSelect(q, optIdx, card) {
    var current = Array.isArray(state.answers[q.id]) ? state.answers[q.id].slice() : [];
    var pos = current.indexOf(optIdx);
    if (pos === -1) {
      current.push(optIdx);
      card.classList.add('is-selected');
    } else {
      current.splice(pos, 1);
      card.classList.remove('is-selected');
    }
    state.answers[q.id] = current;
    saveState();
  }

  function goToNextQuestion() {
    if (state.currentQuestionIndex < QUESTIONS.length - 1) {
      state.currentQuestionIndex += 1;
      saveState();
      renderQuestion();
    } else {
      showView('form');
    }
  }

  /* =========================================================
     LEAD FORM
     ========================================================= */
  var leadForm = document.getElementById('lead-form');
  var fJina = document.getElementById('f-jina');
  var fWhatsapp = document.getElementById('f-whatsapp');
  var fBiashara = document.getElementById('f-biashara');

  fJina.value = state.lead.jina || '';
  fWhatsapp.value = state.lead.whatsapp || '';
  fBiashara.value = state.lead.biashara || '';

  function normalizeWhatsapp(raw) {
    var clean = String(raw || '').replace(/[\s\-()]/g, '');
    if (/^\+255[67]\d{8}$/.test(clean)) return clean.slice(1);
    if (/^255[67]\d{8}$/.test(clean)) return clean;
    if (/^0[67]\d{8}$/.test(clean)) return '255' + clean.slice(1);
    return null;
  }

  function setFieldError(inputEl, errEl, message) {
    if (message) {
      inputEl.classList.add('has-error');
      errEl.textContent = message;
    } else {
      inputEl.classList.remove('has-error');
      errEl.textContent = '';
    }
  }

  leadForm.addEventListener('submit', function (e) {
    e.preventDefault();

    var jina = fJina.value.trim();
    var biashara = fBiashara.value.trim();
    var normalizedPhone = normalizeWhatsapp(fWhatsapp.value.trim());

    var errJina = document.getElementById('err-jina');
    var errWhatsapp = document.getElementById('err-whatsapp');
    var errBiashara = document.getElementById('err-biashara');

    var valid = true;

    if (!jina) {
      setFieldError(fJina, errJina, 'Tafadhali ingiza jina lako.');
      valid = false;
    } else {
      setFieldError(fJina, errJina, '');
    }

    if (!normalizedPhone) {
      setFieldError(fWhatsapp, errWhatsapp, 'Ingiza namba sahihi ya WhatsApp (mfano: 0712345678).');
      valid = false;
    } else {
      setFieldError(fWhatsapp, errWhatsapp, '');
    }

    if (!biashara) {
      setFieldError(fBiashara, errBiashara, 'Tafadhali ingiza jina au aina ya biashara.');
      valid = false;
    } else {
      setFieldError(fBiashara, errBiashara, '');
    }

    if (!valid) return;

    state.lead = { jina: jina, whatsapp: normalizedPhone, biashara: biashara };
    saveState();

    var scoring = computeScore();
    submitToNetlify(state.lead, scoring);

    showView('results');
  });

  function submitToNetlify(lead, scoring) {
    try {
      var body = new URLSearchParams({
        'form-name': 'tathmini-lead',
        jina: lead.jina,
        whatsapp: lead.whatsapp,
        biashara: lead.biashara,
        alama: String(scoring.score) + '/8',
        ngazi: scoring.tier.title
      }).toString();

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body
      }).catch(function () { /* silent — never block the user flow */ });
    } catch (e) { /* silent */ }
  }

  /* =========================================================
     SCORING
     ========================================================= */
  function computeScore() {
    var score = 0;
    ['q1', 'q4', 'q5', 'q7'].forEach(function (qid) {
      var q = QUESTIONS.filter(function (x) { return x.id === qid; })[0];
      var answerIdx = state.answers[qid];
      if (typeof answerIdx === 'number' && q.options[answerIdx]) {
        score += q.options[answerIdx].score || 0;
      }
    });

    var tier;
    if (score <= 3) {
      tier = { key: 'red', emoji: '🔴', title: 'HATARI KUBWA — Biashara yako haijajiandaa' };
    } else if (score <= 6) {
      tier = { key: 'yellow', emoji: '🟡', title: 'TAHADHARI — Umeanza vizuri, lakini kuna mapungufu makubwa' };
    } else {
      tier = { key: 'green', emoji: '🟢', title: 'UMEJIPANGA VIZURI — Lakini kuna maeneo ya kuimarisha' };
    }

    return { score: score, max: 8, tier: tier };
  }

  function getTag(qid, isMulti) {
    var q = QUESTIONS.filter(function (x) { return x.id === qid; })[0];
    var answerIdx = state.answers[qid];
    if (isMulti) {
      if (!Array.isArray(answerIdx)) return [];
      return answerIdx.map(function (i) { return q.options[i] && q.options[i].tag; }).filter(Boolean);
    }
    if (typeof answerIdx !== 'number' || !q.options[answerIdx]) return null;
    return q.options[answerIdx].tag;
  }

  function buildFindings() {
    var scoredQs = ['q1', 'q4', 'q5', 'q7'];
    var items = scoredQs.map(function (qid) {
      var q = QUESTIONS.filter(function (x) { return x.id === qid; })[0];
      var answerIdx = state.answers[qid];
      var scoreVal = (typeof answerIdx === 'number' && q.options[answerIdx]) ? (q.options[answerIdx].score || 0) : 0;
      var tag = (typeof answerIdx === 'number' && q.options[answerIdx]) ? q.options[answerIdx].tag : null;
      var text = tag && FINDING_TEXT[qid][tag] ? FINDING_TEXT[qid][tag] : null;
      return { score: scoreVal, text: text };
    }).filter(function (i) { return i.text; });

    items.sort(function (a, b) { return a.score - b.score; });
    return items.slice(0, 4).map(function (i) { return i.text; });
  }

  function buildRiskNote() {
    var revenueTag = getTag('q2', false);
    var paymentTag = getTag('q3', false);

    var revenueHigh = revenueTag === 'high' || revenueTag === 'vhigh';
    var visibilityHigh = paymentTag === 'mobile' || paymentTag === 'bank' || paymentTag === 'online';
    var visibilityMixed = paymentTag === 'mixed';

    if (revenueHigh && visibilityHigh) {
      return 'Kwa kuwa biashara yako inaingiza kiasi kikubwa cha mapato kwa mwezi na wateja wako wengi wanalipa kwa njia za kidigitali (simu, benki au mtandaoni), miamala yako ina uwazi mkubwa mbele ya mamlaka — hatari ya kupokea makadirio makubwa ya kodi bila kujiandaa ni kubwa zaidi.';
    }
    if (revenueHigh && visibilityMixed) {
      return 'Kwa kuwa biashara yako ina mapato makubwa kiasi na sehemu ya malipo yako ni ya kidigitali, sehemu kubwa ya miamala yako tayari inaonekana mbele ya mamlaka — kujiandaa sasa kutakukinga na mshangao wa baadaye.';
    }
    if (visibilityHigh) {
      return 'Kwa kuwa wateja wako wengi wanakulipa kupitia njia za kidigitali (simu, benki au mtandaoni), miamala ya biashara yako inaonekana kwa urahisi zaidi mbele ya mamlaka kuliko unavyofikiria.';
    }
    if (revenueHigh) {
      return 'Kwa kuwa biashara yako inaingiza mapato makubwa kwa mwezi, hatari ya kupokea makadirio makubwa ya kodi bila maandalizi sahihi ni kubwa zaidi kadri malipo ya kidigitali yanavyoongezeka nchini.';
    }
    return 'Kadri matumizi ya malipo ya kidigitali yanavyoongezeka nchini kote, miamala ya biashara — hata midogo — inazidi kuonekana kwa urahisi zaidi mbele ya mamlaka. Kujiandaa mapema kunakupa nafasi ya kufanya maamuzi sahihi.';
  }

  /* =========================================================
     RESULTS
     ========================================================= */
  function renderResults() {
    var scoring = computeScore();

    var badge = document.getElementById('result-badge');
    badge.className = 'result-badge tier-' + scoring.tier.key;
    document.getElementById('result-emoji').textContent = scoring.tier.emoji;
    document.getElementById('result-title').textContent = scoring.tier.title;

    var riskNoteEl = document.getElementById('risk-note');
    if (riskNoteEl) riskNoteEl.textContent = buildRiskNote();

    var findings = buildFindings();
    var list = document.getElementById('findings-list');
    list.innerHTML = '';
    findings.forEach(function (text) {
      var li = document.createElement('li');
      li.textContent = text;
      list.appendChild(li);
    });

    var q8Tag = getTag('q8', false);
    var personalLine = document.getElementById('personal-line');
    personalLine.textContent = (q8Tag && Q8_LINES[q8Tag]) ? Q8_LINES[q8Tag] : '';

    var gaugeNumber = document.getElementById('gauge-number');
    var gaugeArc = document.getElementById('gauge-arc');
    gaugeNumber.textContent = '0';
    gaugeArc.style.transition = 'none';
    gaugeArc.style.strokeDashoffset = '251.2';

    var whatsappCta = document.getElementById('whatsapp-cta');
    var message = 'Habari, naitwa ' + state.lead.jina + '. Nimefanya tathmini ya biashara yangu (' +
      state.lead.biashara + ') na nimepata matokeo: ' + scoring.tier.title +
      '. Nataka msaada wa kuandaa biashara yangu.';
    whatsappCta.href = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);

    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        gaugeArc.style.transition = PREFERS_REDUCED_MOTION ? 'none' : 'stroke-dashoffset 1.1s cubic-bezier(.22,1,.36,1)';
        var offset = 251.2 - (251.2 * (scoring.score / scoring.max));
        gaugeArc.style.strokeDashoffset = String(offset);

        var start = null;
        var duration = PREFERS_REDUCED_MOTION ? 0 : 900;
        if (duration === 0) {
          gaugeNumber.textContent = String(scoring.score);
          return;
        }
        function step(ts) {
          if (start === null) start = ts;
          var progress = Math.min(1, (ts - start) / duration);
          gaugeNumber.textContent = String(Math.round(progress * scoring.score));
          if (progress < 1) window.requestAnimationFrame(step);
        }
        window.requestAnimationFrame(step);
      });
    });
  }

  /* =========================================================
     INIT — restore mid-flow state on refresh
     ========================================================= */
  (function init() {
    var initialView = state.currentView || 'landing';
    var target = views[initialView] ? initialView : 'landing';

    Object.keys(views).forEach(function (name) {
      views[name].classList.toggle('is-active', name === target);
    });

    if (target === 'quiz') renderQuestion();
    if (target === 'results') renderResults();
  })();

})();
