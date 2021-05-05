import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Box, Button, Card, Flex, Heading, Image, Text } from "rimble-ui"


const IndexPage = ({ web3, myAccount, myBalance, contract }) => {


    const [auctions, setAuctions] = useState([])


    useEffect(() => {

        (async () => {
            try {
                const executeContract = await contract.methods.getAllAuctions().call()
                console.log(executeContract)
                setAuctions(executeContract)
            } catch (error) {
            }
        })()

        return () => {

        }
    }, [])


    const AuctionCard = ({ id }) => {

        const [owner, setOwner] = useState("")
        const [ownerName, setOwnerName] = useState("")
        const [title, setTitle] = useState("")
        const [description, setDescription] = useState("")
        const [imagePath, setImagePath] = useState("")
        const [startPrice, setStartPrice] = useState("")
        const [isActive, setIsActive] = useState("")
        const [startTime, setStartTime] = useState("")
        const [endTime, setEndTime] = useState("")
        const [totalBidCount, setTotalBidCount] = useState("")
        const [highestBid, setHighestBid] = useState("")


        useEffect(() => {
            (async () => {
                let res = await contract.methods.getAuctionDetails(id).call()
                console.log(res)

                if (res) {

                    setOwner(res[1] ? res[1] : null)
                    setOwnerName(res[2] ? res[2] : null)
                    setTitle(res[3] ? res[3] : null)
                    setDescription(res[4] ? res[4] : null)
                    setImagePath(res[5] ? res[5] : null)
                    setStartPrice(res[6] ? res[6] : null)
                    setIsActive(res[7] ? res[7] : null)
                    setStartTime(res[8] ? res[8] : null)
                    setEndTime(res[9] ? res[9] : null)
                    setTotalBidCount(res[10] ? res[10] : null)
                    setHighestBid(res[11] ? res[11] : null)
                }

            })()

            return () => {

            }
        }, [id])


        return (
            <Link to={`/show/${id}`} style={{ textDecoration: 'none', color: "black" }} >
                <Flex
                    style={{
                        width: "200px",
                        minHeight: "250px",
                        margin: "10px",
                    }}
                    flexDirection="column"
                >
                    <Image
                        src={imagePath}
                        width={1}
                        onError={(e) => {
                            e.target.src = "https://via.placeholder.com/150C"
                        }}
                    />

                    <h4>{title} #{id}</h4>

                    <Text>{ String(description).substring(0,50) + '...'  }</Text>

                </Flex>
            </Link>
        )


    }


    return (
        <main>

            <Flex justifyContent="space-evenly" mt={5}
                style={{
                    flexWrap: "wrap",
                    minHeight: "20vh",
                    alignItems: "center"
                }}
            >
                <Link to="/create">
                    <Button style={{ marginBottom: "10px", width: "250px" }}>
                        Create Aucting
                    </Button>
                </Link>

                {
                    /* <Link to="/show/:adres">
                        <Button style={{ marginBottom: "10px", width: "250px" }}>
                            Show Aucting
                    </Button>
                    </Link> */
                }

            </Flex>

            <Flex
                alignItems="center"
                flexDirection="column"
            >
                <Heading>Auctions</Heading>

                <Flex
                    justifyContent="flex-start"
                    flexWrap="wrap"
                    style={{
                        width: "90%"
                    }}
                >

                    {
                        auctions &&
                        auctions.map((val, i) => {
                            return <AuctionCard id={val} key={i} />
                        })
                    }

                    {/* <AuctionCard id={1} />
                    <AuctionCard id={1} />
                    <AuctionCard id={1} />
                    <AuctionCard id={1} />
                    <AuctionCard id={1} />
                    <AuctionCard id={1} />
                    <AuctionCard id={1} /> */}

                </Flex>
            </Flex>

        </main>

    )

}

export default IndexPage