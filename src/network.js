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
  const [isConnected, setConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);

  // Use refs for network data
  const networkRef = useRef({
    provider: null,
    signer: null,
    account: null,
    coins: [],
    chainID: null,
    router: null,
    factory: null,
    weth: null,
  });

  // Hyperion Testnet configuration
  const HYPERION_TESTNET = {
    id: 133717,
    name: "Hyperion Testnet",
    nativeCurrency: { name: "tMETIS", symbol: "tMETIS", decimals: 18 },
    rpcUrls: {
      default: { http: ["https://hyperion-testnet.metisdevops.link/"] },
    },
    blockExplorers: {
      default: {
        name: "Hyperion Testnet Explorer",
        url: "https://hyperion-testnet-explorer.metisdevops.link/",
      },
    },
  };

  const backgroundListener = useRef(null);

  // Check if wallet is available
  const isWalletAvailable = useCallback(() => {
    return typeof window !== "undefined" && window.ethereum;
  }, []);

  // Request wallet connection
  const requestWalletConnection = useCallback(async () => {
    if (!isWalletAvailable()) {
      throw new Error("No wallet detected");
    }

    try {
      // Request account access
      await window.ethereum.request({ method: "eth_requestAccounts" });
      return true;
    } catch (error) {
      console.error("User rejected wallet connection:", error);
      return false;
    }
  }, [isWalletAvailable]);

  const setupConnection = useCallback(async () => {
    try {
      if (!isWalletAvailable()) {
        setConnected(false);
        setIsLoading(false);
        return;
      }

      // Try to connect to wallet first
      const connected = await requestWalletConnection();
      if (!connected) {
        setConnected(false);
        setIsLoading(false);
        return;
      }

      // Create provider - try both ethers v5 and v6 syntax
      let provider;
      try {
        // Ethers v6 syntax
        provider = new ethers.BrowserProvider(window.ethereum);
      } catch (e) {
        // Fallback to ethers v5 syntax
        provider = new ethers.providers.Web3Provider(window.ethereum);
      }

      networkRef.current.provider = provider;
      networkRef.current.signer = await provider.getSigner();

      // Get account
      const account = await getAccount();
      networkRef.current.account = account;

      // Get network
      const chainId = await getNetwork(provider);
      networkRef.current.chainID = chainId;

      if (chains.networks.includes(chainId)) {
        // Get the router using the chainID
        networkRef.current.router = await getRouter(
          chains.routerAddress.get(chainId),
          networkRef.current.signer
        );

        // Get the default coins for the chain
        networkRef.current.coins = COINS.get(chainId);

        // Get the WETH address for the chain
        const wethAddress = networkRef.current.coins[0].address;
        networkRef.current.weth = getWeth(
          wethAddress,
          networkRef.current.signer
        );

        // Set the value of the weth address in the default coins array
        networkRef.current.coins[0].address = wethAddress;

        // Get the factory address from the router
        const factory_address = await networkRef.current.router.factory();
        networkRef.current.factory = getFactory(
          factory_address,
          networkRef.current.signer
        );

        setConnected(true);
      } else {
        console.warn(`Unsupported chain ID: ${chainId}`);
        setConnected(false);
      }
    } catch (error) {
      console.error("Setup connection error:", error);
      setConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [isWalletAvailable, requestWalletConnection]);

  const createListener = useCallback(() => {
    return setInterval(async () => {
      try {
        if (!isWalletAvailable()) {
          setConnected(false);
          return;
        }

        // Check if accounts have changed
        const currentAccount = await getAccount();
        if (currentAccount !== networkRef.current.account) {
          console.log("Account changed, reconnecting...");
          await setupConnection();
          return;
        }

        // Check if chain has changed
        const currentChainId = await getNetwork(networkRef.current.provider);
        if (currentChainId !== networkRef.current.chainID) {
          console.log("Chain changed, reconnecting...");
          await setupConnection();
          return;
        }
      } catch (error) {
        console.error("Background listener error:", error);
        setConnected(false);
        await setupConnection();
      }
    }, 2000); // Reduced frequency to 2 seconds
  }, [setupConnection, isWalletAvailable]);

  // Switch to Hyperion Testnet
  const switchToHyperionTestnet = useCallback(async () => {
    if (!isWalletAvailable()) {
      throw new Error("No wallet detected");
    }

    setIsSwitchingNetwork(true);

    try {
      const chainIdHex = `0x${HYPERION_TESTNET.id.toString(16)}`;

      // Try to switch to the network
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: chainIdHex }],
        });
        console.log("Successfully switched to Hyperion Testnet");
      } catch (switchError) {
        // If the network doesn't exist, add it
        if (switchError.code === 4902 || switchError.code === -32603) {
          console.log("Network not found, adding Hyperion Testnet...");

          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: chainIdHex,
                chainName: HYPERION_TESTNET.name,
                nativeCurrency: HYPERION_TESTNET.nativeCurrency,
                rpcUrls: HYPERION_TESTNET.rpcUrls.default.http,
                blockExplorerUrls: [
                  HYPERION_TESTNET.blockExplorers.default.url,
                ],
              },
            ],
          });
          console.log("Successfully added and switched to Hyperion Testnet");
        } else {
          throw switchError;
        }
      }

      // Wait a bit for the network to fully switch
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Reconnect after network switch
      await setupConnection();
    } catch (error) {
      console.error("Failed to switch to Hyperion Testnet:", error);
      throw error;
    } finally {
      setIsSwitchingNetwork(false);
    }
  }, [
    isWalletAvailable,
    setupConnection,
    HYPERION_TESTNET.blockExplorers.default.url,
    HYPERION_TESTNET.id,
    HYPERION_TESTNET.name,
    HYPERION_TESTNET.nativeCurrency,
    HYPERION_TESTNET.rpcUrls.default.http,
  ]);

  // Generic network switch function
  const switchNetwork = useCallback(
    async (networkConfig) => {
      if (!isWalletAvailable()) {
        throw new Error("No wallet detected");
      }

      setIsSwitchingNetwork(true);

      try {
        const chainIdHex = `0x${networkConfig.id.toString(16)}`;

        // Try to switch to the network
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: chainIdHex }],
          });
          console.log(`Successfully switched to ${networkConfig.name}`);
        } catch (switchError) {
          // If the network doesn't exist, add it
          if (switchError.code === 4902 || switchError.code === -32603) {
            console.log(`Network not found, adding ${networkConfig.name}...`);

            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: chainIdHex,
                  chainName: networkConfig.name,
                  nativeCurrency: networkConfig.nativeCurrency,
                  rpcUrls: networkConfig.rpcUrls.default.http,
                  blockExplorerUrls: [networkConfig.blockExplorers.default.url],
                },
              ],
            });
            console.log(
              `Successfully added and switched to ${networkConfig.name}`
            );
          } else {
            throw switchError;
          }
        }

        // Wait a bit for the network to fully switch
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Reconnect after network switch
        await setupConnection();
      } catch (error) {
        console.error(`Failed to switch to ${networkConfig.name}:`, error);
        throw error;
      } finally {
        setIsSwitchingNetwork(false);
      }
    },
    [isWalletAvailable, setupConnection]
  );

  useEffect(() => {
    let mounted = true;

    async function initialSetup() {
      console.log("Initializing Web3 connection...");

      if (!mounted) return;

      await setupConnection();

      if (!mounted) return;

      // Start background listener
      if (backgroundListener.current) {
        clearInterval(backgroundListener.current);
      }

      const listener = createListener();
      backgroundListener.current = listener;
    }

    initialSetup();

    // Listen to wallet events
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        console.log("Accounts changed:", accounts);
        if (accounts.length === 0) {
          setConnected(false);
        } else {
          setupConnection();
        }
      };

      const handleChainChanged = (chainId) => {
        console.log("Chain changed:", chainId);
        setupConnection();
      };

      const handleDisconnect = () => {
        console.log("Wallet disconnected");
        setConnected(false);
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
      window.ethereum.on("disconnect", handleDisconnect);

      return () => {
        mounted = false;
        if (backgroundListener.current) {
          clearInterval(backgroundListener.current);
        }
        if (window.ethereum) {
          window.ethereum.removeListener(
            "accountsChanged",
            handleAccountsChanged
          );
          window.ethereum.removeListener("chainChanged", handleChainChanged);
          window.ethereum.removeListener("disconnect", handleDisconnect);
        }
      };
    }

    return () => {
      mounted = false;
      if (backgroundListener.current) {
        clearInterval(backgroundListener.current);
      }
    };
  }, [setupConnection, createListener]);

  const renderNotConnected = () => {
    return (
      <div className="App">
        <div>
          <ConnectWalletPage />
          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <button
              onClick={switchToHyperionTestnet}
              disabled={isSwitchingNetwork}
              style={{
                padding: "10px 20px",
                backgroundColor: "#00CFFF",
                color: "black",
                border: "none",
                borderRadius: "5px",
                cursor: isSwitchingNetwork ? "not-allowed" : "pointer",
                opacity: isSwitchingNetwork ? 0.6 : 1,
              }}
            >
              {isSwitchingNetwork
                ? "Switching..."
                : "Switch to Hyperion Testnet"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderLoading = () => {
    return (
      <div className="App">
        <div>
          {isSwitchingNetwork
            ? "Switching network..."
            : "Connecting to wallet..."}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return renderLoading();
  }

  return (
    <>
      {!isConnected && renderNotConnected()}
      {isConnected && (
        <div>
          {props.render({
            ...networkRef.current,
            switchToHyperionTestnet,
            switchNetwork,
            isSwitchingNetwork,
            HYPERION_TESTNET,
          })}
        </div>
      )}
    </>
  );
};

export default Web3Provider;
