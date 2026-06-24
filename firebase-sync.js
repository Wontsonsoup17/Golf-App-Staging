// ==================== FIREBASE DATA SYNC ====================
// All Firebase Realtime Database operations for rounds, group play, and migration.

// ==================== USER ROUNDS (per-user cloud storage) ====================

// Load all saved rounds for a user from Firebase
function fbLoadRounds(uid) {
  return db.ref('users/' + uid + '/rounds').once('value').then(snap => {
    const data = snap.val();
    if (!data) return [];
    return Object.keys(data).map(key => ({ ...data[key], id: key }));
  });
}

// Save a completed round to Firebase under user's account
function fbSaveRound(uid, round) {
  const roundId = round.id || Date.now().toString();
  return db.ref('users/' + uid + '/rounds/' + roundId).set({
    ...round,
    id: roundId
  });
}

// Delete a round from Firebase
function fbDeleteRound(uid, roundId) {
  return db.ref('users/' + uid + '/rounds/' + roundId).remove();
}

// ==================== LOCAL → FIREBASE MIGRATION ====================

// One-time migration of localStorage rounds to Firebase
function migrateLocalRounds(uid) {
  return db.ref('users/' + uid + '/rounds').once('value').then(snap => {
    const fbData = snap.val();
    const localRounds = loadRounds(); // from shared.js (localStorage)

    if (!localRounds.length) return Promise.resolve(); // nothing to migrate

    // If Firebase already has rounds, skip migration (user already migrated)
    if (fbData && Object.keys(fbData).length > 0) return Promise.resolve();

    // Batch write all local rounds to Firebase
    const updates = {};
    localRounds.forEach(r => {
      const id = r.id || Date.now().toString() + Math.random().toString(36).slice(2, 5);
      updates[id] = { ...r, id };
    });
    return db.ref('users/' + uid + '/rounds').update(updates);
  });
}

// ==================== GROUP ROUNDS (real-time shared play) ====================

// Generate a random 6-character round code
function generateRoundCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no O/0/1/I for readability
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Create a new group round in Firebase
function createGroupRound(uid, displayName, courseId, tee, teeLabel, date) {
  const code = generateRoundCode();
  return createGroupRoundWithCode(uid, displayName, courseId, tee, teeLabel, date, code);
}

