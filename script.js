async function loadProjects() {
    try {
        const response = await fetch('projects.json');

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const projects = await response.json();

        renderProjects(projects);

    } catch (error) {
        console.error('Failed to load projects:', error);

        document.getElementById('projects-container').innerHTML = `
            <p style="text-align:center">
                Failed to load project data.
            </p>
        `;
    }
}
function normalizeImageUrl(url) {
        if (url.startsWith('//')) {
            return 'https:' + url;
        }

        return url;
    }

function renderProjects(projects) {

    const container = document.getElementById('projects-container');

    container.innerHTML = '';

    projects.forEach(project => {

        const productsHtml = project.products
            .map(product => createProductCard(product))
            .join('');

        const html = `
            <details class="project">

                <summary class="project-title">
                    ${escapeHtml(project.title)}
                </summary>

                <div class="project-content">

                    <div class="project-layout">

                        <div class="project-image">

                            <img
                                src="${normalizeImageUrl(project.image)}"
                                alt="${escapeHtml(project.title)}">

                            <p class="project-description">
                                ${escapeHtml(project.description)}
                            </p>

                        </div>

                        <div class="project-products">
                            ${productsHtml}
                        </div>

                    </div>

                </div>

            </details>
        `;

        container.insertAdjacentHTML('beforeend', html);
    });
}

function createProductCard(product) {
    return `
        <div class="card">

            <a
                href="${product.link}"
                target="_blank"
                rel="noopener noreferrer">

                <img
                    src="${normalizeImageUrl(product.image)}"
                    alt="${escapeHtml(product.title)}">

            </a>

            <div class="card-body">
                <p class="card-title">
                    ${escapeHtml(product.title)}
                </p>
            </div>

        </div>
    `;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
function initializeTheme() {

    const button = document.getElementById('theme-toggle');

    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        button.textContent = '☀️';
    }

    button.addEventListener('click', () => {

        const isDark =
            document.documentElement.getAttribute('data-theme') === 'dark';

        if (isDark) {

            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            button.textContent = '🌙';

        } else {

            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            button.textContent = '☀️';
        }
    });
}
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    loadProjects();
});