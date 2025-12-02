<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useStudyStore } from '../store'
import AssignmentFormModal from './AssignmentFormModal.vue'

const store = useStudyStore()

const selectedCourseId = ref(null)
const expandedGroupIds = ref([])

const showAssignmentModal = ref(false)
const showGroupModal = ref(false)

const assignmentForm = ref({})
const groupForm = ref({})
const isEditingAssignment = ref(false)
const isEditingGroup = ref(false)

/* ============================
   INITIAL LOAD
============================ */

onMounted(async () => {
  if (!store.courses.length || !store.assignments.length) {
    await store.loadAll()
  }
})

// Whenever courses change, pick a default if none selected yet
watch(
  () => store.courses,
  newCourses => {
    if (newCourses.length && selectedCourseId.value == null) {
      selectedCourseId.value = newCourses[0].id
    }
  },
  { immediate: true, deep: true }
)

/* ============================
   DERIVED DATA
============================ */

const courses = computed(() => store.courses || [])

const selectedCourse = computed(
  () => (store.courses || []).find(c => c.id === selectedCourseId.value) || null
)

const groupsForSelectedCourse = computed(() => {
  const cid = selectedCourseId.value
  if (!cid || !store.assignmentGroups) return []
  return store.assignmentGroups.filter(g => g.courseId === cid)
})

const ungroupedAssignments = computed(() => {
  const cid = selectedCourseId.value
  if (!cid || !store.assignments) return []
  return store.assignments.filter(a => a.courseId === cid && a.groupId == null)
})

function assignmentsForGroup(groupId) {
  const cid = selectedCourseId.value
  if (!cid || !store.assignments) return []
  return store.assignments.filter(a => a.courseId === cid && a.groupId === groupId)
}

/* ============================
   COURSE / GROUP UI
============================ */

function selectCourse(id) {
  selectedCourseId.value = id
  expandedGroupIds.value = []
}

function toggleGroup(id) {
  if (expandedGroupIds.value.includes(id)) {
    expandedGroupIds.value = expandedGroupIds.value.filter(gid => gid !== id)
  } else {
    expandedGroupIds.value.push(id)
  }
}

/* ============================
   GROUP MODAL
============================ */

function openNewGroup() {
  if (!selectedCourseId.value) return
  isEditingGroup.value = false
  groupForm.value = {
    name: '',
    weight: '',
    status: 'pending'
  }
  showGroupModal.value = true
}

function openEditGroup(group) {
  isEditingGroup.value = true
  groupForm.value = { ...group }
  showGroupModal.value = true
}

async function saveGroup() {
  if (!selectedCourseId.value) return

  const payload = {
    ...groupForm.value,
    courseId: selectedCourseId.value
  }

  if (isEditingGroup.value && payload.id) {
    // uses updateGroup from store.js
    await store.updateGroup(payload.id, payload)
  } else {
    // uses addGroup from store.js
    await store.addGroup(payload)
  }

  showGroupModal.value = false
  groupForm.value = {}
  isEditingGroup.value = false
}

async function deleteGroup(group) {
  if (!confirm(`Delete group "${group.name}" and its assignments?`)) return
  // uses deleteGroup from store.js
  await store.deleteGroup(group.id)
}

/* ============================
   ASSIGNMENT MODAL
============================ */

function openNewAssignment(groupId = null) {
  if (!selectedCourseId.value) return

  isEditingAssignment.value = false
  assignmentForm.value = {
    courseId: selectedCourseId.value,
    groupId,
    title: '',
    dueDate: '',
    weight: '',
    status: 'pending',
    score: '',
    maxScore: ''
  }
  showAssignmentModal.value = true
}

function openEditAssignment(assignment) {
  isEditingAssignment.value = true
  assignmentForm.value = { ...assignment }
  showAssignmentModal.value = true
}

async function handleSaveAssignment(payload) {
  if (isEditingAssignment.value && payload.id) {
    await store.updateAssignment(payload.id, payload)
  } else {
    await store.addAssignment(payload)
  }
  showAssignmentModal.value = false
  assignmentForm.value = {}
  isEditingAssignment.value = false
}

function closeAssignmentModal() {
  showAssignmentModal.value = false
  assignmentForm.value = {}
  isEditingAssignment.value = false
}

