<script setup>
import { ref, watch, onMounted, computed } from "vue";
import { useStudyStore } from "../store";

const store = useStudyStore();

/* ================================
   FILTER STATE
================================ */
const selectedFilter = ref("cumulative");

const years = computed(() => store.years);

/* ================================
   LOAD DASHBOARD BASED ON FILTER
================================ */
async function loadDashboard() {
  let year = null;
  let semester = null;

  if (selectedFilter.value.startsWith("year-")) {
    const parts = selectedFilter.value.split("-");
    year = Number(parts[1]);

    if (parts.length === 3) {
      semester = parts[2];
    }
  }

  await store.loadDashboardFiltered(year, semester);
}

watch(selectedFilter, loadDashboard);

onMounted(async () => {
  await store.loadAll();
  await loadDashboard();
});
</script>

<template>
  <div class="dashboard-container">

    <!-- HEADER + FILTER -->
    <div class="top-bar">
      <h2 class="page-title">Dashboard</h2>

      <div class="select-wrapper">
        <select v-model="selectedFilter" @change="loadDashboard">
          <option value="cumulative">Cumulative</option>

          <optgroup label="Years" v-if="years.length">
            <option
              v-for="y in years"
              :key="y.id"
              :value="'year-' + y.id"
            >
              {{ y.name }}
            </option>
          </optgroup>

          <optgroup label="Semesters">
            <option
              v-for="y in years"
              :key="'sem-f-' + y.id"
              :value="'year-' + y.id + '-Fall'"
            >
              {{ y.name }} — Fall
            </option>

            <option
              v-for="y in years"
              :key="'sem-s-' + y.id"
              :value="'year-' + y.id + '-Spring'"
            >
              {{ y.name }} — Spring
            </option>
          </optgroup>
        </select>
      </div>
    </div>

    <!-- TOP CARDS -->
    <div class="cards">

      <!-- GPA -->
      <div class="card">
        <h3>Projected GPA</h3>
        <p class="big">
          {{ store.dashboard.projectedGpa?.toFixed(2) || "—" }}
        </p>
      </div>

      <!-- WORKLOAD -->
      <div class="card">
        <h3>Workload</h3>
        <ul>
          <li v-for="w in store.dashboard.workloadByCourse" :key="w.courseId">
            <strong>{{ w.courseName }}</strong>
            <span>{{ w.pendingCount }} pending</span>
          </li>
        </ul>
      </div>

    </div>

    <!-- UPCOMING ASSIGNMENTS -->
    <div class="card full">
      <h3>Upcoming Assignments</h3>

      <table>
        <thead>
          <tr>
            <th>Course</th>
            <th>Assignment</th>
            <th>Due</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="a in store.dashboard.upcoming" :key="a.id">
            <td>{{ a.course?.name }}</td>
            <td>{{ a.title }}</td>
            <td>{{ a.dueDate }}</td>
            <td>{{ a.status }}</td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 22px;
}

.page-title {
  font-size: 1.9rem;
  font-weight: 600;
}

/* ============================== */
/* PREMIUM CUSTOM DROPDOWN STYLE */
/* ============================== */

.select-wrapper {
  position: relative;
  width: 260px;
}

.select-wrapper select {
  width: 100%;
  padding: 10px 14px;
  border-radius: 10px;
  background: #1c2230;
  border: 1px solid #384153;
  color: #d8e1ef;
  font-size: 0.95rem;
  appearance: none;      /* remove native dropdown arrow */
  outline: none;
  cursor: pointer;
  transition: 0.15s ease;
}

/* Hover + Focus glow */
.select-wrapper select:hover,
.select-wrapper select:focus {
  border-color: #5ac8ff;
  background: #222a3a;
  box-shadow: 0 0 8px rgba(90, 200, 255, 0.35);
}

/* Custom arrow */
.select-wrapper::after {
  content: "▾";
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  font-size: 1rem;
  color: #a8b3c7;
}

/* ============================== */
/* CARDS */
/* ============================== */

.cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px;
  margin-bottom: 30px;
}

.card {
  background: #1e2533;
  padding: 22px;
  border-radius: 14px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.35);
}

.card.full {
  margin-top: 20px;
}

.card h3 {
  margin-bottom: 15px;
  font-size: 1.25rem;
  font-weight: 600;
}

.big {
  font-size: 2.6rem;
  margin-top: 8px;
}

/* LIST */
.card ul {
  list-style: none;
  padding: 0;
}

.card ul li {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  opacity: 0.9;
}

/* TABLE */
table {
  width: 100%;
  border-collapse: collapse;
}

th {
  text-align: left;
  padding: 10px 5px;
  opacity: 0.7;
}

td {
  padding: 10px 5px;
  border-top: 1px solid rgba(255,255,255,0.07);
}
</style>
