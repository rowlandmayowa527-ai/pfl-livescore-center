// firebase.js  (save as a module file in repo root)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getDatabase, ref, onValue, push, set, update, get, child } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-storage.js";

// <-- paste your firebaseConfig below (from the script you pasted earlier) -->
const firebaseConfig = {
  apiKey: "AIzaSyByIlaV-H-Q9f8uEwtcv7oeOHpHpwdB6LA",
  authDomain: "pfl-livescore-center.firebaseapp.com",
  projectId: "pfl-livescore-center",
  storageBucket: "pfl-livescore-center.firebasestorage.app",
  messagingSenderId: "457907948851",
  appId: "1:457907948851:web:a0b22bc7a9a3a286b94246",
  measurementId: "G-N12RK3S2Y4"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const storage = getStorage(app);

// Database paths:
// /matches  -> list of all match objects (pushed)
// each match:
// {
//   id: "<pushKey>",
//   home: { name, coach, players: [...], logoUrl, score },
//   away: { ... },
//   status: "not_started"|"live"|"finished",
//   startTime: "<ISO>",
//   events: [ {type, minute, desc, team, timestamp} ],
//   createdAt: "<ISO>"
// }

function listenMatches(cb){
  const r = ref(db, 'matches');
  onValue(r, snapshot => {
    const val = snapshot.val() || {};
    // convert to array sorted by createdAt desc
    const arr = Object.keys(val).map(k => ({ id:k, ...val[k] }));
    cb(arr);
  });
}

async function pushMatch(matchObj){
  const r = ref(db, 'matches');
  const p = push(r);
  await set(p, { ...matchObj, createdAt: new Date().toISOString() });
  return p.key;
}

async function updateMatch(matchId, patch){
  const r = ref(db, `matches/${matchId}`);
  await update(r, patch);
}

async function uploadLogoFile(file, filenamePrefix = 'logo'){
  // file is a File object from <input type="file">
  const name = `${filenamePrefix}_${Date.now()}_${file.name}`;
  const sRef = storageRef(storage, `logos/${name}`);
  const snap = await uploadBytes(sRef, file);
  const url = await getDownloadURL(sRef);
  return url;
}

async function getMatchOnce(matchId){
  const r = ref(db);
  const snap = await get(child(r, `matches/${matchId}`));
  return snap.exists() ? snap.val() : null;
}

export { listenMatches, pushMatch, updateMatch, uploadLogoFile, getMatchOnce };
