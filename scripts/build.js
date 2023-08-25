const { StandardMerkleTree } = require('@openzeppelin/merkle-tree')
const fs = require('fs')

const addresses = [
  ['0xa4dDE78906b73133296D43f23Ca4b41009059123', 1],
  ['0x57d7367e56C09562621901c4eb8e85F79CaaC6A0', 1],
  ['0x314E5050565A34E8F8363B6a83220e17AD5b7578', 1],
  ['0x9DF24F83EC7d2653fb2fAACf6C020d3a711D5CBC', 1],
]

const tree = StandardMerkleTree.of(addresses, ['address', 'uint8'])

console.log('Merkle Root:', tree.root)

fs.writeFileSync('tree.json', JSON.stringify(tree.dump()))
