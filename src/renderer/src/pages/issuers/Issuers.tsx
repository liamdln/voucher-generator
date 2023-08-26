import { useEffect, useState } from "react"
import Navbar from "../../components/Navbar/Navbar"
import "./issuers.css"
import "../../components/Buttons/buttons.css"
import Button from "../../components/Buttons/Button"
import Modal from "../../components/Modal/Modal"
import { Issuer } from "../../../../types/issuer"

const emptyIssuer: Issuer = { name: "", initials: "", voucher_count: 0 }

function Issuers() {
    const [issuers, setIssuers] = useState<Issuer[]>([])
    const [checkedIssuers, setCheckedIssuers] = useState<{ [key: string]: Issuer }>({})
    const [newIssuer, setNewIssuer] = useState(structuredClone(emptyIssuer))

    const [showAddModal, setShowAddModal] = useState(false)
    const [showRemoveModal, setShowRemoveModal] = useState(false)
    const [showErrorModal, setShowErrorModal] = useState(false)

    const [removeButtonDisabled, setRemoveButtonDisabled] = useState(true)

    // get the issuers
    useEffect(() => {
        let isIssuersGetSubscribed = true;
        window.api
            .getAllIssuers()
            .then((res: Issuer[]) => {
                if (isIssuersGetSubscribed) {
                    setIssuers(res)
                }
            })
            .catch((err) => {
                console.error(err)
                setShowErrorModal(true)
            })
        return () => {
            // cleanup
            isIssuersGetSubscribed = false;
        }
    }, [])

    // create a new issuer
    const postNewIssuer = () => {
        if (!newIssuer.name || !newIssuer.initials) {
            setShowAddModal(true)
            return
        }
        newIssuer.initials = newIssuer.initials.toUpperCase()
        window.api
            .addIssuer(newIssuer)
            .then((res: Issuer) => {
                setShowAddModal(false)
                if (res.name && res.initials) {
                    setIssuers([
                        ...issuers,
                        { name: res.name, initials: res.initials, voucher_count: 0 }
                    ])
                }
                resetNewIssuerForm()
            })
            .catch((err) => {
                setShowErrorModal(true)
                console.error(err)
            })
    }

    // remove an issuer
    const removeSelected = () => {
        const issuersToRemove = Object.values(checkedIssuers)
        const issuerInitials = issuersToRemove.map((issuer) => issuer.initials)

        window.api
            .removeIssuer(issuersToRemove)
            .then((_) => {
                const remainingIssuers: Issuer[] = []
                for (const issuer of issuers) {
                    if (!issuerInitials.includes(issuer.initials)) {
                        remainingIssuers.push(issuer)
                    }
                }
                setIssuers(remainingIssuers)
                setShowRemoveModal(false)
                resetCheckedIssuers()
            })
            .catch((err) => {
                setShowErrorModal(true)
                console.error(err)
            })
    }

    // watch the checked issuers
    const handleCheckChange = (index: number) => {
        if (Object.keys(checkedIssuers).includes(index.toString())) {
            delete checkedIssuers[index.toString()]
        } else {
            checkedIssuers[index.toString()] = issuers[index]
        }
        setCheckedIssuers(checkedIssuers)
        setRemoveButtonDisabled(Object.keys(checkedIssuers).length < 1)
    }

    // reset the new issuer form
    const resetNewIssuerForm = () => {
        setNewIssuer(structuredClone(emptyIssuer))
    }

    // reset the checked issuers
    const resetCheckedIssuers = () => {
        setCheckedIssuers({})
    }

    return (
        <>
            <Navbar activePage="issuers" />
            <div className="container">
                <div>
                    <h1>Issuers</h1>
                </div>
                <div className="issuer-controls">
                    <Button
                        className="primary-button issuer-control-button"
                        onClick={() => setShowAddModal(true)}
                    >
                        Add Issuer
                    </Button>
                    <Button
                        disabled={removeButtonDisabled}
                        className="secondary-button issuer-control-button"
                        onClick={() => setShowRemoveModal(true)}
                    >
                        Remove Selected
                    </Button>
                </div>
                {issuers.length > 0 ? (
                    <div className="table-container">
                        <table cellSpacing="0">
                            <thead>
                                <tr>
                                    <th scope="col"></th>
                                    <th scope="col">Name</th>
                                    <th scope="col">Initials</th>
                                    <th scope="col">Vouchers Issued</th>
                                </tr>
                            </thead>
                            <tbody>
                                {issuers.map((issuer: Issuer, index: number) => {
                                    return (
                                        <tr key={index}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    onChange={() => handleCheckChange(index)}
                                                />
                                            </td>
                                            <td>{issuer.name}</td>
                                            <td>{issuer.initials}</td>
                                            <td>{issuer.voucher_count}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                            <thead>
                                <tr>
                                    <th scope="col"></th>
                                    <th scope="col">Name</th>
                                    <th scope="col">Initials</th>
                                    <th scope="col">Vouchers Issued</th>
                                </tr>
                            </thead>
                        </table>
                    </div>
                ) : (
                    <div>
                        <em>No issuers added.</em>
                    </div>
                )}
            </div>
            <Modal show={showAddModal}>
                <div>
                    <div>
                        <h1 style={{ margin: "0 0 0.5rem 0" }}>Add an Issuer</h1>
                    </div>
                    <div>
                        <form style={{ display: "flex", gap: "1rem" }}>
                            <label>
                                <span>Name</span>
                                <input
                                    type="text"
                                    value={newIssuer.name}
                                    onChange={(e) =>
                                        setNewIssuer({ ...newIssuer, name: e.target.value })
                                    }
                                />
                                <span className="input-hint">Name is required</span>
                            </label>
                            <label>
                                <span>Initials</span>
                                <input
                                    type="text"
                                    value={newIssuer.initials}
                                    onChange={(e) =>
                                        setNewIssuer({ ...newIssuer, initials: e.target.value })
                                    }
                                />
                                <span className="input-hint">Initials are required</span>
                            </label>
                        </form>
                    </div>
                    <div style={{ marginTop: "0.5rem" }}>
                        <div
                            style={{
                                display: "flex",
                                gap: "0.5rem",
                                justifyContent: "end",
                                width: "100%"
                            }}
                        >
                            <Button
                                className="primary-button"
                                disabled={!newIssuer.name || !newIssuer.initials}
                                onClick={() => {
                                    postNewIssuer()
                                }}
                            >
                                Add
                            </Button>
                            <Button
                                className="secondary-button"
                                onClick={() => {
                                    resetNewIssuerForm()
                                    setShowAddModal(false)
                                }}
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
            <Modal show={showRemoveModal}>
                <div>
                    <div>
                        <h1 style={{ margin: "0 0 0.5rem 0" }}>Remove an Issuer</h1>
                    </div>
                    <div>
                        <p>Are you sure you want to remove the following issuers?</p>
                        <ul>
                            {Object.values(checkedIssuers).map((issuer: Issuer, index: number) => {
                                return (
                                    <li key={index}>
                                        {issuer.name} ({issuer.initials})
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                    <div style={{ marginTop: "0.5rem" }}>
                        <div
                            style={{
                                display: "flex",
                                gap: "0.5rem",
                                justifyContent: "end",
                                width: "100%"
                            }}
                        >
                            <Button className="secondary-button" onClick={() => removeSelected()}>
                                Remove
                            </Button>
                            <Button
                                className="neutral-button"
                                onClick={() => setShowRemoveModal(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
            <Modal show={showErrorModal} type={"error"}>
                <div>
                    <div>
                        <h1 style={{ margin: "0 0 0.5rem 0" }}>An Error Occurred!</h1>
                    </div>
                    <div>Something went wrong while trying to perform the requested action.</div>
                    <div style={{ marginTop: "0.5rem" }}>
                        <div
                            style={{
                                display: "flex",
                                gap: "0.5rem",
                                justifyContent: "end",
                                width: "100%"
                            }}
                        >
                            <Button
                                className="ghost-button"
                                onClick={() => setShowErrorModal(false)}
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    )
}

export default Issuers
