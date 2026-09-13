import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "@shared/sharedStyles.css";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Apex Connect App caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          height: "100vh",
          backgroundColor: "#0b141a",
          color: "#e9edef",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          textAlign: "center",
          fontFamily: "Segoe UI, -apple-system, Roboto, sans-serif"
        }}>
          <div style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "rgba(0, 168, 132, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "16px",
            color: "#00a884",
            fontSize: "28px"
          }}>
            💬
          </div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: "8px", color: "#e9edef" }}>
            Apex Connect
          </h2>
          <p style={{ color: "#8696a0", fontSize: "0.9rem", maxWidth: "340px", marginBottom: "24px", lineHeight: 1.5 }}>
            A temporary display error occurred. Tap below to reload the app smoothly.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "12px 32px",
              background: "#00a884",
              border: "none",
              borderRadius: "24px",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "0.95rem",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(0, 168, 132, 0.4)"
            }}
          >
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

