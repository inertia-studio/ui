<script setup lang="ts">
import { computed, ref } from 'vue';
import { cn } from '../../../../shared/utils/cn';
import type { ImageUploadFieldSchema } from '../../../../shared/types/schema';

interface Props {
    schema: ImageUploadFieldSchema;
    value: unknown;
    error?: string | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{ change: [value: unknown] }>();

const dragging = ref(false);
const uploading = ref(false);
const uploadProgress = ref(0);
const inputRef = ref<HTMLInputElement | null>(null);

function getUploadUrl(): string {
    const path = window.location.pathname;
    const parts = path.split('/').filter(Boolean);
    return '/' + parts[0] + '/upload';
}

const currentImage = computed(() => (typeof props.value === 'string' && props.value ? props.value : null));
const imageUrl = computed(() => (currentImage.value ? `/storage/${currentImage.value}` : null));

const accept = computed(() =>
    props.schema.acceptedFileTypes?.length > 0 ? props.schema.acceptedFileTypes.join(',') : 'image/*',
);

async function uploadFile(file: File) {
    uploading.value = true;
    uploadProgress.value = 0;

    const formData = new FormData();
    formData.append('file', file);
    try {
        const xhr = new XMLHttpRequest();
        const url = getUploadUrl();
        const result = await new Promise<{ path: string; url: string }>((resolve, reject) => {
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) uploadProgress.value = Math.round((e.loaded / e.total) * 100);
            });
            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) resolve(JSON.parse(xhr.responseText));
                else reject(new Error('Upload failed'));
            });
            xhr.addEventListener('error', () => reject(new Error('Upload failed')));
            xhr.open('POST', url);
            xhr.setRequestHeader('Accept', 'application/json');
            const csrfMeta = document.querySelector('meta[name="csrf-token"]');
            const csrfCookie = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
            if (csrfMeta) xhr.setRequestHeader('X-CSRF-TOKEN', csrfMeta.getAttribute('content') ?? '');
            else if (csrfCookie) xhr.setRequestHeader('X-XSRF-TOKEN', decodeURIComponent(csrfCookie[1]));
            xhr.withCredentials = true;
            xhr.send(formData);
        });
        emit('change', result.path);
    } catch (err) {
        console.error('Upload failed:', err);
    } finally {
        uploading.value = false;
        uploadProgress.value = 0;
    }
}

function handleFiles(fileList: FileList) {
    const file = fileList[0];
    if (file) uploadFile(file);
}

function handleDragOver(e: DragEvent) {
    e.preventDefault();
    dragging.value = true;
}
function handleDragLeave() {
    dragging.value = false;
}
function handleDrop(e: DragEvent) {
    e.preventDefault();
    dragging.value = false;
    if (e.dataTransfer?.files.length) handleFiles(e.dataTransfer.files);
}
function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.files) handleFiles(target.files);
}
</script>

<template>
    <div>
        <div v-if="currentImage && !uploading" class="relative group inline-block">
            <img
                :src="imageUrl!"
                alt="Featured image"
                :class="cn(
                    'rounded-xl border border-s-border object-cover',
                    schema.cropAspectRatio === '1:1' ? 'w-32 h-32' : 'w-full max-w-xs h-48',
                )"
            />
            <div class="absolute inset-0 rounded-xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                    type="button"
                    class="px-3 py-1.5 rounded-lg bg-white/90 text-sm font-medium text-gray-900 hover:bg-white transition-colors"
                    @click="inputRef?.click()"
                >Replace</button>
                <button
                    type="button"
                    class="px-3 py-1.5 rounded-lg bg-red-500/90 text-sm font-medium text-white hover:bg-red-500 transition-colors"
                    @click="emit('change', null)"
                >Remove</button>
            </div>
        </div>
        <div
            v-else
            :class="cn(
                'flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 cursor-pointer transition-colors',
                dragging ? 'border-s-accent bg-s-accent/5' : 'border-s-border hover:border-s-border-strong',
                error && 'border-red-500',
                schema.disabled && 'opacity-50 cursor-not-allowed',
            )"
            @dragover="handleDragOver"
            @dragleave="handleDragLeave"
            @drop="handleDrop"
            @click="() => !schema.disabled && inputRef?.click()"
        >
            <svg class="w-10 h-10 text-s-text-faint mb-3" fill="none" viewBox="0 0 24 24" :stroke-width="1.25" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
            </svg>
            <p class="text-sm text-s-text-secondary">
                Drop an image here, or <span class="text-s-accent font-medium">browse</span>
            </p>
            <p class="text-xs text-s-text-faint mt-1">
                {{ schema.acceptedFileTypes?.join(', ') || 'JPG, PNG, WebP' }}
                <template v-if="schema.maxSize"> · Max {{ Math.round(schema.maxSize / 1024) }}MB</template>
            </p>
        </div>

        <div v-if="uploading" class="mt-3 rounded-lg bg-s-surface-alt p-3">
            <div class="flex items-center justify-between text-xs text-s-text-muted mb-1.5">
                <span>Uploading image...</span>
                <span>{{ uploadProgress }}%</span>
            </div>
            <div class="h-1.5 rounded-full bg-s-border overflow-hidden">
                <div class="h-full bg-s-accent rounded-full transition-all duration-200" :style="{ width: `${uploadProgress}%` }" />
            </div>
        </div>

        <input
            ref="inputRef"
            type="file"
            :accept="accept"
            class="hidden"
            :disabled="schema.disabled"
            @change="handleInput"
        />
    </div>
</template>
