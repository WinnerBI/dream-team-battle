import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#0a1628", color: "white", fontFamily: "system-ui, sans-serif", padding: "20px" }}>
          <div style={{ maxWidth: "500px", textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "24px" }}>❌</div>
            <h1 style={{ fontSize: "24px", fontWeight: "900", margin: "0 0 12px 0", color: "#ff6b6b" }}>Erro na Aplicação</h1>
            <p style={{ fontSize: "14px", color: "#aaa", lineHeight: "1.6", margin: "0 0 16px 0", wordBreak: "break-word" }}>
              {this.state.error?.message || "Ocorreu um erro inesperado."}
            </p>
            <p style={{ fontSize: "12px", color: "#666", margin: "16px 0 0 0" }}>
              Tente recarregar a página (F5) ou contate o suporte.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const root = document.getElementById("root");
if (root) {
  const reactRoot = ReactDOM.createRoot(root);
  
  window.addEventListener("error", function (event) {
    const rootEl = document.getElementById("root");
    if (rootEl && rootEl.children.length === 0) {
      rootEl.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #0a1628; color: white; font-family: system-ui, sans-serif; padding: 20px;">
          <div style="max-width: 500px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 24px;">⚠️</div>
            <h1 style="font-size: 24px; font-weight: 900; margin: 0 0 12px 0; color: #ff6b6b;">Erro Crítico</h1>
            <p style="font-size: 14px; color: #aaa; line-height: 1.6; margin: 0; word-break: break-word;">
              ${event.message || "Um erro crítico ocorreu na aplicação."}
            </p>
            <p style="font-size: 12px; color: #666; margin: 16px 0 0 0;">
              Verifique o console (F12) para mais detalhes.
            </p>
          </div>
        </div>
      `;
    }
  });

  reactRoot.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}
