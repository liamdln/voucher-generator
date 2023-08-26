import React from "react"
import ReactDOM from "react-dom/client"
import Home from "./home"
import "./global.css"
import { createHashRouter, RouterProvider } from "react-router-dom"
import Issuers from "./pages/issuers/Issuers"
import Settings from "./pages/settings/Settings"
import Vouchers from "./pages/vouchers/vouchers"

// router
const router = createHashRouter([
    {
        path: "/",
        element: <Home />
    },
    {
        path: "/issuers",
        element: <Issuers />
    },
    {
        path: "/settings",
        element: <Settings />
    },
    {
        path: "/vouchers",
        element: <Vouchers />
    }
])

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
)
