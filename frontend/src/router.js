import { createRouter, createWebHistory } from "vue-router";

const Dashboard = () => import("./components/Dashboard.vue");
const Courses = () => import("./components/Courses.vue");
const Assignments = () => import("./components/Assignments.vue");

const routes = [
  {
    path: "/",
    redirect: "/dashboard"
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: Dashboard,
    meta: { title: "Dashboard" }
  },
  {
    path: "/courses",
    name: "Courses",
    component: Courses,
    meta: { title: "Courses" }
  },
  {
    path: "/assignments",
    name: "Assignments",
    component: Assignments,
    meta: { title: "Assignments" }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    // Always go to top on navigation
    return { top: 0 };
  }
});

// Auto-update document titles
router.afterEach((to) => {
  if (to.meta?.title) {
    document.title = `StudyFlow — ${to.meta.title}`;
  }
});

export default router;
