// dashboard.js - Cleaned & Fixed (Users & Bookings only)
document.addEventListener('DOMContentLoaded', () => {

    // ------------------------
    // Sidebar & View Logic
    // ------------------------
    const sidebarLinks = Array.from(document.querySelectorAll('.sidebar-link'));
    const viewTitle = document.getElementById('view-title');

    const showView = (viewName) => {
        document.querySelectorAll('.view-content').forEach(vc => {
            vc.style.display = 'none';
            vc.classList.remove('active');
        });

        const targetId = `${viewName}-view`;
        const target = document.getElementById(targetId);
        if (target) {
            target.style.display = 'block';
            target.classList.add('active');
        }

        const link = document.querySelector(`.sidebar-link[data-view="${viewName}"]`);
        if (link) {
            viewTitle.textContent = link.getAttribute('data-title') || link.textContent.trim();
        } else {
            viewTitle.textContent = viewName.charAt(0).toUpperCase() + viewName.slice(1);
        }
    };

    sidebarLinks.forEach(link => {
        link.addEventListener('click', (evt) => {
            evt.preventDefault();
            const viewName = link.getAttribute('data-view');
            if (!viewName) return;

            sidebarLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            showView(viewName);
        });
    });

    // Set default view to Dashboard (overview) on page load
    const defaultLink = document.querySelector('.sidebar-link[data-view="overview"]');
    if (defaultLink) defaultLink.click();

    // Manage All Bookings button
    const manageBookingsBtn = document.getElementById('manageBookingsBtn');
    const bookingsLink = document.querySelector('.sidebar-link[data-view="bookings"]');

    if (bookingsLink && manageBookingsBtn) {
        manageBookingsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            sidebarLinks.forEach(l => l.classList.remove('active'));
            bookingsLink.classList.add('active');
            showView('bookings');
        });
    }

    // Manage All Users buttons
    const manageUsersBtnOverview = document.getElementById('manageUsersBtnOverview');
    const manageUsersBtn = document.getElementById('manageUsersBtn');
    const usersLink = document.querySelector('.sidebar-link[data-view="users"]');

    if (usersLink) {
        [manageUsersBtnOverview, manageUsersBtn].filter(btn => btn).forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                sidebarLinks.forEach(l => l.classList.remove('active'));
                usersLink.classList.add('active');
                showView('users');
            });
        });
    }

    // ------------------------
    // Auto-update Metrics
    // ------------------------
    const updateMetricsUI = async () => {
        try {
            // Note: The /dashboard-metrics endpoint is not defined in app.js, 
            // but the logic here handles the updates if it existed.
            const res = await fetch('/dashboard-metrics'); 
            if (!res.ok) throw new Error('Failed to fetch metrics');
            const data = await res.json();

            // ---- Users ----
            const usersNode = document.getElementById('totalUsersBox');
            if (usersNode && data.totalUsers !== undefined) {
                usersNode.textContent = parseInt(data.totalUsers, 10);
            }

            // ---- Bookings ----
            const bookingsNode = document.getElementById('totalBookingsBox');
            if (bookingsNode && data.totalBookings !== undefined) {
                bookingsNode.textContent = parseInt(data.totalBookings, 10);
            }

            const bookingsNodeBookings = document.getElementById('totalBookingsBoxBookings');
            if (bookingsNodeBookings && data.totalBookings !== undefined) {
                bookingsNodeBookings.textContent = parseInt(data.totalBookings, 10);
            }

        } catch (err) {
            console.error('Error updating metrics:', err);
        }
    };

    updateMetricsUI();
    setInterval(updateMetricsUI, 5000);
});