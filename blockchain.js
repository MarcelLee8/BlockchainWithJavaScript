const {Blockchain, Data} = require('./blockchain2');
const elliptic = require('elliptic').ec;
const ec = new elliptic('secp256k1');

const myKey = ec.keyFromPrivate('d0e70121a60b620f0c286f050685a1877c5a1cb808c1e002ebc8c52b0e170c92');
const myPersonalKey = myKey.getPublic('hex');

const blockChainJS = new Blockchain();

const transfer1 = new Data(myPersonalKey, 'user public key', 100);
transfer1.signData(myKey);
blockChainJS.addData(transfer1);

console.log('\n Start the mining on the first attempt...');
blockChainJS.miningCompData(myPersonalKey);
console.log('Balance of User is', blockChainJS.getPctOfAddr(myPersonalKey));
console.log('Blockchain valid?', blockChainJS.isChainValid() ? 'Yes' : 'No');

console.log('\n Start the mining on the second attempt...');
blockChainJS.miningCompData(myPersonalKey);
console.log('Balance of User is', blockChainJS.getPctOfAddr(myPersonalKey));

blockChainJS.chain[1].data[0].quantity = 1;
console.log('Blockchain valid?', blockChainJS.isChainValid() ? 'Yes' : 'No');