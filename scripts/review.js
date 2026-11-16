import { getCurrentUser, getLogbookById, reviewLogbook } from './logbook_service.js';

const user = await getCurrentUser();
const homeForUser = user?.role === 'admin' ? 'admin_dashboard.html' : 'supervisor_dashboard.html';
if (!user || !['supervisor', 'admin'].includes(user.role)) {
  window.location.replace(user ? 'student_dashboard.html' : 'index.html');
  throw new Error('Only supervisors and administrators can review logbooks.');
}
const id = new URLSearchParams(window.location.search).get('id');
if (!id) {
  window.location.replace(homeForUser);
  throw new Error('A logbook id is required for review.');
}

const setText = (selector, value) => { document.querySelector(selector).textContent = value || '—'; };
try {
  const entry = await getLogbookById(id);
  setText('#entry-student', entry.studentName);
  setText('#entry-date', new Date(`${entry.date}T00:00:00`).toLocaleDateString());
  setText('#entry-location', entry.location);
  setText('#entry-activities', entry.activities);
  setText('#entry-problem', entry.problem);
  setText('#entry-solution', entry.solution);
  document.getElementById('reviewer-comment').value = entry.reviewer_comment || '';
  if (entry.photo_url) {
    document.getElementById('entry-photo').innerHTML = `<a href="${entry.photo_url}" target="_blank" rel="noopener"><img src="${entry.photo_url}" alt="Logbook evidence" class="max-h-72 rounded-lg"></a>`;
  }
} catch (error) {
  alert(`Unable to load logbook: ${error.message}`);
  window.location.href = homeForUser;
}

async function submitReview(status) {
  const button = document.getElementById(status === 'Approved' ? 'approve-btn' : 'reject-btn');
  button.disabled = true;
  const { error } = await reviewLogbook({ id, status, comment: document.getElementById('reviewer-comment').value });
  if (error) {
    button.disabled = false;
    return alert(error);
  }
  alert(`Logbook ${status.toLowerCase()}.`);
  window.location.href = homeForUser;
}

document.getElementById('approve-btn').addEventListener('click', () => submitReview('Approved'));
document.getElementById('reject-btn').addEventListener('click', () => submitReview('Rejected'));
document.getElementById('back-btn').addEventListener('click', () => { window.location.href = homeForUser; });
