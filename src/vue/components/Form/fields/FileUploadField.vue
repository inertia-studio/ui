<script setup lang="ts">
import { computed, ref } from 'vue';
import { cn } from '../../../../shared/utils/cn';
import type { FileUploadFieldSchema } from '../../../../shared/types/schema';

interface UploadedFile {
    path: string;
    url: string;
    name: string;
    size: number;
}

interface Props {
    schema: FileUploadFieldSchema;
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

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

const files = computed<UploadedFile[]>(() => {
    const v = props.value;
    if (Array.isArray(v)) return v as UploadedFile[];
    if (v && typeof v === 'object' && 'path' in (v as Record<string, unknown>)) {
        return [v as UploadedFile];
    }
    if (typeof v === 'string') {
        return [{ path: v, url: '', name: v.split('/').pop() ?? '', size: 0 }];
    }
    return [];
});

async function uploadFile(file: File) {
    uploading.value = true;
    uploadProgress.value = 0;

    const formData = new FormData();
    formData.append('file', file);

    try {
        const xhr = new XMLHttpRequest();
        const url = getUploadUrl();
        const result = await new Promise<UploadedFile>((resolve, reject) => {
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    uploadProgress.value = Math.round((e.loaded / e.total) * 100);
                }
            });
            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    reject(new Error('Upload failed'));
                }
            });
            xhr.addEventListener('error', () => reject(new Error('Upload failed')));
            xhr.open('POST', url);
            xhr.setRequestHeader('Accept', 'application/json');
            const csrfMeta = document.querySelector('meta[name="csrf-token"]');
            const csrfCookie = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
            if (csrfMeta) {
                xhr.setRequestHeader('X-CSRF-TOKEN', csrfMeta.getAttribute('content') ?? '');
            } else if (csrfCookie) {
                xhr.setRequestHeader('X-XSRF-TOKEN', decodeURIComponent(csrfCookie[1]));
            }
            xhr.withCredentials = true;
            xhr.send(formData);
        });

        if (props.schema.multiple) {
            emit('change', [...files.value, result]);
        } else {
            emit('change', result.path);
        }
    } catch (err) {
        console.error('Upload failed:', err);
    } finally {
        uploading.value = false;
        uploadProgress.value = 0;
    }
}

function handleFiles(fileList: FileList) {
    Array.from(fileList).forEach((f) => uploadFile(f));
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

function handleRemove(index: number) {
    if (props.schema.multiple) {
        const updated = files.value.filter((_, i) => i !== index);
        emit('change', updated.length > 0 ? updated : null);
    } else {
        emit('change', null);
    }
}

function handleInputChange(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.files) handleFiles(target.files);
}
</script>

<template>
    <div>
        <div
            :class="cn(
                'relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 cursor-pointer transition-colors',
                dragging ? 'border-s-accent bg-s-accent/5' : 'border-s-border hover:border-s-border-strong',
                error && 'border-red-500',
            )"
            @dragover="handleDragOver"
            @dragleave="handleDragLeave"
            @drop="handleDrop"
            @click="inputRef?.click()"
        >
            <svg class="w-8 h-8 text-s-text-faint mb-2" fill="none" viewBox="0 0 24 24" :stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
            </svg>
            <p class="text-sm text-s-text-secondary">
                Drop files here, or <span class="text-s-accent font-medium">browse</span>
            </p>
            <p v-if="schema.acceptedFileTypes?.length" class="text-xs text-s-text-faint mt-1">
                {{ schema.acceptedFileTypes.join(', ') }}
                <template v-if="schema.maxSize"> · Max {{ formatFileSize(schema.maxSize * 1024) }}</template>
            </p>
            <input
                ref="inputRef"
                type="file"
                class="hidden"
                :multiple="schema.multiple"
                :accept="schema.acceptedFileTypes?.join(',')"
                :disabled="schema.disabled"
                @change="handleInputChange"
            />
        </div>

        <div v-if="uploading" class="mt-2 rounded-lg bg-s-surface-alt p-3">
            <div class="flex items-center justify-between text-xs text-s-text-muted mb-1">
                <span>Uploading...</span>
                <span>{{ uploadProgress }}%</span>
            </div>
            <div class="h-1 rounded-full bg-s-border overflow-hidden">
                <div class="h-full bg-s-accent transition-all duration-200" :style="{ width: `${uploadProgress}%` }" />
            </div>
        </div>

        <div v-if="files.length > 0" class="mt-2 space-y-1">
            <div
                v-for="(file, i) in files"
                :key="i"
                class="flex items-center gap-3 rounded-lg border border-s-border bg-s-surface px-3 py-2"
            >
                <svg class="w-4 h-4 text-s-text-faint shrink-0" fill="none" viewBox="0 0 24 24" :stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
                <div class="flex-1 min-w-0">
                    <p class="text-sm text-s-text truncate">{{ file.name }}</p>
                    <p v-if="file.size > 0" class="text-xs text-s-text-faint">{{ formatFileSize(file.size) }}</p>
                </div>
                <button
                    type="button"
                    class="p-1 rounded text-s-text-faint hover:text-red-500 transition-colors"
                    @click.stop="handleRemove(i)"
                >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" :stroke-width="2" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    </div>
</template>
