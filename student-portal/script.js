const el = id => document.getElementById(id);

const portalScreen = el('portalScreen');
const welcomeMessage = el('welcomeMessage');
const userDetails = el('userDetails');
const announcementBanner = el('announcementBanner');
const announcementText = el('announcementText');
const dashboardAnnouncement = el('dashboardAnnouncement');

let announcementTimer = null;

async function api(path, options = {}) {
    let response;
    try {
        response = await fetch(path, options);
    } catch (error) {
        const openedAsFile = window.location.protocol === 'file:';
        throw new Error(openedAsFile
            ? 'The portal must be opened through Vercel or a local server. Run vercel dev, then open the localhost URL.'
            : 'Could not reach the portal API. Check that the site is deployed correctly.');
    }

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
        throw new Error(data?.error || 'Something went wrong');
    }

    return data;
}

function renderAnnouncement(announcement) {
    const message = announcement?.message;

    if (!message) {
        if (announcementBanner) {
            announcementBanner.hidden = true;
        }
        if (announcementText) {
            announcementText.textContent = '';
        }
        if (dashboardAnnouncement) {
            dashboardAnnouncement.textContent = 'No announcement right now.';
        }
        return;
    }

    if (announcementText) {
        announcementText.textContent = message;
    }
    if (dashboardAnnouncement) {
        dashboardAnnouncement.textContent = message;
    }
    if (announcementBanner) {
        announcementBanner.hidden = false;
    }
}

async function loadAnnouncement() {
    try {
        const announcement = await api('/api/announcement');
        renderAnnouncement(announcement);
    } catch {
        renderAnnouncement(null);
    }
}

function startAnnouncementPolling() {
    if (announcementTimer) {
        return;
    }

    announcementTimer = window.setInterval(loadAnnouncement, 60000);
}

function renderPortal() {
    if (welcomeMessage) {
        welcomeMessage.textContent = 'Student Portal';
    }
    if (userDetails) {
        userDetails.textContent = 'Bruern Abbey School';
    }
    if (portalScreen) {
        portalScreen.classList.add('active');
    }

    loadAnnouncement();
    startAnnouncementPolling();
}

window.addEventListener('DOMContentLoaded', renderPortal);
