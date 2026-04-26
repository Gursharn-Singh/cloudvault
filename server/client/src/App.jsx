import { useState } from "react";

function App() {
  const [token, setToken] = useState("");
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [view, setView] = useState("files");
  const [dark, setDark] = useState(false);

  const theme = dark ? darkTheme : lightTheme;

  // LOGIN
  const login = async () => {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@test.com",
        password: "123456"
      })
    });

    const data = await res.json();
    setToken(data.token);
    alert("Logged in ✅");
  };

  const getFiles = async () => {
    const res = await fetch("http://localhost:5000/api/files/my-files", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setFiles(data.files);
  };

  const uploadFile = async () => {
    if (!file) return alert("Select file");

    const formData = new FormData();
    formData.append("file", file);

    await fetch("http://localhost:5000/api/files/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });

    getFiles();
  };

  const downloadFile = async (filename) => {
    const res = await fetch(
      `http://localhost:5000/api/files/download/${filename}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  };

  const deleteFile = async (filename) => {
    await fetch(
      `http://localhost:5000/api/files/delete/${filename}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    getFiles();
  };

  const togglePublic = async (filename) => {
    await fetch(
      `http://localhost:5000/api/files/toggle/${filename}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    getFiles();
  };

  const shareFile = (filename) => {
    const link = `http://localhost:5000/api/files/public/${filename}`;
    navigator.clipboard.writeText(link);
    alert("Link copied 🔗");
  };

  const getFileIcon = (name) => {
    if (name.endsWith(".png") || name.endsWith(".jpg")) return "🖼️";
    if (name.endsWith(".pdf")) return "📄";
    if (name.endsWith(".mp4")) return "🎥";
    return "📁";
  };

  return (
    <div style={{ ...styles.container, background: theme.bg }}>
      
      {/* SIDEBAR */}
      <div style={{ ...styles.sidebar, background: theme.sidebar }}>
        <h2>☁️ CloudVault</h2>

        <button style={styles.btn} onClick={login}>Login</button>

        <button style={styles.btn} onClick={() => { setView("files"); getFiles(); }}>
          📂 My Files
        </button>

        <button style={styles.btn} onClick={() => setView("upload")}>
          ⬆️ Upload
        </button>

        <hr />

        <button style={styles.btn} onClick={() => setDark(!dark)}>
          {dark ? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>

      {/* MAIN */}
      <div style={{ ...styles.main, color: theme.text }}>
        
        {view === "upload" && (
          <div>
            <h2>Upload File</h2>
            <input type="file" onChange={(e) => setFile(e.target.files[0])} />
            <button style={styles.primary} onClick={uploadFile}>Upload</button>
          </div>
        )}

        {view === "files" && (
          <div>
            <h2>My Files</h2>

            <ul style={styles.list}>
              {files.map((f, i) => (
                <li
                  key={i}
                  style={{
                    ...styles.item,
                    background: theme.card
                  }}
                >
                  <div style={styles.left}>
                    <span>{getFileIcon(f.name)}</span>
                    <div>
                      <div>{f.name}</div>
                      <small>
                        {f.size} • {new Date(f.date).toLocaleString()}
                      </small>
                    </div>
                  </div>

                  <div style={styles.right}>
                    <span style={{
                      color: f.isPublic ? "limegreen" : "tomato"
                    }}>
                      {f.isPublic ? "Public 🌐" : "Private 🔒"}
                    </span>

                    <button style={styles.iconBtn} onClick={() => downloadFile(f.name)}>⬇️</button>
                    <button style={styles.iconBtn} onClick={() => shareFile(f.name)}>🔗</button>
                    <button style={styles.iconBtn} onClick={() => togglePublic(f.name)}>🔄</button>
                    <button style={styles.iconBtn} onClick={() => deleteFile(f.name)}>🗑️</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    fontFamily: "Arial"
  },
  sidebar: {
    width: "220px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    color: "#fff"
  },
  main: {
    flex: 1,
    padding: "20px"
  },
  list: {
    listStyle: "none",
    padding: 0
  },
  item: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px",
    marginBottom: "10px",
    borderRadius: "8px",
    transition: "0.2s",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
  },
  left: {
    display: "flex",
    gap: "10px"
  },
  right: {
    display: "flex",
    gap: "6px",
    alignItems: "center"
  },
  btn: {
    padding: "8px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  },
  primary: {
    marginTop: "10px",
    padding: "10px 15px",
    background: "#4CAF50",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  },
  iconBtn: {
    padding: "5px 8px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  }
};

const lightTheme = {
  bg: "#f4f6f8",
  sidebar: "#1f2937",
  card: "#ffffff",
  text: "#000"
};

const darkTheme = {
  bg: "#111827",
  sidebar: "#000000",
  card: "#1f2937",
  text: "#ffffff"
};

export default App;