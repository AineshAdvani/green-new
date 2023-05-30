//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IERC721 {
    function transferFrom(
        address _from,
        address _to,
        uint256 _id
    ) external;
}



contract GreenPlanet {
    address payable public seller;
    address payable public buyer;
    address public nftAddress;
    address public inspector;

    mapping(uint256 => bool) public isListed;
    mapping(uint256 => uint256) public price;
    mapping(uint256 => uint256) public amount;
    mapping(uint256 => address) public buyerof;
    mapping(uint256 => bool) public inspectionPassed;
    mapping(uint256 => mapping(address => bool)) public approval;
    
    modifier onlyBuyer(uint256 _nftID) {
        require(msg.sender == buyerof[_nftID], "Only buyer can call this method");
        _;
    }

    modifier onlySeller() {
        require(msg.sender == seller, "Only seller can call this method");
        _;
    }
    modifier onlyInspector() {
        require(msg.sender == inspector, "Only inspector can call this method");
        _;
    }

    constructor(address _nftAddress, address payable _seller, address payable _buyer, address _inspector) {
        nftAddress = _nftAddress;
        seller = _seller;
        buyer = _buyer;
        inspector = _inspector;
    }


    function updateInspection(uint256 _nftID, bool _passed) public onlyInspector{
        inspectionPassed[_nftID] = _passed;
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
    function approve(uint256 _nftID) public {
        approval[_nftID][msg.sender] = true;
    }
    
    function list(uint256 _nftid, uint256 _price, address _buyerof, uint256 _amount) public payable onlySeller {
        IERC721(nftAddress).transferFrom(msg.sender, address(this), _nftid);
        isListed[_nftid] = true;
        price[_nftid] = _price ;
        amount[_nftid] = _amount;
        buyerof[_nftid] = _buyerof;
    }
    function finalizeProcessal(uint256 _nft) public {
        require(inspectionPassed[_nft] == true, "Inspection not passed");
        require(approval[_nft][buyerof[_nft]] == true, "Not approved");
        require(approval[_nft][seller] == true, "Not approved");

        (bool success,) = payable(seller).call{value:address(this).balance}("");
        require(success);
        IERC721(nftAddress).transferFrom(address(this), msg.sender, _nft);
        isListed[_nft] = false;
        price[_nft] = 0;
        amount[_nft] = 0;
        buyerof[_nft] = address(0);
        approval[_nft][msg.sender] = false;
    }
    
    
    }

    
