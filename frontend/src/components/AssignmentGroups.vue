<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold mb-4">
      {{ courseName }} — Assignment Groups
    </h1>

    <!-- Add Group Button -->
    <button
      class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      @click="showModal = true"
    >
      + Add Group
    </button>

    <!-- Group List -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
      <div
        v-for="group in groups"
        :key="group.id"
        class="bg-gray-800 p-4 rounded shadow cursor-pointer hover:bg-gray-700"
        @click="openGroup(group.id)"
      >
        <h2 class="text-xl font-semibold text-white">{{ group.name }}</h2>
        <p class="text-gray-400 mt-1">Weight: {{ group.weight }}%</p>
        <p class="text-gray-400">Status: {{ group.status }}</p>
      </div>
    </div>

    <!-- Add Group Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <div class="bg-gray-900 p-6 rounded shadow-lg w-96">
        <h2 class="text-xl font-bold mb-4">Add Group</h2>

        <label class="block mb-2 text-gray-300">Name</label>
        <input
          v-model="form.name"
          type="text"
          class="w-full p-2 rounded bg-gray-800 text-white mb-4"
        />

        <label class="block mb-2 text-gray-300">Weight (%)</label>
        <input
          v-model.number="form.weight"
          type="number"
          min="0"
          max="100"
          class="w-full p-2 rounded bg-gray-800 text-white mb-4"
        />

        <label class="block mb-2 text-gray-300">Status</label>
        <select
          v-model="form.status"
          class="w-full p-2 rounded bg-gray-800 text-white mb-6"
        >
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>

        <div class="flex justify-end gap-3">
          <button class="px-3 py-1 bg-gray-700 rounded" @click="closeModal">
            Cancel
          </button>
          <button class="px-3 py-1 bg-blue-600 rounded" @click="saveGroup">
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStudyStore } from "../store";

const route = useRoute();
const router = useRouter();
const store = useStudyStore();

const courseId = Number(route.params.courseId);
const showModal = ref(false);

const form = ref({
  name: "",
  weight: 0,
  status: "In Progress"
});

const courseName = computed(() => {
  const c = store.courses.find(c => c.id === courseId);
  return c ? c.name : "Course";
});

const groups = computed(() =>
  store.assignmentGroups.filter(g => g.courseId === courseId)
);

function openGroup(id) {
  router.push(`/assignments/${courseId}/groups/${id}`);
}

function closeModal() {
  showModal.value = false;
  form.value = { name: "", weight: 0, status: "In Progress" };
}

async function saveGroup() {
  await store.addGroup({
    name: form.value.name,
    weight: form.value.weight,
    status: form.value.status,
    courseId
  });

  closeModal();
}
</script>
