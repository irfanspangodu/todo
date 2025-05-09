let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
const taskList = document.getElementById("taskList");

document.getElementById("addTaskBtn").addEventListener("click", addTask);
document.getElementById("searchBox").addEventListener("input", renderTasks);

function addTask() {
    const input = document.getElementById("taskInput");
    const dueDate = document.getElementById("dueDate").value;
    const priority = document.getElementById("priority").value;
    if (!input.value.trim()) return;

    tasks.push({
        id: Date.now(),
        text: input.value.trim(),
        completed: false,
        dueDate,
        priority,
        updated: new Date().toLocaleString()
    });

    input.value = "";
    saveTasks();
}

function toggleComplete(id) {
    const task = tasks.find(t => t.id === id);
    task.completed = !task.completed;
    task.updated = new Date().toLocaleString();
    saveTasks();
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
}

function editTask(id) {
    const task = tasks.find(t => t.id === id);
    const newText = prompt("Edit task:", task.text);
    if (newText) {
        task.text = newText;
        task.updated = new Date().toLocaleString();
        saveTasks();
    }
}

function filterTasks(filter) {
    renderTasks(filter);
}

function clearCompleted() {
    tasks = tasks.filter(t => !t.completed);
    saveTasks();
}

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderTasks();
}

function renderTasks(filter = "all") {
    const list = taskList;
    list.innerHTML = "";

    let filtered = tasks.filter(t => {
        const search = document.getElementById("searchBox").value.toLowerCase();
        const match = t.text.toLowerCase().includes(search);
        if (filter === "active") return !t.completed && match;
        if (filter === "completed") return t.completed && match;
        return match;
    });

    filtered.forEach(task => {
        const li = document.createElement("li");
        li.className = `list-group-item d-flex justify-content-between align-items-center ${task.priority}`;
        if (task.completed) li.classList.add("completed");

        li.innerHTML = `
      <div>
        <input type="checkbox" ${task.completed ? "checked" : ""} onclick="toggleComplete(${task.id})" />
        <strong>${task.text}</strong>
        <div class="small">Due: ${task.dueDate || "None"} | Last updated: ${task.updated}</div>
      </div>
      <div>
        <button class="btn btn-sm btn-outline-secondary" onclick="editTask(${task.id})">Edit</button>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteTask(${task.id})">Delete</button>
      </div>
    `;
        list.appendChild(li);
    });

    document.getElementById("taskStats").textContent = `${filtered.length} tasks shown`;
}

function toggleTheme() {
    document.body.classList.toggle("dark-mode");
}

function exportTasks() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", "tasks.json");
    document.body.appendChild(link);
    link.click();
    link.remove();
}

function importTasks() {
    const file = document.getElementById("importFile").files[0];
    const reader = new FileReader();
    reader.onload = e => {
        try {
            tasks = JSON.parse(e.target.result);
            saveTasks();
        } catch {
            alert("Invalid file");
        }
    };
    reader.readAsText(file);
}

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js");
}

renderTasks();