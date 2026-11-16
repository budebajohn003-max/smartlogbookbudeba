import { supabase } from './supabase_client.js';
import { uploadLogbookPhoto } from './cloudinary.js';

function normalizeRole(role) {
  return role ? String(role).trim().toLowerCase() : 'student';
}

function profileFromRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    fullname: row.full_name,
    regno: row.registration_number,
    email: row.email,
    role: normalizeRole(row.role),
  };
}

function entryFromRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    studentName: row.profiles?.full_name || row.student_name || 'Student',
    date: row.entry_date,
    location: row.location,
    activities: row.activities,
    problem: row.problem,
    solution: row.solution,
    photo_name: row.photo_name,
    photo_url: row.photo_url,
    cloudinary_public_id: row.cloudinary_public_id,
    status: row.status,
    reviewer_comment: row.reviewer_comment,
    reviewed_at: row.reviewed_at,
    created_at: row.created_at,
  };
}

export async function ensureSeedData() {
  // Data now belongs to Supabase. Sample browser data is intentionally not seeded.
  return { data: null, error: null };
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, registration_number, email, role')
    .eq('id', user.id)
    .single();
  return profileFromRow(profile);
}

export async function registerUser({ fullname, regno, email, password }) {
  if (!fullname || !regno || !email || !password) {
    return { data: null, error: 'All fields are required.' };
  }
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: { data: { full_name: fullname.trim(), registration_number: regno.trim() } },
  });
  if (error) return { data: null, error: error.message };
  return { data: data.user, error: null };
}

export async function loginUser({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) return { data: null, error: error.message };
  const profile = await getCurrentUser();
  if (profile) return { data: profile, error: null };
  return {
    data: {
      id: data.user.id,
      fullname: data.user.email,
      email: data.user.email,
      role: 'student',
    },
    error: null,
  };
}

export async function logoutUser() {
  return supabase.auth.signOut();
}

export async function createLogbookEntry(entry, photoFile = null) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return { data: null, error: 'User not logged in.' };
  if (currentUser.role !== 'student') {
    return { data: null, error: 'Only student accounts can create logbook entries.' };
  }

  try {
    const photo = await uploadLogbookPhoto(photoFile);
    const { data, error } = await supabase
      .from('logbook_entries')
      .insert({
        user_id: currentUser.id,
        entry_date: entry.date,
        location: entry.location || null,
        activities: entry.activities.trim(),
        problem: entry.problem?.trim() || null,
        solution: entry.solution?.trim() || null,
        photo_name: photo?.name || null,
        photo_url: photo?.url || null,
        cloudinary_public_id: photo?.publicId || null,
      })
      .select('*, profiles!logbook_entries_user_id_fkey(full_name)')
      .single();
    return { data: entryFromRow(data), error: error?.message || null };
  } catch (error) {
    return { data: null, error: error.message || 'Unable to create logbook entry.' };
  }
}

export async function getMyLogbooks(userId) {
  const { data, error } = await supabase
    .from('logbook_entries')
    .select('*, profiles!logbook_entries_user_id_fkey(full_name)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data.map(entryFromRow);
}

export async function getPendingLogbooks() {
  const { data, error } = await supabase
    .from('logbook_entries')
    .select('*, profiles!logbook_entries_user_id_fkey(full_name)')
    .eq('status', 'Pending')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data.map(entryFromRow);
}

export async function getLogbookById(id) {
  const { data, error } = await supabase
    .from('logbook_entries')
    .select('*, profiles!logbook_entries_user_id_fkey(full_name)')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return entryFromRow(data);
}

export async function reviewLogbook({ id, status, comment }) {
  const { data, error } = await supabase.rpc('review_logbook', {
    entry_id: id,
    new_status: status,
    new_comment: comment?.trim() || null,
  });
  return { data, error: error?.message || null };
}

export async function fetchLogbookStats({ fromDate, toDate, userId = null }) {
  let query = supabase
    .from('logbook_entries')
    .select('id, user_id, entry_date, activities, status, created_at');
  if (userId) query = query.eq('user_id', userId);
  if (fromDate) query = query.gte('entry_date', fromDate);
  if (toDate) query = query.lte('entry_date', toDate);
  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const byStatus = data.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});
  const monthlyMap = data.reduce((acc, item) => {
    const month = item.entry_date.slice(0, 7);
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});
  return {
    total: data.length,
    byStatus,
    monthlyData: Object.keys(monthlyMap).sort().map((month) => ({ month, count: monthlyMap[month] })),
    activityCount: data.filter((item) => item.activities?.trim()).length,
    entries: data,
  };
}

export async function fetchRecentLogbooks(limit = 5, userId = null) {
  let query = supabase
    .from('logbook_entries')
    .select('*, profiles!logbook_entries_user_id_fkey(full_name)')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (userId) query = query.eq('user_id', userId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data.map(entryFromRow);
}
