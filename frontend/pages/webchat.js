import { useState } from "react";
import { useRouter } from "next/router";

export default function WebChat() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const startChat = async () => {
    setError("");

    if (!url) {
      setError("Please enter a website URL");
      return;
    }

    let formattedUrl = url;

    if (!url.startsWith("http")) {
      formattedUrl = "https://" + url;
    }

    try {
      new URL(formattedUrl);
    } catch {
      setError("Invalid URL format");
      return;
    }

    const token = localStorage.getItem("access");

    try {
      setLoading(true);

      const res = await fetch("http://127.0.0.1:8000/api/crawl/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url: formattedUrl }),
      });

      if (!res.ok) {
        setError("Website not reachable or crawl failed");
        setLoading(false);
        return;
      }

      router.push(`/copilot?url=${encodeURIComponent(formattedUrl)}`);

    } catch (err) {
      setError("Unable to connect to the website");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loaderPage}>
        <div style={styles.spinner}></div>
        <p style={{ marginTop: "20px", color: "#fff" }}>
          Crawling website and preparing AI assistant...
        </p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={{ textAlign: "center" }}>Chat With Any Website</h2>

        <input
          type="text"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError("");
          }}
          style={styles.input}
        />

        {error && <p style={styles.error}>{error}</p>}

        <button style={styles.button} onClick={startChat}>
          Start Chat
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  loaderPage: {
    minHeight: "100vh",
    background: "#0f0f1a",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  spinner: {
    width: "60px",
    height: "60px",
    border: "6px solid #444",
    borderTop: "6px solid #7c3aed",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  card: {
    background: "#000",
    padding: "30px",
    borderRadius: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    width: "400px",
    color: "#fff",
  },

  input: {
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: "rgba(255,255,255,0.1)",
    color: "#fff",
    outline: "none",
  },

  button: {
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
    color: "#fff",
    fontWeight: "600",
  },

  error: {
    color: "#ff4d4f",
    fontSize: "14px",
    textAlign: "center",
  },
};