<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold mb-4">{{ groupName }} — Assignments</h1>

    <button
      class="px-4 py-2 bg-blue-500 text-white rounded"
      @click="showAssignModal = true"
    >
      + Add Assignment
    </button>

    <div class="mt-6">
      <table class="w-full text-left text-white">
        <thead class="text-gray-400 border-b border-gray-600">
          <tr>
            <th class="py-2">Title</th>
            <th class="py-2">Due Date</th>
            <th class="py-2">Status</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="a in assignments"
            :key="a.id"
            class="border-b border-gray-700"
          >
            <td class="py-2">{{ a.title }}</td>
            <td>{{ a.dueDate }}</td>
            <td>{{ a.status }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <AssignmentFormModal
      v-if="showAssignModal"
      :course-id="courseId"
      :group-id="groupId"
      @close="showAssignModal = false"
    />
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { useStudyStore } from "../store";
import AssignmentFormModal from "./AssignmentFormModal.vue";

const route = useRoute();
const store = useStudyStore();

const courseId = Number(route.params.courseId);
const groupId = Number(route.params.groupId);

const showAssignModal = ref(false);

const groupName = computed(() => {
  const g = store.assignmentGroups.find(g => g.id === groupId);
  return g ? g.name : "Group";
});

const assignments = computed(() =>
  store.assignments.filter(a => a.groupId === groupId)
);
</script>
