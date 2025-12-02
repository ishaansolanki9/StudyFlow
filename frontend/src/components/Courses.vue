<script setup>
import { ref, onMounted, computed } from 'vue'
import { useStudyStore } from '../store'
import YearManager from './YearManager.vue'

const store = useStudyStore()

const showModal = ref(false)
const showYearManager = ref(false)
const editId = ref(null)

/* Form Structure */
const form = ref({
  name: "",
  code: "",
  credits: "",
  targetGrade: "",
  yearId: "",
  semester: ""
})

/* Semester List */
const semesterOptions = [
  "Fall",
  "Spring",
  "Summer",
  "Winter",
  "Other"
]

/* Open Add Course Modal */
function openAdd() {
  editId.value = null
  form.value = {
    name: "",
    code: "",
    credits: "",
    targetGrade: "",
    yearId: "",
    semester: ""
  }
  showModal.value = true
}

/* Open Edit Course Modal */
function openEdit(course) {
  editId.value = course.id
  form.value = {
    name: course.name,
    code: course.code,
    credits: course.credits,
    targetGrade: course.targetGrade,
    yearId: course.yearId ?? "",
    semester: course.semester ?? ""
  }
  showModal.value = true
}

/* Save Course (Add or Update) */
async function save() {
  const payload = { ...form.value }
  
  // Empty year = null
  if (payload.yearId === "") payload.yearId = null

  if (editId.value)
    await store.updateCourse(editId.value, payload)
  else
    await store.addCourse(payload)

  showModal.value = false
}

/* Lookup Year Name */
function yearNameFor(course) {
  const y = store.years.find(y => y.id === course.yearId)
  return y ? y.name : "—"
}

onMounted(() => store.loadAll())
</script>

<template>
  <div>
    <!-- Header -->
    <div class="header-row">
      <h2>Courses</h2>
      <div class="button-group">
        <button class="secondary" @click="showYearManager = true">Manage Years</button>
        <button class="primary" @click="openAdd">+ Add Course</button>
      </div>
    </div>

    <!-- Courses Table -->
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Code</th>
          <th>Year</th>
          <th>Semester</th>
          <th>Credits</th>
          <th>Target %</th>
          <th></th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="c in store.courses" :key="c.id">
          <td>{{ c.name }}</td>
          <td>{{ c.code }}</td>
          <td>{{ yearNameFor(c) }}</td>
          <td>{{ c.semester || '—' }}</td>
          <td>{{ c.credits }}</td>
          <td>{{ c.targetGrade }}</td>
          <td>
            <button class="secondary" @click="openEdit(c)">Edit</button>
            <button class="danger" @click="store.deleteCourse(c.id)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Course Add/Edit Modal -->
    <div v-if="showModal" class="modal">
      <div class="modal-body">
        <h3>{{ editId ? "Edit Course" : "Add Course" }}</h3>

        <input v-model="form.name" placeholder="Course name" />
        <input v-model="form.code" placeholder="Course code" />
        <input v-model="form.credits" placeholder="Credits" type="number" />
        <input v-model="form.targetGrade" placeholder="Target %" type="number" />

        <!-- Year Dropdown -->
        <label>Year</label>
        <select v-model="form.yearId">
          <option value="">No Year</option>
          <option v-for="y in store.years" :key="y.id" :value="y.id">
            {{ y.name }}
          </option>
        </select>

        <!-- Semester Dropdown -->
        <label>Semester</label>
        <select v-model="form.semester">
          <option value="">Select semester</option>
          <option v-for="s in semesterOptions" :key="s" :value="s">
            {{ s }}
          </option>
        </select>

        <div class="modal-buttons">
          <button class="primary" @click="save">Save</button>
          <button class="secondary" @click="showModal = false">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Year Manager Modal -->
    <YearManager 
      v-if="showYearManager" 
      @close="showYearManager = false" 
    />
  </div>
</template>

<style scoped>
/* Header layout */
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.button-group {
  display: flex;
  gap: 8px;
}

/* Modal button row */
.modal-buttons {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
}

/* Table tweaks */
table {
  width: 100%;
  border-collapse: collapse;
}

th {
  text-align: left;
  padding: 8px;
  opacity: 0.75;
}

td {
  padding: 8px;
  border-top: 1px solid rgba(255,255,255,0.1);
}

/* Modal styling (inherits your global modal CSS) */
.modal-body input,
.modal-body select {
  width: 100%;
  margin-bottom: 10px;
}
</style>
