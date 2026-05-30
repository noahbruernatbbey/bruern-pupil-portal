const YEAR_CLASSES = {
    'Year 8': ['U6 Balliol', 'U6 Exeter', 'U6 Hertford', 'U6 Keble', 'U6 Wadham'],
    'Year 7': ['L6 Blue', 'L6 Bronze', 'L6 Green'],
    'Year 6': ['Kestrels', 'Goshawks', 'Merlins'],
    'Year 5': ['Kites', 'Peregrines'],
    'Year 4': ['Barn Owls']
};

const sessionKey = 'studentPortalSession';
const state = {
    token: null,
    user: null,
    profilePictureData: null,
    studentProfilePictureData: null,
    students: [],
    editingStudent: null,
    announcementTimer: null,
    profileTimer: null
};

const el = id => document.getElementById(id);

const loginScreen = el('loginScreen');
const portalScreen = el('portalScreen');
const loginForm = el('loginForm');
const showPasswordToggle = el('showPasswordToggle');
const errorMessage = el('errorMessage');
const welcomeMessage = el('welcomeMessage');
const userDetails = el('userDetails');
const displayUsername = el('displayUsername');
const lockedNameText = el('lockedNameText');
const dashboardClass = el('dashboardClass');
const dashboardAnnouncement = el('dashboardAnnouncement');
const profileAvatar = el('profileAvatar');
const logoutBtn = el('logoutBtn');
const adminToggleBtn = el('adminToggleBtn');
const adminPanel = el('adminPanel');
const closeAdminBtn = el('closeAdminBtn');
const studentCreateForm = el('studentCreateForm');
const studentFormTitle = el('studentFormTitle');
const studentFormSubmitBtn = el('studentFormSubmitBtn');
const resetStudentPasswordBtn = el('resetStudentPasswordBtn');
const cancelStudentEditBtn = el('cancelStudentEditBtn');
const studentYear = el('studentYear');
const studentClass = el('studentClass');
const studentProfilePicture = el('studentProfilePicture');
const studentProfilePicturePreview = el('studentProfilePicturePreview');
const clearStudentPictureBtn = el('clearStudentPictureBtn');
const studentAccountsList = el('studentAccountsList');
const refreshStudentsBtn = el('refreshStudentsBtn');
const profileBtn = el('profileBtn');
const profilePanel = el('profilePanel');
const closeProfileBtn = el('closeProfileBtn');
const profileForm = el('profileForm');
const profileFirstName = el('profileFirstName');
const profileLastName = el('profileLastName');
const profileUsername = el('profileUsername');
const profilePicturePreview = el('profilePicturePreview');
const profilePictureUpload = el('profilePictureUpload');
const clearProfilePictureBtn = el('clearProfilePictureBtn');
const announcementBanner = el('announcementBanner');
const announcementText = el('announcementText');
const announcementForm = el('announcementForm');
const announcementMessage = el('announcementMessage');
const clearAnnouncementBtn = el('clearAnnouncementBtn');
const announcementHistoryList = el('announcementHistoryList');

