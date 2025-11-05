// theme.js — handles morning/night theme toggle and persistence
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('theme-toggle');
  const body = document.body;
  const key = 'site-theme';

  function applyTheme(name) {
    body.classList.remove('theme-morning', 'theme-night');
    body.classList.add(name === 'morning' ? 'theme-morning' : 'theme-night');
    // update toggle icon/title
    if (toggle) toggle.textContent = name === 'morning' ? '☀️' : '🌙';
  }

  // load saved preference or default to night
  let saved = null;
  try { saved = localStorage.getItem(key); } catch (e) {}
  const start = saved || 'night';
  applyTheme(start);

  if (!toggle) return;
  toggle.addEventListener('click', () => {
    const next = body.classList.contains('theme-morning') ? 'night' : 'morning';
    applyTheme(next);
    try { localStorage.setItem(key, next); } catch (e) {}
  });
});
