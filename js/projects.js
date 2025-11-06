// Public projects loader: fetch projects from backend /api/projects and render into .projects-grid
async function loadPublicProjects() {
  const container = document.querySelector('.projects-grid');
  if (!container) return;
  try {
    const resp = await fetch('/api/projects');
    const data = await resp.json();
    if (!data || !data.data || !Array.isArray(data.data.projects)) return;
    const projects = data.data.projects;
    container.innerHTML = projects.map(p => {
      const img = p.image || 'assets/images/project-placeholder.png';
      const liveBtn = p.liveUrl ? `<a href="${p.liveUrl}" target="_blank">Live</a>` : '';
      const githubBtn = p.githubUrl ? `<a href="${p.githubUrl}" target="_blank">Code</a>` : '';
      return `
        <article class="project-card reveal-on-scroll">
          <img src="${img}" alt="${escapeHtml(p.title || 'Project')}" class="project-thumb">
          <div class="project-body">
            <h3>${escapeHtml(p.title || 'Untitled')}</h3>
            <p>${escapeHtml(p.description || '')}</p>
            <div class="project-links">${githubBtn} ${liveBtn}</div>
          </div>
        </article>
      `;
    }).join('');
  } catch (err) {
    console.error('Failed to load projects', err);
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

document.addEventListener('DOMContentLoaded', () => {
  loadPublicProjects();
});
