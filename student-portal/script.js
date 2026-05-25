// ===================================
// STUDENT PORTAL - JAVASCRIPT
// Secure Login, Account Creation & Admin Management
// ===================================

// Application State
const appState = {
    isLoggedIn: false,
    currentUser: null,
    isAdmin: false,
    editingLinkId: null,
    signupSource: 'public'
};

const STORAGE_KEYS = {
    accounts: 'studentPortalAccounts',
    quickLinks: 'studentPortalQuickLinks',
    broadcasts: 'studentPortalBroadcasts',
    session: 'studentPortalSession',
    profiles: 'studentPortalProfiles'
};

const YEAR_CLASSES = {
    'Year 8': ['U6 Balliol', 'U6 Exeter', 'U6 Hertford', 'U6 Keble', 'U6 Wadham'],
    'Year 7': ['L6 Blue', 'L6 Bronze', 'L6 Green'],
    'Year 6': ['Kestrels', 'Goshawks', 'Merlins'],
    'Year 5': ['Kites', 'Peregrines'],
    'Year 4': ['Barn Owls']
};

const DEFAULT_QUICK_LINKS = [
    { id: 'timetable', icon: '📚', name: 'View Timetable', url: 'https://bruern-pupil-site.vercel.app/academic?mode=all&day=all' },
    { id: 'activities', icon: '🎯', name: 'Activities', url: 'https://bruern-pupil-site.vercel.app/activity-lists' },
    { id: 'classroom', icon: '📖', name: 'Google Classroom', url: 'https://classroom.google.com/' }
];

// Hardcoded Admin Credentials
const ADMIN_ACCOUNT = {
    firstName: 'noah',
    lastName: 'hill',
    password: 'Bruern801',
    yearGroup: 'Year 8',
    className: 'U6 Balliol',
    role: 'admin'
};

// Cached DOM Elements
const loginScreen = document.getElementById('loginScreen');
const signupScreen = document.getElementById('signupScreen');
const portalScreen = document.getElementById('portalScreen');
const adminPanel = document.getElementById('adminPanel');
const quickLinkEditor = document.getElementById('quickLinkEditor');
const quickActions = document.getElementById('quickActions');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const errorMessage = document.getElementById('errorMessage');
const signupErrorMessage = document.getElementById('signupErrorMessage');
const logoutBtn = document.getElementById('logoutBtn');
const adminToggleBtn = document.getElementById('adminToggleBtn');
const closeAdminBtn = document.getElementById('closeAdminBtn');
const welcomeMessage = document.getElementById('welcomeMessage');
const userDetails = document.getElementById('userDetails');
const openSignupBtn = document.getElementById('openSignupBtn');
const adminCreateAccountBtn = document.getElementById('adminCreateAccountBtn');
const backToLoginBtn = document.getElementById('backToLoginBtn');
const closeSignupBtn = document.getElementById('closeSignupBtn');
const signupYear = document.getElementById('signupYear');
const signupClass = document.getElementById('signupClass');
const studentCreateOverlay = document.getElementById('studentCreateOverlay');
const closeStudentCreateBtn = document.getElementById('closeStudentCreateBtn');
const studentCreateForm = document.getElementById('studentCreateForm');
const studentCreateYear = document.getElementById('studentCreateYear');
const studentCreateClass = document.getElementById('studentCreateClass');
const studentCreateProfilePicture = document.getElementById('studentCreateProfilePicture');
const studentCreateErrorMessage = document.getElementById('studentCreateErrorMessage');
const studentCreateBackBtn = document.getElementById('studentCreateBackBtn');
const quickLinksList = document.getElementById('quickLinksList');
const broadcastBanner = document.getElementById('broadcastBanner');
const broadcastMessage = document.getElementById('broadcastMessage');
const postBroadcastBtn = document.getElementById('postBroadcastBtn');
const clearBroadcastBtn = document.getElementById('clearBroadcastBtn');
const broadcastDuration1 = document.getElementById('broadcastDuration1');
const broadcastDuration24 = document.getElementById('broadcastDuration24');
const broadcastDuration7 = document.getElementById('broadcastDuration7');
const broadcastCustomDuration = document.getElementById('broadcastCustomDuration');
const broadcastCustomUnit = document.getElementById('broadcastCustomUnit');
const quickLinkFormContainer = document.getElementById('quickLinkFormContainer');
const quickLinkFormTitle = document.getElementById('quickLinkFormTitle');
const quickLinkForm = document.getElementById('quickLinkForm');
const quickLinkFormError = document.getElementById('quickLinkFormError');
const closeQuickLinkEditorBtn = document.getElementById('closeQuickLinkEditorBtn');
const addQuickLinkBtn = document.getElementById('addQuickLinkBtn');
const cancelQuickLinkEditBtn = document.getElementById('cancelQuickLinkEditBtn');
const settingsBtn = document.getElementById('settingsBtn');
const settingsScreen = document.getElementById('settingsScreen');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const closeSettingsBottomBtn = document.getElementById('closeSettingsBottomBtn');
const profilePictureUpload = document.getElementById('profilePictureUpload');
const profilePicturePreview = document.getElementById('profilePicturePreview');
const clearProfilePictureBtn = document.getElementById('clearProfilePictureBtn');
const usernameInput = document.getElementById('usernameInput');
const saveUsernameBtn = document.getElementById('saveUsernameBtn');
const studentAccountsOverlay = document.getElementById('studentAccountsOverlay');
const viewStudentAccountsBtn = document.getElementById('viewStudentAccountsBtn');
const closeStudentAccountsBtn = document.getElementById('closeStudentAccountsBtn');
const studentAccountsList = document.getElementById('studentAccountsList');
const studentDetailsOverlay = document.getElementById('studentDetailsOverlay');
const closeStudentDetailsBtn = document.getElementById('closeStudentDetailsBtn');
const backToStudentListBtn = document.getElementById('backToStudentListBtn');
const makeAdminBtn = document.getElementById('makeAdminBtn');
const signupProfilePicture = document.getElementById('signupProfilePicture');
const body = document.body;

