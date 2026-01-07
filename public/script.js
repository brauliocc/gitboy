document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('grid');
  const totalContributions = document.getElementById('total-contributions');
  const currentStreak = document.getElementById('current-streak');
  const btnAdd = document.getElementById('btn-add');
  const btnReset = document.getElementById('btn-reset');

  const STORAGE_KEY = 'gitboy-contributions';
  const TOTAL_DAYS = 364;

  let contributions = loadContributions();

  function loadContributions() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return Array(TOTAL_DAYS).fill(0);
  }

  function saveContributions() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contributions));
  }

  function getLevel(count) {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 4) return 2;
    if (count <= 6) return 3;
    return 4;
  }

  function createGrid() {
    grid.innerHTML = '';
    for (let i = 0; i < TOTAL_DAYS; i++) {
      const cell = document.createElement('div');
      cell.className = `cell level-${getLevel(contributions[i])}`;
      cell.dataset.index = i;
      cell.title = `Day ${i + 1}: ${contributions[i]} contributions`;
      
      cell.addEventListener('click', () => {
        contributions[i]++;
        updateCell(cell, i);
        saveContributions();
        updateStats();
      });
      
      grid.appendChild(cell);
    }
  }

  function updateCell(cell, index) {
    cell.className = `cell level-${getLevel(contributions[index])}`;
    cell.title = `Day ${index + 1}: ${contributions[index]} contributions`;
  }

  function updateStats() {
    const total = contributions.reduce((sum, count) => sum + count, 0);
    totalContributions.textContent = total;

    let streak = 0;
    for (let i = contributions.length - 1; i >= 0; i--) {
      if (contributions[i] > 0) {
        streak++;
      } else {
        break;
      }
    }
    currentStreak.textContent = streak;
  }

  function getTodayIndex() {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((now - startOfYear) / (1000 * 60 * 60 * 24));
    return Math.min(dayOfYear, TOTAL_DAYS - 1);
  }

  btnAdd.addEventListener('click', () => {
    const todayIndex = getTodayIndex();
    contributions[todayIndex]++;
    const cells = grid.querySelectorAll('.cell');
    if (cells[todayIndex]) {
      updateCell(cells[todayIndex], todayIndex);
      cells[todayIndex].style.transform = 'scale(1.5)';
      setTimeout(() => {
        cells[todayIndex].style.transform = '';
      }, 200);
    }
    saveContributions();
    updateStats();
  });

  btnReset.addEventListener('click', () => {
    if (confirm('Reset all contributions?')) {
      contributions = Array(TOTAL_DAYS).fill(0);
      saveContributions();
      createGrid();
      updateStats();
    }
  });

  createGrid();
  updateStats();
});
