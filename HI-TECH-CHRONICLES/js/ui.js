const UI = {
    renderAppCard: (app) => {
        return `
            <div class="card">
                <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
                    <div class="card-icon">
                        ${app.customIconUrl ? `<img src="${app.customIconUrl}" alt="${app.title}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">` : `<span class="material-symbols-rounded">${app.icon || 'android'}</span>`}
                    </div>
                    <span class="badge">${app.category}</span>
                </div>
                <h3 style="margin-bottom:10px;">${app.title}</h3>
                <p style="color:var(--text-secondary); font-size:0.9rem; margin-bottom:20px; line-height:1.5;">${app.description.substring(0, 80)}...</p>
                
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:auto;">
                    <div style="display:flex; align-items:center; gap:5px;">
                        <span class="material-symbols-rounded" style="color:gold; font-size:18px;">star</span>
                        <span style="font-weight:600;">${app.rating}</span>
                    </div>
                    <a href="#app/${app.id}" class="btn btn-primary" style="padding:8px 15px; font-size:0.9rem;">Get</a>
                </div>
            </div>
        `;
    },

    renderFileCard: (file) => {
        return `
            <div class="card">
                <div class="card-icon" style="background: var(--bg-primary); border: 1px solid var(--glass-border); color: var(--accent-secondary)">
                    <span class="material-symbols-rounded">${file.icon || 'insert_drive_file'}</span>
                </div>
                <div class="card-content">
                    <h3 class="card-title">${file.title}</h3>
                    <p class="card-desc">${file.description}</p>
                    <div class="card-meta">
                        <span class="badge">${file.type}</span>
                        <span>${Utils.formatBytes(file.size)}</span>
                    </div>
                </div>
                <div style="display:flex; justify-content:space-between; margin-top:10px; gap:10px;">
                    <button class="btn btn-secondary" style="flex:1; justify-content:center;" onclick="window.downloadItem('file', '${file.title}')">
                        <span class="material-symbols-rounded">download</span> Download
                    </button>
                    <button class="icon-btn" onclick="UI.shareLink('#downloads')" style="background:var(--bg-primary)">
                        <span class="material-symbols-rounded">share</span>
                    </button>
                </div>
            </div>
        `;
    },

    renderVideoCard: (video) => {
        return `
            <div class="card">
                <div class="card-image" style="display:flex; align-items:center; justify-content:center; font-size:4rem; color:var(--accent-primary); background:var(--glass-bg)">
                    <span class="material-symbols-rounded">play_circle</span>
                </div>
                <div class="card-content" style="margin-top:15px;">
                    <h3 class="card-title">${video.title}</h3>
                    <p class="card-desc">${video.description}</p>
                    ${video.promptUsed ? `<div style="margin:10px 0; padding:10px; background:var(--bg-primary); border-radius:8px; font-size:0.85rem; border:1px solid var(--glass-border);"><strong>AI Prompt:</strong> ${video.promptUsed}</div>` : ''}
                    <div class="card-meta">
                        <span>${Utils.formatDate(video.date)}</span>
                    </div>
                </div>
                <div style="display:flex; gap:10px; margin-top:10px;">
                    <button class="btn btn-primary" style="flex:1; justify-content:center;" onclick="window.open('${video.url}', '_blank')">
                        <span class="material-symbols-rounded">play_arrow</span> Watch
                    </button>
                    <button class="icon-btn" onclick="UI.shareLink('#youtube')" style="background:var(--bg-primary)">
                        <span class="material-symbols-rounded">share</span>
                    </button>
                </div>
            </div>
        `;
    },

    shareLink: (hash) => {
        const url = window.location.origin + window.location.pathname + hash;
        Utils.copyToClipboard(url);
    },

    showModal: (contentHTML, isLarge = false) => {
        const container = document.getElementById('modal-container');
        container.innerHTML = `
            <div class="modal-overlay active" id="current-modal">
                <div class="modal-content ${isLarge ? 'large' : ''}">
                    <button class="icon-btn close-btn" onclick="UI.closeModal()">
                        <span class="material-symbols-rounded">close</span>
                    </button>
                    ${contentHTML}
                </div>
            </div>
        `;
    },

    closeModal: () => {
        const modal = document.getElementById('current-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                document.getElementById('modal-container').innerHTML = '';
            }, 300);
        }
    }
};
