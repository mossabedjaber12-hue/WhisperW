// ============================================================
// Whisper — a quiet chat app
// v1.2: theme gallery, fixed settings, all buttons working
// ============================================================

const firebaseConfig = {
    apiKey: "AIzaSyB_J_H7sLMSiknI7ukqtYPvd6F9pz0wnkY",
    authDomain: "chatapp-8ecb0.firebaseapp.com",
    databaseURL: "https://chatapp-8ecb0-default-rtdb.firebaseio.com/",
    projectId: "chatapp-8ecb0",
    storageBucket: "chatapp-8ecb0.firebasestorage.app",
    messagingSenderId: "393002965681",
    appId: "1:393002965681:web:fa6ad2bac0850f915090",
    measurementId: "G-BM0XDEMFC3"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();
const usersRef = db.ref('users');
const friendRequestsRef = db.ref('friendRequests');
const friendsRef = db.ref('friends');
const dmsRef = db.ref('dms');
const groupsRef = db.ref('groups');
const presenceRef = db.ref('presence');
const typingRef = db.ref('typing');
const unreadRef = db.ref('unread');
const mutedRef = db.ref('muted');
const pinnedRef = db.ref('pinned');
const draftsRef = db.ref('drafts');
const reactionsRef = db.ref('reactions');
const nicknamesRef = db.ref('nicknames');
const blockedRef = db.ref('blocked');
const reportsRef = db.ref('reports');

// ============================================================
// STATE
// ============================================================
let currentUser = null;
let username = '';
let displayName = '';
let userId = '';
let currentProfile = null;
let currentDmUser = null;
let currentGroup = null;
let friends = [];
let friendsData = {};
let nicknames = {};
let blockedUsers = {};
let pendingRequests = [];
let onlineUsers = {};
let unreadCounts = {};
let userGroups = {};
let groupsData = {};
let mutedChats = {};
let pinnedChats = {};
let lastMessages = {};
let isLoggedIn = false;
let isInitializing = false;
let notifSoundEnabled = true;
let typingEnabled = true;
let dateSeparatorsEnabled = true;
let reactionsEnabled = true;
let enterToSend = true;

let pendingFile = null;
let pendingType = null;
let mediaRecorder = null;
let audioChunks = [];
let recordingTimer = null;
let recordingSeconds = 0;
let isRecording = false;
let recordingTarget = null;

let groupPendingFile = null;
let groupPendingType = null;

let editState = { avatar: '', banner: '' };
let groupEditPhoto = null;
let dmLastMsgs = [];
let groupLastMsgs = [];

let dmReplyTo = null;
let groupReplyTo = null;
let dmEditingId = null;
let groupEditingId = null;

let _lastPresenceHash = '';
let _lastUnreadHash = '';
let _lastRailHash = '';
let _lastFriendsHash = '';
let _lastMutedHash = '';
let _lastPinnedHash = '';
const _lastMsgListeners = {};
let _sendingFriendRequest = false;
let _contextMenuTarget = null;
let _contextMenuType = null;

let dmReactions = {};
let groupReactions = {};
let currentReactionMsgEl = null;

// ============================================================
// DOM
// ============================================================
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

const loginScreen = $('#loginScreen');
const authTitle = $('#authTitle');
const authSubtitle = $('#authSubtitle');
const loginForm = $('#loginForm');
const signupForm = $('#signupForm');
const forgotForm = $('#forgotForm');
const loginEmail = $('#loginEmail');
const loginPassword = $('#loginPassword');
const loginBtn = $('#loginBtn');
const signupEmail = $('#signupEmail');
const signupUsername = $('#signupUsername');
const signupDisplayName = $('#signupDisplayName');
const signupPassword = $('#signupPassword');
const signupConfirm = $('#signupConfirm');
const signupBtn = $('#signupBtn');
const forgotEmail = $('#forgotEmail');
const forgotBtn = $('#forgotBtn');
const authMessage = $('#authMessage');

const chatApp = $('#chatApp');
const navFriends = $('#navFriends');
const pendingBadge = $('#pendingBadge');
const dmList = $('#dmList');
const newGroupBtn = $('#newGroupBtn');
const themeToggle = $('#themeToggle');
const userPanel = $('#userPanel');
const userAvatar = $('#userAvatar');
const usernameDisplay = $('#usernameDisplay');
const userStatus = $('#userStatus');
const settingsBtn = $('#settingsBtn');
const accountMenu = $('#accountMenu');
const accountMenuAvatar = $('#accountMenuAvatar');
const accountMenuDisplayName = $('#accountMenuDisplayName');
const accountMenuUsername = $('#accountMenuUsername');
const logoutBtn = $('#logoutBtn');
const myProfileBtn = $('#myProfileBtn');
const themeMenuItem = $('#themeMenuItem');
const contextMenu = $('#contextMenu');
const chatOptionsMenu = $('#chatOptionsMenu');

const views = $$('.view');
const tabs = $$('.tab');
const tabPanels = $$('.tab-panel');
const onlineRibbon = $('#onlineRibbon');
const allRibbon = $('#allRibbon');
const onlineList = $('#onlineList');
const allList = $('#allList');
const pendingList = $('#pendingList');
const userSearchInput = $('#userSearchInput');
const searchBtn = $('#searchBtn');
const searchResults = $('#searchResults');
const searchResultsList = $('#searchResultsList');
const pendingTabBadge = $('#pendingTabBadge');
const welcomeAddBtn = $('#welcomeAddBtn');

const dmHeaderAvatar = $('#dmHeaderAvatar');
const dmHeaderName = $('#dmHeaderName');
const dmHeaderStatus = $('#dmHeaderStatus');
const dmHeaderClickable = $('#dmHeaderClickable');
const dmMessages = $('#dmMessages');
const dmTyping = $('#dmTyping');
const dmInput = $('#dmInput');
const dmSendBtn = $('#dmSendBtn');
const dmAttachBtn = $('#dmAttachBtn');
const dmMicBtn = $('#dmMicBtn');
const dmAttachMenu = $('#dmAttachMenu');
const dmImageInput = $('#dmImageInput');
const dmFileInput = $('#dmFileInput');
const dmSearchBar = $('#dmSearchBar');
const dmSearchInput = $('#dmSearchInput');
const dmSearchClose = $('#dmSearchClose');
const dmEmojiBtn = $('#dmEmojiBtn');
const dmReplyPreview = $('#dmReplyPreview');
const dmReplyName = $('#dmReplyName');
const dmReplyText = $('#dmReplyText');
const dmReplyCancel = $('#dmReplyCancel');
const dmEditBar = $('#dmEditBar');
const dmEditText = $('#dmEditText');
const dmEditCancel = $('#dmEditCancel');

const groupHeaderName = $('#groupHeaderName');
const groupHeaderMembers = $('#groupHeaderMembers');
const groupHeaderClickable = $('#groupHeaderClickable');
const groupMessages = $('#groupMessages');
const groupInput = $('#groupInput');
const groupSendBtn = $('#groupSendBtn');
const groupAttachBtn = $('#groupAttachBtn');
const groupMicBtn = $('#groupMicBtn');
const groupAttachMenu = $('#groupAttachMenu');
const groupImageInput = $('#groupImageInput');
const groupFileInput = $('#groupFileInput');
const groupSearchBar = $('#groupSearchBar');
const groupSearchInput = $('#groupSearchInput');
const groupSearchClose = $('#groupSearchClose');
const groupEmojiBtn = $('#groupEmojiBtn');
const groupReplyPreview = $('#groupReplyPreview');
const groupReplyName = $('#groupReplyName');
const groupReplyText = $('#groupReplyText');
const groupReplyCancel = $('#groupReplyCancel');
const groupEditBar = $('#groupEditBar');
const groupEditText = $('#groupEditText');
const groupEditCancel = $('#groupEditCancel');

const uploadPreview = $('#uploadPreview');
const previewContent = $('#previewContent');
const previewRemove = $('#previewRemove');
const recordingIndicator = $('#recordingIndicator');
const recTime = $('#recTime');
const recCancel = $('#recCancel');
const recSend = $('#recSend');
const groupUploadPreview = $('#groupUploadPreview');
const groupPreviewContent = $('#groupPreviewContent');
const groupPreviewRemove = $('#groupPreviewRemove');
const groupRecordingIndicator = $('#groupRecordingIndicator');
const groupRecTime = $('#groupRecTime');
const groupRecCancel = $('#groupRecCancel');
const groupRecSend = $('#groupRecSend');

const profileViewModal = $('#profileViewModal');
const editProfileModal = $('#editProfileModal');
const editAvatar = $('#editAvatar');
const editBanner = $('#editBanner');
const editDisplayNameInput = $('#editDisplayNameInput');
const editUsernameInput = $('#editUsernameInput');
const editBioInput = $('#editBioInput');
const bioCount = $('#bioCount');
const usernameChangeHint = $('#usernameChangeHint');
const avatarInput = $('#avatarInput');
const bannerInput = $('#bannerInput');

const settingsModal = $('#settingsModal');
const newGroupModal = $('#newGroupModal');
const groupPicker = $('#groupPicker');
const groupNameInput = $('#groupNameInput');
const groupMembersModal = $('#groupMembersModal');
const groupMembersList = $('#groupMembersList');
const groupMembersCount = $('#groupMembersCount');
const addMembersModal = $('#addMembersModal');
const addMembersPicker = $('#addMembersPicker');
const groupSettingsModal = $('#groupSettingsModal');
const themeGalleryModal = $('#themeGalleryModal');
const nicknameModal = $('#nicknameModal');

const lightbox = $('#lightbox');
const lightboxImg = $('#lightboxImg');
const toastContainer = $('#toastContainer');

const emojiPicker = $('#emojiPicker');
const emojiGrid = $('#emojiGrid');
const reactionPicker = $('#reactionPicker');

const chatProfileAvatar = $('#chatProfileAvatar');
const chatProfileName = $('#chatProfileName');
const chatProfileStatus = $('#chatProfileStatus');
const cpNicknameValue = $('#cpNicknameValue');
const cpThemeValue = $('#cpThemeValue');

// ============================================================
// UTILS
// ============================================================
const AVATAR_COLORS = [
    '#4a8b7a', '#3d7a68', '#5c9b86', '#2f6b5c',
    '#4a7a8b', '#3d6a7a', '#5c8a9b', '#2f5b6b',
    '#7a4a8b', '#6b3d7a', '#8b5c9b', '#5b2f6b'
];

function getColor(name) {
    let hash = 0;
    const str = name || '?';
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitial(name) {
    if (!name) return '?';
    const arr = Array.from(name);
    return arr[0] ? arr[0].toUpperCase() : '?';
}

function escapeHtml(t) {
    const d = document.createElement('div');
    d.textContent = t == null ? '' : String(t);
    return d.innerHTML;
}

function displayNameFor(uid, fallback) {
    if (nicknames[uid]) return nicknames[uid];
    return fallback || 'Unknown';
}

function formatTime(ts) {
    const d = new Date(ts);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function formatDuration(s) {
    const m = Math.floor(s / 60);
    return `${m}:${String(s % 60).padStart(2, '0')}`;
}

function formatBytes(b) {
    if (b < 1024) return b + ' B';
    if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
    return (b / 1048576).toFixed(1) + ' MB';
}

function dmKey(a, b) { return [a, b].sort().join('_'); }

function timeAgo(ts) {
    const diff = Date.now() - ts;
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${d}d ago`;
}

function dateLabel(ts) {
    const d = new Date(ts);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function dayKey(ts) {
    const d = new Date(ts);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function shortTime(ts) {
    if (!ts || typeof ts !== 'number' || !isFinite(ts) || isNaN(ts)) return '';
    const d = new Date(ts);
    if (isNaN(d.getTime())) return '';
    const diff = Date.now() - ts;
    if (diff < 0) return formatTime(ts);
    if (diff < 86400000) return formatTime(ts);
    if (diff < 7 * 86400000) return d.toLocaleDateString(undefined, { weekday: 'short' });
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function statusLabel(uid) {
    const p = onlineUsers[uid];
    if (!p || !p.online) {
        if (p && p.lastSeen) return `Active ${timeAgo(p.lastSeen)}`;
        return 'Offline';
    }
    return 'Online';
}

function isUserOnline(uid) {
    return !!(onlineUsers[uid] && onlineUsers[uid].online);
}

function isChatMuted(key) { return !!mutedChats[key]; }
function isChatPinned(key) { return !!pinnedChats[key]; }

function generateWaveBars() {
    let html = '';
    for (let i = 0; i < 28; i++) {
        const h = 4 + Math.round(Math.random() * 16);
        html += `<div class="voice-bar" style="height:${h}px;"></div>`;
    }
    return html;
}

function previewText(msg) {
    if (!msg) return '';
    if (msg.type === 'image') return '📷 Photo';
    if (msg.type === 'file') return '📎 ' + (msg.fileName || 'File');
    if (msg.type === 'voice') return '🎤 Voice message';
    return msg.text || '';
}

// ============================================================
// TOASTS
// ============================================================
function showToast(title, message) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = `
        <div class="toast-icon"><i class="fas fa-bell"></i></div>
        <div>
            <div class="toast-title">${escapeHtml(title)}</div>
            <div class="toast-message">${escapeHtml(message)}</div>
        </div>
    `;
    toastContainer.appendChild(t);
    setTimeout(() => {
        t.style.opacity = '0';
        setTimeout(() => t.remove(), 300);
    }, 4000);
}

function playNotifSound() {
    if (!notifSoundEnabled) return;
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 660;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
    } catch (e) {}
}

// ============================================================
// CUSTOM MODAL
// ============================================================
function showModal(opts) {
    return new Promise(resolve => {
        const overlay = document.getElementById('customModal');
        const box = document.getElementById('customModalBox');
        if (!overlay || !box) { resolve(window.confirm(opts.title || 'Are you sure?')); return; }

        const iconHtml = opts.icon
            ? `<div class="custom-modal-icon ${opts.danger ? 'danger' : ''}"><i class="${opts.icon}"></i></div>`
            : '';
        const inputHtml = opts.input
            ? `<input class="custom-modal-input" id="customModalInput" type="text" placeholder="${escapeHtml(opts.inputPlaceholder || '')}" value="${escapeHtml(opts.inputValue || '')}" />`
            : '';
        const confirmClass = opts.danger ? 'custom-modal-btn danger' : 'custom-modal-btn primary';
        const confirmText = opts.confirmText || 'OK';
        const cancelText = opts.cancelText || 'Cancel';
        const cancelHtml = opts.hideCancel ? '' : `<button class="custom-modal-btn secondary" id="customModalCancel">${cancelText}</button>`;

        box.innerHTML = `
            ${iconHtml}
            <div class="custom-modal-title">${escapeHtml(opts.title || 'Are you sure?')}</div>
            ${opts.text ? `<div class="custom-modal-text">${opts.text}</div>` : ''}
            ${inputHtml}
            <div class="custom-modal-actions">
                ${cancelHtml}
                <button class="${confirmClass}" id="customModalConfirm">${escapeHtml(confirmText)}</button>
            </div>
        `;

        overlay.classList.add('open');
        const input = document.getElementById('customModalInput');
        if (input) setTimeout(() => input.focus(), 100);

        const cleanup = () => {
            overlay.classList.remove('open');
            box.innerHTML = '';
        };

        document.getElementById('customModalConfirm').onclick = () => {
            const val = input ? input.value.trim() : true;
            cleanup();
            resolve(val);
        };

        const cancelBtn = document.getElementById('customModalCancel');
        if (cancelBtn) cancelBtn.onclick = () => { cleanup(); resolve(false); };

        overlay.onclick = e => {
            if (e.target === overlay) { cleanup(); resolve(false); }
        };

        if (input) {
            input.addEventListener('keydown', e => {
                if (e.key === 'Enter') {
                    const val = input.value.trim();
                    cleanup();
                    resolve(val);
                }
            });
        }
    });
}

// ============================================================
// THEME (global light/dark)
// ============================================================
function applyTheme(theme) {
    document.body.classList.toggle('theme-dark', theme === 'dark');
    localStorage.setItem('whisper_theme', theme);
    if (themeToggle) {
        themeToggle.innerHTML = theme === 'dark'
            ? '<i class="fas fa-sun"></i>'
            : '<i class="fas fa-moon"></i>';
    }
    if (themeMenuItem) {
        themeMenuItem.innerHTML = theme === 'dark'
            ? '<i class="fas fa-sun"></i><span>Light Mode</span>'
            : '<i class="fas fa-moon"></i><span>Dark Mode</span>';
    }
    const themeLabel = $('#themeValueLabel');
    if (themeLabel) themeLabel.textContent = theme === 'dark' ? 'Dark' : 'Light';
}

function toggleTheme() {
    const isDark = document.body.classList.contains('theme-dark');
    applyTheme(isDark ? 'light' : 'dark');
}

if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
if (themeMenuItem) themeMenuItem.addEventListener('click', () => {
    accountMenu.classList.remove('open');
    toggleTheme();
});

(function initTheme() {
    const saved = localStorage.getItem('whisper_theme');
    applyTheme(saved === 'dark' ? 'dark' : 'light');
})();

// ============================================================
// AUTH
// ============================================================
function showAuthMessage(text, type = 'info') {
    authMessage.textContent = text;
    authMessage.className = `auth-message ${type}`;
    authMessage.style.display = 'block';
    if (type !== 'error') setTimeout(() => authMessage.style.display = 'none', 6000);
}
function clearAuthMessage() {
    authMessage.textContent = '';
    authMessage.className = 'auth-message';
    authMessage.style.display = 'none';
}
function showLoginForm() {
    authTitle.textContent = 'Whisper';
    authSubtitle.textContent = 'A quiet place to talk.';
    loginForm.style.display = 'flex';
    signupForm.style.display = 'none';
    forgotForm.style.display = 'none';
    clearAuthMessage();
}
function showSignupForm() {
    authTitle.textContent = 'Create Account';
    authSubtitle.textContent = 'Takes just a moment.';
    loginForm.style.display = 'none';
    signupForm.style.display = 'flex';
    forgotForm.style.display = 'none';
    clearAuthMessage();
}
function showForgotForm() {
    authTitle.textContent = 'Reset Password';
    authSubtitle.textContent = 'We\'ll send you a reset link.';
    loginForm.style.display = 'none';
    signupForm.style.display = 'none';
    forgotForm.style.display = 'flex';
    clearAuthMessage();
}

$('#toSignupLink').addEventListener('click', e => { e.preventDefault(); showSignupForm(); });
$('#toLoginLink').addEventListener('click', e => { e.preventDefault(); showLoginForm(); });
$('#forgotLink').addEventListener('click', e => { e.preventDefault(); showForgotForm(); });
$('#backToLoginLink').addEventListener('click', e => { e.preventDefault(); showLoginForm(); });

signupBtn.addEventListener('click', async () => {
    clearAuthMessage();
    const email = signupEmail.value.trim();
    const uname = signupUsername.value.trim().toLowerCase();
    const dname = signupDisplayName.value.trim();
    const pass = signupPassword.value;
    const confirm = signupConfirm.value;

    if (!email) return showAuthMessage('Please enter your email.', 'error');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showAuthMessage('Email is not valid.', 'error');
    if (!uname) return showAuthMessage('Please enter a username.', 'error');
    if (uname.length < 3) return showAuthMessage('Username must be at least 3 characters.', 'error');
    if (uname.length > 14) return showAuthMessage('Username must be 14 characters or less.', 'error');
    if (!/^[a-z0-9_]+$/.test(uname)) return showAuthMessage('Username: lowercase letters, numbers, underscores only.', 'error');
    if (!dname) return showAuthMessage('Please enter a display name.', 'error');
    if (dname.length > 20) return showAuthMessage('Display name must be 20 characters or less.', 'error');
    if (!pass) return showAuthMessage('Please enter a password.', 'error');
    if (pass.length < 6) return showAuthMessage('Password must be at least 6 characters.', 'error');
    if (pass !== confirm) return showAuthMessage('Passwords do not match.', 'error');

    signupBtn.disabled = true;
    signupBtn.textContent = 'Creating...';

    try {
        const snap = await usersRef.child('usernames').child(uname).once('value');
        if (snap.exists()) throw new Error('USERNAME_TAKEN');

        const cred = await auth.createUserWithEmailAndPassword(email, pass);
        const user = cred.user;

        await new Promise(resolve => {
            let done = false;
            const finish = () => { if (!done) { done = true; resolve(); } };
            const unsub = auth.onAuthStateChanged(u => {
                if (u && u.uid === user.uid) { unsub(); finish(); }
            });
            setTimeout(finish, 3000);
        });
        await new Promise(r => setTimeout(r, 200));

        await usersRef.child('usernames').child(uname).set(user.uid);
        await usersRef.child(user.uid).set({
            uid: user.uid, email, username: uname, displayName: dname,
            usernameChangedAt: Date.now(),
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            avatar: '', banner: '', bio: ''
        });
    } catch (err) {
        console.error('=== SIGNUP ERROR ===', err.code, err.message);
        let msg = 'Failed to create account.';
        if (err.code === 'auth/email-already-in-use') msg = 'That email is already registered.';
        else if (err.code === 'auth/invalid-email') msg = 'That email is not valid.';
        else if (err.code === 'auth/weak-password') msg = 'Password is too weak.';
        else if (err.message === 'USERNAME_TAKEN') msg = 'That username is already taken.';
        showAuthMessage(msg, 'error');
    } finally {
        signupBtn.disabled = false;
        signupBtn.textContent = 'Create Account';
    }
});

loginBtn.addEventListener('click', async () => {
    clearAuthMessage();
    const email = loginEmail.value.trim();
    const pass = loginPassword.value;
    if (!email) return showAuthMessage('Please enter your email.', 'error');
    if (!pass) return showAuthMessage('Please enter your password.', 'error');
    loginBtn.disabled = true;
    loginBtn.textContent = 'Logging in...';
    try {
        await auth.signInWithEmailAndPassword(email, pass);
    } catch (err) {
        let msg = 'Failed to log in.';
        if (err.code === 'auth/user-not-found') msg = 'No account with that email.';
        else if (err.code === 'auth/wrong-password') msg = 'Incorrect password.';
        else if (err.code === 'auth/invalid-credential') msg = 'Email or password is incorrect.';
        else if (err.code === 'auth/too-many-requests') msg = 'Too many attempts. Try again later.';
        showAuthMessage(msg, 'error');
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Log In';
    }
});

loginPassword.addEventListener('keydown', e => { if (e.key === 'Enter') loginBtn.click(); });
signupConfirm.addEventListener('keydown', e => { if (e.key === 'Enter') signupBtn.click(); });

forgotBtn.addEventListener('click', async () => {
    clearAuthMessage();
    const email = forgotEmail.value.trim();
    if (!email) return showAuthMessage('Please enter your email.', 'error');
    forgotBtn.disabled = true;
    forgotBtn.textContent = 'Sending...';
    try {
        await auth.sendPasswordResetEmail(email);
        showAuthMessage('Reset link sent. Check your inbox.', 'success');
        setTimeout(() => showLoginForm(), 3000);
    } catch (err) {
        showAuthMessage('Failed to send reset link.', 'error');
    } finally {
        forgotBtn.disabled = false;
        forgotBtn.textContent = 'Send Reset Link';
    }
});

auth.onAuthStateChanged(async user => {
    if (isInitializing) return;
    if (user) {
        if (isLoggedIn && currentUser && currentUser.uid === user.uid) return;
        isInitializing = true;
        try {
            currentUser = user;
            userId = user.uid;
            await handleLogin(user);
            isLoggedIn = true;
        } finally {
            isInitializing = false;
        }
    } else {
        if (!isLoggedIn && !currentUser) return;
        isInitializing = true;
        try {
            handleLogout();
            isLoggedIn = false;
        } finally {
            isInitializing = false;
        }
    }
});

async function handleLogin(user) {
    try {
        const snap = await usersRef.child(user.uid).once('value');
        const data = snap.val();

        if (data) {
            username = data.username || user.email.split('@')[0].toLowerCase();
            displayName = data.displayName || data.username || username;
            if (!data.displayName) await usersRef.child(user.uid).update({ displayName });
            currentProfile = {
                username, displayName,
                bio: data.bio || '', avatar: data.avatar || '', banner: data.banner || '',
                joined: data.createdAt || Date.now(),
                usernameChangedAt: data.usernameChangedAt || 0
            };
        } else {
            username = user.email.split('@')[0].toLowerCase();
            displayName = username;
            currentProfile = {
                username, displayName, bio: '', avatar: '', banner: '',
                joined: Date.now(), usernameChangedAt: 0
            };
            await usersRef.child(user.uid).set({
                uid: user.uid, email: user.email, username, displayName,
                createdAt: firebase.database.ServerValue.TIMESTAMP,
                usernameChangedAt: Date.now(),
                avatar: '', banner: '', bio: ''
            });
        }

        updateUserBadge();
        updateSettingsUser();

        document.body.classList.add('logged-in');
        loginScreen.classList.add('hidden');
        chatApp.style.display = 'grid';

        setPresence(true);
        listenMuted();
        listenPinned();
        listenNicknames();
        listenBlocked();
        listenFriends();
        listenFriendRequests();
        listenPresence();
        listenUnread();
        listenGroups();
        listenSelfProfile();

        switchView('friends');
    } catch (err) {
        console.error('[Auth] Login error:', err);
        await auth.signOut();
    }
}

function handleLogout() {
    setPresence(false);
    currentUser = null; username = ''; displayName = ''; userId = '';
    currentProfile = null; currentDmUser = null; currentGroup = null;
    friends = []; friendsData = {}; unreadCounts = {}; userGroups = {};
    groupsData = {}; mutedChats = {}; pinnedChats = {}; lastMessages = {};
    nicknames = {}; blockedUsers = {};
    dmReplyTo = null; groupReplyTo = null;
    dmEditingId = null; groupEditingId = null;
    dmReactions = {}; groupReactions = {};
    _lastPresenceHash = ''; _lastUnreadHash = ''; _lastRailHash = '';
    _lastFriendsHash = ''; _lastMutedHash = ''; _lastPinnedHash = '';
    _contextMenuTarget = null; _contextMenuType = null;
    Object.keys(_lastMsgListeners).forEach(k => {
        try { _lastMsgListeners[k].ref.off('child_added', _lastMsgListeners[k].cb); } catch (e) {}
        try { _lastMsgListeners[k].ref.off('child_changed', _lastMsgListeners[k].cb); } catch (e) {}
        delete _lastMsgListeners[k];
    });
    chatApp.style.display = 'none';
    loginScreen.classList.remove('hidden');
    document.body.classList.remove('logged-in');
    showLoginForm();
}

function setPresence(online) {
    if (!userId) return;
    const ref = presenceRef.child(userId);
    if (online) {
        ref.set({
            online: true,
            lastSeen: firebase.database.ServerValue.TIMESTAMP
        }).catch(() => {});
        ref.onDisconnect().set({
            online: false,
            lastSeen: firebase.database.ServerValue.TIMESTAMP
        });
    } else {
        ref.set({
            online: false,
            lastSeen: firebase.database.ServerValue.TIMESTAMP
        }).catch(() => {});
    }
}

// ============================================================
// USER BADGE
// ============================================================
function updateUserBadge() {
    const bg = `linear-gradient(135deg, ${getColor(displayName)}, ${getColor(displayName)}cc)`;
    if (currentProfile?.avatar) {
        userAvatar.style.backgroundImage = `url('${currentProfile.avatar}')`;
        userAvatar.style.backgroundSize = 'cover';
        userAvatar.style.backgroundPosition = 'center';
        userAvatar.textContent = '';
        accountMenuAvatar.style.backgroundImage = `url('${currentProfile.avatar}')`;
        accountMenuAvatar.style.backgroundSize = 'cover';
        accountMenuAvatar.style.backgroundPosition = 'center';
        accountMenuAvatar.textContent = '';
    } else {
        userAvatar.style.backgroundImage = '';
        userAvatar.style.background = bg;
        userAvatar.textContent = getInitial(displayName);
        accountMenuAvatar.style.backgroundImage = '';
        accountMenuAvatar.style.background = bg;
        accountMenuAvatar.textContent = getInitial(displayName);
    }
    usernameDisplay.textContent = displayName;
    accountMenuDisplayName.textContent = displayName;
    accountMenuUsername.textContent = '@' + username;
    userStatus.textContent = 'Online';
}

function updateSettingsUser() {
    const a = $('#settingsUserAvatar');
    if (currentProfile?.avatar) {
        a.style.backgroundImage = `url('${currentProfile.avatar}')`;
        a.style.backgroundSize = 'cover';
        a.style.backgroundPosition = 'center';
        a.textContent = '';
    } else {
        const bg = `linear-gradient(135deg, ${getColor(displayName)}, ${getColor(displayName)}cc)`;
        a.style.backgroundImage = '';
        a.style.background = bg;
        a.textContent = getInitial(displayName);
    }
    $('#settingsUserName').textContent = displayName;
    $('#settingsUserUsername').textContent = '@' + username;
    $('#infoDisplayName').textContent = displayName;
    $('#infoUsername').textContent = '@' + username;
    $('#infoEmail').textContent = currentUser?.email || '';
    $('#infoBio').textContent = currentProfile?.bio || 'No bio yet';
}

// ============================================================
// VIEW SWITCHING
// ============================================================
function switchView(name) {
    views.forEach(v => v.classList.toggle('active', v.dataset.view === name));
    navFriends.classList.toggle('active', name === 'friends');
    $$('.dm-item').forEach(el => el.classList.toggle('active',
        (el.dataset.uid === currentDmUser?.uid) || (el.dataset.gid === currentGroup?.id)
    ));
}

navFriends.addEventListener('click', () => switchView('friends'));
welcomeAddBtn.addEventListener('click', () => {
    switchView('friends');
    const t = document.querySelector('.tab[data-tab="add"]');
    if (t) t.click();
});

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(x => x.classList.toggle('active', x === tab));
        tabPanels.forEach(p => p.classList.toggle('active', p.dataset.panel === tab.dataset.tab));
        if (tab.dataset.tab === 'add') setTimeout(() => userSearchInput.focus(), 100);
    });
});

// ============================================================
// ACCOUNT MENU
// ============================================================
userPanel.addEventListener('click', e => {
    if (e.target.closest('#settingsBtn')) return;
    e.stopPropagation();
    accountMenu.classList.toggle('open');
});

// Close floating menus when clicking outside
document.addEventListener('click', e => {
    if (!e.target.closest('.emoji-picker') && !e.target.closest('#dmEmojiBtn') && !e.target.closest('#groupEmojiBtn')) {
        emojiPicker.classList.remove('open');
    }
    if (!e.target.closest('.reaction-picker') && !e.target.closest('[data-msg-action="react"]')) {
        reactionPicker.classList.remove('open');
    }
    if (!e.target.closest('#accountMenu') && !e.target.closest('#userPanel')) {
        accountMenu.classList.remove('open');
    }
    if (!e.target.closest('#contextMenu')) contextMenu.classList.remove('open');
    if (!e.target.closest('#chatOptionsMenu') && !e.target.closest('#cpActionOptions')) chatOptionsMenu.classList.remove('open');
});

accountMenu.addEventListener('click', e => e.stopPropagation());

settingsBtn.addEventListener('click', e => {
    e.stopPropagation();
    accountMenu.classList.remove('open');
    openSettings('account');
});

// ============================================================
// DRAFTS
// ============================================================
let _draftTimer = null;

function setupDraftAutosave(inputEl, keyFn) {
    inputEl.addEventListener('input', () => {
        clearTimeout(_draftTimer);
        _draftTimer = setTimeout(async () => {
            const key = keyFn();
            if (!key || !userId) return;
            const val = inputEl.value;
            if (val) await draftsRef.child(userId).child(key).set(val);
            else await draftsRef.child(userId).child(key).remove();
        }, 500);
    });
}

async function loadDraft(key, inputEl) {
    if (!key || !userId) return;
    try {
        const snap = await draftsRef.child(userId).child(key).once('value');
        const val = snap.val();
        if (val) inputEl.value = val;
    } catch (e) {}
}

async function clearDraft(key) {
    if (!key || !userId) return;
    try { await draftsRef.child(userId).child(key).remove(); } catch (e) {}
}

// ============================================================
// LISTENERS
// ============================================================
function listenPresence() {
    presenceRef.on('value', snap => {
        onlineUsers = snap.val() || {};
        const hash = Object.keys(onlineUsers).sort().map(k => {
            const p = onlineUsers[k];
            return `${k}:${p.online ? 1 : 0}:${p.lastSeen || 0}`;
        }).join('|');
        if (hash === _lastPresenceHash) return;
        _lastPresenceHash = hash;
        renderAllFriends();
        renderRailDms();
        if (currentDmUser) updateDmHeader();
    });
    setInterval(() => {
        renderAllFriends();
        if (currentDmUser) {
            updateDmHeader();
            updateChatProfileStatus();
        }
    }, 60000);
}

function listenUnread() {
    unreadRef.child(userId).on('value', snap => {
        unreadCounts = snap.val() || {};
        const hash = JSON.stringify(unreadCounts);
        if (hash === _lastUnreadHash) return;
        _lastUnreadHash = hash;
        renderRailDms();
    });
}

function listenMuted() {
    mutedRef.child(userId).on('value', snap => {
        mutedChats = snap.val() || {};
        const hash = JSON.stringify(mutedChats);
        if (hash === _lastMutedHash) return;
        _lastMutedHash = hash;
        _lastRailHash = '';
        renderRailDms();
    });
}

function listenPinned() {
    pinnedRef.child(userId).on('value', snap => {
        pinnedChats = snap.val() || {};
        const hash = JSON.stringify(pinnedChats);
        if (hash === _lastPinnedHash) return;
        _lastPinnedHash = hash;
        _lastRailHash = '';
        renderRailDms();
    });
}

function listenNicknames() {
    nicknamesRef.child(userId).on('value', snap => {
        nicknames = snap.val() || {};
        _lastRailHash = '';
        renderRailDms();
        renderAllFriends();
        if (currentDmUser) updateDmHeader();
    });
}

function listenBlocked() {
    blockedRef.child(userId).on('value', snap => {
        blockedUsers = snap.val() || {};
        renderBlockedList();
    });
}

function listenGroups() {
    groupsRef.orderByChild('members/' + userId).equalTo(true).on('value', async snap => {
        const data = snap.val() || {};
        userGroups = data;
        groupsData = {};
        Object.keys(data).forEach(gid => { groupsData[gid] = data[gid]; });
        _lastRailHash = '';
        renderRailDms();
        listenLastMessages();
        if (currentGroup && data[currentGroup.id]) {
            currentGroup = { id: currentGroup.id, ...data[currentGroup.id] };
            updateGroupHeader();
        }
    });
}

const _friendProfileListeners = {};
function listenFriendProfiles() {
    Object.keys(_friendProfileListeners).forEach(uid => {
        if (!friends.includes(uid)) {
            try { usersRef.child(uid).off('value', _friendProfileListeners[uid]); } catch (e) {}
            delete _friendProfileListeners[uid];
        }
    });
    friends.forEach(uid => {
        if (_friendProfileListeners[uid]) return;
        const handler = snap => {
            const data = snap.val();
            if (!data) return;
            const prev = friendsData[uid];
            if (prev && JSON.stringify(prev) === JSON.stringify(data)) return;
            friendsData[uid] = data;
            renderAllFriends();
            _lastRailHash = '';
            renderRailDms();
            if (currentDmUser?.uid === uid) updateDmHeader();
        };
        _friendProfileListeners[uid] = handler;
        usersRef.child(uid).on('value', handler);
    });
}

function listenSelfProfile() {
    usersRef.child(userId).on('value', snap => {
        const data = snap.val();
        if (!data) return;
        const changed =
            data.avatar !== currentProfile?.avatar ||
            data.displayName !== currentProfile?.displayName ||
            data.banner !== currentProfile?.banner ||
            data.bio !== currentProfile?.bio;
        if (!changed) return;

        currentProfile = {
            ...(currentProfile || {}),
            username: data.username || currentProfile?.username,
            displayName: data.displayName || currentProfile?.displayName,
            bio: data.bio || '', avatar: data.avatar || '', banner: data.banner || ''
        };
        displayName = currentProfile.displayName;
        username = currentProfile.username;

        updateUserBadge();
        updateSettingsUser();
    });
}

function listenLastMessages() {
    friends.forEach(uid => {
        const key = dmKey(userId, uid);
        const listenKey = 'dm_' + key;
        if (_lastMsgListeners[listenKey]) return;
        const ref = dmsRef.child(key).child('messages').limitToLast(1);
        const cb = snap => {
            snap.forEach(child => {
                const m = child.val() || {};
                if (!m.timestamp || typeof m.timestamp !== 'number') return;
                if (m.type === 'image' || m.type === 'voice' || m.type === 'file') delete m.data;
                lastMessages[listenKey] = m;
            });
            _lastRailHash = '';
            renderRailDms();
        };
        ref.on('child_added', cb);
        ref.on('child_changed', cb);
        _lastMsgListeners[listenKey] = { ref, cb };
    });

    Object.keys(userGroups).forEach(gid => {
        const listenKey = 'group_' + gid;
        if (_lastMsgListeners[listenKey]) return;
        const ref = groupsRef.child(gid).child('messages').limitToLast(1);
        const cb = snap => {
            snap.forEach(child => {
                const m = child.val() || {};
                if (!m.timestamp || typeof m.timestamp !== 'number') return;
                if (m.type === 'image' || m.type === 'voice' || m.type === 'file') delete m.data;
                lastMessages[listenKey] = m;
            });
            _lastRailHash = '';
            renderRailDms();
        };
        ref.on('child_added', cb);
        ref.on('child_changed', cb);
        _lastMsgListeners[listenKey] = { ref, cb };
    });
}

// ============================================================
// FRIENDS
// ============================================================
function listenFriends() {
    friendsRef.child(userId).on('value', async snap => {
        const data = snap.val() || {};
        const newFriends = Object.keys(data);
        const hash = newFriends.sort().join(',');
        if (hash === _lastFriendsHash) return;
        _lastFriendsHash = hash;

        const toFetch = newFriends.filter(uid => !friendsData[uid]);
        friends = newFriends;
        Object.keys(friendsData).forEach(uid => {
            if (!newFriends.includes(uid)) delete friendsData[uid];
        });

        if (toFetch.length > 0) {
            const results = await Promise.all(
                toFetch.map(uid =>
                    usersRef.child(uid).once('value').then(s => ({ uid, data: s.val() }))
                )
            );
            results.forEach(r => { if (r.data) friendsData[r.uid] = r.data; });
        }

        listenFriendProfiles();
        renderAllFriends();
        _lastRailHash = '';
        renderRailDms();
        listenLastMessages();

        if (friends.length === 0 && pendingRequests.length === 0 && Object.keys(userGroups).length === 0) {
            switchView('welcome');
        }
    });
}

function listenFriendRequests() {
    friendRequestsRef.child(userId).on('value', async snap => {
        const data = snap.val() || {};
        pendingRequests = [];
        for (const uid of Object.keys(data)) {
            const u = await usersRef.child(uid).once('value');
            if (u.exists()) pendingRequests.push({ uid, ...u.val(), requestAt: data[uid].at });
        }
        renderPending();
        updatePendingBadge();
    });
}

// ============================================================
// FRIEND ACTIONS
// ============================================================
async function sendFriendRequest(targetUid) {
    if (_sendingFriendRequest) return;
    if (targetUid === userId) {
        showModal({ title: 'That\'s you', text: 'You cannot send a friend request to yourself.', icon: 'fas fa-info-circle', confirmText: 'OK' });
        return;
    }
    _sendingFriendRequest = true;
    showToast('Sending', 'Please wait...');
    try {
        const [f, s, r] = await Promise.all([
            friendsRef.child(userId).child(targetUid).once('value'),
            friendRequestsRef.child('sent_' + userId).child(targetUid).once('value'),
            friendRequestsRef.child(userId).child(targetUid).once('value')
        ]);
        if (f.exists()) { showToast('Already friends', 'You two are already connected.'); return; }
        if (s.exists()) { showToast('Already sent', 'You already sent them a request.'); return; }
        if (r.exists()) { await acceptFriendRequest(targetUid); return; }

        const updates = {};
        updates[`friendRequests/${targetUid}/${userId}`] = { at: firebase.database.ServerValue.TIMESTAMP };
        updates[`friendRequests/sent_${userId}/${targetUid}`] = { at: firebase.database.ServerValue.TIMESTAMP };
        await friendRequestsRef.root.update(updates);

        showToast('Request sent', 'Waiting for them to accept.');
        searchResults.style.display = 'none';
        userSearchInput.value = '';
    } catch (err) {
        console.error('[FriendRequest] Failed:', err);
        showToast('Failed', 'Could not send request.');
    } finally {
        _sendingFriendRequest = false;
    }
}

async function acceptFriendRequest(fromUid) {
    const updates = {};
    updates[`friends/${userId}/${fromUid}`] = true;
    updates[`friends/${fromUid}/${userId}`] = true;
    updates[`friendRequests/${userId}/${fromUid}`] = null;
    updates[`friendRequests/sent_${fromUid}/${userId}`] = null;
    await friendsRef.root.update(updates);
    showToast('Friend added', 'You are now connected.');
}

async function declineFriendRequest(fromUid) {
    const updates = {};
    updates[`friendRequests/${userId}/${fromUid}`] = null;
    updates[`friendRequests/sent_${fromUid}/${userId}`] = null;
    await friendRequestsRef.root.update(updates);
}

async function removeFriend(uid) {
    const u = friendsData[uid];
    const dname = displayNameFor(uid, u?.displayName || u?.username || 'this friend');
    const ok = await showModal({
        title: 'Remove friend?',
        text: `You will no longer be connected with ${escapeHtml(dname)}.`,
        icon: 'fas fa-user-minus',
        danger: true, confirmText: 'Remove'
    });
    if (!ok) return;
    const updates = {};
    updates[`friends/${userId}/${uid}`] = null;
    updates[`friends/${uid}/${userId}`] = null;
    await friendsRef.root.update(updates);
    try { await nicknamesRef.child(userId).child(uid).remove(); } catch (e) {}
    showToast('Friend removed', 'You are no longer connected.');
}

// ============================================================
// USER SEARCH
// ============================================================
async function searchUsers() {
    const query = userSearchInput.value.trim().toLowerCase();
    if (!query) { searchResults.style.display = 'none'; return; }
    searchResultsList.innerHTML = '<div class="empty-message">Searching...</div>';
    searchResults.style.display = 'block';
    try {
        const snap = await usersRef.child('usernames').child(query).once('value');
        if (!snap.exists()) {
            searchResultsList.innerHTML = '<div class="empty-message"><strong>No one found</strong>No user has that username.</div>';
            return;
        }
        const uid = snap.val();
        const [uSnap, sentSnap, recvSnap] = await Promise.all([
            usersRef.child(uid).once('value'),
            friendRequestsRef.child('sent_' + userId).child(uid).once('value'),
            friendRequestsRef.child(userId).child(uid).once('value')
        ]);
        const userData = uSnap.val();
        if (!userData) { searchResultsList.innerHTML = '<div class="empty-message">User profile not found.</div>'; return; }

        searchResultsList.innerHTML = '';
        searchResultsList.appendChild(renderUserCard(uid, userData, {
            isSelf: uid === userId,
            isFriend: friends.includes(uid),
            isSent: sentSnap.exists(),
            isRecv: recvSnap.exists(),
            showStatus: true
        }));
    } catch (err) {
        console.error('[Search] Error:', err);
        searchResultsList.innerHTML = '<div class="empty-message">Search failed.</div>';
    }
}

searchBtn.addEventListener('click', searchUsers);
userSearchInput.addEventListener('keydown', e => { if (e.key === 'Enter') searchUsers(); });

// ============================================================
// USER CARD
// ============================================================
function renderUserCard(uid, userData, opts = {}) {
    const { isSelf, isFriend, isSent, isRecv, showStatus } = opts;
    const dname = displayNameFor(uid, userData.displayName || userData.username || 'Unknown');
    const uname = userData.username || 'unknown';
    const color = getColor(userData.displayName || uname);
    const online = isUserOnline(uid);
    const status = online ? 'online' : 'offline';
    const div = document.createElement('div');
    div.className = 'user-card';

    const avatarHtml = userData.avatar
        ? `<div class="user-card-avatar" style="background-image: url('${userData.avatar}');" data-action="profile" data-uid="${uid}"><div class="dot ${status}"></div></div>`
        : `<div class="user-card-avatar" style="background: linear-gradient(135deg, ${color}, ${color}cc);" data-action="profile" data-uid="${uid}">${escapeHtml(getInitial(dname))}<div class="dot ${status}"></div></div>`;

    const statusText = showStatus
        ? `<div class="user-card-status ${status}">@${escapeHtml(uname)} · ${statusLabel(uid)}</div>`
        : '';

    let actionsHtml = '';
    if (isSelf) actionsHtml = '<span style="font-size:0.75rem;color:var(--ink-muted);padding:0 8px;font-weight:500;">You</span>';
    else if (isFriend) actionsHtml = `<button class="user-card-btn dm" data-action="dm" data-uid="${uid}" title="Message"><i class="fas fa-comment"></i></button>`;
    else if (isRecv) actionsHtml = `
        <button class="user-card-btn accept" data-action="accept" data-uid="${uid}" title="Accept"><i class="fas fa-check"></i></button>
        <button class="user-card-btn decline" data-action="decline" data-uid="${uid}" title="Decline"><i class="fas fa-times"></i></button>`;
    else if (isSent) actionsHtml = '<span class="user-card-btn" style="color:var(--warning);cursor:default;"><i class="fas fa-clock"></i></span>';
    else actionsHtml = `<button class="user-card-btn" data-action="add" data-uid="${uid}" title="Add friend"><i class="fas fa-user-plus"></i></button>`;

    div.innerHTML = `
        ${avatarHtml}
        <div class="user-card-info">
            <div class="user-card-name" data-action="profile" data-uid="${uid}">${escapeHtml(dname)}</div>
            ${statusText}
        </div>
        <div class="user-card-actions">${actionsHtml}</div>
    `;

    div.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', async e => {
            e.stopPropagation();
            const action = btn.dataset.action;
            const targetUid = btn.dataset.uid;
            if (action === 'add') sendFriendRequest(targetUid);
            else if (action === 'accept') acceptFriendRequest(targetUid);
            else if (action === 'decline') declineFriendRequest(targetUid);
            else if (action === 'dm') openDM(targetUid, displayNameFor(targetUid, userData.displayName || userData.username), userData);
            else if (action === 'profile') viewProfileById(targetUid);
        });
    });
    return div;
}

// ============================================================
// RIBBONS
// ============================================================
function renderRibbon(container, uids) {
    if (!container) return;
    container.innerHTML = '';
    if (uids.length === 0) return;
    uids.forEach(uid => {
        const u = friendsData[uid];
        if (!u) return;
        const dname = displayNameFor(uid, u.displayName || u.username);
        const color = getColor(u.displayName || u.username);
        const online = isUserOnline(uid);
        const status = online ? 'online' : 'offline';

        const tile = document.createElement('button');
        tile.type = 'button';
        tile.className = 'friend-tile';
        tile.dataset.uid = uid;

        const avatarInner = u.avatar
            ? `<div class="friend-tile-avatar" style="background-image:url('${u.avatar}');"><div class="dot ${status}"></div></div>`
            : `<div class="friend-tile-avatar" style="background:linear-gradient(135deg,${color},${color}cc);">${escapeHtml(getInitial(dname))}<div class="dot ${status}"></div></div>`;

        tile.innerHTML = `${avatarInner}<div class="friend-tile-name">${escapeHtml(dname)}</div>`;
        tile.addEventListener('click', () => openDM(uid, dname, u));
        tile.addEventListener('contextmenu', e => {
            e.preventDefault();
            showContextMenu(e.clientX, e.clientY, uid, 'dm');
        });
        container.appendChild(tile);
    });
}

function renderAllFriends() {
    const online = friends.filter(uid => isUserOnline(uid));

    renderRibbon(onlineRibbon, online);
    onlineList.innerHTML = '';
    if (friends.length === 0) {
        onlineList.innerHTML = '<div class="empty-message"><strong>No friends yet</strong>Search for someone by username to get started.</div>';
    } else if (online.length === 0) {
        onlineList.innerHTML = '<div class="empty-message">No one is active right now.</div>';
    } else {
        online.forEach(uid => {
            const u = friendsData[uid];
            if (u) onlineList.appendChild(renderUserCard(uid, u, { isFriend: true, showStatus: true }));
        });
    }

    renderRibbon(allRibbon, friends);
    allList.innerHTML = '';
    if (friends.length === 0) {
        allList.innerHTML = '<div class="empty-message"><strong>No friends yet</strong>Add someone using the Add Friend tab.</div>';
    } else {
        friends.forEach(uid => {
            const u = friendsData[uid];
            if (u) allList.appendChild(renderUserCard(uid, u, { isFriend: true, showStatus: true }));
        });
    }
}

function renderPending() {
    pendingList.innerHTML = '';
    if (pendingRequests.length === 0) {
        pendingList.innerHTML = '<div class="empty-message">No pending requests.</div>';
        return;
    }
    pendingRequests.forEach(u => {
        pendingList.appendChild(renderUserCard(u.uid, u, { isRecv: true, showStatus: true }));
    });
}

function updatePendingBadge() {
    const count = pendingRequests.length;
    if (count > 0) {
        pendingBadge.textContent = count;
        pendingBadge.style.display = 'flex';
        pendingTabBadge.textContent = count;
    } else {
        pendingBadge.style.display = 'none';
        pendingTabBadge.textContent = '0';
    }
}

// ============================================================
// RENDER RAIL
// ============================================================
async function renderRailDms() {
    const hashParts = [];
    for (const uid of friends) {
        const u = friendsData[uid];
        if (!u) continue;
        const lm = lastMessages['dm_' + dmKey(userId, uid)];
        hashParts.push(
            `${uid}|${displayNameFor(uid, u.displayName)}|${u.avatar ? '1' : '0'}|${isUserOnline(uid) ? '1' : '0'}|` +
            `${unreadCounts['dm_' + uid] || 0}|${isChatMuted('dm_' + uid) ? 'M' : ''}|${isChatPinned('dm_' + uid) ? 'P' : ''}|` +
            `${(lm?.text || lm?.type || '').slice(0, 20)}|${lm?.timestamp || 0}`
        );
    }
    for (const gid of Object.keys(userGroups)) {
        const lm = lastMessages['group_' + gid];
        hashParts.push(
            `${gid}|${userGroups[gid].name || ''}|${userGroups[gid].photo ? '1' : '0'}|${unreadCounts['group_' + gid] || 0}|` +
            `${isChatMuted('group_' + gid) ? 'M' : ''}|${isChatPinned('group_' + gid) ? 'P' : ''}|` +
            `${(lm?.text || lm?.type || '').slice(0, 20)}|${lm?.timestamp || 0}`
        );
    }
    const newHash = hashParts.join(';');
    if (newHash === _lastRailHash) return;
    _lastRailHash = newHash;

    const prevScroll = dmList.scrollTop;
    dmList.innerHTML = '';

    if (friends.length === 0 && Object.keys(userGroups).length === 0) {
        dmList.innerHTML = '<div class="dm-empty">No conversations yet</div>';
        return;
    }

    const items = [];
    for (const uid of friends) {
        const u = friendsData[uid];
        if (!u) continue;
        const lm = lastMessages['dm_' + dmKey(userId, uid)];
        items.push({ type: 'dm', uid, data: u, lm, sort: lm?.timestamp || 0, pinned: isChatPinned('dm_' + uid) });
    }
    for (const gid of Object.keys(userGroups)) {
        const g = userGroups[gid];
        if (!g) continue;
        const lm = lastMessages['group_' + gid];
        items.push({ type: 'group', gid, data: g, lm, sort: lm?.timestamp || 0, pinned: isChatPinned('group_' + gid) });
    }

    items.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        const at = (a.lm && a.lm.timestamp) || 0;
        const bt = (b.lm && b.lm.timestamp) || 0;
        return bt - at;
    });

    for (const item of items) {
        const el = document.createElement('button');
        el.type = 'button';

        if (item.type === 'dm') {
            const u = item.data;
            const dname = displayNameFor(item.uid, u.displayName || u.username);
            const color = getColor(u.displayName || u.username);
            const online = isUserOnline(item.uid);
            const unread = unreadCounts['dm_' + item.uid] || 0;
            const muted = isChatMuted('dm_' + item.uid);
            el.dataset.uid = item.uid;

            const avatarHtml = u.avatar
                ? `<div class="dm-item-avatar" style="background-image:url('${u.avatar}');">${online ? '<div class="dm-dot online"></div>' : ''}</div>`
                : `<div class="dm-item-avatar" style="background:linear-gradient(135deg,${color},${color}cc);">${escapeHtml(getInitial(dname))}${online ? '<div class="dm-dot online"></div>' : ''}</div>`;

            let preview = 'No messages yet';
            if (item.lm) {
                preview = previewText(item.lm);
                if (item.lm.userId === userId) preview = 'You: ' + preview;
            }

            const timeStr = (item.lm && item.lm.timestamp) ? shortTime(item.lm.timestamp) : '';
            el.className = 'dm-item' + ((unread > 0 && !muted) ? ' unread' : '') + (item.pinned ? ' pinned' : '');
            el.innerHTML = `
                ${avatarHtml}
                <div class="dm-item-body">
                    <div class="dm-item-top">
                        <span class="dm-item-name">${escapeHtml(dname)}</span>
                        <span class="dm-item-time">${timeStr}</span>
                    </div>
                    <div class="dm-item-preview">${escapeHtml(preview)}</div>
                </div>
                ${unread > 0 && !muted ? `<span class="dm-item-badge">${unread}</span>` : ''}
            `;
            el.addEventListener('click', () => openDM(item.uid, dname, u));
            el.addEventListener('contextmenu', e => {
                e.preventDefault();
                showContextMenu(e.clientX, e.clientY, item.uid, 'dm');
            });
        } else {
            const g = item.data;
            const unread = unreadCounts['group_' + item.gid] || 0;
            const muted = isChatMuted('group_' + item.gid);
            el.dataset.gid = item.gid;

            let preview = 'No messages yet';
            if (item.lm) {
                preview = (item.lm.displayName || item.lm.user || 'Someone') + ': ' + previewText(item.lm);
            }

            const timeStr = (item.lm && item.lm.timestamp) ? shortTime(item.lm.timestamp) : '';

            let avatarHtml;
            if (g.photo) {
                avatarHtml = `<div class="dm-item-avatar" style="background-image:url('${g.photo}');"></div>`;
            } else {
                avatarHtml = `<div class="dm-item-avatar group-avatar"><i class="fas fa-users" style="font-size:0.8rem;"></i></div>`;
            }

            el.className = 'dm-item' + ((unread > 0 && !muted) ? ' unread' : '') + (item.pinned ? ' pinned' : '');
            el.innerHTML = `
                ${avatarHtml}
                <div class="dm-item-body">
                    <div class="dm-item-top">
                        <span class="dm-item-name">${escapeHtml(g.name || 'Group')}</span>
                        <span class="dm-item-time">${timeStr}</span>
                    </div>
                    <div class="dm-item-preview">${escapeHtml(preview)}</div>
                </div>
                ${unread > 0 && !muted ? `<span class="dm-item-badge">${unread}</span>` : ''}
            `;
            el.addEventListener('click', () => openGroup(item.gid));
            el.addEventListener('contextmenu', e => {
                e.preventDefault();
                showContextMenu(e.clientX, e.clientY, item.gid, 'group');
            });
        }

        dmList.appendChild(el);
    }

    $$('.dm-item').forEach(el => el.classList.toggle('active',
        (el.dataset.uid === currentDmUser?.uid) || (el.dataset.gid === currentGroup?.id)
    ));

    dmList.scrollTop = prevScroll;
}

// ============================================================
// CONTEXT MENU
// ============================================================
function showContextMenu(x, y, id, type) {
    _contextMenuTarget = id;
    _contextMenuType = type;

    const menuWidth = 220;
    const menuHeight = 320;
    const maxX = window.innerWidth - menuWidth - 8;
    const maxY = window.innerHeight - menuHeight - 8;
    contextMenu.style.left = Math.min(x, maxX) + 'px';
    contextMenu.style.top = Math.min(y, maxY) + 'px';

    const key = type === 'dm' ? 'dm_' + id : 'group_' + id;
    const pinLabel = $('#ctxPinLabel');
    const muteLabel = $('#ctxMuteLabel');
    if (pinLabel) pinLabel.textContent = isChatPinned(key) ? 'Unpin' : 'Pin';
    if (muteLabel) muteLabel.textContent = isChatMuted(key) ? 'Unmute' : 'Mute';

    const removeBtn = contextMenu.querySelector('[data-action="remove"]');
    if (removeBtn) removeBtn.style.display = type === 'dm' ? 'flex' : 'none';

    contextMenu.classList.add('open');
}

contextMenu.querySelectorAll('.context-item').forEach(item => {
    item.addEventListener('click', async e => {
        e.stopPropagation();
        const action = item.dataset.action;
        const id = _contextMenuTarget;
        const type = _contextMenuType;
        contextMenu.classList.remove('open');
        if (!id) return;

        const key = type === 'dm' ? 'dm_' + id : 'group_' + id;

        if (action === 'profile') {
            if (type === 'dm') viewProfileById(id);
        } else if (action === 'mark-read') {
            try {
                await unreadRef.child(userId).child(key).remove();
                showToast('Marked read', 'Conversation cleared.');
            } catch (err) { console.error('mark-read failed:', err); }
        } else if (action === 'pin') {
            try {
                const wasPinned = isChatPinned(key);
                if (wasPinned) await pinnedRef.child(userId).child(key).remove();
                else await pinnedRef.child(userId).child(key).set(true);
                showToast(wasPinned ? 'Unpinned' : 'Pinned', wasPinned ? 'Back to normal.' : 'Moved to top.');
            } catch (err) { console.error('pin failed:', err); showToast('Failed', 'Could not update pin.'); }
        } else if (action === 'mute') {
            try {
                const wasMuted = isChatMuted(key);
                if (wasMuted) await mutedRef.child(userId).child(key).remove();
                else await mutedRef.child(userId).child(key).set(true);
                showToast(wasMuted ? 'Unmuted' : 'Muted', wasMuted ? 'Notifications on.' : 'Notifications off.');
            } catch (err) { console.error('mute failed:', err); showToast('Failed', 'Could not update mute.'); }
        } else if (action === 'remove') {
            if (type === 'dm') removeFriend(id);
        } else if (action === 'delete') {
            if (type === 'dm') await deleteDmConversation(id);
            else await deleteGroupConversation(id);
        }
    });
});

async function deleteDmConversation(uid) {
    const ok = await showModal({
        title: 'Delete conversation?',
        text: 'This removes the entire message history with this person. This cannot be undone.',
        icon: 'fas fa-trash', danger: true, confirmText: 'Delete'
    });
    if (!ok) return;
    try {
        const key = dmKey(userId, uid);
        await dmsRef.child(key).remove();
        await reactionsRef.child(key).remove();
        await unreadRef.child(userId).child('dm_' + uid).remove();
        await unreadRef.child(uid).child('dm_' + userId).remove();
        delete lastMessages['dm_' + key];
        _lastRailHash = '';
        if (currentDmUser && currentDmUser.uid === uid) {
            currentDmUser = null;
            switchView('friends');
        }
        renderRailDms();
        showToast('Deleted', 'Conversation removed.');
    } catch (err) {
        console.error('delete conversation failed:', err);
        showToast('Failed', 'Could not delete conversation.');
    }
}

async function deleteGroupConversation(gid) {
    const ok = await showModal({
        title: 'Leave group?',
        text: 'You will no longer see messages from this group.',
        icon: 'fas fa-sign-out-alt', danger: true, confirmText: 'Leave'
    });
    if (!ok) return;
    await groupsRef.child(gid).child('members').child(userId).remove();
    _lastRailHash = '';
    if (currentGroup && currentGroup.id === gid) {
        currentGroup = null;
        switchView('friends');
    }
    renderRailDms();
    showToast('Left group', 'You are no longer a member.');
}

// ============================================================
// DM HEADER
// ============================================================
function updateDmHeader() {
    if (!currentDmUser) return;
    const u = friendsData[currentDmUser.uid];
    if (!u) return;
    const dname = displayNameFor(currentDmUser.uid, u.displayName || u.username);
    const color = getColor(u.displayName || u.username);
    dmHeaderName.textContent = dname;

    if (u.avatar) {
        dmHeaderAvatar.style.backgroundImage = `url('${u.avatar}')`;
        dmHeaderAvatar.style.backgroundSize = 'cover';
        dmHeaderAvatar.style.backgroundPosition = 'center';
        dmHeaderAvatar.textContent = '';
    } else {
        dmHeaderAvatar.style.backgroundImage = '';
        dmHeaderAvatar.style.background = `linear-gradient(135deg, ${color}, ${color}cc)`;
        dmHeaderAvatar.textContent = getInitial(dname);
    }

    dmHeaderStatus.textContent = statusLabel(currentDmUser.uid);
    dmHeaderStatus.className = 'dm-header-status ' + (isUserOnline(currentDmUser.uid) ? 'online' : '');
}

function updateGroupHeader() {
    if (!currentGroup) return;
    const g = userGroups[currentGroup.id];
    if (!g) return;
    groupHeaderName.textContent = g.name || 'Group';
    const mc = Object.keys(g.members || {}).length;
    groupHeaderMembers.textContent = `${mc} member${mc > 1 ? 's' : ''}`;

    const av = $('#groupHeaderAvatar');
    if (g.photo) {
        av.style.backgroundImage = `url('${g.photo}')`;
        av.style.backgroundSize = 'cover';
        av.style.backgroundPosition = 'center';
        av.innerHTML = '';
    } else {
        av.style.backgroundImage = '';
        av.style.background = `linear-gradient(135deg, #6ec2a8, #4a8b7a)`;
        av.innerHTML = '<i class="fas fa-users"></i>';
    }
}

function clearDmReply() {
    dmReplyTo = null;
    dmReplyPreview.style.display = 'none';
    dmReplyName.textContent = '';
    dmReplyText.textContent = '';
}
function clearGroupReply() {
    groupReplyTo = null;
    groupReplyPreview.style.display = 'none';
    groupReplyName.textContent = '';
    groupReplyText.textContent = '';
}
function cancelDmEdit() {
    dmEditingId = null;
    dmEditBar.style.display = 'none';
    dmEditText.textContent = '';
    dmInput.value = '';
}
function cancelGroupEdit() {
    groupEditingId = null;
    groupEditBar.style.display = 'none';
    groupEditText.textContent = '';
    groupInput.value = '';
}

// ============================================================
// OPEN DM
// ============================================================
async function openDM(uid, dname, userData) {
    currentDmUser = { uid, displayName: dname };
    currentGroup = null;
    if (!friendsData[uid] && userData) friendsData[uid] = userData;

    updateDmHeader();
    switchView('dm');
    dmSearchBar.style.display = 'none';
    clearDmReply();
    cancelDmEdit();
    applyChatTheme();

    await unreadRef.child(userId).child('dm_' + uid).remove();

    if (window._dmCurrentListener) {
        try { window._dmCurrentListener.ref.off('child_added', window._dmCurrentListener.cb); } catch (e) {}
    }
    if (window._dmReactionsListener) {
        try { window._dmReactionsListener.ref.off('value', window._dmReactionsListener.cb); } catch (e) {}
    }

    dmMessages.innerHTML = '';
    dmLastMsgs = [];
    dmReactions = {};

    const key = dmKey(userId, uid);
    const ref = dmsRef.child(key).child('messages');

    const rRef = reactionsRef.child(key);
    const rCb = snap => {
        dmReactions = snap.val() || {};
        updateAllReactionsIn(dmMessages, dmReactions);
    };
    rRef.on('value', rCb);
    window._dmReactionsListener = { ref: rRef, cb: rCb };

    const cb = snap => {
        const msg = snap.val();
        if (!msg) return;
        msg._id = snap.key;
        const existing = dmMessages.querySelector(`[data-msg-id="${snap.key}"]`);
        if (existing) {
            const textEl = existing.querySelector('.msg-text');
            if (textEl && msg.text != null) textEl.textContent = msg.text;
            existing.dataset.msgText = msg.text || '';
            const header = existing.querySelector('.msg-header');
            if (msg.edited && !header.querySelector('.msg-edited')) {
                const s = document.createElement('span');
                s.className = 'msg-edited';
                s.textContent = '(edited)';
                header.appendChild(s);
            }
            return;
        }
        dmLastMsgs.push(msg);
        renderDmMessage(msg);
        if (msg.userId !== userId) {
            if (!isChatMuted('dm_' + uid)) playNotifSound();
        }
    };
    ref.limitToLast(80).on('child_added', cb);
    window._dmCurrentListener = { ref, cb };

    typingRef.child(key).on('value', snap => {
        const t = snap.val();
        if (!t) { dmTyping.textContent = ''; return; }
        const typers = Object.keys(t).filter(k => k !== userId);
        if (typers.length > 0) {
            dmTyping.innerHTML = `${escapeHtml(dname)} is typing<span>.</span><span>.</span><span>.</span>`;
        } else {
            dmTyping.textContent = '';
        }
    });

    await loadDraft('dm_' + uid, dmInput);
    dmInput.focus();
    _lastRailHash = '';
    renderRailDms();
}

// ============================================================
// CHAT PROFILE TAB
// ============================================================
function openChatProfile() {
    if (!currentDmUser) return;
    const u = friendsData[currentDmUser.uid];
    if (!u) return;
    const dname = displayNameFor(currentDmUser.uid, u.displayName || u.username);

    if (u.avatar) {
        chatProfileAvatar.style.backgroundImage = `url('${u.avatar}')`;
        chatProfileAvatar.style.backgroundSize = 'cover';
        chatProfileAvatar.style.backgroundPosition = 'center';
        chatProfileAvatar.textContent = '';
    } else {
        const color = getColor(u.displayName || u.username);
        chatProfileAvatar.style.backgroundImage = '';
        chatProfileAvatar.style.background = `linear-gradient(135deg, ${color}, ${color}cc)`;
        chatProfileAvatar.textContent = getInitial(dname);
    }
    chatProfileName.textContent = dname;
    updateChatProfileStatus();

    cpNicknameValue.textContent = nicknames[currentDmUser.uid] || 'No nickname';
    const key = 'dm_' + currentDmUser.uid;
    const muted = isChatMuted(key);
    const muteBtn = $('#cpActionMute');
    if (muteBtn) {
        muteBtn.querySelector('i').className = muted ? 'fas fa-bell-slash' : 'fas fa-bell';
        muteBtn.querySelector('span').textContent = muted ? 'Unmute' : 'Mute';
    }
    const curTheme = getChatThemeName(currentDmUser.uid);
    cpThemeValue.textContent = curTheme.charAt(0).toUpperCase() + curTheme.slice(1);

    switchView('chatProfile');
}

function updateChatProfileStatus() {
    if (!currentDmUser) return;
    chatProfileStatus.textContent = statusLabel(currentDmUser.uid);
    chatProfileStatus.classList.toggle('offline', !isUserOnline(currentDmUser.uid));
}

if (dmHeaderClickable) dmHeaderClickable.addEventListener('click', () => {
    if (currentDmUser) openChatProfile();
});
if (groupHeaderClickable) groupHeaderClickable.addEventListener('click', () => {
    if (currentGroup) openGroupSettings();
});

$('#chatProfileBack').addEventListener('click', () => {
    if (currentDmUser) switchView('dm');
    else switchView('friends');
});

$('#cpActionProfile').addEventListener('click', () => {
    if (currentDmUser) viewProfileById(currentDmUser.uid);
});
$('#cpActionSearch').addEventListener('click', () => {
    if (!currentDmUser) return;
    switchView('dm');
    dmSearchBar.style.display = 'flex';
    dmSearchInput.focus();
});
$('#cpActionMute').addEventListener('click', async () => {
    if (!currentDmUser) return;
    const key = 'dm_' + currentDmUser.uid;
    const wasMuted = isChatMuted(key);
    if (wasMuted) await mutedRef.child(userId).child(key).remove();
    else await mutedRef.child(userId).child(key).set(true);
    showToast(wasMuted ? 'Unmuted' : 'Muted', wasMuted ? 'Notifications on.' : 'Notifications off.');
    openChatProfile();
});
$('#cpActionOptions').addEventListener('click', e => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    chatOptionsMenu.style.left = Math.min(rect.left, window.innerWidth - 240) + 'px';
    chatOptionsMenu.style.top = (rect.bottom + 6) + 'px';
    chatOptionsMenu.classList.add('open');
});

chatOptionsMenu.querySelectorAll('.context-item').forEach(item => {
    item.addEventListener('click', async e => {
        e.stopPropagation();
        chatOptionsMenu.classList.remove('open');
        const action = item.dataset.cpAction;
        const uid = currentDmUser?.uid;
        if (!uid) return;
        if (action === 'search') {
            switchView('dm');
            dmSearchBar.style.display = 'flex';
            dmSearchInput.focus();
        } else if (action === 'clear') {
            const ok = await showModal({
                title: 'Clear messages?',
                text: 'This removes messages from your view only.',
                icon: 'fas fa-broom', danger: true, confirmText: 'Clear'
            });
            if (ok) showToast('Cleared', 'Messages cleared from view.');
        } else if (action === 'view-profile') {
            viewProfileById(uid);
        } else if (action === 'block') {
            const ok = await showModal({
                title: 'Block user?',
                text: 'You will no longer receive messages from them.',
                icon: 'fas fa-ban', danger: true, confirmText: 'Block'
            });
            if (!ok) return;
            await blockedRef.child(userId).child(uid).set(true);
            showToast('Blocked', 'They can no longer message you.');
        } else if (action === 'report') {
            const reason = await showModal({
                title: 'Report user',
                text: 'Why are you reporting this user?',
                icon: 'fas fa-flag',
                input: true,
                inputPlaceholder: 'Describe the issue...',
                confirmText: 'Submit'
            });
            if (!reason) return;
            await reportsRef.push({
                reporter: userId,
                reported: uid,
                reason: String(reason),
                at: firebase.database.ServerValue.TIMESTAMP
            });
            showToast('Reported', 'Thank you. We will review this.');
        } else if (action === 'delete') {
            await deleteDmConversation(uid);
        }
    });
});

// Nickname row
$('#cpRowNickname').addEventListener('click', () => {
    if (!currentDmUser) return;
    const uid = currentDmUser.uid;
    $('#nicknameInput').value = nicknames[uid] || '';
    nicknameModal.classList.add('open');
    setTimeout(() => $('#nicknameInput').focus(), 100);
});

$('#nicknameClose').addEventListener('click', () => nicknameModal.classList.remove('open'));
nicknameModal.addEventListener('click', e => {
    if (e.target === nicknameModal) nicknameModal.classList.remove('open');
});

$('#nicknameSaveBtn').addEventListener('click', async () => {
    if (!currentDmUser) return;
    const uid = currentDmUser.uid;
    const val = $('#nicknameInput').value.trim();
    if (val) {
        await nicknamesRef.child(userId).child(uid).set(val);
    } else {
        await nicknamesRef.child(userId).child(uid).remove();
    }
    nicknameModal.classList.remove('open');
    showToast('Nickname saved', 'Updated for you only.');
    openChatProfile();
});

$('#nicknameClearBtn').addEventListener('click', async () => {
    if (!currentDmUser) return;
    await nicknamesRef.child(userId).child(currentDmUser.uid).remove();
    $('#nicknameInput').value = '';
    nicknameModal.classList.remove('open');
    showToast('Nickname cleared', 'Display name restored.');
    openChatProfile();
});

// Chat theme row → open gallery
$('#cpRowTheme').addEventListener('click', () => {
    if (!currentDmUser) return;
    openThemeGallery();
});

$('#cpRowCustomize').addEventListener('click', () => {
    showToast('Customize', 'Open Settings → Appearance to change the global theme.');
});
$('#cpRowDisappearing').addEventListener('click', () => {
    showToast('Coming soon', 'Disappearing messages will arrive in a future update.');
});
$('#cpRowPrivacy').addEventListener('click', () => {
    showToast('Privacy', 'Open Settings → Blocked to manage blocked users.');
});

// ============================================================
// CHAT THEME GALLERY
// ============================================================
const CHAT_THEMES = [
    { id: 'default', label: 'Default' },
    { id: 'sage', label: 'Sage' },
    { id: 'rose', label: 'Rose' },
    { id: 'sky', label: 'Sky' },
    { id: 'midnight', label: 'Midnight' },
    { id: 'forest', label: 'Forest' },
    { id: 'sunset', label: 'Sunset' },
    { id: 'ocean', label: 'Ocean' },
    { id: 'cherry', label: 'Cherry' }
];

function getChatThemeName(uid) {
    return localStorage.getItem('chat_theme_' + uid) || 'default';
}

function openThemeGallery() {
    if (!currentDmUser) return;
    const current = getChatThemeName(currentDmUser.uid);
    const grid = $('#themeGrid');
    grid.innerHTML = '';
    CHAT_THEMES.forEach(t => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'theme-card' + (t.id === current ? ' selected' : '');
        card.dataset.themeId = t.id;
        card.innerHTML = `
            <div class="theme-preview theme-${t.id}">
                <span class="theme-label">${t.label}</span>
            </div>
        `;
        card.addEventListener('click', () => {
            localStorage.setItem('chat_theme_' + currentDmUser.uid, t.id);
            grid.querySelectorAll('.theme-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            applyChatTheme();
            cpThemeValue.textContent = t.label;
            showToast('Theme applied', `Chat set to ${t.label}.`);
        });
        grid.appendChild(card);
    });
    themeGalleryModal.classList.add('open');
}

$('#themeGalleryClose').addEventListener('click', () => themeGalleryModal.classList.remove('open'));
themeGalleryModal.addEventListener('click', e => {
    if (e.target === themeGalleryModal) themeGalleryModal.classList.remove('open');
});

function applyChatTheme() {
    const msgs = document.getElementById('dmMessages');
    if (!msgs) return;
    msgs.classList.remove(
        'chat-theme-sage', 'chat-theme-rose', 'chat-theme-sky', 'chat-theme-midnight',
        'chat-theme-forest', 'chat-theme-sunset', 'chat-theme-ocean', 'chat-theme-cherry'
    );
    if (!currentDmUser) return;
    const t = getChatThemeName(currentDmUser.uid);
    if (t && t !== 'default') msgs.classList.add('chat-theme-' + t);
}

// ============================================================
// MESSAGE HTML
// ============================================================
function buildMessageHTML(msg) {
    const isOwn = msg.userId === userId;
    const time = formatTime(msg.timestamp);

    const senderData = isOwn ? (currentProfile || {}) : (friendsData[msg.userId] || msg);
    const color = getColor(msg.displayName || msg.user);
    const senderAvatar = senderData?.avatar || msg.avatar || '';

    let avatarStyle, avatarContent;
    if (senderAvatar) {
        avatarStyle = `background-image: url('${senderAvatar}'); background-size: cover; background-position: center;`;
        avatarContent = '';
    } else {
        avatarStyle = `background: linear-gradient(135deg, ${color}, ${color}cc);`;
        avatarContent = getInitial(msg.displayName || msg.user);
    }

    let contentHtml = '';
    if (msg.type === 'image') {
        contentHtml = `<div class="msg-media" data-action="lightbox" data-src="${msg.data}"><img src="${msg.data}" loading="lazy" /></div>`;
    } else if (msg.type === 'file') {
        contentHtml = `<a class="msg-file" href="${msg.data}" download="${escapeHtml(msg.fileName || 'file')}">
            <i class="fas fa-file"></i>
            <div class="file-info">
                <span class="file-name">${escapeHtml(msg.fileName || 'File')}</span>
                <span class="file-size">${formatBytes(msg.fileSize || 0)}</span>
            </div>
        </a>`;
    } else if (msg.type === 'voice') {
        contentHtml = `<div class="msg-voice">
            <button class="voice-play" data-action="voice" data-src="${msg.data}"><i class="fas fa-play"></i></button>
            <div class="voice-wave">${generateWaveBars()}</div>
            <span class="voice-time">${formatDuration(msg.duration || 0)}</span>
        </div>`;
    } else {
        contentHtml = `<div class="msg-text">${escapeHtml(msg.text || '')}</div>`;
    }

    return { isOwn, time, avatarStyle, avatarContent, contentHtml };
}

function buildQuoteHtml(replyTo) {
    if (!replyTo) return '';
    return `
        <div class="msg-quote" data-action="scroll-to" data-quote-id="${escapeHtml(replyTo.id || '')}">
            <div class="msg-quote-body">
                <span class="msg-quote-name">${escapeHtml(replyTo.name || 'Unknown')}</span>
                <span class="msg-quote-text">${escapeHtml(replyTo.text || '')}</span>
            </div>
        </div>
    `;
}

function buildReactionsHtml(messageId, reactionsMap) {
    const msgReactions = reactionsMap[messageId];
    if (!msgReactions) return '';
    const entries = Object.entries(msgReactions);
    if (entries.length === 0) return '';
    let html = '<div class="msg-reactions">';
    for (const [emoji, users] of entries) {
        const uids = Object.keys(users || {});
        if (uids.length === 0) continue;
        const mine = uids.includes(userId);
        html += `<button class="reaction-chip${mine ? ' mine' : ''}" data-action="toggle-reaction" data-emoji="${emoji}" data-msg-id="${messageId}">
            <span>${emoji}</span>
            <span class="reaction-count">${uids.length}</span>
        </button>`;
    }
    html += '</div>';
    return html;
}

function updateAllReactionsIn(container, reactionsMap) {
    container.querySelectorAll('.message').forEach(el => {
        const id = el.dataset.msgId;
        const existing = el.querySelector('.msg-reactions');
        const newHtml = buildReactionsHtml(id, reactionsMap);
        if (existing) existing.remove();
        if (newHtml) {
            const content = el.querySelector('.msg-content');
            if (content) content.insertAdjacentHTML('beforeend', newHtml);
        }
    });
}

// ============================================================
// RENDER MESSAGES
// ============================================================
function renderDmMessage(msg) {
    const { isOwn, time, avatarStyle, avatarContent, contentHtml } = buildMessageHTML(msg);
    const div = document.createElement('div');
    div.className = 'message' + (isOwn ? ' own' : '');

    if (dateSeparatorsEnabled) {
        const last = dmMessages.lastElementChild;
        const lastTs = last?.dataset?.ts;
        if (!lastTs || dayKey(parseInt(lastTs)) !== dayKey(msg.timestamp)) {
            const sep = document.createElement('div');
            sep.className = 'date-separator';
            sep.textContent = dateLabel(msg.timestamp);
            dmMessages.appendChild(sep);
        }
    }

    const quoteHtml = buildQuoteHtml(msg.replyTo);
    const reactionsHtml = buildReactionsHtml(msg._id, dmReactions);
    const editedMark = msg.edited ? '<span class="msg-edited">(edited)</span>' : '';

    div.dataset.ts = msg.timestamp;
    div.dataset.msgId = msg._id || '';
    div.dataset.msgType = msg.type || 'text';
    div.dataset.msgText = msg.text || '';
    div.dataset.msgFileName = msg.fileName || '';
    div.dataset.source = 'dm';

    div.innerHTML = `
        <div class="msg-avatar" style="${avatarStyle}">${avatarContent}</div>
        <div class="msg-content">
            <div class="msg-header">
                <span class="name">${escapeHtml(msg.displayName || msg.user)}</span>
                <span class="time">${time}</span>
                ${editedMark}
            </div>
            ${quoteHtml}
            ${contentHtml}
            ${reactionsHtml}
        </div>
        <div class="msg-actions">
            <button class="msg-action-btn react-btn" data-msg-action="react" title="React"><i class="fas fa-face-smile"></i></button>
            <button class="msg-action-btn" data-msg-action="reply" title="Reply"><i class="fas fa-reply"></i></button>
            <button class="msg-action-btn" data-msg-action="copy" title="Copy"><i class="fas fa-copy"></i></button>
            ${isOwn ? `<button class="msg-action-btn" data-msg-action="edit" title="Edit"><i class="fas fa-pen"></i></button>` : ''}
            ${isOwn ? `<button class="msg-action-btn danger" data-msg-action="delete" title="Delete"><i class="fas fa-trash"></i></button>` : ''}
        </div>
    `;
    dmMessages.appendChild(div);

    const nearBottom = dmMessages.scrollHeight - dmMessages.scrollTop - dmMessages.clientHeight < 120;
    if (nearBottom || msg.userId === userId) dmMessages.scrollTop = dmMessages.scrollHeight;
}

function renderGroupMessage(msg) {
    const { isOwn, time, avatarStyle, avatarContent, contentHtml } = buildMessageHTML(msg);
    const div = document.createElement('div');
    div.className = 'message' + (isOwn ? ' own' : '');

    if (dateSeparatorsEnabled) {
        const last = groupMessages.lastElementChild;
        const lastTs = last?.dataset?.ts;
        if (!lastTs || dayKey(parseInt(lastTs)) !== dayKey(msg.timestamp)) {
            const sep = document.createElement('div');
            sep.className = 'date-separator';
            sep.textContent = dateLabel(msg.timestamp);
            groupMessages.appendChild(sep);
        }
    }

    const quoteHtml = buildQuoteHtml(msg.replyTo);
    const reactionsHtml = buildReactionsHtml(msg._id, groupReactions);
    const editedMark = msg.edited ? '<span class="msg-edited">(edited)</span>' : '';

    div.dataset.ts = msg.timestamp;
    div.dataset.msgId = msg._id || '';
    div.dataset.msgType = msg.type || 'text';
    div.dataset.msgText = msg.text || '';
    div.dataset.msgFileName = msg.fileName || '';
    div.dataset.source = 'group';

    div.innerHTML = `
        <div class="msg-avatar" style="${avatarStyle}">${avatarContent}</div>
        <div class="msg-content">
            <div class="msg-header">
                <span class="name">${escapeHtml(msg.displayName || msg.user)}</span>
                <span class="time">${time}</span>
                ${editedMark}
            </div>
            ${quoteHtml}
            ${contentHtml}
            ${reactionsHtml}
        </div>
        <div class="msg-actions">
            <button class="msg-action-btn react-btn" data-msg-action="react" title="React"><i class="fas fa-face-smile"></i></button>
            <button class="msg-action-btn" data-msg-action="reply" title="Reply"><i class="fas fa-reply"></i></button>
            <button class="msg-action-btn" data-msg-action="copy" title="Copy"><i class="fas fa-copy"></i></button>
            ${isOwn ? `<button class="msg-action-btn" data-msg-action="edit" title="Edit"><i class="fas fa-pen"></i></button>` : ''}
            ${isOwn ? `<button class="msg-action-btn danger" data-msg-action="delete" title="Delete"><i class="fas fa-trash"></i></button>` : ''}
        </div>
    `;
    groupMessages.appendChild(div);

    const nearBottom = groupMessages.scrollHeight - groupMessages.scrollTop - groupMessages.clientHeight < 120;
    if (nearBottom || msg.userId === userId) groupMessages.scrollTop = groupMessages.scrollHeight;
}

// ============================================================
// DELEGATED CLICKS
// ============================================================
document.addEventListener('click', async e => {
    const lightboxEl = e.target.closest('[data-action="lightbox"]');
    if (lightboxEl) {
        e.stopPropagation();
        window.openLightbox(lightboxEl.dataset.src);
        return;
    }
    const voiceEl = e.target.closest('[data-action="voice"]');
    if (voiceEl) {
        e.stopPropagation();
        window.playVoice(voiceEl, voiceEl.dataset.src);
        return;
    }
    const chip = e.target.closest('[data-action="toggle-reaction"]');
    if (chip) {
        e.stopPropagation();
        const emoji = chip.dataset.emoji;
        const msgId = chip.dataset.msgId;
        const source = chip.closest('.message')?.dataset.source;
        await toggleReaction(source, msgId, emoji);
        return;
    }
    const quoteEl = e.target.closest('[data-action="scroll-to"]');
    if (quoteEl) {
        const qid = quoteEl.dataset.quoteId;
        if (!qid) return;
        const target = document.querySelector(`.message[data-msg-id="${qid}"]`);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            target.style.transition = 'background 0.3s ease';
            const old = target.style.background;
            target.style.background = 'var(--accent-wash)';
            setTimeout(() => { target.style.background = old; }, 900);
        }
        return;
    }

    const btn = e.target.closest('[data-msg-action]');
    if (!btn) return;
    const msgEl = btn.closest('.message');
    if (!msgEl) return;

    const action = btn.dataset.msgAction;
    const source = msgEl.dataset.source;
    const msgId = msgEl.dataset.msgId;
    const msgText = msgEl.dataset.msgText;
    const msgFileName = msgEl.dataset.msgFileName;
    const msgType = msgEl.dataset.msgType;

    if (action === 'copy') {
        const text = msgText || msgFileName || `[${msgType}]`;
        let copied = false;
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                copied = true;
            }
        } catch (err) {}
        if (!copied) {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand('copy'); copied = true; } catch (e) {}
            ta.remove();
        }
        showToast(copied ? 'Copied' : 'Could not copy', copied ? 'Message copied to clipboard.' : 'Your browser blocked clipboard access.');
    } else if (action === 'reply') {
        const nameEl = msgEl.querySelector('.msg-header .name');
        const name = nameEl ? nameEl.textContent : 'Unknown';
        const quoteText = msgText || previewText({ type: msgType, fileName: msgFileName, text: msgText });
        const replyObj = { id: msgId, name, text: quoteText };
        if (source === 'dm') {
            dmReplyTo = replyObj;
            dmReplyName.textContent = name;
            dmReplyText.textContent = quoteText;
            dmReplyPreview.style.display = 'flex';
            dmInput.focus();
        } else {
            groupReplyTo = replyObj;
            groupReplyName.textContent = name;
            groupReplyText.textContent = quoteText;
            groupReplyPreview.style.display = 'flex';
            groupInput.focus();
        }
    } else if (action === 'edit') {
        if (msgType !== 'text') {
            showToast('Cannot edit', 'Only text messages can be edited.');
            return;
        }
        if (source === 'dm') {
            cancelDmEdit();
            dmEditingId = msgId;
            dmEditBar.style.display = 'flex';
            dmEditText.textContent = msgText;
            dmInput.value = msgText;
            dmInput.focus();
        } else {
            cancelGroupEdit();
            groupEditingId = msgId;
            groupEditBar.style.display = 'flex';
            groupEditText.textContent = msgText;
            groupInput.value = msgText;
            groupInput.focus();
        }
    } else if (action === 'react') {
        if (!reactionsEnabled) return;
        currentReactionMsgEl = msgEl;
        const rect = btn.getBoundingClientRect();
        reactionPicker.style.left = Math.min(rect.left, window.innerWidth - 340) + 'px';
        reactionPicker.style.top = (rect.top - 46) + 'px';
        reactionPicker.classList.add('open');
    } else if (action === 'delete') {
        const ok = await showModal({
            title: 'Delete message?',
            text: 'This deletes the message for everyone in the conversation.',
            icon: 'fas fa-trash', danger: true, confirmText: 'Delete'
        });
        if (!ok) return;
        try {
            if (source === 'dm' && currentDmUser) {
                const key = dmKey(userId, currentDmUser.uid);
                await dmsRef.child(key).child('messages').child(msgId).remove();
                await reactionsRef.child(key).child(msgId).remove();
            } else if (source === 'group' && currentGroup) {
                await groupsRef.child(currentGroup.id).child('messages').child(msgId).remove();
                await reactionsRef.child('group_' + currentGroup.id).child(msgId).remove();
            }
            msgEl.remove();
            showToast('Deleted', 'Message removed.');
        } catch (err) {
            console.error('delete failed:', err);
            showToast('Failed', 'Could not delete message.');
        }
    }
});

