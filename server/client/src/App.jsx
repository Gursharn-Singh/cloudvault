import { useState } from "react";

function App() {
  const [token, setToken] = useState("");
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);

  const login = async () => {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: "test@test.com",
        password: "123456"
      })
    });

    const data = await res.json();
    setToken(data.token);
    alert("Logged in ✅");
  };

  const uploadFile = async () => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://localhost:5000/api/files/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    const data = await res.json();
    alert("Uploaded: " + data.file);
    getFiles();
  };

  const getFiles = async () => {
    const res = await fetch("http://localhost:5000/api/files/my-files", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();
    setFiles(data.files);
  };

  const downloadFile = async (filename) => {
    const res = await fetch(
      `http://localhost:5000/api/files/download/${filename}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
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
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    getFiles();
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>☁️ CloudVault</h1>

        <button style={styles.buttonPrimary} onClick={login}>
          Login
        </button>

        <div style={styles.uploadSection}>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <button style={styles.buttonPrimary} onClick={uploadFile}>
            Upload
          </button>
        </div>

        <button style={styles.buttonSecondary} onClick={getFiles}>
          Show Files
        </button>

        <ul style={styles.fileList}>
          {files.map((f, i) => (
            <li key={i} style={styles.fileItem}>
              <span>{f}</span>

              <div>
                <button
                  style={styles.smallBtn}
                  onClick={() => downloadFile(f)}
                >
                  ⬇️
                </button>

                <button
                  style={{ ...styles.smallBtn, backgroundColor: "#ff4d4d" }}
                  onClick={() => deleteFile(f)}
                >
                  🗑️
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    background: "#f4f6f8",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  card: {
    background: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    width: "400px",
    textAlign: "center"
  },
  title: {
    marginBottom: "20px"
  },
  buttonPrimary: {
    padding: "10px 20px",
    margin: "10px",
    background: "#4CAF50",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  },
  buttonSecondary: {
    padding: "8px 16px",
    marginTop: "10px",
    background: "#2196F3",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  },
  uploadSection: {
    marginTop: "15px"
  },
  fileList: {
    listStyle: "none",
    padding: 0,
    marginTop: "15px"
  },
  fileItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#f1f1f1",
    padding: "10px",
    borderRadius: "6px",
    marginBottom: "8px"
  },
  smallBtn: {
    marginLeft: "5px",
    padding: "5px 8px",
    border: "none",
    borderRadius: "4px",
    background: "#555",
    color: "#fff",
    cursor: "pointer"
  }
};

export default App;