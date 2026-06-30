// downloads.js
// Handlers for Downloads and YouTube resources

const DownloadsManager = {
    renderDownloads: async () => {
        const files = await StorageManager.get('files');
        
        const filesHTML = files.map(file => `
            <div class="card" style="flex-direction:row; padding:20px; align-items:center; margin-bottom:15px; gap:20px;">
                <div class="card-icon" style="width:60px; height:60px; font-size:2rem; flex-shrink:0;">
                    ${file.customIconUrl ? `<img src="${file.customIconUrl}" alt="${file.title}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">` : `<span class="material-symbols-rounded">${file.icon}</span>`}
                </div>
                <div style="flex:1;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                        <h3 style="margin:0">${file.title}</h3>
                        <span class="badge" style="background:var(--bg-secondary); border:none">${file.type}</span>
                    </div>
                    <p style="color:var(--text-secondary); font-size:0.9rem; margin-bottom:10px;">${file.description}</p>
                    <div style="display:flex; gap:15px; font-size:0.8rem; color:var(--text-secondary);">
                        <span><span class="material-symbols-rounded" style="font-size:14px;vertical-align:-2px">data_usage</span> ${Utils.formatBytes(file.size)}</span>
                        <span><span class="material-symbols-rounded" style="font-size:14px;vertical-align:-2px">download</span> ${file.downloads || 0}</span>
                    </div>
                </div>
                <button class="btn btn-primary" onclick="window.downloadItem('file', '${file.id}', '${file.downloadUrl}')" style="flex-shrink:0">
                    <span class="material-symbols-rounded">download</span> Get
                </button>
            </div>
        `).join('');

        return `
            <div class="section container page-view" style="max-width:900px; margin:0 auto;">
                <h2 class="section-title" style="text-align:center; margin-bottom:40px;">Download Center</h2>
                
                <div style="margin-bottom: 40px;">
                    <h3 style="margin-bottom: 20px; display:flex; align-items:center; gap:10px;">
                        <span class="material-symbols-rounded" style="color:var(--accent-secondary)">folder_zip</span> Design Resources & Templates
                    </h3>
                    ${filesHTML || '<p style="color:var(--text-secondary)">No resources available.</p>'}
                </div>
            </div>
        `;
    },

    renderYouTube: async () => {
        const videos = await StorageManager.get('videos');
        
        const videosHTML = videos.map(vid => `
            <div class="card" style="margin-bottom: 15px;">
                <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                    <h3 style="color:var(--accent-primary)">${vid.title}</h3>
                    <span class="badge" style="background:rgba(255,0,0,0.1); color:#ff4444; border:none"><span class="material-symbols-rounded" style="font-size:14px;vertical-align:-2px;margin-right:3px;">play_circle</span>YouTube</span>
                </div>
                <p style="color:var(--text-secondary); font-size:0.9rem; margin-bottom:15px;">${vid.description}</p>
                ${vid.promptUsed ? `
                <div style="background:var(--bg-secondary); padding:10px; border-radius:8px; margin-bottom:15px; font-size:0.85rem; border: 1px solid var(--glass-border)">
                    <strong style="color:var(--text-primary)">AI Prompt:</strong><br>
                    <span style="color:var(--text-secondary)">${vid.promptUsed}</span>
                </div>` : ''}
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:0.8rem; color:var(--text-secondary)">${Utils.formatDate(vid.date)}</span>
                    <a href="${vid.url}" target="_blank" class="btn btn-secondary" style="padding:8px 15px;">Watch Video</a>
                </div>
            </div>
        `).join('');

        return `
            <div class="section container page-view" style="max-width:900px; margin:0 auto;">
                <h2 class="section-title" style="text-align:center; margin-bottom:40px;">YouTube Resources</h2>
                
                <div>
                    <h3 style="margin-bottom: 20px; display:flex; align-items:center; gap:10px;">
                        <span class="material-symbols-rounded" style="color:#ff4444">smart_display</span> Tutorials & AI Prompts
                    </h3>
                    <div class="grid-2">
                        ${videosHTML || '<p style="color:var(--text-secondary)">No videos available.</p>'}
                    </div>
                </div>
            </div>
        `;
    }
};