// ============================================================
// REACTIONS
// ============================================================
async function toggleReaction(source, msgId, emoji) {
    if (!msgId) return;
    let ref;
    if (source === 'dm' && currentDmUser) {
        ref = reactionsRef.child(dmKey(userId, currentDmUser.uid)).child(msgId).child(emoji);
    } else if (source === 'group' && currentGroup) {
        ref = reactionsRef.child('group_' + currentGroup.id).child(msgId).child(emoji);
    } else return;
    const snap = await ref.child(userId).once('value');
    if (snap.exists()) await ref.child(userId).remove();
    else await ref.child(userId).set(true);
}

reactionPicker.querySelectorAll('.reaction-option').forEach(opt => {
    opt.addEventListener('click', async e => {
        e.stopPropagation();
        if (!currentReactionMsgEl) return;
        const emoji = opt.dataset.emoji;
        const source = currentReactionMsgEl.dataset.source;
        const msgId = currentReactionMsgEl.dataset.msgId;
        reactionPicker.classList.remove('open');
        await toggleReaction(source, msgId, emoji);
    });
});

// ============================================================
// SEND DM
// ============================================================
async function sendDm() {
    const text = dmInput.value.trim();
    if (!text && !pendingFile) return;

    if (dmEditingId) {
        if (!text) return;
        const key = dmKey(userId, currentDmUser.uid);
        try {
            await dmsRef.child(key).child('messages').child(dmEditingId).update({
                text, edited: true, editedAt: Date.now()
            });
            const el = dmMessages.querySelector(`[data-msg-id="${dmEditingId}"]`);
            if (el) {
                const textEl = el.querySelector('.msg-text');
                if (textEl) textEl.textContent = text;
                el.dataset.msgText = text;
                const header = el.querySelector('.msg-header');
                if (!header.querySelector('.msg-edited')) {
                    const s = document.createElement('span');
                    s.className = 'msg-edited';
                    s.textContent = '(edited)';
                    header.appendChild(s);
                }
            }
            cancelDmEdit();
            showToast('Edited', 'Message updated.');
        } catch (e) {
            console.error('edit failed:', e);
            showToast('Failed', 'Could not edit message.');
        }
        return;
    }

    if (pendingFile) { sendDmMedia(); return; }

    const key = dmKey(userId, currentDmUser.uid);
    const msg = {
        user: username, displayName, text,
        color: getColor(displayName),
        avatar: currentProfile?.avatar || '',
        timestamp: Date.now(), userId, type: 'text'
    };
    if (dmReplyTo) msg.replyTo = dmReplyTo;

    dmInput.value = '';
    dmInput.focus();
    stopTyping();
    clearDraft('dm_' + currentDmUser.uid);
    clearDmReply();

    try {
        await dmsRef.child(key).child('messages').push(msg);
        await unreadRef.child(currentDmUser.uid).child('dm_' + userId).transaction(c => (c || 0) + 1);
    } catch (e) { console.error(e); }
}

