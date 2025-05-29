import { useEffect, useState, useRef, useCallback } from "react";
import { ethers } from "ethers";
import ConnectWalletPage from "./Components/connectWalletPage";
import {
  getAccount,
  getFactory,
  getRouter,
  getNetwork,
  getWeth,
} from "./ethereumFunctions";
import COINS from "./constants/coins";
import * as chains from "./constants/chains";

const Web3Provider = (props) => {
  const [isConnected, setConnected] = useState(true);
  let network = Object.create({});
  network.provider = useRef(null);
  network.signer = useRef(null);
  network.account = useRef(null);
  network.coins = [];
  network.chainID = useRef(null);
  network.router = useRef(null);
  network.factory = useRef(null);
  network.weth = useRef(null);
  const backgroundListener = useRef(null);

  const setupConnection = useCallback(async () => {
    try {
      console.log("lets go!");
      network.provider = new ethers.providers.Web3Provider(window.ethereum);
      network.signer = await network.provider.getSigner();
      await getAccount().then(async (result) => {
        network.account = result;
      });

      await getNetwork(network.provider).then(async (chainId) => {
        // Set chainID
        network.chainID = chainId;
        if (chains.networks.includes(chainId)) {
          // Get the router using the chainID
          network.router = await getRouter(
            chains.routerAddress.get(chainId),
            network.signer
          );
          // Get the default coins for the chain
          network.coins = COINS.get(chainId);
          // Get the WETH address for the chain
          const wethAddress = network.coins[0].address;
          network.weth = getWeth(wethAddress, network.signer);
          // Set the value of the weth address in the default coins array
          network.coins[0].address = wethAddress;
          // Get the factory address from the router
          await network.router.factory().then((factory_address) => {
            network.factory = getFactory(factory_address, network.signer);
          });
          setConnected(true);
        } else {
          console.log("Wrong network mate.");
          setConnected(false);
        }
      });
    } catch (e) {
      console.log(e);
    }
  }, [network]);

  const createListener = useCallback(() => {
    return setInterval(async () => {
      // console.log("Heartbeat");
      try {
        // Check the account has not changed
        const account = await getAccount();
        if (account !== network.account) {
          await setupConnection();
        }
        // const chainID = await getNetwork(network.provider);
        // if (chainID !== network.chainID){
        //   setConnected(false);
        //   await setupConnection();
        // }
      } catch (e) {
        setConnected(false);
        await setupConnection();
      }
    }, 1000);
  }, [network, setupConnection]);

  useEffect(() => {
    async function initialSetup() {
      // Initial setup
      console.log("Initial hook");
      await setupConnection();
      console.log("network: ", network);

      // Start background listener
      if (backgroundListener.current != null) {
        clearInterval(backgroundListener.current);
      }
      const listener = createListener();
      backgroundListener.current = listener;
    }
    initialSetup();
    return () => clearInterval(backgroundListener.current);
  }, [createListener, network, setupConnection]);

  const renderNotConnected = () => {
    console.log("Rendering");
    return (
      <div className="App">
        <div>
          <ConnectWalletPage />
        </div>
      </div>
    );
  };

  return (
    <>
      {!isConnected && renderNotConnected()}
      {isConnected && <div> {props.render(network)}</div>}
    </>
  );
};

export default Web3Provider;
