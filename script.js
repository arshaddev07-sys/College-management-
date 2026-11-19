// --- DEFAULT SEED DATA ---
const DEFAULT_STUDENTS = [
  { id: "s1", roll: "BCA-2026-01", name: "Arshad", course: "BCA", sem: "6", email: "arshad@ignou.ac.in" },
  { id: "s2", roll: "BCA-2026-02", name: "Rohan Sharma", course: "BCA", sem: "6", email: "rohan.s@college.edu" },
  { id: "s3", roll: "BT-2026-14", name: "Ananya Verma", course: "B.Tech", sem: "4", email: "ananya.v@college.edu" },
  { id: "s4", roll: "BCA-2026-08", name: "Priya Singh", course: "BCA", sem: "2", email: "priya.singh@college.edu" },
  { id: "s5", roll: "BT-2026-22", name: "Kabir Khan", course: "B.Tech", sem: "6", email: "kabir.k@college.edu" }
];

const DEFAULT_TIMETABLE = [
  { id: "t1", day: "Monday", time: "10:00 AM - 11:00 AM", subject: "Web Technologies", room: "Lab 2" },
  { id: "t2", day: "Wednesday", time: "11:30 AM - 12:30 PM", subject: "Software Engineering", room: "Room 104" },
  { id: "t3", day: "Friday", time: "02:00 PM - 03:30 PM", subject: "DBMS & SQL", room: "Lab 1" }
];

const DEFAULT_TASKS = [
  { id: "k1", title: "Complete BCA 6th Sem Project Documentation", priority: "High", due: getTodayISO(), completed: false },
  { id: "k2", title: "Practice JavaScript DOM & LocalStorage CRUD", priority: "Medium", due: getTodayISO(), completed: true }
];

// --- HELPER FUNCTIONS ---
function getTodayISO() {
  return new Date().toISOString().split("T")[0];
}

function getStore(key, fallback) {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : fallback;
}

function setStore(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// --- APPLICATION STATE ---
let currentUser = getStore("sms_current_user", null);
let users = getStore("sms_users", [
  { name: "Arshad", email: "arshad@student.edu", password: "123", course: "BCA 6th Semester" }
]);
let students = getStore("sms_students", DEFAULT_STUDENTS);
let attendance = getStore("sms_attendance", {}); // Format: { "2026-11-18": { "s1": "Present" } }
let timetable = getStore("sms_timetable", DEFAULT_TIMETABLE);
let tasks = getStore("sms_tasks", DEFAULT_TASKS);

// Ensure initial attendance has a sample record for today
if (!attendance[getTodayISO()]) {
  attendance[getTodayISO()] = { s1: "Present", s2: "Present", s3: "Absent", s4: "Present", s5: "Present" };
  setStore("sms_attendance", attendance);
}

// --- DOM REFERENCES ---
const authContainer = document.getElementById("auth-container");
const appContainer = document.getElementById("app-container");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

// --- AUTHENTICATION LOGIC ---
document.getElementById("show-register").addEventListener("click", () => {
  loginForm.classList.add("hidden");
  registerForm.classList.remove("hidden");
});

document.getElementById("show-login").addEventListener("click", () => {
  registerForm.classList.add("hidden");
  loginForm.classList.remove("hidden");
});

document.getElementById("demo-login-btn").addEventListener("click", () => {
  currentUser = users[0];
  setStore("sms_current_user", currentUser);
  initApp();
});

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  const found = users.find((u) => u.email === email && u.password === password);
  if (!found) {
    alert("Invalid credentials! Try Demo Login or register a new account.");
    return;
  }
  currentUser = found;
  setStore("sms_current_user", currentUser);
  initApp();
});

registerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("reg-name").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const course = document.getElementById("reg-course").value.trim();
  const password = document.getElementById("reg-password").value;

  if (users.some((u) => u.email === email)) {
    alert("Email already registered!");
    return;
  }

  const newUser = { name, email, course, password };
  users.push(newUser);
  setStore("sms_users", users);
  currentUser = newUser;
  setStore("sms_current_user", currentUser);
  initApp();
});