async function sendDmMedia() {
    if (!pendingFile) return;
    if (pendingFile.size > 5000 * 1024) {
        showModal({ title: 'File too large', text: 'Files must be under 5 MB.', icon: 'fas fa-exclamation-triangle', danger: true, confirmText: 'OK', hideCancel: true });
        return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
        const key = dmKey(userId, currentDmUser.uid);
        const msg = {
            type: pendingType, user: username, displayName,
            color: getColor(displayName),
            avatar: currentProfile?.avatar || '',
            timestamp: Date.now(), userId,
            fileName: pendingFile.name, fileSize: pendingFile.size,
            data: reader.result
        };
        if (dmReplyTo) msg.replyTo = dmReplyTo;
        clearPreview();
        clearDmReply();
        try {
            await dmsRef.child(key).child('messages').push(msg);
            await unreadRef.child(currentDmUser.uid).child('dm_' + userId).transaction(c => (c || 0) + 1);
        } catch (e) { console.error(e); }
    };
    reader.readAsDataURL(pendingFile);
}

dmSendBtn.addEventListener('click', sendDm);
dmInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey && enterToSend) {
        e.preventDefault();
        sendDm();
    }
});

dmSearchClose.addEventListener('click', () => {
    dmSearchBar.style.display = 'none';
    dmSearchInput.value = '';
    filterMessages(dmMessages, '');
});
dmSearchInput.addEventListener('input', e => {
    filterMessages(dmMessages, e.target.value.trim().toLowerCase());
});

