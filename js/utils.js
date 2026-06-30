// Utility functions
const utils = {
    formatBytes: function(bytes, decimals = 2) {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    },
    formatDate: function(date) {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        }).format(new Date(date));
    },
    toast: function(message, type = 'info') {
        console.log(`[TOAST: ${type}] ${message}`);
        // To be implemented in UI later
    }
};

window.utils = utils;
