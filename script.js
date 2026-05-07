// Purrplexity — Let me Purrplexity that for you.
// Single-page: builder mode (no ?q=) or scene mode (?q=...).

const params = new URLSearchParams(location.search);
const query = params.get('q');
const app = document.getElementById('app');

const REDIRECT_URL = (q) =>
  `https://www.perplexity.ai/search?q=${encodeURIComponent(q)}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

if (query && query.trim()) {
  renderScene(query.trim());
} else {
  renderBuilder();
}

/* ============================ BUILDER ============================ */
function renderBuilder() {
  app.innerHTML = `
    <div class="builder">
      <div class="logo" aria-hidden="true">😵‍💫</div>
      <h1 class="brand">Purr<span class="accent">plexity</span></h1>
      <p class="tagline">Let me Purrplexity that for you. (We're just as confused as you.)</p>

      <div class="input-wrap">
        <input id="q" type="text" placeholder="What are they confused about?" autocomplete="off" autofocus />
        <div class="input-row">
          <span>🐱 powered by Imaginary Cats™</span>
          <button id="go" class="send-btn" title="Hallucinate a link" aria-label="Generate link">→</button>
        </div>
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

  function generate() {
    const v = input.value.trim();
    if (!v) {
      input.focus();
      return;
    }
    const url = `${location.origin}${location.pathname}?q=${encodeURIComponent(v)}`;
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
async function renderScene(q) {
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
            <div class="fake-logo" aria-hidden="true">😵‍💫</div>
            <h1 class="fake-brand">Purr<span class="accent">plexity</span></h1>
            <p class="fake-question">What are you confused about?</p>
            <div id="fake-input-wrap" class="fake-input-wrap">
              <div id="fake-input" class="fake-input placeholder">Ask anything (we'll guess)...</div>
              <div class="fake-send-row">
                <span>🐱 Imaginary Cats™ engaged</span>
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
    location.replace(REDIRECT_URL(q));
  };
  skipBtn.addEventListener('click', finish);

  // Move cursor to a target element (coordinates relative to .browser).
  const moveCursorTo = async (el, offsetX = 12, offsetY = 14) => {
    const bRect = browser.getBoundingClientRect();
    const tRect = el.getBoundingClientRect();
    const x = tRect.left - bRect.left + offsetX;
    const y = tRect.top - bRect.top + offsetY;
    cursor.style.transform = `translate(${x}px, ${y}px)`;
    await sleep(750);
  };

  // Place cursor offstage initially (bottom-right).
  const initRect = browser.getBoundingClientRect();
  cursor.style.transition = 'none';
  cursor.style.transform = `translate(${initRect.width - 60}px, ${initRect.height - 40}px)`;
  // Force reflow then re-enable transitions.
  void cursor.offsetWidth;
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

  // ---- Choreography ----
  await sleep(500);
  if (skipped) return;

  // 1. Cursor → URL bar, type address.
  await moveCursorTo(urlbar, 18, 8);
  await sleep(200);
  await typeText(urlbar, 'perplexity.ai', 75);
  await sleep(450);
  if (skipped) return;

  // 2. "Page loads".
  fakePage.classList.add('visible');
  await sleep(750);

  // 3. Cursor → input, type query.
  await moveCursorTo(fakeInput, 18, 12);
  fakeInputWrap.classList.add('focused');
  await sleep(220);
  await typeText(fakeInput, q, 50);
  await sleep(500);
  if (skipped) return;

  // 4. Cursor → send button, click.
  await moveCursorTo(fakeSend, 16, 16);
  await sleep(180);
  fakeSend.classList.add('flash');
  await sleep(450);

  // 5. Redirect to the real Perplexity.
  finish();
}
