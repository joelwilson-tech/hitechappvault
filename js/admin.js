// admin.js - Admin dashboard logic

let currentAdminTab = 'apps';
let quillEditor = null;

// Ensure auth state is monitored globally to boot users if session expires
let authListenerRegistered = false;
function ensureAuthListener() {
    if (authListenerRegistered || !window.FirebaseManager || !window.FirebaseManager.getAuth) return;
    const auth = window.FirebaseManager.getAuth();
    if (!auth) return;
    
    import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js").then(({ onAuthStateChanged }) => {
        onAuthStateChanged(auth, (user) => {
            const hash = window.location.hash;
            if (!user && hash === '#admin-dashboard') {
                window.location.hash = '#admin';
            } else if (user && hash === '#admin') {
                window.location.hash = '#admin-dashboard';
            }
        });
        authListenerRegistered = true;
    });
}

function showToast(message, isError = false) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.backgroundColor = isError ? '#ef4444' : 'var(--accent)';
    toast.style.color = '#fff';
    toast.style.padding = '1rem 2rem';
    toast.style.borderRadius = '8px';
    toast.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.3)';
    toast.style.zIndex = '10000';
    toast.style.transition = 'opacity 0.3s';
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// --------------------------------------------------------
// LOGIN PAGE
// --------------------------------------------------------
window.renderAdmin = async function() {
    ensureAuthListener();
    const appContent = document.getElementById('app-content');
    
    if (window.FirebaseManager && window.FirebaseManager.getAuth) {
        const auth = window.FirebaseManager.getAuth();
        if (auth && auth.currentUser) {
            window.location.hash = '#admin-dashboard';
            return;
        }
    }

    appContent.innerHTML = `
        <div style="max-width: 400px; margin: 4rem auto;">
            <div class="card" style="padding: 2.5rem;">
                <h1 class="gradient-text" style="font-size: 2rem; margin-bottom: 1.5rem; text-align: center;">Admin Login</h1>
                <form id="admin-login-form" style="display: flex; flex-direction: column; gap: 1rem;">
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary); font-size: 0.9rem;">Email</label>
                        <input type="email" id="login-email" required style="width: 100%; padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid var(--border-subtle); background: var(--bg-base); color: var(--text-primary); font-family: inherit; outline: none;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary); font-size: 0.9rem;">Password</label>
                        <div style="position: relative; display: flex; align-items: center;">
                            <input type="password" id="login-password" required style="width: 100%; padding: 0.75rem 2.5rem 0.75rem 1rem; border-radius: 8px; border: 1px solid var(--border-subtle); background: var(--bg-base); color: var(--text-primary); font-family: inherit; outline: none;">
                            <button type="button" id="toggle-password" style="position: absolute; right: 0.75rem; background: none; border: none; color: var(--text-secondary); cursor: pointer; padding: 0; display: flex; align-items: center; justify-content: center;">
                                <svg id="eye-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                                <svg id="eye-off-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: none;"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                            </button>
                        </div>
                    </div>
                    <div id="login-error" style="color: #ef4444; font-size: 0.85rem; display: none;">Invalid credentials</div>
                    <button type="submit" class="btn" style="margin-top: 1rem; width: 100%;">Log In</button>
                </form>
            </div>
        </div>
    `;

    document.getElementById('toggle-password').addEventListener('click', () => {
        const passInput = document.getElementById('login-password');
        const eyeIcon = document.getElementById('eye-icon');
        const eyeOffIcon = document.getElementById('eye-off-icon');
        if (passInput.type === 'password') {
            passInput.type = 'text';
            eyeIcon.style.display = 'none';
            eyeOffIcon.style.display = 'block';
        } else {
            passInput.type = 'password';
            eyeIcon.style.display = 'block';
            eyeOffIcon.style.display = 'none';
        }
    });

    document.getElementById('admin-login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const errDiv = document.getElementById('login-error');
        errDiv.style.display = 'none';

        try {
            const { signInWithEmailAndPassword } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js");
            const auth = window.FirebaseManager.getAuth();
            await signInWithEmailAndPassword(auth, email, password);
            // onAuthStateChanged will handle the redirect
        } catch (error) {
            errDiv.style.display = 'block';
        }
    });
};

