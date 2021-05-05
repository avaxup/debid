import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { Box, Button, EthAddress, Field, Flex, Heading, Image, Input, Text } from 'rimble-ui'

const ShowPage = ({ web3, myAccount, myBalance, contract }) => {


  const { id } = useParams("id")

  console.log(id)





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

  const [bid, setBid] = useState("")

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
        let start = res[8] ? res[8] : null
        let end = res[9] ? res[9] : null
        setTotalBidCount(res[10] ? res[10] : null)
        setHighestBid(res[11] ? res[11] : null)



        if (start) {
          let startDate = new Date();
          startDate.setTime(Number(start) * 1000);
          setStartTime(startDate.toUTCString())

        }
        if (end) {
          let endDate = new Date();
          endDate.setTime(Number(end) * 1000);
          setEndTime(endDate.toUTCString())
        }

      }

    })()

    return () => {

    }
  }, [id,])



  const handlePlaceABid = async () => {
    try {

      console.log(
        await contract.methods.bid(id).call({
          from: myAccount,
          value: web3.utils.toWei(bid),
          gas: 3000000,
          gasPrice: 470000000000,
          to: contract._address,
          contractAddress: contract._address,
        })
      )
      console.log(
        await contract.methods.bid(id).send({
          from: myAccount,
          value: web3.utils.toWei(bid),
          gas: 3000000,
          gasPrice: 470000000000,
          to: contract._address,
          contractAddress: contract._address,
        })
      )

      window.location.reload()

    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <main style={{
      display: "flex",
      alignItems: "center",
      flexDirection: "column",
      padding: "0 50px"
    }}>

      <Box mt={5} style={{
        width: "80%"
      }}>
        <Flex justifyContent="space-between">

          <Flex
            style={{
              width: "40%",
              maxHeight: "70vh"
            }}
          >
            <Image
              width={1}
              src={imagePath}
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/500C"
              }}
            />
          </Flex>

          <Flex
            style={{
              width: "40%"
            }}
            flexDirection="column" mb={5}>

            <Heading>{title}</Heading>
            <Text mt={2}>Creator: {ownerName}</Text>
            <Text mt={4} style={{
              width: "90%"
            }}>
              {description}
            </Text>

            <Field mt={4} label="Owner Address">
              <EthAddress required={true} address={owner} />
            </Field>


            <Field mt={4} label="Finishing">
              <Text required={true}> {endTime} </Text>
            </Field>

            <Field mt={4}>
              <Text required={true}><span style={{ fontWeight: "bold" }}>Highest Bid:</span> {highestBid && highestBid.amount && web3.utils.fromWei(highestBid.amount)} AVAX</Text>
              <Text required={true}><span style={{ fontWeight: "bold" }}>Starting Price:</span> {web3.utils.fromWei(startPrice)} AVAX</Text>
            </Field>


            <Flex justifyContent="space-between">
              <Flex width={"40%"}>
                <Input
                  width={"100%"}
                  type="number"
                  required={true}
                  placeholder="e.g. Portrra"
                  value={bid}
                  onChange={(e) => setBid(e.target.value)}
                />
              </Flex>
              <Flex  width={"40%"}>
                <Button onClick={handlePlaceABid} >Place A Bid</Button>
              </Flex>
            </Flex>


          </Flex>
        </Flex>
      </Box>

    </main>
  )

}

export default ShowPage