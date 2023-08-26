import "./navbar.css"
// @ts-ignore TS doesn't like importing assets like this
import aurigny from "../../assets/aurigny.png"
import { IoMdArrowDropdown } from "react-icons/io"

function Navbar({ activePage }: { activePage?: string }) {
    return (
        <div className="navbar">
            <div className="container content">
                <div className="brand">
                    <img height="60px" src={aurigny} alt="Aurigny Logo" />
                </div>
                <div className="controls">
                    <ul className="nav-items">
                        <li>
                            <a
                                href="#/"
                                className={`nav-link ${activePage === "home" && "active"}`}
                            >
                                Home
                            </a>
                        </li>
                        <li>
                            <span className={`nav-link dropdown ${activePage === "" && "active"}`}>
                                <span>
                                    Management <IoMdArrowDropdown />
                                </span>
                                <div className="dropdown-content">
                                    <a href="#/issuers">Issuers</a>
                                    <a href="#/vouchers">Vouchers</a>
                                </div>
                            </span>
                        </li>
                        <li>
                            <a
                                href="#/settings"
                                className={`nav-link ${activePage === "settings" && "active"}`}
                            >
                                Settings
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default Navbar
