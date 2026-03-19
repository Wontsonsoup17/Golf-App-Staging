// ==================== LOCAL AUTH SYSTEM ====================
// Drop-in replacement for Firebase Auth using localStorage.
// Auth is always local. Group rounds (activeRounds) use real Firebase.

const LOCAL_USERS_KEY = 'wg-users';
const LOCAL_SESSION_KEY = 'wg-session';

// Simple hash for passwords (NOT cryptographically secure — fine for local demo)
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + c;
    hash |= 0;
  }
  return 'h_' + Math.abs(hash).toString(36);
}

function getLocalUsers() {
  try { return JSON.parse(localStorage.getItem(LOCAL_USERS_KEY)) || {}; } catch(e) { return {}; }
}
function saveLocalUsers(users) {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}
function getSession() {
  try { return JSON.parse(localStorage.getItem(LOCAL_SESSION_KEY)); } catch(e) { return null; }
}
function setSession(user) {
  localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(user));
}
function clearSession() {
  localStorage.removeItem(LOCAL_SESSION_KEY);
}

// ==================== AVATAR STORAGE ====================
function getUserAvatar(uid) {
  try { return localStorage.getItem('wg-avatar-' + uid) || null; } catch(e) { return null; }
}
function setUserAvatar(uid, dataUrl) {
  localStorage.setItem('wg-avatar-' + uid, dataUrl);
}
function removeUserAvatar(uid) {
  localStorage.removeItem('wg-avatar-' + uid);
}

// ==================== AUTH API ====================
const auth = {
  currentUser: null,
  _listeners: [],

  onAuthStateChanged(callback) {
    this._listeners.push(callback);
    const session = getSession();
    if (session) {
      this.currentUser = { uid: session.uid, displayName: session.username, email: session.username + '@local' };
      setTimeout(() => callback(this.currentUser), 0);
    } else {
      this.currentUser = null;
      setTimeout(() => callback(null), 0);
    }
    const listeners = this._listeners;
    const cb = callback;
    return function() {
      const idx = listeners.indexOf(cb);
      if (idx > -1) listeners.splice(idx, 1);
    };
  },

  _notifyListeners() {
    this._listeners.forEach(cb => cb(this.currentUser));
  },

  createUserWithEmailAndPassword(email, password) {
    const self = this;
    const username = email.split('@')[0].toLowerCase();
    const users = getLocalUsers();
    // Reuse existing uid if account exists locally (e.g. stale cache), otherwise generate new
    const uid = (users[username] && users[username].uid) || 'local_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const passwordHash = simpleHash(password);
    const createdAt = (users[username] && users[username].createdAt) || Date.now();
    users[username] = { uid, username, passwordHash, createdAt };
    saveLocalUsers(users);

    const user = { uid, displayName: username, email };
    user.updateProfile = function(profile) {
      if (profile.displayName) {
        user.displayName = profile.displayName;
        const u = getLocalUsers();
        if (u[username]) { u[username].displayName = profile.displayName; saveLocalUsers(u); }
        setSession({ uid, username: profile.displayName });
        // Update displayName in Firebase credentials (awaited)
        return db.ref('credentials/' + username + '/displayName').set(profile.displayName).catch(function() {});
      }
      return Promise.resolve();
    };

    self.currentUser = user;
    setSession({ uid, username: user.displayName || username });
    self._notifyListeners();

    // Save credentials to Firebase for cross-device sign-in (awaited via returned promise)
    var credData = { uid: uid, username: username, passwordHash: passwordHash, createdAt: createdAt };
    return db.ref('credentials/' + username).set(credData).then(function() {
      return { user: user };
    }).catch(function() {
      // Firebase write failed but local account created — still return success
      return { user: user };
    });
  },

  signInWithEmailAndPassword(email, password) {
    const self = this;
    const username = email.split('@')[0].toLowerCase();
    const passwordHash = simpleHash(password);

    // Try localStorage first (fast)
    const users = getLocalUsers();
    const stored = users[username];
    if (stored && stored.passwordHash === passwordHash) {
      const user = { uid: stored.uid, displayName: stored.displayName || stored.username, email };
      self.currentUser = user;
      setSession({ uid: stored.uid, username: user.displayName });
      self._notifyListeners();
      // Sync to Firebase if not already there
      db.ref('credentials/' + username).once('value').then(function(snap) {
        if (!snap.exists()) {
          db.ref('credentials/' + username).set(stored).catch(function() {});
        }
      }).catch(function() {});
      return Promise.resolve({ user });
    }

    // Local lookup failed — try Firebase
    return db.ref('credentials/' + username).once('value').then(function(snap) {
      if (!snap.exists()) {
        return Promise.reject({ code: 'auth/invalid-credential', message: 'Invalid username or password.' });
      }
      var fbCred = snap.val();
      if (fbCred.passwordHash !== passwordHash) {
        return Promise.reject({ code: 'auth/invalid-credential', message: 'Invalid username or password.' });
      }
      // Cache credentials locally for future fast sign-in
      var localUsers = getLocalUsers();
      localUsers[username] = fbCred;
      saveLocalUsers(localUsers);

      var user = { uid: fbCred.uid, displayName: fbCred.displayName || fbCred.username, email: email };
      self.currentUser = user;
      setSession({ uid: fbCred.uid, username: user.displayName });
      self._notifyListeners();
      return { user: user };
    });
  },

  signOut() {
    this.currentUser = null;
    clearSession();
    this._notifyListeners();
    return Promise.resolve();
  }
};

