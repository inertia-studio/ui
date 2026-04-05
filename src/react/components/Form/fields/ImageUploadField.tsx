import { useCallback, useRef, useState, type DragEvent } from 'react';
import { cn } from '../../../../shared/utils/cn';
import type { ImageUploadFieldSchema } from '../../../../shared/types/schema';

interface ImageUploadFieldProps {
    schema: ImageUploadFieldSchema;
    value: unknown;
    onChange: (value: unknown) => void;
    error?: string | null;
}

function getUploadUrl(): string {
    const path = window.location.pathname;
    const parts = path.split('/').filter(Boolean);
    return '/' + parts[0] + '/upload';
}

export function ImageUploadField({ schema, value, onChange, error }: ImageUploadFieldProps) {
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    // Value is a string path or null
    const currentImage = typeof value === 'string' && value ? value : null;
    const imageUrl = currentImage ? `/storage/${currentImage}` : null;

    const uploadFile = useCallback(async (file: File) => {
        setUploading(true);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const xhr = new XMLHttpRequest();
            const url = getUploadUrl();

            const result = await new Promise<{ path: string; url: string }>((resolve, reject) => {
                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
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

            onChange(result.path);
        } catch (err) {
            console.error('Upload failed:', err);
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    }, [onChange]);

    const handleFiles = useCallback((fileList: FileList) => {
        const file = fileList[0];
        if (file) uploadFile(file);
    }, [uploadFile]);

    const handleDragOver = (e: DragEvent) => { e.preventDefault(); setDragging(true); };
    const handleDragLeave = () => setDragging(false);
    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
    };

    const accept = schema.acceptedFileTypes?.length > 0
        ? schema.acceptedFileTypes.join(',')
        : 'image/*';

    return (
        <div>
            {/* Preview or Drop Zone */}
            {currentImage && !uploading ? (
                <div className="relative group inline-block">
                    <img
                        src={imageUrl!}
                        alt="Featured image"
                        className={cn(
                            'rounded-xl border border-s-border object-cover',
                            schema.cropAspectRatio === '1:1' ? 'w-32 h-32' : 'w-full max-w-xs h-48',
                        )}
                    />
                    <div className="absolute inset-0 rounded-xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            className="px-3 py-1.5 rounded-lg bg-white/90 text-sm font-medium text-gray-900 hover:bg-white transition-colors"
                        >
                            Replace
                        </button>
                        <button
                            type="button"
                            onClick={() => onChange(null)}
                            className="px-3 py-1.5 rounded-lg bg-red-500/90 text-sm font-medium text-white hover:bg-red-500 transition-colors"
                        >
                            Remove
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => !schema.disabled && inputRef.current?.click()}
                    className={cn(
                        'flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 cursor-pointer transition-colors',
                        dragging ? 'border-s-accent bg-s-accent/5' : 'border-s-border hover:border-s-border-strong',
                        error && 'border-red-500',
                        schema.disabled && 'opacity-50 cursor-not-allowed',
                    )}
                >
                    <svg className="w-10 h-10 text-s-text-faint mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.25} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                    </svg>
                    <p className="text-sm text-s-text-secondary">
                        Drop an image here, or <span className="text-s-accent font-medium">browse</span>
                    </p>
                    <p className="text-xs text-s-text-faint mt-1">
                        {schema.acceptedFileTypes?.join(', ') || 'JPG, PNG, WebP'}
                        {schema.maxSize && ` · Max ${Math.round(schema.maxSize / 1024)}MB`}
                    </p>
                </div>
            )}

            {/* Upload progress */}
            {uploading && (
                <div className="mt-3 rounded-lg bg-s-surface-alt p-3">
                    <div className="flex items-center justify-between text-xs text-s-text-muted mb-1.5">
                        <span>Uploading image...</span>
                        <span>{uploadProgress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-s-border overflow-hidden">
                        <div className="h-full bg-s-accent rounded-full transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                    </div>
                </div>
            )}

            <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
                disabled={schema.disabled}
            />
        </div>
    );
}