// --------------------------------------------------------
// DASHBOARD LAYOUT
// --------------------------------------------------------
window.renderAdminDashboard = async function() {
    ensureAuthListener();
    const appContent = document.getElementById('app-content');
    
    // Auth check
    const auth = window.FirebaseManager && window.FirebaseManager.getAuth ? window.FirebaseManager.getAuth() : null;
    if (!auth || !auth.currentUser) {
        window.location.hash = '#admin';
        return;
    }

    appContent.innerHTML = `
        <div style="display: flex; gap: 2rem; min-height: 70vh;">
            <div style="width: 250px; flex-shrink: 0; display: flex; flex-direction: column; gap: 0.5rem; border-right: 1px solid var(--border-subtle); padding-right: 2rem;">
                <h2 style="font-size: 1.25rem; margin-bottom: 1.5rem; color: var(--text-primary);">Dashboard</h2>
                <button class="admin-tab ${currentAdminTab === 'apps' ? 'active' : ''}" data-tab="apps" style="text-align:left; padding: 0.75rem 1rem; border-radius: 8px; border:none; background:${currentAdminTab === 'apps' ? 'var(--bg-surface-raised)' : 'transparent'}; color:${currentAdminTab === 'apps' ? 'var(--accent)' : 'var(--text-secondary)'}; cursor:pointer; font-size:1rem; transition:all 0.2s;">Apps</button>
                <button class="admin-tab ${currentAdminTab === 'blog' ? 'active' : ''}" data-tab="blog" style="text-align:left; padding: 0.75rem 1rem; border-radius: 8px; border:none; background:${currentAdminTab === 'blog' ? 'var(--bg-surface-raised)' : 'transparent'}; color:${currentAdminTab === 'blog' ? 'var(--accent)' : 'var(--text-secondary)'}; cursor:pointer; font-size:1rem; transition:all 0.2s;">Blog Posts</button>
                <button class="admin-tab ${currentAdminTab === 'videos' ? 'active' : ''}" data-tab="videos" style="text-align:left; padding: 0.75rem 1rem; border-radius: 8px; border:none; background:${currentAdminTab === 'videos' ? 'var(--bg-surface-raised)' : 'transparent'}; color:${currentAdminTab === 'videos' ? 'var(--accent)' : 'var(--text-secondary)'}; cursor:pointer; font-size:1rem; transition:all 0.2s;">Videos</button>
                <button class="admin-tab ${currentAdminTab === 'files' ? 'active' : ''}" data-tab="files" style="text-align:left; padding: 0.75rem 1rem; border-radius: 8px; border:none; background:${currentAdminTab === 'files' ? 'var(--bg-surface-raised)' : 'transparent'}; color:${currentAdminTab === 'files' ? 'var(--accent)' : 'var(--text-secondary)'}; cursor:pointer; font-size:1rem; transition:all 0.2s;">Files</button>
                <button class="admin-tab ${currentAdminTab === 'settings' ? 'active' : ''}" data-tab="settings" style="text-align:left; padding: 0.75rem 1rem; border-radius: 8px; border:none; background:${currentAdminTab === 'settings' ? 'var(--bg-surface-raised)' : 'transparent'}; color:${currentAdminTab === 'settings' ? 'var(--accent)' : 'var(--text-secondary)'}; cursor:pointer; font-size:1rem; transition:all 0.2s;">Settings</button>
                <div style="flex:1;"></div>
                <button id="admin-logout" style="text-align:left; padding: 0.75rem 1rem; border-radius: 8px; border:none; background:transparent; color:#ef4444; cursor:pointer; font-size:1rem; transition:all 0.2s;">Log Out</button>
            </div>
            <div id="admin-workspace" style="flex: 1; min-width: 0;">
                <!-- Tab content will go here -->
                <div style="text-align:center; padding: 4rem;"><div class="skeleton-img"></div></div>
            </div>
        </div>
    `;

    document.getElementById('admin-logout').addEventListener('click', async () => {
        const { signOut } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js");
        await signOut(auth);
        window.location.hash = '#home';
    });

    document.querySelectorAll('.admin-tab').forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentAdminTab = e.target.dataset.tab;
            window.renderAdminDashboard(); // Re-render shell
        });
    });

    renderAdminTabContent();
};

async function renderAdminTabContent() {
    const workspace = document.getElementById('admin-workspace');
    if (!workspace) return;
    
    workspace.innerHTML = '<div style="text-align:center; padding: 2rem;"><p>Loading...</p></div>';

    if (currentAdminTab === 'apps') await renderAppsAdmin(workspace);
    else if (currentAdminTab === 'blog') await renderBlogAdmin(workspace);
    else if (currentAdminTab === 'videos') await renderVideosAdmin(workspace);
    else if (currentAdminTab === 'files') await renderFilesAdmin(workspace);
    else if (currentAdminTab === 'settings') await renderSettingsAdmin(workspace);
}

