import { fetchLogbookStats, getCurrentUser } from './logbook_service.js';

const currentUser = await getCurrentUser();
if (!currentUser) {
  window.location.replace('index.html');
  throw new Error('Authentication is required to view reports.');
}

// A student report must always be limited to that student's entries. Staff
// receive the entries permitted by the database RLS policies.
const reportUserId = currentUser.role === 'student' ? currentUser.id : null;

const form = document.getElementById('reportForm');
const resultsBox = document.getElementById('resultsPlaceholder');
const totalsBox = document.createElement('div');
totalsBox.className = 'report-totals';
resultsBox.parentNode.insertBefore(totalsBox, resultsBox);

function renderStats(stats, reportType) {
  const statusRows = Object.entries(stats.byStatus)
    .map(([status, count]) => `<div class="stat-row"><span>${status}</span><strong>${count}</strong></div>`)
    .join('');

  const monthlyRows = stats.monthlyData
    .map(item => `<div class="stat-row"><span>${item.month}</span><strong>${item.count}</strong></div>`)
    .join('');

  resultsBox.innerHTML = `
    <div class="results-grid">
      <div class="result-card">
        <h3>Report Type</h3>
        <p>${reportType}</p>
      </div>
      <div class="result-card">
        <h3>Total Entries</h3>
        <p>${stats.total}</p>
      </div>
      <div class="result-card">
        <h3>Entries with Activities</h3>
        <p>${stats.activityCount}</p>
      </div>
    </div>
    <div class="report-section">
      <h4>Status Breakdown</h4>
      <div class="report-stats">${statusRows}</div>
    </div>
    <div class="report-section">
      <h4>Monthly Entries</h4>
      <div class="report-stats">${monthlyRows}</div>
    </div>
  `;
}

form.addEventListener('submit', async function(e) {
  e.preventDefault();

  const fromDate = document.getElementById('fromDate').value;
  const toDate = document.getElementById('toDate').value;
  const reportType = document.getElementById('reportType').value;

  resultsBox.style.fontStyle = 'normal';
  resultsBox.style.color = '#333';
  resultsBox.innerHTML = `<strong>Loading ${reportType} data ...</strong>`;

  try {
    const stats = await fetchLogbookStats({ fromDate, toDate, userId: reportUserId });
    renderStats(stats, reportType);
  } catch (error) {
    console.error('Error fetching report data:', error);
    resultsBox.innerHTML = '<strong>Unable to load report data. Check console for details.</strong>';
  }
});
