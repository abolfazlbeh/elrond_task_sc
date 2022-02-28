const SimpleContract = artifacts.require("Simple");
const MerkleProofContract = artifacts.require("MerkleProof");

const keccak256 = require('keccak256');
const {MerkleTree} = require("merkletreejs");

contract ("Simple Testing", (accounts) => {
    describe("sample 1", () => {
        it("Check for mt root", async () => {
            console.log(accounts[1], accounts[2], accounts[3]);
            whitelist = [accounts[1], accounts[2], accounts[3]].map(v => keccak256(v));
            tree = new MerkleTree(whitelist, keccak256, {sort: true});
            root = tree.getHexRoot();
            console.log(root);
            console.log(tree);
            console.log("--------------------");
            console.log(tree.getHexProof(keccak256(accounts[1])));

            assert.equal(root, "0xfe1e31239bf810e6ac7dd7c54a9ed47fa8be6c0997d7e81266e3fa2d5d9d988f", "The root does not equal");

            console.log(whitelist[0].toString('hex'));
            console.log(whitelist[1].toString('hex'));

            // console.log(whitelist[2].toString('hex'));

        });
    });
});

contract ("Simple Contract", (accounts) => {
    let simpleContract;

    beforeEach(async () => {
        simpleContract = await SimpleContract.new();
    });

    describe("Initialization", () => {
        it("Check the initial state and root hash of contract", async () => {
            // get the state
            const state = await simpleContract.getState();
            assert.equal(state, 0, "The state is not zero");

            const rootHash = await simpleContract.getMTRoot();
            assert.equal(rootHash, 0, "The root hash is not 0");
        });
    });

    describe("Change state", () => {
        let whitelist;
        let tree;
        let root;

        beforeEach(async () => {
            whitelist = [accounts[1], accounts[2]].map(v => keccak256(v));
            tree = new MerkleTree(whitelist, keccak256, {sort: true});
            root = tree.getHexRoot();

            // console.log(root);
            await simpleContract.updateMTRoot(root, {from: accounts[0]});
        });

        it("Check state is changed by whitelist address", async () => {
            // create white list and merkle tree
            const acc = keccak256(accounts[1]);
            const proofs = tree.getHexProof(acc);

            previousState = await simpleContract.getState();
            s = previousState.add(web3.utils.toBN('1'))
            await simpleContract.setState(s, proofs, {from: accounts[1]});

            // get state and check
            newState = await simpleContract.getState();
            assert.equal(newState - previousState, 1, "New State have not written");
        });

        it("Check state is changed by reading event", async () => {
            // create white list and merkle tree
            acc = keccak256(accounts[1]);

            proofs = tree.getHexProof(acc)
            const tx = await simpleContract.setState(5, proofs, {from: accounts[1]});

            // Check the event and state
            const expectedEvent = "StateChanged";
            const actualEvent = tx.logs[0].event;
            assert.equal(actualEvent, expectedEvent, "State is not cleared");
            assert.equal(tx.logs[0].args[0], 5, "event data is not correct");
        });

        it("Check state is changed by blocked address", async () => {
            // create white list and merkle tree
            acc = keccak256(accounts[4]);
            proofs = tree.getHexProof(acc);

            previousState = await simpleContract.getState();
            s = previousState.add(web3.utils.toBN('1'))

            try {
                await simpleContract.setState(s, proofs, {from: accounts[4]});
                assert.fail("function called successfully");
            } catch (err) {
                assert.ok("Exception must be raised");
            }
            // get state and check
            newState = await simpleContract.getState();
            assert.equal(newState - previousState, 0, "New State have written --> incorrect");
        });
    });
});