let currentStudentAccounts = [];
let editingStudentId = null;

function lockBodyScroll() {
    document.documentElement.classList.add('no-scroll');
    body.classList.add('no-scroll');
}

function unlockBodyScroll() {
    document.documentElement.classList.remove('no-scroll');
    body.classList.remove('no-scroll');
}

function closeAllOverlays() {
    adminPanel.classList.remove('active');
    quickLinkEditor.classList.remove('active');
    studentCreateOverlay.classList.remove('active');
    studentAccountsOverlay.classList.remove('active');
    studentDetailsOverlay.classList.remove('active');
    settingsScreen.classList.remove('active');
    settingsScreen.style.display = 'none';
    quickLinkFormContainer.style.display = 'none';
    unlockBodyScroll();
    // Safety fallback: if no main screen is visible after closing overlays,
    // show the appropriate screen to avoid a blank page.
    const anyMainActive = loginScreen.classList.contains('active') || portalScreen.classList.contains('active') || signupScreen.classList.contains('active');
    if (!anyMainActive) {
        if (appState.isLoggedIn) {
            showPortal();
        } else {
            showLogin();
        }
    }
}

// ===================================
// BROADCASTS (admin)
// ===================================

function getSavedBroadcasts() {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEYS.broadcasts);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
}

function saveBroadcasts(list) {
    window.localStorage.setItem(STORAGE_KEYS.broadcasts, JSON.stringify(list || []));
}

function clearExpiredBroadcasts() {
    const now = Date.now();
    const list = getSavedBroadcasts().filter(b => b.expiresAt && b.expiresAt > now);
    saveBroadcasts(list);
    return list;
}

function renderBroadcastBanner() {
    if (!broadcastBanner) return;
    const active = clearExpiredBroadcasts();
    if (!active || active.length === 0) {
        broadcastBanner.style.display = 'none';
        broadcastBanner.innerHTML = '';
        return;
    }
    // show the most recent broadcast
    const latest = active.sort((a, b) => b.id - a.id)[0];
    const expiresIn = Math.max(0, Math.round((latest.expiresAt - Date.now()) / 60000));
    broadcastBanner.style.display = 'block';
    broadcastBanner.innerHTML = `<div class="broadcast-text">${escapeHtml(latest.message)}</div><div style="font-size:0.9rem; margin-top:6px; color:var(--text-secondary);">Expires in ${expiresIn} minute(s)</div>`;
}

