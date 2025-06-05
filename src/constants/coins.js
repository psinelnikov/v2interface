import * as chains from "./chains";

// If you add coins for a new network, make sure Weth address (for the router you are using) is the first entry

const HYPERION_SEPOLIACoins = [
  {
    name: "Metis",
    abbr: "METIS",
    address: "0x94765A5Ad79aE18c6913449Bf008A0B5f247D301", // Weth address is fetched from the router
  },
  {
    name: "Tether USD",
    abbr: "USDT",
    address: "0x3c099E287eC71b4AA61A7110287D715389329237",
  },
  {
    name: "Dai",
    abbr: "DAI",
    address: "0xc4c33c42684ad16e84800c25d5dE7B650E9F95Ca",
  },
  {
    name: "Wrapped Ethereum",
    abbr: "WETH",
    address: "0x9AB236Ec38492099a4d35552e6dC7D9442607f9A",
  },
  {
    name: "Wrapped Bitcoin",
    abbr: "WBTC",
    address: "0x63d940F5b04235aba7E921a3b508aB1360D32706",
  },
];

const COINS = new Map();
COINS.set(chains.ChainId.HYPERION_SEPOLIA, HYPERION_SEPOLIACoins);
export default COINS;