// Create a group round with a specific code
function createGroupRoundWithCode(uid, displayName, courseId, tee, teeLabel, date, code, startingHole, gameType) {
  return new Promise((resolve, reject) => {
    const roundRef = db.ref('activeRounds/' + code);
    var isScramble = gameType === 'scramble';

    roundRef.once('value').then(snap => {
      if (snap.exists()) {
        var existing = snap.val();
        var status = existing.meta && existing.meta.status;
        if (status !== 'finished' && status !== 'ended') {
          // The round is still 'active' or 'lobby'. Decide whether it's
          // really live or just leftover state from an admin who closed
          // their browser without ending the round.
          var existingPlayers = existing.players ? Object.keys(existing.players) : [];
          var anyScored = (function() {
            var sBuckets = [existing.scores, existing.teamScores];
            for (var b = 0; b < sBuckets.length; b++) {
              var bucket = sBuckets[b]; if (!bucket) continue;
              var keys = Object.keys(bucket);
              for (var i = 0; i < keys.length; i++) {
                var holes = bucket[keys[i]] || {};
                var hk = Object.keys(holes);
                for (var j = 0; j < hk.length; j++) {
                  if ((holes[hk[j]] || 0) > 0) return true;
                }
              }
            }
            return false;
          })();
          var createdAt = (existing.meta && existing.meta.createdAt) || 0;
          // lastActivityAt is bumped on every score/tracking/hole-nav write
          // (see bumpRoundActivity below). Older rounds without it fall back
          // to createdAt, which preserves v193 behavior for legacy data.
          var lastActivityAt = (existing.meta && existing.meta.lastActivityAt) || createdAt;
          var ageMs = Date.now() - createdAt;
          var idleMs = Date.now() - lastActivityAt;
          var IDLE_MS = 15 * 60 * 1000; // 15 min of zero activity → reusable
          var HARD_STALE_MS = 6 * 60 * 60 * 1000; // safety net for legacy data

          // Treat as stale (free to overwrite) if any of:
          //   - no live activity in 15 minutes (the real signal — players left)
          //   - only the host is in the round and no one has scored anything
          //   - older than 6 hours regardless (backstop)
          var isStale =
            idleMs > IDLE_MS ||
            (existingPlayers.length <= 1 && !anyScored) ||
            ageMs > HARD_STALE_MS;

          if (!isStale) {
            var hostUid = existing.meta && existing.meta.createdBy;
            var hostName = hostUid && existing.players && existing.players[hostUid] && existing.players[hostUid].name;
            var courseName = typeof getCourse === 'function' ? ((getCourse(existing.meta.courseId) || {}).name) : null;
            courseName = courseName || (existing.meta && existing.meta.courseId) || 'a course';
            var ageMin = Math.max(1, Math.round(ageMs / 60000));
            var ageStr = ageMin < 60 ? ageMin + ' min ago' : (Math.round(ageMin / 6) / 10) + ' hr ago';
            reject(new Error(
              'Code "' + code + '" is in use — ' + (hostName || 'someone') +
              ' is hosting at ' + courseName +
              ' (' + existingPlayers.length + ' player' + (existingPlayers.length !== 1 ? 's' : '') +
              ', started ' + ageStr + '). Try a different code, or wait until they finish.'
            ));
            return;
          }
          // else: fall through and let the new round overwrite the stale data
        }
      }

      var roundData;
      if (isScramble) {
        roundData = {
          meta: {
            courseId: courseId,
            tee: tee,
            teeLabel: teeLabel,
            date: date,
            createdBy: uid,
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            lastActivityAt: firebase.database.ServerValue.TIMESTAMP,
            status: 'lobby',
            gameType: 'scramble',
            startingHole: startingHole || 0,
            teams: {
              teamA: { name: '', members: [] },
              teamB: { name: '', members: [] }
            }
          },
          players: {
            [uid]: { name: displayName, joinedAt: firebase.database.ServerValue.TIMESTAMP }
          },
          teamScores: {
            teamA: arrayToObj(new Array(18).fill(0)),
            teamB: arrayToObj(new Array(18).fill(0))
          },
          teamHole: { teamA: startingHole || 0, teamB: startingHole || 0 },
          teamHoleConfirmed: { teamA: {}, teamB: {} }
        };
      } else {
        roundData = {
          meta: {
            courseId: courseId,
            tee: tee,
            teeLabel: teeLabel,
            date: date,
            createdBy: uid,
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            lastActivityAt: firebase.database.ServerValue.TIMESTAMP,
            status: 'active',
            startingHole: startingHole || 0
          },
          players: {
            [uid]: { name: displayName, joinedAt: firebase.database.ServerValue.TIMESTAMP }
          },
          scores: { [uid]: arrayToObj(new Array(18).fill(0)) },
          tracking: { [uid]: trackingToObj(createPlayerTracking()) },
          currentHole: { [uid]: 0 }
        };
      }

      return roundRef.set(roundData).then(() => {
        var courseName = typeof getCourse === 'function' ? (getCourse(courseId) || {}).name || courseId : courseId;
        if (typeof notifyAdmin === 'function') {
          notifyAdmin(
            'New Round Started',
            displayName + ' started a ' + (isScramble ? 'scramble ' : '') + 'round at ' + courseName + ' [' + code + ']',
            'golf,round_start'
          );
        }
        resolve(code);
      });
    }).catch(reject);
  });
}

// Join an existing group round
function joinGroupRound(uid, displayName, code) {
  const roundRef = db.ref('activeRounds/' + code);

  return roundRef.once('value').then(function(snap) {
    if (!snap.exists() || !snap.val()) {
      throw new Error('Round not found. Make sure you have the correct code.');
    }
    var roundData = snap.val();
    var meta = roundData.meta;
    if (!meta) throw new Error('Round data is corrupted. Please create a new round.');
    var isScramble = meta.gameType === 'scramble';
    if (isScramble) {
      if (meta.status !== 'lobby' && meta.status !== 'active') throw new Error('This round has already finished');
    } else {
      if (meta.status !== 'active') throw new Error('This round has already finished');
    }

    // Check if this player already finished this round
    if (roundData.finishedPlayers && roundData.finishedPlayers[uid]) {
      throw new Error('You already finished this round. Your scores have been saved.');
    }

    // Check if player is already in the round
    if (roundData.players && roundData.players[uid]) {
      return Promise.resolve();
    }

    // Add player
    var updates = {};
    updates['players/' + uid] = {
      name: displayName,
      joinedAt: firebase.database.ServerValue.TIMESTAMP
    };
    if (!isScramble) {
      updates['scores/' + uid] = arrayToObj(new Array(18).fill(0));
      updates['tracking/' + uid] = trackingToObj(createPlayerTracking());
      updates['currentHole/' + uid] = 0;
    }

    return roundRef.update(updates).then(function() {
      // Notify admin that someone joined
      var courseName = typeof getCourse === 'function' ? (getCourse(meta.courseId) || {}).name || meta.courseId : meta.courseId;
      if (typeof notifyAdmin === 'function') {
        notifyAdmin(
          'Player Joined Round',
          displayName + ' joined [' + code + '] at ' + courseName,
          'golf,player_join'
        );
      }
    });
  });
}

