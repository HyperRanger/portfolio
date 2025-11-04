// Small, accessible mobile nav toggle — compatible with old and new markup
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('nav-toggle');
  // support both old (#primary-menu) and new (.nav-list)
  let menu = document.getElementById('primary-menu');
  if (!menu) menu = document.querySelector('.nav-list');

  if (!toggle || !menu) return;

  // ensure aria-expanded exists
  if (!toggle.hasAttribute('aria-expanded')) toggle.setAttribute('aria-expanded', 'false');

  const openClass = 'open';

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    menu.classList.toggle(openClass);
  });

  // Close when a link inside the menu is clicked (mobile)
  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove(openClass);
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      menu.classList.remove(openClass);
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
});