function titleCase(value) {
    return String(value || '').trim().replace(/\w\S*/g, word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

function showMessage(message, isError = false) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    errorMessage.style.background = isError ? '#FDEDEC' : '#EAF7EE';
    errorMessage.style.borderColor = isError ? '#E74C3C' : '#27AE60';
    setTimeout(() => errorMessage.classList.remove('show'), 5000);
}

function authHeaders() {
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${state.token}`
    };
}

async function api(path, options = {}) {
    let response;
    try {
        response = await fetch(path, options);
    } catch (error) {
        const openedAsFile = window.location.protocol === 'file:';
        throw new Error(openedAsFile
            ? 'The portal must be opened through Vercel or a local server. Run vercel dev, then open the localhost URL.'
            : 'Could not reach the portal API. Check that the site is deployed correctly and that /api/login is available.');
    }

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
        throw new Error(data?.error || 'Something went wrong');
    }

    return data;
}

function saveSession() {
    localStorage.setItem(sessionKey, JSON.stringify({ token: state.token, user: state.user }));
}

function loadSession() {
    try {
        const session = JSON.parse(localStorage.getItem(sessionKey) || 'null');
        if (!session?.token || !session?.user) return false;
        state.token = session.token;
        state.user = session.user;
        state.profilePictureData = session.user.profile_picture || null;
        return true;
    } catch {
        return false;
    }
}

function clearSession() {
    localStorage.removeItem(sessionKey);
    state.token = null;
    state.user = null;
    state.profilePictureData = null;
}

function renderAvatar(target, imageData) {
    target.textContent = '';
    if (!imageData) {
        target.textContent = '👤';
        return;
    }

    const img = document.createElement('img');
    img.src = imageData;
    img.alt = '';
    target.appendChild(img);
}

function renderPortal() {
    const user = state.user;
    const username = user.username || `${user.first_name} ${user.last_name}`;
    const fullName = `${titleCase(user.first_name)} ${titleCase(user.last_name)}`;

    welcomeMessage.textContent = `Welcome, ${titleCase(username)}`;
    userDetails.textContent = `${user.year_group || ''} ${user.class_name ? '- ' + user.class_name : ''}`;
    displayUsername.textContent = titleCase(username);
    lockedNameText.textContent = `Account name: ${fullName}`;
    dashboardClass.textContent = `${user.year_group || 'No year'}${user.class_name ? ' - ' + user.class_name : ''}`;
    adminToggleBtn.style.display = user.role === 'admin' ? 'inline-block' : 'none';
    profileBtn.style.display = user.id === 'default-admin' ? 'none' : 'inline-block';
    renderAvatar(profileAvatar, user.profile_picture);

    loginScreen.classList.remove('active');
    portalScreen.classList.add('active');
    loadAnnouncement();
    startAnnouncementPolling();
    startProfilePolling();
}

async function refreshCurrentUser(showErrors = false) {
    if (!state.token || !state.user) {
        return;
    }

    try {
        const latestUser = await api('/api/profile', {
            headers: authHeaders()
        });

        state.user = latestUser;
        state.profilePictureData = latestUser.profile_picture || null;
        saveSession();
        renderPortal();
    } catch (error) {
        if (showErrors) {
            showMessage(error.message, true);
        }
    }
}

function startProfilePolling() {
    if (state.profileTimer) {
        return;
    }

    state.profileTimer = window.setInterval(refreshCurrentUser, 15000);
}

function stopProfilePolling() {
    if (!state.profileTimer) {
        return;
    }

    window.clearInterval(state.profileTimer);
    state.profileTimer = null;
}

function renderAnnouncement(announcement) {
    const message = announcement?.message;
    if (!message) {
        announcementBanner.hidden = true;
        announcementText.textContent = '';
        dashboardAnnouncement.textContent = 'No announcement right now.';
        if (announcementMessage) {
            announcementMessage.value = '';
        }
        renderAnnouncementHistory(announcement?.history || []);
        return;
    }

    announcementText.textContent = message;
    dashboardAnnouncement.textContent = message;
    announcementBanner.hidden = false;
    if (announcementMessage && state.user?.role === 'admin') {
        announcementMessage.value = message;
    }
    renderAnnouncementHistory(announcement?.history || []);
}

function renderAnnouncementHistory(history) {
    if (!announcementHistoryList) {
        return;
    }

    if (!history.length) {
        announcementHistoryList.innerHTML = '<p class="admin-note">No announcements posted yet.</p>';
        return;
    }

    announcementHistoryList.innerHTML = history.map(item => `
        <div class="history-item">
            <p>${item.message}</p>
            <span>${new Date(item.created_at).toLocaleString()}</span>
        </div>
    `).join('');
}

async function loadAnnouncement() {
    try {
        const announcement = await api('/api/announcement');
        renderAnnouncement(announcement);
    } catch {
        announcementBanner.hidden = true;
    }
}

function startAnnouncementPolling() {
    if (state.announcementTimer) {
        return;
    }

    state.announcementTimer = window.setInterval(loadAnnouncement, 60000);
}

function stopAnnouncementPolling() {
    if (!state.announcementTimer) {
        return;
    }

    window.clearInterval(state.announcementTimer);
    state.announcementTimer = null;
}

function populateYearAndClass() {
    studentYear.innerHTML = '<option value="">Select year</option>';
    Object.keys(YEAR_CLASSES).forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        studentYear.appendChild(option);
    });
    studentClass.innerHTML = '<option value="">Select class</option>';
}

function resetStudentForm() {
    state.editingStudent = null;
    studentCreateForm.reset();
    populateYearAndClass();
    el('studentPassword').required = true;
    el('studentPassword').placeholder = '';
    studentFormTitle.textContent = 'Create Student Account';
    studentFormSubmitBtn.textContent = 'Create account';
    resetStudentPasswordBtn.hidden = true;
    cancelStudentEditBtn.hidden = true;
    studentProfilePicture.value = '';
    state.studentProfilePictureData = null;
    renderAvatar(studentProfilePicturePreview, null);
}

function startStudentEdit(student) {
    state.editingStudent = student;
    studentFormTitle.textContent = `Edit ${titleCase(student.first_name)} ${titleCase(student.last_name)}`;
    studentFormSubmitBtn.textContent = 'Save changes';
    resetStudentPasswordBtn.hidden = false;
    cancelStudentEditBtn.hidden = false;

    el('studentFirstName').value = titleCase(student.first_name);
    el('studentLastName').value = titleCase(student.last_name);
    el('studentUsername').value = student.username || '';
    el('studentPassword').value = '';
    el('studentPassword').required = false;
    el('studentPassword').placeholder = 'Leave blank to keep current password';
    state.studentProfilePictureData = student.profile_picture || null;
    studentProfilePicture.value = '';
    renderAvatar(studentProfilePicturePreview, state.studentProfilePictureData);

    populateYearAndClass();
    studentYear.value = student.year_group || '';
    populateClasses(studentYear.value);
    studentClass.value = student.class_name || '';
    el('studentFirstName').focus();
}

function populateClasses(year) {
    studentClass.innerHTML = '<option value="">Select class</option>';
    (YEAR_CLASSES[year] || []).forEach(className => {
        const option = document.createElement('option');
        option.value = className;
        option.textContent = className;
        studentClass.appendChild(option);
    });
}

function openPanel(panel) {
    panel.classList.add('active');
    document.body.classList.add('no-scroll');
}

function closePanel(panel) {
    panel.classList.remove('active');
    document.body.classList.remove('no-scroll');
}

async function fileToDataUrl(file) {
    if (!file) return null;
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = event => resolve(event.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function resizeImageFile(file, maxSize = 360, quality = 0.82) {
    if (!file) return null;

    const original = await fileToDataUrl(file);
    const image = new Image();
    image.src = original;
    await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
    });

    const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', quality);
}

async function refreshStudents() {
    studentAccountsList.innerHTML = '<p class="admin-note">Loading accounts...</p>';
    try {
        const students = await api('/api/students', { headers: authHeaders() });
        if (!students.length) {
            studentAccountsList.innerHTML = '<p class="admin-note">No student accounts have been created yet.</p>';
            return;
        }

        state.students = students;
        studentAccountsList.innerHTML = students.map(student => {
            const username = student.username || `${student.first_name} ${student.last_name}`;
            return `
                <div class="student-account-item">
                    <div class="student-info">
                        <div class="student-name">${titleCase(student.first_name)} ${titleCase(student.last_name)}</div>
                        <div class="student-meta">${username} - ${student.year_group} / ${student.class_name} - ${student.role}</div>
                    </div>
                    <div class="student-actions">
                        <button class="btn btn-secondary" data-edit="${student.id}" type="button">Edit</button>
                        ${student.role !== 'admin' ? `<button class="btn btn-admin-action" data-promote="${student.id}" type="button">Make Admin</button>` : '<span class="admin-badge">Admin</span>'}
                        <button class="btn btn-close" data-delete="${student.id}" type="button">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        studentAccountsList.innerHTML = `<p class="admin-note">${error.message}</p>`;
    }
}

