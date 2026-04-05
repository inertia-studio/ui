import { useCallback, useRef, useState, type DragEvent } from 'react';
import { cn } from '../../../../shared/utils/cn';
import type { FileUploadFieldSchema } from '../../../../shared/types/schema';

interface FileUploadFieldProps {
    schema: FileUploadFieldSchema;
    value: unknown;
    onChange: (value: unknown) => void;
    error?: string | null;
}

interface UploadedFile {
    path: string;
    url: string;
    name: string;
    size: number;
}

function getUploadUrl(): string {
    // Construct from current URL — /admin/upload
    const path = window.location.pathname;
    const parts = path.split('/').filter(Boolean);
    // Panel path is first segment(s) before the module
    return '/' + parts[0] + '/upload';
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export function FileUploadField({ schema, value, onChange, error }: FileUploadFieldProps) {
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    // Value can be a string (path), array of strings, or UploadedFile objects
    const files: UploadedFile[] = Array.isArray(value)
        ? (value as UploadedFile[])
        : value && typeof value === 'object' && 'path' in (value as Record<string, unknown>)
            ? [value as UploadedFile]
            : value && typeof value === 'string'
                ? [{ path: value as string, url: '', name: (value as string).split('/').pop() ?? '', size: 0 }]
                : [];

    const uploadFile = useCallback(async (file: File) => {
        setUploading(true);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('file', file);
        if (schema.uploadUrl) {
            // Use configured URL
        }

        try {
            const xhr = new XMLHttpRequest();
            const url = getUploadUrl();

            const result = await new Promise<UploadedFile>((resolve, reject) => {
                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable) {
                        setUploadProgress(Math.round((e.loaded / e.total) * 100));
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

                // Get CSRF token
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

            if (schema.multiple) {
                onChange([...files, result]);
            } else {
                onChange(result.path);
            }
        } catch (err) {
            console.error('Upload failed:', err);
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    }, [schema, files, onChange]);

    const handleFiles = useCallback((fileList: FileList) => {
        const fileArray = Array.from(fileList);
        fileArray.forEach(f => uploadFile(f));
    }, [uploadFile]);

    const handleDragOver = (e: DragEvent) => { e.preventDefault(); setDragging(true); };
    const handleDragLeave = () => setDragging(false);
    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
    };

    const handleRemove = useCallback((index: number) => {
        if (schema.multiple) {
            const updated = files.filter((_, i) => i !== index);
            onChange(updated.length > 0 ? updated : null);
        } else {
            onChange(null);
        }
    }, [files, schema.multiple, onChange]);

    return (
        <div>
            {/* Drop zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={cn(
                    'relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 cursor-pointer transition-colors',
                    dragging ? 'border-s-accent bg-s-accent/5' : 'border-s-border hover:border-s-border-strong',
                    error && 'border-red-500',
                )}
            >
                <svg className="w-8 h-8 text-s-text-faint mb-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                </svg>
                <p className="text-sm text-s-text-secondary">
                    Drop files here, or <span className="text-s-accent font-medium">browse</span>
                </p>
                {schema.acceptedFileTypes?.length > 0 && (
                    <p className="text-xs text-s-text-faint mt-1">
                        {schema.acceptedFileTypes.join(', ')}
                        {schema.maxSize && ` · Max ${formatFileSize(schema.maxSize * 1024)}`}
                    </p>
                )}

                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    multiple={schema.multiple}
                    accept={schema.acceptedFileTypes?.join(',')}
                    onChange={(e) => e.target.files && handleFiles(e.target.files)}
                    disabled={schema.disabled}
                />
            </div>

            {/* Upload progress */}
            {uploading && (
                <div className="mt-2 rounded-lg bg-s-surface-alt p-3">
                    <div className="flex items-center justify-between text-xs text-s-text-muted mb-1">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                    </div>
                    <div className="h-1 rounded-full bg-s-border overflow-hidden">
                        <div className="h-full bg-s-accent transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                    </div>
                </div>
            )}

            {/* Uploaded files */}
            {files.length > 0 && (
                <div className="mt-2 space-y-1">
                    {files.map((file, i) => (
                        <div key={i} className="flex items-center gap-3 rounded-lg border border-s-border bg-s-surface px-3 py-2">
                            <svg className="w-4 h-4 text-s-text-faint shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                            </svg>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-s-text truncate">{file.name}</p>
                                {file.size > 0 && <p className="text-xs text-s-text-faint">{formatFileSize(file.size)}</p>}
                            </div>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleRemove(i); }}
                                className="p-1 rounded text-s-text-faint hover:text-red-500 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