// --------------------------------------------------------
// APPS ADMIN
// --------------------------------------------------------
async function renderAppsAdmin(container) {
    const apps = await window.storage.getAll('apps');
    if (!document.getElementById('admin-workspace')) return; // Navigated away

    let html = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 2rem;">
            <h1 style="margin:0;">Manage Apps</h1>
            <button class="btn" id="add-app-btn">+ Add New App</button>
        </div>
        
        <div id="app-form-container" class="card" style="display:none; margin-bottom: 2rem; border-left: 4px solid var(--accent);">
            <h2 id="app-form-title" style="margin-bottom: 1.5rem; font-size: 1.25rem;">Add New App</h2>
            <form id="admin-app-form" style="display:flex; flex-direction:column; gap:1.25rem;">
                <input type="hidden" id="app-id">
                
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                    <div><label class="form-label">Title *</label><input type="text" id="app-title" required class="form-input"></div>
                    <div><label class="form-label">Developer</label><input type="text" id="app-developer" class="form-input"></div>
                    <div><label class="form-label">Category</label><input type="text" id="app-category" class="form-input"></div>
                    <div><label class="form-label">Version</label><input type="text" id="app-version" class="form-input"></div>
                    <div><label class="form-label">Rating (0-5)</label><input type="number" step="0.1" min="0" max="5" id="app-rating" class="form-input"></div>
                    <div><label class="form-label">Size in Bytes <span style="opacity:0.5; font-size:0.8em;">(e.g. 50000000 = 50MB)</span></label><input type="number" id="app-size" class="form-input"></div>
                    <div><label class="form-label">Release Date</label><input type="date" id="app-date" class="form-input"></div>
                    <div><label class="form-label">Requirements</label><input type="text" id="app-reqs" placeholder="e.g. Android 8.0+" class="form-input"></div>
                </div>
                
                <div>
                    <label class="form-label">Short Description *</label>
                    <textarea id="app-short-desc" required class="form-input" style="height: 80px;"></textarea>
                </div>
                <div>
                    <label class="form-label">Full Description</label>
                    <textarea id="app-full-desc" class="form-input" style="height: 150px;"></textarea>
                </div>
                <div>
                    <label class="form-label">What's New</label>
                    <textarea id="app-whats-new" class="form-input" style="height: 80px;"></textarea>
                </div>

                <div style="background:var(--bg-base); padding: 1.5rem; border-radius: 8px; border: 1px solid var(--border-subtle);">
                    <p style="font-size: 0.85rem; color: var(--accent); margin-bottom: 1rem;">Note: Upload your image/APK to GitHub first, then paste the raw/release URL here.</p>
                    
                    <div style="margin-bottom: 1rem;">
                        <label class="form-label">Icon URL *</label>
                        <input type="url" id="app-icon" required class="form-input">
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <label class="form-label">Download URL (APK/ZIP) *</label>
                        <input type="url" id="app-download" required class="form-input">
                    </div>
                    <div>
                        <label class="form-label">Screenshot URLs</label>
                        <div id="app-screenshots-container" style="display:flex; flex-direction:column; gap:0.5rem; margin-bottom:0.5rem;">
                            <!-- Dynamic inputs -->
                        </div>
                        <button type="button" id="add-screenshot-btn" style="background:none; border:none; color:var(--accent); cursor:pointer; font-size:0.9rem;">+ Add another screenshot</button>
                    </div>
                </div>

                <div style="display:flex; align-items:center; gap: 0.5rem;">
                    <input type="checkbox" id="app-featured" style="width: 18px; height: 18px;">
                    <label for="app-featured">Featured App (Shows large on Bento grid)</label>
                </div>

                <div style="display:flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem;">
                    <button type="button" id="cancel-app-btn" class="btn" style="background:transparent; color:var(--text-secondary); border: 1px solid var(--border-subtle);">Cancel</button>
                    <button type="submit" class="btn">Save App</button>
                </div>
            </form>
        </div>

        <div style="overflow-x: auto;">
            <table class="admin-table">
                <thead><tr><th>Icon</th><th>Title</th><th>Category</th><th>Developer</th><th>Actions</th></tr></thead>
                <tbody>
                    ${apps.length === 0 ? '<tr><td colspan="5" style="text-align:center; padding:2rem;">No apps found.</td></tr>' : ''}
                    ${apps.map(app => `
                        <tr>
                            <td><img src="${app.iconUrl}" style="width:32px; height:32px; border-radius:6px; object-fit:cover;"></td>
                            <td style="font-weight:500;">${app.title} ${app.featured ? '<span style="color:var(--accent); font-size:0.75rem; margin-left:0.5rem;">★</span>' : ''}</td>
                            <td>${app.category || '-'}</td>
                            <td>${app.developer || '-'}</td>
                            <td>
                                <button class="action-btn edit-app" data-id="${app.id}" style="color:var(--accent);">Edit</button>
                                <button class="action-btn delete-app" data-id="${app.id}" style="color:#ef4444; margin-left:1rem;">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML = html;

    // Logic
    const formContainer = document.getElementById('app-form-container');
    const form = document.getElementById('admin-app-form');
    const screenshotsContainer = document.getElementById('app-screenshots-container');

    function renderScreenshotInputs(urls = ['']) {
        if(urls.length === 0) urls = [''];
        screenshotsContainer.innerHTML = urls.map(url => `
            <div style="display:flex; gap:0.5rem;">
                <input type="url" class="form-input screenshot-input" value="${url}" placeholder="https://..." style="flex:1;">
                <button type="button" class="remove-screenshot" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:1.5rem; line-height:1;">&times;</button>
            </div>
        `).join('');
        
        document.querySelectorAll('.remove-screenshot').forEach(btn => {
            btn.addEventListener('click', (e) => e.target.parentElement.remove());
        });
    }

    document.getElementById('add-screenshot-btn').addEventListener('click', () => {
        const div = document.createElement('div');
        div.style.cssText = 'display:flex; gap:0.5rem;';
        div.innerHTML = `<input type="url" class="form-input screenshot-input" placeholder="https://..." style="flex:1;"><button type="button" class="remove-screenshot" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:1.5rem; line-height:1;">&times;</button>`;
        screenshotsContainer.appendChild(div);
        div.querySelector('.remove-screenshot').addEventListener('click', () => div.remove());
    });

    document.getElementById('add-app-btn').addEventListener('click', () => {
        form.reset();
        document.getElementById('app-id').value = '';
        document.getElementById('app-form-title').textContent = 'Add New App';
        renderScreenshotInputs(['']);
        formContainer.style.display = 'block';
        window.scrollTo(0, 0);
    });

    document.getElementById('cancel-app-btn').addEventListener('click', () => {
        formContainer.style.display = 'none';
    });

    document.querySelectorAll('.edit-app').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            const app = apps.find(a => a.id === id);
            if(!app) return;
            
            document.getElementById('app-id').value = app.id;
            document.getElementById('app-title').value = app.title || '';
            document.getElementById('app-developer').value = app.developer || '';
            document.getElementById('app-category').value = app.category || '';
            document.getElementById('app-version').value = app.version || '';
            document.getElementById('app-rating').value = app.rating || '';
            document.getElementById('app-size').value = app.sizeInBytes || '';
            document.getElementById('app-date').value = app.releaseDate || '';
            document.getElementById('app-reqs').value = app.requirements || '';
            document.getElementById('app-short-desc').value = app.shortDescription || '';
            document.getElementById('app-full-desc').value = app.fullDescription || '';
            document.getElementById('app-whats-new').value = app.whatsNew || '';
            document.getElementById('app-icon').value = app.iconUrl || '';
            document.getElementById('app-download').value = app.downloadUrl || '';
            document.getElementById('app-featured').checked = !!app.featured;
            
            renderScreenshotInputs(app.screenshotUrls && app.screenshotUrls.length ? app.screenshotUrls : ['']);
            
            document.getElementById('app-form-title').textContent = 'Edit App';
            formContainer.style.display = 'block';
            window.scrollTo(0, 0);
        });
    });

    document.querySelectorAll('.delete-app').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            if(confirm("Are you sure you want to delete this app? This cannot be undone.")) {
                const id = e.target.dataset.id;
                const success = await window.storage.remove('apps', id);
                if(success) {
                    showToast('App deleted');
                    renderAdminTabContent();
                } else {
                    showToast('Failed to delete', true);
                }
            }
        });
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const screenshotUrls = Array.from(document.querySelectorAll('.screenshot-input'))
            .map(input => input.value.trim())
            .filter(v => v !== '');

        const data = {
            title: document.getElementById('app-title').value,
            developer: document.getElementById('app-developer').value,
            category: document.getElementById('app-category').value,
            version: document.getElementById('app-version').value,
            rating: parseFloat(document.getElementById('app-rating').value) || 0,
            sizeInBytes: parseInt(document.getElementById('app-size').value) || 0,
            releaseDate: document.getElementById('app-date').value,
            requirements: document.getElementById('app-reqs').value,
            shortDescription: document.getElementById('app-short-desc').value,
            fullDescription: document.getElementById('app-full-desc').value,
            whatsNew: document.getElementById('app-whats-new').value,
            iconUrl: document.getElementById('app-icon').value,
            downloadUrl: document.getElementById('app-download').value,
            screenshotUrls: screenshotUrls,
            featured: document.getElementById('app-featured').checked,
        };

        const id = document.getElementById('app-id').value;
        let success = false;
        
        if (id) {
            success = await window.storage.update('apps', id, data);
        } else {
            // New doc
            data.downloadCount = 0;
            const newId = await window.storage.create('apps', data);
            success = !!newId;
        }

        if (success) {
            showToast('App saved successfully');
            renderAdminTabContent();
        } else {
            showToast('Failed to save app', true);
        }
    });
}

