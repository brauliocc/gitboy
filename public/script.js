document.addEventListener("DOMContentLoaded", () => {
  const state = {
    // Starts with an empty list to trigger the black start screen
    habits: JSON.parse(localStorage.getItem("habits")) || [],
    currentIndex: 0,
    view: "main",
    selectedDateIndex: null, // Index for graph navigation
  };

  const elements = {
    screen: document.getElementById("main-screen"),
    mainView: document.getElementById("main-view"),
    graphView: document.getElementById("graph-view"),
    addView: document.getElementById("add-view"),
    habitTitle: document.getElementById("habit-title"),
    penguin: document.getElementById("ascii-penguin"),
    emptyState: document.getElementById("empty-state"),
    statusText: document.getElementById("status-text"),
    prevPreview: document.getElementById("prev-preview"),
    nextPreview: document.getElementById("next-preview"),
    grid: document.getElementById("grid"),
    newName: document.getElementById("new-habit-name"),
    newColor: document.getElementById("new-habit-color"),
    submitBtn: document.getElementById("btn-submit-habit"),
    deleteBtn: document.getElementById("btn-delete"),
  };

  const penguins = {
    happy: ` (o_\n //\\\n V_/_`,
    sad: ` (x_\n //\\\n V_/_`,
  };

  const save = () =>
    localStorage.setItem("habits", JSON.stringify(state.habits));
  const getTodayKey = () => new Date().toISOString().split("T")[0];

  function updateUI() {
    const hasHabits = state.habits.length > 0;
    const habit = state.habits[state.currentIndex];

    // Toggle black empty state
    elements.screen.classList.toggle(
      "is-empty",
      !hasHabits && state.view === "main",
    );
    elements.mainView.classList.toggle("hidden", state.view !== "main");
    elements.graphView.classList.toggle("hidden", state.view !== "graph");
    elements.addView.classList.toggle("hidden", state.view !== "add");

    if (state.view === "main") {
      if (!hasHabits) {
        elements.emptyState.classList.remove("hidden");
        elements.penguin.textContent = "";
        elements.habitTitle.textContent = "";
        elements.statusText.classList.add("hidden");
        elements.prevPreview.textContent = "";
        elements.nextPreview.textContent = "";
      } else {
        elements.emptyState.classList.add("hidden");
        elements.statusText.classList.remove("hidden");

        elements.habitTitle.textContent = habit.name;
        elements.habitTitle.style.color = habit.color;
        elements.penguin.style.color = habit.color;

        const done = habit.history[getTodayKey()];
        elements.penguin.textContent = done ? penguins.happy : penguins.sad;
        elements.statusText.textContent = done ? "COMPLETED!" : "NOT DONE";
        elements.statusText.style.color = habit.color;
        elements.statusText.style.borderColor = habit.color;

        // Color-coded nav previews
        const prevIdx =
          (state.currentIndex - 1 + state.habits.length) % state.habits.length;
        const nextIdx = (state.currentIndex + 1) % state.habits.length;

        if (state.habits.length > 1) {
          elements.prevPreview.textContent = `< ${state.habits[prevIdx].name}`;
          elements.prevPreview.style.color = state.habits[prevIdx].color;
          elements.nextPreview.textContent = `${state.habits[nextIdx].name} >`;
          elements.nextPreview.style.color = state.habits[nextIdx].color;
        } else {
          elements.prevPreview.textContent = "";
          elements.nextPreview.textContent = "";
        }
      }
    }
    if (state.view === "graph") renderGraph();
  }

  function renderGraph() {
    elements.grid.innerHTML = "";
    const habit = state.habits[state.currentIndex];
    if (!habit) return;

    // Fixed 182-day grid (26 weeks) to fit screen better
    const totalDays = 182;
    const today = new Date();
    
    if (state.selectedDateIndex === null) {
      state.selectedDateIndex = totalDays - 1; // Default to today
    }

    for (let i = 0; i < totalDays; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - (totalDays - 1 - i));
      const key = date.toISOString().split("T")[0];
      
      const cell = document.createElement("div");
      cell.className = "cell";
      
      if (habit.history[key]) {
        cell.style.backgroundColor = habit.color;
      }

      if (i === state.selectedDateIndex) {
        cell.classList.add("selected");
        cell.textContent = "X";
        cell.style.color = "#000";
        cell.style.fontSize = "6px";
        cell.style.display = "flex";
        cell.style.alignItems = "center";
        cell.style.justifyContent = "center";
      }

      elements.grid.appendChild(cell);
    }
  }

  elements.submitBtn.onclick = () => {
    const name = elements.newName.value.trim().toUpperCase();
    if (name) {
      state.habits.push({ name, color: elements.newColor.value, history: {} });
      state.currentIndex = state.habits.length - 1;
      state.view = "main";
      elements.newName.value = "";
      save();
      updateUI();
    }
  };

  elements.deleteBtn.onclick = () => {
    if (state.habits.length === 0) return;
    if (confirm(`DELETE "${state.habits[state.currentIndex].name}"?`)) {
      state.habits.splice(state.currentIndex, 1);
      state.currentIndex = 0;
      save();
      updateUI();
    }
  };

  document.getElementById("btn-next").onclick = () => {
    if (state.view === "graph") {
      state.selectedDateIndex = Math.min(181, state.selectedDateIndex + 1);
      renderGraph();
    } else if (state.habits.length) {
      state.currentIndex = (state.currentIndex + 1) % state.habits.length;
      updateUI();
    }
  };

  document.getElementById("btn-prev").onclick = () => {
    if (state.view === "graph") {
      state.selectedDateIndex = Math.max(0, state.selectedDateIndex - 1);
      renderGraph();
    } else if (state.habits.length) {
      state.currentIndex =
        (state.currentIndex - 1 + state.habits.length) % state.habits.length;
      updateUI();
    }
  };

  document.getElementById("btn-up").onclick = () => {
    if (state.view === "graph") {
      state.selectedDateIndex = Math.max(0, state.selectedDateIndex - 7);
      renderGraph();
    }
  };

  document.getElementById("btn-down").onclick = () => {
    if (state.view === "graph") {
      state.selectedDateIndex = Math.min(181, state.selectedDateIndex + 7);
      renderGraph();
    }
  };

  document.getElementById("btn-check").onclick = () => {
    if (state.view === "main" && state.habits.length) {
      state.habits[state.currentIndex].history[getTodayKey()] = true;
      save();
      updateUI();
    }
  };

  document.getElementById("btn-x").onclick = () => {
    if (state.view === "main" && state.habits.length) {
      delete state.habits[state.currentIndex].history[getTodayKey()];
      save();
      updateUI();
    }
  };

  document.getElementById("btn-plus").onclick = () => {
    state.view = state.view === "add" ? "main" : "add";
    updateUI();
  };

  document.getElementById("btn-minus").onclick = () => {
    state.view = state.view === "graph" ? "main" : "graph";
    updateUI();
  };

  updateUI();
});
