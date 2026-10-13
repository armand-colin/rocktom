import { useEffect } from "react";

export function useWakeLock(enabled = true) {

    useEffect(() => {
        if (!enabled || !navigator.wakeLock) {
            return;
        }

        const waveLockPromise = navigator.wakeLock.request('screen')

        return () => {
            waveLockPromise
                .then(lock => {
                    lock.release()
                })
        }
    }, [enabled])

}