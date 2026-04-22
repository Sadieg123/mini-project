// ── Element references ────────────────────────────────────────────────────────
// Grab the DOM elements we'll interact with throughout the app.
const input      = document.getElementById("habitInput");
const addBtn     = document.getElementById("addBtn");
const list       = document.getElementById("habitList");
const error      = document.getElementById("error");
const emptyState = document.getElementById("emptyState");

// ── Load saved habits from localStorage ───────────────────────────────────────
// localStorage stores data as strings, so we use JSON.parse() to convert it
// back into a JavaScript array. If nothing is saved yet, we default to [].
let habits = JSON.parse(localStorage.getItem("habits")) || [];

// ── Initial render ────────────────────────────────────────────────────────────
// When the page first loads, draw whatever habits are already saved.
renderHabits();

// ── Event listeners ───────────────────────────────────────────────────────────
// Add a habit when the button is clicked...
addBtn.addEventListener("click", addHabit);

// ...or when the user presses Enter inside the text field.
input.addEventListener("keydown", function (e) {
  if (e.key === "Enter") addHabit();
});


// ── addHabit ──────────────────────────────────────────────────────────────────
// Reads the input field, validates it, and adds a new habit object to the array.
function addHabit() {
  const text = input.value.trim(); // remove leading/trailing whitespace

  // Validation: don't allow empty habits
  if (!text) {
    error.textContent = "Please enter a habit.";
    input.focus();
    return;
  }

  // Build a new habit object.
  // Date.now() gives a unique millisecond timestamp — we use it as an ID
  // so we can find the right habit later when toggling or deleting.
  const newHabit = {
    id:        Date.now(),
    text:      text,
    completed: false
  };

  // unshift() adds to the *front* of the array so newest habits appear at top.
  habits.unshift(newHabit);

  // Clear the input field and any previous error message.
  input.value    = "";
  error.textContent = "";

  // Save the updated array and redraw the list.
  saveAndRender();
}


// ── toggleHabit ───────────────────────────────────────────────────────────────
// Flips the completed state of the habit with the given id.
function toggleHabit(id) {
  habits = habits.map(function (habit) {
    // If this is the right habit, return a copy with completed flipped.
    // Otherwise, return it unchanged.
    if (habit.id === id) {
      return { ...habit, completed: !habit.completed };
    }
    return habit;
  });

  saveAndRender();
}


// ── deleteHabit ───────────────────────────────────────────────────────────────
// Removes the habit with the given id from the array entirely.
function deleteHabit(id) {
  // filter() keeps only habits whose id does NOT match — everything else stays.
  habits = habits.filter(function (habit) {
    return habit.id !== id;
  });

  saveAndRender();
}


// ── saveAndRender ─────────────────────────────────────────────────────────────
// Every time the habits array changes, we:
//   1. Save it to localStorage (so it survives page refresh)
//   2. Re-draw the list to reflect the new state
function saveAndRender() {
  // JSON.stringify() converts the array to a string for localStorage.
  localStorage.setItem("habits", JSON.stringify(habits));
  renderHabits();
}


// ── renderHabits ──────────────────────────────────────────────────────────────
// Clears the <ul> and rebuilds it from the current habits array.
// Called on page load and after every change.
function renderHabits() {
  // Wipe the existing list so we can redraw from scratch.
  list.innerHTML = "";

  // Show "No habits yet" message only when the list is empty.
  emptyState.style.display = habits.length === 0 ? "block" : "none";

  // Loop through every habit and create a <li> for it.
  habits.forEach(function (habit) {
    const li = document.createElement("li");

    // Add the "completed" CSS class so the card gets the tinted background.
    if (habit.completed) {
      li.classList.add("completed");
    }

    // Build the inner HTML for the card:
    //   - A <label> wrapping a checkbox + the habit text (clicking either toggles it)
    //   - A delete button on the right
    // Note: inline onclick handlers reference the global functions below.
    li.innerHTML = `
      <label class="habit-label">
        <input
          type="checkbox"
          ${habit.completed ? "checked" : ""}
          onchange="toggleHabit(${habit.id})"
        />
        <span>${escapeHTML(habit.text)}</span>
      </label>

      <button
        class="btn-delete"
        onclick="deleteHabit(${habit.id})"
        aria-label="Delete habit"
        title="Delete"
      >✕</button>
    `;

    list.appendChild(li);
  });
}


// ── escapeHTML ────────────────────────────────────────────────────────────────
// Prevents XSS by converting special characters before inserting user text
// into innerHTML. For example, < becomes &lt; so it renders as text, not HTML.
function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}


// ── Expose functions to the global scope ──────────────────────────────────────
// The inline onclick="toggleHabit(...)" and onclick="deleteHabit(...)" in the
// HTML need these functions to be accessible on the window object.
window.toggleHabit = toggleHabit;
window.deleteHabit = deleteHabit;
