// Supabase Query Helpers
import { getSupabase } from './supabaseClient.js';

// ==================== OPERATIVES ====================

export async function getAllOperatives() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('operatives')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch operatives: ${error.message}`);
  return data || [];
}

export async function getOperativeById(id) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('operatives')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function getActiveOperatives() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('operatives')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch active operatives: ${error.message}`);
  return data || [];
}

export async function getOperativesInMission(missionId) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('mission_operatives')
    .select('operatives(*)')
    .eq('mission_id', missionId);

  if (error) throw new Error(`Failed to fetch mission operatives: ${error.message}`);
  return data?.reduce((acc, mo) => {
    if (mo.operatives) acc.push(mo.operatives);
    return acc;
  }, []) || [];
}

export async function createOperative(operative) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('operatives')
    .insert([operative])
    .select()
    .single();

  if (error) throw new Error(`Failed to create operative: ${error.message}`);
  return data;
}

export async function updateOperative(id, updates) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('operatives')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update operative: ${error.message}`);
  return data;
}

export async function deleteOperative(id) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('operatives')
    .delete()
    .eq('id', id);

  if (error) throw new Error(`Failed to delete operative: ${error.message}`);
}

// ==================== MISSIONS ====================

export async function getAllMissions() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('missions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch missions: ${error.message}`);
  return data || [];
}

export async function getMissionById(id) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('missions')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function getOngoingMissions() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('missions')
    .select('*')
    .eq('status', 'ongoing')
    .order('start_date', { ascending: true });

  if (error) throw new Error(`Failed to fetch ongoing missions: ${error.message}`);
  return data || [];
}

export async function createMission(mission) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('missions')
    .insert([mission])
    .select()
    .single();

  if (error) throw new Error(`Failed to create mission: ${error.message}`);
  return data;
}

export async function updateMission(id, updates) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('missions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update mission: ${error.message}`);
  return data;
}

export async function deleteMission(id) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('missions')
    .delete()
    .eq('id', id);

  if (error) throw new Error(`Failed to delete mission: ${error.message}`);
}

export async function assignOperativeToMission(
  missionId,
  operativeId,
  roleInMission
) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('mission_operatives')
    .insert([{ mission_id: missionId, operative_id: operativeId, role_in_mission: roleInMission }])
    .select()
    .single();

  if (error) throw new Error(`Failed to assign operative: ${error.message}`);
  return data;
}

// ==================== ARCHIVES ====================

export async function getAllArchives() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('archives')
    .select('*')
    .order('date_recorded', { ascending: false });

  if (error) throw new Error(`Failed to fetch archives: ${error.message}`);
  return data || [];
}

export async function getArchivesByMission(missionId) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('archives')
    .select('*')
    .eq('mission_id', missionId)
    .order('date_recorded', { ascending: false });

  if (error) throw new Error(`Failed to fetch archives: ${error.message}`);
  return data || [];
}

export async function createArchive(archive) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('archives')
    .insert([archive])
    .select()
    .single();

  if (error) throw new Error(`Failed to create archive: ${error.message}`);
  return data;
}

// ==================== PORTFOLIO ====================

export async function getPortfolioByVersion(version) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('portfolio')
    .select('*')
    .eq('version', version)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function getAllPortfolios() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('portfolio')
    .select('*')
    .order('release_date', { ascending: false });

  if (error) throw new Error(`Failed to fetch portfolios: ${error.message}`);
  return data || [];
}

export async function getPortfolioWithMissions(portfolioId) {
  const supabase = getSupabase();

  const { data: portfolioData, error: portError } = await supabase
    .from('portfolio')
    .select('*')
    .eq('id', portfolioId)
    .single();

  if (portError) throw portError;
  if (!portfolioData) return null;

  const { data: missionsData, error: missError } = await supabase
    .from('portfolio_missions')
    .select('missions(*)')
    .eq('portfolio_id', portfolioId);

  if (missError) throw missError;

  const missions =
    missionsData?.reduce((acc, pm) => {
      if (pm.missions) acc.push(pm.missions);
      return acc;
    }, []) || [];

  return { portfolio: portfolioData, missions };
}

// ==================== STUDENTS ====================

export async function getAllStudents() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .order('id', { ascending: true });

  if (error) throw new Error(`Failed to fetch students: ${error.message}`);
  return data || [];
}

export async function getStudentById(id) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function getStudentsByTerm(term) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('term', term)
    .order('name', { ascending: true });

  if (error) throw new Error(`Failed to fetch students: ${error.message}`);
  return data || [];
}

export async function getStudentByEmail(email) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('email', email)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function updateStudent(id, updates) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('students')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update student: ${error.message}`);
  return data;
}

export async function createStudent(student) {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('students')
      .insert([student])
      .select()
      .single();

    if (error) throw new Error(error.message || 'Failed to create student');
    return data;
  } catch (err) {
    console.warn('createStudent fallback not implemented:', err.message || err);
    // Minimal fallback: return the provided student with a generated id
    const fallback = { id: Date.now(), ...student };
    return fallback;
  }
}

export async function getStudentPasswordById(id) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('students')
    .select('password')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data?.password ?? null;
}

export async function updateStudentPassword(id, newPassword) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('students')
    .update({ password: newPassword })
    .eq('id', id);

  if (error) throw new Error(`Failed to update password: ${error.message}`);
}


// ==================== SECRETARIES ====================

export async function getAllSecretaries() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('secretaries')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw new Error(`Failed to fetch secretaries: ${error.message}`);
  return data || [];
}

export async function getSecretaryById(id) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('secretaries')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function updateSecretary(id, updates) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('secretaries')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update secretary: ${error.message}`);
  return data;
}

export async function createSecretary(secretary) {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('secretaries')
      .insert([secretary])
      .select()
      .single();

    if (error) throw new Error(error.message || 'Failed to create secretary');
    return data;
  } catch (err) {
    console.warn('createSecretary fallback not implemented:', err.message || err);
    const fallback = { id: Date.now(), ...secretary };
    return fallback;
  }
}

// ==================== MENTORS ====================

export async function getAllMentors() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('mentors')
    .select('*')
    .order('id', { ascending: true });

  if (error) throw new Error(`Failed to fetch mentors: ${error.message}`);
  return data || [];
}

export async function createMentor(mentor) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('mentors')
    .insert([mentor])
    .select()
    .single();

  if (error) throw new Error(error.message || 'Failed to create mentor');
  return data;
}

export async function updateMentor(id, updates) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('mentors')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message || 'Failed to update mentor');
  return data;
}
