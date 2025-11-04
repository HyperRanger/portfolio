// skills.js — small helper to animate skill progress bars and reveal content on scroll
document.addEventListener('DOMContentLoaded', () => {
  // animate skill fills when they enter viewport
  const fills = document.querySelectorAll('.skill-fill');
  const revealTargets = document.querySelectorAll('.reveal-on-scroll');

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        // skill fill
        if (el.classList.contains('skill-fill')) {
          const level = el.dataset.level || 60;
          requestAnimationFrame(() => el.style.width = level + '%');
        }
        // reveal blocks
        if (el.classList.contains('reveal-on-scroll')) {
          el.classList.add('in-view');
        }
        io.unobserve(el);
      }
    });
  }, { threshold: 0.18 });

  fills.forEach(f => io.observe(f));
  revealTargets.forEach(t => io.observe(t));

  // small hover/tap: expand description on click for mobile
  document.querySelectorAll('.skill-card').forEach(card => {
    card.addEventListener('click', () => card.classList.toggle('active'));
  });
});