document.getElementById("logout-btn").addEventListener("click", () => {
  localStorage.removeItem("sms_current_user");
  currentUser = null;
  appContainer.classList.add("hidden");
  authContainer.classList.remove("hidden");
});

// --- NAVIGATION ---
document.querySelectorAll(".nav-item").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-section").forEach((sec) => sec.classList.add("hidden"));

    btn.classList.add("active");
    document.getElementById(`tab-${btn.dataset.tab}`).classList.remove("hidden");
    renderAll();
  });
});

// --- ATTENDANCE CALCULATIONS ---
function getStudentAttendancePct(studentId) {
  const dates = Object.keys(attendance);
  let totalMarked = 0;
  let presentCount = 0;

  dates.forEach((date) => {
    const status = attendance[date][studentId];
    if (status === "Present" || status === "Absent") {
      totalMarked++;
      if (status === "Present") presentCount++;
    }
  });

  return totalMarked === 0 ? 100 : Math.round((presentCount / totalMarked) * 100);
}

function getOverallAttendancePct() {
  if (students.length === 0) return 0;
  const sum = students.reduce((acc, s) => acc + getStudentAttendancePct(s.id), 0);
  return Math.round(sum / students.length);
}

// --- RENDER DASHBOARD ---
function renderDashboard() {
  document.getElementById("welcome-heading").textContent = `Welcome, ${currentUser.name}!`;
  document.getElementById("user-badge-name").textContent = currentUser.name;
  document.getElementById("current-date-display").textContent = new Date().toDateString();

  document.getElementById("stat-total-students").textContent = students.length;
  document.getElementById("stat-attendance-pct").textContent = `${getOverallAttendancePct()}%`;
  document.getElementById("stat-pending-tasks").textContent = tasks.filter((t) => !t.completed).length;

  const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todayClasses = timetable.filter((t) => t.day === todayName);
  document.getElementById("stat-today-classes").textContent = todayClasses.length;

  const scheduleList = document.getElementById("dashboard-schedule-list");
  scheduleList.innerHTML = todayClasses.length
    ? todayClasses.map((c) => `<li><strong>${c.subject}</strong><span>${c.time} (${c.room})</span></li>`).join("")
    : `<li>No classes scheduled for ${todayName}.</li>`;

  const taskList = document.getElementById("dashboard-task-list");
  const pending = tasks.filter((t) => !t.completed).slice(0, 4);
  taskList.innerHTML = pending.length
    ? pending.map((t) => `<li><span>${t.title}</span><span class="badge badge-${t.priority.toLowerCase()}">${t.priority}</span></li>`).join("")
    : `<li>All study tasks completed!</li>`;
}

// --- STUDENTS CRUD ---
function renderStudents() {
  const search = document.getElementById("student-search").value.toLowerCase();
  const courseFilter = document.getElementById("filter-course").value;
  const semFilter = document.getElementById("filter-sem").value;

  const filtered = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search) ||
      s.roll.toLowerCase().includes(search) ||
      s.email.toLowerCase().includes(search);
    const matchesCourse = courseFilter === "ALL" || s.course === courseFilter;
    const matchesSem = semFilter === "ALL" || s.sem === semFilter;
    return matchesSearch && matchesCourse && matchesSem;
  });

  const tbody = document.getElementById("students-table-body");
  tbody.innerHTML = filtered
    .map(
      (s) => `
      <tr>
        <td><strong>${s.roll}</strong></td>
        <td>${s.name}</td>
        <td>${s.course}</td>
        <td>Sem ${s.sem}</td>
        <td>${s.email}</td>
        <td><strong>${getStudentAttendancePct(s.id)}%</strong></td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="editStudent('${s.id}')">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteStudent('${s.id}')">Delete</button>
        </td>
      </tr>
    `
    )
    .join("");
}

