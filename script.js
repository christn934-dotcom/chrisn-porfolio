const loader = document.getElementById('loader');
window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('hidden'), 3500);
});

// ============ ADMIN AUTH ============
const ADMIN_HASH = 'db08971453699fce30e520df715bfaef75cbd249df0fbbb20c7a341e719454ea';
let adminUnlocked = sessionStorage.getItem('adminUnlocked') === 'true';

async function sha256(str) {
    const buffer = new TextEncoder().encode(str);
    const hash = await crypto.subtle.digest('SHA-256', buffer);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ============ SIDEBAR FUNCTIONALITY ============
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.getElementById('adminSidebar');
const sidebarClose = document.getElementById('sidebarClose');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const addProjectForm = document.getElementById('addProjectForm');
const addSkillForm = document.getElementById('addSkillForm');
const projectList = document.getElementById('projectList');
const skillList = document.getElementById('skillList');
const authModal = document.getElementById('authModal');
const authPassword = document.getElementById('authPassword');
const authSubmit = document.getElementById('authSubmit');
const authCancel = document.getElementById('authCancel');
const authError = document.getElementById('authError');
const adminLogout = document.getElementById('adminLogout');

function openSidebar() {
    sidebar.classList.add('open');
    sidebarOverlay.classList.add('visible');
}

function closeSidebar() {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('visible');
}

function showAuthModal() {
    authModal.classList.add('visible');
    authPassword.value = '';
    authError.style.display = 'none';
    setTimeout(() => authPassword.focus(), 100);
}

function hideAuthModal() {
    authModal.classList.remove('visible');
    authPassword.value = '';
    authError.style.display = 'none';
}

async function attemptLogin() {
    const input = authPassword.value;
    const hash = await sha256(input);
    if (hash === ADMIN_HASH) {
        adminUnlocked = true;
        sessionStorage.setItem('adminUnlocked', 'true');
        hideAuthModal();
        openSidebar();
    } else {
        authError.style.display = 'block';
        authPassword.value = '';
        authPassword.focus();
    }
}

function logoutAdmin() {
    adminUnlocked = false;
    sessionStorage.removeItem('adminUnlocked');
    closeSidebar();
}

sidebarToggle.addEventListener('click', () => {
    if (adminUnlocked) {
        openSidebar();
    } else {
        showAuthModal();
    }
});

sidebarClose.addEventListener('click', closeSidebar);
sidebarOverlay.addEventListener('click', closeSidebar);
authSubmit.addEventListener('click', attemptLogin);
authCancel.addEventListener('click', hideAuthModal);
adminLogout.addEventListener('click', logoutAdmin);

authPassword.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') attemptLogin();
    if (e.key === 'Escape') hideAuthModal();
});

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

// ============ RESUME PDF GENERATOR ============
function generateResume() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const name = 'NGWA Christ-Noel Azinwi Fuh';
    const tagline = 'Web Developer';
    const year = new Date().getFullYear();

    // --- Header ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(139, 47, 247); // purple
    doc.text(name, 20, 25);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(91, 84, 112);
    doc.text(tagline, 20, 33);

    // Divider line
    doc.setDrawColor(214, 36, 159);
    doc.setLineWidth(0.8);
    doc.line(20, 37, 190, 37);

    // --- Summary ---
    let y = 45;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(139, 47, 247);
    doc.text('Professional Summary', 20, y);
    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(26, 18, 48);
    const summary = 'Passionate web developer skilled in building responsive, modern websites and solving real-world problems through code. Experienced in frontend (HTML, CSS, JavaScript), backend (PHP), database administration, and graphic design. A strong team player who has collaborated with companies like MiraEdge and Solution.';
    const summaryLines = doc.splitTextToSize(summary, 170);
    doc.text(summaryLines, 20, y);
    y += summaryLines.length * 5 + 6;

    // --- Skills ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(139, 47, 247);
    doc.text('Skills & Experience', 20, y);
    y += 8;

    doc.setFontSize(10);
    doc.setTextColor(26, 18, 48);

    const staticSkills = [
        { title: 'Frontend Development', desc: 'HTML, CSS, JavaScript — responsive, modern, user-friendly websites.' },
        { title: 'Backend Development', desc: 'PHP backend development, dynamic web applications, server-side logic.' },
        { title: 'Database Administration', desc: 'Schema design, reliable queries, data analysis.' },
        { title: 'Team Collaboration', desc: 'Cross-functional teams at MiraEdge and Solution.' },
        { title: 'Graphic Design', desc: 'Logos, image editing, polished visuals.' },
    ];

    const dynamicSkills = loadSkills();
    const allSkills = [
        ...staticSkills,
        ...dynamicSkills.map(s => ({ title: s.title, desc: s.description || '' }))
    ];

    allSkills.forEach(skill => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(214, 36, 159);
        doc.text('▸ ' + skill.title, 22, y);
        y += 5;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        const descLines = doc.splitTextToSize(skill.desc, 165);
        doc.text(descLines, 26, y);
        y += descLines.length * 4.5 + 4;
    });

    y += 2;

    // --- Projects ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(139, 47, 247);
    doc.text('Projects', 20, y);
    y += 8;

    doc.setFontSize(10);

    const staticProjects = [
        { title: 'Flight Webpage', github: 'https://github.com/christn934-dotcom/flight.git' },
        { title: 'To-Do List & Popup Modal', github: 'https://github.com/christn934-dotcom/to-do-list' },
        { title: 'Portfolio', github: 'https://github.com/christn934-dotcom/chrisn-porfolio' },
    ];

    const dynamicProjects = loadProjects();
    const allProjects = [
        ...staticProjects,
        ...dynamicProjects.map(p => ({ title: p.title, github: p.github || '' }))
    ];

    allProjects.forEach(project => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(26, 18, 48);
        doc.text('▸ ' + project.title, 22, y);
        y += 5;
        if (project.github) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(91, 84, 112);
            doc.text(project.github, 26, y);
            doc.setFontSize(10);
            y += 5;
        }
        y += 3;
    });

    // --- Footer ---
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Generated from portfolio • ' + year, 20, 290);
        doc.text('Page ' + i + ' of ' + pageCount, 175, 290);
    }

    doc.save('NGWA_Christ-Noel_Resume.pdf');
}

document.getElementById('downloadResume').addEventListener('click', generateResume);