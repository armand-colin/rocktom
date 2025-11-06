import { Duration, Schedule } from "@niloc/utils"

const Frame = Schedule.frame()
const AfterFrame = Schedule.after(Frame)

const AudioProcessingSchedule = Schedule.interval(Duration.fromSeconds(1 / 30))
const AudioPreProcessingSchedule = Schedule.before(AudioProcessingSchedule)
const AudioPostProcessingSchedule = Schedule.after(AudioProcessingSchedule)

export const Schedules = {
    Frame,
    AfterFrame,
    AudioProcessingSchedule,
    AudioPreProcessingSchedule,
    AudioPostProcessingSchedule
}