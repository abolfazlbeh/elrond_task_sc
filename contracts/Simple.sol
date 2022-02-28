pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";

import "./MerkleProof.sol";

contract Simple is Ownable {
    uint256 private state;
    bytes32 private mtRootHash;
    MerkleProof private _merkleProof;

    event RootHashChanged();
    event StateChanged(uint256);

    constructor () public {
        state = 0;
        _merkleProof = new MerkleProof();
    }

    function updateMTRoot(bytes32 hash) public onlyOwner returns(bool) {
        require(hash != 0, "hash must not be zero");
        mtRootHash = hash;

        emit RootHashChanged();
        return true;
    }

    function getState() public view returns(uint256) {
        return state;
    }

    function getMTRoot() public view returns(bytes32) {
        return mtRootHash;
    }

    function setState(uint256 _state, bytes32[] memory proofs) public {
        // Check the address is added to whitelist and has the right permission
        bytes32 addr = keccak256(abi.encodePacked(msg.sender));
        bool hasPermission =  _merkleProof.verify(mtRootHash, addr, proofs);
        require(hasPermission == true, "Permission Denied");

        state = _state;
        emit StateChanged(state);
    }
}
