// Let Me GPT That For You — single-page parody.
// Builder mode (no ?q=) creates shareable links.
// Scene mode (?q=...&e=...) plays the cursor animation, then redirects.

/* ============================ ENGINES ============================ */
const ENGINES = {
  chatgpt: {
    label: 'WhatGPT?',
    brand: { prefix: 'What', suffix: 'GPT?' }, // suffix gets the accent color
    logo: '🤔',
    domain: 'chatgpt.com',
    question: "Wait, what's the question?",
    placeholder: "Message WhatGPT? (we'll guess)...",
    engaged: '🤖 Hallucinations enabled',
    pillIcon: '🤔',
    pillLabel: 'WhatGPT?',
    redirect: (q) => `https://chatgpt.com/?q=${encodeURIComponent(q)}`,
  },
  perplexity: {
    label: 'Purrplexity',
    brand: { prefix: 'Purr', suffix: 'plexity' },
    logo: '😵\u200d💫',
    domain: 'perplexity.ai',
    question: 'What are you confused about?',
    placeholder: "Ask anything (we'll guess)...",
    engaged: '🐱 Imaginary Cats™ engaged',
    pillIcon: '😵\u200d💫',
    pillLabel: 'Purrplexity',
    redirect: (q) => `https://www.perplexity.ai/search?q=${encodeURIComponent(q)}`,
  },
};

const DEFAULT_BUILDER_ENGINE = 'chatgpt';   // what the builder selects on first load
const DEFAULT_SCENE_ENGINE = 'perplexity';  // fallback for old links missing &e=

const params = new URLSearchParams(location.search);
const query = params.get('q');
const app = document.getElementById('app');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const setBodyEngine = (key) => { document.body.dataset.engine = key; };

if (query && query.trim()) {
  const engineKey = (params.get('e') || DEFAULT_SCENE_ENGINE).toLowerCase();
  const engine = ENGINES[engineKey] || ENGINES[DEFAULT_SCENE_ENGINE];
  setBodyEngine(engineKey in ENGINES ? engineKey : DEFAULT_SCENE_ENGINE);
  renderScene(query.trim(), engine);
} else {
  setBodyEngine(DEFAULT_BUILDER_ENGINE);
  renderBuilder();
}

/* ============================ BUILDER ============================ */
function renderBuilder() {
  const enginePills = Object.entries(ENGINES).map(([key, e]) => `
    <label class="engine-pill">
      <input type="radio" name="engine" value="${key}" ${key === DEFAULT_BUILDER_ENGINE ? 'checked' : ''} />
      <span>${e.pillIcon} ${e.pillLabel}</span>
    </label>
  `).join('');

  app.innerHTML = `
    <div class="builder">
      <div class="logo" aria-hidden="true">🤖</div>
      <h1 class="brand">Let Me <span class="accent">[AI]</span> That For You</h1>
      <p class="tagline">For questions that deserved a quick search. (We're just as confused as you.)</p>

      <div class="input-wrap">
        <input id="q" type="text" placeholder="What are they confused about?" autocomplete="off" autofocus />
        <div class="input-row">
          <span>🤖 powered by Loving Condescension™</span>
          <button id="go" class="send-btn" title="Generate link" aria-label="Generate link">→</button>
        </div>
      </div>

      <div class="engine-row" role="radiogroup" aria-label="Pick an engine">
        ${enginePills}
      </div>

      <div id="output" class="output">
        <div class="output-label">Your shareable link of gentle condescension</div>
        <div id="output-url" class="output-url"></div>
        <div class="output-actions">
          <button id="copy" class="btn">📋 Copy link</button>
          <a id="preview" class="btn" target="_blank" rel="noopener">▶ Preview the scene</a>
        </div>
      </div>

      <p class="footer-note">A loving parody. Not affiliated with anyone smart.</p>
    </div>
  `;

  const input = document.getElementById('q');
  const go = document.getElementById('go');
  const output = document.getElementById('output');
  const outputUrl = document.getElementById('output-url');
  const copyBtn = document.getElementById('copy');
  const previewLink = document.getElementById('preview');
  const radios = document.querySelectorAll('input[name="engine"]');

  // Live-theme the page accent based on the selected engine.
  radios.forEach((r) => {
    r.addEventListener('change', () => {
      if (r.checked) setBodyEngine(r.value);
    });
  });

  function selectedEngine() {
    return document.querySelector('input[name="engine"]:checked').value;
  }

  function generate() {
    const v = input.value.trim();
    if (!v) {
      input.focus();
      return;
    }
    const engineKey = selectedEngine();
    const sp = new URLSearchParams({ q: v, e: engineKey });
    const url = `${location.origin}${location.pathname}?${sp.toString()}`;
    outputUrl.textContent = url;
    previewLink.href = url;
    output.classList.add('visible');
  }

  go.addEventListener('click', generate);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') generate();
  });

  copyBtn.addEventListener('click', async () => {
    if (!outputUrl.textContent) return;
    try {
      await navigator.clipboard.writeText(outputUrl.textContent);
      copyBtn.textContent = '✓ Copied!';
    } catch {
      copyBtn.textContent = '⚠ Copy failed';
    }
    setTimeout(() => { copyBtn.textContent = '📋 Copy link'; }, 1600);
  });
}