function escapeHtml(str) {
    return String(str).replace(/[&<>\"]/g, function(s) { return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]); });
}

function postBroadcast(message, minutes) {
    if (!message || !minutes) return false;
    const expiresAt = Date.now() + (minutes * 60000);
    const list = clearExpiredBroadcasts();
    list.push({ id: Date.now(), message, expiresAt });
    saveBroadcasts(list);
    renderBroadcastBanner();
    return true;
}

function clearBroadcasts() {
    saveBroadcasts([]);
    renderBroadcastBanner();
}

// Duration button selection
let selectedBroadcastDuration = 60; // minutes default
function setSelectedDuration(minutes) {
    selectedBroadcastDuration = minutes;
    [broadcastDuration1, broadcastDuration24, broadcastDuration7].forEach(btn => {
        if (!btn) return;
        btn.classList.toggle('active', parseInt(btn.dataset.duration, 10) === minutes);
    });

    if (broadcastCustomDuration && broadcastCustomUnit) {
        if (minutes === 60) {
            broadcastCustomDuration.value = 60;
            broadcastCustomUnit.value = 'minutes';
        } else if (minutes === 1440) {
            broadcastCustomDuration.value = 24;
            broadcastCustomUnit.value = 'hours';
        } else if (minutes === 10080) {
            broadcastCustomDuration.value = 7;
            broadcastCustomUnit.value = 'days';
        }
    }
}

function getBroadcastDurationMinutes() {
    if (!broadcastCustomDuration || !broadcastCustomUnit) return selectedBroadcastDuration;
    const amount = parseFloat(broadcastCustomDuration.value);
    const unit = broadcastCustomUnit.value;
    if (!Number.isFinite(amount) || amount <= 0) {
        return null;
    }
    switch (unit) {
        case 'hours':
            return Math.round(amount * 60);
        case 'days':
            return Math.round(amount * 1440);
        default:
            return Math.round(amount);
    }
}

if (broadcastDuration1) broadcastDuration1.addEventListener('click', () => setSelectedDuration(60));
if (broadcastDuration24) broadcastDuration24.addEventListener('click', () => setSelectedDuration(1440));
if (broadcastDuration7) broadcastDuration7.addEventListener('click', () => setSelectedDuration(10080));

if (postBroadcastBtn) {
    postBroadcastBtn.addEventListener('click', function() {
        const msg = (broadcastMessage && broadcastMessage.value || '').trim();
        if (!msg) {
            showError('Please enter a broadcast message before posting.');
            return;
        }
        const durationMinutes = getBroadcastDurationMinutes();
        if (!durationMinutes || durationMinutes <= 0) {
            showError('Please enter a valid broadcast duration.');
            return;
        }
        postBroadcast(msg, durationMinutes);
        if (broadcastMessage) broadcastMessage.value = '';
        showInfo('✅ Broadcast posted.');
    });
}

setSelectedDuration(selectedBroadcastDuration);

if (clearBroadcastBtn) {
    clearBroadcastBtn.addEventListener('click', function() {
        if (!confirm('Clear all broadcasts?')) return;
        clearBroadcasts();
        showInfo('✅ Broadcasts cleared.');
    });
}


let quickLinks = [];

// ===================================
// STORAGE HELPERS
// ===================================

function getStoredAccounts() {
    const stored = window.localStorage.getItem(STORAGE_KEYS.accounts);
    return stored ? JSON.parse(stored) : [];
}

function populateDetailClassOptions(year) {
    const classSelect = document.getElementById('detailClassSelect');
    classSelect.innerHTML = '';
    const classes = YEAR_CLASSES[year] || [];
    classes.forEach(cl => {
        const opt = document.createElement('option');
        opt.value = cl;
        opt.textContent = cl;
        classSelect.appendChild(opt);
    });
}

// Detail form handlers
const studentEditForm = document.getElementById('studentEditForm');
const detailYearSelect = document.getElementById('detailYearSelect');
const detailClassSelect = document.getElementById('detailClassSelect');
const deleteStudentBtn = document.getElementById('deleteStudentBtn');

if (detailYearSelect) {
    detailYearSelect.addEventListener('change', function() {
        populateDetailClassOptions(this.value);
    });
}

if (studentEditForm) {
    studentEditForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        if (!editingStudentId) return;

        const existingStudent = currentStudentAccounts?.find(s => s.id === editingStudentId) || {};
        const updatedStudent = {
            id: editingStudentId,
            firstName: capitalizeFirstLetter(document.getElementById('detailFirstNameInput').value.trim()),
            lastName: capitalizeFirstLetter(document.getElementById('detailLastNameInput').value.trim()),
            password: document.getElementById('detailPasswordInput').value || existingStudent.password || '',
            yearGroup: document.getElementById('detailYearSelect').value,
            className: document.getElementById('detailClassSelect').value,
            profilePicture: existingStudent.profile_picture || null
        };

        try {
            await apiUpdateStudent(updatedStudent);
            showInfo('✅ Student updated successfully.');
            studentDetailsOverlay.classList.remove('active');
            await renderStudentAccountsList();
            studentAccountsOverlay.classList.add('active');
        } catch (error) {
            showError(error.message || 'Unable to update student.');
        }
    });
}

if (deleteStudentBtn) {
    deleteStudentBtn.addEventListener('click', async function() {
        if (!editingStudentId) return;
        if (!confirm('Delete this student account? This cannot be undone.')) return;

        try {
            await apiDeleteStudent(editingStudentId);
            editingStudentId = null;
            studentDetailsOverlay.classList.remove('active');
            await renderStudentAccountsList();
            studentAccountsOverlay.classList.add('active');
            showInfo('✅ Student account deleted successfully.');
        } catch (error) {
            showError(error.message || 'Unable to delete student.');
        }
    });
}

function saveStoredAccounts(accounts) {
    window.localStorage.setItem(STORAGE_KEYS.accounts, JSON.stringify(accounts));
}

function getSavedQuickLinks() {
    const stored = window.localStorage.getItem(STORAGE_KEYS.quickLinks);
    return stored ? JSON.parse(stored) : DEFAULT_QUICK_LINKS;
}

function saveQuickLinks() {
    window.localStorage.setItem(STORAGE_KEYS.quickLinks, JSON.stringify(quickLinks));
}

function saveSession() {
    const sessionData = {
        isLoggedIn: appState.isLoggedIn,
        isAdmin: appState.isAdmin,
        currentUser: appState.currentUser
    };
    window.localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(sessionData));
}

function clearSession() {
    window.localStorage.removeItem(STORAGE_KEYS.session);
}

function loadSession() {
    const raw = window.localStorage.getItem(STORAGE_KEYS.session);
    if (!raw) {
        return false;
    }

    try {
        const sessionData = JSON.parse(raw);
        if (sessionData && sessionData.isLoggedIn && sessionData.currentUser) {
            appState.isLoggedIn = true;
            appState.isAdmin = sessionData.isAdmin === true;
            appState.currentUser = sessionData.currentUser;
            return true;
        }
    } catch (error) {
        console.warn('Failed to restore session:', error);
    }

    clearSession();
    return false;
}

function getAllAccounts() {
    return [ADMIN_ACCOUNT, ...getStoredAccounts()];
}

async function apiLogin(firstName, lastName, password) {
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ firstName, lastName, password })
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data?.error || 'Login failed');
        }

        return await response.json();
    } catch (error) {
        console.warn('API login error:', error);
        throw error;
    }
}

async function apiSignup(account) {
    try {
        const response = await fetch('/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(account)
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data?.error || 'Signup failed');
        }

        return await response.json();
    } catch (error) {
        console.warn('API signup error:', error);
        throw error;
    }
}

async function apiFetchStudentAccounts() {
    try {
        const response = await fetch('/api/students');
        if (!response.ok) {
            throw new Error('Unable to fetch student accounts');
        }
        return await response.json();
    } catch (error) {
        console.warn('API student fetch error:', error);
        return null;
    }
}

