import { supabase } from "./supabaseClient.js";
import { generateMatch, POSITIONS_BY_FORMATION } from "./gameLogic.js";

// ============================================================
// AUTENTICACAO
// ============================================================

export async function signUp(email, password, teamName, crestId) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  const user = data.user;
  if (user) {
    // Cria o perfil do usuario
    const { error: perr } = await supabase.from("profiles").insert({
      id: user.id,
      team_name: teamName,
      crest_id: crestId,
    });
    if (perr) throw perr;
  }
  return user;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data ? data.user : null;
}

export async function getProfile(userId) {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
  if (error) return null;
  return data;
}

// Lista todos os perfis (para escolher adversario)
export async function listProfiles(excludeId) {
  const { data, error } = await supabase.from("profiles").select("*");
  if (error) throw error;
  return (data || []).filter(function (p) { return p.id !== excludeId; });
}

// Lista todos os perfis ordenados por wins (para ranking)
export async function listProfilesByWins() {
  const { data, error } = await supabase.from("profiles").select("*").order("wins", { ascending: false });
  if (error) throw error;
  return data || [];
}

// ============================================================
// PARTIDAS
// ============================================================

// Cria uma partida: desafiante ja escala seu time.
export async function createMatch(params) {
  const { challengerId, opponentId, themeId, formation, players } = params;
  const { data, error } = await supabase.from("matches").insert({
    challenger_id: challengerId,
    opponent_id: opponentId,
    theme_id: themeId,
    status: "aguardando",
    challenger_formation: formation,
    challenger_lineup: players,
  }).select().single();
  if (error) throw error;
  return data;
}

// Adversario escala seu time -> dispara a simulacao
export async function submitOpponentLineup(matchId, formation, players) {
  // Busca a partida atual
  const { data: match, error: merr } = await supabase.from("matches").select("*").eq("id", matchId).single();
  if (merr) throw merr;

  // Monta os dois times para simular
  const teamA = { players: match.challenger_lineup, formation: match.challenger_formation };
  const teamB = { players: players, formation: formation };
  const sim = generateMatch(teamA, teamB);

  const golsA = sim.placar_final.time1;
  const golsB = sim.placar_final.time2;

  // Descobre o vencedor por id
  let winnerId = null;
  if (golsA > golsB) winnerId = match.challenger_id;
  else if (golsB > golsA) winnerId = match.opponent_id;
  // empate -> winnerId permanece null

  const { data, error } = await supabase.from("matches").update({
    status: "finalizada",
    opponent_formation: formation,
    opponent_lineup: players,
    score_a: golsA,
    score_b: golsB,
    winner_id: winnerId,
    narration: sim.lances,
    destaque: sim.destaque,
    finished_at: new Date().toISOString(),
  }).eq("id", matchId).select().single();
  if (error) throw error;

  // Atualiza wins/losses dos dois jogadores
  if (winnerId !== null) {
    // Tem vencedor - busca os perfis atuais e incrementa
    const { data: winnerProfile } = await supabase.from("profiles").select("wins").eq("id", winnerId).single();
    const { error: werrWinner } = await supabase.from("profiles")
      .update({ wins: (winnerProfile?.wins || 0) + 1 })
      .eq("id", winnerId);
    if (werrWinner) throw werrWinner;

    const loserId = winnerId === match.challenger_id ? match.opponent_id : match.challenger_id;
    const { data: loserProfile } = await supabase.from("profiles").select("losses").eq("id", loserId).single();
    const { error: werrLoser } = await supabase.from("profiles")
      .update({ losses: (loserProfile?.losses || 0) + 1 })
      .eq("id", loserId);
    if (werrLoser) throw werrLoser;
  }
  // Se empate, nao altera nada

  return data;
}

// Partidas onde eu sou desafiante OU adversario
export async function listMyMatches(userId) {
  const { data, error } = await supabase.from("matches")
    .select("*")
    .or("challenger_id.eq." + userId + ",opponent_id.eq." + userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getMatch(matchId) {
  const { data, error } = await supabase.from("matches").select("*").eq("id", matchId).single();
  if (error) throw error;
  return data;
}