// --------------------------------------------------------
// BLOG ADMIN
// --------------------------------------------------------
async function renderBlogAdmin(container) {
    const posts = await window.storage.getAll('blogPosts');
    if (!document.getElementById('admin-workspace')) return;

    let html = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 2rem;">
            <h1 style="margin:0;">Manage Blog Posts</h1>
            <button class="btn" id="add-post-btn">+ Add New Post</button>
        </div>
        
        <div id="post-form-container" class="card" style="display:none; margin-bottom: 2rem; border-left: 4px solid var(--accent);">
            <h2 id="post-form-title" style="margin-bottom: 1.5rem; font-size: 1.25rem;">Add New Post</h2>
            <form id="admin-post-form" style="display:flex; flex-direction:column; gap:1.25rem;">
                <input type="hidden" id="post-id">
                
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                    <div><label class="form-label">Title *</label><input type="text" id="post-title" required class="form-input"></div>
                    <div><label class="form-label">URL Slug *</label><input type="text" id="post-slug" required class="form-input" placeholder="e.g. my-awesome-post"></div>
                    <div><label class="form-label">Author</label><input type="text" id="post-author" class="form-input" value="Admin"></div>
                    <div><label class="form-label">Publish Date</label><input type="date" id="post-date" class="form-input"></div>
                </div>
                
                <div style="background:var(--bg-base); padding: 1.5rem; border-radius: 8px; border: 1px solid var(--border-subtle);">
                    <p style="font-size: 0.85rem; color: var(--accent); margin-bottom: 1rem;">Note: Upload cover images externally (e.g. GitHub) and paste the URL here.</p>
                    <label class="form-label">Cover Image URL</label>
                    <input type="url" id="post-cover" class="form-input">
                </div>

                <div>
                    <label class="form-label">Short Excerpt *</label>
                    <textarea id="post-excerpt" required class="form-input" style="height: 60px;"></textarea>
                </div>

                <div>
                    <label class="form-label">Content (HTML)</label>
                    <div id="quill-editor" style="height: 300px; background:var(--bg-surface); color:var(--text-primary);"></div>
                </div>
                
                <div>
                    <label class="form-label">Tags (comma separated)</label>
                    <input type="text" id="post-tags" class="form-input" placeholder="e.g. news, update, android">
                </div>

                <div style="display:flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem;">
                    <button type="button" id="cancel-post-btn" class="btn" style="background:transparent; color:var(--text-secondary); border: 1px solid var(--border-subtle);">Cancel</button>
                    <button type="submit" class="btn">Save Post</button>
                </div>
            </form>
        </div>

        <div style="overflow-x: auto;">
            <table class="admin-table">
                <thead><tr><th>Title</th><th>Date</th><th>Author</th><th>Actions</th></tr></thead>
                <tbody>
                    ${posts.length === 0 ? '<tr><td colspan="4" style="text-align:center; padding:2rem;">No posts found.</td></tr>' : ''}
                    ${posts.map(post => `
                        <tr>
                            <td style="font-weight:500;">${post.title}</td>
                            <td>${post.publishedAt || '-'}</td>
                            <td>${post.author || '-'}</td>
                            <td>
                                <button class="action-btn edit-post" data-id="${post.id}" style="color:var(--accent);">Edit</button>
                                <button class="action-btn delete-post" data-id="${post.id}" style="color:#ef4444; margin-left:1rem;">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML = html;

    // Init Quill
    if (!window.Quill) {
        showToast("Error: Quill.js not loaded", true);
    } else {
        quillEditor = new window.Quill('#quill-editor', {
            theme: 'snow',
            modules: {
                toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    ['blockquote', 'code-block'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['link', 'image'],
                    ['clean']
                ]
            }
        });
        
        // Custom image handler to ask for URL instead of file upload
        quillEditor.getModule('toolbar').addHandler('image', () => {
            const url = prompt('Enter the image URL:');
            if (url) {
                const range = quillEditor.getSelection();
                quillEditor.insertEmbed(range.index, 'image', url);
            }
        });
    }

    const formContainer = document.getElementById('post-form-container');
    const form = document.getElementById('admin-post-form');
    
    // Auto-slug
    document.getElementById('post-title').addEventListener('input', (e) => {
        if(!document.getElementById('post-id').value) { // Only auto-slug for new posts
            const slug = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            document.getElementById('post-slug').value = slug;
        }
    });

    document.getElementById('add-post-btn').addEventListener('click', () => {
        form.reset();
        document.getElementById('post-id').value = '';
        if(quillEditor) quillEditor.root.innerHTML = '';
        document.getElementById('post-form-title').textContent = 'Add New Post';
        // Set date to today
        document.getElementById('post-date').value = new Date().toISOString().split('T')[0];
        formContainer.style.display = 'block';
        window.scrollTo(0, 0);
    });

    document.getElementById('cancel-post-btn').addEventListener('click', () => {
        formContainer.style.display = 'none';
    });

    document.querySelectorAll('.edit-post').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            const post = posts.find(p => p.id === id);
            if(!post) return;
            
            document.getElementById('post-id').value = post.id;
            document.getElementById('post-title').value = post.title || '';
            document.getElementById('post-slug').value = post.slug || '';
            document.getElementById('post-author').value = post.author || '';
            document.getElementById('post-date').value = post.publishedAt || '';
            document.getElementById('post-cover').value = post.coverImageUrl || '';
            document.getElementById('post-excerpt').value = post.excerpt || '';
            document.getElementById('post-tags').value = (post.tags || []).join(', ');
            
            if(quillEditor) quillEditor.root.innerHTML = post.contentHtml || '';
            
            document.getElementById('post-form-title').textContent = 'Edit Post';
            formContainer.style.display = 'block';
            window.scrollTo(0, 0);
        });
    });

    document.querySelectorAll('.delete-post').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            if(confirm("Are you sure you want to delete this post?")) {
                const id = e.target.dataset.id;
                const success = await window.storage.remove('blogPosts', id);
                if(success) {
                    showToast('Post deleted');
                    renderAdminTabContent();
                } else {
                    showToast('Failed to delete', true);
                }
            }
        });
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const tagsInput = document.getElementById('post-tags').value;
        const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t) : [];

        const data = {
            title: document.getElementById('post-title').value,
            slug: document.getElementById('post-slug').value,
            author: document.getElementById('post-author').value,
            publishedAt: document.getElementById('post-date').value,
            coverImageUrl: document.getElementById('post-cover').value,
            excerpt: document.getElementById('post-excerpt').value,
            contentHtml: quillEditor ? quillEditor.root.innerHTML : '',
            tags: tags
        };

        const id = document.getElementById('post-id').value;
        let success = false;
        
        if (id) {
            success = await window.storage.update('blogPosts', id, data);
        } else {
            const newId = await window.storage.create('blogPosts', data);
            success = !!newId;
        }

        if (success) {
            showToast('Post saved successfully');
            renderAdminTabContent();
        } else {
            showToast('Failed to save post', true);
        }
    });
}

// --------------------------------------------------------
// VIDEOS ADMIN
// --------------------------------------------------------
async function renderVideosAdmin(container) {
    const videos = await window.storage.getAll('videos');
    if (!document.getElementById('admin-workspace')) return;

    let html = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 2rem;">
            <h1 style="margin:0;">Manage Videos</h1>
            <button class="btn" id="add-vid-btn">+ Add New Video</button>
        </div>
        
        <div id="vid-form-container" class="card" style="display:none; margin-bottom: 2rem; border-left: 4px solid var(--accent);">
            <h2 id="vid-form-title" style="margin-bottom: 1.5rem; font-size: 1.25rem;">Add New Video</h2>
            <form id="admin-vid-form" style="display:flex; flex-direction:column; gap:1.25rem;">
                <input type="hidden" id="vid-id">
                
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                    <div style="grid-column: span 2;"><label class="form-label">Title *</label><input type="text" id="vid-title" required class="form-input"></div>
                    <div style="grid-column: span 2;"><label class="form-label">YouTube URL *</label><input type="url" id="vid-url" required class="form-input" placeholder="https://youtube.com/watch?v=..."></div>
                    <div style="grid-column: span 2;"><label class="form-label">Thumbnail URL (Optional)</label><input type="url" id="vid-thumb" class="form-input" placeholder="Leave blank to auto-fetch from YouTube"></div>
                    <div><label class="form-label">Publish Date</label><input type="date" id="vid-date" class="form-input"></div>
                </div>
                
                <div>
                    <label class="form-label">Description</label>
                    <textarea id="vid-desc" class="form-input" style="height: 80px;"></textarea>
                </div>

                <div style="display:flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem;">
                    <button type="button" id="cancel-vid-btn" class="btn" style="background:transparent; color:var(--text-secondary); border: 1px solid var(--border-subtle);">Cancel</button>
                    <button type="submit" class="btn">Save Video</button>
                </div>
            </form>
        </div>

        <div style="overflow-x: auto;">
            <table class="admin-table">
                <thead><tr><th>Thumbnail</th><th>Title</th><th>Date</th><th>Actions</th></tr></thead>
                <tbody>
                    ${videos.length === 0 ? '<tr><td colspan="4" style="text-align:center; padding:2rem;">No videos found.</td></tr>' : ''}
                    ${videos.map(vid => {
                        let videoId = '';
                        try {
                            const url = new URL(vid.youtubeUrl);
                            videoId = url.searchParams.get('v') || url.pathname.split('/').pop();
                        } catch(e){}
                        const thumb = vid.thumbnailUrl || (videoId ? `https://img.youtube.com/vi/${videoId}/default.jpg` : '');
                        return `
                        <tr>
                            <td>${thumb ? `<img src="${thumb}" style="width:60px; height:40px; border-radius:4px; object-fit:cover;">` : '-'}</td>
                            <td style="font-weight:500;">${vid.title}</td>
                            <td>${vid.publishedAt || '-'}</td>
                            <td>
                                <button class="action-btn edit-vid" data-id="${vid.id}" style="color:var(--accent);">Edit</button>
                                <button class="action-btn delete-vid" data-id="${vid.id}" style="color:#ef4444; margin-left:1rem;">Delete</button>
                            </td>
                        </tr>
                    `}).join('')}
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML = html;

    const formContainer = document.getElementById('vid-form-container');
    const form = document.getElementById('admin-vid-form');

    document.getElementById('add-vid-btn').addEventListener('click', () => {
        form.reset();
        document.getElementById('vid-id').value = '';
        document.getElementById('vid-form-title').textContent = 'Add New Video';
        document.getElementById('vid-date').value = new Date().toISOString().split('T')[0];
        formContainer.style.display = 'block';
        window.scrollTo(0, 0);
    });

    document.getElementById('cancel-vid-btn').addEventListener('click', () => {
        formContainer.style.display = 'none';
    });

    document.querySelectorAll('.edit-vid').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            const vid = videos.find(v => v.id === id);
            if(!vid) return;
            
            document.getElementById('vid-id').value = vid.id;
            document.getElementById('vid-title').value = vid.title || '';
            document.getElementById('vid-url').value = vid.youtubeUrl || '';
            document.getElementById('vid-thumb').value = vid.thumbnailUrl || '';
            document.getElementById('vid-date').value = vid.publishedAt || '';
            document.getElementById('vid-desc').value = vid.description || '';
            
            document.getElementById('vid-form-title').textContent = 'Edit Video';
            formContainer.style.display = 'block';
            window.scrollTo(0, 0);
        });
    });

    document.querySelectorAll('.delete-vid').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            if(confirm("Are you sure you want to delete this video?")) {
                const id = e.target.dataset.id;
                const success = await window.storage.remove('videos', id);
                if(success) {
                    showToast('Video deleted');
                    renderAdminTabContent();
                } else {
                    showToast('Failed to delete', true);
                }
            }
        });
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const data = {
            title: document.getElementById('vid-title').value,
            youtubeUrl: document.getElementById('vid-url').value,
            thumbnailUrl: document.getElementById('vid-thumb').value,
            publishedAt: document.getElementById('vid-date').value,
            description: document.getElementById('vid-desc').value,
        };

        const id = document.getElementById('vid-id').value;
        let success = false;
        if (id) success = await window.storage.update('videos', id, data);
        else success = !!(await window.storage.create('videos', data));

        if (success) {
            showToast('Video saved successfully');
            renderAdminTabContent();
        } else {
            showToast('Failed to save video', true);
        }
    });
}

