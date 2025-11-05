import { Schedule } from "@niloc/utils"

const Frame = Schedule.frame()
const AfterFrame = Schedule.after(Frame)

export const Schedules = {
    Frame,
    AfterFrame
}