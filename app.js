const STORAGE_KEY = "study01-todos";
const WEEKDAYS = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];

const monthLabel = document.getElementById("month-label");
const calendarDays = document.getElementById("calendar-days");
const selectedDateLabel = document.getElementById("selected-date-label");
const todayBadge = document.getElementById("today-badge");
const taskCount = document.getElementById("task-count");
const taskList = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");
const addForm = document.getElementById("add-form");
const taskInput = document.getElementById("task-input");

const today = startOfDay(new Date());
let viewYear = today.getFullYear();
let viewMonth = today.getMonth();
let selectedDate = today;
let todos = loadTodos();

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isSameDay(a, b) {
  return toKey(a) === toKey(b);
}

function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function todosFor(date) {
  const key = toKey(date);
  return todos.filter((item) => item.date === key);
}

function renderCalendar() {
  monthLabel.textContent = `${viewYear}년 ${viewMonth + 1}월`;
  calendarDays.innerHTML = "";

  const first = new Date(viewYear, viewMonth, 1);
  const startWeekday = first.getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();
  const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;

  for (let i = 0; i < totalCells; i += 1) {
    const dayNumber = i - startWeekday + 1;
    let cellDate;
    let other = false;

    if (dayNumber < 1) {
      cellDate = new Date(viewYear, viewMonth - 1, prevMonthDays + dayNumber);
      other = true;
    } else if (dayNumber > daysInMonth) {
      cellDate = new Date(viewYear, viewMonth + 1, dayNumber - daysInMonth);
      other = true;
    } else {
      cellDate = new Date(viewYear, viewMonth, dayNumber);
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = "day";
    button.textContent = String(cellDate.getDate());
    button.setAttribute(
      "aria-label",
      `${cellDate.getFullYear()}년 ${cellDate.getMonth() + 1}월 ${cellDate.getDate()}일`
    );

    if (other) button.classList.add("is-other");
    if (isSameDay(cellDate, today)) button.classList.add("is-today");
    if (isSameDay(cellDate, selectedDate)) {
      button.classList.add("is-selected");
      button.setAttribute("aria-current", "date");
    }

    if (todosFor(cellDate).length > 0) {
      const dot = document.createElement("span");
      dot.className = "dot";
      dot.setAttribute("aria-hidden", "true");
      button.appendChild(dot);
    }

    button.addEventListener("click", () => {
      selectedDate = startOfDay(cellDate);
      viewYear = selectedDate.getFullYear();
      viewMonth = selectedDate.getMonth();
      render();
    });

    calendarDays.appendChild(button);
  }
}

function renderDay() {
  const weekday = WEEKDAYS[selectedDate.getDay()];
  selectedDateLabel.textContent = `${selectedDate.getFullYear()}년 ${
    selectedDate.getMonth() + 1
  }월 ${selectedDate.getDate()}일 ${weekday}`;
  todayBadge.hidden = !isSameDay(selectedDate, today);

  const items = todosFor(selectedDate);
  const remaining = items.filter((item) => !item.done).length;
  taskCount.textContent =
    items.length === 0
      ? "등록된 할 일 없음"
      : `할 일 ${items.length}개 · 남은 일 ${remaining}개`;

  taskList.innerHTML = "";
  emptyState.classList.toggle("is-hidden", items.length > 0);

  items.forEach((item) => {
    const li = document.createElement("li");
    li.className = `task${item.done ? " is-done" : ""}`;

    const check = document.createElement("button");
    check.type = "button";
    check.className = "check";
    check.setAttribute("aria-pressed", String(item.done));
    check.setAttribute("aria-label", item.done ? "완료 해제" : "완료 표시");
    check.addEventListener("click", () => toggleDone(item.id));

    const title = document.createElement("span");
    title.className = "task-title";
    title.textContent = item.title;

    const del = document.createElement("button");
    del.type = "button";
    del.className = "delete-btn";
    del.textContent = "삭제";
    del.setAttribute("aria-label", `${item.title} 삭제`);
    del.addEventListener("click", () => deleteTodo(item.id));

    li.append(check, title, del);
    taskList.appendChild(li);
  });
}

function render() {
  renderCalendar();
  renderDay();
}

function addTodo(title) {
  todos.push({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    date: toKey(selectedDate),
    title,
    done: false,
  });
  saveTodos();
  render();
}

function toggleDone(id) {
  todos = todos.map((item) =>
    item.id === id ? { ...item, done: !item.done } : item
  );
  saveTodos();
  render();
}

function deleteTodo(id) {
  todos = todos.filter((item) => item.id !== id);
  saveTodos();
  render();
}

document.getElementById("prev-month").addEventListener("click", () => {
  viewMonth -= 1;
  if (viewMonth < 0) {
    viewMonth = 11;
    viewYear -= 1;
  }
  renderCalendar();
});

document.getElementById("next-month").addEventListener("click", () => {
  viewMonth += 1;
  if (viewMonth > 11) {
    viewMonth = 0;
    viewYear += 1;
  }
  renderCalendar();
});

addForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = taskInput.value.trim();
  if (!title) return;
  addTodo(title);
  taskInput.value = "";
  taskInput.focus();
});

render();
