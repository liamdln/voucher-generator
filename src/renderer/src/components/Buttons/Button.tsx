import "./buttons.css"

function Button({ className, children, onClick, disabled, type }: { className?: string, onClick?: any, children: React.ReactNode, disabled?: boolean, type?: "button" | "submit" | "reset" }) {
    return (
        <div>
            <button type={type || "button"} disabled={ disabled } className={className} onClick={() => onClick ? onClick() : null}>{children}</button>
        </div>
    )
}

export default Button