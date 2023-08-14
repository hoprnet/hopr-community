const crypto = require('libp2p-crypto')
const PeerId = require('peer-id')
const ethers = require('ethers')

const getAddressFromPeer = async (b58String) => {
    // Getting Public key (Buffer) from b58 string
    const pid = await PeerId.createFromB58String(b58String)
    const pk = crypto.keys.unmarshalPublicKey(pid.marshalPubKey())

    // Getting EVM address from public key (Buffer) from previous step
    const address = await ethers.utils.computeAddress(pk._key)
    return address
}

module.exports = {
    getAddressFromPeer
}