// SPDX-License-Identifier: DEBID

pragma solidity ^0.8.0;

import 'node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol';
import 'node_modules/@openzeppelin/contracts/access/Ownable.sol';
import 'node_modules/@openzeppelin/contracts/utils/math/SafeMath.sol';

contract DebidNFT is Ownable, ERC721{
    using SafeMath for uint256;

    string public description;
    string public override name = "Debid";
    string public override symbol = "DBID";
    address  NFTowner;
    mapping (uint256 => string) private metaData;
    mapping (uint256 => address)  NFTowners;

    constructor() ERC721(name, symbol) { 
    }

    function TokenMetadata (uint256 _tokenId) external view  returns (string memory) {
        string memory _tokenURL = metaData[_tokenId];
        return _tokenURL;
    }

    function Mint (string memory _name, string memory _description,address _to, uint256 _tokenId, string memory _tokenURL) onlyOwner public {
        require(_to != address(0));
        name = _name;
        description = _description;
        _mint(_to, _tokenId);
        metaData[_tokenId] = _tokenURL;
        NFTowners[_tokenId]= _to;
    }
}