// ==================== PROFILE MANAGEMENT ====================

function changeUserPassword(currentPassword, newPassword) {
  var user = auth.currentUser;
  if (!user) return Promise.reject({ message: 'Not signed in.' });
  var username = (user.email || '').split('@')[0].toLowerCase();
  if (!username) return Promise.reject({ message: 'Cannot determine username.' });

  var currentHash = simpleHash(currentPassword);
  var users = getLocalUsers();
  var stored = users[username];
  if (!stored || stored.passwordHash !== currentHash) {
    return Promise.reject({ message: 'Current password is incorrect.' });
  }

  var newHash = simpleHash(newPassword);
  stored.passwordHash = newHash;
  users[username] = stored;
  saveLocalUsers(users);

  // Update Firebase credentials
  return db.ref('credentials/' + username + '/passwordHash').set(newHash).then(function() {
    return { success: true };
  }).catch(function() {
    // Local updated even if Firebase fails
    return { success: true };
  });
}

function changeUsername(newUsername) {
  var user = auth.currentUser;
  if (!user) return Promise.reject({ message: 'Not signed in.' });
  var oldUsername = (user.email || '').split('@')[0].toLowerCase();
  if (!oldUsername) return Promise.reject({ message: 'Cannot determine current username.' });

  var newLower = newUsername.toLowerCase().trim();
  if (newLower === oldUsername) return Promise.reject({ message: 'That is already your username.' });
  if (!/^[a-zA-Z0-9_]{2,20}$/.test(newUsername)) return Promise.reject({ message: 'Username must be 2-20 characters: letters, numbers, underscores only.' });

  // Check if new username is taken in Firebase
  return db.ref('usernames/' + newLower).once('value').then(function(snap) {
    if (snap.exists()) {
      return Promise.reject({ message: 'That username is already taken.' });
    }

    var users = getLocalUsers();
    var oldData = users[oldUsername];
    if (!oldData) return Promise.reject({ message: 'Account data not found.' });

    // Update local storage — create new entry, remove old
    var newData = Object.assign({}, oldData, { username: newLower, displayName: newUsername });
    users[newLower] = newData;
    delete users[oldUsername];
    saveLocalUsers(users);

    // Update session and current user
    user.displayName = newUsername;
    user.email = newLower + '@westchestergolf.app';
    setSession({ uid: user.uid, username: newUsername });

    // Update Firebase: new credentials, remove old, update usernames, update profile
    return Promise.all([
      db.ref('credentials/' + newLower).set(newData),
      db.ref('credentials/' + oldUsername).remove(),
      db.ref('usernames/' + newLower).set(user.uid),
      db.ref('usernames/' + oldUsername).remove(),
      db.ref('users/' + user.uid + '/profile/username').set(newUsername)
    ]).then(function() {
      return { success: true };
    }).catch(function() {
      // Local updated even if Firebase partially fails
      return { success: true };
    });
  });
}

