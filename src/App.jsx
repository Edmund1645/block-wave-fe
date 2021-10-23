import React, { useEffect, useState } from 'react'

import { ethers } from 'ethers';

import abi from './utils/WavePortal.json'

function App() {
  const [loading, setLoading] = useState(false);
  const [currentAccount, setCurrentAccount] = useState('');
  const [waveText, setWaveText] = useState('');
  const [allWaves, setAllWaves] = useState([]);
  const contractAddress = '0xCa74Fa9cE5303C9Ead147DE002bA48dFb797f200'
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

        wavesCleaned.reverse();

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
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const wavePortalContract = new ethers.Contract(contractAddress, contractsABI, signer)
      setLoading(true);
      const waveTxn = await wavePortalContract.wave(waveText, { gasLimit: 300000 })
      await waveTxn.wait()// wait for transaction to be mined;
      setLoading(false)
      window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank');
      setWaveText('');
      getAllWaves();
    } catch (err) {
      setLoading(false);
    }
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

        <button disabled={loading} className="mt-4 rounded-md p-4 border-0 disabled:cursor-not-allowed disabled:text-black disabled:bg-gray-200 bg-purple-500 text-white" onClick={wave}>
          { loading? 'loading': 'Wave at Me'}
        </button>

        {allWaves.map((wave, index) => {
          return (
            <div key={index} className="mt-5 bg-purple-200 border rounded border-purple-500 p-4">
              <div>From: {wave.address}</div>
              <div>Time: {wave.timestamp.toLocaleString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })}

      </div>
    </div>
  );
}

export default App;