document.getElementById("student-search").addEventListener("input", renderStudents);
document.getElementById("filter-course").addEventListener("change", renderStudents);
document.getElementById("filter-sem").addEventListener("change", renderStudents);

const studentModal = document.getElementById("student-modal");
const studentForm = document.getElementById("student-form");

document.getElementById("open-student-modal").addEventListener("click", () => {
  studentForm.reset();
  document.getElementById("edit-student-id").value = "";
  document.getElementById("modal-title").textContent = "Add New Student";
  studentModal.classList.remove("hidden");
});

function closeModal() {
  studentModal.classList.add("hidden");
}

document.getElementById("close-student-modal").addEventListener("click", closeModal);
document.getElementById("cancel-student-modal").addEventListener("click", closeModal);

studentForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const id = document.getElementById("edit-student-id").value;
  const studentData = {
    id: id || "s_" + Date.now(),
    roll: document.getElementById("stu-roll").value.trim(),
    name: document.getElementById("stu-name").value.trim(),
    course: document.getElementById("stu-course").value,
    sem: document.getElementById("stu-sem").value,
    email: document.getElementById("stu-email").value.trim()
  };

  if (id) {
    students = students.map((s) => (s.id === id ? studentData : s));
  } else {
    students.push(studentData);
  }

  setStore("sms_students", students);
  closeModal();
  renderAll();
});

window.editStudent = function (id) {
  const stu = students.find((s) => s.id === id);
  if (!stu) return;
  document.getElementById("edit-student-id").value = stu.id;
  document.getElementById("stu-roll").value = stu.roll;
  document.getElementById("stu-name").value = stu.name;
  document.getElementById("stu-course").value = stu.course;
  document.getElementById("stu-sem").value = stu.sem;
  document.getElementById("stu-email").value = stu.email;
  document.getElementById("modal-title").textContent = "Edit Student";
  studentModal.classList.remove("hidden");
};

window.deleteStudent = function (id) {
  if (!confirm("Delete this student record?")) return;
  students = students.filter((s) => s.id !== id);
  setStore("sms_students", students);
  renderAll();
};

// --- ATTENDANCE TRACKER ---
const attendanceDateInput = document.getElementById("attendance-date");
attendanceDateInput.value = getTodayISO();

attendanceDateInput.addEventListener("change", renderAttendance);

function renderAttendance() {
  const selectedDate = attendanceDateInput.value || getTodayISO();
  const dayRecord = attendance[selectedDate] || {};
  const tbody = document.getElementById("attendance-table-body");

  tbody.innerHTML = students
    .map((s) => {
      const status = dayRecord[s.id] || "Not Marked";
      return `
        <tr>
          <td>${s.roll}</td>
          <td>${s.name}</td>
          <td>${s.course} (Sem ${s.sem})</td>
          <td><strong>${getStudentAttendancePct(s.id)}%</strong></td>
          <td>
            <button class="btn btn-sm ${status === "Present" ? "btn-success" : "btn-secondary"}"
              onclick="markAttendance('${s.id}', 'Present')">Present</button>
            <button class="btn btn-sm ${status === "Absent" ? "btn-danger" : "btn-secondary"}"
              onclick="markAttendance('${s.id}', 'Absent')">Absent</button>
          </td>
        </tr>
      `;
    })
    .join("");
}

window.markAttendance = function (studentId, status) {
  const selectedDate = attendanceDateInput.value || getTodayISO();
  if (!attendance[selectedDate]) attendance[selectedDate] = {};
  attendance[selectedDate][studentId] = status;
  setStore("sms_attendance", attendance);
  renderAll();
};

document.getElementById("mark-all-present").addEventListener("click", () => {
  const selectedDate = attendanceDateInput.value || getTodayISO();
  if (!attendance[selectedDate]) attendance[selectedDate] = {};
  students.forEach((s) => (attendance[selectedDate][s.id] = "Present"));
  setStore("sms_attendance", attendance);
  renderAll();
});

