import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient.js";
import * as api from "./api.js";
import {
  FIXED_THEMES, FORMATIONS, POSITIONS_BY_FORMATION,
  CREST_DEFS, getThemeById, getRandomTheme, flagEmoji, setorNome, slotSector,
} from "./gameLogic.js";
import { CrestSVG, InteractiveField, PlayerPopup } from "./components.jsx";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// estilos base
const BG = "#0a1628";
const baseWrap = { minHeight: "100vh", background: BG, color: "white", fontFamily: "system-ui,sans-serif", padding: 16 };
const btnPrimary = { background: "linear-gradient(135deg,#FFD700,#FF8C00)", color: "#111", border: "none", borderRadius: 11, padding: "14px 20px", fontWeight: 900, fontSize: 15, cursor: "pointer", width: "100%" };
const btnGhost = { background: "transparent", color: "#666", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 11, padding: "12px 20px", fontWeight: 600, fontSize: 14, cursor: "pointer", width: "100%", marginTop: 8 };
const inputStyle = { background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 11, padding: "14px 16px", color: "white", fontSize: 15, outline: "none", width: "100%", boxSizing: "border-box" };

function themeLabel(t) {
  if (!t) return "";
  return (t.emoji ? t.emoji + " " : "") + t.label;
}

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState("home"); // home | newMatch | theme | roulette | squad | matchView

  // dados de fluxo de criacao
  const [profiles, setProfiles] = useState([]);
  const [matches, setMatches] = useState([]);
  const [opponent, setOpponent] = useState(null);
  const [themeId, setThemeId] = useState(null);
  const [themeTab, setThemeTab] = useState("letra");
  const [letterTab, setLetterTab] = useState("A");
  const [rouletteLabel, setRouletteLabel] = useState("");
  const [rouletteDone, setRouletteDone] = useState(false);

  // escalacao
  const [formation, setFormation] = useState("4-3-3");
  const [lineup, setLineup] = useState(new Array(11).fill(null));
  const [popupSlot, setPopupSlot] = useState(null);
  const [squadMode, setSquadMode] = useState("create"); // create | respond
  const [activeMatch, setActiveMatch] = useState(null);

  // login form
  const [authMode, setAuthMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [regTeam, setRegTeam] = useState("");
  const [regCrest, setRegCrest] = useState("c1");
  const [authError, setAuthError] = useState("");
  const [busy, setBusy] = useState(false);

  const theme = getThemeById(themeId);
  const positions = POSITIONS_BY_FORMATION[formation];

  // --- Sessao ---
  useEffect(function () {
    supabase.auth.getSession().then(function (res) {
      setSession(res.data.session);
      setLoading(false);
    });
    const sub = supabase.auth.onAuthStateChange(function (_e, sess) {
      setSession(sess);
    });
    return function () { sub.data.subscription.unsubscribe(); };
  }, []);

  useEffect(function () {
    if (session && session.user) {
      api.getProfile(session.user.id).then(setProfile);
      refreshMatches();
    } else {
      setProfile(null);
    }
  }, [session]);

  function refreshMatches() {
    if (!session || !session.user) return;
    api.listMyMatches(session.user.id).then(setMatches).catch(function () {});
  }

  // --- Roleta ---
  useEffect(function () {
    if (screen !== "roulette" || rouletteDone) return;
    const finalTheme = getRandomTheme();
    const pool = FIXED_THEMES.map(function (t) { return themeLabel(t); })
      .concat(ALPHABET.map(function (l) { return "\uD83D\uDD24 Letra " + l; }));
    let elapsed = 0, delay = 70;
    const total = 2600;
    let timer = null, cancelled = false;
    function tick() {
      if (cancelled) return;
      setRouletteLabel(pool[Math.floor(Math.random() * pool.length)]);
      elapsed += delay;
      if (elapsed > total * 0.6) delay += 28;
      if (elapsed >= total) {
        setRouletteLabel(themeLabel(finalTheme));
        setThemeId(finalTheme.id);
        setRouletteDone(true);
        return;
      }
      timer = setTimeout(tick, delay);
    }
    timer = setTimeout(tick, delay);
    return function () { cancelled = true; if (timer) clearTimeout(timer); };
  }, [screen, rouletteDone]);

  // --- Auth handlers ---
  async function handleAuth() {
    setBusy(true); setAuthError("");
    try {
      if (authMode === "login") {
        await api.signIn(email, password);
      } else {
        if (!regTeam.trim()) { setAuthError("Escolha o nome do time."); setBusy(false); return; }
        await api.signUp(email, password, regTeam, regCrest);
      }
    } catch (e) {
      setAuthError(e.message || "Erro na autenticacao.");
    }
    setBusy(false);
  }

  async function handleLogout() {
    await api.signOut();
    setScreen("home");
  }

  // --- Fluxo de partida ---
  function startNewMatch() {
    api.listProfiles(session.user.id).then(setProfiles).catch(function () { setProfiles([]); });
    setOpponent(null); setThemeId(null);
    setScreen("newMatch");
  }

  function pickOpponent(p) {
    setOpponent(p);
    setScreen("theme");
  }

  function chooseTheme(id) {
    setThemeId(id);
    setFormation("4-3-3");
    setLineup(new Array(11).fill(null));
    setSquadMode("create");
    setScreen("squad");
  }

  function startRoulette() {
    setRouletteDone(false); setRouletteLabel(""); setThemeId(null);
    setScreen("roulette");
  }

  function changeFormation(newFormation) {
    const oldPos = POSITIONS_BY_FORMATION[formation];
    const newPos = POSITIONS_BY_FORMATION[newFormation];
    const bySector = { GOL: [], DEF: [], MEI: [], ATA: [] };
    for (let i = 0; i < lineup.length; i++) {
      if (lineup[i] && lineup[i].name) bySector[slotSector(oldPos[i])].push(lineup[i]);
    }
    const np = new Array(11).fill(null);
    const cur = { GOL: 0, DEF: 0, MEI: 0, ATA: 0 };
    const overflow = [];
    for (let i = 0; i < newPos.length; i++) {
      const sec = slotSector(newPos[i]);
      if (cur[sec] < bySector[sec].length) { np[i] = bySector[sec][cur[sec]]; cur[sec]++; }
    }
    ["GOL", "DEF", "MEI", "ATA"].forEach(function (sec) {
      while (cur[sec] < bySector[sec].length) { overflow.push(bySector[sec][cur[sec]]); cur[sec]++; }
    });
    let oi = 0;
    for (let i = 0; i < np.length && oi < overflow.length; i++) { if (!np[i]) { np[i] = overflow[oi]; oi++; } }
    setFormation(newFormation);
    setLineup(np);
  }

  const allFilled = lineup.every(function (p) { return p && p.name; });

  async function submitLineup() {
    setBusy(true);
    try {
      if (squadMode === "create") {
        await api.createMatch({
          challengerId: session.user.id,
          opponentId: opponent.id,
          themeId: themeId,
          formation: formation,
          players: lineup,
        });
        refreshMatches();
        setScreen("home");
      } else {
        const finished = await api.submitOpponentLineup(activeMatch.id, formation, lineup);
        setActiveMatch(finished);
        refreshMatches();
        setScreen("matchView");
      }
    } catch (e) {
      alert("Erro ao enviar escalacao: " + (e.message || e));
    }
    setBusy(false);
  }

  function openMatch(m) {
    setActiveMatch(m);
    if (m.status === "finalizada") {
      setScreen("matchView");
    } else if (m.opponent_id === session.user.id) {
      // Eu sou o adversario e ainda nao escalei -> escalar
      setThemeId(m.theme_id);
      setFormation("4-3-3");
      setLineup(new Array(11).fill(null));
      setSquadMode("respond");
      setScreen("squad");
    } else {
      // Sou o desafiante esperando -> so mostra status
      setScreen("matchView");
    }
  }

  // ====================== RENDER ======================

  if (loading) {
    return <div style={Object.assign({}, baseWrap, { display: "flex", alignItems: "center", justifyContent: "center" })}>Carregando...</div>;
  }

  // ---------- AUTH ----------
  if (!session) {
    return (
      <div style={Object.assign({}, baseWrap, { display: "flex", alignItems: "center", justifyContent: "center" })}>
        <div style={{ width: "100%", maxWidth: 380 }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 52 }}>{"\u26BD"}</div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: "#FFD700", margin: "8px 0 4px" }}>DREAM TEAM BATTLE</h1>
            <p style={{ color: "#555", fontSize: 13 }}>Desafie seus amigos de verdade!</p>
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 20, background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 4 }}>
            {[["login", "Entrar"], ["register", "Criar Conta"]].map(function (pair) {
              return (
                <button key={pair[0]} onClick={function () { setAuthMode(pair[0]); setAuthError(""); }}
                  style={{ flex: 1, background: authMode === pair[0] ? "rgba(255,215,0,0.15)" : "transparent", border: "1px solid " + (authMode === pair[0] ? "#FFD700" : "transparent"), borderRadius: 9, padding: "10px", fontWeight: 700, color: authMode === pair[0] ? "#FFD700" : "#888", cursor: "pointer" }}>
                  {pair[1]}
                </button>
              );
            })}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input style={inputStyle} placeholder="Email" value={email} onChange={function (e) { setEmail(e.target.value); }} />
            <input style={inputStyle} type="password" placeholder="Senha" value={password} onChange={function (e) { setPassword(e.target.value); }} />
            {authMode === "register" ? (
              <div>
                <input style={inputStyle} placeholder="Nome do seu time" value={regTeam} onChange={function (e) { setRegTeam(e.target.value); }} />
                <div style={{ color: "#888", fontSize: 12, margin: "14px 0 8px", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Escolha o brasao</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
                  {CREST_DEFS.map(function (c) {
                    return (
                      <button key={c.id} onClick={function () { setRegCrest(c.id); }}
                        style={{ background: regCrest === c.id ? "rgba(255,215,0,0.15)" : "rgba(255,255,255,0.04)", border: "2px solid " + (regCrest === c.id ? "#FFD700" : "rgba(255,255,255,0.08)"), borderRadius: 12, padding: "10px 6px", cursor: "pointer", display: "flex", justifyContent: "center" }}>
                        <CrestSVG crest={c} size={40} teamName={regTeam} />
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
            {authError ? <div style={{ color: "#ff8080", fontSize: 13, background: "rgba(255,107,107,0.08)", borderRadius: 8, padding: "8px 12px" }}>{authError}</div> : null}
            <button style={btnPrimary} disabled={busy} onClick={handleAuth}>
              {busy ? "Aguarde..." : (authMode === "login" ? "Entrar" : "Criar Conta")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- HOME ----------
  if (screen === "home") {
    const pendingForMe = matches.filter(function (m) { return m.status === "aguardando" && m.opponent_id === session.user.id; });
    const waiting = matches.filter(function (m) { return m.status === "aguardando" && m.challenger_id === session.user.id; });
    const finished = matches.filter(function (m) { return m.status === "finalizada"; });

    return (
      <div style={baseWrap}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, paddingTop: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {profile ? <CrestSVG crest={profile.crest_id} size={44} teamName={profile.team_name} /> : null}
              <div>
                <div style={{ fontWeight: 900, fontSize: 16 }}>{profile ? profile.team_name : ""}</div>
                <div style={{ color: "#555", fontSize: 12 }}>{profile ? (profile.wins + "V " + profile.losses + "D") : ""}</div>
              </div>
            </div>
            <button onClick={handleLogout} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#666", padding: "6px 12px", cursor: "pointer", fontSize: 12 }}>Sair</button>
          </div>

          <button style={btnPrimary} onClick={startNewMatch}>+ Nova Partida</button>

          {pendingForMe.length > 0 ? (
            <div style={{ marginTop: 24 }}>
              <div style={{ color: "#FFD700", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>Sua vez de jogar ({pendingForMe.length})</div>
              {pendingForMe.map(function (m) { return <MatchRow key={m.id} match={m} me={session.user.id} onClick={function () { openMatch(m); }} cta="Escalar time" />; })}
            </div>
          ) : null}

          {waiting.length > 0 ? (
            <div style={{ marginTop: 24 }}>
              <div style={{ color: "#888", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>Aguardando adversario ({waiting.length})</div>
              {waiting.map(function (m) { return <MatchRow key={m.id} match={m} me={session.user.id} onClick={function () { openMatch(m); }} cta="Aguardando..." />; })}
            </div>
          ) : null}

          {finished.length > 0 ? (
            <div style={{ marginTop: 24 }}>
              <div style={{ color: "#888", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>Finalizadas</div>
              {finished.map(function (m) { return <MatchRow key={m.id} match={m} me={session.user.id} onClick={function () { openMatch(m); }} cta="Ver resultado" />; })}
            </div>
          ) : null}

          {matches.length === 0 ? (
            <div style={{ textAlign: "center", color: "#444", marginTop: 40, fontSize: 14 }}>
              Nenhuma partida ainda.<br />Clique em "Nova Partida" para desafiar um amigo!
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  // ---------- NEW MATCH: escolher adversario ----------
  if (screen === "newMatch") {
    return (
      <div style={baseWrap}>
        <div style={{ maxWidth: 440, margin: "0 auto" }}>
          <button onClick={function () { setScreen("home"); }} style={{ background: "transparent", border: "none", color: "#666", cursor: "pointer", fontSize: 14, marginBottom: 20, padding: 0 }}>Voltar</button>
          <h2 style={{ fontWeight: 900, fontSize: 22, marginBottom: 2 }}>Escolher Adversario</h2>
          <p style={{ color: "#555", fontSize: 13, marginBottom: 20 }}>Selecione um amigo para desafiar</p>
          {profiles.length === 0 ? (
            <div style={{ color: "#444", fontSize: 14, textAlign: "center", padding: "30px 0" }}>Nenhum outro jogador cadastrado ainda.<br />Peca para seu amigo criar uma conta!</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {profiles.map(function (p) {
                return (
                  <button key={p.id} onClick={function () { pickOpponent(p); }}
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "14px 16px", textAlign: "left", cursor: "pointer", color: "white", display: "flex", alignItems: "center", gap: 14 }}>
                    <CrestSVG crest={p.crest_id} size={44} teamName={p.team_name} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{p.team_name}</div>
                      <div style={{ color: "#555", fontSize: 12, marginTop: 2 }}>{p.wins}V {p.losses}D</div>
                    </div>
                    <div style={{ color: "#FFD700", fontSize: 20 }}>&gt;</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---------- THEME ----------
  if (screen === "theme") {
    return (
      <div style={Object.assign({}, baseWrap, { overflowY: "auto" })}>
        <div style={{ maxWidth: 440, margin: "0 auto" }}>
          <button onClick={function () { setScreen("newMatch"); }} style={{ background: "transparent", border: "none", color: "#666", cursor: "pointer", fontSize: 14, marginBottom: 20, padding: 0 }}>Voltar</button>
          {opponent ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "10px 14px", marginBottom: 20 }}>
              <CrestSVG crest={opponent.crest_id} size={32} teamName={opponent.team_name} />
              <div>
                <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase" }}>Adversario</div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{opponent.team_name}</div>
              </div>
            </div>
          ) : null}
          <h2 style={{ fontWeight: 900, fontSize: 22, marginBottom: 2 }}>Tema da Partida</h2>
          <p style={{ color: "#555", fontSize: 13, marginBottom: 16 }}>Define quais jogadores podem ser escalados</p>
          <button style={{ width: "100%", background: "linear-gradient(135deg,#9b59b6,#6c3483)", color: "white", border: "none", borderRadius: 12, padding: "13px 16px", fontWeight: 800, fontSize: 14, cursor: "pointer", marginBottom: 16 }} onClick={startRoulette}>
            Sortear tema aleatorio
          </button>
          <div style={{ color: "#444", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12 }}>ou escolha</div>
          <div style={{ display: "flex", gap: 6, marginBottom: 14, background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 4 }}>
            {[["letra", "Por Letra"], ["outros", "Outros"]].map(function (pair) {
              return (
                <button key={pair[0]} onClick={function () { setThemeTab(pair[0]); }}
                  style={{ flex: 1, background: themeTab === pair[0] ? "rgba(255,215,0,0.12)" : "transparent", border: "1px solid " + (themeTab === pair[0] ? "#FFD700" : "transparent"), borderRadius: 9, padding: "9px", fontWeight: 700, color: themeTab === pair[0] ? "#FFD700" : "#888", cursor: "pointer" }}>
                  {pair[1]}
                </button>
              );
            })}
          </div>
          {themeTab === "letra" ? (
            <div>
              <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 14, marginBottom: 12 }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {ALPHABET.map(function (l) {
                    return <button key={l} onClick={function () { setLetterTab(l); }} style={{ width: 36, height: 36, borderRadius: 8, background: letterTab === l ? "#FFD700" : "rgba(255,255,255,0.06)", color: letterTab === l ? "#111" : "white", border: "none", fontWeight: 900, cursor: "pointer" }}>{l}</button>;
                  })}
                </div>
              </div>
              <button style={btnPrimary} onClick={function () { chooseTheme("letra_" + letterTab); }}>Usar letra {letterTab}</button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {FIXED_THEMES.map(function (t) {
                return (
                  <button key={t.id} onClick={function () { chooseTheme(t.id); }}
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "13px 16px", textAlign: "left", cursor: "pointer", color: "white" }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{themeLabel(t)}</div>
                    <div style={{ color: "#555", fontSize: 11, marginTop: 2 }}>{t.desc}</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---------- ROULETTE ----------
  if (screen === "roulette") {
    return (
      <div style={Object.assign({}, baseWrap, { display: "flex", alignItems: "center", justifyContent: "center" })}>
        <div style={{ width: "100%", maxWidth: 440, textAlign: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#9b7bd6", textTransform: "uppercase", letterSpacing: 2, marginBottom: 24 }}>
            {rouletteDone ? "Tema sorteado!" : "Sorteando..."}
          </div>
          <div style={{ background: rouletteDone ? "linear-gradient(135deg,rgba(155,89,182,0.25),rgba(108,52,131,0.15))" : "rgba(255,255,255,0.04)", border: "2px solid " + (rouletteDone ? "#9b59b6" : "rgba(255,255,255,0.08)"), borderRadius: 20, padding: "40px 24px", minHeight: 110, display: "flex", alignItems: "center", justifyContent: "center", transform: rouletteDone ? "scale(1.05)" : "scale(1)", boxShadow: rouletteDone ? "0 0 40px rgba(155,89,182,0.4)" : "none" }}>
            <div style={{ fontSize: rouletteDone ? 26 : 22, fontWeight: 900, color: rouletteDone ? "#fff" : "#aaa" }}>{rouletteLabel || "..."}</div>
          </div>
          {rouletteDone ? (
            <div style={{ marginTop: 28 }}>
              <div style={{ color: "#888", fontSize: 13, marginBottom: 20 }}>{theme ? theme.desc : ""}</div>
              <button style={btnPrimary} onClick={function () { chooseTheme(themeId); }}>Montar Escalacao</button>
              <button style={btnGhost} onClick={startRoulette}>Sortear de novo</button>
            </div>
          ) : (
            <div style={{ marginTop: 28, fontSize: 40 }}>{"\uD83C\uDFB2"}</div>
          )}
        </div>
      </div>
    );
  }

  // ---------- SQUAD ----------
  if (screen === "squad") {
    return (
      <div style={baseWrap}>
        {popupSlot !== null ? (
          <PlayerPopup
            position={positions[popupSlot]}
            theme={theme}
            onClose={function () { setPopupSlot(null); }}
            onConfirm={function (n, pdata) {
              const np = lineup.slice();
              np[popupSlot] = { name: n, pais: pdata ? pdata.pais : null, pos: pdata ? pdata.pos : null };
              setLineup(np);
              setPopupSlot(null);
            }}
          />
        ) : null}
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <button onClick={function () { setScreen(squadMode === "create" ? "theme" : "home"); }} style={{ background: "transparent", border: "none", color: "#666", cursor: "pointer", fontSize: 14, padding: 0 }}>{"<"}</button>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 900, fontSize: 15 }}>{squadMode === "create" ? "Monte seu time" : "Responda o desafio"}</div>
              <div style={{ color: "#666", fontSize: 12 }}>{lineup.filter(function (p) { return p && p.name; }).length}/11 - {themeLabel(theme)}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 5, marginBottom: 12, flexWrap: "wrap" }}>
            {FORMATIONS.map(function (f) {
              return <button key={f} onClick={function () { changeFormation(f); }} style={{ background: formation === f ? "#FFD700" : "rgba(255,255,255,0.06)", color: formation === f ? "#111" : "white", border: "none", borderRadius: 8, padding: "6px 11px", fontWeight: 700, cursor: "pointer", fontSize: 12 }}>{f}</button>;
            })}
          </div>
          <InteractiveField players={lineup} formation={formation} crestId={profile ? profile.crest_id : "c1"} teamName={profile ? profile.team_name : ""} editMode={true} onSlotClick={function (i) { setPopupSlot(i); }} />
          <div style={{ color: "#444", fontSize: 11, textAlign: "center", margin: "10px 0 12px" }}>Toque em uma posicao para escalar</div>
          <button style={Object.assign({}, btnPrimary, { background: allFilled ? btnPrimary.background : "#111", color: allFilled ? "#111" : "#333", cursor: allFilled ? "pointer" : "not-allowed" })} disabled={!allFilled || busy} onClick={submitLineup}>
            {busy ? "Enviando..." : (squadMode === "create" ? "Enviar Desafio" : "Jogar Partida!")}
          </button>
        </div>
      </div>
    );
  }

  // ---------- MATCH VIEW ----------
  if (screen === "matchView" && activeMatch) {
    return <MatchView match={activeMatch} me={session.user.id} profile={profile} opponentProfiles={profiles} onBack={function () { refreshMatches(); setScreen("home"); }} />;
  }

  return null;
}

// ============ COMPONENTES AUXILIARES ============

function MatchRow(props) {
  const m = props.match;
  const me = props.me;
  const cta = props.cta;
  let resultColor = "#888";
  let resultText = cta;
  if (m.status === "finalizada") {
    if (m.winner_id === me) { resultText = "Voce venceu " + m.score_a + "-" + m.score_b; resultColor = "#51cf66"; }
    else if (m.winner_id === null) { resultText = "Empate " + m.score_a + "-" + m.score_b; resultColor = "#aaa"; }
    else { resultText = "Derrota " + m.score_a + "-" + m.score_b; resultColor = "#ff6b6b"; }
  }
  const th = getThemeById(m.theme_id);
  return (
    <button onClick={props.onClick} style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "13px 16px", textAlign: "left", cursor: "pointer", color: "white", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: 14 }}>{themeLabel(th)}</div>
        <div style={{ color: resultColor, fontSize: 12, marginTop: 3, fontWeight: 600 }}>{resultText}</div>
      </div>
      <div style={{ color: "#FFD700", fontSize: 18 }}>&gt;</div>
    </button>
  );
}

function MatchView(props) {
  const m = props.match;
  const me = props.me;
  const [shown, setShown] = useState([]);
  const bottomRef = useRef(null);
  const isFinished = m.status === "finalizada";

  useEffect(function () {
    if (!isFinished || !m.narration) return;
    setShown([]);
    let i = 0;
    let cancelled = false;
    function step() {
      if (cancelled) return;
      if (i >= m.narration.length) return;
      const lance = m.narration[i];
      setShown(function (prev) { return prev.concat([lance]); });
      i++;
      if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: "smooth" });
      setTimeout(step, 700);
    }
    setTimeout(step, 400);
    return function () { cancelled = true; };
  }, [m.id]);

  if (!isFinished) {
    return (
      <div style={Object.assign({}, baseWrap, { display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" })}>
        <div>
          <div style={{ fontSize: 48, marginBottom: 12 }}>{"\u23F3"}</div>
          <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 6 }}>Desafio enviado!</div>
          <div style={{ color: "#888", fontSize: 14, marginBottom: 24 }}>Aguardando seu adversario escalar o time.</div>
          <button style={btnPrimary} onClick={props.onBack}>Voltar</button>
        </div>
      </div>
    );
  }

  const iAmChallenger = m.challenger_id === me;
  const myScore = iAmChallenger ? m.score_a : m.score_b;
  const oppScore = iAmChallenger ? m.score_b : m.score_a;
  let resultLabel, resultColor;
  if (m.winner_id === me) { resultLabel = "VOCE VENCEU!"; resultColor = "#51cf66"; }
  else if (m.winner_id === null) { resultLabel = "EMPATE"; resultColor = "#FFD700"; }
  else { resultLabel = "VOCE PERDEU"; resultColor = "#ff6b6b"; }

  return (
    <div style={baseWrap}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <button onClick={props.onBack} style={{ background: "transparent", border: "none", color: "#666", cursor: "pointer", fontSize: 14, marginBottom: 16, padding: 0 }}>Voltar</button>
        <div style={{ background: "linear-gradient(135deg,rgba(255,215,0,0.1),rgba(255,140,0,0.06))", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 18, padding: 22, textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 21, fontWeight: 900, color: resultColor, marginBottom: 8 }}>{resultLabel}</div>
          <div style={{ fontSize: 44, fontWeight: 900 }}>{myScore} - {oppScore}</div>
          <div style={{ color: "#888", fontSize: 13, marginTop: 10 }}>{m.destaque}</div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 16, maxHeight: 360, overflowY: "auto" }}>
          <div style={{ fontWeight: 700, marginBottom: 10, color: "#FFD700", fontSize: 14 }}>Narracao</div>
          {shown.map(function (l, i) {
            return (
              <div key={i} style={{ marginBottom: 10, padding: "9px 12px", borderRadius: 9, background: l.tipo === "gol" ? "rgba(255,215,0,0.08)" : "rgba(255,255,255,0.025)", borderLeft: "3px solid " + (l.tipo === "gol" ? "#FFD700" : "#1e2a40") }}>
                <span style={{ color: l.tipo === "gol" ? "#FFD700" : "#444", fontWeight: 700, fontSize: 11, marginRight: 8 }}>{l.minuto}'</span>
                <span style={{ fontSize: 13, color: l.tipo === "gol" ? "#fff" : "#aaa", fontWeight: l.tipo === "gol" ? 700 : 400 }}>{l.texto}</span>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
}
