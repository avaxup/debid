import { Box, Card } from "rimble-ui"
import Navbar from "../components/Navbar"



const InstallMetamaskPage = () => {

    return (
        <main>
            <Box style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "70vh",
            }}>
                <Card>
                    Activate the MetaMask browser extension to use our blockchain features in your current browser.
                    <span onClick={() => window.location.reload() }>Or Click To Refresh</span>
                </Card>
            </Box>
        </main>
    )

}

export default InstallMetamaskPage