// Listen to an active group round in real-time
// Returns an unsubscribe function
function listenToGroupRound(code, callback) {
  const ref = db.ref('activeRounds/' + code);
  const handler = ref.on('value', snap => {
    const data = snap.val();
    callback(data); // pass null through so listeners can handle round deletion
  });
  return () => ref.off('value', handler);
}

// Bump the round's last-activity timestamp. Used by code-reuse to tell
// whether anyone is actually still playing. Fire-and-forget — we never
// want a failure here to block a score write.
function bumpRoundActivity(code) {
  try {
    db.ref('activeRounds/' + code + '/meta/lastActivityAt').set(firebase.database.ServerValue.TIMESTAMP).catch(function() {});
  } catch (e) {}
}

// Update a single hole score for the current user
function updateGroupScore(code, uid, holeIndex, score) {
  bumpRoundActivity(code);
  return db.ref('activeRounds/' + code + '/scores/' + uid + '/' + holeIndex).set(score);
}

// Update tracking data for the current user on a specific hole
function updateGroupTracking(code, uid, trackType, holeIndex, value) {
  bumpRoundActivity(code);
  return db.ref('activeRounds/' + code + '/tracking/' + uid + '/' + trackType + '/' + holeIndex).set(value);
}

// Update current hole view for a user
function updateGroupCurrentHole(code, uid, holeIndex) {
  bumpRoundActivity(code);
  return db.ref('activeRounds/' + code + '/currentHole/' + uid).set(holeIndex);
}

// Set/replace a temporary hole override on the live session.
// override = { par, yards, hcp }. Visible to all players in real-time via the existing listener.
function setHoleOverride(code, holeIndex, override) {
  return db.ref('activeRounds/' + code + '/meta/holeOverrides/' + holeIndex).set(override);
}

// Remove an override (revert to original course hole)
function clearHoleOverride(code, holeIndex) {
  return db.ref('activeRounds/' + code + '/meta/holeOverrides/' + holeIndex).remove();
}

// Finish a group round (only creator should call this)
function finishGroupRound(code) {
  return db.ref('activeRounds/' + code + '/meta/status').set('finished');
}

// Mark a player as finished in the active round
function markPlayerFinished(code, uid) {
  return db.ref('activeRounds/' + code + '/finishedPlayers/' + uid).set(true);
}

// Check if a specific player has already finished this round
function isPlayerFinished(code, uid) {
  return db.ref('activeRounds/' + code + '/finishedPlayers/' + uid).once('value').then(function(snap) {
    return snap.val() === true;
  });
}

// Check if all players have finished — if so, mark round as finished (keep data for live view)
function checkAndCleanupRound(code) {
  return db.ref('activeRounds/' + code).once('value').then(function(snap) {
    if (!snap.exists()) return;
    var data = snap.val();
    var players = data.players || {};
    var finished = data.finishedPlayers || {};
    var allUids = Object.keys(players);
    var allDone = allUids.length > 0 && allUids.every(function(uid) {
      return finished[uid] === true;
    });
    if (allDone) {
      // Everyone finished — mark as finished so live view can show final results
      return db.ref('activeRounds/' + code + '/meta').update({
        status: 'finished',
        finishedAt: firebase.database.ServerValue.TIMESTAMP
      }).then(function() {
        // Clean up after 5 minutes so the code can eventually be reused
        setTimeout(function() {
          db.ref('activeRounds/' + code).remove().catch(function() {});
        }, 300000);
      });
    }
  });
}

// Admin ends the round for all players — sets status to 'ended', keeps data for live view
function endGroupRoundForAll(code) {
  return db.ref('activeRounds/' + code + '/meta').update({
    status: 'ended',
    finishedAt: firebase.database.ServerValue.TIMESTAMP
  }).then(function() {
    // Clean up after 5 minutes so spectators can still see final results
    setTimeout(function() {
      db.ref('activeRounds/' + code).remove().catch(function() {});
    }, 300000);
  });
}

// Clean up: remove a finished group round from Firebase
function removeGroupRound(code) {
  return db.ref('activeRounds/' + code).remove();
}