async function apiPromoteStudent(id) {
    try {
        const response = await fetch('/api/promote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data?.error || 'Unable to promote student');
        }

        return await response.json();
    } catch (error) {
        console.warn('API promote error:', error);
        throw error;
    }
}

async function apiUpdateStudent(student) {
    try {
        const response = await fetch('/api/student', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(student)
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data?.error || 'Unable to update student');
        }

        return await response.json();
    } catch (error) {
        console.warn('API update student error:', error);
        throw error;
    }
}

async function apiDeleteStudent(id) {
    try {
        const response = await fetch('/api/student', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data?.error || 'Unable to delete student');
        }

        return await response.json();
    } catch (error) {
        console.warn('API delete student error:', error);
        throw error;
    }
}

function loginUser(user) {
    appState.isLoggedIn = true;
    appState.isAdmin = user.role === 'admin';
    appState.currentUser = {
        firstName: capitalizeFirstLetter(user.first_name || user.firstName),
        lastName: capitalizeFirstLetter(user.last_name || user.lastName),
        yearGroup: user.year_group || user.yearGroup,
        className: user.class_name || user.className,
        role: user.role || 'student',
        profilePicture: user.profile_picture || null
    };
    saveSession();
    showPortal();
}

async function getSignupProfilePictureData() {
    return new Promise(resolve => {
        const file = signupProfilePicture?.files?.[0];
        if (!file) {
            resolve(null);
            return;
        }

        const reader = new FileReader();
        reader.onload = event => {
            resolve(event.target.result);
        };
        reader.readAsDataURL(file);
    });
}

async function getStudentCreateProfilePictureData() {
    return new Promise(resolve => {
        const file = studentCreateProfilePicture?.files?.[0];
        if (!file) {
            resolve(null);
            return;
        }

        const reader = new FileReader();
        reader.onload = event => {
            resolve(event.target.result);
        };
        reader.readAsDataURL(file);
    });
}

async function refreshStudentAccountsList() {
    const accounts = await apiFetchStudentAccounts();
    if (!accounts) {
        studentAccountsList.innerHTML = '<p class="admin-note">Unable to load student accounts.</p>';
        return;
    }
    currentStudentAccounts = accounts;

    if (accounts.length === 0) {
        studentAccountsList.innerHTML = '<p class="admin-note">No student accounts created yet.</p>';
        return;
    }

    studentAccountsList.innerHTML = '<div class="student-accounts-table">' + 
        accounts.map((account, i) => {
            return `<div class="student-account-item">
                <div class="student-info">
                    <div class="student-name">${capitalizeFirstLetter(account.first_name)} ${capitalizeFirstLetter(account.last_name)}</div>
                    <div class="student-meta">${account.year_group || 'N/A'} - ${account.class_name || 'N/A'} • ${account.role === 'admin' ? 'Admin' : 'Student'}</div>
                </div>
                <div style="display:flex; gap:10px; width:100%; max-width:320px; justify-content:flex-end; flex-wrap:wrap;">
                    <button class="btn btn-admin-action view-student-btn" data-index="${i}">👁️ View</button>
                    ${account.role !== 'admin' ? `<button class="btn btn-admin" data-promote-id="${account.id}">Make Admin</button>` : '<span class="admin-badge" style="margin-left:8px;">Admin</span>'}
                </div>
            </div>`;
        }).join('') + '</div>';

    document.querySelectorAll('.view-student-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const idx = parseInt(this.getAttribute('data-index'), 10);
            const account = currentStudentAccounts[idx];
            if (!account) return;
            openStudentDetails(account);
        });
    });

    document.querySelectorAll('[data-promote-id]').forEach(btn => {
        btn.addEventListener('click', async function() {
            const id = parseInt(this.getAttribute('data-promote-id'), 10);
            try {
                await apiPromoteStudent(id);
                showInfo('✅ Student promoted to admin successfully.');
                refreshStudentAccountsList();
            } catch (error) {
                showError(error.message || 'Unable to promote student.');
            }
        });
    });
}

function openStudentDetails(account) {
    editingStudentId = account.id;
    document.getElementById('studentDetailsTitle').textContent = `Student: ${capitalizeFirstLetter(account.first_name)} ${capitalizeFirstLetter(account.last_name)}`;
    document.getElementById('detailFirstNameInput').value = account.first_name;
    document.getElementById('detailLastNameInput').value = account.last_name;
    document.getElementById('detailPasswordInput').value = account.password || '';

    const yearSelect = document.getElementById('detailYearSelect');
    yearSelect.innerHTML = '';
    Object.keys(YEAR_CLASSES).forEach(y => {
        const opt = document.createElement('option');
        opt.value = y;
        opt.textContent = y;
        yearSelect.appendChild(opt);
    });
    yearSelect.value = account.year_group || Object.keys(YEAR_CLASSES)[0];
    populateDetailClassOptions(yearSelect.value);
    document.getElementById('detailClassSelect').value = account.class_name || document.getElementById('detailClassSelect').value;

    if (account.profile_picture) {
        const preview = document.getElementById('detailProfilePicturePreview');
        if (preview) {
            preview.textContent = '';
            const img = document.createElement('img');
            img.src = account.profile_picture;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '50%';
            preview.appendChild(img);
        }
    }

    studentAccountsOverlay.classList.remove('active');
    studentDetailsOverlay.classList.add('active');
    lockBodyScroll();
}

