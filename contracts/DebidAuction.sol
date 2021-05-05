// SPDX-License-Identifier: DEBID

pragma solidity ^0.8.0;

contract DebidAuction {
    struct Bid {
        address bidder;
        uint amount;
        uint time;
    }

    struct Auction {
        uint id;
        address owner;
        string ownerName;
        string title;
        string description;
        string imagePath;
        uint startTime;
        uint endTime;
        uint startPrice;
        bool isActive;
        bool isCanceled;
        uint totalBidCount;
        Bid highestBid;
        Bid[] allBids;
        mapping(address => uint) bids; // bidder address -> bid amount
        mapping(address => uint) bidCountOfUser; // total bid count of the bidder
    }

    address internal contractOwner;
    Auction[] internal auctions;
    uint internal totalAuctionCount;
    uint[] internal auctionIdList;
    mapping(address => uint[]) auctionIdsOfOwner;
    mapping(address => uint[]) auctionIdsOfBidder;
    mapping(uint => address[]) biddersOfAuction;

    event AuctionStarted(uint id, string ownerName, string title, uint startPrice, uint startTime);
    event AuctionClosed(string title, uint startPrice, address owner, address highestBidder, uint highestBidAmount, uint duration);
    event AuctionCanceled(uint id, string ownerName, string title, uint startPrice, uint cancelTime);
    event HighestBidIncreased(address bidder, uint amount);
    event PreviousBidderRefunded(address prevBidder, uint prevBidAmount, uint refundTime);
    event Transfered(address user, uint amount);
    event Withdrawn(address user, uint amount);

    constructor() {
        contractOwner = msg.sender;  // who deploys it, owns the contract.
        totalAuctionCount = 0;
    }

    function createAuction(string memory _ownerName, string memory _title, string memory _description,
        string memory _imagePath, uint _startPrice, uint _endTime) public returns (uint) {
        require(block.timestamp <= _endTime, "Invalid time to end the auction!");
        //require(block.timestamp >= _startTime, "Invalid time to start the auction!");
        require(block.timestamp < _endTime, "End time must be greater than the start time!");
        require(_startPrice > 0, "Start price cannot be 0!");
        
        auctions.push();
        uint auctionId = totalAuctionCount;         
        Auction storage auction = auctions[auctionId];

        auction.id = auctionId;
        auction.owner = msg.sender;     // who calls this function, owns the auction.
        auction.ownerName = _ownerName;
        auction.title = _title;
        auction.description = _description;
        auction.imagePath = _imagePath;
        auction.startPrice = _startPrice * (1 ether);       //!! convert avax 
        auction.startTime = block.timestamp;        
        auction.endTime = _endTime;
        auction.isActive = true;
        auction.isCanceled = false;
        auction.totalBidCount = 0;

        //auctionsById[auctionId] = auction;
        auctionIdsOfOwner[msg.sender].push(auctionId);
        auctionIdList.push(auctionId);
        totalAuctionCount++;

        emit AuctionStarted(auctionId, _ownerName, _title, _startPrice, auction.startTime);
        return auctionId;
    }

    function bid(uint _auctionId) public payable returns (bool) {
        require(_auctionId >= 0 && auctions.length > _auctionId, "There is no auction with this id!");
        Auction storage auction = auctions[_auctionId];

        require(auction.owner != msg.sender, "Owner cannot place bids!");
        require(auction.isActive, "Auction must be started!");
        require(!auction.isCanceled, "Auction has already canceled!");
        require(block.timestamp >= auction.startTime, "Auction time has not started yet!");
        require(block.timestamp <= auction.endTime, "Auction time has already ended!");
        require(msg.value > 0, "Bid amount must be greater than 0!");

        // when first bid has been placed, control the start price
        if (auction.highestBid.amount == 0) {
            require(msg.value >= auction.startPrice,"Bid must be greater than or equal to the start price!");
        }
        
        Bid memory prevBid;
        uint tempAmount;
        
        // if there is a previous bid
        if( auction.totalBidCount > 0 ) {
            prevBid = auction.highestBid;
            tempAmount = prevBid.amount;
        }

        // check if new bid is greater than previous amount  
        require(msg.value > tempAmount,"Bid amount must be greater than the previous one!");
        
        // refund the previous bidder
        if( auction.totalBidCount > 0 ) {
            if(!payable(prevBid.bidder).send(prevBid.amount)) {
                revert();
            }  
            emit PreviousBidderRefunded(prevBid.bidder, prevBid.amount, block.timestamp);
        }
        
        uint newBidAmount = msg.value;      /*+ auction.bids[msg.sender]*/
        require(newBidAmount > auction.highestBid.amount, "Bid must be greater than the previous bid!");

        auction.highestBid.bidder = msg.sender;
        auction.highestBid.amount = newBidAmount;
        auction.highestBid.time = block.timestamp;

        auction.bids[msg.sender] += newBidAmount;
        biddersOfAuction[auction.id].push(msg.sender);
        auction.allBids.push(auction.highestBid);
        auctionIdsOfBidder[msg.sender].push(auction.id);
        auction.bidCountOfUser[msg.sender]++;
        auction.totalBidCount++;

        emit Transfered(msg.sender, msg.value);
        emit HighestBidIncreased(msg.sender, newBidAmount);
        
        return true;
    }

    function closeAuction(uint _auctionId) public returns (bool) {
        // trigger this function automatically when auction time is over.
        require(_auctionId >= 0 && auctions.length > _auctionId,"There is no auction with this id!");
        Auction storage auction = auctions[_auctionId];
        
        require(auction.isActive, "Auction has already closed!");
        require(!auction.isCanceled, "Auction has already canceled!");
        require(block.timestamp >= auction.startTime, "Auction time has not started yet!");
        require(block.timestamp <= auction.endTime, "Auction time has already ended!");
        
        auction.isActive = false;
        
        emit AuctionClosed(
            auction.title,
            auction.startPrice,
            auction.owner,
            auction.highestBid.bidder,
            auction.highestBid.amount,
            auction.endTime - auction.startTime
        );
        
        return true;
    }

    function withdraw(uint _auctionId) public returns (bool) {
        require(_auctionId >= 0 && auctions.length > _auctionId,"There is no auction with this id!");
        Auction storage auction = auctions[_auctionId];
        
        require(!auction.isActive || auction.isCanceled, "Auction must be closed or canceled for withdrawal.");

        //require(block.timestamp > auction.endTime, "Auction time must be ended!");

        uint withdrawalAmount;
    
        // if the auction was canceled, everyone should simply be allowed to withdraw their funds.
        if (auction.isCanceled) {
            withdrawalAmount = auction.bids[msg.sender];
        }
        // if the auction finished without being canceled
        else {
            // the owner of the auction should be allowed to withdraw the highest bid amount.
            if (msg.sender == auction.owner) {
                withdrawalAmount = auction.highestBid.amount;
                auction.highestBid.amount = 0;
                auction.bids[auction.highestBid.bidder] = 0;
            }
            // highest bidder gets no money
            else if (msg.sender == auction.highestBid.bidder) {
                withdrawalAmount = 0;
            }
            // anyone who participated but did not win the auction should be allowed to withdraw.
            // now refund for previous bidder is made as soon as there is a high offer in bid() method.
            // old version:
            // else { 
            //     withdrawalAmount = auction.bids[msg.sender];
            //     auction.bids[msg.sender] -= withdrawalAmount;
            // }
        }
        
        require(withdrawalAmount > 0, "There is nothing to withdraw!");
        payable(msg.sender).transfer(withdrawalAmount);  // send the funds

        emit Withdrawn(msg.sender, withdrawalAmount);

        return true;
    }

    function cancelAuction(uint _auctionId) public returns (bool) {
        require(_auctionId >= 0 && auctions.length > _auctionId,"There is no auction with this id!");
        Auction storage auction = auctions[_auctionId];
        
        require(auction.owner == msg.sender, "Only owner can cancel the auction!");
        require(auction.isActive, "Auction must be started first to be able to cancel!");
        require(block.timestamp >= auction.startTime, "Auction time has not started yet!");
        require(block.timestamp <= auction.endTime, "Auction time has already ended!");
        
        auction.isCanceled = true;
        auction.highestBid.amount = 0;      // owner wont get any money from canceled auction. 
        
        emit AuctionCanceled(auction.id, auction.ownerName, auction.title, auction.startPrice, block.timestamp);
        return true;
    }
    
    function getAuctionDetails(uint _auctionId) public view returns (uint, address, string memory, string memory, 
        string memory, string memory, uint, bool, uint, uint, uint, Bid memory) {
        require(_auctionId >= 0 && auctions.length > _auctionId, "There is no auction with this id!");
        Auction storage auction = auctions[_auctionId];

        return (
            auction.id,auction.owner, auction.ownerName,
            auction.title, auction.description, auction.imagePath,
            auction.startPrice, auction.isActive,
            auction.startTime, auction.endTime,
            auction.totalBidCount, auction.highestBid
        );
    }
    
    function getAuctionById(uint _auctionId) internal view returns (Auction storage) {
        require(_auctionId >= 0 && auctions.length > _auctionId, "There is no auction with this id!");
        Auction storage auction = auctions[_auctionId];

        return auction;
    }

    function getAllAuctionIdsOfOwner(address _owner) public view returns (uint[] memory) {
        return auctionIdsOfOwner[_owner];
    }

    function getAllAuctionIdsOfBidder(address _bidder) public view returns (uint[] memory) {
        return auctionIdsOfBidder[_bidder];
    }

    function getAllBidderAddressesOfAuction(uint _auctionId) public view returns (address[] memory) {
        return biddersOfAuction[_auctionId];
    }
    
    function getBidById(uint _auctionId, uint _bidId) public view returns (address, uint, uint) {
        require(_auctionId >= 0 && auctions.length > _auctionId,"There is no auction with this id!");
        Auction storage auction = auctions[_auctionId];
        require(_bidId >= 0 && auction.allBids.length > _bidId,"There is no bid with this id!");
          
        return (auction.allBids[_bidId].bidder, auction.allBids[_bidId].amount, auction.allBids[_bidId].time);
    }

    function geHighestBidOfAuction(uint _auctionId) public view returns (address, uint, uint) {
        require(_auctionId >= 0 && auctions.length > _auctionId, "There is no auction with this id!");
        Auction storage auction = auctions[_auctionId];

        require(auction.highestBid.amount != 0, "No bids placed yet.");

        return (
            auction.highestBid.bidder,
            auction.highestBid.amount,
            auction.highestBid.time
        );
    }

    function getBidCountOfAuction(uint _auctionId) public view returns (uint) {
        require(_auctionId >= 0 && auctions.length > _auctionId, "There is no auction with this id!");
        Auction storage auction = auctions[_auctionId];

        return auction.totalBidCount;
    }

    function getBidCountOfBidder(uint _auctionId, address _bidder) public view returns (uint) {
        require(_auctionId >= 0 && auctions.length > _auctionId, "There is no auction with this id!");
        Auction storage auction = auctions[_auctionId];

        require(auction.owner != _bidder, "Owner cannot place bids!");
        require(auction.bidCountOfUser[_bidder] > 0, "There is no bid amount placed by this user!");

        return auction.bidCountOfUser[_bidder];
    }

    function getBidAmountOfBidder(uint _auctionId, address _bidder) public view returns (uint) {
        require(_auctionId >= 0 && auctions.length > _auctionId, "There is no auction with this id!");
        Auction storage auction = auctions[_auctionId];

        require(auction.owner != _bidder, "Owner cannot place bids!");
        require(auction.bidCountOfUser[_bidder] > 0, "User hasn't placed a bid yet!");
        require(auction.bids[_bidder] > 0, "User hasn't placed a bid yet!");
        
        return auction.bids[_bidder];
    }
    
    function getAllBids(uint _auctionId) public view returns (Bid[] memory) {
        require(_auctionId >= 0 && auctions.length > _auctionId,"There is no auction with this id!");
        Auction storage auction = auctions[_auctionId];

        return auction.allBids;
    }
    
    function getAllAuctions() public view returns (uint[] memory) {
        //!! Can't return Auction[] memory
        // TypeError: Types containing (nested) mappings can only be parameters or return variables of internal or library functions.
        return auctionIdList;
    }

    function getAuctionCount() public view returns (uint) {
        return totalAuctionCount;
    }
    
    //------------ remove after development -----------------
    function getContractOwner() public view returns (address) {
        return contractOwner;
    }

    function getContractAddress() public view returns (address) {
        return address(this);
    }

    function getContractBalance() public view returns (uint) {
        return address(this).balance;
    }
    //------------------------------------------------------
    
    // function getTimePassed(uint _auctionId) public view returns (uint){
    //     require(_auctionId >= 0 && auctions.length > _auctionId, "There is no auction with this id!");
    //     Auction storage auction = auctions[_auctionId];
    //     require(block.timestamp > auction.startTime, "Auction has not been started!");
        
    //     return block.timestamp - auction.startTime; 
    // }
    
    // function getRemainingTime(uint _auctionId) public view returns (uint){
    //     require(_auctionId >= 0 && auctions.length > _auctionId, "There is no auction with this id!");
    //     Auction storage auction = auctions[_auctionId];
        
    //     return auction.endTime - auction.startTime;
    // }
    
    // function getPercentIncrease (uint _auctionId) public view returns (uint) {
	//    require(_auctionId >= 0 && auctions.length > _auctionId, "There is no auction with this id!");
    //    Auction storage auction = auctions[_auctionId];
        
    //    require(auction.isActive, "Auction must be started!");
    //    require(!auction.isCanceled, "Auction has already canceled!");
        
    //    if(block.timestamp < auction.startTime) return 0;
        
	//	  return ((uint(auction.highestBid.amount) - uint(auction.startPrice)) * 100 / uint(auction.startPrice));
	// }

    // function getCurrentAuctionDetails() public view returns (address, string memory, string memory,
    //         uint, bool, uint, uint, uint, Bid memory) {
    //     require(auctions.length > 0, "There is no auction!");
    //     Auction storage auction = auctions[auctions.length - 1];

    //     return (
    //         auction.owner,
    //         auction.title,
    //         auction.description,
    //         auction.startPrice,
    //         auction.isActive,
    //         auction.startTime,
    //         auction.endTime,
    //         auction.totalBidCount,
    //         auction.highestBid
    //     );
    // }

    // function getAllBiddersOfCurrentAuction() public view returns (address[] memory) {
    //     require(auctions.length > 0, "There is no auction!");
    //     Auction storage auction = auctions[auctions.length - 1];

    //     return biddersOfAuction[auction.id];
    // }

    // function getCurrentHighestBid() public view returns (address, uint, uint) {
    //     require(auctions.length > 0, "There is no auction!");
    //     Auction storage auction = auctions[auctions.length - 1];

    //     require(auction.highestBid.amount != 0, "No bids placed yet.");

    //     return (
    //         auction.highestBid.bidder,
    //         auction.highestBid.amount,
    //         auction.highestBid.time
    //     );
    // }

    // function getBidCountOfCurrentAuction() public view returns (uint) {
    //     require(auctions.length > 0, "There is no auction!");
    //     Auction storage auction = auctions[auctions.length - 1];

    //     return auction.totalBidCount;
    // }

    // function getBidCountOfUserByCurrentAuction(address _user) public view returns (uint) {
    //     require(auctions.length > 0, "There is no auction!");
    //     Auction storage auction = auctions[auctions.length - 1];

    //     require(auction.owner != _user, "Owner cannot place bids!");
    //     require(
    //         auction.bidCountOfUser[_user] > 0,
    //         "User hasn't placed a bid yet!"
    //     );

    //     return auction.bidCountOfUser[_user];
    // }
}
