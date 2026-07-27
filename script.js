const loader = document.getElementById('loader');
window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('hidden'), 350);
});

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