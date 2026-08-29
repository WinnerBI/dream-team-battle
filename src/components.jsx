import { useState, useRef, useEffect } from "react";
import {
  FIELD_LAYOUT,
  CREST_DEFS,
  flagEmoji,
  validatePlayerLocal,
  setorNome,
  slotSector,
} from "./gameLogic.js";

function CrestSVG(props) {
  const crest = props.crest;
  const size = props.size || 48;
  const teamName = props.teamName || "";
  const c = typeof crest === "string" ? (CREST_DEFS.find(function (d) { return d.id === crest; }) || CREST_DEFS[0]) : (crest || CREST_DEFS[0]);
  const initials = teamName.split(" ").map(function (w) { return w[0] || ""; }).join("").slice(0, 2).toUpperCase();
  return (
    <svg width={size} height={size} viewBox="0 0 48 56" style={{ flexShrink: 0 }}>
      <path d="M4 4 H44 V32 Q44 52 24 54 Q4 52 4 32 Z" fill={c.primary} stroke={c.secondary} strokeWidth="2.5" />
      <rect x="4" y="17" width="40" height="8" fill={c.secondary} opacity="0.18" />
      <text x="24" y="33" textAnchor="middle" fontSize="14" fontWeight="900" fill={c.secondary} fontFamily="system-ui,sans-serif">
        {initials || "FC"}
      </text>
    </svg>
  );
}

function PlayerPhoto(props) {
  const name = props.name;
  const size = props.size || 44;
  const initials = name.split(" ").map(function (w) { return w[0] || ""; }).join("").slice(0, 2).toUpperCase();
  // Cor unica derivada do nome (hash simples)
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  const bg = "hsl(" + hue + ",55%,32%)";
  const bg2 = "hsl(" + ((hue + 40) % 360) + ",55%,22%)";
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "linear-gradient(135deg," + bg + "," + bg2 + ")", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.36, fontWeight: 900, color: "white", flexShrink: 0, border: "2px solid rgba(255,255,255,0.15)" }}>
      {initials}
    </div>
  );
}

