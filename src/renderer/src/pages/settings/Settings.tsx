import Button from "../../components/Buttons/Button"
import Navbar from "../../components/Navbar/Navbar"
import "../../components/Buttons/buttons.css"
import { useEffect, useState } from "react"
import { Config } from "../../../../types/config"
import Modal from "../../components/Modal/Modal"

function Settings() {
    const [settingsDir, setSettingsDir] = useState("")
    const [localConfig, setConfig] = useState<Config>()
    const [showErrorModal, setShowErrorModal] = useState(false)

    // get the settings
    useEffect(() => {
        let isConfigGetSubscribed = true;
        window.api.getConfig().then((res: string) => {
            if (isConfigGetSubscribed) {
                try {
                    const config: Config = JSON.parse(res)
                    setSettingsDir(config.outputDir)
                    setConfig(config)
                } catch (e) {
                    setSettingsDir("Could not determine file location.")
                }
            }
        })
        return () => {
            // cleanup
            isConfigGetSubscribed = false;
        }
    }, [])

    // set a new directory
    const setNewDir = () => {
        if (!localConfig) {
            setShowErrorModal(true)
            return
        }

        // open the dialog and get a new directory
        window.api
            .getNewDir()
            .then((res) => {
                // save the new config
                window.api
                    .setConfig(JSON.stringify({ ...localConfig, outputDir: res[0] }))
                    .then((newConfig) => {
                        const config: Config = JSON.parse(newConfig.content)

                        //set the new config
                        setConfig(config)

                        // reset the setting value on the frontend
                        setSettingsDir(config.outputDir)
                    })
                    .catch((err) => {
                        throw err
                    })
            })
            .catch((err) => {
                console.error(err)
                setShowErrorModal(true)
            })
    }

    return (
        <>
            <Navbar activePage="settings" />
            <div className="container">
                <h1 style={{ margin: "0 0 0.5rem 0" }}>Settings</h1>
                <span>Voucher Output Location</span>
                <p>
                    <em>{settingsDir}</em>
                </p>
                <Button className="primary-button" onClick={() => setNewDir()}>
                    Change
                </Button>
            </div>
            <Modal show={showErrorModal} type={"error"}>
                <div>
                    <div>
                        <h1 style={{ margin: "0 0 0.5rem 0" }}>An Error Occurred!</h1>
                    </div>
                    <div>An error occurred while changing your settings.</div>
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
                                onClick={() => {
                                    setShowErrorModal(false)
                                }}
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

export default Settings