dmReplyCancel.addEventListener('click', clearDmReply);
dmEditCancel.addEventListener('click', cancelDmEdit);

setupDraftAutosave(dmInput, () => currentDmUser ? 'dm_' + currentDmUser.uid : null);

// ============================================================
// GROUPS
// ============================================================
async function openGroup(gid) {
    const g = userGroups[gid];
    if (!g) return;

    currentGroup = { id: gid, ...g };
    currentDmUser = null;
    updateGroupHeader();
    clearGroupReply();
    cancelGroupEdit();

    switchView('group');
    groupSearchBar.style.display = 'none';

    await unreadRef.child(userId).child('group_' + gid).remove();

    if (window._groupCurrentListener) {
        try { window._groupCurrentListener.ref.off('child_added', window._groupCurrentListener.cb); } catch (e) {}
    }
    if (window._groupReactionsListener) {
        try { window._groupReactionsListener.ref.off('value', window._groupReactionsListener.cb); } catch (e) {}
    }

    groupMessages.innerHTML = '';
    groupLastMsgs = [];
    groupReactions = {};

    const ref = groupsRef.child(gid).child('messages');

    const rRef = reactionsRef.child('group_' + gid);
    const rCb = snap => {
        groupReactions = snap.val() || {};
        updateAllReactionsIn(groupMessages, groupReactions);
    };
    rRef.on('value', rCb);
    window._groupReactionsListener = { ref: rRef, cb: rCb };

    const cb = snap => {
        const msg = snap.val();
        if (!msg) return;
        msg._id = snap.key;
        const existing = groupMessages.querySelector(`[data-msg-id="${snap.key}"]`);
        if (existing) {
            const textEl = existing.querySelector('.msg-text');
            if (textEl && msg.text != null) textEl.textContent = msg.text;
            existing.dataset.msgText = msg.text || '';
            const header = existing.querySelector('.msg-header');
            if (msg.edited && !header.querySelector('.msg-edited')) {
                const s = document.createElement('span');
                s.className = 'msg-edited';
                s.textContent = '(edited)';
                header.appendChild(s);
            }
            return;
        }
        groupLastMsgs.push(msg);
        renderGroupMessage(msg);
        if (msg.userId !== userId) {
            if (!isChatMuted('group_' + gid)) playNotifSound();
        }
    };
    ref.limitToLast(80).on('child_added', cb);
    window._groupCurrentListener = { ref, cb };

    await loadDraft('group_' + gid, groupInput);
    groupInput.focus();
    _lastRailHash = '';
    renderRailDms();
}

