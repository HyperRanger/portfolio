// projects.js - Project management JavaScript

async function loadProjects() {
    try {
        const response = await fetch('/api/projects', {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                await signOut();
                return;
            }
            throw new Error('Failed to load projects');
        }
        const data = await response.json();
        renderProjects(data.data.projects);
    } catch (err) {
        console.error('Error loading projects:', err);
        alert('Failed to load projects: ' + (err.message || 'Unknown error'));
    }
}

async function saveProject(project) {
    try {
        const method = project.id ? 'PUT' : 'POST';
        const url = project.id ? `/api/admin/project/${project.id}` : '/api/admin/project';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify(project)
        });
        
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                await signOut();
                return;
            }
            throw new Error('Failed to save project');
        }
        
        await loadProjects();
    } catch (err) {
        console.error('Error saving project:', err);
        alert('Failed to save project: ' + (err.message || 'Unknown error'));
    }
}

async function deleteProject(id) {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
        const response = await fetch(`/api/admin/project/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });
        
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                await signOut();
                return;
            }
            throw new Error('Failed to delete project');
        }
        
        await loadProjects();
    } catch (err) {
        console.error('Error deleting project:', err);
        alert('Failed to delete project: ' + (err.message || 'Unknown error'));
    }
}

function renderProjects(projects) {
    const container = document.getElementById('projects-container');
    container.innerHTML = projects.map(project => `
        <div class="project-card">
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            <div class="project-actions">
                <button onclick="editProject(${project.id})">Edit</button>
                <button onclick="deleteProject(${project.id})">Delete</button>
            </div>
        </div>
    `).join('');