document.getElementById("mark-all-absent").addEventListener("click", () => {
  const selectedDate = attendanceDateInput.value || getTodayISO();
  if (!attendance[selectedDate]) attendance[selectedDate] = {};
  students.forEach((s) => (attendance[selectedDate][s.id] = "Absent"));
  setStore("sms_attendance", attendance);
  renderAll();
});

// --- TIMETABLE ---
document.getElementById("timetable-form").addEventListener("submit", (e) => {
  e.preventDefault();
  timetable.push({
    id: "t_" + Date.now(),
    day: document.getElementById("tt-day").value,
    time: document.getElementById("tt-time").value.trim(),
    subject: document.getElementById("tt-subject").value.trim(),
    room: document.getElementById("tt-room").value.trim()
  });
  setStore("sms_timetable", timetable);
  e.target.reset();
  renderAll();
});

function renderTimetable() {
  const tbody = document.getElementById("timetable-table-body");
  tbody.innerHTML = timetable
    .map(
      (t) => `
      <tr>
        <td><strong>${t.day}</strong></td>
        <td>${t.time}</td>
        <td>${t.subject}</td>
        <td>${t.room}</td>
        <td><button class="btn btn-danger btn-sm" onclick="deleteTimetable('${t.id}')">Remove</button></td>
      </tr>
    `
    )
    .join("");
}

window.deleteTimetable = function (id) {
  timetable = timetable.filter((t) => t.id !== id);
  setStore("sms_timetable", timetable);
  renderAll();
};

// --- STUDY TASKS ---
document.getElementById("task-form").addEventListener("submit", (e) => {
  e.preventDefault();
  tasks.push({
    id: "k_" + Date.now(),
    title: document.getElementById("task-title").value.trim(),
    priority: document.getElementById("task-priority").value,
    due: document.getElementById("task-due").value,
    completed: false
  });
  setStore("sms_tasks", tasks);
  e.target.reset();
  renderAll();
});

function renderTasks() {
  const list = document.getElementById("tasks-full-list");
  list.innerHTML = tasks
    .map(
      (t) => `
      <li>
        <div>
          <input type="checkbox" style="width:auto; margin-right:8px;" ${t.completed ? "checked" : ""}
            onchange="toggleTask('${t.id}')" />
          <span class="${t.completed ? "task-done" : ""}">${t.title}</span>
          <small style="color:var(--muted); margin-left:8px;">(Due: ${t.due})</small>
        </div>
        <div>
          <span class="badge badge-${t.priority.toLowerCase()}">${t.priority}</span>
          <button class="btn btn-danger btn-sm" style="margin-left:8px;" onclick="deleteTask('${t.id}')">Delete</button>
        </div>
      </li>
    `
    )
    .join("");
}

window.toggleTask = function (id) {
  tasks = tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
  setStore("sms_tasks", tasks);
  renderAll();
};

window.deleteTask = function (id) {
  tasks = tasks.filter((t) => t.id !== id);
  setStore("sms_tasks", tasks);
  renderAll();
};

// --- PROFILE ---
function renderProfile() {
  document.getElementById("prof-name").value = currentUser.name;
  document.getElementById("prof-email").value = currentUser.email;
  document.getElementById("prof-course").value = currentUser.course || "BCA";
}

document.getElementById("profile-form").addEventListener("submit", (e) => {
  e.preventDefault();
  currentUser.name = document.getElementById("prof-name").value.trim();
  currentUser.email = document.getElementById("prof-email").value.trim();
  currentUser.course = document.getElementById("prof-course").value.trim();

  users = users.map((u) => (u.email === currentUser.email ? currentUser : u));
  setStore("sms_users", users);
  setStore("sms_current_user", currentUser);
  alert("Profile updated!");
  renderAll();
});

// --- INITIALIZE ---
function renderAll() {
  renderDashboard();
  renderStudents();
  renderAttendance();
  renderTimetable();
  renderTasks();
  renderProfile();
}

function initApp() {
  authContainer.classList.add("hidden");
  appContainer.classList.remove("hidden");
  renderAll();
}

if (currentUser) {
  initApp();
}