// Find any active group round created by this admin
// Returns { code, meta } if found, or null if no active round exists
function findActiveRoundByAdmin(uid) {
  return db.ref('activeRounds').once('value').then(function(snap) {
    var all = snap.val();
    if (!all) return null;
    var codes = Object.keys(all);
    for (var i = 0; i < codes.length; i++) {
      var code = codes[i];
      var round = all[code];
      if (round.meta && round.meta.createdBy === uid && round.meta.status === 'active') {
        return { code: code, meta: round.meta };
      }
    }
    return null;
  });
}

// Find any active group round where this user is a player
function findActiveRoundForUser(uid) {
  return db.ref('activeRounds').once('value').then(function(snap) {
    var all = snap.val();
    if (!all) return null;
    var codes = Object.keys(all);
    for (var i = 0; i < codes.length; i++) {
      var code = codes[i];
      var round = all[code];
      if (round.meta && round.meta.status === 'active' && round.players && round.players[uid]) {
        return { code: code, meta: round.meta };
      }
    }
    return null;
  });
}

// Listen to all active rounds and return count + list info via callback
function listenToActiveRoundsCount(callback) {
  var ref = db.ref('activeRounds');
  var handler = ref.on('value', function(snap) {
    var all = snap.val();
    if (!all) { callback(0, []); return; }
    var rounds = [];
    var codes = Object.keys(all);
    for (var i = 0; i < codes.length; i++) {
      var round = all[codes[i]];
      if (round.meta && round.meta.status === 'active') {
        var playerCount = round.players ? Object.keys(round.players).length : 0;
        var adminName = '';
        if (round.meta.createdBy && round.players && round.players[round.meta.createdBy]) {
          adminName = round.players[round.meta.createdBy].name || '';
        }
        rounds.push({ code: codes[i], courseId: round.meta.courseId, teeLabel: round.meta.teeLabel, playerCount: playerCount, adminName: adminName });
      }
    }
    callback(rounds.length, rounds);
  });
  return function() { ref.off('value', handler); };
}

// Delete an active round immediately (frees the code for reuse)
function deleteActiveRound(code) {
  return db.ref('activeRounds/' + code).remove();
}

// ==================== DATA CONVERSION HELPERS ====================
// Firebase doesn't store arrays natively; convert between array and indexed object

function arrayToObj(arr) {
  const obj = {};
  arr.forEach((v, i) => { obj[i] = v; });
  return obj;
}

function objToArray(obj, length) {
  if (!obj) return new Array(length || 18).fill(0);
  const arr = [];
  for (let i = 0; i < (length || 18); i++) {
    arr.push(obj[i] !== undefined ? obj[i] : 0);
  }
  return arr;
}

function trackingToObj(tracking) {
  // mulliganLocations is not a simple array — each entry is null or an array of strings
  var mlObj = {};
  if (tracking.mulliganLocations) {
    for (var i = 0; i < tracking.mulliganLocations.length; i++) {
      if (tracking.mulliganLocations[i]) mlObj[i] = tracking.mulliganLocations[i];
    }
  }
  return {
    putts: arrayToObj(tracking.putts),
    fairway: arrayToObj(tracking.fairway),
    gir: arrayToObj(tracking.gir),
    mulligans: arrayToObj(tracking.mulligans),
    mulliganLocations: mlObj,
    penalties: arrayToObj(tracking.penalties)
  };
}

function objToTracking(obj) {
  if (!obj) return createPlayerTracking();
  // Parse mulliganLocations — each hole is null or an array of strings
  var mlRaw = obj.mulliganLocations || {};
  var mulliganLocations = new Array(18).fill(null);
  for (var i = 0; i < 18; i++) {
    if (mlRaw[i] && Array.isArray(mlRaw[i])) mulliganLocations[i] = mlRaw[i];
  }
  // Parse penaltyLocations — each hole is null or an array of strings
  var plRaw = obj.penaltyLocations || {};
  var penaltyLocations = new Array(18).fill(null);
  for (var i = 0; i < 18; i++) {
    if (plRaw[i] && Array.isArray(plRaw[i])) penaltyLocations[i] = plRaw[i];
  }
  return {
    putts: objToArray(obj.putts, 18),
    fairway: objToArray(obj.fairway, 18).map(v => !!v),
    gir: objToArray(obj.gir, 18).map(v => !!v),
    mulligans: objToArray(obj.mulligans, 18),
    mulliganLocations: mulliganLocations,
    penalties: objToArray(obj.penalties, 18),
    penaltyLocations: penaltyLocations
  };
}

