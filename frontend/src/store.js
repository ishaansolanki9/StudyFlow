import { defineStore } from "pinia";
import axios from "axios";

const API = "http://localhost:3001/api";

export const useStudyStore = defineStore("study", {
  state: () => ({
    years: [],
    courses: [],
    assignmentGroups: [],
    assignments: [],
    dashboard: {}
  }),

  actions: {
    /* ============================
       LOAD EVERYTHING
    ============================ */
    async loadAll() {
      const [yearsRes, coursesRes, groupsRes, assignmentsRes] = await Promise.all([
        axios.get(`${API}/years`),
        axios.get(`${API}/courses`),
        axios.get(`${API}/assignment-groups`),   // <-- Correct endpoint
        axios.get(`${API}/assignments`)
      ]);

      this.years = yearsRes.data;
      this.courses = coursesRes.data;
      this.assignmentGroups = groupsRes.data;
      this.assignments = assignmentsRes.data;
    },

    /* ============================
       DASHBOARD
    ============================ */
    async loadDashboardFiltered(year = null, semester = null) {
      const params = {};
      if (year !== null) params.year = year;
      if (semester !== null) params.semester = semester;

      const res = await axios.get(`${API}/dashboard`, { params });
      this.dashboard = res.data;
    },

    /* ============================
       YEARS CRUD
    ============================ */
    async addYear(name) {
      await axios.post(`${API}/years`, { name });
      await this.loadAll();
    },

    async deleteYear(id) {
      await axios.delete(`${API}/years/${id}`);
      await this.loadAll();
    },

    /* ============================
       COURSES CRUD
    ============================ */
    async addCourse(course) {
      await axios.post(`${API}/courses`, course);
      await this.loadAll();
    },

    async updateCourse(id, data) {
      await axios.put(`${API}/courses/${id}`, data);
      await this.loadAll();
    },

    async deleteCourse(id) {
      await axios.delete(`${API}/courses/${id}`);
      await this.loadAll();
    },

    /* ============================
       ASSIGNMENT GROUPS CRUD
    ============================ */
    async addGroup(group) {
      await axios.post(`${API}/assignment-groups`, group);  // <-- matches backend
      await this.loadAll();
    },

    async updateGroup(id, data) {
      await axios.put(`${API}/assignment-groups/${id}`, data); // <-- matches backend
      await this.loadAll();
    },

    async deleteGroup(id) {
      await axios.delete(`${API}/assignment-groups/${id}`); // <-- matches backend
      await this.loadAll();
    },

    /* ============================
       ASSIGNMENTS CRUD
    ============================ */
    async addAssignment(data) {
      await axios.post(`${API}/assignments`, data);
      await this.loadAll();
    },

    async updateAssignment(id, data) {
      await axios.put(`${API}/assignments/${id}`, data);
      await this.loadAll();
    },

    async deleteAssignment(id) {
      await axios.delete(`${API}/assignments/${id}`);
      await this.loadAll();
    }
  }
});