async function sendGroupMessage() {
    const text = groupInput.value.trim();
    if (!currentGroup) return;

    if (groupEditingId) {
        if (!text) return;
        try {
            await groupsRef.child(currentGroup.id).child('messages').child(groupEditingId).update({
                text, edited: true, editedAt: Date.now()
            });
            const el = groupMessages.querySelector(`[data-msg-id="${groupEditingId}"]`);
            if (el) {
                const textEl = el.querySelector('.msg-text');
                if (textEl) textEl.textContent = text;
                el.dataset.msgText = text;
                const header = el.querySelector('.msg-header');
                if (!header.querySelector('.msg-edited')) {
                    const s = document.createElement('span');
                    s.className = 'msg-edited';
                    s.textContent = '(edited)';
                    header.appendChild(s);
                }
            }
            cancelGroupEdit();
            showToast('Edited', 'Message updated.');
        } catch (e) {
            console.error('edit failed:', e);
            showToast('Failed', 'Could not edit message.');
        }
        return;
    }

    if (!text) return;

    const msg = {
        user: username, displayName, text,
        color: getColor(displayName),
        avatar: currentProfile?.avatar || '',
        timestamp: Date.now(), userId, type: 'text'
    };
    if (groupReplyTo) msg.replyTo = groupReplyTo;

    groupInput.value = '';
    groupInput.focus();
    clearDraft('group_' + currentGroup.id);
    clearGroupReply();

    try {
        await groupsRef.child(currentGroup.id).child('messages').push(msg);
        const g = userGroups[currentGroup.id];
        if (g?.members) {
            for (const m of Object.keys(g.members)) {
                if (m !== userId) {
                    await unreadRef.child(m).child('group_' + currentGroup.id).transaction(c => (c || 0) + 1);
                }
            }
        }
    } catch (e) { console.error(e); }
}