function getProfileData(firstName, lastName) {
    const profiles = JSON.parse(window.localStorage.getItem(STORAGE_KEYS.profiles) || '{}');
    const key = `${firstName.toLowerCase()}_${lastName.toLowerCase()}`;
    return profiles[key] || { username: `${firstName} ${lastName}`, profilePicture: null };
}

function saveProfileData(firstName, lastName, profileData) {
    const profiles = JSON.parse(window.localStorage.getItem(STORAGE_KEYS.profiles) || '{}');
    const key = `${firstName.toLowerCase()}_${lastName.toLowerCase()}`;
    profiles[key] = profileData;
    window.localStorage.setItem(STORAGE_KEYS.profiles, JSON.stringify(profiles));
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

// ===================================
// LOGIN FUNCTIONALITY
// ===================================

loginForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const password = document.getElementById('password').value;
    if (firstName.toLowerCase() === ADMIN_ACCOUNT.firstName && lastName.toLowerCase() === ADMIN_ACCOUNT.lastName && password === ADMIN_ACCOUNT.password) {
        appState.isLoggedIn = true;
        appState.isAdmin = true;
        appState.currentUser = {
            firstName: capitalizeFirstLetter(ADMIN_ACCOUNT.firstName),
            lastName: capitalizeFirstLetter(ADMIN_ACCOUNT.lastName),
            yearGroup: ADMIN_ACCOUNT.yearGroup,
            className: ADMIN_ACCOUNT.className,
            role: 'admin'
        };
        hideError();
        loginForm.reset();
        saveSession();
        showPortal();
        return;
    }

    apiLogin(firstName, lastName, password)
        .then(user => {
            appState.isLoggedIn = true;
            appState.isAdmin = false;
            appState.currentUser = {
                firstName: capitalizeFirstLetter(user.firstName),
                lastName: capitalizeFirstLetter(user.lastName),
                yearGroup: user.year_group,
                className: user.class_name,
                role: 'student'
            };
            hideError();
            loginForm.reset();
            saveSession();
            showPortal();
        })
        .catch(() => {
            showError('❌ Incorrect credentials. Please try again or create an account.');
        });
});

// ===================================
// SIGNUP FUNCTIONALITY
// ===================================

openSignupBtn.addEventListener('click', function() {
    appState.signupSource = 'public';
    showSignup();
});
adminCreateAccountBtn.addEventListener('click', function() {
    appState.signupSource = 'admin';
    adminPanel.classList.remove('active');
    showStudentCreateOverlay();
});
backToLoginBtn.addEventListener('click', showLogin);
closeSignupBtn.addEventListener('click', closeSignup);

closeStudentCreateBtn.addEventListener('click', closeStudentCreateOverlay);
studentCreateBackBtn.addEventListener('click', function() {
    closeStudentCreateOverlay();
    adminPanel.classList.add('active');
});

studentCreateYear.addEventListener('change', function() {
    populateClassOptions(studentCreateYear.value, studentCreateClass);
});

signupYear.addEventListener('change', function() {
    populateClassOptions(signupYear.value, signupClass);
});

adminToggleBtn.addEventListener('click', function() {
    adminPanel.classList.add('active');
    lockBodyScroll();
    closeAdminBtn.focus();
});

logoutBtn.addEventListener('click', function() {
    showLogin();
});

closeAdminBtn.addEventListener('click', function() {
    adminPanel.classList.remove('active');
    unlockBodyScroll();
    adminToggleBtn.focus();
});

adminPanel.addEventListener('click', function(e) {
    if (e.target === adminPanel) {
        adminPanel.classList.remove('active');
        unlockBodyScroll();
        adminToggleBtn.focus();
    }
});

signupForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    const firstName = document.getElementById('signupFirstName').value.trim();
    const lastName = document.getElementById('signupLastName').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    const yearGroup = signupYear.value;
    const className = signupClass.value;
    const profilePicture = await getSignupProfilePictureData();

    if (!firstName || !lastName || !password || !confirmPassword || !yearGroup || !className) {
        showSignupError('Please fill in every field before creating an account.');
        return;
    }

    if (password !== confirmPassword) {
        showSignupError('Passwords do not match. Please try again.');
        return;
    }

    apiSignup({
        firstName: capitalizeFirstLetter(firstName),
        lastName: capitalizeFirstLetter(lastName),
        password,
        yearGroup,
        className,
        profilePicture
    })
        .then(user => {
            signupForm.reset();
            signupClass.innerHTML = '<option value="">Select class</option>';
            signupProfilePicture.value = '';
            hideSignupError();

            if (appState.signupSource === 'admin' && appState.isAdmin) {
                showPortal();
                showInfo('✅ Student account created successfully.');
            } else {
                loginUser(user);
                showInfo('✅ Account created successfully. You are now logged in.');
            }
        })
        .catch(error => {
            showSignupError(error.message || 'Unable to create account.');
        });
});

studentCreateForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    const firstName = document.getElementById('studentCreateFirstName').value.trim();
    const lastName = document.getElementById('studentCreateLastName').value.trim();
    const password = document.getElementById('studentCreatePassword').value;
    const confirmPassword = document.getElementById('studentCreateConfirmPassword').value;
    const yearGroup = studentCreateYear.value;
    const className = studentCreateClass.value;
    const profilePicture = await getStudentCreateProfilePictureData();

    if (!firstName || !lastName || !password || !confirmPassword || !yearGroup || !className) {
        showStudentCreateError('Please fill in every field before creating an account.');
        return;
    }

    if (password !== confirmPassword) {
        showStudentCreateError('Passwords do not match. Please try again.');
        return;
    }

    apiSignup({
        firstName: capitalizeFirstLetter(firstName),
        lastName: capitalizeFirstLetter(lastName),
        password,
        yearGroup,
        className,
        profilePicture
    })
        .then(() => {
            studentCreateForm.reset();
            studentCreateClass.innerHTML = '<option value="">Select class</option>';
            studentCreateProfilePicture.value = '';
            hideStudentCreateError();
            closeStudentCreateOverlay();
            adminPanel.classList.add('active');
            showInfo('✅ Student account created successfully.');
        })
        .catch(error => {
            showStudentCreateError(error.message || 'Unable to create student account.');
        });
});

function populateClassOptions(yearGroup, targetSelect) {
    targetSelect.innerHTML = '<option value="">Select class</option>';

    if (!YEAR_CLASSES[yearGroup]) {
        return;
    }

    YEAR_CLASSES[yearGroup].forEach(className => {
        const option = document.createElement('option');
        option.value = className;
        option.textContent = className;
        targetSelect.appendChild(option);
    });
}

function showStudentCreateError(message) {
    studentCreateErrorMessage.textContent = message;
    studentCreateErrorMessage.classList.add('show');
}

function hideStudentCreateError() {
    studentCreateErrorMessage.textContent = '';
    studentCreateErrorMessage.classList.remove('show');
}

function showSignupError(message) {
    signupErrorMessage.textContent = message;
    signupErrorMessage.classList.add('show');
}

function hideSignupError() {
    signupErrorMessage.textContent = '';
    signupErrorMessage.classList.remove('show');
}

function showInfo(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    setTimeout(() => {
        hideError();
    }, 5000);
}

// ===================================
// SCREEN NAVIGATION
// ===================================

function showPortal() {
    loginScreen.classList.remove('active');
    signupScreen.classList.remove('active');
    portalScreen.classList.add('active');

    welcomeMessage.textContent = `Welcome back, ${appState.currentUser.firstName} ${appState.currentUser.lastName}!`;
    userDetails.innerHTML = `Class: ${appState.currentUser.yearGroup} - ${appState.currentUser.className}${appState.isAdmin ? ' 🛡️ <span class="admin-badge">Admin Account</span>' : ''}`;

    adminToggleBtn.style.display = appState.isAdmin ? 'inline-block' : 'none';
    renderQuickLinks();
}

function showLogin() {
    portalScreen.classList.remove('active');
    signupScreen.classList.remove('active');
    closeAllOverlays();
    unlockBodyScroll();
    quickLinksList.style.display = 'block';

    appState.isLoggedIn = false;
    appState.currentUser = null;
    appState.isAdmin = false;

    clearSession();
    loginScreen.classList.add('active');
    document.getElementById('firstName').focus();
}

function closeSignup() {
    if (appState.signupSource === 'admin' && appState.isAdmin) {
        showPortal();
    } else {
        showLogin();
    }
}

function showSignup() {
    loginScreen.classList.remove('active');
    portalScreen.classList.remove('active');
    closeAllOverlays();
    unlockBodyScroll();

    signupScreen.classList.add('active');
    hideSignupError();
    signupForm.reset();
    signupYear.value = '';
    signupClass.innerHTML = '<option value="">Select class</option>';
    signupProfilePicture.value = '';
    document.getElementById('signupFirstName').focus();
}

function showStudentCreateOverlay() {
    loginScreen.classList.remove('active');
    portalScreen.classList.remove('active');
    adminPanel.classList.remove('active');
    closeAllOverlays();
    unlockBodyScroll();

    studentCreateOverlay.classList.add('active');
    hideStudentCreateError();
    studentCreateForm.reset();
    studentCreateYear.value = '';
    studentCreateClass.innerHTML = '<option value="">Select class</option>';
    studentCreateProfilePicture.value = '';
    document.getElementById('studentCreateFirstName').focus();
}

function closeStudentCreateOverlay() {
    studentCreateOverlay.classList.remove('active');
    unlockBodyScroll();
    // If the admin opened this overlay, return them to the admin panel.
    if (appState.signupSource === 'admin' && appState.isAdmin) {
        adminPanel.classList.add('active');
        lockBodyScroll();
        closeAdminBtn.focus();
    } else if (!appState.isLoggedIn) {
        // If nobody is logged in, go back to the login screen to avoid a blank page
        showLogin();
    } else {
        // Otherwise show the main portal
        showPortal();
    }
}

// ===================================
// QUICK LINK RENDERING
// ===================================

function renderQuickLinks() {
    // render any active broadcast above quick links
    renderBroadcastBanner();
    quickActions.innerHTML = quickLinks.map(link => {
        return `<a href="${link.url}" target="_blank" rel="noopener noreferrer" class="action-card">
            <span class="card-icon">${link.icon}</span>
            <span class="card-title">${link.name}</span>
        </a>`;
    }).join('');
}

// ===================================
// QUICK LINK EDITOR
// ===================================

document.getElementById('editQuickLinksBtn').addEventListener('click', function() {
    openQuickLinkEditor();
});

closeQuickLinkEditorBtn.addEventListener('click', function() {
    closeQuickLinkEditor();
});

quickLinkEditor.addEventListener('click', function(event) {
    if (event.target === quickLinkEditor) {
        closeQuickLinkEditor();
    }
});

