const MerkleProofContract = artifacts.require("MerkleProof");

const {MerkleTree} = require('merkletreejs');
const keccak256 = require('keccak256');

contract ("Merkle Proof Initialization", () => {
    describe("Initialize Merkle Proof Contract", () => {
        it("Initialize new MerkleProof Contract", async () => {
            cont = await MerkleProofContract.new();
            assert.notEqual(cont, null, "Contract is not created");
        });
    });
});

contract ("Merkle Proof", () => {
    let merkleProof;

    beforeEach(async () => {
        merkleProof = await MerkleProofContract.new();
    });

    describe("Test Functionality", () => {
        it("Verify Function With Existed Node", async () => {
            const leaves = ['a', 'b', 'c', 'd'].map(v => keccak256(v));
            const tree = new MerkleTree(leaves, keccak256, {sort: true});
            const root = tree.getHexRoot();

            const leaf = keccak256('a');
            const proof = tree.getHexProof(leaf);

            result = await merkleProof.verify(root, leaf, proof);
            assert.equal(result, true, "The node does not prove");
        });


        it("Verify Function With Not Existed Node", async () => {
            const leaves = ['d', 'b', 'c', 'd'].map(v => keccak256(v));
            const tree = new MerkleTree(leaves, keccak256, {sort: true});
            const root = tree.getHexRoot();

            const leaf = keccak256('a');
            const proof = tree.getHexProof(leaf);

            result = await merkleProof.verify(root, leaf, proof);
            assert.equal(result, false, "The node proved");
        });
    });
});