// ==================== REAL FIREBASE FOR GROUP ROUNDS ====================
// Loads Firebase SDK dynamically. Only activeRounds paths use real Firebase.
// Everything else (auth, user data, stats) stays in localStorage.

var _firebaseDB = null;
var _firebaseReady = false;
var _firebaseLoadPromise = null;
var _firebaseLoadResolve = null;

// Promise that resolves when Firebase SDK is loaded and initialized
_firebaseLoadPromise = new Promise(function(resolve) {
  _firebaseLoadResolve = resolve;
});

// *** FIREBASE CONFIG ***
var FIREBASE_CONFIG = {
  apiKey: "AIzaSyCca3qFg0zgHwOWowzLqmMPSoCy-ybDNoI",
  authDomain: "westchester-golf-app.firebaseapp.com",
  databaseURL: "https://westchester-golf-app-default-rtdb.firebaseio.com",
  projectId: "westchester-golf-app"
};

(function loadFirebaseSDK() {
  var s1 = document.createElement('script');
  s1.src = 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js';
  s1.onload = function() {
    window._fbSDK = window.firebase;
    // Load Auth SDK first, then Database SDK
    var s1b = document.createElement('script');
    s1b.src = 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js';
    s1b.onload = function() {
      var s2 = document.createElement('script');
      s2.src = 'https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js';
      s2.onload = function() {
        try {
          window._fbSDK.initializeApp(FIREBASE_CONFIG);
          _firebaseDB = window._fbSDK.database();
          _firebaseReady = true;
          console.log('[Firebase] Connected to real-time database');
          // Sign in anonymously so security rules (auth != null) are satisfied
          window._fbSDK.auth().signInAnonymously().then(function() {
            console.log('[Firebase] Anonymous auth OK');
          }).catch(function(e) {
            console.warn('[Firebase] Anonymous auth failed:', e.message);
          });
        } catch(e) {
          console.warn('[Firebase] Init failed:', e.message);
        }
        _firebaseLoadResolve();
      };
      s2.onerror = function() {
        console.warn('[Firebase] DB SDK load failed');
        _firebaseLoadResolve();
      };
      document.head.appendChild(s2);
    };
    s1b.onerror = function() {
      // Auth SDK failed — still try to load DB SDK without auth
      console.warn('[Firebase] Auth SDK load failed, continuing without auth');
      var s2 = document.createElement('script');
      s2.src = 'https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js';
      s2.onload = function() {
        try {
          window._fbSDK.initializeApp(FIREBASE_CONFIG);
          _firebaseDB = window._fbSDK.database();
          _firebaseReady = true;
        } catch(e) {
          console.warn('[Firebase] Init failed:', e.message);
        }
        _firebaseLoadResolve();
      };
      s2.onerror = function() { _firebaseLoadResolve(); };
      document.head.appendChild(s2);
    };
    document.head.appendChild(s1b);
  };
  s1.onerror = function() {
    console.warn('[Firebase] App SDK load failed');
    _firebaseLoadResolve();
  };
  document.head.appendChild(s1);
})();

