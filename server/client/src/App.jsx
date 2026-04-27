import { useState, useMemo, useRef } from "react";

// ─── constants ────────────────────────────────────────────────────────────────
const API = "https://cloudvault-backend-2wrx.onrender.com";

const EXT_ICONS = {
  png:"🖼",jpg:"🖼",jpeg:"🖼",gif:"🖼",webp:"🖼",
  mp4:"🎬",mov:"🎬",avi:"🎬",mkv:"🎬",
  pdf:"📑",
  xlsx:"📊",xls:"📊",csv:"📊",
  docx:"📝",doc:"📝",txt:"📝",
  zip:"🗜",rar:"🗜","7z":"🗜",
  mp3:"🎵",wav:"🎵",ogg:"🎵",
};
const EXT_COLOR = {
  "🖼":"rgba(245,158,11,0.15)","🎬":"rgba(239,68,68,0.15)",
  "📑":"rgba(239,68,68,0.15)","📊":"rgba(61,214,140,0.15)",
  "📝":"rgba(37,99,235,0.15)","🗜":"rgba(139,92,246,0.15)",
  "🎵":"rgba(236,72,153,0.15)","📄":"rgba(37,99,235,0.15)",
};

const isImage  = (n) => /\.(png|jpe?g|gif|webp)$/i.test(n || "");
const isVideo  = (n) => /\.(mp4|mov|avi|mkv|webm)$/i.test(n || "");
const isPdf    = (n) => /\.pdf$/i.test(n || "");
const getIcon  = (n) => EXT_ICONS[(n || "").split(".").pop().toLowerCase()] || "📄";
const getColor = (n) => EXT_COLOR[getIcon(n)] || "rgba(37,99,235,0.15)";

// ─── tiny helpers ─────────────────────────────────────────────────────────────
function Icon({ d, size = 16 }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24"
      stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}>
      <path d={d} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Toast({ msg, type = "success" }) {
  if (!msg) return null;
  const isErr = type === "error";
  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 9999,
      background: "#1a2540", border: `1px solid ${isErr ? "#f87171" : "#2e4060"}`,
      color: "#e2e8f4", padding: "12px 20px", borderRadius: 10,
      fontSize: 13, fontFamily: "DM Sans, sans-serif",
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      display: "flex", alignItems: "center", gap: 10,
    }}>
      <span style={{ color: isErr ? "#f87171" : "#3DD68C" }}>{isErr ? "✕" : "✓"}</span>
      {msg}
    </div>
  );
}

