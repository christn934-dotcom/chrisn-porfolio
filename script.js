const loader = document.getElementById('loader');
window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('hidden'), 3500);
});

// ============ SIDEBAR FUNCTIONALITY ============
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.getElementById('adminSidebar');
const sidebarClose = document.getElementById('sidebarClose');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const addProjectForm = document.getElementById('addProjectForm');
const addSkillForm = document.getElementById('addSkillForm');
const projectList = document.getElementById('projectList');
const skillList = document.getElementById('skillList');

// Toggle sidebar
function openSidebar() {
    sidebar.classList.add('open');
    sidebarOverlay.classList.add('visible');
}

function closeSidebar() {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('visible');
}

sidebarToggle.addEventListener('click', openSidebar);
sidebarClose.addEventListener('click', closeSidebar);
sidebarOverlay.addEventListener('click', closeSidebar);

// Load saved data from localStorage
function loadProjects() {
    return JSON.parse(localStorage.getItem('projects') || '[]');
}

function loadSkills() {
    return JSON.parse(localStorage.getItem('skills') || '[]');
}

function saveProjects(projects) {
    localStorage.setItem('projects', JSON.stringify(projects));
}

function saveSkills(skills) {
    localStorage.setItem('skills', JSON.stringify(skills));
}

// Render projects to the projects section
function renderProjects() {
    const projectsSection = document.querySelector('.pros');
    const projects = loadProjects();

    projects.forEach(project => {
        if (!document.getElementById(`project-${project.id}`)) {
            const proDiv = document.createElement('div');
            proDiv.className = 'pro';
            proDiv.id = `project-${project.id}`;
            proDiv.innerHTML = `
                <img src="${project.image || 'images/default-project.png'}" alt="${project.title}">
                <p>${project.title}</p>
                <div class="pro-links">
                    ${project.github ? `<a href="${project.github}" class="btn-icon" target="_blank" rel="noopener">GitHub</a>` : ''}
                    ${project.live ? `<a href="${project.live}" class="btn-icon btn-icon-fill" target="blank" rel="noopener">Live Preview</a>` : ''}
                </div>
            `;
            projectsSection.appendChild(proDiv);
        }
    });
}

// Render skills to the skills section
function renderSkills() {
    const skillsSection = document.querySelector('.cards');
    const skills = loadSkills();

    skills.forEach(skill => {
        if (!document.getElementById(`skill-${skill.id}`)) {
            const cardDiv = document.createElement('div');
            cardDiv.className = 'card in-view';
            cardDiv.id = `skill-${skill.id}`;
            cardDiv.innerHTML = `
                <img src="${skill.image || 'images/default-skill.png'}" alt="${skill.title}">
                <h3>${skill.title}</h3>
                <p>${skill.description || ''}</p>
            `;
            skillsSection.appendChild(cardDiv);
        }
    });
}

// Render manage lists in sidebar
function renderManageLists() {
    const projects = loadProjects();
    const skills = loadSkills();

    if (projects.length === 0) {
        projectList.innerHTML = '<p class="muted">Your projects will appear here</p>';
    } else {
        projectList.innerHTML = projects.map(p => `
            <div class="manage-item">
                <span>${p.title}</span>
                <button class="delete-btn" onclick="deleteProject('${p.id}')">&times;</button>
            </div>
        `).join('');
    }

    if (skills.length === 0) {
        skillList.innerHTML = '<p class="muted">Your skills will appear here</p>';
    } else {
        skillList.innerHTML = skills.map(s => `
            <div class="manage-item">
                <span>${s.title}</span>
                <button class="delete-btn" onclick="deleteSkill('${s.id}')">&times;</button>
            </div>
        `).join('');
    }
}

// Delete functions
window.deleteProject = function(id) {
    let projects = loadProjects();
    projects = projects.filter(p => p.id !== id);
    saveProjects(projects);
    const el = document.getElementById(`project-${id}`);
    if (el) el.remove();
    renderManageLists();
};

window.deleteSkill = function(id) {
    let skills = loadSkills();
    skills = skills.filter(s => s.id !== id);
    saveSkills(skills);
    const el = document.getElementById(`skill-${id}`);
    if (el) el.remove();
    renderManageLists();
};

// Add project form submission
addProjectForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('projectTitle').value.trim();
    const description = document.getElementById('projectDescription').value.trim();
    const github = document.getElementById('projectGithub').value.trim();
    const live = document.getElementById('projectLive').value.trim();
    const image = document.getElementById('projectImage').value.trim();

    if (!title) return;

    const projects = loadProjects();
    const newProject = {
        id: Date.now().toString(),
        title,
        description,
        github,
        live,
        image
    };
    projects.push(newProject);
    saveProjects(projects);

    renderProjects();
    renderManageLists();
    addProjectForm.reset();
});

// Add skill form submission
addSkillForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('skillTitle').value.trim();
    const description = document.getElementById('skillDescription').value.trim();
    const image = document.getElementById('skillImage').value.trim();

    if (!title) return;

    const skills = loadSkills();
    const newSkill = {
        id: Date.now().toString(),
        title,
        description,
        image
    };
    skills.push(newSkill);
    saveSkills(skills);

    renderSkills();
    renderManageLists();
    addSkillForm.reset();
});

// Initialize on page load
renderProjects();
renderSkills();
renderManageLists();

const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');

function applyTheme(theme) {
    if (theme === 'dark') {
        root.setAttribute('data-theme', 'dark');
        themeToggle.setAttribute('aria-pressed', 'true');
    } else {
        root.removeAttribute('data-theme');
        themeToggle.setAttribute('aria-pressed', 'false');
    }
}

const savedTheme = localStorage.getItem('theme');
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
applyTheme(savedTheme || (systemPrefersDark ? 'dark' : 'light'));

themeToggle.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('theme', next);
});

const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

document.querySelectorAll('.card').forEach((card) => revealObserver.observe(card));

document.getElementById('year').textContent = new Date().getFullYear();

const contactForm = document.querySelector('.contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const button = contactForm.querySelector('button');
        const originalLabel = button.textContent;

        button.textContent = 'Sending...';
        button.disabled = true;

        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: new FormData(contactForm),
                headers: { Accept: 'application/json' },
            });
            button.textContent = response.ok ? 'Message sent ✓' : 'Something went wrong';
            if (response.ok) contactForm.reset();
        } catch (err) {
            button.textContent = 'Network error — try again';
        } finally {
            setTimeout(() => {
                button.textContent = originalLabel;
                button.disabled = false;
            }, 2500);
        }
    });
}