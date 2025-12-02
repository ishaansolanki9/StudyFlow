<template>
  <div class="layout">
    <!-- SIDEBAR -->
    <nav class="sidebar">
      <h1 class="logo">StudyFlow</h1>

      <div class="nav-links">
        <router-link to="/dashboard" class="nav-item">
          <span class="icon">📊</span>
          Dashboard
        </router-link>

        <router-link to="/courses" class="nav-item">
          <span class="icon">📚</span>
          Courses
        </router-link>

        <router-link to="/assignments" class="nav-item">
          <span class="icon">📝</span>
          Assignments
        </router-link>
      </div>
    </nav>

    <!-- MAIN VIEW -->
    <main class="main-view">
      <router-view />
    </main>
  </div>
</template>

<script setup>
</script>

<style scoped>
/* LAYOUT STRUCTURE */
.layout {
  display: flex;
  min-height: 100vh;
  background: #0f1624;
  color: white;
  overflow: hidden;
}

/* SIDEBAR */
.sidebar {
  width: 240px;
  background: #151d2d;
  padding: 28px 20px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
}

/* LOGO */
.logo {
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 35px;
  background: linear-gradient(135deg, #4cc2ff, #88e1ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* NAV LINKS */
.nav-links {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;

  padding: 12px 14px;
  border-radius: 10px;

  font-size: 1rem;
  text-decoration: none;
  color: #c9d4e3;

  transition: 0.15s ease;
}

/* ACTIVE LINK */
.nav-item.router-link-active {
  background: rgba(76, 194, 255, 0.18);
  color: #4cc2ff;
  font-weight: 600;
}

/* HOVER EFFECT */
.nav-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: white;
}

/* ICON */
.icon {
  font-size: 1.25rem;
}

/* MAIN VIEW */
.main-view {
  flex: 1;
  padding: 35px 40px;
  overflow-y: auto;
}
</style>