groupSendBtn.addEventListener('click', sendGroupMessage);
groupInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey && enterToSend) {
        e.preventDefault();
        sendGroupMessage();
    }
});

newGroupBtn.addEventListener('click', () => {
    if (friends.length < 1) {
        showModal({ title: 'No friends yet', text: 'Add some friends before creating a group.', icon: 'fas fa-user-group', confirmText: 'OK', hideCancel: true });
        return;
    }
    groupNameInput.value = '';
    groupPicker.innerHTML = '';
    friends.forEach(uid => {
        const u = friendsData[uid];
        if (!u) return;
        const dname = displayNameFor(uid, u.displayName || u.username);
        const color = getColor(u.displayName || u.username);
        const item = document.createElement('div');
        item.className = 'group-picker-item';
        item.dataset.uid = uid;
        item.innerHTML = `
            <div class="group-picker-checkbox"><i class="fas fa-check"></i></div>
            ${u.avatar
                ? `<div class="group-picker-avatar" style="background-image:url('${u.avatar}');"></div>`
                : `<div class="group-picker-avatar" style="background:linear-gradient(135deg,${color},${color}cc);">${escapeHtml(getInitial(dname))}</div>`}
            <span class="group-picker-name">${escapeHtml(dname)}</span>
        `;
        item.addEventListener('click', () => item.classList.toggle('selected'));
        groupPicker.appendChild(item);
    });
    newGroupModal.classList.add('open');
});

$('#newGroupClose').addEventListener('click', () => newGroupModal.classList.remove('open'));
$('#newGroupCancelBtn').addEventListener('click', () => newGroupModal.classList.remove('open'));
newGroupModal.addEventListener('click', e => {
    if (e.target === newGroupModal) newGroupModal.classList.remove('open');
});

$('#newGroupCreateBtn').addEventListener('click', async () => {
    const name = groupNameInput.value.trim();
    if (!name) {
        showModal({ title: 'Missing name', text: 'Please enter a group name.', icon: 'fas fa-info-circle', confirmText: 'OK', hideCancel: true });
        return;
    }
    const selected = [...groupPicker.querySelectorAll('.group-picker-item.selected')].map(i => i.dataset.uid);
    if (selected.length === 0) {
        showModal({ title: 'No members', text: 'Pick at least one friend for the group.', icon: 'fas fa-info-circle', confirmText: 'OK', hideCancel: true });
        return;
    }
    const btn = $('#newGroupCreateBtn');
    btn.disabled = true;
    btn.textContent = 'Creating...';
    try {
        const members = { [userId]: true };
        selected.forEach(uid => { members[uid] = true; });
        const gid = groupsRef.push().key;
        await groupsRef.child(gid).set({
            name, owner: userId,
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            members
        });
        newGroupModal.classList.remove('open');
        showToast('Group created', `${name} is ready.`);
        setTimeout(() => openGroup(gid), 300);
    } catch (e) {
        console.error(e);
        showModal({ title: 'Failed', text: 'Could not create the group. Try again.', icon: 'fas fa-exclamation-triangle', danger: true, confirmText: 'OK', hideCancel: true });
    } finally {
        btn.disabled = false;
        btn.textContent = 'Create';
    }
});

function openGroupSettings() {
    if (!currentGroup) return;
    const g = userGroups[currentGroup.id];
    if (!g) return;

    const isOwner = g.owner === userId;
    $('#groupSettingsHint').textContent = isOwner
        ? 'You are the owner. You can rename and change the photo.'
        : 'Only the group owner can rename or change the photo.';

    $('#groupSettingsNameInput').value = g.name || '';
    $('#groupSettingsNameInput').disabled = !isOwner;

    groupEditPhoto = g.photo || '';

    const av = $('#groupSettingsAvatar');
    if (g.photo) {
        av.style.backgroundImage = `url('${g.photo}')`;
        av.style.backgroundSize = 'cover';
        av.style.backgroundPosition = 'center';
        av.innerHTML = '<div class="avatar-edit-overlay"><i class="fas fa-camera"></i></div>';
    } else {
        av.style.backgroundImage = '';
        av.style.background = `linear-gradient(135deg, #6ec2a8, #4a8b7a)`;
        av.innerHTML = '<i class="fas fa-users"></i><div class="avatar-edit-overlay"><i class="fas fa-camera"></i></div>';
    }

    const bg = $('#groupSettingsBannerGradient');
    if (g.photo) {
        bg.style.backgroundImage = `url('${g.photo}')`;
    } else {
        bg.style.backgroundImage = '';
        bg.style.background = `linear-gradient(135deg, #6ec2a8, #4a8b7a)`;
    }

    groupSettingsModal.classList.add('open');
}

$('#groupSettingsClose').addEventListener('click', () => groupSettingsModal.classList.remove('open'));
$('#groupSettingsCancelBtn').addEventListener('click', () => groupSettingsModal.classList.remove('open'));
groupSettingsModal.addEventListener('click', e => {
    if (e.target === groupSettingsModal) groupSettingsModal.classList.remove('open');
});

$('#groupSettingsAvatar').addEventListener('click', () => {
    if (!currentGroup) return;
    const g = userGroups[currentGroup.id];
    if (g.owner !== userId) { showToast('Not owner', 'Only the owner can change the photo.'); return; }
    $('#groupPhotoInput').click();
});
$('#groupSettingsBanner').addEventListener('click', () => {
    if (!currentGroup) return;
    const g = userGroups[currentGroup.id];
    if (g.owner !== userId) { showToast('Not owner', 'Only the owner can change the photo.'); return; }
    $('#groupPhotoInput').click();
});

$('#groupPhotoInput').addEventListener('change', () => {
    const f = $('#groupPhotoInput').files[0];
    if (!f) return;
    if (f.size > 1024 * 1024) {
        showModal({ title: 'Image too large', text: 'Group photo must be under 1 MB.', icon: 'fas fa-exclamation-triangle', danger: true, confirmText: 'OK', hideCancel: true });
        return;
    }
    const reader = new FileReader();
    reader.onload = () => {
        groupEditPhoto = reader.result;
        const av = $('#groupSettingsAvatar');
        av.style.backgroundImage = `url('${reader.result}')`;
        av.style.backgroundSize = 'cover';
        av.style.backgroundPosition = 'center';
        av.innerHTML = '<div class="avatar-edit-overlay"><i class="fas fa-camera"></i></div>';
        const bg = $('#groupSettingsBannerGradient');
        bg.style.backgroundImage = `url('${reader.result}')`;
    };
    reader.readAsDataURL(f);
});

$('#groupSettingsSaveBtn').addEventListener('click', async () => {
    if (!currentGroup) return;
    const g = userGroups[currentGroup.id];
    if (g.owner !== userId) {
        showToast('Not owner', 'Only the owner can make changes.');
        return;
    }
    const newName = $('#groupSettingsNameInput').value.trim();
    if (!newName) {
        showModal({ title: 'Missing name', text: 'Group name cannot be empty.', icon: 'fas fa-info-circle', confirmText: 'OK', hideCancel: true });
        return;
    }
    const btn = $('#groupSettingsSaveBtn');
    btn.disabled = true;
    btn.textContent = 'Saving...';
    try {
        await groupsRef.child(currentGroup.id).update({
            name: newName,
            photo: groupEditPhoto || ''
        });
        groupSettingsModal.classList.remove('open');
        showToast('Saved', 'Group updated.');
    } catch (e) {
        console.error(e);
        showToast('Failed', 'Could not save group.');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Save';
    }
});

function openMembersModal() {
    if (!currentGroup) return;
    const g = userGroups[currentGroup.id];
    if (!g || !g.members) return;

    const isOwner = g.owner === userId;
    const memberUids = Object.keys(g.members);
    groupMembersCount.textContent = `${memberUids.length} member${memberUids.length > 1 ? 's' : ''}`;
    groupMembersList.innerHTML = '';

    memberUids.forEach(uid => {
        const u = uid === userId ? currentProfile : friendsData[uid];
        if (!u) return;
        const dname = uid === userId ? displayName : displayNameFor(uid, u.displayName || u.username);
        const color = getColor(u.displayName || u.username);
        const el = document.createElement('div');
        el.className = 'group-member';
        el.innerHTML = `
            ${u.avatar
                ? `<div class="group-member-avatar" style="background-image:url('${u.avatar}');"></div>`
                : `<div class="group-member-avatar" style="background:linear-gradient(135deg,${color},${color}cc);">${escapeHtml(getInitial(dname))}</div>`}
            <div class="group-member-info">
                <div class="group-member-name">${escapeHtml(dname)}</div>
                ${uid === g.owner ? '<div class="group-member-tag">Owner</div>' : uid === userId ? '<div class="group-member-tag">You</div>' : ''}
            </div>
        `;
        if (isOwner && uid !== userId) {
            const kickBtn = document.createElement('button');
            kickBtn.className = 'group-member-kick';
            kickBtn.innerHTML = '<i class="fas fa-user-minus"></i>';
            kickBtn.title = 'Kick from group';
            kickBtn.onclick = async () => {
                const ok = await showModal({
                    title: 'Kick member?',
                    text: `Remove ${escapeHtml(dname)} from this group?`,
                    icon: 'fas fa-user-minus', danger: true, confirmText: 'Kick'
                });
                if (!ok) return;
                await groupsRef.child(g.id).child('members').child(uid).remove();
                groupMembersModal.classList.remove('open');
                showToast('Kicked', `${dname} was removed.`);
            };
            el.appendChild(kickBtn);
        }
        groupMembersList.appendChild(el);
    });
}

$('#groupMembersClose').addEventListener('click', () => groupMembersModal.classList.remove('open'));
groupMembersModal.addEventListener('click', e => {
    if (e.target === groupMembersModal) groupMembersModal.classList.remove('open');
});

groupLeaveBtn.addEventListener('click', async () => {
    if (!currentGroup) return;
    const ok = await showModal({
        title: 'Leave group?',
        text: 'You will no longer see messages from this group.',
        icon: 'fas fa-sign-out-alt', danger: true, confirmText: 'Leave'
    });
    if (!ok) return;
    await groupsRef.child(currentGroup.id).child('members').child(userId).remove();
    _lastRailHash = '';
    currentGroup = null;
    switchView('friends');
    renderRailDms();
    showToast('Left group', 'You are no longer a member.');
});

groupAddMembersBtn.addEventListener('click', () => {
    if (!currentGroup) return;
    const g = userGroups[currentGroup.id];
    if (!g) return;
    const memberUids = Object.keys(g.members || {});
    const candidates = friends.filter(uid => !memberUids.includes(uid));
    if (candidates.length === 0) {
        showModal({ title: 'No one to add', text: 'All your friends are already in this group.', icon: 'fas fa-info-circle', confirmText: 'OK', hideCancel: true });
        return;
    }
    addMembersPicker.innerHTML = '';
    candidates.forEach(uid => {
        const u = friendsData[uid];
        if (!u) return;
        const dname = displayNameFor(uid, u.displayName || u.username);
        const color = getColor(u.displayName || u.username);
        const item = document.createElement('div');
        item.className = 'group-picker-item';
        item.dataset.uid = uid;
        item.innerHTML = `
            <div class="group-picker-checkbox"><i class="fas fa-check"></i></div>
            ${u.avatar
                ? `<div class="group-picker-avatar" style="background-image:url('${u.avatar}');"></div>`
                : `<div class="group-picker-avatar" style="background:linear-gradient(135deg,${color},${color}cc);">${escapeHtml(getInitial(dname))}</div>`}
            <span class="group-picker-name">${escapeHtml(dname)}</span>
        `;
        item.addEventListener('click', () => item.classList.toggle('selected'));
        addMembersPicker.appendChild(item);
    });
    addMembersModal.classList.add('open');
});

$('#addMembersClose').addEventListener('click', () => addMembersModal.classList.remove('open'));
$('#addMembersCancelBtn').addEventListener('click', () => addMembersModal.classList.remove('open'));
addMembersModal.addEventListener('click', e => {
    if (e.target === addMembersModal) addMembersModal.classList.remove('open');
});

