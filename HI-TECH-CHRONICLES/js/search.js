// search.js
const SearchManager = {
    init: () => {
        const searchToggle = document.getElementById('search-toggle');
        const searchOverlay = document.getElementById('search-overlay');
        const closeSearchBtn = document.getElementById('close-search-btn');
        const searchInput = document.getElementById('global-search');
        const filterChips = document.querySelectorAll('.search-filters .filter-chip');

        let currentFilter = 'all';

        if (searchToggle && searchOverlay) {
            searchToggle.addEventListener('click', () => {
                searchOverlay.classList.add('active');
                setTimeout(() => searchInput.focus(), 100);
            });

            closeSearchBtn.addEventListener('click', () => {
                searchOverlay.classList.remove('active');
                searchInput.value = '';
                SearchManager.performSearch();
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
                    searchOverlay.classList.remove('active');
                }
            });
        }

        if (filterChips) {
            filterChips.forEach(chip => {
                chip.addEventListener('click', (e) => {
                    filterChips.forEach(c => c.classList.remove('active'));
                    e.target.classList.add('active');
                    currentFilter = e.target.dataset.type;
                    SearchManager.performSearch();
                });
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                SearchManager.performSearch();
            });
        }
    },

    performSearch: async () => {
        const query = document.getElementById('global-search').value.toLowerCase().trim();
        const resultsContainer = document.getElementById('search-results');
        
        if (query.length < 2) {
            resultsContainer.innerHTML = '';
            resultsContainer.classList.remove('active');
            return;
        }

        const apps = await StorageManager.get('apps');
        const files = await StorageManager.get('files');
        const videos = await StorageManager.get('videos');
        const updates = await StorageManager.get('updates');

        const appResults = apps.filter(app => app.title.toLowerCase().includes(query) || app.category.toLowerCase().includes(query));
        const fileResults = files.filter(file => file.title.toLowerCase().includes(query) || file.category.toLowerCase().includes(query));
        const videoResults = videos.filter(vid => vid.title.toLowerCase().includes(query));
        const updateResults = updates.filter(upd => upd.title.toLowerCase().includes(query) || upd.content.toLowerCase().includes(query));
        
        let resultsHTML = '';
        
        if (appResults.length > 0) {
            resultsHTML += `<div style="padding:10px 15px; font-weight:bold; color:var(--text-secondary); font-size:0.8rem; text-transform:uppercase;">Apps</div>`;
            appResults.forEach(app => {
                resultsHTML += `
                    <div class="search-result-item" onclick="location.hash='#app/${app.id}'; document.getElementById('search-overlay').classList.remove('active')">
                        <span class="material-symbols-rounded" style="color:var(--accent-primary)">${app.icon}</span>
                        <div>
                            <div style="font-weight:600">${app.title}</div>
                            <div style="font-size:0.8rem; color:var(--text-secondary)">${app.category}</div>
                        </div>
                    </div>
                `;
            });
        }

        if (fileResults.length > 0) {
            resultsHTML += `<div style="padding:10px 15px; font-weight:bold; color:var(--text-secondary); font-size:0.8rem; text-transform:uppercase;">Files</div>`;
            fileResults.forEach(file => {
                resultsHTML += `
                    <div class="search-result-item" onclick="location.hash='#downloads'; document.getElementById('search-overlay').classList.remove('active')">
                        <span class="material-symbols-rounded" style="color:var(--accent-secondary)">${file.icon}</span>
                        <div>
                            <div style="font-weight:600">${file.title}</div>
                            <div style="font-size:0.8rem; color:var(--text-secondary)">${file.category}</div>
                        </div>
                    </div>
                `;
            });
        }

        if (videoResults.length > 0) {
            resultsHTML += `<div style="padding:10px 15px; font-weight:bold; color:var(--text-secondary); font-size:0.8rem; text-transform:uppercase;">Videos</div>`;
            videoResults.forEach(vid => {
                resultsHTML += `
                    <div class="search-result-item" onclick="location.hash='#downloads'; document.getElementById('search-overlay').classList.remove('active')">
                        <span class="material-symbols-rounded" style="color:red">play_circle</span>
                        <div>
                            <div style="font-weight:600">${vid.title}</div>
                        </div>
                    </div>
                `;
            });
        }
        
        if (updateResults.length > 0) {
            resultsHTML += `<div style="padding:10px 15px; font-weight:bold; color:var(--text-secondary); font-size:0.8rem; text-transform:uppercase;">Updates</div>`;
            updateResults.forEach(upd => {
                resultsHTML += `
                    <div class="search-result-item" onclick="location.hash='#updates'; document.getElementById('search-overlay').classList.remove('active')">
                        <span class="material-symbols-rounded" style="color:var(--text-primary)">article</span>
                        <div>
                            <div style="font-weight:600">${upd.title}</div>
                        </div>
                    </div>
                `;
            });
        }

        if (resultsHTML === '') {
            resultsHTML = `<div style="padding: 20px; text-align: center; color: var(--text-secondary);">No results found for "${query}"</div>`;
        }

        resultsContainer.innerHTML = resultsHTML;
        resultsContainer.classList.add('active');
    }
};