loginForm.addEventListener('submit', async event => {
    event.preventDefault();
    const firstName = el('firstName').value;
    const lastName = el('lastName').value;
    const password = el('password').value;

    try {
        const data = await api('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ firstName, lastName, password })
        });
        state.token = data.token;
        state.user = data.user;
        saveSession();
        loginForm.reset();
        renderPortal();
    } catch (error) {
        showMessage(error.message || 'Login failed', true);
    }
});

showPasswordToggle.addEventListener('change', () => {
    el('password').type = showPasswordToggle.checked ? 'text' : 'password';
});

logoutBtn.addEventListener('click', () => {
    clearSession();
    stopAnnouncementPolling();
    stopProfilePolling();
    portalScreen.classList.remove('active');
    loginScreen.classList.add('active');
});

studentYear.addEventListener('change', () => populateClasses(studentYear.value));

adminToggleBtn.addEventListener('click', async () => {
    openPanel(adminPanel);
    resetStudentForm();
    await loadAnnouncement();
    await refreshStudents();
});

closeAdminBtn.addEventListener('click', () => closePanel(adminPanel));
refreshStudentsBtn.addEventListener('click', refreshStudents);

announcementForm.addEventListener('submit', async event => {
    event.preventDefault();

    try {
        const announcement = await api('/api/announcement', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ message: announcementMessage.value })
        });
        renderAnnouncement(announcement);
        showMessage('Announcement posted.');
    } catch (error) {
        showMessage(error.message, true);
    }
});

clearAnnouncementBtn.addEventListener('click', async () => {
    try {
        const announcement = await api('/api/announcement', {
            method: 'DELETE',
            headers: authHeaders()
        });
        renderAnnouncement(announcement);
        showMessage('Announcement cleared.');
    } catch (error) {
        showMessage(error.message, true);
    }
});

