import "./navbar.css"
// @ts-ignore
import aurigny from "../../assets/aurigny.png"

function Navbar({ activePage }: { activePage?: string }) {
    return (
        <div className="navbar">
            <div className="container content">
                <div className="brand">
                    <img height="60px" src={aurigny} alt="Aurigny Logo" />
                </div>
                <div className="controls">
                    <ul className="nav-items">
                        <li><a href="#/" className={`nav-link ${activePage === "home" && "active"}`}>Home</a></li>
                        <li><a href="#/issuers" className={`nav-link ${activePage === "issuers" && "active"}`}>Issuers</a></li>
                        <li><a href="#/settings" className={`nav-link ${activePage === "settings" && "active"}`}>Settings</a></li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default Navbar
