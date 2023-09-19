const SHA256 = require("crypto-js/sha256");
const elliptic = require('elliptic').ec;
const ec = new elliptic('secp256k1');

class Data {
    constructor(fromAddr, toAddr, capstone_comp){
        this.fromAddr = fromAddr;
        this.toAddr = toAddr;
        this.capstone_comp = capstone_comp;
    }

    getHash() {
        return SHA256(this.fromAddr + this.toAddr + this.capstone_comp).toString();
    }

    signData(signingKey) {
        if (signingKey.getPublic('hex') !== this.fromAddr) {
            throw new Error('You cannot sign data!');
        }

        const hashData = this.getHash();
        const sig = signingKey.sign(hashData, 'base64');

        this.signature = sig.toDER('hex');
    }

    isValid() {
        if (this.fromAddr === null) {
            return true;
        }

        if (!this.signature || this.signature.length === 0) {
            throw new Error('No signature in this data!');
        }

        const pubKey = ec.keyFromPublic(this.fromAddr, 'hex');
        return pubKey.verify(this.getHash(), this.signature);
    }
}

class Block {
    constructor(timestamp, data, prevHash = '') {
        this.timestamp = timestamp;
        this.data = data;
        this.prevHash = prevHash;
        this.nonce = 0;
        this.nextHash = this.getHash();
    }

    getHash() {
        return SHA256(this.prevHash + this.timestamp + JSON.stringify(this.data) + this.nonce).toString();
    }

    mineBlock(diff) {
        while (this.nextHash.substring(0, diff) !== Array(diff + 1).join("0")) {
            this.nonce++;
            this.nextHash = this.getHash();
        }
        console.log("Block mined: " + this.nextHash);
    }

    hasValidData() {
        for (const dt of this.data) {
            if (!dt.isValid()) {
                return false;
            }
        }
        return true;
    }
}

class Blockchain {
    constructor() {
        this.chain = [this.createBlock()];
        this.diff = 2;
        this.pendingData = [];
        this.miningComp = 0;
    }

    createBlock() {
        return new Block("01/26/2023", "Capstone Project", "0");
    }

    getLastBlock() {
        return this.chain[this.chain.length - 1];
    }

    miningCompData(miningCompAddr) {
        const compData = new Data(null, miningCompAddr, this.miningComp);
        this.pendingData.push(compData);
        
        let block = new Block(Date.now(), this.pendingData, this.getLastBlock().nextHash);
        block.mineBlock(this.diff);

        console.log('A block was mined successfully!');
        this.chain.push(block);

        this.pendingData = [];
    }

    addData(data) {
        if (!data.fromAddr || !data.toAddr) {
            throw new Error('Data must include "from" and "to" address');
        }

        if (!data.isValid()) {
            throw new Error('Cannot add invalid data to chain');
        }
        this.pendingData.push(data);
    }

    getPctOfAddr(addr) {
        let pct = 1000;

        for(const block of this.chain) {
            for(const data of block.data) {
                if (data.fromAddr === addr) {
                    pct -= data.capstone_comp;
                }

                if (data.toAddr === addr) {
                    pct += data.capstone_comp;
                }
            }
        }
        return pct;
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currBlock = this.chain[i];
            const prevBlock = this.chain[i - 1];

            if (!currBlock.hasValidData()) {
                return false;
            }

            if (currBlock.nextHash !== currBlock.getHash()) {
                return false;
            }

            if (currBlock.prevHash !== prevBlock.getHash()) {
                return false;
            }
        }

        return true;
    }
}

module.exports.Blockchain = Blockchain;
module.exports.Data = Data;