addQuickLinkBtn.addEventListener('click', function() {
    openQuickLinkForm();
});

cancelQuickLinkEditBtn.addEventListener('click', function() {
    closeQuickLinkForm();
});

quickLinkForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const icon = document.getElementById('linkIcon').value.trim() || '🔗';
    const name = document.getElementById('linkName').value.trim();
    const url = document.getElementById('linkUrl').value.trim();

    if (!name || !url) {
        quickLinkFormError.textContent = 'Please provide both a name and a valid URL.';
        quickLinkFormError.classList.add('show');
        return;
    }

    quickLinkFormError.textContent = '';
    quickLinkFormError.classList.remove('show');

    if (appState.editingLinkId) {
        const existing = quickLinks.find(link => link.id === appState.editingLinkId);
        if (existing) {
            existing.icon = icon;
            existing.name = name;
            existing.url = url;
        }
    } else {
        quickLinks.push({
            id: Date.now().toString(),
            icon,
            name,
            url
        });
    }

    saveQuickLinks();
    renderQuickLinks();
    renderQuickLinkMenu();
    closeQuickLinkForm();
});

function openQuickLinkEditor() {
    quickLinkEditor.classList.add('active');
    lockBodyScroll();
    quickLinkFormContainer.style.display = 'none';
    renderQuickLinkMenu();
}

function closeQuickLinkEditor() {
    quickLinkEditor.classList.remove('active');
    unlockBodyScroll();
    appState.editingLinkId = null;
    quickLinkFormContainer.style.display = 'none';
}

function renderQuickLinkMenu() {
    quickLinksList.innerHTML = quickLinks.map(link => {
        return `<div class="quick-link-item" data-id="${link.id}">
            <div class="link-icon">${link.icon}</div>
            <div class="link-details">
                <strong>${link.name}</strong>
                <span>${link.url}</span>
            </div>
            <button type="button" class="btn btn-secondary btn-sm edit-quick-link-btn" data-id="${link.id}">Edit</button>
        </div>`;
    }).join('');

    quickLinksList.querySelectorAll('.edit-quick-link-btn').forEach(button => {
        button.addEventListener('click', function() {
            const linkId = this.getAttribute('data-id');
            openQuickLinkForm(linkId);
        });
    });
}

function openQuickLinkForm(linkId) {
    quickLinksList.style.display = 'none';
    quickLinkFormContainer.style.display = 'block';
    quickLinkFormError.textContent = '';
    quickLinkFormError.classList.remove('show');

    if (linkId) {
        appState.editingLinkId = linkId;
        quickLinkFormTitle.textContent = 'Edit Quick Link';
        const link = quickLinks.find(item => item.id === linkId);
        if (link) {
            document.getElementById('linkIcon').value = link.icon;
            document.getElementById('linkName').value = link.name;
            document.getElementById('linkUrl').value = link.url;
        }
    } else {
        appState.editingLinkId = null;
        quickLinkFormTitle.textContent = 'Add New Quick Link';
        quickLinkForm.reset();
        document.getElementById('linkIcon').value = '🔗';
    }
}

function closeQuickLinkForm() {
    appState.editingLinkId = null;
    quickLinkForm.reset();
    quickLinkFormError.textContent = '';
    quickLinkFormError.classList.remove('show');
    quickLinkFormContainer.style.display = 'none';
    quickLinksList.style.display = 'block';
}

// ===================================
// SETTINGS / PROFILE MANAGEMENT
// ===================================

settingsBtn.addEventListener('click', function() {
    showSettings();
});

closeSettingsBtn.addEventListener('click', function() {
    hideSettings();
});

closeSettingsBottomBtn.addEventListener('click', function() {
    hideSettings();
});

profilePictureUpload.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            profilePicturePreview.textContent = '';
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '50%';
            profilePicturePreview.appendChild(img);
            
            // Save to profile
            const profileData = getProfileData(appState.currentUser.firstName, appState.currentUser.lastName);
            profileData.profilePicture = e.target.result;
            saveProfileData(appState.currentUser.firstName, appState.currentUser.lastName, profileData);
        };
        reader.readAsDataURL(file);
    }
});

clearProfilePictureBtn.addEventListener('click', function() {
    profilePicturePreview.textContent = '👤';
    profilePictureUpload.value = '';
    const profileData = getProfileData(appState.currentUser.firstName, appState.currentUser.lastName);
    profileData.profilePicture = null;
    saveProfileData(appState.currentUser.firstName, appState.currentUser.lastName, profileData);
});

saveUsernameBtn.addEventListener('click', function() {
    const newUsername = usernameInput.value.trim();
    if (!newUsername) {
        alert('Please enter a username');
        return;
    }
    const profileData = getProfileData(appState.currentUser.firstName, appState.currentUser.lastName);
    profileData.username = newUsername;
    saveProfileData(appState.currentUser.firstName, appState.currentUser.lastName, profileData);
    alert('Username saved successfully!');
});

function showSettings() {
    const profileData = getProfileData(appState.currentUser.firstName, appState.currentUser.lastName);
    usernameInput.value = profileData.username || `${appState.currentUser.firstName} ${appState.currentUser.lastName}`;
    
    if (profileData.profilePicture) {
        profilePicturePreview.textContent = '';
        const img = document.createElement('img');
        img.src = profileData.profilePicture;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '50%';
        profilePicturePreview.appendChild(img);
    } else {
        profilePicturePreview.textContent = '👤';
    }
    
    portalScreen.style.display = 'none';
    settingsScreen.classList.add('active');
    settingsScreen.style.display = 'flex';
    lockBodyScroll();
}

