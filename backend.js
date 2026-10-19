// Supabase를 원래 아티팩트의 db / assets 와 같은 모양으로 감싸요.
// db.doc("trips/abc").set/update/delete/onSnapshot, db.collection("trips").doc()/onSnapshot,
// assets.upload/delete, 그리고 비공개 사진용 서명 URL(sign)을 제공해요.
(() => {
const cfg = window.ALBUM_CONFIG || {};
const BUCKET = "photos";
const SIGN_SECONDS = 60 * 60 * 24 * 7;
const configured = !!(window.supabase && cfg.supabaseUrl && cfg.supabaseAnonKey && !/YOUR-/.test(cfg.supabaseUrl + cfg.supabaseAnonKey));
const sb = configured ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey) : null;
const newId = () => crypto.randomUUID().replace(/-/g, "").slice(0, 20);
const splitPath = p => { const i = p.indexOf("/"); return [p.slice(0, i), p.slice(i + 1)]; };
const fail = error => { if (error) throw error; };

// ---------- 컬렉션 구독 ----------
const subs = new Map();     // collection → Set<{cb, err}>
const cache = new Map();    // collection → [{id, data}]
const timers = new Map();
async function refresh(col) {
  const set = subs.get(col); if (!set?.size) return;
  try {
    const { data, error } = await sb.from("docs").select("id,data").eq("collection", col); fail(error);
    cache.set(col, data);
    for (const s of set) s.cb(data);
  } catch (e) { for (const s of set) s.err?.(e); }
}
function refreshSoon(col) { clearTimeout(timers.get(col)); timers.set(col, setTimeout(() => refresh(col), 120)); }
function listen(col, cb, err) {
  if (!subs.has(col)) subs.set(col, new Set());
  const s = { cb, err }; subs.get(col).add(s);
  refreshSoon(col);
  return () => subs.get(col).delete(s);
}
let channel = null;
function startRealtime() {
  if (channel) return;
  channel = sb.channel("docs-changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "docs" }, p => {
      const col = p.new?.collection || p.old?.collection;
      if (col) refreshSoon(col); else for (const c of subs.keys()) refreshSoon(c);
    })
    .subscribe();
}

// ---------- 문서 ----------
function doc(path) {
  const [collection, id] = splitPath(path);
  return {
    id,
    async set(data) {
      const { error } = await sb.from("docs").upsert({ collection, id, data, updated_at: new Date().toISOString() }); fail(error);
      refreshSoon(collection);
    },
    async update(patch) {
      const { data: row, error } = await sb.from("docs").select("data").eq("collection", collection).eq("id", id).maybeSingle(); fail(error);
      if (!row) throw new Error("not_found");
      const { error: e2 } = await sb.from("docs").update({ data: { ...row.data, ...patch }, updated_at: new Date().toISOString() })
        .eq("collection", collection).eq("id", id); fail(e2);
      refreshSoon(collection);
    },
    async delete() {
      const { error } = await sb.from("docs").delete().eq("collection", collection).eq("id", id); fail(error);
      refreshSoon(collection);
    },
    onSnapshot(cb, err) {
      return listen(collection, rows => {
        const r = rows.find(x => x.id === id);
        cb({ exists: !!r, data: r ? r.data : null });
      }, err);
    }
  };
}
function collection(name) {
  return {
    doc: id => doc(name + "/" + (id || newId())),
    onSnapshot(cb, err) {
      return listen(name, rows => cb({ docs: rows.map(r => ({ id: r.id, data: r.data })) }), err);
    }
  };
}
const db = { doc, collection };

// ---------- 사진 파일 ----------
const assets = {
  async upload(blob, { type } = {}) {
    const ext = (type || blob.type || "image/jpeg").split("/")[1]?.replace("jpeg", "jpg") || "jpg";
    const path = `${newId()}.${ext}`;
    const { error } = await sb.storage.from(BUCKET).upload(path, blob, { contentType: type || blob.type, upsert: false }); fail(error);
    return { id: path };
  },
  async delete(id) {
    const { error } = await sb.storage.from(BUCKET).remove([id]); fail(error);
  },
  // 비공개 버킷이라 보기용 주소를 한꺼번에 받아 와요 (7일 유효)
  async sign(ids) {
    const out = new Map();
    for (let i = 0; i < ids.length; i += 100) {
      const { data, error } = await sb.storage.from(BUCKET).createSignedUrls(ids.slice(i, i + 100), SIGN_SECONDS); fail(error);
      for (const r of data || []) if (r.signedUrl && !r.error) out.set(r.path, r.signedUrl);
    }
    return out;
  }
};

// ---------- 로그인 ----------
const auth = {
  async session() { const { data } = await sb.auth.getSession(); return data.session; },
  // Supabase는 이메일로만 로그인해서, 아이디만 적으면 뒤에 @example.com을 붙여요
  async signIn(id, password) {
    const email = id.includes("@") ? id : `${id.toLowerCase()}@example.com`;
    const { data, error } = await sb.auth.signInWithPassword({ email, password }); fail(error); return data.session;
  },
  async signOut() { await sb.auth.signOut(); },
  // 로그인은 됐지만 members 표에 없는 사람인지 확인
  async isMember() { const { data, error } = await sb.rpc("is_member"); fail(error); return !!data; }
};

window.albumBackend = { configured, db, assets, auth, startRealtime };
})();