async function deleteAssignment(assignment) {
  if (!confirm(`Delete assignment "${assignment.title}"?`)) return
  await store.deleteAssignment(assignment.id)
}
</script>

<template>
  <div class="assignments-page">
    <h2>Assignments</h2>

    <div class="assignments-layout">
      <!-- LEFT: COURSE LIST -->
      <div class="course-column">
        <h3>Courses</h3>
        <p v-if="!courses.length" class="hint">
          You don't have any courses yet. Add one from the Courses page.
        </p>

        <ul v-else class="course-list">
          <li
            v-for="c in courses"
            :key="c.id"
            :class="['course-item', { active: c.id === selectedCourseId }]"
            @click="selectCourse(c.id)"
          >
            <div class="course-name">{{ c.name }}</div>
            <div class="course-meta">
              <span>{{ c.code }}</span>
              <span v-if="c.semester">• {{ c.semester }}</span>
            </div>
          </li>
        </ul>
      </div>

      <!-- RIGHT: GROUPS + ASSIGNMENTS -->
      <div class="detail-column">
        <div v-if="!selectedCourse">
          <p class="hint">Select a course on the left to view its assignments.</p>
        </div>

        <div v-else>
          <div class="header-row">
            <div>
              <h3>{{ selectedCourse.name }}</h3>
              <p class="sub">
                Organize work into groups (e.g., Homework, Quizzes, Exams) and add individual
                assignments inside each group.
              </p>
            </div>

            <div class="header-actions">
              <button class="primary" @click="openNewGroup">+ Add Group</button>
              <button class="secondary" @click="openNewAssignment(null)">
                + Add Ungrouped Assignment
              </button>
            </div>
          </div>

          <!-- GROUPS -->
          <div class="group-list">
            <div
              v-for="g in groupsForSelectedCourse"
              :key="g.id"
              class="group-card"
            >
              <div class="group-header">
                <div class="group-main" @click="toggleGroup(g.id)">
                  <span class="chevron">
                    {{ expandedGroupIds.includes(g.id) ? '▼' : '▶' }}
                  </span>
                  <span class="group-title">{{ g.name }}</span>
                  <span class="group-pill">Weight: {{ g.weight || 0 }}%</span>
                  <span class="status-pill" :class="g.status">
                    {{ g.status }}
                  </span>
                </div>

                <div class="group-actions">
                  <button class="secondary small" @click.stop="openEditGroup(g)">
                    Edit
                  </button>
                  <button class="danger small" @click.stop="deleteGroup(g)">
                    Delete
                  </button>
                  <button class="primary small" @click.stop="openNewAssignment(g.id)">
                    + Add Assignment
                  </button>
                </div>
              </div>

              <div
                v-if="expandedGroupIds.includes(g.id)"
                class="group-body"
              >
                <table class="assign-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Due</th>
                      <th>Weight</th>
                      <th>Status</th>
                      <th>Score</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="a in assignmentsForGroup(g.id)"
                      :key="a.id"
                    >
                      <td>{{ a.title }}</td>
                      <td>{{ a.dueDate || '—' }}</td>
                      <td>{{ a.weight }}%</td>
                      <td>
                        <span class="status-pill" :class="a.status">
                          {{ a.status }}
                        </span>
                      </td>
                      <td>
                        <span v-if="a.score != null && a.maxScore != null">
                          {{ a.score }} / {{ a.maxScore }}
                        </span>
                        <span v-else>—</span>
                      </td>
                      <td class="row-actions">
                        <button class="secondary small" @click="openEditAssignment(a)">
                          Edit
                        </button>
                        <button class="danger small" @click="deleteAssignment(a)">
                          Delete
                        </button>
                      </td>
                    </tr>

                    <tr v-if="assignmentsForGroup(g.id).length === 0">
                      <td colspan="6" class="empty-row">
                        No assignments in this group yet.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- UNGROUPED -->
            <div
              v-if="ungroupedAssignments.length"
              class="group-card ungrouped"
            >
              <div class="group-header">
                <div class="group-main">
                  <span class="group-title">Ungrouped Assignments</span>
                </div>
              </div>

              <div class="group-body">
                <table class="assign-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Due</th>
                      <th>Weight</th>
                      <th>Status</th>
                      <th>Score</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="a in ungroupedAssignments"
                      :key="a.id"
                    >
                      <td>{{ a.title }}</td>
                      <td>{{ a.dueDate || '—' }}</td>
                      <td>{{ a.weight }}%</td>
                      <td>
                        <span class="status-pill" :class="a.status">
                          {{ a.status }}
                        </span>
                      </td>
                      <td>
                        <span v-if="a.score != null && a.maxScore != null">
                          {{ a.score }} / {{ a.maxScore }}
                        </span>
                        <span v-else>—</span>
                      </td>
                      <td class="row-actions">
                        <button class="secondary small" @click="openEditAssignment(a)">
                          Edit
                        </button>
                        <button class="danger small" @click="deleteAssignment(a)">
                          Delete
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <p
              v-if="!groupsForSelectedCourse.length && !ungroupedAssignments.length"
              class="hint"
            >
              No assignments yet. Start by creating a group or adding an ungrouped assignment.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- ASSIGNMENT MODAL -->
    <AssignmentFormModal
      v-if="showAssignmentModal"
      :form="assignmentForm"
      :is-edit="isEditingAssignment"
      @save="handleSaveAssignment"
      @close="closeAssignmentModal"
    />

    <!-- GROUP MODAL -->
    <div v-if="showGroupModal" class="modal" @click.self="showGroupModal = false">
      <div class="modal-body">
        <h3>{{ isEditingGroup ? 'Edit Group' : 'Add Group' }}</h3>

        <div class="form-group">
          <label>Name</label>
          <input v-model="groupForm.name" placeholder="e.g., Homework" />
        </div>

        <div class="form-group">
          <label>Weight (%)</label>
          <input v-model="groupForm.weight" placeholder="Weight for this group" />
        </div>

        <div class="form-group">
          <label>Status</label>
          <select v-model="groupForm.status">
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div class="modal-actions">
          <button class="primary" @click="saveGroup">Save</button>
          <button class="secondary" @click="showGroupModal = false">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.assignments-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.assignments-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 24px;
}