function hideSettings() {
    settingsScreen.classList.remove('active');
    settingsScreen.style.display = 'none';
    portalScreen.style.display = 'block';
    usernameInput.value = '';
    profilePictureUpload.value = '';
    unlockBodyScroll();
}

// ===================================
// STUDENT ACCOUNTS MANAGEMENT
// ===================================

viewStudentAccountsBtn.addEventListener('click', function() {
    renderStudentAccountsList();
    studentAccountsOverlay.classList.add('active');
    lockBodyScroll();
});

closeStudentAccountsBtn.addEventListener('click', function() {
    studentAccountsOverlay.classList.remove('active');
    unlockBodyScroll();
});

studentAccountsOverlay.addEventListener('click', function(event) {
    if (event.target === studentAccountsOverlay) {
        studentAccountsOverlay.classList.remove('active');
        unlockBodyScroll();
    }
});

closeStudentDetailsBtn.addEventListener('click', function() {
    studentDetailsOverlay.classList.remove('active');
    renderStudentAccountsList();
    studentAccountsOverlay.classList.add('active');
});

backToStudentListBtn.addEventListener('click', function() {
    studentDetailsOverlay.classList.remove('active');
    renderStudentAccountsList();
    studentAccountsOverlay.classList.add('active');
});

if (makeAdminBtn) {
    makeAdminBtn.addEventListener('click', async function() {
        if (!editingStudentId) return;
        try {
            await apiPromoteStudent(editingStudentId);
            showInfo('✅ Student promoted to admin successfully.');
            await renderStudentAccountsList();
            studentDetailsOverlay.classList.remove('active');
            studentAccountsOverlay.classList.add('active');
        } catch (error) {
            showError(error.message || 'Unable to promote student.');
        }
    });
}

async function renderStudentAccountsList() {
    const accounts = await apiFetchStudentAccounts();
    if (!accounts || accounts.length === 0) {
        studentAccountsList.innerHTML = '<p class="admin-note">No student accounts created yet.</p>';
        return;
    }

    currentStudentAccounts = accounts;
    studentAccountsList.innerHTML = '<div class="student-accounts-table">' + 
        accounts.map((account, i) => {
            return `<div class="student-account-item">
                <div class="student-info">
                    <div class="student-name">${capitalizeFirstLetter(account.first_name)} ${capitalizeFirstLetter(account.last_name)}</div>
                    <div class="student-meta">${account.year_group || 'N/A'} - ${account.class_name || 'N/A'} • ${account.role === 'admin' ? 'Admin' : 'Student'}</div>
                </div>
                <div style="display:flex; gap:10px; flex-wrap:wrap; justify-content:flex-end; width:100%; max-width:340px;">
                    <button class="btn btn-admin-action view-student-btn" data-index="${i}">👁️ View</button>
                    ${account.role !== 'admin' ? `<button class="btn btn-admin" data-promote-id="${account.id}">Make Admin</button>` : '<span class="admin-badge" style="margin-left:8px;">Admin</span>'}
                </div>
            </div>`;
        }).join('') + '</div>';

    document.querySelectorAll('.view-student-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const idx = parseInt(this.getAttribute('data-index'), 10);
            const account = currentStudentAccounts[idx];
            if (!account) return;
            openStudentDetails(account);
        });
    });

    document.querySelectorAll('[data-promote-id]').forEach(btn => {
        btn.addEventListener('click', async function() {
            const id = parseInt(this.getAttribute('data-promote-id'), 10);
            try {
                await apiPromoteStudent(id);
                showInfo('✅ Student promoted to admin successfully.');
                renderStudentAccountsList();
            } catch (error) {
                showError(error.message || 'Unable to promote student.');
            }
        });
    });
}


// ===================================
// GLOBAL ERROR HANDLING
// ===================================

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    errorMessage.setAttribute('aria-live', 'assertive');
    setTimeout(hideError, 5000);
}

function hideError() {
    errorMessage.textContent = '';
    errorMessage.classList.remove('show');
    errorMessage.setAttribute('aria-live', 'polite');
}

// ===================================
// KEYBOARD ACCESSIBILITY
// ===================================

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        if (quickLinkEditor.classList.contains('active')) {
            closeQuickLinkEditor();
        }
        if (adminPanel.classList.contains('active')) {
            adminPanel.classList.remove('active');
            adminToggleBtn.focus();
        }
        if (signupScreen.classList.contains('active')) {
            showLogin();
        }
    }
});

// ===================================
// INITIALIZATION
// ===================================

window.addEventListener('DOMContentLoaded', function() {
    quickLinks = getSavedQuickLinks();
    if (loadSession()) {
        showPortal();
    } else {
        loginScreen.classList.add('active');
        document.getElementById('firstName').focus();
    }
});

// ===================================
// PREVENT FORM RESUBMISSION ON REFRESH
// ===================================

if (window.history.replaceState) {
    window.history.replaceState(null, null, window.location.href);
}

// ===================================
// CONSOLE MESSAGE
// ===================================

console.log('%c🎓 Student Portal Loaded Successfully', 'color: #3498DB; font-size: 16px; font-weight: bold;');
console.log('%c✅ Accessibility Features Enabled', 'color: #27AE60; font-size: 14px;');
console.log('%c🔒 Admin Account: noah / hill / Bruern801', 'color: #9B59B6; font-size: 12px;');
