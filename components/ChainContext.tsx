import { useState, createContext } from 'react'
import type React from 'react'
import { ethers } from 'ethers'
import detectEthereumProvider from '@metamask/detect-provider'

type Chain = any
export const ChainContext = createContext<Chain>({})
type ChainContextProviderProps = { children: React.ReactNode }
export const ChainContextProvider = ({
  children,
}: ChainContextProviderProps) => {
  const [chainId, setChainId] = useState<number>(0)
  const [currentAccount, setCurrentAccount] = useState<string>('test')

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
    } else {
      alert('Please install MetaMask wallet')
    }
  }

  return (
    <ChainContext.Provider
      value={{
        chainId,
        currentAccount,
        connectWallet,
      }}
    >
      {children}
    </ChainContext.Provider>
  )
}
