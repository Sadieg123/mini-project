const input = document.getElementById("habitInput");
const addBtn = document.getElementById("addBtn");
const list = document.getElementById("habitList");
const error = document.getElementById("error");
const emptyState = document.getElementById("emptyState");

let habits = JSON.parse(localStorage.getItem("habits")) || [];

// render on load
renderHabits();

addBtn.addEventListener("click", addHabit);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addHabit();
});

function addHabit() {
  const text = input.value.trim();

  if (!text) {
    error.textContent = "Please enter a habit";
    return;
  }

  habits.unshift({
    id: Date.now(),
    text,
    completed: false
  });

  input.value = "";
  error.textContent = "";

  saveAndRender();
}

function toggleHabit(id) {
  habits = habits.map(h =>
    h.id === id ? { ...h, completed: !h.completed } : h
  );

  saveAndRender();
}

function deleteHabit(id) {
  habits = habits.filter(h => h.id !== id);
  saveAndRender();
}

function saveAndRender() {
  localStorage.setItem("habits", JSON.stringify(habits));
  renderHabits();
}

function renderHabits() {
  list.innerHTML = "";

  emptyState.style.display = habits.length ? "none" : "block";

  habits.forEach(habit => {
    const li = document.createElement("li");
    li.className = habit.completed ? "completed" : "";

    li.innerHTML = `
      <span onclick="toggleHabit(${habit.id})">${habit.text}</span>
      <button class="delete" onclick="deleteHabit(${habit.id})">✕</button>
    `;

    list.appendChild(li);
  });
}

window.toggleHabit = toggleHabit;
window.deleteHabit = deleteHabit;