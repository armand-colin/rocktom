import { useEffect, useRef, useState, type ReactNode } from "react";
import { Spinner } from "../spinner/Spinner";
import './LoadingScreen.scss';

enum LoadingState {
    LOADING = "loading",
    LOADED = "loaded",
    DONE = "done"
}

export function LoadingScreen(props: { loading: boolean, children?: ReactNode }) {
    const [loadingState, setLoadingState] = useState(
        props.loading ? LoadingState.LOADING : LoadingState.DONE
    );
    const loadedTimeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (props.loading) {
            if (loadedTimeout.current) {
                clearTimeout(loadedTimeout.current);
                loadedTimeout.current = null;
            }

            setLoadingState(LoadingState.LOADING)
            return;
        }

        if (loadedTimeout.current !== null) {
            return;
        }

        setLoadingState(LoadingState.LOADED);

        loadedTimeout.current = setTimeout(() => {
            setLoadingState(LoadingState.DONE);
            loadedTimeout.current = null;
        }, 2000)
    }, [props.loading])

    useEffect(() => {
        return () => {
            if (loadedTimeout.current) {
                clearTimeout(loadedTimeout.current);
                loadedTimeout.current = null;
            }
        }
    }, [])

    return <>
        {props.children}
        {
            loadingState !== LoadingState.DONE ?
                <div
                    className="LoadingScreen"
                    data-state={loadingState}
                >
                    <p>Loading</p>
                    <Spinner />
                </div> :
                undefined
        }
    </>

}