/* ============================ SCENE ============================ */
async function renderScene(q, engine) {
  app.innerHTML = `
    <button id="skip" class="skip-btn" type="button">Skip ⏭</button>
    <div class="scene">
      <div class="browser" id="browser">
        <div id="cursor" class="cursor"></div>
        <div class="browser-chrome">
          <div class="dots"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
          <div id="urlbar" class="url-bar"></div>
        </div>
        <div class="browser-body">
          <div id="fake-page" class="fake-page">
            <div class="fake-logo" aria-hidden="true">${engine.logo}</div>
            <h1 class="fake-brand">${engine.brand.prefix}<span class="accent">${engine.brand.suffix}</span></h1>
            <p class="fake-question">${engine.question}</p>
            <div id="fake-input-wrap" class="fake-input-wrap">
              <div id="fake-input" class="fake-input placeholder">${engine.placeholder}</div>
              <div class="fake-send-row">
                <span>${engine.engaged}</span>
                <button id="fake-send" class="send-btn" title="Hallucinate" aria-label="Hallucinate">→</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const skipBtn = document.getElementById('skip');
  const browser = document.getElementById('browser');
  const cursor = document.getElementById('cursor');
  const urlbar = document.getElementById('urlbar');
  const fakePage = document.getElementById('fake-page');
  const fakeInputWrap = document.getElementById('fake-input-wrap');
  const fakeInput = document.getElementById('fake-input');
  const fakeSend = document.getElementById('fake-send');

  let skipped = false;
  const finish = () => {
    if (skipped) return;
    skipped = true;
    location.replace(engine.redirect(q));
  };
  skipBtn.addEventListener('click', finish);

  const moveCursorTo = async (el, offsetX = 12, offsetY = 14) => {
    const bRect = browser.getBoundingClientRect();
    const tRect = el.getBoundingClientRect();
    const x = tRect.left - bRect.left + offsetX;
    const y = tRect.top - bRect.top + offsetY;
    cursor.style.transform = `translate(${x}px, ${y}px)`;
    await sleep(750);
  };

  // Place cursor offstage initially (bottom-right of the browser frame).
  const initRect = browser.getBoundingClientRect();
  cursor.style.transition = 'none';
  cursor.style.transform = `translate(${initRect.width - 60}px, ${initRect.height - 40}px)`;
  void cursor.offsetWidth; // force reflow
  cursor.style.transition = '';

  const typeText = async (el, text, speed = 55) => {
    el.textContent = '';
    el.classList.remove('placeholder');
    el.classList.add('typing');
    for (const ch of text) {
      if (skipped) return;
      el.textContent += ch;
      await sleep(speed + Math.random() * 50);
    }
    el.classList.remove('typing');
  };

  /* ---- Choreography ---- */
  await sleep(500);
  if (skipped) return;

  await moveCursorTo(urlbar, 18, 8);
  await sleep(200);
  await typeText(urlbar, engine.domain, 75);
  await sleep(450);
  if (skipped) return;

  fakePage.classList.add('visible');
  await sleep(750);

  await moveCursorTo(fakeInput, 18, 12);
  fakeInputWrap.classList.add('focused');
  await sleep(220);
  await typeText(fakeInput, q, 50);
  await sleep(500);
  if (skipped) return;

  await moveCursorTo(fakeSend, 16, 16);
  await sleep(180);
  fakeSend.classList.add('flash');
  await sleep(450);

  finish();
}
