const elliptic = require('elliptic').ec;
const ec = new elliptic('secp256k1');

const key = ec.genKeyPair();
const pubKey = key.getPublic('hex');
const pvtKey = key.getPrivate('hex');

console.log();
console.log('Private Key:', pvtKey);

console.log();
console.log('Public Key:', pubKey);