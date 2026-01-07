document.addEventListener('DOMContentLoaded', () => {
  const state = {
    habits: JSON.parse(localStorage.getItem('habits')) || [
      { name: 'WATER', color: '#9bbc0f', history: {} }
    ],
    currentIndex: 0,
    view: 'main' // 'main', 'graph', 'add'
  };

  const elements = {
    screen: document.querySelector('.screen'),
    mainView: document.getElementById('main-view'),
    graphView: document.getElementById('graph-view'),
    addView: document.getElementById('add-view'),
    habitTitle: document.getElementById('habit-title'),
    penguin: document.getElementById('ascii-penguin'),
    statusText: document.getElementById('status-text'),
    grid: document.getElementById('grid'),
    newName: document.getElementById('new-habit-name'),
    newColor: document.getElementById('new-habit-color')
  };

  const penguins = {
    happy: `
    (o_
    //\\
    V_/_`,
    sad: `
    (x_
    //\\
    V_/_`
  };

  function save() {
    localStorage.setItem('habits', JSON.stringify(state.habits));
  }

  function getTodayKey() {
    return new Date().toISOString().split('T')[0];
  }

  function updateUI() {
    const habit = state.habits[state.currentIndex];
    
    // Views
    elements.mainView.classList.toggle('hidden', state.view !== 'main');
    elements.graphView.classList.toggle('hidden', state.view !== 'graph');
    elements.addView.classList.toggle('hidden', state.view !== 'add');

    if (state.view === 'main' && habit) {
      elements.habitTitle.textContent = habit.name;
      elements.screen.style.backgroundColor = habit.color;
      const done = habit.history[getTodayKey()];
      elements.penguin.textContent = done ? penguins.happy : penguins.sad;
      elements.statusText.textContent = done ? 'COMPLETED!' : 'NOT DONE';
    }

    if (state.view === 'graph') {
      renderGraph();
    }
  }

  function renderGraph() {
    elements.grid.innerHTML = '';
    const habit = state.habits[state.currentIndex];
    const today = new Date();
    // Show last 182 days (26 weeks)
    for (let i = 181; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const key = date.toISOString().split('T')[0];
      const cell = document.createElement('div');
      cell.className = 'cell' + (habit.history[key] ? ' level-1' : '');
      elements.grid.appendChild(cell);
    }
  }

  // Controls
  document.getElementById('btn-next').onclick = () => {
    state.currentIndex = (state.currentIndex + 1) % state.habits.length;
    updateUI();
  };

  document.getElementById('btn-prev').onclick = () => {
    state.currentIndex = (state.currentIndex - 1 + state.habits.length) % state.habits.length;
    updateUI();
  };

  document.getElementById('btn-check').onclick = () => {
    if (state.view === 'main') {
      state.habits[state.currentIndex].history[getTodayKey()] = true;
      save();
      updateUI();
    }
  };

  document.getElementById('btn-x').onclick = () => {
    if (state.view === 'main') {
      delete state.habits[state.currentIndex].history[getTodayKey()];
      save();
      updateUI();
    }
  };

  document.getElementById('btn-plus').onclick = () => {
    state.view = state.view === 'add' ? 'main' : 'add';
    updateUI();
  };

  document.getElementById('btn-minus').onclick = () => {
    state.view = state.view === 'graph' ? 'main' : 'graph';
    updateUI();
  };

  // Keyboard/Start simulation for Add
  window.onkeydown = (e) => {
    if (e.key === 'Enter' && state.view === 'add') {
      const name = elements.newName.value.trim().toUpperCase();
      if (name) {
        state.habits.push({ name, color: elements.newColor.value, history: {} });
        state.currentIndex = state.habits.length - 1;
        state.view = 'main';
        elements.newName.value = '';
        save();
        updateUI();
      }
    }
  };

  updateUI();
});
