import React, { useEffect, useState } from 'react'

import { ethers } from 'ethers';

import abi from './utils/WavePortal.json'

function App() {
  const [currentAccount, setCurrentAccount] = useState('');
  const [waveText, setWaveText] = useState('');
  const [allWaves, setAllWaves] = useState([]);
  const contractAddress = '0x975fBC5D0a4635a255a7bec979e9b8c72FA42995'
  const contractsABI = abi.abi




  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const waveportalContract = new ethers.Contract(contractAddress, contractsABI, signer);

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const waves = await waveportalContract.getAllWaves();
        

        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let wavesCleaned = [];
        waves.forEach(wave => {
          console.log(wave)
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        /*
         * Store our data in React State
         */
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const wave = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const wavePortalContract = new ethers.Contract(contractAddress, contractsABI, signer)

    let count = await wavePortalContract.getTotalWaves();

    console.log("Retrieved total account:", count.toNumber())

    const waveTxn = await wavePortalContract.wave(waveText)
    console.log(waveTxn)
    console.log('mining...', waveTxn.hash)
    await waveTxn.wait()
    console.log('mined...', waveTxn.hash)

    count = await wavePortalContract.getTotalWaves();
    console.log('total count:', count.toNumber())

    setWaveText('');
    getAllWaves();
  };

    const checkIfWalletIsConnected = () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log('No Metamask')
      return;
    } else {
      console.log('we have the eth object', ethereum)
    }

    ethereum.request({ method: 'eth_accounts' }).then(accounts => {
      if (accounts.length > 0) {
        const account = accounts[0]
        console.log('found one authorized account', account)
        setCurrentAccount(account)
        getAllWaves();
      } else {
        console.log('No authorized account found')
      }
    })
  };

  const connectWallet = () => {
    const { ethereum } = window;

    if (!ethereum) {
      alert("Get Metamask!")
      return;
    }
    ethereum.request({ method: 'eth_requestAccounts' }).then(accounts => {
      const account = accounts[0]
      console.log('connected', account)
      setCurrentAccount(account)
      getAllWaves();
    }).catch(err => console.log(err))
  };

  useEffect(() => {
    checkIfWalletIsConnected()
  }, [])
  return (
    <div className="flex justify-center w-full mt-16">
      <div className="flex flex-col justify-center max-w-screen-sm">
        <div className="text-center font-semibold text-3xl">👋 Hey there!</div>

        <div className="text-center mt-4 text-gray-500">I am Edmund and I like playing on the blockchain. Connect your Ethereum wallet and wave at me!</div>

        {currentAccount ? null : (
          <button className="mt-4 rounded-md p-4 border-0 bg-blue-200" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {currentAccount && <p className="text-center p-2 rounded-md bg-yellow-100">Connected {currentAccount}</p>}

        <input className='border border-gray-300 mt-5 p-3' placeholder='Enter a message' onChange={(e) => setWaveText(e.target.value)} value={waveText} type="text" />

        <button className="mt-4 rounded-md p-4 border-0 bg-gray-200" onClick={wave}>
          Wave at Me
        </button>

        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })}

      </div>
    </div>
  );
}

export default App;