$('#addMembersConfirmBtn').addEventListener('click', async () => {
    if (!currentGroup) return;
    const selected = [...addMembersPicker.querySelectorAll('.group-picker-item.selected')].map(i => i.dataset.uid);
    if (selected.length === 0) {
        showModal({ title: 'No selection', text: 'Pick at least one friend.', icon: 'fas fa-info-circle', confirmText: 'OK', hideCancel: true });
        return;
    }
    const btn = $('#addMembersConfirmBtn');
    btn.disabled = true;
    btn.textContent = 'Adding...';
    try {
        const gid = currentGroup.id;
        const updates = {};
        selected.forEach(uid => { updates['members/' + uid] = true; });
        await groupsRef.child(gid).update(updates);
        for (const uid of selected) {
            await unreadRef.child(uid).child('group_' + gid).transaction(c => (c || 0) + 1);
        }
        addMembersModal.classList.remove('open');
        showToast('Members added', `${selected.length} friend${selected.length > 1 ? 's' : ''} joined.`);
    } catch (e) {
        console.error(e);
        showToast('Failed', 'Could not add members.');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Add';
    }
});

groupSearchClose.addEventListener('click', () => {
    groupSearchBar.style.display = 'none';
    groupSearchInput.value = '';
    filterMessages(groupMessages, '');
});
groupSearchInput.addEventListener('input', e => {
    filterMessages(groupMessages, e.target.value.trim().toLowerCase());
});

groupReplyCancel.addEventListener('click', clearGroupReply);
groupEditCancel.addEventListener('click', cancelGroupEdit);

setupDraftAutosave(groupInput, () => currentGroup ? 'group_' + currentGroup.id : null);

// ============================================================
// FILTER
// ============================================================
function filterMessages(container, query) {
    const messages = container.querySelectorAll('.message');
    messages.forEach(m => {
        const textEl = m.querySelector('.msg-text');
        const text = (textEl?.textContent || '').toLowerCase();
        if (!query) {
            m.style.display = '';
            m.classList.remove('search-hit');
        } else if (text.includes(query)) {
            m.style.display = '';
            m.classList.add('search-hit');
        } else {
            m.style.display = 'none';
            m.classList.remove('search-hit');
        }
    });
}

// ============================================================
// EMOJI
// ============================================================
const EMOJI_CATEGORIES = {
    smileys: ['😀','😁','😂','🤣','😃','😄','😅','😆','😉','😊','😋','😎','😍','😘','🥰','😗','😙','😚','🙂','🤗','🤩','🤔','🤨','😐','😑','😶','🙄','😏','😣','😥','😮','🤐','😯','😪','😫','🥱','😴','😌','😛','😜','😝','🤤','😒','😓','😔','😕','🙃','🤑','😲','🙁','😖','😞','😟','😤','😢','😭','😦','😧','😨','😩','🤯','😬','😰','😱','🥵','🥶','😳','🤪','😵','🥴','😠','😡','🤬','😷','🤒','🤕','🤢','🤮','🥳','🥺','🤠','🤡','🤥','🤫','🤭','🧐','🤓'],
    gestures: ['👍','👎','👌','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','👇','☝️','✋','🤚','🖐️','🖖','👋','🤝','🙏','✍️','💪','🦾','🖕','🤌','🤏','👏','🙌','👐','🤲','🤜','🤛','✊','👊','🫰','🫱','🫲','🫳','🫴'],
    hearts: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','♥️','💌','💋','🫀','💐','🌹','🌷','🌺','🌸','🌼','🌻'],
    animals: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦','🐤','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐜','🦗','🕷️','🦂','🐢','🐍','🦎','🐙','🦑','🦐','🦞','🦀','🐠','🐟','🐡','🐬','🐳','🐋','🦈','🐊','🐅','🐆','🦓','🦍','🐘','🦏','🐪','🐫','🦒','🦘','🐃','🐂','🐄','🐎','🐖','🐏','🐑','🦙','🐐','🦌','🐕','🐩','🦮','🐕‍🦺','🐈','🐓','🦃','🦚','🦜','🦢','🦩','🕊️','🐇','🦝','🦨','🦡','🦦','🦥','🐁','🐀','🐿️','🦔'],
    food: ['🍏','🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🍆','🥑','🥦','🥬','🥒','🌶️','🫑','🌽','🥕','🫒','🧄','🧅','🥔','🍠','🥐','🥯','🍞','🥖','🥨','🧀','🥚','🍳','🧈','🥞','🧇','🥓','🥩','🍗','🍖','🦴','🌭','🍔','🍟','🍕','🫓','🥪','🥙','🧆','🌮','🌯','🫔','🥗','🥘','🫕','🥫','🍝','🍜','🍲','🍛','🍣','🍱','🥟','🦪','🍤','🍙','🍚','🍘','🍥','🥠','🥮','🍢','🍡','🍧','🍨','🍦','🥧','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪','🌰','🥜','🍯'],
    objects: ['💡','🔦','🕯️','🔑','🗝️','🔒','🔓','🔨','🪓','⛏️','⚒️','🛠️','🗡️','⚔️','🔫','🛡️','🚬','⚰️','⚱️','🏺','🔮','📿','🧿','💈','⚗️','🔭','🔬','🕳️','🩹','🩺','💊','💉','🩸','🧬','🦠','🧫','🧪','🌡️','🧹','🧺','🧻','🚽','🚰','🚿','🛁','🛀','🧼','🪥','🪒','🧽','🪣','🧴','🛎️','🔔','📣','📢','📯','🎙️','🎚️','🎛️','🎤','🎧','📻','🎷','🪗','🎸','🎹','🎺','🎻','🪕','🥁','🪘','📱','📲','💻','⌨️','🖥️','🖨️','🖱️','🖲️','💽','💾','💿','📀','🧮','🎥','🎞️','📽️','🎬','📺','📷','📸','📹','📼','🔍','🔎','🏮','🪔']
};

function renderEmojiCategory(cat) {
    const list = EMOJI_CATEGORIES[cat] || [];
    emojiGrid.innerHTML = list.map(e =>
        `<button class="emoji-item" data-emoji="${e}">${e}</button>`
    ).join('');
    emojiGrid.querySelectorAll('.emoji-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const emoji = btn.dataset.emoji;
            const target = document.activeElement;
            if (target && (target === dmInput || target === groupInput)) {
                const start = target.selectionStart || 0;
                const end = target.selectionEnd || 0;
                const val = target.value;
                target.value = val.slice(0, start) + emoji + val.slice(end);
                target.selectionStart = target.selectionEnd = start + emoji.length;
                target.focus();
            } else if (currentGroup && !currentDmUser) {
                groupInput.value += emoji;
                groupInput.focus();
            } else if (currentDmUser) {
                dmInput.value += emoji;
                dmInput.focus();
            }
        });
    });
}

$$('.emoji-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        $$('.emoji-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderEmojiCategory(tab.dataset.cat);
    });
});

function openEmojiPicker(anchorBtn) {
    const rect = anchorBtn.getBoundingClientRect();
    emojiPicker.style.left = Math.min(rect.left - 240, window.innerWidth - 340) + 'px';
    emojiPicker.style.right = 'auto';
    emojiPicker.classList.toggle('open');
    if (emojiPicker.classList.contains('open')) {
        renderEmojiCategory('smileys');
        $$('.emoji-tab').forEach(t => t.classList.toggle('active', t.dataset.cat === 'smileys'));
    }
}

if (dmEmojiBtn) dmEmojiBtn.addEventListener('click', e => { e.stopPropagation(); openEmojiPicker(dmEmojiBtn); });
if (groupEmojiBtn) groupEmojiBtn.addEventListener('click', e => { e.stopPropagation(); openEmojiPicker(groupEmojiBtn); });

// ============================================================
// ATTACHMENTS
// ============================================================
function clearPreview() {
    pendingFile = null; pendingType = null;
    uploadPreview.style.display = 'none';
    previewContent.innerHTML = '';
    dmImageInput.value = ''; dmFileInput.value = '';
}
function clearGroupPreview() {
    groupPendingFile = null; groupPendingType = null;
    groupUploadPreview.style.display = 'none';
    groupPreviewContent.innerHTML = '';
    groupImageInput.value = ''; groupFileInput.value = '';
}

function showPreview(file, type) {
    uploadPreview.style.display = 'flex';
    previewContent.innerHTML = '';
    if (type === 'image') {
        const reader = new FileReader();
        reader.onload = () => {
            previewContent.innerHTML = `
                <img src="${reader.result}" />
                <div class="preview-info">
                    <span class="preview-name">${escapeHtml(file.name)}</span>
                    <span class="preview-size">${formatBytes(file.size)}</span>
                </div>
            `;
        };
        reader.readAsDataURL(file);
    } else {
        previewContent.innerHTML = `
            <div class="preview-file"><i class="fas fa-file"></i></div>
            <div class="preview-info">
                <span class="preview-name">${escapeHtml(file.name)}</span>
                <span class="preview-size">${formatBytes(file.size)}</span>
            </div>
        `;
    }
}

function showGroupPreview(file, type) {
    groupUploadPreview.style.display = 'flex';
    groupPreviewContent.innerHTML = '';
    if (type === 'image') {
        const reader = new FileReader();
        reader.onload = () => {
            groupPreviewContent.innerHTML = `
                <img src="${reader.result}" />
                <div class="preview-info">
                    <span class="preview-name">${escapeHtml(file.name)}</span>
                    <span class="preview-size">${formatBytes(file.size)}</span>
                </div>
            `;
        };
        reader.readAsDataURL(file);
    } else {
        groupPreviewContent.innerHTML = `
            <div class="preview-file"><i class="fas fa-file"></i></div>
            <div class="preview-info">
                <span class="preview-name">${escapeHtml(file.name)}</span>
                <span class="preview-size">${formatBytes(file.size)}</span>
            </div>
        `;
    }
}

dmAttachBtn.addEventListener('click', e => {
    e.stopPropagation();
    dmAttachMenu.classList.toggle('open');
});
dmAttachMenu.querySelectorAll('.attach-item').forEach(item => {
    item.addEventListener('click', () => {
        const type = item.dataset.type;
        dmAttachMenu.classList.remove('open');
        if (type === 'image') dmImageInput.click();
        else if (type === 'file') dmFileInput.click();
    });
});
dmImageInput.addEventListener('change', () => {
    const f = dmImageInput.files[0];
    if (!f) return;
    pendingFile = f; pendingType = 'image';
    showPreview(f, 'image');
});
dmFileInput.addEventListener('change', () => {
    const f = dmFileInput.files[0];
    if (!f) return;
    pendingFile = f; pendingType = 'file';
    showPreview(f, 'file');
});
previewRemove.addEventListener('click', clearPreview);

groupAttachBtn.addEventListener('click', e => {
    e.stopPropagation();
    groupAttachMenu.classList.toggle('open');
});
groupAttachMenu.querySelectorAll('.attach-item').forEach(item => {
    item.addEventListener('click', () => {
        const type = item.dataset.type;
        groupAttachMenu.classList.remove('open');
        if (type === 'image') groupImageInput.click();
        else if (type === 'file') groupFileInput.click();
    });
});
groupImageInput.addEventListener('change', () => {
    const f = groupImageInput.files[0];
    if (!f) return;
    groupPendingFile = f; groupPendingType = 'image';
    showGroupPreview(f, 'image');
});
groupFileInput.addEventListener('change', () => {
    const f = groupFileInput.files[0];
    if (!f) return;
    groupPendingFile = f; groupPendingType = 'file';
    showGroupPreview(f, 'file');
});
groupPreviewRemove.addEventListener('click', clearGroupPreview);

// ============================================================
// VOICE RECORDING
// ============================================================
async function startRecording(target) {
    if (isRecording) return;
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        recordingSeconds = 0;
        isRecording = true;
        recordingTarget = target;

        mediaRecorder.ondataavailable = e => {
            if (e.data.size > 0) audioChunks.push(e.data);
        };

        mediaRecorder.onstop = async () => {
            stream.getTracks().forEach(t => t.stop());
            if (recordingSeconds < 1) { cancelRecording(); return; }
            const blob = new Blob(audioChunks, { type: 'audio/webm' });
            const reader = new FileReader();
            reader.onload = async () => {
                const msg = {
                    type: 'voice', user: username, displayName,
                    color: getColor(displayName),
                    avatar: currentProfile?.avatar || '',
                    timestamp: Date.now(), userId,
                    duration: recordingSeconds, data: reader.result
                };
                try {
                    if (target === 'dm' && currentDmUser) {
                        if (dmReplyTo) msg.replyTo = dmReplyTo;
                        const key = dmKey(userId, currentDmUser.uid);
                        await dmsRef.child(key).child('messages').push(msg);
                        await unreadRef.child(currentDmUser.uid).child('dm_' + userId).transaction(c => (c || 0) + 1);
                        clearDmReply();
                    } else if (target === 'group' && currentGroup) {
                        if (groupReplyTo) msg.replyTo = groupReplyTo;
                        await groupsRef.child(currentGroup.id).child('messages').push(msg);
                        clearGroupReply();
                        const g = userGroups[currentGroup.id];
                        if (g?.members) {
                            for (const m of Object.keys(g.members)) {
                                if (m !== userId) {
                                    await unreadRef.child(m).child('group_' + currentGroup.id).transaction(c => (c || 0) + 1);
                                }
                            }
                        }
                    }
                } catch (e) { console.error(e); }
            };
            reader.readAsDataURL(blob);
            cancelRecording();
        };

        mediaRecorder.start();
        if (target === 'dm') {
            recordingIndicator.style.display = 'flex';
            dmMicBtn.classList.add('recording');
        } else {
            groupRecordingIndicator.style.display = 'flex';
            groupMicBtn.classList.add('recording');
        }

        recordingTimer = setInterval(() => {
            recordingSeconds++;
            const label = formatDuration(recordingSeconds);
            if (target === 'dm') recTime.textContent = label;
            else groupRecTime.textContent = label;
        }, 1000);
    } catch (err) {
        console.error('Recording failed:', err);
        showModal({ title: 'Microphone blocked', text: 'Please allow microphone access in your browser.', icon: 'fas fa-microphone-slash', danger: true, confirmText: 'OK', hideCancel: true });
    }
}

function cancelRecording() {
    if (recordingTimer) clearInterval(recordingTimer);
    recordingTimer = null;
    isRecording = false;
    recordingTarget = null;
    recordingIndicator.style.display = 'none';
    groupRecordingIndicator.style.display = 'none';
    dmMicBtn.classList.remove('recording');
    groupMicBtn.classList.remove('recording');
    recTime.textContent = '0:00';
    groupRecTime.textContent = '0:00';
}

function stopRecording(send) {
    if (!mediaRecorder || !isRecording) return;
    if (send) mediaRecorder.stop();
    else {
        mediaRecorder.onstop = null;
        mediaRecorder.stop();
        cancelRecording();
    }
}

dmMicBtn.addEventListener('click', () => {
    if (isRecording) stopRecording(true);
    else startRecording('dm');
});
groupMicBtn.addEventListener('click', () => {
    if (isRecording) stopRecording(true);
    else startRecording('group');
});

recCancel.addEventListener('click', () => stopRecording(false));
recSend.addEventListener('click', () => stopRecording(true));
groupRecCancel.addEventListener('click', () => stopRecording(false));
groupRecSend.addEventListener('click', () => stopRecording(true));

// ============================================================
// TYPING
// ============================================================
let _typingTimeout = null;
function startTyping() {
    if (!currentDmUser) return;
    const key = dmKey(userId, currentDmUser.uid);
    typingRef.child(key).child(userId).set(true);
    clearTimeout(_typingTimeout);
    _typingTimeout = setTimeout(stopTyping, 2000);
}
function stopTyping() {
    if (!currentDmUser) return;
    const key = dmKey(userId, currentDmUser.uid);
    typingRef.child(key).child(userId).remove();
}
dmInput.addEventListener('input', () => {
    if (typingEnabled) startTyping();
});

// ============================================================
// LIGHTBOX + VOICE
// ============================================================
window.openLightbox = function (src) {
    lightboxImg.src = src;
    lightbox.classList.add('open');
};
$('#lightboxClose').addEventListener('click', () => {
    lightbox.classList.remove('open');
    lightboxImg.src = '';
});
lightbox.addEventListener('click', e => {
    if (e.target === lightbox) {
        lightbox.classList.remove('open');
        lightboxImg.src = '';
    }
});

