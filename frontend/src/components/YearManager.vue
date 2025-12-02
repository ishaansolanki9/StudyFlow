<template>
  <div class="modal" @click.self="$emit('close')">
    <div class="modal-body">
      <h3>Manage Academic Years</h3>

      <!-- YEAR LIST -->
      <div class="year-list">
        <div
          v-for="y in store.years"
          :key="y.id"
          class="year-item"
        >
          <span class="year-name">{{ y.name }}</span>

          <button class="delete-btn" @click="deleteYear(y.id)">
            Delete
          </button>
        </div>

        <div v-if="store.years.length === 0" class="empty">
          No years added yet.
        </div>
      </div>

      <!-- ADD YEAR -->
      <input
        v-model="newYear"
        placeholder="Add new year (e.g., 2024–2025)"
        @keyup.enter="addYear"
      />

      <div class="actions">
        <button class="primary" @click="addYear">Add Year</button>
        <button class="secondary" @click="$emit('close')">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useStudyStore } from "../store";

const store = useStudyStore();
const newYear = ref("");

/* ============================
   ADD YEAR
============================ */
async function addYear() {
  const name = newYear.value.trim();
  if (!name) return;

  await store.addYear(name);      // <-- FIXED (await is REQUIRED)
  newYear.value = "";
}

/* ============================
   DELETE YEAR
============================ */
async function deleteYear(id) {
  await store.deleteYear(id);
}
</script>

<style scoped>
/* Dark blurred modal background */
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

/* Modal box */
.modal-body {
  background: #1a2130;
  padding: 28px;
  width: 430px;
  border-radius: 14px;
  box-shadow: 0 0 25px rgba(0,0,0,0.55);
  animation: fadeIn 0.18s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Header */
h3 {
  margin-bottom: 20px;
  font-size: 1.35rem;
  font-weight: 600;
}

/* Scrollable list */
.year-list {
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 18px;
}

/* Each year row */
.year-item {
  background: #273041;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background 0.15s;
}

.year-item:hover {
  background: #2e3a52;
}

/* Name formatting */
.year-name {
  font-size: 0.97rem;
}

/* Delete button */
.delete-btn {
  background: #ff4d4d;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 0.8rem;
  transition: background 0.15s;
}

.delete-btn:hover {
  background: #ff3333;
}

/* Empty message */
.empty {
  opacity: 0.6;
  text-align: center;
  padding: 12px;
}

/* Input */
input {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  background: #2b3446;
  margin-bottom: 16px;
  font-size: 0.95rem;
}

/* Action buttons */
.actions {
  display: flex;
  justify-content: space-between;
}

.primary {
  padding: 10px 18px;
  background: #4cc2ff;
  border-radius: 8px;
  font-weight: 600;
  transition: background 0.15s;
}

.primary:hover {
  background: #33b8fa;
}

.secondary {
  padding: 10px 18px;
  background: #3d4558;
  border-radius: 8px;
  transition: background 0.15s;
}

.secondary:hover {
  background: #50586b;
}
</style>
