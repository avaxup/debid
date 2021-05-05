
import { useEffect, useState } from 'react';
import Web3 from 'web3';



const web3 = new Web3(Web3.givenProvider)


import AuctionContract from '../../build/contracts/DebidAuction.json'


const Page = () => {

  const [myAccount, setMyAccount] = useState("")
  const [myBalance, setMyBalance] = useState(0)
  const [contractAddress, setContractAddress] = useState(null)

  const [owner, setOwner] = useState(myAccount || "")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startprice, setStartprice] = useState("")
  const [endtime, setEndtime] = useState("1681586002")
  const [bid, setBid] = useState("")



  let contract = new web3.eth.Contract(AuctionContract.abi, contractAddress)

  /**
   * Metamask üzerinden kendi hesabımızın bilgilerini çektiğimiz fonksiyon. 
   */
  const getAccount = async () => {
    const accounts = await web3.eth.getAccounts()
    if (accounts[0]) {
      setMyAccount(accounts[0])
    }
  }


  /**
   * Hesabımızın bakiyesini çektiğimiz fonksiyon.  
   */
  const getBalance = async () => {
    if (myAccount) {
      const balance = await web3.eth.getBalance(myAccount)
      if (balance) {
        setMyBalance(web3.utils.fromWei(balance))
      }
    }
  }


  /**
   * Açık arttırma için, akıllı kontratımızı testnet e deploy ediyoruz.
   */
  const deployContract = async () => {
    /**
     * Deploy sonucunda gelecek fee yi hesaplatıyoruz. 
     */
    const gas = await contract.deploy({
      data: AuctionContract.bytecode,
      arguments: [
        owner,
        title,
        description,
        web3.utils.toWei(startprice),
        endtime
      ],
    }).estimateGas()

    /**
     * Deploy işlemini gönderiyoruz.
     */
    contract.deploy({
      data: AuctionContract.bytecode,
      arguments: [
        owner,
        title,
        description,
        web3.utils.toWei(startprice),
        endtime
      ],
    }).send({
      from: myAccount,
      gas: gas,
    })
      /**
       * Bir Hata gerçekleşirse bu fonksiyon çalışacak. 
       */
      .on('error', (error) => {
        console.log(error)
        alert("hata")
      })
      /**
       * İşleme ait tx hash geldiğinde burada yakalanıyor. şimdilik pek bir önemi yok.
       */
      .on('transactionHash', (transactionHash) => {
        console.log("transactionHash")
        console.log(transactionHash)
      })
      /**
       * Faturamız burada geliyor. Kontratımızın adresi de bize burada gönderiliyor ve üzerinde işlem yapabilmek için setContractAddress ile state'e aktarıyoruz
       */
      .on('receipt', (receipt) => {
        console.log("receipt")
        console.log(receipt)
        setContractAddress(receipt.contractAddress)
      })
      /**
       * İşlem onaylandığında buraya düşüyor. Şimdilik pek önemi yok.
       */
      .on('confirmation', (confirmationNumber, receipt) => {
        console.log("confirmation")
        console.log(receipt)
      })
  }



  /**
   * İlk çalışan fonksiyonumuz: Metamask'tan hesap bilgilerimizi ve bakiyemizi çekiyor.
   */
  const loadBlockChain = async () => {
    window.ethereum.enable()
    await getAccount()
    await getBalance()

  }

  /**
   * Sayfa yüklendiğinde sunucuda değil tarayıcıda çalıştığında bu kodun çalışması için gerekli önlem.
   * Eğer kodumuz tarayıcı yerine ServerSide render edilirse tarayıcımızdaki metamask cüzdanımızı görmeyebilir.
   */
  useEffect(() => {
    if (typeof window !== "undefined") {
      loadBlockChain()
    }
  },
    //  Eğer hesap ya da bakiye'de değişiklik olursa bunları tekrar yükle.
    [myAccount, myBalance])





  return (
    <div>

      <h1>Adresim: {myAccount}</h1>
      <h2>Bakiye: {myBalance}</h2>
      <h2>Kontrat Adresi:</h2>
      <input placeholder="Addr" value={contractAddress || ""} onChange={(e) => setContractAddress(e.target.value)} />

      <hr />
      <h3>Kontrat Deploy Et</h3>
      <input placeholder="owner" value={owner} onChange={(e) => setOwner(e.target.value)} />
      <input placeholder="title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <input placeholder="description" value={description} onChange={(e) => setDescription(e.target.value)} />
      <input placeholder="startprice" value={startprice} onChange={(e) => setStartprice(e.target.value)} />
      <input placeholder="endtime" value={endtime} onChange={(e) => setEndtime(e.target.value)} />
      <button onClick={deployContract}>Deploy Contract</button>
      <hr />
      <h3>Açık Arttırma Detaylarını Getir</h3>
      <button onClick={async () => alert(JSON.stringify(await contract.methods.getAuctionDetails().call()))}>getAuctionDetails</button>
      <hr />
      <h3>Teklif Ver</h3>
      <input placeholder="bid" value={bid} onChange={(e) => setBid(e.target.value)} />
      <button onClick={async () => {
        try {

          console.log(
            await contract.methods.bid().call({
              from: myAccount,
              value: web3.utils.toWei(bid),
              gas: 3000000,
              gasPrice: 470000000000,
              to: contractAddress,
            })
          )
          console.log(
            await contract.methods.bid().send({
              from: myAccount,
              value: web3.utils.toWei(bid),
              gas: 3000000,
              gasPrice: 470000000000,
              to: contractAddress,
            })
          )

        } catch (error) {
          alert(error.message)
        }
      }
      }>bid</button>
      <hr />
      <h3>Anlık En Yüksek Teklifi Göster</h3>
      <button onClick={async () => alert(JSON.stringify(await contract.methods.getCurrentHighestBid().call()))}>getCurrentHighestBid</button>
      <hr />
      <h3>Açık Arttırmada Kaç Teklif Olduğunu Göster</h3>
      <button onClick={async () => alert(JSON.stringify(await contract.methods.getBidCountOfAuction().call()))}>getBidCountOfAuction</button>
      <hr />
      <h3>Kullanıcının Teklif Sayısını Göster</h3>
      <button onClick={async () => alert(await contract.methods.getBidCountOfUser().call())}>getBidCountOfUser</button>
      <hr />
      <h3>Açık Arttırmayı Bitir</h3>
      <button onClick={async () => alert(await contract.methods.finalizeAuction().call())}>finalizeAuction</button>
      <hr />
    </div>
  )

}


export default Page
