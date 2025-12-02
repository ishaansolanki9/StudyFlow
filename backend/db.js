// db.js
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "db.json");

/* ========================================
   Initialize DB file if missing
======================================== */
function initDbFile() {
  if (!fs.existsSync(DB_PATH)) {
    const initial = {
      years: [],
      courses: [],
      assignments: [],
      assignmentGroups: [],
      nextYearId: 1,
      nextCourseId: 1,
      nextAssignmentId: 1,
      nextAssignmentGroupId: 1
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2));
  }
}

function loadDb() {
  initDbFile();
  const raw = fs.readFileSync(DB_PATH, "utf8");
  const db = JSON.parse(raw || "{}");

  // Ensure arrays exist
  db.years = db.years || [];
  db.courses = db.courses || [];
  db.assignments = db.assignments || [];
  db.assignmentGroups = db.assignmentGroups || [];

  // Ensure ID counters exist
  if (typeof db.nextYearId !== "number")
    db.nextYearId =
      (db.years.reduce((m, y) => Math.max(m, y.id || 0), 0) || 0) + 1;

  if (typeof db.nextCourseId !== "number")
    db.nextCourseId =
      (db.courses.reduce((m, c) => Math.max(m, c.id || 0), 0) || 0) + 1;

  if (typeof db.nextAssignmentId !== "number")
    db.nextAssignmentId =
      (db.assignments.reduce((m, a) => Math.max(m, a.id || 0), 0) || 0) + 1;

  if (typeof db.nextAssignmentGroupId !== "number")
    db.nextAssignmentGroupId =
      (db.assignmentGroups.reduce((m, g) => Math.max(m, g.id || 0), 0) || 0) + 1;

  return db;
}

function saveDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

/* ========== YEARS ========== */
function getYears() {
  return loadDb().years;
}

function createYear(data) {
  const db = loadDb();
  const year = { id: db.nextYearId++, name: data.name };
  db.years.push(year);
  saveDb(db);
  return year;
}

function deleteYear(id) {
  const db = loadDb();
  const Y = Number(id);

  const courseIds = db.courses.filter(c => c.yearId === Y).map(c => c.id);

  db.years = db.years.filter(y => y.id !== Y);
  db.courses = db.courses.filter(c => c.yearId !== Y);
  db.assignmentGroups = db.assignmentGroups.filter(g => !courseIds.includes(g.courseId));
  db.assignments = db.assignments.filter(a => !courseIds.includes(a.courseId));

  saveDb(db);
}

/* ========== COURSES ========== */
function getCourses() {
  return loadDb().courses;
}

function createCourse(data) {
  const db = loadDb();
  const course = {
    id: db.nextCourseId++,
    name: data.name || "",
    code: data.code || "",
    credits: Number(data.credits) || 0,
    targetGrade: Number(data.targetGrade) || null,
    yearId: data.yearId ? Number(data.yearId) : null,
    semester: data.semester || ""
  };
  db.courses.push(course);
  saveDb(db);
  return course;
}

function updateCourse(id, updates) {
  const db = loadDb();
  const idx = db.courses.findIndex(c => c.id === Number(id));
  if (idx === -1) return null;

  db.courses[idx] = { ...db.courses[idx], ...updates };
  saveDb(db);
  return db.courses[idx];
}

function deleteCourse(id) {
  const db = loadDb();
  const courseId = Number(id);

  db.courses = db.courses.filter(c => c.id !== courseId);
  db.assignmentGroups = db.assignmentGroups.filter(g => g.courseId !== courseId);
  db.assignments = db.assignments.filter(a => a.courseId !== courseId);

  saveDb(db);
}

/* ========== ASSIGNMENT GROUPS (FOLDERS) ========== */
function getAssignmentGroups() {
  return loadDb().assignmentGroups;
}

function createAssignmentGroup(data) {
  const db = loadDb();
  const group = {
    id: db.nextAssignmentGroupId++,
    courseId: Number(data.courseId),
    name: data.name || "New Group",
    weight: Number(data.weight) || 0,
    status: data.status || "pending"
  };
  db.assignmentGroups.push(group);
  saveDb(db);
  return group;
}

function updateAssignmentGroup(id, updates) {
  const db = loadDb();
  const idx = db.assignmentGroups.findIndex(g => g.id === Number(id));
  if (idx === -1) return null;

  db.assignmentGroups[idx] = { ...db.assignmentGroups[idx], ...updates };
  saveDb(db);
  return db.assignmentGroups[idx];
}

function deleteAssignmentGroup(id) {
  const db = loadDb();
  const G = Number(id);

  db.assignmentGroups = db.assignmentGroups.filter(g => g.id !== G);
  db.assignments = db.assignments.filter(a => a.groupId !== G);

  saveDb(db);
}

/* ========== ASSIGNMENTS ========== */
function getAssignments() {
  return loadDb().assignments;
}

function createAssignment(data) {
  const db = loadDb();

  const assignment = {
    id: db.nextAssignmentId++,
    courseId: Number(data.courseId),
    groupId: data.groupId ? Number(data.groupId) : null,
    title: data.title || "",
    dueDate: data.dueDate || "",
    weight: Number(data.weight) || 0,
    status: data.status || "pending",
    score: data.score != null ? Number(data.score) : null,
    maxScore: data.maxScore != null ? Number(data.maxScore) : null
  };

  db.assignments.push(assignment);
  saveDb(db);
  return assignment;
}

function updateAssignment(id, updates) {
  const db = loadDb();
  const idx = db.assignments.findIndex(a => a.id === Number(id));
  if (idx === -1) return null;

  db.assignments[idx] = { ...db.assignments[idx], ...updates };
  saveDb(db);
  return db.assignments[idx];
}

function deleteAssignment(id) {
  const db = loadDb();
  db.assignments = db.assignments.filter(a => a.id !== Number(id));
  saveDb(db);
}

/* ========== DASHBOARD ========== */
function getDashboard(params = {}) {
  const db = loadDb();

  let courses = [...db.courses];

  if (params.year) courses = courses.filter(c => c.yearId === Number(params.year));
  if (params.semester) courses = courses.filter(c => c.semester === params.semester);

  const courseIds = courses.map(c => c.id);
  const assignments = db.assignments.filter(a => courseIds.includes(a.courseId));

  const totalWeight = assignments.reduce((s, a) => s + a.weight, 0);
  const completedWeight = assignments
    .filter(a => a.status === "done")
    .reduce((s, a) => s + a.weight, 0);

  return {
    totalCourses: courses.length,
    totalAssignments: assignments.length,
    totalWeight,
    completedWeight
  };
}

module.exports = {
  loadDb,
  saveDb,

  getYears,
  createYear,
  deleteYear,

  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,

  getAssignmentGroups,
  createAssignmentGroup,
  updateAssignmentGroup,
  deleteAssignmentGroup,

  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,

  getDashboard
};
