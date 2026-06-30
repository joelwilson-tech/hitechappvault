const appContent = document.getElementById('app-content');

// Helper to generate skeletons
function getSkeletonHTML(type) {
    if (type === 'grid') {
        return `
            <div class="grid">
                ${Array(6).fill().map(() => `
                    <div class="card">
                        <div class="skeleton skeleton-img"></div>
                        <div class="skeleton skeleton-text"></div>
                        <div class="skeleton skeleton-text short"></div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    if (type === 'bento') {
        return `
            <div class="bento-grid">
                <div class="card bento-large">
                    <div class="skeleton skeleton-img" style="height: 250px;"></div>
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-text short"></div>
                </div>
                ${Array(4).fill().map(() => `
                    <div class="card">
                        <div class="skeleton skeleton-img"></div>
                        <div class="skeleton skeleton-text"></div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    if (type === 'detail') {
        return `
            <div style="display:flex; gap:2rem; margin-bottom:2rem;">
                <div class="skeleton skeleton-img" style="width:120px; height:120px; border-radius:24px;"></div>
                <div style="flex:1;">
                    <div class="skeleton skeleton-text" style="height:2em; width:50%;"></div>
                    <div class="skeleton skeleton-text short"></div>
                    <div class="skeleton skeleton-text short" style="margin-top:1rem;"></div>
                </div>
            </div>
            <div class="skeleton skeleton-img" style="height: 200px;"></div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text short"></div>
        `;
    }
    return `<div class="skeleton skeleton-text"></div><div class="skeleton skeleton-text short"></div>`;
}

function getEmptyStateHTML(message) {
    return `
        <div class="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"></circle><path d="M16 16s-1.5-2-4-2-4 2-4 2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
            <h2>Nothing here yet</h2>
            <p>${message}</p>
        </div>
    `;
}

// Render Functions
async function renderHome() {
    appContent.innerHTML = `
        <div class="hero-section">
            <div class="hero-glow"></div>
            <h1 class="gradient-text" id="hero-title" style="font-size: 3.5rem;">HI-TECH CHRONICLES</h1>
            <p id="hero-subtitle" style="font-size: 1.25rem;">Loading...</p>
        </div>
        <h2>Featured Apps</h2>
        <div id="home-apps-container">${getSkeletonHTML('grid')}</div>
        <h2 style="margin-top: 4rem;">Latest from the Blog</h2>
        <div id="home-blog-container">${getSkeletonHTML('grid')}</div>
    `;

    const [settingsList, apps, blogs] = await Promise.all([
        window.storage.getAll('settings'),
        window.storage.getAll('apps'),
        window.storage.getAll('blogPosts')
    ]);

    if (settingsList && settingsList.length > 0) {
        const settings = settingsList[0];
        if (settings.heroTitle) document.getElementById('hero-title').textContent = settings.heroTitle;
        if (settings.heroSubtitle) document.getElementById('hero-subtitle').textContent = settings.heroSubtitle;
    } else {
        document.getElementById('hero-subtitle').textContent = 'Your ultimate source for apps and tech news';
    }

    const appsContainer = document.getElementById('home-apps-container');
    if (!appsContainer) return;

    if (apps && apps.length > 0) {
        const featured = apps.filter(a => a.featured).slice(0, 6);
        const displayApps = featured.length > 0 ? featured : apps.slice(0, 6);
        appsContainer.innerHTML = `
            <div class="grid">
                ${displayApps.map(app => `
                    <a href="#app/${app.id}" class="card">
                        <img src="${app.iconUrl || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="%23333"/></svg>'}" alt="${app.title}" style="width:64px; height:64px; border-radius:12px; margin-bottom:1rem; object-fit:cover;">
                        <h3>${app.title}</h3>
                        <p style="font-size: 0.9rem; margin-bottom: 0.5rem; color: var(--accent);">${app.category || 'App'}</p>
                        <p style="font-size: 0.85rem; color: var(--text-secondary);">${app.shortDescription || ''}</p>
                    </a>
                `).join('')}
            </div>
        `;
    } else {
        appsContainer.innerHTML = getEmptyStateHTML('No apps available yet. Check back soon!');
    }

    const blogContainer = document.getElementById('home-blog-container');
    if (!blogContainer) return;

    if (blogs && blogs.length > 0) {
        const recent = blogs.slice(0, 3);
        blogContainer.innerHTML = `
            <div class="grid">
                ${recent.map(post => `
                    <a href="#blog/${post.slug || post.id}" class="card" style="padding:0; padding-bottom:1.5rem;">
                        ${post.coverImageUrl ? `<img src="${post.coverImageUrl}" alt="${post.title}" style="width:100%; height:180px; object-fit:cover; border-bottom: 1px solid var(--border-subtle); margin-bottom:1rem;">` : '<div style="height:180px; background:var(--bg-surface-raised); border-bottom: 1px solid var(--border-subtle); margin-bottom:1rem;"></div>'}
                        <div style="padding: 0 1.5rem;">
                            <h3 style="margin-bottom: 0.5rem;">${post.title}</h3>
                            <p style="font-size: 0.85rem; color: var(--text-secondary);">${post.excerpt || ''}</p>
                        </div>
                    </a>
                `).join('')}
            </div>
        `;
    } else {
        blogContainer.innerHTML = getEmptyStateHTML('No blog posts available yet. Check back soon!');
    }
}

async function renderApps() {
    appContent.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; margin-bottom: 2rem;">
            <h1 class="gradient-text" style="margin:0;">Apps & Games</h1>
            <input type="text" id="app-search" placeholder="Search apps..." style="padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid var(--border-subtle); background: var(--bg-surface-raised); color: var(--text-primary); font-family: inherit; outline: none; width: 100%; max-width: 300px;">
        </div>
        <div id="apps-container">${getSkeletonHTML('bento')}</div>
    `;
    
    const apps = await window.storage.getAll('apps');
    const container = document.getElementById('apps-container');
    if (!container) return;
    const searchInput = document.getElementById('app-search');
    
    if (!apps || apps.length === 0) {
        container.innerHTML = getEmptyStateHTML('No apps found. We are building the catalog!');
        return;
    }

    function renderBento(appData) {
        if (appData.length === 0) {
            container.innerHTML = getEmptyStateHTML('No apps match your search.');
            return;
        }

        let featuredApp = appData.find(a => a.featured) || appData[0];
        let otherApps = appData.filter(a => a.id !== featuredApp.id);

        container.innerHTML = `
            <div class="bento-grid">
                <a href="#app/${featuredApp.id}" class="card bento-large" style="position: relative; justify-content: flex-end; padding: 2rem; background-image: linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.2)), url('${featuredApp.screenshotUrls?.[0] || featuredApp.iconUrl || ''}'); background-size: cover; background-position: center; min-height: 300px;">
                    <div style="position: relative; z-index: 1;">
                        <span style="background: var(--accent); color: white; padding: 0.25rem 0.75rem; border-radius: 99px; font-size: 0.75rem; font-weight: bold; display: inline-block; margin-bottom: 0.5rem;">FEATURED</span>
                        <h2 style="font-size: 2rem; color: #fff; margin-bottom: 0.5rem;">${featuredApp.title}</h2>
                        <p style="color: rgba(255,255,255,0.8);">${featuredApp.shortDescription || featuredApp.category}</p>
                    </div>
                </a>
                ${otherApps.map((app, index) => {
                    // Make the 4th item span 2 columns if on desktop for more asymmetric look
                    const extraClass = (index === 2) ? 'bento-large' : '';
                    return `
                    <a href="#app/${app.id}" class="card ${extraClass}" style="${extraClass ? `background-image: linear-gradient(to right, rgba(0,0,0,0.9), rgba(0,0,0,0.4)), url('${app.screenshotUrls?.[0] || ''}'); background-size: cover; background-position: center; justify-content:center;` : ''}">
                        ${extraClass ? `
                            <div style="position: relative; z-index: 1;">
                                <h3 style="color:#fff; font-size:1.5rem;">${app.title}</h3>
                                <p style="color: rgba(255,255,255,0.8);">${app.category || 'App'}</p>
                            </div>
                        ` : `
                            <img src="${app.iconUrl || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect width="48" height="48" fill="%23333"/></svg>'}" alt="${app.title}" style="width:48px; height:48px; border-radius:10px; margin-bottom:1rem; object-fit:cover;">
                            <h3 style="font-size:1.1rem; margin-bottom:0.25rem;">${app.title}</h3>
                            <p style="font-size: 0.8rem; color: var(--text-secondary);">${app.category || 'App'} • ★ ${app.rating || 'New'}</p>
                        `}
                    </a>
                `}).join('')}
            </div>
        `;
    }

    renderBento(apps);

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = apps.filter(a => a.title.toLowerCase().includes(term) || (a.category && a.category.toLowerCase().includes(term)));
        renderBento(filtered);
    });
}

async function renderAppDetail(id) {
    appContent.innerHTML = getSkeletonHTML('detail');
    
    const app = await window.storage.getById('apps', id);
    if (!app) {
        appContent.innerHTML = `
            <div class="empty-state">
                <h2>App not found</h2>
                <p>The app you are looking for does not exist.</p>
                <a href="#apps" class="btn" style="margin-top: 1rem;">Back to Apps</a>
            </div>
        `;
        return;
    }

    appContent.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <a href="#apps" style="color: var(--text-secondary); font-size: 0.9rem;">&larr; Back to Apps</a>
        </div>
        <div style="display: flex; gap: 2rem; align-items: flex-start; flex-wrap: wrap; margin-bottom: 2rem;">
            <img src="${app.iconUrl || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" fill="%23333"/></svg>'}" alt="Icon" style="width: 120px; height: 120px; border-radius: 24px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3); object-fit:cover;">
            <div style="flex: 1; min-width: 250px;">
                <h1 style="margin:0; font-size: 2.5rem;">${app.title}</h1>
                <p style="color: var(--accent); font-weight: 500; font-size:1.1rem;">${app.developer || 'Unknown Developer'}</p>
                <div style="display: flex; gap: 1.5rem; margin-top: 1rem; color: var(--text-secondary); font-size: 0.95rem;">
                    <div><strong style="color:var(--text-primary); font-size:1.1rem;">${app.rating || '-'}</strong> ★</div>
                    <div><strong style="color:var(--text-primary); font-size:1.1rem;">${app.downloadCount || 0}</strong>+ DLs</div>
                    <div><strong style="color:var(--text-primary); font-size:1.1rem;">${app.category || '-'}</strong></div>
                </div>
                <div style="margin-top: 2rem;">
                    <a href="${app.downloadUrl || '#'}" target="_blank" class="btn" id="download-btn" style="font-size:1.1rem; padding: 1rem 2rem;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        Download APK
                    </a>
                </div>
            </div>
        </div>
        
        ${app.screenshotUrls && app.screenshotUrls.length > 0 ? `
            <div class="gallery">
                ${app.screenshotUrls.map(url => `<img src="${url}" alt="Screenshot">`).join('')}
            </div>
        ` : ''}
        
        <div class="card" style="margin-top: 2rem;">
            <h3 style="font-size: 1.25rem;">About this app</h3>
            <p style="margin-top: 1rem; white-space: pre-wrap; color: var(--text-secondary); line-height: 1.8;">${app.fullDescription || app.shortDescription || 'No description available.'}</p>
        </div>
        
        ${app.whatsNew ? `
        <div class="card" style="margin-top: 1.5rem;">
            <h3 style="font-size: 1.25rem;">What's New in v${app.version || ''}</h3>
            <p style="margin-top: 1rem; white-space: pre-wrap; color: var(--text-secondary); line-height: 1.8;">${app.whatsNew}</p>
        </div>` : ''}
        
        <div style="margin-top: 1.5rem; display: flex; flex-wrap: wrap; gap: 1rem;">
            <div class="card" style="flex:1; min-width:150px; padding:1rem; text-align:center;">
                <p style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:0.25rem;">Version</p>
                <p style="font-weight:600;">${app.version || 'Unknown'}</p>
            </div>
            <div class="card" style="flex:1; min-width:150px; padding:1rem; text-align:center;">
                <p style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:0.25rem;">Size</p>
                <p style="font-weight:600;">${window.utils?.formatBytes(app.sizeInBytes) || 'Unknown'}</p>
            </div>
            <div class="card" style="flex:1; min-width:150px; padding:1rem; text-align:center;">
                <p style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:0.25rem;">Requires</p>
                <p style="font-weight:600;">${app.requirements || 'Android'}</p>
            </div>
        </div>
    `;

    document.getElementById('download-btn')?.addEventListener('click', () => {
        window.storage.incrementAppDownload(id);
    });
}

async function renderBlog() {
    appContent.innerHTML = `<h1 class="gradient-text">Blog</h1><div id="blog-container">${getSkeletonHTML('grid')}</div>`;
    
    const blogs = await window.storage.getAll('blogPosts');
    const container = document.getElementById('blog-container');
    if (!container) return;
    
    if (!blogs || blogs.length === 0) {
        container.innerHTML = getEmptyStateHTML('No blog posts found.');
        return;
    }

    container.innerHTML = `
        <div class="grid">
            ${blogs.map(post => `
                <a href="#blog/${post.slug || post.id}" class="card" style="padding:0; padding-bottom:1.5rem;">
                    ${post.coverImageUrl ? `<img src="${post.coverImageUrl}" style="width:100%; height:180px; object-fit:cover; border-bottom: 1px solid var(--border-subtle); margin-bottom:1rem;">` : '<div style="height:180px; background:var(--bg-surface-raised); border-bottom: 1px solid var(--border-subtle); margin-bottom:1rem;"></div>'}
                    <div style="padding: 0 1.5rem;">
                        <h3 style="font-size:1.2rem; margin-bottom: 0.5rem;">${post.title}</h3>
                        <p style="font-size: 0.8rem; color: var(--accent); margin-bottom: 0.5rem;">${window.utils?.formatDate(post.publishedAt) || 'Recent'} • ${post.author || 'Admin'}</p>
                        <p style="font-size: 0.95rem; color: var(--text-secondary);">${post.excerpt || ''}</p>
                    </div>
                </a>
            `).join('')}
        </div>
    `;
}

async function renderBlogPost(slug) {
    appContent.innerHTML = getSkeletonHTML('detail');
    
    const blogs = await window.storage.getAll('blogPosts');
    const post = blogs.find(b => b.slug === slug || b.id === slug);
    
    if (!post) {
        appContent.innerHTML = `
            <div class="empty-state">
                <h2>Post not found</h2>
                <a href="#blog" class="btn" style="margin-top: 1rem;">Back to Blog</a>
            </div>
        `;
        return;
    }

    appContent.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <a href="#blog" style="color: var(--text-secondary); font-size: 0.9rem;">&larr; Back to Blog</a>
        </div>
        <article style="max-width: 800px; margin: 0 auto;">
            ${post.coverImageUrl ? `<img src="${post.coverImageUrl}" style="width:100%; max-height:400px; object-fit:cover; border-radius:16px; margin-bottom:2rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">` : ''}
            <h1 class="gradient-text" style="font-size:3rem;">${post.title}</h1>
            <p style="color: var(--accent); margin-bottom: 3rem; font-weight:500;">By ${post.author || 'Admin'} • ${window.utils?.formatDate(post.publishedAt) || ''}</p>
            <div class="blog-content" style="line-height: 1.8; font-size: 1.15rem; color: var(--text-secondary);">
                ${post.contentHtml || ''}
            </div>
        </article>
    `;
}

async function renderYouTube() {
    appContent.innerHTML = `<h1 class="gradient-text">YouTube</h1><div id="yt-container">${getSkeletonHTML('grid')}</div>`;
    
    const videos = await window.storage.getAll('videos');
    const container = document.getElementById('yt-container');
    if (!container) return;
    
    if (!videos || videos.length === 0) {
        container.innerHTML = getEmptyStateHTML('No videos found.');
        return;
    }

    container.innerHTML = `
        <div class="grid">
            ${videos.map(video => {
                let videoId = '';
                try {
                    const url = new URL(video.youtubeUrl);
                    videoId = url.searchParams.get('v') || url.pathname.split('/').pop();
                } catch(e){}
                return `
                <div class="card" style="cursor:pointer; padding:0; padding-bottom:1.5rem;" onclick="openVideoModal('${videoId}')">
                    <div style="position:relative;">
                        <img src="${video.thumbnailUrl || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}" style="width:100%; aspect-ratio:16/9; object-fit:cover; border-bottom: 1px solid var(--border-subtle); margin-bottom:1rem;">
                        <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); background:rgba(0,0,0,0.7); border-radius:50%; width:64px; height:64px; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 10px rgba(0,0,0,0.5);">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="var(--accent)"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                        </div>
                    </div>
                    <div style="padding: 0 1.5rem;">
                        <h3 style="font-size:1.1rem; margin-bottom:0.5rem; line-height:1.4;">${video.title}</h3>
                        <p style="font-size: 0.85rem; color: var(--text-secondary);">${window.utils?.formatDate(video.publishedAt) || ''}</p>
                    </div>
                </div>
            `}).join('')}
        </div>
        
        <div id="video-modal" class="modal-backdrop" onclick="closeVideoModal(event)">
            <div class="modal-content">
                <button class="modal-close" onclick="closeVideoModal(event, true)">&times;</button>
                <div id="video-iframe-container" style="width:100%; height:100%;"></div>
            </div>
        </div>
    `;
}

window.openVideoModal = function(videoId) {
    const modal = document.getElementById('video-modal');
    const container = document.getElementById('video-iframe-container');
    container.innerHTML = `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}?autoplay=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    modal.classList.add('show');
}

window.closeVideoModal = function(event, force=false) {
    if (force || event.target.id === 'video-modal') {
        const modal = document.getElementById('video-modal');
        const container = document.getElementById('video-iframe-container');
        modal.classList.remove('show');
        container.innerHTML = ''; // Stop video
    }
}

async function renderDownloads() {
    appContent.innerHTML = `<h1 class="gradient-text">Downloads</h1><div id="dl-container">${getSkeletonHTML('grid')}</div>`;
    
    const files = await window.storage.getAll('files');
    const container = document.getElementById('dl-container');
    if (!container) return;
    
    if (!files || files.length === 0) {
        container.innerHTML = getEmptyStateHTML('No files available for download.');
        return;
    }

    container.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:1rem;">
            ${files.map(file => `
                <div class="card" style="flex-direction:row; align-items:center; padding:1.5rem; justify-content:space-between; gap:1.5rem; flex-wrap:wrap;">
                    <div style="display:flex; align-items:center; gap:1.5rem;">
                        <div style="background:var(--bg-surface); padding:1rem; border-radius:16px; color:var(--accent); box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                        </div>
                        <div>
                            <h3 style="margin:0; font-size:1.2rem;">${file.title}</h3>
                            <p style="font-size:0.9rem; color:var(--text-secondary); margin:0.5rem 0 0;">${file.fileType || 'File'} • ${window.utils?.formatBytes(file.sizeInBytes) || 'Unknown size'}</p>
                        </div>
                    </div>
                    <a href="${file.downloadUrl || '#'}" target="_blank" class="btn" style="padding: 0.75rem 1.5rem;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        Download
                    </a>
                </div>
            `).join('')}
        </div>
    `;
}

async function renderContact() {
    appContent.innerHTML = `<h1 class="gradient-text">Contact</h1><div id="contact-container">${getSkeletonHTML('detail')}</div>`;
    
    const settingsList = await window.storage.getAll('settings');
    const container = document.getElementById('contact-container');
    if (!container) return;
    
    let email = 'hello@hitechchronicles.com';
    if (settingsList && settingsList.length > 0 && settingsList[0].contactEmail) {
        email = settingsList[0].contactEmail;
    }

    container.innerHTML = `
        <div class="card" style="max-width: 600px; margin: 2rem auto; text-align: center; padding: 4rem 2rem; position:relative; overflow:hidden;">
            <div class="hero-glow" style="width:100%; height:100%; opacity:0.5;"></div>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.5" style="margin-bottom:1.5rem; position:relative; z-index:1;"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            <h2 style="font-size:2rem; margin-bottom:1rem; position:relative; z-index:1;">Get in touch</h2>
            <p style="color: var(--text-secondary); margin: 0 0 2.5rem; font-size:1.1rem; position:relative; z-index:1;">Have a question, partnership proposal, or just want to say hi?</p>
            <a href="mailto:${email}" class="btn" style="font-size: 1.1rem; padding: 1rem 2.5rem; position:relative; z-index:1;">Email Us</a>
            
            <div style="display:flex; justify-content:center; gap:2rem; margin-top:4rem; position:relative; z-index:1;">
                <a href="#" style="color:var(--text-secondary); transition:color 0.2s;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg></a>
                <a href="#" style="color:var(--text-secondary); transition:color 0.2s;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg></a>
                <a href="#" style="color:var(--text-secondary); transition:color 0.2s;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg></a>
            </div>
        </div>
    `;
}

function renderRoute() {
    const hash = window.location.hash || '#home';
    const parts = hash.split('/');
    const baseRoute = parts[0];
    const param = parts.slice(1).join('/'); // In case of slashes in slug/id
    
    // Update active nav links
    document.querySelectorAll('nav a').forEach(link => {
        if (link.getAttribute('href') === baseRoute || (baseRoute === '#app' && link.getAttribute('href') === '#apps')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    switch(baseRoute) {
        case '#home': renderHome(); break;
        case '#apps': renderApps(); break;
        case '#app': renderAppDetail(param); break;
        case '#blog': 
            if(param) renderBlogPost(param);
            else renderBlog();
            break;
        case '#youtube': renderYouTube(); break;
        case '#downloads': renderDownloads(); break;
        case '#contact': renderContact(); break;
        case '#admin': 
            if (window.renderAdmin) window.renderAdmin();
            else appContent.innerHTML = `<div class="empty-state"><p>Admin module not loaded.</p></div>`;
            break;
        case '#admin-dashboard':
            if (window.renderAdminDashboard) window.renderAdminDashboard();
            else appContent.innerHTML = `<div class="empty-state"><p>Admin module not loaded.</p></div>`;
            break;
        default: renderHome(); break;
    }
}

function startApp() {
    console.log("Starting SPA router...");
    window.addEventListener('hashchange', renderRoute);
    renderRoute(); // Render initial route
    
    // Register Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(registration => {
                    console.log('ServiceWorker registration successful');
                })
                .catch(err => {
                    console.log('ServiceWorker registration failed: ', err);
                });
        });
    }

    // Theme Toggle Logic
    const themeBtn = document.getElementById('theme-toggle');
    const moonIcon = themeBtn?.querySelector('.icon-moon');
    const sunIcon = themeBtn?.querySelector('.icon-sun');
    
    function updateThemeUI() {
        const isLight = document.documentElement.classList.contains('light-mode');
        if (moonIcon && sunIcon) {
            moonIcon.style.display = isLight ? 'none' : 'block';
            sunIcon.style.display = isLight ? 'block' : 'none';
        }
    }
    
    updateThemeUI(); // initial state
    
    themeBtn?.addEventListener('click', () => {
        document.documentElement.classList.toggle('light-mode');
        const isLight = document.documentElement.classList.contains('light-mode');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        updateThemeUI();
    });
}

if (window.FirebaseManager) {
    startApp();
} else {
    window.addEventListener('firebase-ready', startApp, { once: true });
    // Fallback if Firebase fails to load within 5 seconds
    setTimeout(() => { 
        if (!window.FirebaseManager) { 
            console.warn("Firebase not ready after 5s, starting app anyway.");
            startApp(); 
        } 
    }, 5000);
}
