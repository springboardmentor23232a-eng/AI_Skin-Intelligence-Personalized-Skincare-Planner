document.addEventListener('DOMContentLoaded', () => {
    
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const role = document.getElementById('role').value;
            
            // Simple UI routing based on selected role
            if (role === 'user') {
                window.location.href = 'user_dashboard.html';
            } else if (role === 'consultant') {
                window.location.href = 'consultant_dashboard.html';
            }
        });
    }
});

// Simple UI redirect for logout
window.logout = function() {
    window.location.href = 'login.html';
}
