import { Dialog } from '@headlessui/react'
import detectEthereumProvider from '@metamask/detect-provider'
import { ethers } from 'ethers'
import Image from 'next/image'
import { useEffect, useState } from 'react'

enum Status {
  NOT_CONNECTED,
  WAITING_FOR_MINT,
  MINTING,
  MINTED,
}

type MerkleProofData = {
  proof: string[]
}

const contractAddress = '0xb74253d4e30e50875557412A5ad8aa63D0D73831'

export default function Mint() {
  const [chainId, setChainId] = useState<number>(0)
  const [currentAccount, setCurrentAccount] = useState<string>('')
  const [status, setStatus] = useState<Status>(Status.NOT_CONNECTED)
  const [isSwitchNetworkDialogOpen, setIsSwitchNetworkDialogOpen] =
    useState(false)

  useEffect(() => {
    // TODO: check if the address has the NFT or not and change it to MINTED
  }, [currentAccount])

  const connectWallet = async () => {
    const provider = await detectEthereumProvider({ silent: true })
    if (provider) {
      const ethersProvider = new ethers.providers.Web3Provider(provider)
      let accounts: string[] = []
      try {
        // ref: https://eips.ethereum.org/EIPS/eip-1102
        accounts = await ethersProvider.send('eth_requestAccounts', [])
      } catch (error) {
        if (accounts.length === 0) {
          alert('Please unlock MetaMask wallet and/or connect to an account')
        } else {
          alert('Something wrong occurred')
        }
        return
      }
      setCurrentAccount(ethers.utils.getAddress(accounts[0]))
      const network = await ethersProvider.getNetwork()
      setChainId(network.chainId)
      setStatus(Status.WAITING_FOR_MINT)
    } else {
      alert('Please install MetaMask wallet')
    }
  }

  const mint = async () => {
    // Only for OP Mainnet and OP Goerli
    if ([10, 420].includes(chainId)) {
      const provider = await detectEthereumProvider({ silent: true })
      const abi = `[
          {
            "inputs": [],
            "name": "mint",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
          }
        ]`
      if (provider) {
        const ethersProvider = new ethers.providers.Web3Provider(provider)
        const nftContract: ethers.Contract = new ethers.Contract(
          contractAddress,
          abi,
          ethersProvider.getSigner()
        )
        const tx = await nftContract.mint({
          value: ethers.utils.parseEther('0.01'),
        })
        setStatus(Status.MINTING)
        await tx.wait()
        setStatus(Status.MINTED)
      }
    } else {
      setIsSwitchNetworkDialogOpen(true)
    }
  }

  return (
    <>
      <main className="flex min-h-screen flex-col justify-center items-center p-12">
        <h2 className="text-2xl mb-16">Dig DAO NFT mint</h2>
        <Image
          src="/digdao.png"
          alt="Dig DAO"
          width={200}
          height={200}
          className="border border-gray-900 mb-8"
        />
        {status === Status.NOT_CONNECTED ? (
          <button
            className="rounded-lg border border-gray-900 p-2 mb-4"
            onClick={connectWallet}
          >
            Connect Wallet
          </button>
        ) : null}
        {/* TODO: if proof doesn't exist for an account, disable the button */}
        {status === Status.WAITING_FOR_MINT ? (
          <button
            className="rounded-lg border border-gray-900 p-2 mb-4"
            onClick={mint}
          >
            Mint - 0.01eth
          </button>
        ) : null}
        {status === Status.MINTING ? (
          <button className="rounded-lg border border-gray-900 p-2 mb-4">
            Minting...
          </button>
        ) : null}
        {status === Status.MINTED ? (
          <button className="rounded-lg border border-gray-900 p-2 mb-4">
            Minted
          </button>
        ) : null}

        <p>ChainId: {chainId}</p>
        <p>currentAccount: {currentAccount}</p>

        <Dialog
          open={isSwitchNetworkDialogOpen}
          onClose={() => setIsSwitchNetworkDialogOpen(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-sm rounded-lg bg-slate-500">
              <Dialog.Title className="p-2">Switch Network</Dialog.Title>
              <Dialog.Description className="p-2">
                Switch network to Optimism
              </Dialog.Description>

              <button
                onClick={() => setIsSwitchNetworkDialogOpen(false)}
                className="p-2"
              >
                Close
              </button>
            </Dialog.Panel>
          </div>
        </Dialog>
      </main>
    </>
  )
}
