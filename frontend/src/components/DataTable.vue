<template>
  <table class="table">
    <thead>
      <tr>
        <th
          v-for="(col, index) in columns"
          :key="index"
          @click="sort(col.key)"
          class="sortable"
        >
          {{ col.label }}
          <span v-if="sortKey === col.key">
            {{ sortDir === 'asc' ? '▲' : '▼' }}
          </span>
        </th>
        <th v-if="actions">Actions</th>
      </tr>
    </thead>

    <tbody>
      <tr v-for="row in sortedRows" :key="row.id">
        <td v-for="col in columns" :key="col.key">
          {{ row[col.key] ?? '—' }}
        </td>

        <td v-if="actions">
          <button @click="$emit('edit', row)" class="secondary">Edit</button>
          <button @click="$emit('delete', row)" class="dang
