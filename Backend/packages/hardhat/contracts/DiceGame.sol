pragma solidity >=0.8.0 <0.9.0;  //Do not change the solidity version as it negativly impacts submission grading
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";

contract DiceGame {

    uint256 public nonce = 0;
    uint256 public prize = 0;

    uint256 public impact_fund = 0;

    event Roll(address indexed player, uint256 roll, uint256 roll1, uint256 roll2, uint256 roll3);
    event Winner(address winner, uint256 matched, uint256 amount);

    constructor() payable {
        resetPrize();
    }

    function resetPrize() private {
        prize = ((address(this).balance * 10) / 100);
    }

    function rollTheDice() public payable {
        require(msg.value >= 0.001 ether, "Failed to send enough value");

        bytes32 prevHash = blockhash(block.number - 1);
        bytes32 hash = keccak256(abi.encodePacked(prevHash, address(this), nonce++));
        uint256 roll = uint256(hash) % 10;

        bytes32 prevHash1 = blockhash(block.number - 1);
        bytes32 hash1 = keccak256(abi.encodePacked(prevHash1, address(this), nonce++));
        uint256 roll1 = uint256(hash1) % 10;

        bytes32 prevHash2 = blockhash(block.number - 1);
        bytes32 hash2 = keccak256(abi.encodePacked(prevHash2, address(this), nonce++));
        uint256 roll2 = uint256(hash2) % 10;

        bytes32 prevHash3 = blockhash(block.number - 1);
        bytes32 hash3 = keccak256(abi.encodePacked(prevHash3, address(this), nonce++));
        uint256 roll3 = uint256(hash3) % 10;

        uint256 count = 0;
        if (roll % 2 == 0) {
            count++;
        }
        if (roll1 % 2 == 0) {
            count++;
        }
        if (roll2 % 2 == 0) {
            count++;
        }
        if (roll3 % 2 == 0) {
            count++;
        }
        uint256 matched = count;

        nonce++;
        prize = ((msg.value * matched * 25) / 100);

        impact_fund += (msg.value - prize);

        emit Roll(msg.sender, roll, roll1, roll2, roll3);

        uint256 amount = prize;
        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Failed to send Ether");

        resetPrize();
        emit Winner(msg.sender, matched, amount);
    }

    receive() external payable {  }
}