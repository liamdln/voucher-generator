import { useEffect, useState } from "react"
import "./modal.css"

function Modal({
    show,
    children,
    type
}: {
    show: boolean
    children: React.ReactNode
    type?: "error" | "success"
}) {
    const [background, setBackground] = useState("")
    useEffect(() => {
        switch (type) {
            case "error":
                setBackground("error-modal")
                break
            case "success":
                setBackground("success-modal")
                break
            default:
                setBackground("")
                break
        }
        // no cleanup required
    }, [])

    return (
        <div hidden={!show}>
            <div className="modal-background">
                <div className={`modal-body ${background}`}>{children}</div>
            </div>
        </div>
    )
}

export default Modal
