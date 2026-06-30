// apps.js
// Handlers for App-related pages

const AppsManager = {
    renderHome: async (container) => {
        const stats = await StorageManager.getStats();
        const apps = (await StorageManager.get('apps')).slice(0, 3);
        
        let appsHTML = apps.map(app => UI.renderAppCard(app)).join('');
        
        container.innerHTML = `
            <div class="page-view">
                <!-- Hero Section -->
                <section class="section" style="position:relative; overflow:hidden; min-height:80vh; display:flex; align-items:center; text-align:center;">
                    <div class="particle" style="width:100px; height:100px; top:20%; left:10%;"></div>
                    <div class="particle" style="width:150px; height:150px; top:60%; right:15%; animation-delay:-5s;"></div>
                    <div class="container" style="position:relative; z-index:1;">
                        <h1 class="hero-title" style="font-size: 4.5rem; margin-bottom: 20px; font-weight:800; line-height:1.1;">
                            <span class="text-gradient">HI-TECH CHRONICLES</span>
                        </h1>
                        <p style="font-size: 1.2rem; color: var(--text-secondary); max-width: 600px; margin: 0 auto 40px;">
                            The ultimate premium hub for downloading the best apps, UI kits, templates, and tech resources. Pure performance, pure design.
                        </p>
                        <div style="display:flex; justify-content:center; gap:20px; flex-wrap:wrap;">
                            <a href="#apps" class="btn btn-primary" style="font-size:1.1rem; padding: 15px 35px;">
                                <span class="material-symbols-rounded">explore</span> Explore Apps
                            </a>
                            <a href="#downloads" class="btn btn-secondary" style="font-size:1.1rem; padding: 15px 35px;">
                                <span class="material-symbols-rounded">folder_zip</span> View Downloads
                            </a>
                        </div>
                    </div>
                </section>

                <!-- Stats Section -->
                <section class="section glass-effect" style="border-left:none; border-right:none; border-radius:0;">
                    <div class="container grid-3" style="text-align:center;">
                        <div>
                            <div class="text-gradient" style="font-size:3rem; font-weight:700; font-family:'Space Grotesk', sans-serif;" id="stat-1" data-suffix="+">0</div>
                            <div style="color:var(--text-secondary); font-size:1.1rem; margin-top:5px;">Apps Downloaded</div>
                        </div>
                        <div>
                            <div class="text-gradient" style="font-size:3rem; font-weight:700; font-family:'Space Grotesk', sans-serif;" id="stat-2" data-suffix="+">0</div>
                            <div style="color:var(--text-secondary); font-size:1.1rem; margin-top:5px;">Active Visitors</div>
                        </div>
                        <div>
                            <div class="text-gradient" style="font-size:3rem; font-weight:700; font-family:'Space Grotesk', sans-serif;" id="stat-3" data-suffix="+">0</div>
                            <div style="color:var(--text-secondary); font-size:1.1rem; margin-top:5px;">Premium Resources</div>
                        </div>
                    </div>
                </section>

                <!-- Featured Apps -->
                <section class="section container">
                    <h2 class="section-title">Featured Apps</h2>
                    <p class="section-subtitle">Handpicked top-tier applications for your devices.</p>
                    <div class="grid-3">
                        ${appsHTML}
                    </div>
                    <div style="text-align:center; margin-top:40px;">
                        <a href="#apps" class="btn btn-secondary">View All Apps <span class="material-symbols-rounded">arrow_forward</span></a>
                    </div>
                </section>
            </div>
        `;

        setTimeout(() => {
            const el1 = document.getElementById('stat-1');
            const el2 = document.getElementById('stat-2');
            const el3 = document.getElementById('stat-3');
            if(el1 && stats) Utils.animateCounter(el1, stats.appsDownloaded || 0);
            if(el2 && stats) Utils.animateCounter(el2, stats.totalVisitors || 0);
            if(el3 && stats) Utils.animateCounter(el3, stats.activeResources || 0);
        }, 300);
    },

    renderApps: async (container) => {
        const apps = await StorageManager.get('apps');
        let appsHTML = apps.map(app => UI.renderAppCard(app)).join('');
        
        container.innerHTML = `
            <div class="page-view section container">
                <h1 class="section-title text-gradient" style="text-align:left;">All Apps</h1>
                <p style="color:var(--text-secondary); margin-bottom:40px; font-size:1.1rem;">Discover and download premium applications.</p>
                
                <div class="grid-3">
                    ${appsHTML}
                </div>
            </div>
        `;
    },

    renderAppDetail: async (container, id) => {
        const app = await StorageManager.getAppById(id);
        if (!app) {
            container.innerHTML = '<div class="section container page-view" style="text-align:center"><h2>App not found.</h2><a href="#apps" class="btn btn-primary" style="margin-top:20px;">Back to Apps</a></div>';
            return;
        }

        const isBookmarked = await StorageManager.isBookmarked(app.id);
        const bookmarkIcon = isBookmarked ? 'bookmark_added' : 'bookmark_add';

        container.innerHTML = `
            <div class="page-view section container" style="max-width:900px;">
                <button class="btn btn-secondary" style="margin-bottom:30px;" onclick="history.back()"><span class="material-symbols-rounded">arrow_back</span> Back</button>
                
                <div class="card glass-effect" style="flex-direction:row; padding:30px; align-items:center; gap:30px; flex-wrap:wrap;">
                    <div class="card-icon" style="width:120px; height:120px; font-size:4rem; flex-shrink:0;">
                        ${app.customIconUrl ? `<img src="${app.customIconUrl}" alt="${app.title}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">` : `<span class="material-symbols-rounded">${app.icon}</span>`}
                    </div>
                    <div style="flex:1; min-width:250px;">
                        <h1 style="font-size:2.5rem; margin-bottom:5px; line-height:1.2;">${app.title}</h1>
                        <p style="color:var(--text-secondary); font-size:1.1rem; margin-bottom:15px;">${app.developer}</p>
                        <div style="display:flex; gap:15px; flex-wrap:wrap; margin-bottom:20px;">
                            <span class="badge" style="font-size:0.9rem; padding:8px 12px;">${app.category}</span>
                            <span class="badge" style="font-size:0.9rem; padding:8px 12px; background:var(--bg-secondary); border:none;"><span class="material-symbols-rounded" style="font-size:16px;vertical-align:-3px;color:gold">star</span> ${app.rating}</span>
                            <span class="badge" style="font-size:0.9rem; padding:8px 12px; background:var(--bg-secondary); border:none;"><span class="material-symbols-rounded" style="font-size:16px;vertical-align:-3px;">download</span> ${app.downloads.toLocaleString()}</span>
                        </div>
                        <div style="display:flex; gap:15px; flex-wrap:wrap;">
                            ${app.downloadUrl ? `<button class="btn btn-primary" style="padding:12px 30px; font-size:1.1rem;" onclick="window.open('${app.downloadUrl}', '_blank')"><span class="material-symbols-rounded">download</span> Download APK (${Utils.formatBytes(app.size)})</button>` : `<button class="btn btn-primary" style="padding:12px 30px; font-size:1.1rem;" onclick="window.downloadItem('app', '${app.title}')"><span class="material-symbols-rounded">download</span> Download APK (${Utils.formatBytes(app.size)})</button>`}
                            <button class="icon-btn" style="background:var(--bg-primary); width:50px; height:50px;" onclick="AppsManager.handleToggleBookmark('${app.id}')" aria-label="Bookmark">
                                <span class="material-symbols-rounded" id="bookmark-icon-${app.id}" style="color:var(--accent-primary)">${bookmarkIcon}</span>
                            </button>
                            <button class="icon-btn" style="background:var(--bg-primary); width:50px; height:50px;" onclick="UI.shareLink('#app/${app.id}')">
                                <span class="material-symbols-rounded">share</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div style="margin-top: 40px; display:grid; grid-template-columns: 2fr 1fr; gap:30px;" class="app-detail-grid">
                    <style>
                        @media(max-width:768px){ .app-detail-grid{ grid-template-columns: 1fr !important; } }
                    </style>
                    <div>
                        <h3 style="margin-bottom:15px; font-size:1.5rem;">About this app</h3>
                        <p style="color:var(--text-secondary); line-height:1.8; margin-bottom:30px; font-size:1.05rem;">${app.description}</p>
                        
                        <h3 style="margin-bottom:15px; font-size:1.5rem;">Key Features</h3>
                        <ul style="color:var(--text-secondary); line-height:1.8; margin-bottom:30px; list-style:disc; padding-left:20px; font-size:1.05rem;">
                            ${app.features.map(f => `<li style="margin-bottom:8px;">${f}</li>`).join('')}
                        </ul>
                        
                        <h3 style="margin-bottom:15px; font-size:1.5rem;">What's New in v${app.version}</h3>
                        <div class="card" style="background:var(--bg-primary); border:none; padding:15px;">
                            <p style="color:var(--text-secondary);">${app.whatsNew}</p>
                        </div>
                    </div>
                    
                    <div>
                        <div class="card glass-effect" style="padding:20px;">
                            <h3 style="margin-bottom:15px; border-bottom:1px solid var(--glass-border); padding-bottom:10px;">Information</h3>
                            <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
                                <span style="color:var(--text-secondary)">Version</span>
                                <span style="font-weight:600">${app.version}</span>
                            </div>
                            <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
                                <span style="color:var(--text-secondary)">Updated</span>
                                <span style="font-weight:600">${Utils.formatDate(app.releaseDate)}</span>
                            </div>
                            <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
                                <span style="color:var(--text-secondary)">Requires</span>
                                <span style="font-weight:600">${app.requirements}</span>
                            </div>
                            <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
                                <span style="color:var(--text-secondary)">Size</span>
                                <span style="font-weight:600">${Utils.formatBytes(app.size)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    handleToggleBookmark: async (appId) => {
        const isBookmarked = await StorageManager.toggleBookmark(appId);
        const iconEl = document.getElementById(`bookmark-icon-${appId}`);
        if(iconEl) {
            iconEl.innerText = isBookmarked ? 'bookmark_added' : 'bookmark_add';
        }
    }
};
