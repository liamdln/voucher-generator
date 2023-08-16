import { Job } from "../../types/job"

const jobs: Job[] = [];

export function addJob(jobId: string, totalPages: number) {
    jobs.push({ id: jobId, totalPages, completedPages: 0 })
}

export function getAllJobs() {
    return jobs;
}

export function getJobProgress(jobId: string) {
    return jobs.filter((job: Job) => job.id === jobId)
}

export function reportJobProgress(jobId: string, completedPages: number) {
    const jobIndex = jobs.findIndex((job: Job) => job.id === jobId)
    if (jobIndex < 0) {
        throw Error(`Job with ID ${jobId} not found.`);
    } else {
        jobs[jobIndex].completedPages = completedPages
    }
}
