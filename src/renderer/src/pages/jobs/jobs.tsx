import Navbar from "@renderer/components/Navbar/Navbar";
import { Progress } from 'react-sweet-progress';
import Button from "@renderer/components/Buttons/Button";
import { useState, useEffect } from "react"
import "react-sweet-progress/lib/style.css";
import "./jobs.css"
import "../../components/Buttons/buttons.css"
import { Job } from "../../../../types/job";


export default function Jobs() {

    const [jobs, setJobs] = useState<Job[]>([])

    // get all jobs
    useEffect(() => {
        window.api.getAllJobs().then((res) => {
            console.log(jobs)
            setJobs(res)
        })
    }, [])

    const determineStatus = (currentPage: number, totalPages: number) => {
        if (currentPage < 1) {
            return "Not started"
        }
        if (currentPage > 0) {
            return "Generating"
        }
        if (currentPage === totalPages) {
            return "Complete"
        }
        return "Undetermined"
    }

    return (
        <>
            <Navbar />
            <div className="container">
                <h1 style={{ margin: "0 0 0.5rem 0" }}>Jobs</h1>
                <div className="jobs">
                    {/* <div className="card">
                        <div><h2>Job #12332</h2></div>
                        <div className="job-subtitle">
                            <span>Generated on 12/08/2023 by Mickey Champion for GR600.</span>
                            <span>Status: Generating</span>
                        </div>
                        <div><Progress percent={50} /></div>
                        <div className="btn-group" style={{ marginTop: "0.5rem" }}>
                            <Button className="primary-button">View Voucher</Button>
                            <Button className="neutral-button">Hide Job</Button>
                        </div>
                    </div> */}
                    {jobs.length < 1
                        ?
                        <em>No active jobs.</em>
                        :
                        jobs.map((job: Job) => {
                            return (
                                <div className="card" key={job.id}>
                                    <div><h2>Job #{job.id}</h2></div>
                                    <div className="job-subtitle">
                                        <span>Generated on ..date.. by ..creator.. for ..flightnum...</span>
                                        <span>Status: {determineStatus(job.completedPages, job.totalPages)}</span>
                                    </div>
                                    <div><Progress percent={Math.ceil(job.completedPages / job.totalPages)} /></div>
                                    <div className="btn-group" style={{ marginTop: "0.5rem" }}>
                                        <Button className="primary-button">View Voucher</Button>
                                        <Button className="neutral-button">Hide Job</Button>
                                    </div>
                                </div>
                            )
                        })}
                </div>
            </div>
        </>
    )
}