// confirm dialog
function Confirm({ msg, onYes, onNo }) {
  if (!msg) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000,
    }}>
      <div style={{
        background: "#0d1a2e", border: "1px solid #1e3050",
        borderRadius: 12, padding: "24px 28px", maxWidth: 360, width: "90%",
      }}>
        <div style={{ fontSize: 15, marginBottom: 20 }}>{msg}</div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onNo} style={{
            padding: "7px 16px", borderRadius: 7, border: "1px solid #1e3050",
            background: "transparent", color: "#6b80a0", cursor: "pointer",
            fontSize: 13, fontFamily: "DM Sans, sans-serif",
          }}>Cancel</button>
          <button onClick={onYes} style={{
            padding: "7px 16px", borderRadius: 7, border: "none",
            background: "rgba(239,68,68,0.15)", color: "#f87171", cursor: "pointer",
            fontSize: 13, fontWeight: 600, fontFamily: "DM Sans, sans-serif",
          }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ─── AUTH SCREEN ──────────────────────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [mode,     setMode]     = useState("login");
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState("");

  async function submit() {
    if (!email || !password) { setError("Please fill in all fields"); return; }
    setError(""); setLoading(true);
    try {
      const body = mode === "login" ? { email, password } : { name, email, password };
      const res  = await fetch(API + "/api/auth/" + mode, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Something went wrong"); return; }
      if (mode === "register") {
        setMode("login"); setPassword(""); setName(""); setError("");
        setSuccess("Account created! Please sign in."); return;
      }
      if (!data.token) { setError("Login failed — no token returned"); return; }
      onAuth(data.token, data.user || { email, name });
    } catch {
      setError("Cannot reach server — make sure backend is running on port 5000");
    } finally { setLoading(false); }
  }

  function switchMode() {
    setMode(mode === "login" ? "register" : "login");
    setError(""); setSuccess(""); setName(""); setEmail(""); setPassword("");
  }

  const inp = {
    width: "100%", padding: "10px 14px", marginBottom: 16,
    background: "#0d1a2e", border: "1px solid #1e3050",
    borderRadius: 8, color: "#e2e8f4", fontSize: 14,
    outline: "none", fontFamily: "DM Sans, sans-serif",
    boxSizing: "border-box", transition: "border-color 0.2s",
  };
  const fi = (e) => e.target.style.borderColor = "#3DD68C";
  const fo = (e) => e.target.style.borderColor = "#1e3050";

  return (
    <div style={{
      minHeight: "100vh", background: "#070d1a",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "DM Sans, sans-serif", color: "#e2e8f4", padding: 20,
    }}>
      <div style={{
        width: "100%", maxWidth: 420, background: "#09111f",
        border: "1px solid #152035", borderRadius: 16, padding: "36px 32px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9, fontSize: 17,
            background: "linear-gradient(135deg,#3DD68C,#2563EB)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>☁</div>
          <span style={{ fontWeight: 700, fontSize: 18 }}>
            Cloud<span style={{ color: "#3DD68C" }}>Vault</span>
          </span>
        </div>

        <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 6 }}>
          {mode === "login" ? "Welcome back" : "Create account"}
        </div>
        <div style={{ fontSize: 13, color: "#4a607a", marginBottom: 28 }}>
          {mode === "login" ? "Sign in to access your files" : "Start storing your files securely"}
        </div>

        {error && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ background: "rgba(61,214,140,0.1)", border: "1px solid rgba(61,214,140,0.3)", color: "#3DD68C", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <span>✓</span> {success}
          </div>
        )}

        {mode === "register" && (
          <>
            <label style={{ fontSize: 12, color: "#6b80a0", display: "block", marginBottom: 6 }}>Full name</label>
            <input style={inp} placeholder="Alex Kumar" value={name}
              onChange={e => setName(e.target.value)} onFocus={fi} onBlur={fo} />
          </>
        )}

        <label style={{ fontSize: 12, color: "#6b80a0", display: "block", marginBottom: 6 }}>Email address</label>
        <input style={inp} type="email" placeholder="you@example.com" value={email}
          onChange={e => setEmail(e.target.value)} onFocus={fi} onBlur={fo}
          onKeyDown={e => e.key === "Enter" && submit()} />

        <label style={{ fontSize: 12, color: "#6b80a0", display: "block", marginBottom: 6 }}>Password</label>
        <input style={inp} type="password" placeholder="••••••••" value={password}
          onChange={e => setPassword(e.target.value)} onFocus={fi} onBlur={fo}
          onKeyDown={e => e.key === "Enter" && submit()} />

        <button onClick={submit} disabled={loading} style={{
          width: "100%", padding: "11px 0", marginTop: 4,
          background: "#3DD68C", color: "#050d18", border: "none", borderRadius: 8,
          fontSize: 14, fontWeight: 600, cursor: "pointer",
          fontFamily: "DM Sans, sans-serif", opacity: loading ? 0.7 : 1,
        }}>
          {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
        </button>

        <div style={{ textAlign: "center", marginTop: 22, fontSize: 13, color: "#4a607a" }}>
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button onClick={switchMode} style={{
            background: "none", border: "none", color: "#3DD68C",
            cursor: "pointer", fontSize: 13, fontWeight: 500,
            fontFamily: "DM Sans, sans-serif", padding: 0,
          }}>
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ token, user, onLogout }) {
  const [files,        setFiles]        = useState([]);
  const [view,         setView]         = useState("files");
  const [preview,      setPreview]      = useState(null); // { name, type }
  const [toast,        setToast]        = useState({ msg: "", type: "success" });
  const [uploading,    setUploading]    = useState(false);
  const [uploadPct,    setUploadPct]    = useState(0);
  const [dragging,     setDragging]     = useState(false);
  const [loaded,       setLoaded]       = useState(false);
  const [search,       setSearch]       = useState("");
  const [sortBy,       setSortBy]       = useState("date"); // date | name | size
  const [sortDir,      setSortDir]      = useState("desc");
  const [theme,        setTheme]        = useState("dark"); // dark | light
  const [confirmDel,   setConfirmDel]   = useState(null);  // filename
  const [renamingFile, setRenamingFile] = useState(null);  // filename
  const [renameVal,    setRenameVal]    = useState("");
  const [page,         setPage]         = useState(1);
  const [selectedFile, setSelectedFile] = useState(null);

  const PER_PAGE = 12;
  const renameRef = useRef(null);

  const dark = theme === "dark";
  const T = {
    bg:       dark ? "#070d1a" : "#f0f4f8",
    sidebar:  dark ? "#09111f" : "#ffffff",
    card:     dark ? "#0d1a2e" : "#ffffff",
    border:   dark ? "#152035" : "#e2e8f0",
    text:     dark ? "#e2e8f4" : "#1a2540",
    muted:    dark ? "#4a607a" : "#7a90a8",
    input:    dark ? "#0d1a2e" : "#f8fafc",
    inputBdr: dark ? "#1e3050" : "#d0dbe8",
    topbar:   dark ? "#070d1a" : "#ffffff",
  };

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3000);
  }

  useState(() => { getFiles(); }, []);

  async function getFiles() {
    try {
      const res  = await fetch(API + "/api/files/my-files", {
        headers: { Authorization: "Bearer " + token },
      });
      const data = await res.json();
      setFiles(data.files || []);
    } catch (_) {}
    setLoaded(true);
  }

  // upload with XHR for progress
  function uploadFile(f) {
    const target = f || selectedFile;
    if (!target) return;
    setUploading(true); setUploadPct(0);
    const formData = new FormData();
    formData.append("file", target);
    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setUploadPct(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      setUploading(false); setSelectedFile(null); setUploadPct(0);
      showToast("File uploaded successfully");
      getFiles(); setView("files");
    };
    xhr.onerror = () => {
      setUploading(false);
      showToast("Upload failed", "error");
    };
    xhr.open("POST", API + "/api/files/upload");
    xhr.setRequestHeader("Authorization", "Bearer " + token);
    xhr.send(formData);
  }

  async function downloadFile(filename) {
    const res  = await fetch(API + "/api/files/download/" + filename, {
      headers: { Authorization: "Bearer " + token },
    });
    const blob = await res.blob();
    const url  = window.URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    showToast("Download started");
  }

  function confirmDelete(filename) {
    setConfirmDel(filename);
  }

  async function doDelete() {
    const filename = confirmDel;
    setConfirmDel(null);
    await fetch(API + "/api/files/delete/" + filename, {
      method: "DELETE", headers: { Authorization: "Bearer " + token },
    });
    showToast("File deleted");
    getFiles();
  }

  async function togglePublic(filename) {
    await fetch(API + "/api/files/toggle/" + filename, {
      method: "POST", headers: { Authorization: "Bearer " + token },
    });
    getFiles();
  }

  function shareFile(filename) {
    navigator.clipboard.writeText(API + "/api/files/public/" + filename);
    showToast("Share link copied to clipboard");
  }

  function startRename(filename) {
    setRenamingFile(filename);
    setRenameVal(filename);
    setTimeout(() => renameRef.current && renameRef.current.select(), 50);
  }

  async function submitRename(oldName) {
    if (!renameVal.trim() || renameVal === oldName) {
      setRenamingFile(null); return;
    }
    // NOTE: this calls a rename endpoint — add it to your backend if needed
    // For now we just update local state optimistically
    setFiles(prev => prev.map(f => f.name === oldName ? { ...f, name: renameVal.trim() } : f));
    setRenamingFile(null);
    showToast("Renamed (local only — add /api/files/rename to backend to persist)");
  }

  function openPreview(f) {
    if (isImage(f.name) || isVideo(f.name) || isPdf(f.name)) {
      setPreview(f);
    }
  }

  function cycleSort(field) {
    if (sortBy === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(field); setSortDir("asc"); }
    setPage(1);
  }

  function handleDrop(e) {
    e.preventDefault(); setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) uploadFile(dropped);
  }

  // filtered + sorted + paginated
  const filtered = useMemo(() => {
    let list = [...files];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(f => f.name.toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      let va, vb;
      if (sortBy === "name") { va = a.name.toLowerCase(); vb = b.name.toLowerCase(); }
      else if (sortBy === "size") { va = parseFloat(a.size) || 0; vb = parseFloat(b.size) || 0; }
      else { va = new Date(a.date || 0); vb = new Date(b.date || 0); }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [files, search, sortBy, sortDir]);

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated   = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const initials = ((user && (user.name || user.email)) || "U")
    .split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  // shared style helpers
  const btnPrimary = {
    display: "flex", alignItems: "center", gap: 6,
    padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500,
    cursor: "pointer", border: "none", fontFamily: "DM Sans, sans-serif",
    background: "#3DD68C", color: "#050d18", whiteSpace: "nowrap",
  };
  const btnGhost = {
    display: "flex", alignItems: "center", gap: 6,
    padding: "8px 14px", borderRadius: 8, fontSize: 13,
    cursor: "pointer", border: "1px solid " + T.border,
    background: "transparent", color: T.muted,
    fontFamily: "DM Sans, sans-serif", whiteSpace: "nowrap",
  };
  const aBtn = (bg, color) => ({
    flex: 1, padding: "5px 0", borderRadius: 5, fontSize: 11,
    cursor: "pointer", border: "none", background: bg, color,
    fontFamily: "DM Sans, sans-serif", fontWeight: 500,
  });
  const navItem = (active) => ({
    display: "flex", alignItems: "center", gap: 9,
    padding: "9px 12px", borderRadius: 8, cursor: "pointer",
    fontSize: 13, marginBottom: 2, border: "none", width: "100%",
    textAlign: "left", fontFamily: "DM Sans, sans-serif",
    color:      active ? "#3DD68C" : T.muted,
    background: active ? "rgba(61,214,140,0.08)" : "transparent",
    transition: "all 0.15s",
  });
  const sortBtn = (field) => ({
    padding: "5px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer",
    border: "1px solid " + T.border, fontFamily: "DM Sans, sans-serif",
    background: sortBy === field ? "rgba(61,214,140,0.1)" : "transparent",
    color: sortBy === field ? "#3DD68C" : T.muted,
  });

  return (
    <div style={{ display: "flex", height: "100vh", background: T.bg, fontFamily: "DM Sans, sans-serif", color: T.text, overflow: "hidden" }}>

      {/* ── SIDEBAR ── */}
      <div style={{ width: 220, background: T.sidebar, borderRight: "1px solid " + T.border, display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "22px 18px 18px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid " + T.border }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, fontSize: 15, background: "linear-gradient(135deg,#3DD68C,#2563EB)", display: "flex", alignItems: "center", justifyContent: "center" }}>☁</div>
          <span style={{ fontWeight: 700, fontSize: 15 }}>Cloud<span style={{ color: "#3DD68C" }}>Vault</span></span>
        </div>

        <div style={{ padding: "14px 10px", flex: 1 }}>
          <div style={{ fontSize: 10, color: T.muted, letterSpacing: "0.1em", textTransform: "uppercase", padding: "0 8px", marginBottom: 6 }}>Main</div>
          <button style={navItem(view === "files")} onClick={() => { setView("files"); getFiles(); }}>
            <Icon d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" size={15}/> My Files
          </button>
          <button style={navItem(view === "upload")} onClick={() => setView("upload")}>
            <Icon d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" size={15}/> Upload
          </button>
        </div>

        {/* storage bar */}
        <div style={{ margin: "0 10px 12px", padding: "12px 14px", background: T.card, borderRadius: 10, border: "1px solid " + T.border }}>
          <div style={{ fontSize: 11, color: T.muted, marginBottom: 8 }}>Storage used</div>
          <div style={{ height: 3, background: T.border, borderRadius: 4, marginBottom: 6 }}>
            <div style={{ height: "100%", borderRadius: 4, width: Math.min(files.length * 5, 100) + "%", background: "linear-gradient(90deg,#3DD68C,#2563EB)", transition: "width 0.4s" }}/>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.muted }}>
            <span style={{ color: T.text, fontWeight: 500 }}>{files.length} files</span>
            <span>of 20 GB</span>
          </div>
        </div>

        {/* user row */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid " + T.border, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(61,214,140,0.12)", border: "1px solid #3DD68C", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#3DD68C", flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {(user && (user.name || user.email)) || "User"}
            </div>
            <div style={{ fontSize: 10, color: T.muted }}>Pro Plan</div>
          </div>
          <button title="Sign out" onClick={onLogout}
            onMouseEnter={e => e.currentTarget.style.color = "#f87171"}
            onMouseLeave={e => e.currentTarget.style.color = T.muted}
            style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", padding: 0, display: "flex" }}>
            <Icon d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" size={15}/>
          </button>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* topbar */}
        <div style={{ padding: "14px 28px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid " + T.border, background: T.topbar, flexShrink: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 18, flex: 1 }}>
            {view === "files" ? "My Files" : "Upload File"}
          </div>

          {/* search */}
          <div style={{ flex: 1, maxWidth: 300, position: "relative" }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: T.muted }}>
              <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" size={15}/>
            </span>
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search files…"
              style={{ width: "100%", padding: "8px 14px 8px 36px", background: T.input, border: "1px solid " + T.border, borderRadius: 8, color: T.text, fontSize: 13, outline: "none", fontFamily: "DM Sans, sans-serif", boxSizing: "border-box" }}/>
          </div>

          {/* theme toggle */}
          <button onClick={() => setTheme(t => t === "dark" ? "light" : "dark")} style={{ ...btnGhost, padding: "8px 10px" }} title="Toggle theme">
            {dark ? "☀" : "🌙"}
          </button>

          <button style={btnPrimary} onClick={() => setView("upload")}>
            <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m-8-8h16"/>
            </svg>
            Upload
          </button>
        </div>

        {/* content */}
        <div style={{ flex: 1, padding: "24px 28px", overflowY: "auto" }}>

          {/* ── FILES VIEW ── */}
          {view === "files" && (
            <div>
              {/* stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
                {[
                  { label: "Total Files",   val: files.length,                             bg: "rgba(61,214,140,0.12)",  icon: "📁" },
                  { label: "Public",        val: files.filter(f => f.isPublic).length,     bg: "rgba(37,99,235,0.12)",   icon: "🌐" },
                  { label: "Private",       val: files.filter(f => !f.isPublic).length,    bg: "rgba(239,68,68,0.12)",   icon: "🔒" },
                  { label: "Images",        val: files.filter(f => isImage(f.name)).length,bg: "rgba(245,158,11,0.12)",  icon: "🖼" },
                ].map((s, i) => (
                  <div key={i} style={{ background: T.card, border: "1px solid " + T.border, borderRadius: 10, padding: 16 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, marginBottom: 10 }}>{s.icon}</div>
                    <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontWeight: 700, fontSize: 20 }}>{s.val}</div>
                  </div>
                ))}
              </div>

              {/* drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById("quick-upload").click()}
                style={{ border: "1.5px dashed " + (dragging ? "#3DD68C" : T.border), borderRadius: 10, padding: "22px 20px", textAlign: "center", cursor: "pointer", marginBottom: 24, transition: "all 0.2s", background: dragging ? "rgba(61,214,140,0.04)" : "transparent" }}
              >
                <div style={{ fontSize: 26, marginBottom: 6 }}>⬆</div>
                <div style={{ fontSize: 13, color: T.muted }}>
                  Drop files here or <span style={{ color: "#3DD68C", fontWeight: 500 }}>browse to upload</span>
                </div>
                <input id="quick-upload" type="file" style={{ display: "none" }} onChange={e => uploadFile(e.target.files[0])}/>
              </div>

              {/* toolbar: sort + count */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  {search ? `${filtered.length} results` : `All Files · ${files.length} items`}
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: T.muted, marginRight: 4 }}>Sort:</span>
                  {["name", "size", "date"].map(f => (
                    <button key={f} style={sortBtn(f)} onClick={() => cycleSort(f)}>
                      {f} {sortBy === f ? (sortDir === "asc" ? "↑" : "↓") : ""}
                    </button>
                  ))}
                </div>
              </div>

              {/* file grid */}
              {!loaded ? (
                <div style={{ textAlign: "center", padding: "60px 20px", color: T.muted }}>Loading…</div>
              ) : filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px", color: T.muted }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📂</div>
                  <div style={{ marginBottom: 8 }}>{search ? "No files match your search" : "No files yet"}</div>
                  <div style={{ fontSize: 12 }}>{search ? "Try a different name" : "Upload your first file to get started"}</div>
                </div>
              ) : (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))", gap: 12 }}>
                    {paginated.map((f, i) => (
                      <div key={i}
                        style={{ background: T.card, border: "1px solid " + T.border, borderRadius: 10, padding: 14, cursor: "pointer", transition: "all 0.15s" }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = "#3DD68C"}
                        onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
                      >
                        {/* thumbnail or icon — click to preview */}
                        <div onClick={() => openPreview(f)} style={{ marginBottom: 10 }}>
                          {isImage(f.name) ? (
                            <img src={API + "/uploads/" + f.name} alt=""
                              style={{ width: "100%", height: 80, objectFit: "cover", borderRadius: 6 }}/>
                          ) : (
                            <div style={{ width: 40, height: 40, borderRadius: 8, background: getColor(f.name), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                              {getIcon(f.name)}
                            </div>
                          )}
                        </div>

                        {/* inline rename */}
                        {renamingFile === f.name ? (
                          <input
                            ref={renameRef}
                            value={renameVal}
                            onChange={e => setRenameVal(e.target.value)}
                            onBlur={() => submitRename(f.name)}
                            onKeyDown={e => { if (e.key === "Enter") submitRename(f.name); if (e.key === "Escape") setRenamingFile(null); }}
                            style={{ width: "100%", background: T.input, border: "1px solid #3DD68C", borderRadius: 5, color: T.text, fontSize: 12, padding: "3px 6px", outline: "none", fontFamily: "DM Sans, sans-serif", boxSizing: "border-box", marginBottom: 4 }}
                            onClick={e => e.stopPropagation()}
                          />
                        ) : (
                          <div
                            style={{ fontSize: 12, fontWeight: 500, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 4 }}
                            title={f.name + " — double-click to rename"}
                            onDoubleClick={() => startRename(f.name)}
                          >{f.name}</div>
                        )}

                        <div style={{ fontSize: 10, color: T.muted, marginBottom: 6 }}>{f.size}</div>
                        <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 20, fontWeight: 600, background: f.isPublic ? "rgba(61,214,140,0.15)" : "rgba(239,68,68,0.15)", color: f.isPublic ? "#3DD68C" : "#f87171" }}>
                          {f.isPublic ? "Public" : "Private"}
                        </span>

                        <div style={{ display: "flex", gap: 4, marginTop: 10 }}>
                          <button style={aBtn("rgba(61,214,140,0.12)", "#3DD68C")} onClick={() => downloadFile(f.name)} title="Download">↓</button>
                          <button style={aBtn("rgba(37,99,235,0.12)",   "#60A5FA")} onClick={() => shareFile(f.name)}    title="Copy share link">🔗</button>
                          <button style={aBtn("rgba(245,158,11,0.12)",  "#FBBF24")} onClick={() => togglePublic(f.name)} title="Toggle public/private">⇄</button>
                          <button style={aBtn("rgba(239,68,68,0.12)",   "#f87171")} onClick={() => confirmDelete(f.name)} title="Delete">✕</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* pagination */}
                  {totalPages > 1 && (
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 24 }}>
                      <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                        style={{ ...btnGhost, opacity: page === 1 ? 0.4 : 1, padding: "6px 12px" }}>‹ Prev</button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                        <button key={p} onClick={() => setPage(p)}
                          style={{ padding: "6px 12px", borderRadius: 7, border: "1px solid " + T.border, cursor: "pointer", fontSize: 13, fontFamily: "DM Sans, sans-serif", background: p === page ? "#3DD68C" : "transparent", color: p === page ? "#050d18" : T.muted }}>
                          {p}
                        </button>
                      ))}
                      <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                        style={{ ...btnGhost, opacity: page === totalPages ? 0.4 : 1, padding: "6px 12px" }}>Next ›</button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── UPLOAD VIEW ── */}
          {view === "upload" && (
            <div style={{ background: T.card, border: "1px solid " + T.border, borderRadius: 12, padding: 28, maxWidth: 460 }}>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 20 }}>Upload a File</div>

              <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: T.input, border: "1px solid " + T.border, borderRadius: 8, cursor: "pointer", fontSize: 13, color: T.muted, marginBottom: 14 }}>
                <Icon d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" size={16}/>
                <span>{selectedFile ? selectedFile.name : "Choose a file…"}</span>
                <input type="file" style={{ display: "none" }} onChange={e => setSelectedFile(e.target.files[0])}/>
              </label>

              {selectedFile && (
                <div style={{ fontSize: 12, color: T.muted, marginBottom: 16 }}>
                  {selectedFile.type || "unknown type"}
                </div>
              )}

              {/* progress bar */}
              {uploading && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: T.muted, marginBottom: 6 }}>
                    <span>Uploading…</span><span>{uploadPct}%</span>
                  </div>
                  <div style={{ height: 6, background: T.border, borderRadius: 4 }}>
                    <div style={{ height: "100%", borderRadius: 4, width: uploadPct + "%", background: "linear-gradient(90deg,#3DD68C,#2563EB)", transition: "width 0.2s" }}/>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: 10 }}>
                <button style={{ ...btnPrimary, opacity: uploading ? 0.6 : 1 }}
                  onClick={() => uploadFile(null)} disabled={uploading}>
                  {uploading ? "Uploading…" : "Upload File"}
                </button>
                <button style={btnGhost} onClick={() => { setSelectedFile(null); setView("files"); }}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── PREVIEW MODAL ── */}
      {preview && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
          onClick={() => setPreview(null)}>
          <div style={{ background: T.card, borderRadius: 12, padding: 20, border: "1px solid " + T.border, maxWidth: "90vw", maxHeight: "90vh" }}
            onClick={e => e.stopPropagation()}>

            {isImage(preview.name) && (
              <img src={API + "/uploads/" + preview.name} alt=""
                style={{ maxHeight: "70vh", maxWidth: "80vw", borderRadius: 8, display: "block" }}/>
            )}
            {isVideo(preview.name) && (
              <video controls autoPlay style={{ maxHeight: "70vh", maxWidth: "80vw", borderRadius: 8, display: "block" }}>
                <source src={API + "/uploads/" + preview.name}/>
              </video>
            )}
            {isPdf(preview.name) && (
              <iframe src={API + "/uploads/" + preview.name} title="PDF preview"
                style={{ width: "75vw", height: "75vh", borderRadius: 8, border: "none" }}/>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, alignItems: "center" }}>
              <span style={{ fontSize: 13, color: T.muted }}>{preview.name}</span>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={btnPrimary} onClick={() => downloadFile(preview.name)}>↓ Download</button>
                <button style={btnGhost}   onClick={() => setPreview(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM ── */}
      <Confirm
        msg={confirmDel ? `Delete "${confirmDel}"? This cannot be undone.` : null}
        onYes={doDelete}
        onNo={() => setConfirmDel(null)}
      />

      <Toast msg={toast.msg} type={toast.type}/>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("cv_token") || "");
  const [user,  setUser]  = useState(() => {
    try { return JSON.parse(localStorage.getItem("cv_user") || "null"); }
    catch { return null; }
  });

  function handleAuth(tok, usr) {
    setToken(tok); setUser(usr);
    localStorage.setItem("cv_token", tok);
    localStorage.setItem("cv_user", JSON.stringify(usr));
  }

  function handleLogout() {
    setToken(""); setUser(null);
    localStorage.removeItem("cv_token");
    localStorage.removeItem("cv_user");
  }

  if (token) return <Dashboard token={token} user={user} onLogout={handleLogout}/>;
  return <AuthScreen onAuth={handleAuth}/>;
}