let _currentAudio = null;
let _currentVoiceBtn = null;
window.playVoice = function (btn, src) {
    if (_currentAudio && _currentVoiceBtn === btn) {
        _currentAudio.pause();
        _currentAudio = null;
        _currentVoiceBtn = null;
        btn.innerHTML = '<i class="fas fa-play"></i>';
        return;
    }
    if (_currentAudio) {
        _currentAudio.pause();
        if (_currentVoiceBtn) _currentVoiceBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
    _currentAudio = new Audio(src);
    _currentVoiceBtn = btn;
    btn.innerHTML = '<i class="fas fa-pause"></i>';
    _currentAudio.play();
    _currentAudio.onended = () => {
        btn.innerHTML = '<i class="fas fa-play"></i>';
        _currentAudio = null;
        _currentVoiceBtn = null;
    };
};

// ============================================================
// PROFILE VIEW
// ============================================================
async function viewProfileById(uid) {
    try {
        const uSnap = await usersRef.child(uid).once('value');
        const data = uSnap.val();
        if (!data) { showToast('Not found', 'User no longer exists.'); return; }
        const dname = displayNameFor(uid, data.displayName || data.username);
        const color = getColor(data.displayName || data.username);
        const banner = data.banner || '';
        const avatar = data.avatar || '';

        const bg = $('#viewBannerGradient');
        if (banner) {
            bg.style.backgroundImage = `url('${banner}')`;
        } else {
            bg.style.backgroundImage = '';
            bg.style.background = `linear-gradient(135deg, ${color}, ${color}cc)`;
        }

        const av = $('#viewAvatar');
        if (avatar) {
            av.style.backgroundImage = `url('${avatar}')`;
            av.style.backgroundSize = 'cover';
            av.style.backgroundPosition = 'center';
            av.textContent = '';
        } else {
            av.style.backgroundImage = '';
            av.style.background = `linear-gradient(135deg, ${color}, ${color}cc)`;
            av.textContent = getInitial(dname);
        }

        $('#viewDisplayName').textContent = dname;
        $('#viewUsername').textContent = '@' + data.username;

        const online = isUserOnline(uid);
        const statusEl = $('#viewStatus');
        statusEl.className = 'profile-status ' + (online ? '' : 'invisible');
        statusEl.innerHTML = `<span class="profile-dot"></span> ${statusLabel(uid)}`;

        $('#viewBio').textContent = data.bio || 'No bio yet.';

        const joined = data.createdAt || Date.now();
        $('#viewJoined').textContent = 'Joined ' + new Date(joined).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

        const actionsRow = $('#profileActionsRow');
        actionsRow.innerHTML = '';
        if (uid !== userId && friends.includes(uid)) {
            const msgBtn = document.createElement('button');
            msgBtn.className = 'profile-action-btn';
            msgBtn.innerHTML = '<i class="fas fa-comment"></i> Message';
            msgBtn.onclick = () => {
                profileViewModal.classList.remove('open');
                openDM(uid, dname, data);
            };
            actionsRow.appendChild(msgBtn);

            const removeBtn = document.createElement('button');
            removeBtn.className = 'profile-action-btn secondary';
            removeBtn.innerHTML = '<i class="fas fa-user-minus"></i> Remove';
            removeBtn.onclick = async () => {
                profileViewModal.classList.remove('open');
                await removeFriend(uid);
            };
            actionsRow.appendChild(removeBtn);
        } else if (uid !== userId) {
            const addBtn = document.createElement('button');
            addBtn.className = 'profile-action-btn';
            addBtn.innerHTML = '<i class="fas fa-user-plus"></i> Add friend';
            addBtn.onclick = () => {
                profileViewModal.classList.remove('open');
                sendFriendRequest(uid);
            };
            actionsRow.appendChild(addBtn);
        }

        profileViewModal.classList.add('open');
    } catch (err) {
        console.error('viewProfile error:', err);
    }
}

$('#profileViewClose').addEventListener('click', () => profileViewModal.classList.remove('open'));
profileViewModal.addEventListener('click', e => {
    if (e.target === profileViewModal) profileViewModal.classList.remove('open');
});

// ============================================================
// EDIT PROFILE
// ============================================================
myProfileBtn.addEventListener('click', () => {
    accountMenu.classList.remove('open');
    openEditProfile();
});

function openEditProfile() {
    if (!currentProfile) return;
    editState.avatar = currentProfile.avatar || '';
    editState.banner = currentProfile.banner || '';
    const color = getColor(displayName);

    const bannerBg = $('#editBannerGradient');
    if (editState.banner) {
        bannerBg.style.backgroundImage = `url('${editState.banner}')`;
    } else {
        bannerBg.style.backgroundImage = '';
        bannerBg.style.background = `linear-gradient(135deg, ${color}, ${color}cc)`;
    }

    if (editState.avatar) {
        editAvatar.style.backgroundImage = `url('${editState.avatar}')`;
        editAvatar.style.backgroundSize = 'cover';
        editAvatar.style.backgroundPosition = 'center';
        editAvatar.innerHTML = '<div class="avatar-edit-overlay"><i class="fas fa-camera"></i></div>';
    } else {
        editAvatar.style.backgroundImage = '';
        editAvatar.style.background = `linear-gradient(135deg, ${color}, ${color}cc)`;
        editAvatar.innerHTML = escapeHtml(getInitial(displayName)) + '<div class="avatar-edit-overlay"><i class="fas fa-camera"></i></div>';
    }

    editDisplayNameInput.value = displayName;
    editUsernameInput.value = username;
    editBioInput.value = currentProfile.bio || '';
    bioCount.textContent = (currentProfile.bio || '').length;

    const lastChange = currentProfile.usernameChangedAt || 0;
    const daysSince = (Date.now() - lastChange) / 86400000;
    if (lastChange && daysSince < 15) {
        const daysLeft = Math.ceil(15 - daysSince);
        usernameChangeHint.textContent = `You can change your username in ${daysLeft} day${daysLeft > 1 ? 's' : ''}.`;
        editUsernameInput.disabled = true;
    } else {
        usernameChangeHint.textContent = 'You can change your username now.';
        editUsernameInput.disabled = false;
    }

    editProfileModal.classList.add('open');
}

editAvatar.addEventListener('click', () => avatarInput.click());
editBanner.addEventListener('click', () => bannerInput.click());

avatarInput.addEventListener('change', () => {
    const f = avatarInput.files[0];
    if (!f) return;
    if (f.size > 500 * 1024) {
        showModal({ title: 'Image too large', text: 'Avatars must be under 500 KB.', icon: 'fas fa-exclamation-triangle', danger: true, confirmText: 'OK', hideCancel: true });
        return;
    }
    const reader = new FileReader();
    reader.onload = () => {
        editState.avatar = reader.result;
        editAvatar.style.backgroundImage = `url('${reader.result}')`;
        editAvatar.style.backgroundSize = 'cover';
        editAvatar.style.backgroundPosition = 'center';
        editAvatar.innerHTML = '<div class="avatar-edit-overlay"><i class="fas fa-camera"></i></div>';
    };
    reader.readAsDataURL(f);
});

bannerInput.addEventListener('change', () => {
    const f = bannerInput.files[0];
    if (!f) return;
    if (f.size > 1024 * 1024) {
        showModal({ title: 'Image too large', text: 'Banners must be under 1 MB.', icon: 'fas fa-exclamation-triangle', danger: true, confirmText: 'OK', hideCancel: true });
        return;
    }
    const reader = new FileReader();
    reader.onload = () => {
        editState.banner = reader.result;
        const bg = $('#editBannerGradient');
        bg.style.backgroundImage = `url('${reader.result}')`;
    };
    reader.readAsDataURL(f);
});

editBioInput.addEventListener('input', () => {
    bioCount.textContent = editBioInput.value.length;
});

editProfileClose.addEventListener('click', () => editProfileModal.classList.remove('open'));
$('#editCancelBtn').addEventListener('click', () => editProfileModal.classList.remove('open'));
editProfileModal.addEventListener('click', e => {
    if (e.target === editProfileModal) editProfileModal.classList.remove('open');
});

$('#editSaveBtn').addEventListener('click', async () => {
    const newDisplayName = editDisplayNameInput.value.trim();
    const newUsername = editUsernameInput.value.trim().toLowerCase();
    const newBio = editBioInput.value.trim();

    if (!newDisplayName) {
        showModal({ title: 'Missing name', text: 'Display name cannot be empty.', icon: 'fas fa-info-circle', confirmText: 'OK', hideCancel: true });
        return;
    }
    if (newDisplayName.length > 20) {
        showModal({ title: 'Too long', text: 'Display name must be 20 characters or less.', icon: 'fas fa-info-circle', confirmText: 'OK', hideCancel: true });
        return;
    }
    const btn = $('#editSaveBtn');
    btn.disabled = true;
    btn.textContent = 'Saving...';
    try {
        const updates = {
            displayName: newDisplayName, bio: newBio,
            avatar: editState.avatar, banner: editState.banner
        };
        if (!editUsernameInput.disabled && newUsername !== username) {
            if (newUsername.length < 3 || newUsername.length > 14) {
                showModal({ title: 'Invalid username', text: 'Username must be 3–14 characters.', icon: 'fas fa-info-circle', confirmText: 'OK', hideCancel: true });
                btn.disabled = false; btn.textContent = 'Save';
                return;
            }
            if (!/^[a-z0-9_]+$/.test(newUsername)) {
                showModal({ title: 'Invalid username', text: 'Username: lowercase letters, numbers, underscores only.', icon: 'fas fa-info-circle', confirmText: 'OK', hideCancel: true });
                btn.disabled = false; btn.textContent = 'Save';
                return;
            }
            const check = await usersRef.child('usernames').child(newUsername).once('value');
            if (check.exists()) {
                showModal({ title: 'Username taken', text: 'That username is already in use.', icon: 'fas fa-info-circle', confirmText: 'OK', hideCancel: true });
                btn.disabled = false; btn.textContent = 'Save';
                return;
            }
            updates.username = newUsername;
            updates.usernameChangedAt = Date.now();
            await usersRef.child('usernames').child(username).remove();
            await usersRef.child('usernames').child(newUsername).set(userId);
        }
        await usersRef.child(userId).update(updates);
        currentProfile = {
            ...currentProfile,
            displayName: newDisplayName,
            username: updates.username || username,
            bio: newBio,
            avatar: editState.avatar,
            banner: editState.banner,
            usernameChangedAt: updates.usernameChangedAt || currentProfile.usernameChangedAt
        };
        displayName = currentProfile.displayName;
        if (updates.username) username = updates.username;
        updateUserBadge();
        updateSettingsUser();
        editProfileModal.classList.remove('open');
        showToast('Profile saved', 'Your changes are live.');
    } catch (err) {
        console.error('Save profile error:', err);
        showModal({ title: 'Failed', text: 'Could not save profile.', icon: 'fas fa-exclamation-triangle', danger: true, confirmText: 'OK', hideCancel: true });
    } finally {
        btn.disabled = false;
        btn.textContent = 'Save';
    }
});

// ============================================================
// SETTINGS — fixed with delegation
// ============================================================
function openSettings(section = 'account') {
    $$('.settings-section').forEach(s => s.classList.toggle('active', s.dataset.section === section));
    $$('.settings-nav-item').forEach(i => i.classList.toggle('active', i.dataset.section === section));
    settingsModal.classList.add('open');
}

// Close button — use event delegation on the modal itself
settingsModal.addEventListener('click', async e => {
    // Close button
    if (e.target.closest('#settingsClose')) {
        e.stopPropagation();
        settingsModal.classList.remove('open');
        return;
    }
    // Click overlay to close
    if (e.target === settingsModal) {
        settingsModal.classList.remove('open');
        return;
    }
    // Nav item
    const navItem = e.target.closest('.settings-nav-item');
    if (navItem) {
        const section = navItem.dataset.section;
        $$('.settings-nav-item').forEach(i => i.classList.toggle('active', i === navItem));
        $$('.settings-section').forEach(s => s.classList.toggle('active', s.dataset.section === section));
        return;
    }
    // Settings button (delegated!)
    const btn = e.target.closest('.settings-btn');
    if (btn) {
        const action = btn.dataset.action;
        if (!action) return;
        if (action === 'edit-displayname' || action === 'edit-username' || action === 'edit-bio') {
            settingsModal.classList.remove('open');
            openEditProfile();
        } else if (action === 'change-password') {
            if (currentUser?.email) {
                const ok = await showModal({
                    title: 'Change password?',
                    text: 'We will email you a reset link.',
                    icon: 'fas fa-lock', confirmText: 'Send Link'
                });
                if (ok) {
                    try {
                        await auth.sendPasswordResetEmail(currentUser.email);
                        showToast('Email sent', 'Check your inbox.');
                    } catch (e) { showToast('Failed', 'Could not send email.'); }
                }
            }
        } else if (action === 'logout-all') {
            const ok = await showModal({
                title: 'Log out everywhere?',
                text: 'You will be signed out on all devices.',
                icon: 'fas fa-sign-out-alt', danger: true, confirmText: 'Log Out All'
            });
            if (ok) {
                settingsModal.classList.remove('open');
                await auth.signOut();
            }
        } else if (action === 'delete-account') {
            const ok = await showModal({
                title: 'Delete account?',
                text: 'This permanently removes your account and all data. This cannot be undone.',
                icon: 'fas fa-trash', danger: true, confirmText: 'Delete Forever'
            });
            if (ok) {
                try {
                    await usersRef.child('usernames').child(username).remove();
                    await usersRef.child(userId).remove();
                    await auth.currentUser.delete();
                } catch (e) {
                    showToast('Failed', 'Please log out and back in, then try again.');
                }
            }
        } else if (action === 'export-data') {
            try {
                const data = {
                    profile: currentProfile,
                    username, displayName,
                    exportedAt: new Date().toISOString(),
                    friendsCount: friends.length,
                    groupsCount: Object.keys(userGroups).length
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `whisper-${username}-${Date.now()}.json`;
                a.click();
                URL.revokeObjectURL(url);
                showToast('Exported', 'Your data has been downloaded.');
            } catch (e) {
                showToast('Failed', 'Could not export data.');
            }
        } else if (action === 'clear-drafts') {
            const ok = await showModal({
                title: 'Clear all drafts?',
                text: 'All unsent message drafts will be removed.',
                icon: 'fas fa-eraser', danger: true, confirmText: 'Clear'
            });
            if (ok) {
                try {
                    await draftsRef.child(userId).remove();
                    dmInput.value = '';
                    groupInput.value = '';
                    showToast('Cleared', 'All drafts removed.');
                } catch (e) {
                    showToast('Failed', 'Could not clear drafts.');
                }
            }
        }
        return;
    }
    // Theme cycle button
    if (e.target.closest('#themeCycleBtn')) {
        toggleTheme();
        return;
    }
    // Settings logout button
    if (e.target.closest('#settingsLogout')) {
        const ok = await showModal({
            title: 'Log out?',
            text: 'You will need to sign in again to use Whisper.',
            icon: 'fas fa-sign-out-alt', danger: true, confirmText: 'Log Out'
        });
        if (!ok) return;
        settingsModal.classList.remove('open');
        await auth.signOut();
    }
});

logoutBtn.addEventListener('click', async () => {
    accountMenu.classList.remove('open');
    const ok = await showModal({
        title: 'Log out?',
        text: 'You will need to sign in again to use Whisper.',
        icon: 'fas fa-sign-out-alt', danger: true, confirmText: 'Log Out'
    });
    if (!ok) return;
    await auth.signOut();
});

// Toggles
$('#notifToggle').addEventListener('change', e => {
    notifSoundEnabled = e.target.checked;
    localStorage.setItem('notif_sound', notifSoundEnabled ? '1' : '0');
});
$('#typingToggle').addEventListener('change', e => {
    typingEnabled = e.target.checked;
    localStorage.setItem('typing_enabled', typingEnabled ? '1' : '0');
});
$('#compactToggle').addEventListener('change', e => {
    document.body.classList.toggle('compact', e.target.checked);
    localStorage.setItem('compact_mode', e.target.checked ? '1' : '0');
});
$('#dateSepToggle').addEventListener('change', e => {
    dateSeparatorsEnabled = e.target.checked;
    localStorage.setItem('date_sep', dateSeparatorsEnabled ? '1' : '0');
});
const reactionsToggle = $('#reactionsToggle');
if (reactionsToggle) {
    reactionsToggle.addEventListener('change', e => {
        reactionsEnabled = e.target.checked;
        localStorage.setItem('reactions_enabled', reactionsEnabled ? '1' : '0');
    });
}
const enterSendToggle = $('#enterSendToggle');
if (enterSendToggle) {
    enterSendToggle.addEventListener('change', e => {
        enterToSend = e.target.checked;
        localStorage.setItem('enter_to_send', enterToSend ? '1' : '0');
    });
}

(function restoreToggles() {
    const ns = localStorage.getItem('notif_sound');
    if (ns === '0') { notifSoundEnabled = false; $('#notifToggle').checked = false; }
    const te = localStorage.getItem('typing_enabled');
    if (te === '0') { typingEnabled = false; $('#typingToggle').checked = false; }
    const cm = localStorage.getItem('compact_mode');
    if (cm === '1') { document.body.classList.add('compact'); $('#compactToggle').checked = true; }
    const ds = localStorage.getItem('date_sep');
    if (ds === '0') { dateSeparatorsEnabled = false; $('#dateSepToggle').checked = false; }
    const re = localStorage.getItem('reactions_enabled');
    if (re === '0' && reactionsToggle) { reactionsEnabled = false; reactionsToggle.checked = false; }
    const es = localStorage.getItem('enter_to_send');
    if (es === '0' && enterSendToggle) { enterToSend = false; enterSendToggle.checked = false; }
})();

// ============================================================
// BLOCKED LIST
// ============================================================
function renderBlockedList() {
    const list = $('#blockedList');
    if (!list) return;
    const uids = Object.keys(blockedUsers);
    if (uids.length === 0) {
        list.innerHTML = '<div class="empty-message">No blocked users.</div>';
        return;
    }
    list.innerHTML = '';
    uids.forEach(uid => {
        const u = friendsData[uid] || {};
        const dname = displayNameFor(uid, u.displayName || u.username || 'Unknown');
        const color = getColor(u.displayName || u.username || dname);
        const el = document.createElement('div');
        el.className = 'blocked-user';
        el.innerHTML = `
            ${u.avatar
                ? `<div class="blocked-user-avatar" style="background-image:url('${u.avatar}');"></div>`
                : `<div class="blocked-user-avatar" style="background:linear-gradient(135deg,${color},${color}cc);">${escapeHtml(getInitial(dname))}</div>`}
            <div class="blocked-user-info">
                <div class="blocked-user-name">${escapeHtml(dname)}</div>
                <div class="blocked-user-handle">@${escapeHtml(u.username || 'unknown')}</div>
            </div>
            <button class="blocked-user-unblock">Unblock</button>
        `;
        el.querySelector('.blocked-user-unblock').addEventListener('click', async () => {
            await blockedRef.child(userId).child(uid).remove();
            showToast('Unblocked', `${dname} can message you again.`);
        });
        list.appendChild(el);
    });
}

// ============================================================
// SIDEBAR SEARCH
// ============================================================
const sidebarSearch = $('#sidebarSearch');
sidebarSearch.addEventListener('input', () => {
    const q = sidebarSearch.value.trim().toLowerCase();
    const items = dmList.querySelectorAll('.dm-item');
    items.forEach(el => {
        const name = el.querySelector('.dm-item-name')?.textContent.toLowerCase() || '';
        el.style.display = name.includes(q) || !q ? '' : 'none';
    });
});

// ============================================================
// ESC — close everything
// ============================================================
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        accountMenu.classList.remove('open');
        contextMenu.classList.remove('open');
        chatOptionsMenu.classList.remove('open');
        dmAttachMenu.classList.remove('open');
        groupAttachMenu.classList.remove('open');
        emojiPicker.classList.remove('open');
        reactionPicker.classList.remove('open');
        lightbox.classList.remove('open');
        profileViewModal.classList.remove('open');
        editProfileModal.classList.remove('open');
        settingsModal.classList.remove('open');
        newGroupModal.classList.remove('open');
        groupMembersModal.classList.remove('open');
        addMembersModal.classList.remove('open');
        groupSettingsModal.classList.remove('open');
        themeGalleryModal.classList.remove('open');
        nicknameModal.classList.remove('open');
        if (dmEditingId) cancelDmEdit();
        if (groupEditingId) cancelGroupEdit();
    }
});

console.log('%c✧ Whisper', 'font-size:20px;font-weight:bold;color:#4a8b7a;');
console.log('A quiet place to talk.');