// --------------------------------------------------------
// FILES ADMIN
// --------------------------------------------------------
async function renderFilesAdmin(container) {
    const files = await window.storage.getAll('files');
    if (!document.getElementById('admin-workspace')) return;

    let html = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 2rem;">
            <h1 style="margin:0;">Manage Files</h1>
            <button class="btn" id="add-file-btn">+ Add New File</button>
        </div>
        
        <div id="file-form-container" class="card" style="display:none; margin-bottom: 2rem; border-left: 4px solid var(--accent);">
            <h2 id="file-form-title" style="margin-bottom: 1.5rem; font-size: 1.25rem;">Add New File</h2>
            <form id="admin-file-form" style="display:flex; flex-direction:column; gap:1.25rem;">
                <input type="hidden" id="file-id">
                
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                    <div style="grid-column: span 2;"><label class="form-label">Title *</label><input type="text" id="file-title" required class="form-input"></div>
                    <div style="grid-column: span 2;">
                        <label class="form-label">Download URL *</label>
                        <p style="font-size: 0.8rem; color: var(--accent); margin: -0.25rem 0 0.5rem;">Upload externally and paste link here.</p>
                        <input type="url" id="file-url" required class="form-input">
                    </div>
                    <div><label class="form-label">File Type (e.g. PDF, ZIP)</label><input type="text" id="file-type" class="form-input"></div>
                    <div><label class="form-label">Size in Bytes</label><input type="number" id="file-size" class="form-input"></div>
                    <div><label class="form-label">Category</label><input type="text" id="file-cat" class="form-input"></div>
                    <div><label class="form-label">Upload Date</label><input type="date" id="file-date" class="form-input"></div>
                </div>
                
                <div>
                    <label class="form-label">Description</label>
                    <textarea id="file-desc" class="form-input" style="height: 60px;"></textarea>
                </div>

                <div style="display:flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem;">
                    <button type="button" id="cancel-file-btn" class="btn" style="background:transparent; color:var(--text-secondary); border: 1px solid var(--border-subtle);">Cancel</button>
                    <button type="submit" class="btn">Save File</button>
                </div>
            </form>
        </div>

        <div style="overflow-x: auto;">
            <table class="admin-table">
                <thead><tr><th>Title</th><th>Type</th><th>Size</th><th>Actions</th></tr></thead>
                <tbody>
                    ${files.length === 0 ? '<tr><td colspan="4" style="text-align:center; padding:2rem;">No files found.</td></tr>' : ''}
                    ${files.map(f => `
                        <tr>
                            <td style="font-weight:500;">${f.title}</td>
                            <td>${f.fileType || '-'}</td>
                            <td>${window.utils?.formatBytes(f.sizeInBytes) || '-'}</td>
                            <td>
                                <button class="action-btn edit-file" data-id="${f.id}" style="color:var(--accent);">Edit</button>
                                <button class="action-btn delete-file" data-id="${f.id}" style="color:#ef4444; margin-left:1rem;">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML = html;

    const formContainer = document.getElementById('file-form-container');
    const form = document.getElementById('admin-file-form');

    document.getElementById('add-file-btn').addEventListener('click', () => {
        form.reset();
        document.getElementById('file-id').value = '';
        document.getElementById('file-form-title').textContent = 'Add New File';
        document.getElementById('file-date').value = new Date().toISOString().split('T')[0];
        formContainer.style.display = 'block';
        window.scrollTo(0, 0);
    });

    document.getElementById('cancel-file-btn').addEventListener('click', () => {
        formContainer.style.display = 'none';
    });

    document.querySelectorAll('.edit-file').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            const f = files.find(x => x.id === id);
            if(!f) return;
            
            document.getElementById('file-id').value = f.id;
            document.getElementById('file-title').value = f.title || '';
            document.getElementById('file-url').value = f.downloadUrl || '';
            document.getElementById('file-type').value = f.fileType || '';
            document.getElementById('file-size').value = f.sizeInBytes || '';
            document.getElementById('file-cat').value = f.category || '';
            document.getElementById('file-date').value = f.uploadedAt || '';
            document.getElementById('file-desc').value = f.description || '';
            
            document.getElementById('file-form-title').textContent = 'Edit File';
            formContainer.style.display = 'block';
            window.scrollTo(0, 0);
        });
    });

    document.querySelectorAll('.delete-file').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            if(confirm("Are you sure you want to delete this file?")) {
                const id = e.target.dataset.id;
                const success = await window.storage.remove('files', id);
                if(success) {
                    showToast('File deleted');
                    renderAdminTabContent();
                } else {
                    showToast('Failed to delete', true);
                }
            }
        });
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const data = {
            title: document.getElementById('file-title').value,
            downloadUrl: document.getElementById('file-url').value,
            fileType: document.getElementById('file-type').value,
            sizeInBytes: parseInt(document.getElementById('file-size').value) || 0,
            category: document.getElementById('file-cat').value,
            uploadedAt: document.getElementById('file-date').value,
            description: document.getElementById('file-desc').value,
        };

        const id = document.getElementById('file-id').value;
        let success = false;
        if (id) success = await window.storage.update('files', id, data);
        else success = !!(await window.storage.create('files', data));

        if (success) {
            showToast('File saved successfully');
            renderAdminTabContent();
        } else {
            showToast('Failed to save file', true);
        }
    });
}

// --------------------------------------------------------
// SETTINGS ADMIN
// --------------------------------------------------------
async function renderSettingsAdmin(container) {
    const settingsList = await window.storage.getAll('settings');
    if (!document.getElementById('admin-workspace')) return;
    
    // We expect a single document with ID 'global'
    let currentSettings = { id: 'global', siteName: '', heroTitle: '', heroSubtitle: '', contactEmail: '' };
    if (settingsList && settingsList.length > 0) {
        currentSettings = settingsList[0];
    }

    let html = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 2rem;">
            <h1 style="margin:0;">Site Settings</h1>
        </div>
        
        <div class="card" style="border-left: 4px solid var(--accent);">
            <form id="admin-settings-form" style="display:flex; flex-direction:column; gap:1.25rem;">
                <input type="hidden" id="set-id" value="${currentSettings.id}">
                
                <div>
                    <label class="form-label">Site Name</label>
                    <input type="text" id="set-name" class="form-input" value="${currentSettings.siteName || ''}">
                </div>
                <div>
                    <label class="form-label">Hero Title (Home Page)</label>
                    <input type="text" id="set-hero" class="form-input" value="${currentSettings.heroTitle || ''}">
                </div>
                <div>
                    <label class="form-label">Hero Subtitle</label>
                    <input type="text" id="set-sub" class="form-input" value="${currentSettings.heroSubtitle || ''}">
                </div>
                <div>
                    <label class="form-label">Contact Email</label>
                    <input type="email" id="set-email" class="form-input" value="${currentSettings.contactEmail || ''}">
                </div>

                <div style="display:flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem;">
                    <button type="submit" class="btn">Save Settings</button>
                </div>
            </form>
        </div>
    `;

    container.innerHTML = html;

    document.getElementById('admin-settings-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const data = {
            siteName: document.getElementById('set-name').value,
            heroTitle: document.getElementById('set-hero').value,
            heroSubtitle: document.getElementById('set-sub').value,
            contactEmail: document.getElementById('set-email').value,
        };

        const id = document.getElementById('set-id').value || 'global';
        
        const success = await window.storage.update('settings', id, data);

        if (success) {
            showToast('Settings saved successfully');
        } else {
            showToast('Failed to save settings', true);
        }
    });
}
