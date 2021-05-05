import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Blockie, Flex, Heading, Icon, MetaMaskButton, Text, Tooltip } from 'rimble-ui'

const Navbar = ({ metamaskActive = false, web3, myAccount, myBalance }) => {
    const handleConnectMetamask = async () => {
        if (window.ethereum) {
            window.ethereum.enable()
        }
    }
    useEffect(() => {
        return () => {
        }
    }, [])
    return (
        <nav className="navbar">
            <Flex alignItems="center" justifyContent="space-between"
                style={{
                    padding: "0 30px",
                    flexWrap: "wrap",
                    alignItems: "center"
                }}
            >
                <Link to="/" style={{ color: "black", textDecoration: "none" }}>

                    <Flex alignItems="center">
                        <img src="/logo.jpg" alt="Logo" height="50px" />
                        <Heading>DeBid</Heading>
                    </Flex>
                </Link>


                {
                    !metamaskActive &&
                    <MetaMaskButton.Outline
                        onClick={handleConnectMetamask}
                    >Connect with MetaMask</MetaMaskButton.Outline>
                }

                {
                    metamaskActive &&
                    <Flex style={{
                        flexWrap: "wrap"

                    }}>
                        <Flex flexDirection="column">
                            <Text fontSize={1} color="silver" caps>
                                Balance
                            </Text>
                            <Tooltip message="You're on the right network">
                                <Flex>
                                    <Text mr={2}>{myBalance}</Text>
                                    <Icon name="CheckCircle" color="success" />
                                </Flex>
                            </Tooltip>
                        </Flex>
                        <Flex style={{
                        }}>
                            <Flex
                                ml={window.innerWidth < 768 ? 0 : 4}
                                mr={2}
                            >
                                <Blockie
                                    opts={{
                                        seed: "foo",
                                        color: "#dfe",
                                        bgcolor: "#a71",
                                        size: 15,
                                        scale: 3,
                                        spotcolor: "#000"
                                    }}
                                />
                            </Flex>
                            <Flex flexDirection="column">
                                <Text fontWeight="bold" caps>
                                    Connected
                        </Text>
                                <Tooltip message="You're on the right network">
                                    <Flex>
                                        <Text mr={2} >{myAccount}</Text>
                                    </Flex>
                                </Tooltip>
                            </Flex>
                        </Flex>
                    </Flex>
                }

            </Flex>
        </nav >
    )



}


export default Navbar