const DebidAuction = artifacts.require("DebidAuction");
const DebidNFT = artifacts.require("DebidNFT");
const ERC721Token = artifacts.require("node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol");
/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("DebidAuction", function (accounts) {
  it("should assert true", async function () {
    await DebidAuction.deployed();
    return assert.isTrue(true);
  });

  it("mint NFT tokenId 1 to account[0]", function () {
    return DebidNFT.deployed().then(function (nftInstance) {
      // string memory _name, string memory _description,address _to, uint256 _tokenId, string memory _tokenURL
      return nftInstance.Mint('My first Debid Nft', 'description1', accounts[0], 1, 'metadata1', { from: accounts[0] });
    });
  });

  it("account[0] can approve Auction Contract ", function () {
    return DebidNFT.deployed().then(function (nftInstance) {
      NFTInstance = nftInstance;
      return DebidAuction.deployed();
    }).then(function (auctionInstance) {
      AuctionInstance = auctionInstance;
      // address to, uint256 tokenId
      return NFTInstance.approve(AuctionInstance.address, 1, { from: accounts[0] });
    });
  });

  it("Auction takes ownership of account 0 NFT ID 1 and starts auction 0", function () {
    return DebidNFT.deployed().then(function (nftInstance) {
      NFTInstance = nftInstance;
      return DebidAuction.deployed();
    }).then(function (auctionInstance) {
      AuctionInstance = auctionInstance;
      // string memory _ownerName, string memory _title, string memory _description, string memory _imagePath, uint _startPrice, uint _endTime, uint _nftId, address _nftContractAddress
      return AuctionInstance.createAuction('Irem', 'Auction title1', 'Auction desc1', 'Auction image1', 1, 1651057678, 1, NFTInstance.address, { from: accounts[0] });
    }).then(function () {
      return NFTInstance.ownerOf(1);
    }).then(function (account) {
      assert.equal(account, AuctionInstance.address, "The Debid Nft is not owned by Auction contract.");
    });
  });

  it("account[1] can bid 1 ETH on auction 0", function () {
    return DebidNFT.deployed().then(function (nftInstance) {
      NFTInstance = nftInstance;
      return DebidAuction.deployed();
    }).then(function (auctionInstance) {
      AuctionInstance = auctionInstance;
      AuctionInstance.bid(0, { from: accounts[1], value: 1000000000000000000 }); // 1eth
    });
  });

  it("account[2] can bid 2 ETH on auction 0", function () {
    return DebidNFT.deployed().then(function (nftInstance) {
      NFTInstance = nftInstance;
      return DebidAuction.deployed();
    }).then(function (auctionInstance) {
      AuctionInstance = auctionInstance;
      AuctionInstance.bid(0, { from: accounts[2], value: 2000000000000000000 }); // 2eth
    });
  });

  it("account[3] can bid 3 ETH on auction 0", function () {
    return DebidNFT.deployed().then(function (nftInstance) {
      NFTInstance = nftInstance;
      return DebidAuction.deployed();
    }).then(function (auctionInstance) {
      AuctionInstance = auctionInstance;
      AuctionInstance.bid(0, { from: accounts[3], value: 3000000000000000000 }); // 3eth
    });
  });

  it("should return all bids of auction 0", function () {
    return DebidNFT.deployed().then(function (nftInstance) {
      NFTInstance = nftInstance;
      return DebidAuction.deployed();
    }).then(function (auctionInstance) {
      AuctionInstance = auctionInstance;
      return AuctionInstance.getAllBids(0);
    }).then(function (allBids) {
      console.log("ALL BIDS on Auction 0:");
      for (var i = 0; i < allBids.length; i++) {
        console.log("Bidder: ", allBids[i].bidder, "\tAmount: ", allBids[i].amount, "\tTime: ", allBids[i].time);
      };
    });
  });

  function sleep(seconds) {
    var e = new Date().getTime() + (seconds * 1000);
    while (new Date().getTime() <= e) { }
  }

  it("account[0] can close the auction 0 and withdraw the highest bid.", function () {
    return DebidNFT.deployed().then(function (nftInstance) {
      NFTInstance = nftInstance;
      return DebidAuction.deployed();
    }).then(function (auctionInstance) {
      AuctionInstance = auctionInstance;
      sleep(4);
      AuctionInstance.closeAuction(0, { from: accounts[0] });
      AuctionInstance.withdraw(0, { from: accounts[0] });     // owner gets the highest bid amount.
    }).then(function () {
      return NFTInstance.ownerOf(1);
    }).then(function (nftOwner) {
      console.log('NFT OWNER: ', nftOwner);
      assert.equal(nftOwner, accounts[3], "The Nft is not owned by highest bidder.");
    });
  });

});
