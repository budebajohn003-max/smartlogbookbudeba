import { getCurrentUser, logoutUser, getMyLogbooks, getPendingLogbooks, fetchLogbookStats } from './logbook_service.js';

const page = window.location.pathname.split('/').pop();

function normalizeRole(role) {
  return role ? String(role).trim().toLowerCase() : 'student';
}

const currentUser = await getCurrentUser();
if (!currentUser) {
  window.location.replace('index.html');
  throw new Error('Authentication is required to view this dashboard.');
}

const currentRole = normalizeRole(currentUser.role);
const expectedRole = page === 'student_dashboard.html' ? 'student' : page === 'supervisor_dashboard.html' ? 'supervisor' : null;
if (expectedRole && currentRole !== expectedRole) {
  window.location.replace(
    currentRole === 'admin'
      ? 'admin_dashboard.html'
      : currentRole === 'supervisor'
        ? 'supervisor_dashboard.html'
        : 'student_dashboard.html',
  );
  throw new Error('This dashboard is not available for the current role.');
}

document.querySelectorAll('#logoutBtn').forEach((button) => {
  button.addEventListener('click', async (event) => {
    event.preventDefault();
    await logoutUser();
    window.location.href = 'index.html';
  });
});

document.querySelectorAll('.user-name').forEach((el) => { el.textContent = currentUser.fullname; });
document.querySelectorAll('.avatar').forEach((avatar) => {
  avatar.textContent = currentUser.fullname.split(' ').map((word) => word[0]).join('').slice(0, 2).toUpperCase();
});

async function renderStudentDashboard() {
  const statsCards = document.querySelector('.stats-cards');
  const myLogbooks = await getMyLogbooks(currentUser.id);
  const approved = myLogbooks.filter((entry) => entry.status === 'Approved').length;
  const pending = myLogbooks.filter((entry) => entry.status === 'Pending').length;
  const activityPercent = myLogbooks.length ? Math.round((approved / myLogbooks.length) * 100) : 0;
  if (!statsCards) return;
  statsCards.innerHTML = `
    <div class="card"><i class="fa-solid fa-book-bookmark text-blue"></i><h3>${myLogbooks.length}</h3><p>Logbooks Zilizojazwa</p></div>
    <div class="card"><i class="fa-solid fa-check-double text-green"></i><h3>${approved}</h3><p>Imethibitishwa</p></div>
    <div class="card"><i class="fa-solid fa-clock text-orange"></i><h3>${activityPercent}%</h3><p>Mahudhurio</p></div>
    <div class="card"><i class="fa-solid fa-hourglass-half text-amber-500"></i><h3>${pending}</h3><p>Pending</p></div>`;
}

async function renderSupervisorDashboard() {
  const statsCards = document.querySelector('.grid');
  const [pendingEntries, stats] = await Promise.all([getPendingLogbooks(), fetchLogbookStats({})]);
  const activeStudents = new Set(stats.entries.map((entry) => entry.user_id)).size;
  const approved = stats.byStatus.Approved || 0;
  const complianceRate = stats.total ? Math.round((approved / stats.total) * 100) : 0;
  if (statsCards) {
    statsCards.innerHTML = `
      <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between"><div><p class="text-sm font-medium text-gray-500 uppercase tracking-wider">Pending Approvals</p><p class="text-3xl font-bold text-gray-900 mt-1">${pendingEntries.length}</p></div><div class="p-3 bg-amber-50 text-amber-500 rounded-lg"><i class="fa-solid fa-hourglass-half text-2xl"></i></div></div>
      <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between"><div><p class="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Logbooks</p><p class="text-3xl font-bold text-gray-900 mt-1">${stats.total}</p></div><div class="p-3 bg-indigo-50 text-indigo-500 rounded-lg"><i class="fa-solid fa-book-open text-2xl"></i></div></div>
      <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between"><div><p class="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Students</p><p class="text-3xl font-bold text-gray-900 mt-1">${activeStudents}</p></div><div class="p-3 bg-emerald-50 text-emerald-500 rounded-lg"><i class="fa-solid fa-graduation-cap text-2xl"></i></div></div>
      <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between"><div><p class="text-sm font-medium text-gray-500 uppercase tracking-wider">Approval Rate</p><p class="text-3xl font-bold text-gray-900 mt-1">${complianceRate}%</p></div><div class="p-3 bg-sky-50 text-sky-500 rounded-lg"><i class="fa-solid fa-square-check text-2xl"></i></div></div>`;
  }
  const table = document.querySelector('tbody.divide-y');
  if (table) {
    table.innerHTML = pendingEntries.slice(0, 5).map((entry) => `<tr class="hover:bg-gray-50/70 transition-colors"><td class="px-6 py-4 font-medium text-gray-900">${entry.studentName}</td><td class="px-6 py-4">${entry.date}</td><td class="px-6 py-4">—</td><td class="px-6 py-4"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">Pending Review</span></td><td class="px-6 py-4 text-right"><a href="review.html?id=${entry.id}" class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1.5 rounded-md font-medium">Review</a></td></tr>`).join('') || '<tr><td class="px-6 py-4" colspan="5">No pending logbooks.</td></tr>';
  }
}

try {
  if (page === 'student_dashboard.html') await renderStudentDashboard();
  if (page === 'supervisor_dashboard.html') await renderSupervisorDashboard();
} catch (error) {
  console.error('Unable to load dashboard data:', error);
}