// Helper: wait for Firebase to be ready, then run a callback with the real DB ref
function _waitForFirebase(path, action) {
  if (_firebaseReady && _firebaseDB) {
    return action(_firebaseDB.ref(path));
  }
  return _firebaseLoadPromise.then(function() {
    if (_firebaseReady && _firebaseDB) {
      return action(_firebaseDB.ref(path));
    }
    // Firebase failed to load — fall back to local
    return action(null);
  });
}

// ==================== LOCAL DATABASE ====================
const LOCAL_DB_KEY = 'wg-db';

function getLocalDB() {
  try { return JSON.parse(localStorage.getItem(LOCAL_DB_KEY)) || {}; } catch(e) { return {}; }
}
function saveLocalDB(data) {
  localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(data));
}

function setAtPath(obj, path, value) {
  const parts = path.split('/').filter(Boolean);
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (current[parts[i]] === undefined || current[parts[i]] === null || typeof current[parts[i]] !== 'object') {
      current[parts[i]] = {};
    }
    current = current[parts[i]];
  }
  if (value === null) { delete current[parts[parts.length - 1]]; }
  else { current[parts[parts.length - 1]] = value; }
}

function getAtPath(obj, path) {
  const parts = path.split('/').filter(Boolean);
  let current = obj;
  for (const p of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[p];
  }
  return current;
}

const _dbListeners = {};
let _listenerIdCounter = 0;

function _notifyPathListeners(path) {
  const data = getLocalDB();
  Object.keys(_dbListeners).forEach(function(listenPath) {
    if (path.startsWith(listenPath) || listenPath.startsWith(path)) {
      const val = getAtPath(data, listenPath);
      _dbListeners[listenPath].forEach(function(entry) {
        entry.callback({ val: function() { return val; }, exists: function() { return val !== undefined && val !== null; } });
      });
    }
  });
}

// ==================== HYBRID DB (Firebase for shared, localStorage for private) ====================

function isSharedPath(path) {
  return path && (
    path === 'activeRounds' || path.startsWith('activeRounds/') ||
    path === 'users' || path.startsWith('users/') ||
    path === 'credentials' || path.startsWith('credentials/') ||
    path === 'usernames' || path.startsWith('usernames/')
  );
}

function makeLocalRef(path) {
  return {
    _path: path,
    set: function(value) {
      var data = getLocalDB();
      if (path === '') { Object.assign(data, value); } else { setAtPath(data, path, value); }
      saveLocalDB(data);
      _notifyPathListeners(path);
      return Promise.resolve();
    },
    update: function(updates) {
      var data = getLocalDB();
      Object.keys(updates).forEach(function(key) {
        var fullPath = path ? path + '/' + key : key;
        setAtPath(data, fullPath, updates[key]);
      });
      saveLocalDB(data);
      _notifyPathListeners(path);
      return Promise.resolve();
    },
    remove: function() {
      var data = getLocalDB();
      setAtPath(data, path, null);
      saveLocalDB(data);
      _notifyPathListeners(path);
      return Promise.resolve();
    },
    once: function() {
      var data = getLocalDB();
      var val = getAtPath(data, path);
      return Promise.resolve({ val: function() { return val; }, exists: function() { return val !== undefined && val !== null; } });
    },
    on: function(eventType, callback) {
      if (!_dbListeners[path]) _dbListeners[path] = [];
      _dbListeners[path].push({ callback: callback, id: ++_listenerIdCounter });
      var data = getLocalDB();
      var val = getAtPath(data, path);
      setTimeout(function() {
        callback({ val: function() { return val; }, exists: function() { return val !== undefined && val !== null; } });
      }, 0);
      return callback;
    },
    off: function(eventType, callback) {
      if (_dbListeners[path]) {
        _dbListeners[path] = _dbListeners[path].filter(function(e) { return e.callback !== callback; });
        if (_dbListeners[path].length === 0) delete _dbListeners[path];
      }
    },
    child: function(childPath) { return db.ref(path ? path + '/' + childPath : childPath); },
    keepSynced: function() {}
  };
}

