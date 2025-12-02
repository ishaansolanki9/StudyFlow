// server.js
const express = require("express");
const cors = require("cors");

const {
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
  deleteAssignment
} = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

/* ========================================
   YEARS
======================================== */
app.get("/api/years", (req, res) => res.json(getYears()));

app.post("/api/years", (req, res) => {
  const year = createYear(req.body);
  res.json(year);
});

app.delete("/api/years/:id", (req, res) => {
  deleteYear(req.params.id);
  res.json({ success: true });
});

/* ========================================
   COURSES
======================================== */
app.get("/api/courses", (req, res) => res.json(getCourses()));

app.post("/api/courses", (req, res) => {
  const course = createCourse(req.body);
  res.json(course);
});

app.put("/api/courses/:id", (req, res) => {
  const updated = updateCourse(req.params.id, req.body);
  res.json(updated);
});

app.delete("/api/courses/:id", (req, res) => {
  deleteCourse(req.params.id);
  res.json({ success: true });
});

/* ========================================
   ASSIGNMENT GROUPS
======================================== */
app.get("/api/assignment-groups", (req, res) =>
  res.json(getAssignmentGroups())
);

app.post("/api/assignment-groups", (req, res) => {
  const group = createAssignmentGroup(req.body);
  res.json(group);
});

app.put("/api/assignment-groups/:id", (req, res) => {
  const updated = updateAssignmentGroup(req.params.id, req.body);
  res.json(updated);
});

app.delete("/api/assignment-groups/:id", (req, res) => {
  deleteAssignmentGroup(req.params.id);
  res.json({ success: true });
});

/* ========================================
   ASSIGNMENTS
======================================== */
app.get("/api/assignments", (req, res) => res.json(getAssignments()));

app.post("/api/assignments", (req, res) => {
  const a = createAssignment(req.body);
  res.json(a);
});

app.put("/api/assignments/:id", (req, res) => {
  const updated = updateAssignment(req.params.id, req.body);
  res.json(updated);
});

app.delete("/api/assignments/:id", (req, res) => {
  deleteAssignment(req.params.id);
  res.json({ success: true });
});

/* ========================================
   DASHBOARD
======================================== */
app.get("/api/dashboard", (req, res) => {
  const db = loadDb();

  let { year, semester } = req.query;
  year = year ? Number(year) : null;
  semester = semester || null;

  // Filter courses
  let courses = [...db.courses];

  if (year) courses = courses.filter(c => c.yearId === year);
  if (semester) courses = courses.filter(c => c.semester === semester);

  const courseIds = courses.map(c => c.id);
  const assignments = db.assignments.filter(a => courseIds.includes(a.courseId));

  /* ---------------------------- *
   * Workload — pending by course *
   * ---------------------------- */
  const workloadByCourse = courses.map(c => {
    const pending = assignments.filter(
      a => a.courseId === c.id && a.status !== "done"
    );
    return {
      courseId: c.id,
      courseName: c.name,
      pendingCount: pending.length
    };
  });

  /* ---------------------------- *
   * Upcoming assignments          *
   * ---------------------------- */
  const today = new Date();
  const upcoming = assignments
    .filter(a => a.dueDate)
    .filter(a => new Date(a.dueDate) >= today)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 10)
    .map(a => ({
      ...a,
      course: courses.find(c => c.id === a.courseId) || null
    }));

  /* ---------------------------- *
   * Projected GPA                 *
   * ---------------------------- */
  function percentToGpa(p) {
    if (p >= 90) return 4.0;
    if (p >= 80) return 3.0;
    if (p >= 70) return 2.0;
    if (p >= 60) return 1.0;
    return 0.0;
  }

  const coursePercents = courses.map(c => {
    const graded = assignments.filter(
      a => a.courseId === c.id && a.score != null && a.maxScore != null && a.maxScore > 0
    );

    if (!graded.length) return { courseId: c.id, percent: null };

    const totalWeight = graded.reduce((s, a) => s + a.weight, 0);
    const earned = graded.reduce(
      (s, a) => s + (a.score / a.maxScore) * a.weight,
      0
    );

    return {
      courseId: c.id,
      percent: totalWeight > 0 ? (earned / totalWeight) * 100 : null
    };
  });

  const validPercents = coursePercents.filter(p => p.percent != null);
  let projectedGpa = null;

  if (validPercents.length) {
    projectedGpa =
      validPercents.reduce((sum, p) => sum + percentToGpa(p.percent), 0) /
      validPercents.length;
  }

  res.json({
    projectedGpa,
    workloadByCourse,
    upcoming
  });
});

/* ========================================
   START SERVER
======================================== */
app.listen(3001, () =>
  console.log("Backend running at http://localhost:3001")
);