studentCreateForm.addEventListener('submit', async event => {
    event.preventDefault();
    const firstName = titleCase(el('studentFirstName').value);
    const lastName = titleCase(el('studentLastName').value);
    const username = el('studentUsername').value.trim() || `${firstName} ${lastName}`;
    const editing = state.editingStudent;
    const password = el('studentPassword').value;
    const payload = {
        firstName,
        lastName,
        username,
        password,
        yearGroup: studentYear.value,
        className: studentClass.value
    };

    if (state.studentProfilePictureData !== undefined) {
        payload.profilePicture = state.studentProfilePictureData;
    }

    if (editing) {
        payload.id = editing.id;
    }

    try {
        await api(editing ? '/api/student' : '/api/signup', {
            method: editing ? 'PUT' : 'POST',
            headers: authHeaders(),
            body: JSON.stringify(payload)
        });
        showMessage(editing ? 'Student account updated.' : 'Student account created.');
        if (editing && String(state.user?.id) === String(editing.id)) {
            await refreshCurrentUser();
        }
        resetStudentForm();
        await refreshStudents();
    } catch (error) {
        showMessage(error.message, true);
    }
});

cancelStudentEditBtn.addEventListener('click', resetStudentForm);

resetStudentPasswordBtn.addEventListener('click', () => {
    if (!state.editingStudent) {
        return;
    }

    const newPassword = prompt('Enter the new password for this student');
    if (!newPassword) {
        return;
    }

    el('studentPassword').value = newPassword;
    showMessage('New password added. Press Save changes to update the account.');
});

studentProfilePicture.addEventListener('change', async event => {
    try {
        state.studentProfilePictureData = await resizeImageFile(event.target.files[0]);
        renderAvatar(studentProfilePicturePreview, state.studentProfilePictureData);
    } catch {
        showMessage('Unable to load that image.', true);
    }
});

clearStudentPictureBtn.addEventListener('click', () => {
    state.studentProfilePictureData = null;
    studentProfilePicture.value = '';
    renderAvatar(studentProfilePicturePreview, null);
});

studentAccountsList.addEventListener('click', async event => {
    const editId = event.target.dataset.edit;
    const promoteId = event.target.dataset.promote;
    const deleteId = event.target.dataset.delete;

    try {
        if (editId) {
            const student = state.students.find(item => String(item.id) === String(editId));
            if (student) {
                startStudentEdit(student);
            }
            return;
        }

        if (promoteId) {
            await api('/api/promote', {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ id: promoteId })
            });
            showMessage('Student promoted to admin.');
            await refreshStudents();
        }

        if (deleteId && confirm('Delete this student account?')) {
            await api('/api/student', {
                method: 'DELETE',
                headers: authHeaders(),
                body: JSON.stringify({ id: deleteId })
            });
            showMessage('Student account deleted.');
            await refreshStudents();
        }
    } catch (error) {
        showMessage(error.message, true);
    }
});

profileBtn.addEventListener('click', () => {
    const user = state.user;
    profileFirstName.value = titleCase(user.first_name);
    profileLastName.value = titleCase(user.last_name);
    profileUsername.value = user.username || `${titleCase(user.first_name)} ${titleCase(user.last_name)}`;
    state.profilePictureData = user.profile_picture || null;
    renderAvatar(profilePicturePreview, state.profilePictureData);
    openPanel(profilePanel);
});

closeProfileBtn.addEventListener('click', () => closePanel(profilePanel));

profilePictureUpload.addEventListener('change', async event => {
    try {
        state.profilePictureData = await resizeImageFile(event.target.files[0]);
        renderAvatar(profilePicturePreview, state.profilePictureData);
    } catch {
        showMessage('Unable to load that image.', true);
    }
});

clearProfilePictureBtn.addEventListener('click', () => {
    state.profilePictureData = null;
    profilePictureUpload.value = '';
    renderAvatar(profilePicturePreview, null);
});

profileForm.addEventListener('submit', async event => {
    event.preventDefault();
    try {
        const updated = await api('/api/profile', {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({
                id: state.user.id,
                username: profileUsername.value,
                profilePicture: state.profilePictureData
            })
        });
        state.user = updated;
        saveSession();
        renderPortal();
        closePanel(profilePanel);
        showMessage('Profile saved.');
    } catch (error) {
        showMessage(error.message, true);
    }
});

document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
        closePanel(adminPanel);
        closePanel(profilePanel);
    }
});

window.addEventListener('DOMContentLoaded', () => {
    populateYearAndClass();
    if (loadSession()) {
        renderPortal();
    }
});
