import { Box, Card } from "rimble-ui"

const ActivateMetamaskPage = () => {
    return (
        <main>
            <Box style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "70vh",
            }}>
                <Card>
                    Install the MetaMask browser extension to use our blockchain features in your current browser.
                    <span onClick={() => window.location.reload() }>Or Click To Refresh</span>
                </Card>
            </Box>
        </main>
    )
}

export default ActivateMetamaskPage