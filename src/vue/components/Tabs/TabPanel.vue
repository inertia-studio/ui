<script setup lang="ts">
defineProps<{ active: boolean }>();
</script>

<template>
    <div v-if="active" role="tabpanel">
        <slot />
    </div>
</template>
