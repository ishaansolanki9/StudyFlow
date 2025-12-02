<template>
  <div class="modal">
    <div class="modal-body">
      <h3>{{ isEdit ? "Edit Course" : "Add Course" }}</h3>

      <!-- Course Inputs -->
      <input v-model="localForm.name" placeholder="Course Name" />
      <input v-model="localForm.code" placeholder="Course Code" />
      <input v-model.number="localForm.credits" placeholder="Credits" />
      <input v-model.number="localForm.targetGrade" placeholder="Target Grade (%)" />

      <!-- Year Select -->
      <label>Year</label>
      <select v-model="localForm.yearId">
        <option value="">No Year</option>
        <option
          v-for="y in years"
          :key="y.id"
          :value="y.id"
        >
          {{ y.name }}
        </option>
      </select>

      <!-- Semester Select -->
      <label>Semester</label>
      <select v-model="localForm.semester">
        <option value="">Select Semester</option>
        <option v-for="s in semesterOptions" :key="s" :value="s">
          {{ s }}
        </option>
      </select>

      <!-- Buttons -->
      <div class="flex-between">
        <button class="primary" @click="handleSave">Save</button>
        <button class="secondary" @click="$emit('close')">Cancel</button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from "vue";
import { useStudyStore } from "../store";

const store = useStudyStore();

/* Props & Emits */
const props = defineProps({
  form: Object,   // incoming form data
  isEdit: Boolean
});

const emits = defineEmits(["save", "close"]);

/* Local reactive copy of form */
const localForm = reactive({ ...props.form });

/* Sync local form every time the modal opens */
watch(
  () => props.form,
  (newForm) => {
    Object.assign(localForm, newForm);
  },
  { deep: true }
);

/* Semester list */
const semesterOptions = [
  "Fall",
  "Spring",
  "Summer",
  "Winter",
  "Other"
];

/* Save button clicked */
function handleSave() {
  emits("save", { ...localForm });
}
</script>

<style scoped>
.modal-body input,
.modal-body select {
  width: 100%;
  margin-bottom: 10px;
}
.flex-between {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
}
</style>
