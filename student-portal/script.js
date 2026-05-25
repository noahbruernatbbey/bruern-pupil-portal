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
const quickLinksList = document.getElementById('quickLinksList');
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
const body = document.body;

// index of student being edited in stored accounts
let editingStudentIndex = null;

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
    studentAccountsOverlay.classList.remove('active');
    studentDetailsOverlay.classList.remove('active');
    settingsScreen.classList.remove('active');
    settingsScreen.style.display = 'none';
    quickLinkFormContainer.style.display = 'none';
    unlockBodyScroll();
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
    studentEditForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const accounts = getStoredAccounts();
        if (editingStudentIndex === null || !accounts[editingStudentIndex]) return;

        const updated = {
            firstName: capitalizeFirstLetter(document.getElementById('detailFirstNameInput').value.trim()),
            lastName: capitalizeFirstLetter(document.getElementById('detailLastNameInput').value.trim()),
            password: document.getElementById('detailPasswordInput').value,
            yearGroup: document.getElementById('detailYearSelect').value,
            className: document.getElementById('detailClassSelect').value,
            role: 'student'
        };

        accounts[editingStudentIndex] = updated;
        saveStoredAccounts(accounts);
        showInfo('✅ Student updated successfully.');
        studentDetailsOverlay.classList.remove('active');
        renderStudentAccountsList();
        studentAccountsOverlay.classList.add('active');
    });
}

if (deleteStudentBtn) {
    deleteStudentBtn.addEventListener('click', function() {
        const accounts = getStoredAccounts();
        if (editingStudentIndex === null || !accounts[editingStudentIndex]) return;
        if (!confirm('Delete this student account? This cannot be undone.')) return;
        accounts.splice(editingStudentIndex, 1);
        saveStoredAccounts(accounts);
        editingStudentIndex = null;
        studentDetailsOverlay.classList.remove('active');
        renderStudentAccountsList();
        studentAccountsOverlay.classList.add('active');
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

    const matchedAccount = getAllAccounts().find(account =>
        account.firstName.toLowerCase() === firstName.toLowerCase() &&
        account.lastName.toLowerCase() === lastName.toLowerCase() &&
        account.password === password
    );

    if (matchedAccount) {
        appState.isLoggedIn = true;
        appState.isAdmin = matchedAccount.role === 'admin';
        appState.currentUser = {
            firstName: capitalizeFirstLetter(matchedAccount.firstName),
            lastName: capitalizeFirstLetter(matchedAccount.lastName),
            yearGroup: matchedAccount.yearGroup,
            className: matchedAccount.className,
            role: matchedAccount.role
        };

        hideError();
        loginForm.reset();
        saveSession();
        showPortal();
    } else {
        showError('❌ Incorrect credentials. Please try again or create an account.');
    }
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
    showSignup();
});
backToLoginBtn.addEventListener('click', showLogin);
closeSignupBtn.addEventListener('click', closeSignup);

signupYear.addEventListener('change', function() {
    populateClassOptions(signupYear.value);
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

signupForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const firstName = document.getElementById('signupFirstName').value.trim();
    const lastName = document.getElementById('signupLastName').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    const yearGroup = signupYear.value;
    const className = signupClass.value;

    if (!firstName || !lastName || !password || !confirmPassword || !yearGroup || !className) {
        showSignupError('Please fill in every field before creating an account.');
        return;
    }

    if (password !== confirmPassword) {
        showSignupError('Passwords do not match. Please try again.');
        return;
    }

    const existing = getAllAccounts().some(account =>
        account.firstName.toLowerCase() === firstName.toLowerCase() &&
        account.lastName.toLowerCase() === lastName.toLowerCase()
    );

    if (existing) {
        showSignupError('An account with that name already exists.');
        return;
    }

    const accounts = getStoredAccounts();
    accounts.push({
        firstName: capitalizeFirstLetter(firstName),
        lastName: capitalizeFirstLetter(lastName),
        password,
        yearGroup,
        className,
        role: 'student'
    });

    saveStoredAccounts(accounts);
    signupForm.reset();
    signupClass.innerHTML = '<option value="">Select class</option>';
    hideSignupError();

    if (appState.signupSource === 'admin' && appState.isAdmin) {
        showPortal();
        showInfo('✅ Student account created successfully.');
    } else {
        showLogin();
        showInfo('✅ Account created successfully. Please log in.');
    }
});

function populateClassOptions(yearGroup) {
    signupClass.innerHTML = '<option value="">Select class</option>';

    if (!YEAR_CLASSES[yearGroup]) {
        return;
    }

    YEAR_CLASSES[yearGroup].forEach(className => {
        const option = document.createElement('option');
        option.value = className;
        option.textContent = className;
        signupClass.appendChild(option);
    });
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
    signupYear.value = '';
    signupClass.innerHTML = '<option value="">Select class</option>';
    document.getElementById('signupFirstName').focus();
}

// ===================================
// QUICK LINK RENDERING
// ===================================

function renderQuickLinks() {
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

function renderStudentAccountsList() {
    const accounts = getStoredAccounts();
    if (accounts.length === 0) {
        studentAccountsList.innerHTML = '<p class="admin-note">No student accounts created yet.</p>';
        return;
    }
    studentAccountsList.innerHTML = '<div class="student-accounts-table">' + 
        accounts.map((account, i) => {
            return `<div class="student-account-item">
                <div class="student-info">
                    <div class="student-name">${capitalizeFirstLetter(account.firstName)} ${capitalizeFirstLetter(account.lastName)}</div>
                    <div class="student-meta">${account.yearGroup || 'N/A'} - ${account.className || 'N/A'}</div>
                </div>
                <button class="btn btn-admin-action view-student-btn" data-index="${i}">👁️ View</button>
            </div>`;
        }).join('') + '</div>';

    document.querySelectorAll('.view-student-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const idx = parseInt(this.getAttribute('data-index'), 10);
            const account = getStoredAccounts()[idx];
            if (!account) return;

            editingStudentIndex = idx;

            document.getElementById('studentDetailsTitle').textContent = `Student: ${capitalizeFirstLetter(account.firstName)} ${capitalizeFirstLetter(account.lastName)}`;
            document.getElementById('detailFirstNameInput').value = account.firstName;
            document.getElementById('detailLastNameInput').value = account.lastName;
            document.getElementById('detailPasswordInput').value = account.password;

            // populate year/class selects
            const yearSelect = document.getElementById('detailYearSelect');
            yearSelect.innerHTML = '';
            Object.keys(YEAR_CLASSES).forEach(y => {
                const opt = document.createElement('option');
                opt.value = y;
                opt.textContent = y;
                yearSelect.appendChild(opt);
            });
            yearSelect.value = account.yearGroup || Object.keys(YEAR_CLASSES)[0];

            populateDetailClassOptions(yearSelect.value);
            document.getElementById('detailClassSelect').value = account.className || document.getElementById('detailClassSelect').value;

            studentAccountsOverlay.classList.remove('active');
            studentDetailsOverlay.classList.add('active');
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
