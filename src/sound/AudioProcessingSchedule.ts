import { Duration, Schedule } from "@niloc/utils";

export const AudioProcessingSchedule = Schedule.interval(Duration.fromSeconds(1 / 30))
export const AudioPreProcessingSchedule = Schedule.before(AudioProcessingSchedule)