// Convert a Firebase group round snapshot into the same shape as the existing R object
// so the render functions can work with either solo or group data
function groupDataToRound(data, code) {
  const meta = data.meta;
  const players = data.players || {};
  const playerUids = Object.keys(players);
  const playerNames = playerUids.map(uid => players[uid].name);

  // Build scores and tracking keyed by player NAME (for display)
  // but also keep a UID→name map
  const scores = {};
  const tracking = {};
  const uidToName = {};
  const nameToUid = {};

  playerUids.forEach(uid => {
    const name = players[uid].name;
    uidToName[uid] = name;
    nameToUid[name] = uid;
    scores[name] = objToArray(data.scores ? data.scores[uid] : null, 18);
    tracking[name] = objToTracking(data.tracking ? data.tracking[uid] : null);
  });

  return {
    courseId: meta.courseId,
    tee: meta.tee,
    teeLabel: meta.teeLabel,
    date: meta.date,
    players: playerNames,
    scores: scores,
    tracking: tracking,
    currentHole: 0, // each player tracks their own
    // Group-specific metadata
    _groupCode: code,
    _createdBy: meta.createdBy,
    _status: meta.status,
    _startingHole: meta.startingHole || 0,
    _uidToName: uidToName,
    _nameToUid: nameToUid,
    _playerUids: playerUids,
    _gameType: meta.gameType || 'standard',
    _teams: meta.teams || null,
    _teamScores: data.teamScores || null,
    _teamHole: data.teamHole || null,
    _teamHoleConfirmed: data.teamHoleConfirmed || null,
    _holeOverrides: meta.holeOverrides || null
  };
}

// ==================== SCRAMBLE GAME MODE ====================

// Assign players to teams in a scramble lobby
function setScrambleTeams(code, teamAuids, teamBuids) {
  return db.ref('activeRounds/' + code + '/meta/teams').update({
    teamA: { name: '', members: teamAuids },
    teamB: { name: '', members: teamBuids }
  });
}

// Start the scramble round (lobby → active)
function startScrambleRound(code) {
  return db.ref('activeRounds/' + code + '/meta/status').set('active');
}

// Set team name — only writes if not already set (first response wins)
function setScrambleTeamName(code, teamKey, name) {
  var ref = db.ref('activeRounds/' + code + '/meta/teams/' + teamKey + '/name');
  return ref.once('value').then(function(snap) {
    if (!snap.val()) return ref.set(name);
  });
}

// Update a team's score for a hole
function updateScrambleScore(code, teamKey, holeIndex, score) {
  bumpRoundActivity(code);
  return db.ref('activeRounds/' + code + '/teamScores/' + teamKey + '/' + holeIndex).set(score);
}

// Reset confirmations when score changes
function resetScrambleConfirmations(code, teamKey) {
  return db.ref('activeRounds/' + code + '/teamHoleConfirmed/' + teamKey).set({});
}

// Confirm hole score — advances teamHole when all team members confirm
function confirmScrambleHole(code, teamKey, uid, allTeamUids) {
  bumpRoundActivity(code);
  var base = 'activeRounds/' + code;
  return db.ref(base + '/teamHoleConfirmed/' + teamKey + '/' + uid).set(true).then(function() {
    return db.ref(base + '/teamHoleConfirmed/' + teamKey).once('value').then(function(snap) {
      var confirmed = snap.val() || {};
      var allDone = allTeamUids.every(function(u) { return confirmed[u] === true; });
      if (allDone) {
        return db.ref(base + '/teamHole/' + teamKey).once('value').then(function(hSnap) {
          var cur = hSnap.val() || 0;
          if (cur >= 17) return; // Already on last hole — finish handled separately
          var updates = {};
          updates['teamHole/' + teamKey] = cur + 1;
          updates['teamHoleConfirmed/' + teamKey] = {};
          return db.ref(base).update(updates);
        });
      }
    });
  });
}

// End scramble round (admin ends for all)
function endScrambleRound(code) {
  return db.ref('activeRounds/' + code + '/meta').update({
    status: 'ended',
    finishedAt: firebase.database.ServerValue.TIMESTAMP
  }).then(function() {
    setTimeout(function() {
      db.ref('activeRounds/' + code).remove().catch(function() {});
    }, 300000);
  });
}

// ==================== CONNECTION STATUS ====================

function listenConnectionStatus(callback) {
  // Check if real Firebase is connected
  if (_firebaseReady && _firebaseDB) {
    var connRef = _firebaseDB.ref('.info/connected');
    connRef.on('value', function(snap) {
      callback(snap.val() === true);
    });
    return function() { connRef.off(); };
  }
  // Fallback: always connected for local mode
  setTimeout(function() { callback(true); }, 0);
  return function() {};
}
