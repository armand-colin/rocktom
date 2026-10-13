import { useEffect, useState, type ReactNode } from "react"
import "./Stepper.scss"
import { cn } from "../utils/cn"

const ANIMATION_TIMEOUT_MS = 1000

export function Stepper<K extends string | number = string | number>(props: {
    step: K,
    steps: Array<{ step: K, render: () => ReactNode }>,
    className?: string,
    stepClassName?: string,
}) {
    const [oldStep, setOldStep] = useState<K | null>(null)
    const [direction, setDirection] = useState<"left" | "right" | null>(null)
    const [transitionning, setTransitionning] = useState(false)

    const CurrentStep = props.steps.find(step => step.step === props.step)?.render ?? null
    const OldStep = oldStep === null ? null : props.steps.find(step => step.step === oldStep)?.render ?? null

    useEffect(() => {
        return () => {
            setOldStep(props.step)
        }
    }, [props.step])

    useEffect(() => {
        if (oldStep === null)
            return;

        const stepIndex = props.steps.findIndex(step => step.step === oldStep)
        const oldStepIndex = props.steps.findIndex(step => step.step === props.step)

        if (stepIndex < oldStepIndex) {
            setDirection("left")
        } else {
            setDirection("right")
        }

        setTransitionning(true)

        const animation = setTimeout(() => {
            setTransitionning(false)
        }, ANIMATION_TIMEOUT_MS)

        return () => {
            clearTimeout(animation)
        }
    }, [oldStep])

    return <div
        className={cn("Stepper", props.className)}
        data-transitionning={transitionning}
        data-direction={direction}
    >
        {
            CurrentStep ? <div
                data-current={true}
                className={props.stepClassName}
            >
                <CurrentStep />
            </div> :
                <p>Step not found</p>
        }
        {
            transitionning && OldStep ? <div
                data-current={false}
                className={props.stepClassName}
            >
                <OldStep />
            </div> :
                null
        }
    </div>
}