function InteractiveField(props) {
  const players = props.players;
  const formation = props.formation;
  const crestId = props.crestId;
  const teamName = props.teamName;
  const onSlotClick = props.onSlotClick;
  const editMode = props.editMode;
  const layout = FIELD_LAYOUT[formation] || FIELD_LAYOUT["4-3-3"];
  const c = CREST_DEFS.find(function (d) { return d.id === crestId; }) || CREST_DEFS[0];
  const color = c.secondary;
  return (
    <div style={{ position: "relative", width: "100%", paddingTop: "148%", background: "linear-gradient(180deg,#145a20 0%,#1e7a2e 30%,#1e7a2e 70%,#145a20 100%)", borderRadius: 14, overflow: "hidden", border: "2px solid #ffffff1a" }}>
      <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }} viewBox="0 0 100 148" preserveAspectRatio="none">
        <rect x="8" y="4" width="84" height="140" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="0.6" />
        <line x1="8" y1="74" x2="92" y2="74" stroke="rgba(255,255,255,0.22)" strokeWidth="0.6" />
        <circle cx="50" cy="74" r="11" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="0.6" />
        <rect x="28" y="4" width="44" height="18" fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="0.5" />
        <rect x="28" y="126" width="44" height="18" fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="0.5" />
      </svg>
      <div style={{ position: "absolute", top: 5, left: 0, right: 0, textAlign: "center", color: color, fontWeight: 900, fontSize: "clamp(7px,2.2vw,10px)", textTransform: "uppercase", letterSpacing: 1, textShadow: "0 1px 4px #000", pointerEvents: "none" }}>
        {teamName}
      </div>
      {layout.map(function (slot, i) {
        const p = players[i];
        const has = p && p.name;
        return (
          <div key={i} onClick={function () { if (editMode && onSlotClick) onSlotClick(i); }} style={{ position: "absolute", left: slot.x + "%", top: slot.y + "%", transform: "translate(-50%,-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, cursor: editMode ? "pointer" : "default", zIndex: 2 }}>
            {has ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <div style={{ position: "relative" }}>
                  <PlayerPhoto name={p.name} size={editMode ? 36 : 28} />
                  <div style={{ position: "absolute", bottom: -2, left: "50%", transform: "translateX(-50%)", background: color, borderRadius: 3, padding: "1px 4px", fontSize: "clamp(4px,1.1vw,6px)", fontWeight: 900, color: c.primary, whiteSpace: "nowrap" }}>
                    {slot.pos}
                  </div>
                </div>
                <div style={{ color: "white", fontSize: "clamp(4px,1.1vw,7px)", fontWeight: 700, textAlign: "center", maxWidth: "clamp(34px,8vw,50px)", textShadow: "0 1px 3px #000", lineHeight: 1.1, wordBreak: "break-word" }}>
                  {(p.pais ? flagEmoji(p.pais) + " " : "") + p.name.split(" ").slice(-1)[0]}
                </div>
              </div>
            ) : (
              <div style={{ width: editMode ? 32 : 24, height: editMode ? 32 : 24, borderRadius: "50%", border: "2px dashed " + (editMode ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.18)"), display: "flex", alignItems: "center", justifyContent: "center", background: editMode ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.18)" }}>
                {editMode ? <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>+</span> : null}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function PlayerPopup(props) {
  const position = props.position;
  const theme = props.theme;
  const onConfirm = props.onConfirm;
  const onClose = props.onClose;
  const [name, setName] = useState("");
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [validatedName, setValidatedName] = useState("");
  const [validatedPlayer, setValidatedPlayer] = useState(null);
  const inputRef = useRef(null);

  useEffect(function () {
    const t = setTimeout(function () { if (inputRef.current) inputRef.current.focus(); }, 80);
    return function () { clearTimeout(t); };
  }, []);

  function validate() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setStatus("loading");
    setErrorMsg("");
    // Pequeno delay so para dar feedback visual
    setTimeout(function () {
      const result = validatePlayerLocal(trimmed, theme, position);
      if (result.valido) {
        setStatus("ok");
        setValidatedName(result.nome_completo || trimmed);
        setValidatedPlayer(result.player || null);
      } else {
        setStatus("error");
        setErrorMsg(result.motivo || "Jogador nao se enquadra neste tema.");
      }
    }, 250);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }} onClick={onClose}>
      <div style={{ background: "#141e33", borderRadius: 20, padding: 22, width: "100%", maxWidth: 340, border: "1px solid rgba(255,255,255,0.1)" }} onClick={function (e) { e.stopPropagation(); }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 15 }}>Escalar Jogador</div>
            <div style={{ color: "#888", fontSize: 12, marginTop: 2 }}>Posicao: <strong style={{ color: "#FFD700" }}>{position}</strong></div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 8, color: "white", width: 32, height: 32, cursor: "pointer", fontSize: 16 }}>X</button>
        </div>

        <div style={{ background: "rgba(255,215,0,0.08)", borderRadius: 10, padding: "8px 12px", marginBottom: 14, fontSize: 12, color: "#ccc", borderLeft: "3px solid #FFD700" }}>
          {theme ? theme.desc : ""}
        </div>

        {status !== "ok" ? (
          <div>
            <input ref={inputRef} style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.08)", border: "1px solid " + (status === "error" ? "#ff6b6b55" : "rgba(255,255,255,0.18)"), borderRadius: 10, padding: "12px 14px", color: "white", fontSize: 15, outline: "none", marginBottom: 10 }}
              placeholder="Nome do jogador..."
              value={name}
              onChange={function (e) { setName(e.target.value); setStatus("idle"); setErrorMsg(""); }}
              onKeyDown={function (e) { if (e.key === "Enter" && status === "idle" && name.trim()) validate(); }} />
            {status === "error" ? (
              <div style={{ color: "#ff8080", fontSize: 12, marginBottom: 10, lineHeight: 1.5, background: "rgba(255,107,107,0.08)", borderRadius: 8, padding: "8px 10px" }}>{errorMsg}</div>
            ) : null}
            <button style={{ width: "100%", background: status === "loading" ? "#1e2a40" : "linear-gradient(135deg,#6c5ce7,#a29bfe)", color: "white", border: "none", borderRadius: 10, padding: "12px", fontWeight: 800, fontSize: 14, cursor: (status === "loading" || !name.trim()) ? "not-allowed" : "pointer", opacity: !name.trim() ? 0.5 : 1 }}
              disabled={status === "loading" || !name.trim()}
              onClick={validate}>
              {status === "loading" ? "Validando..." : "Validar Jogador"}
            </button>
          </div>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, justifyContent: "center", background: "rgba(81,207,102,0.07)", borderRadius: 12, padding: "14px", marginBottom: 14 }}>
              <PlayerPhoto name={validatedName} size={56} />
              <div style={{ textAlign: "left" }}>
                <div style={{ color: "#51cf66", fontSize: 11, fontWeight: 700, marginBottom: 3 }}>Aprovado!</div>
                <div style={{ fontWeight: 900, fontSize: 15, lineHeight: 1.2 }}>
                  {validatedPlayer && validatedPlayer.pais ? flagEmoji(validatedPlayer.pais) + " " : ""}{validatedName}
                </div>
                {validatedPlayer ? (
                  <div style={{ color: "#888", fontSize: 11, marginTop: 3 }}>{setorNome(validatedPlayer.pos)}</div>
                ) : null}
              </div>
            </div>
            <button style={{ width: "100%", background: "linear-gradient(135deg,#51cf66,#2f9e44)", color: "white", border: "none", borderRadius: 10, padding: "12px", fontWeight: 800, fontSize: 14, cursor: "pointer" }}
              onClick={function () { onConfirm(validatedName, validatedPlayer); }}>
              Confirmar Escalacao
            </button>
            <button onClick={function () { setStatus("idle"); setName(""); }} style={{ background: "transparent", border: "none", color: "#888", fontSize: 12, marginTop: 8, cursor: "pointer", width: "100%", padding: "6px 0" }}>
              Escolher outro jogador
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


export { CrestSVG, PlayerPhoto, InteractiveField, PlayerPopup };