function makeFirebaseRef(path) {
  return {
    _path: path,
    set: function(value) {
      return _waitForFirebase(path, function(ref) {
        if (!ref) return makeLocalRef(path).set(value);
        return ref.set(value);
      });
    },
    update: function(updates) {
      return _waitForFirebase(path, function(ref) {
        if (!ref) return makeLocalRef(path).update(updates);
        return ref.update(updates);
      });
    },
    remove: function() {
      return _waitForFirebase(path, function(ref) {
        if (!ref) return makeLocalRef(path).remove();
        return ref.remove();
      });
    },
    once: function(eventType) {
      return _waitForFirebase(path, function(ref) {
        if (!ref) return makeLocalRef(path).once(eventType);
        return ref.once(eventType);
      });
    },
    on: function(eventType, callback) {
      if (_firebaseReady && _firebaseDB) {
        return _firebaseDB.ref(path).on(eventType, callback);
      }
      // For .on() listeners: set up after Firebase loads
      _firebaseLoadPromise.then(function() {
        if (_firebaseReady && _firebaseDB) {
          _firebaseDB.ref(path).on(eventType, callback);
        } else {
          makeLocalRef(path).on(eventType, callback);
        }
      });
      return callback;
    },
    off: function(eventType, callback) {
      if (_firebaseReady && _firebaseDB) {
        _firebaseDB.ref(path).off(eventType, callback);
      }
    },
    child: function(childPath) { return db.ref(path ? path + '/' + childPath : childPath); },
    keepSynced: function() {}
  };
}

const db = {
  ref: function(path) {
    path = path || '';
    if (isSharedPath(path)) return makeFirebaseRef(path);
    return makeLocalRef(path);
  }
};

// ServerValue.TIMESTAMP — getter returns current time
const firebase = {
  database: { ServerValue: { get TIMESTAMP() { return Date.now(); } } }
};

// ==================== SUPPORT TICKETS (Google Sheets) ====================
// Replace this URL with your deployed Google Apps Script web app URL
var GOOGLE_SHEET_WEBHOOK = 'https://script.google.com/macros/s/AKfycbyOxPQSEmB-GI67v_NNdvJ0P1YVxk9ba1pAc8w55b79D3KZyCdhExZPXYBzeYtukmK2Ew/exec';

function submitSupportTicket(data) {
  var ticket = {
    timestamp: new Date().toISOString(),
    username: data.username || '',
    type: data.type || 'issue',
    page: data.page || '',
    description: data.description || ''
  };

  return fetch(GOOGLE_SHEET_WEBHOOK, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(ticket)
  }).then(function() {
    return { success: true };
  });
}

// ==================== AUTH HELPERS ====================
function onAuthReady(callback) {
  const unsubscribe = auth.onAuthStateChanged(function(user) { unsubscribe(); callback(user); });
}
function requireAuth(callback) {
  onAuthReady(function(user) {
    if (!user) { window.location.href = 'login.html'; } else { callback(user); }
  });
}
function getCurrentUser() { return auth.currentUser; }
function signOut() { auth.signOut().then(function() { window.location.href = 'login.html'; }); }

function deleteAccount() {
  const user = auth.currentUser;
  if (!user) return;
  const username = (user.displayName || user.email.split('@')[0]).toLowerCase();
  const uid = user.uid;

  const users = getLocalUsers();
  delete users[username];
  saveLocalUsers(users);

  const dbData = getLocalDB();
  if (dbData.usernames) delete dbData.usernames[username];
  if (dbData.users) delete dbData.users[uid];
  if (dbData.rounds) delete dbData.rounds[uid];
  saveLocalDB(dbData);

  localStorage.removeItem('westchester-golf-v2');
  localStorage.removeItem('active-round-v2');
  localStorage.removeItem('active-group-code');
  removeUserAvatar(uid);

  auth.signOut().then(function() { window.location.href = 'login.html'; });
}
