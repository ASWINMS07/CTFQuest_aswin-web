// Secure Rite Solutions - Client Application
// Version 3.2.1

// Auth check for protected pages
(function () {
    const protectedPages = ['dashboard', 'preview'];
    const currentPath = window.location.pathname;

    if (protectedPages.some(p => currentPath.includes(p))) {
        const cookies = document.cookie.split(';').reduce((acc, c) => {
            const [k, v] = c.trim().split('=');
            acc[k] = v;
            return acc;
        }, {});

        if (!cookies.session) {
            window.location.href = '/login.html';
        }
    }
})();

// Decoy globals
window.SR_DEBUG = false;
window._system_flag = "SECE{app_js_global_fake}";
var __config = { env: 'production', flag: 'SECE{config_var_fake}' };

// Storage decoys
localStorage.setItem('SR_CONFIG', JSON.stringify({
    theme: 'dark',
    api: '/api/v1',
    flag: 'SECE{localstorage_config_fake}'
}));
localStorage.setItem('crypto_key', 'SECE{localStorage_key_fake}');
localStorage.setItem('admin_token', 'SECE{admin_token_local_fake}');
localStorage.setItem('debug_cache', 'SECE{debug_cache_fake}');

// Utility functions
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white ${type === 'error' ? 'bg-red-600' : 'bg-green-600'} transition-opacity`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
}

// Chart initialization helper
function initDashboardChart(canvasId) {
    if (typeof Chart === 'undefined') return;
    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (!ctx) return;

    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Access Events',
                data: [120, 190, 30, 50, 20, 30],
                borderColor: '#dc2626',
                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { color: '#9ca3af' } }
            },
            scales: {
                x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
                y: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } }
            }
        }
    });
}
