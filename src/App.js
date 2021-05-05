import React, { useEffect, useState } from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import Navbar from './components/Navbar'
import CreatePage from './pages/CreatePage'
import ShowPage from './pages/ShowPage'
import IndexPage from './pages/IndexPage'
import InstallMetamaskPage from './pages/InstallMetamaskPage'
import Web3 from 'web3';
import ActivateMetamaskPage from './pages/ActivateMetamaskPage';
import AuctionContract from './build/DebidAuction.json'

const App = () => {
  const web3 = new Web3(Web3.givenProvider)
  const [metamaskActive, setMetamaskActive] = useState(false)
  const [myBalance, setMyBalance] = useState(0)
  const [myAccount, setMyAccount] = useState("")

  let refreshListener

  const getAccount = async () => {
    const accounts = await web3.eth.getAccounts()
    if (accounts[0]) {
      setMetamaskActive(true)
      setMyAccount(accounts[0])
    }
  }

  const getBalance = async () => {
    if (myAccount) {
      const balance = await web3.eth.getBalance(myAccount)
      if (balance) {
        setMyBalance(web3.utils.fromWei(balance))
      }
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      (async () => {
        try {
          // await window.ethereum.enable()
          await getAccount()
          await getBalance()

        } catch (error) {
          console.log("error")
          console.log(error)
        }
      })()
    }

    return () => {
    }
  },
    [myAccount, myBalance])




  if (!window.ethereum) {
    refreshListener = window.addEventListener("focus", () => {
      window.location.reload();
    })
    return <InstallMetamaskPage />
  }
  else {
    window.removeEventListener("focus", refreshListener)
    window.ethereum.on('connect', (connectInfo) => {
      console.log("connected")
    });


    // if (!metamaskActive) {
    //   refreshListener = window.addEventListener("focus", () => {
    //     window.location.reload();
    //   })
    // } else {
    //   window.removeEventListener("focus", refreshListener)
    // }

    // window.ethereum.on('connect', (connectInfo) => { window.location.reload() });

    const contract = new web3.eth.Contract(AuctionContract.abi, "0x25860d001Ae09Ffe3EF52D14B3e6d5ae8e686F73")
    return (
      <Router>
        <Navbar
          web3={web3}
          myAccount={myAccount}
          myBalance={myBalance}
          metamaskActive={metamaskActive}
        />
        {
          !metamaskActive &&
          <ActivateMetamaskPage />
        }
        {
          metamaskActive &&
          <Switch>
            <Route path="/create">
              <CreatePage
                web3={web3}
                myAccount={myAccount}
                myBalance={myBalance}
                contract={contract}
              />
            </Route>
            <Route path="/show/:id">
              <ShowPage
                web3={web3}
                myAccount={myAccount}
                myBalance={myBalance}
                contract={contract}
              />
            </Route>
            <Route path="/">
              <IndexPage
                web3={web3}
                myAccount={myAccount}
                myBalance={myBalance}
                contract={contract}
              />
            </Route>
          </Switch>
        }
      </Router>
    )
  }
}

export default App