.course-column {
  background: #252a3b;
  padding: 16px;
  border-radius: 12px;
}

.course-list {
  list-style: none;
  margin: 0;
  margin-top: 10px;
  padding: 0;
}

.course-item {
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 6px;
  transition: background 0.15s;
}

.course-item:hover {
  background: #30384a;
}

.course-item.active {
  background: #3b465d;
}

.course-name {
  font-weight: 600;
}

.course-meta {
  font-size: 0.8rem;
  opacity: 0.8;
}

.detail-column {
  background: #252a3b;
  padding: 18px 20px;
  border-radius: 12px;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 18px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.sub {
  font-size: 0.85rem;
  opacity: 0.8;
  margin-top: 4px;
}

.group-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.group-card {
  background: #1f2332;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.group-card.ungrouped {
  margin-top: 10px;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
}

.group-main {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.group-title {
  font-weight: 600;
}

.group-pill {
  font-size: 0.8rem;
  opacity: 0.8;
}

.group-actions {
  display: flex;
  gap: 6px;
}

.group-body {
  padding: 10px 12px 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.assign-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.assign-table th,
.assign-table td {
  padding: 6px 4px;
  text-align: left;
}

.assign-table tbody tr + tr td {
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.row-actions {
  text-align: right;
}

.empty-row {
  text-align: center;
  opacity: 0.7;
}

.status-pill {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.75rem;
  text-transform: capitalize;
}

.status-pill.pending {
  background: #444c5e;
}

.status-pill.in-progress {
  background: #ffb74d;
  color: #222;
}

.status-pill.done {
  background: #66bb6a;
  color: #111;
}

.hint {
  font-size: 0.85rem;
  opacity: 0.8;
}

/* Buttons */
.primary {
  background: #4cc2ff;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
}

.secondary {
  background: #3c4356;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.9rem;
}

.danger {
  background: #ff4d4d;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.9rem;
}

.small {
  padding: 4px 8px;
  font-size: 0.8rem;
}

/* Modal */
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 40;
}

.modal-body {
  background: #202638;
  padding: 20px 22px;
  border-radius: 12px;
  width: 340px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}

.form-group {
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-group input,
.form-group select {
  padding: 8px 9px;
  border-radius: 6px;
  border: none;
  background: #1a1f2f;
  color: #fff;
}
</style>
