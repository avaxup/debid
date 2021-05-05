import React, { useState } from 'react'
import { useHistory } from 'react-router'
import { Box, Button, Field, Flex, Heading, Input, Textarea } from 'rimble-ui'

const CreatePage = ({ web3, myAccount, myBalance, contract }) => {
  let history = useHistory()


  const [_ownerName, set_ownerName] = useState("")        // string
  const [_title, set_title] = useState("")                // string
  const [_description, set_description] = useState("")    // string
  const [_imagePath, set_imagePath] = useState("")        // string
  const [_startPrice, set_startPrice] = useState("")      // int
  const [_endTime, set_endTime] = useState("")            // int


  const [endTimeInput, setEndTimeInput] = useState(false)


  const handleCreate = async () => {


    try {

      let estGas = await contract.methods.createAuction(
        _ownerName,
        _title,
        _description,
        _imagePath,
        _startPrice,
        _endTime,
      ).call({
        from: myAccount,
        to: contract._address,
        contractAddress: contract._address,
        gas: 3000000,
        gasPrice: 470000000000,
      })
      console.log(estGas)

      const executeCreate = await contract.methods.createAuction(
        _ownerName,
        _title,
        _description,
        _imagePath,
        _startPrice,
        _endTime,
      ).send({
        from: myAccount,
        to: contract._address,
        contractAddress: contract._address,
        gas: 3000000,
        gasPrice: 470000000000,
      })

      console.log(executeCreate)

      if(executeCreate) {

        alert("Success")

        history.push("/")

      }

    } catch (error) {
      alert("error.message")
      alert(error.message)
    }
  }


  return (
    <main style={{
      display: "flex",
      alignItems: "center",
      flexDirection: "column"
    }}>

      <Box style={{
      }}>
        <Flex flexDirection="column" mb={5}>

          <Heading mb={4}>Create Aucting</Heading>
          <Field label="Owner Name">
            <Input
              type="text"
              required={true}
              placeholder="John Doe"
              value={_ownerName}
              onChange={(e) => set_ownerName(e.target.value)}
            />
          </Field>
          <Field label="Title">
            <Input
              type="text"
              required={true}
              placeholder="e.g. Portrra"
              value={_title}
              onChange={(e) => set_title(e.target.value)}
            />
          </Field>
          <Field label="Description">
            <Textarea
              placeholder="e.g plane, razor, city, binoculars, district"
              rows={4}
              value={_description}
              onChange={(e) => set_description(e.target.value)}
            />
          </Field>

          <Field label="End Time">
            <Input
              type="date"
              style={{ width: "100%" }}
              required={true}
              placeholder="MM/DD/YYYY"
              value={endTimeInput}
              onChange={(e) => {
                setEndTimeInput(e.target.value)
                let endDate = new Date(e.target.value)
                let timestamp = Number(endDate.getTime()) / 1000
                console.log(timestamp)
                set_endTime(timestamp)
              }}
            />
          </Field>

          <Field label="Start Price">
            <Input
              type="number"
              required={true}
              placeholder="e.g 10"
              min={0}
              value={_startPrice}
              onChange={(e) => set_startPrice(e.target.value)}
            />
          </Field>

          <Field label="Image Path">
            <Input
              type="text"
              required={true}
              placeholder="e.g https://ipfs.io/ipfs/..."
              value={_imagePath}
              onChange={(e) => set_imagePath(e.target.value)}
            />
          </Field>


          <Button
            onClick={handleCreate}
          >
            Create
          </Button>


        </Flex>
      </Box>

    </main>
  )


}

export default CreatePage