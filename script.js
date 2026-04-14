// Dark Mode Functionality
function initDarkMode() {
  const isDarkMode = localStorage.getItem('darkMode') === 'true';
  if (isDarkMode) document.documentElement.classList.add('dark-mode');
  updateDarkModeButton();
}

function toggleDarkMode() {
  document.documentElement.classList.toggle('dark-mode');
  const isDark = document.documentElement.classList.contains('dark-mode');
  localStorage.setItem('darkMode', isDark);
  updateDarkModeButton();
}

function updateDarkModeButton() {
  const btn = document.getElementById('dark-mode-btn');
  if (document.documentElement.classList.contains('dark-mode')) {
    btn.textContent = '☀️';
    btn.title = 'Désactiver le mode sombre';
  } else {
    btn.textContent = '🌙';
    btn.title = 'Activer le mode sombre';
  }
}

// Initialize dark mode on page load
document.addEventListener('DOMContentLoaded', () => {
  initDarkMode();
  const darkModeBtn = document.getElementById('dark-mode-btn');
  if (darkModeBtn) {
    darkModeBtn.addEventListener('click', toggleDarkMode);
  }
});

// Tab Switching
function switchTab(id, btn) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  const panel = document.getElementById('panel-' + id);
  if (panel) {
    panel.classList.add('active');
  }
  btn.classList.add('active');
}

// Export to PDF
function exportPDF() {
  const tabs = document.querySelector('.tabs');
  const btn = document.querySelector('.export-btn');
  const panels = document.querySelectorAll('.panel');
  
  if (tabs) tabs.style.display = 'none';
  if (btn) btn.style.display = 'none';
  panels.forEach(p => p.style.display = 'block');
  
  window.print();
  
  setTimeout(() => {
    if (tabs) tabs.style.display = '';
    if (btn) btn.style.display = '';
    panels.forEach(p => {
      p.style.display = '';
      p.classList.remove('active');
    });
    const notesPanel = document.getElementById('panel-notes');
    if (notesPanel) notesPanel.classList.add('active');
  }, 500);
}

// Set active nav link based on current page
document.addEventListener('DOMContentLoaded', () => {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
});
