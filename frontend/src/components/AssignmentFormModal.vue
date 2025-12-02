<template>
  <div class="modal">
    <div class="modal-body">
      <h3>{{ isEdit ? "Edit Assignment" : "Add Assignment" }}</h3>

      <!-- COURSE -->
      <div class="form-group">
        <label>Course</label>
        <select v-model="localForm.courseId">
          <option disabled value="">Select Course</option>
          <option v-for="c in courses" :key="c.id" :value="c.id">
            {{ c.name }}
          </option>
        </select>
      </div>

      <!-- TITLE -->
      <div class="form-group">
        <label>Title</label>
        <input v-model="localForm.title" placeholder="Assignment Title" />
      </div>

      <!-- DATE -->
      <div class="form-group">
        <label>Due Date</label>
        <input v-model="localForm.dueDate" type="date" />
      </div>

      <!-- WEIGHT -->
      <div class="form-group">
        <label>Weight (%)</label>
        <input v-model="localForm.weight" placeholder="Weight (%)" />
      </div>

      <!-- STATUS -->
      <div class="form-group">
        <label>Status</label>
        <select v-model="localForm.status">
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>

      <!-- SCORE -->
      <div class="form-row">
        <div class="form-group half">
          <label>Score</label>
          <input v-model="localForm.score" placeholder="Score" />
        </div>

        <div class="form-group half">
          <label>Max Score</label>
          <input v-model="localForm.maxScore" placeholder="Max Score" />
        </div>
      </div>

      <!-- ACTIONS -->
      <div class="modal-actions">
        <button class="primary" @click="save">Save</button>
        <button class="secondary" @click="$emit('close')">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from "vue";
import { useStudyStore } from "../store";

const props = defineProps({
  form: Object,
  isEdit: Boolean
});

const emits = defineEmits(["save", "close"]);

const store = useStudyStore();
const courses = store.courses;

// Create reactive copy of incoming form
const localForm = reactive({ ...props.form });

// Sync modal when parent updates props (important when switching edit → add)
watch(
  () => props.form,
  newForm => {
    Object.assign(localForm, newForm);
  },
  { deep: true }
);

function save() {
  emits("save", { ...localForm });
}
</script>

<style scoped>
/* BACKDROP */
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

/* MODAL BODY */
.modal-body {
  background: #1f2736;
  padding: 28px;
  width: 420px;
  border-radius: 14px;
  box-shadow: 0 0 20px rgba(0,0,0,0.35);
  animation: fadeIn 0.25s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

h3 {
  margin-bottom: 20px;
  font-size: 1.4rem;
  font-weight: 600;
}

/* FORM GROUP */
.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  opacity: 0.8;
  font-size: 0.9rem;
}

/* SIDE-BY-SIDE ROW */
.form-row {
  display: flex;
  gap: 12px;
}

.half {
  flex: 1;
}

/* INPUTS & SELECTS */
input,
select {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: none;
  background: #2b3446;
  color: white;
  font-size: 0.95rem;
}

/* ACTION BUTTONS */
.modal-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.primary {
  padding: 10px 18px;
  background: #4cc2ff;
  border-radius: 8px;
  font-weight: 600;
}

.secondary {
  padding: 10px 18px;
  background: #444c5e;
  border-radius: 8px;
}
</style>
