import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';

export function LoadingBar() {
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;

        const startHandler = () => {
            setLoading(true);
            setProgress(10);
            interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 90) return prev;
                    return prev + (90 - prev) * 0.1;
                });
            }, 100);
        };

        const finishHandler = () => {
            setProgress(100);
            clearInterval(interval);
            setTimeout(() => {
                setLoading(false);
                setProgress(0);
            }, 200);
        };

        const removeStart = router.on('start', startHandler);
        const removeFinish = router.on('finish', finishHandler);

        return () => {
            removeStart();
            removeFinish();
            clearInterval(interval);
        };
    }, []);

    if (!loading && progress === 0) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[200] h-0.5">
            <div
                className="h-full bg-s-accent transition-all duration-200 ease-out"
                style={{ width: `${progress}%`, opacity: progress >= 100 ? 0 : 1 }}
            />
        </div>
    );
}
