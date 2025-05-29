import React from "react";
import "./App.css";
import Web3Provider from "./network";
import NavBar from "./NavBar/NavBar";
import CoinSwapper from "./CoinSwapper/CoinSwapper";
import { Route } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import Liquidity from "./Liquidity/Liquidity";
import { createTheme, ThemeProvider } from "@material-ui/core";

const theme = createTheme({
  palette: {
    primary: {
      main: "#00CFFF",
      contrastText: "#000",
    },
    secondary: {
      main: "#000000",
      contrastText: "#9f9f9f",
    },
    background: {
      default: "#000000",
      paper: "#10141A",
    },
  },
});

const App = () => {
  return (
    <div className="App">
      <SnackbarProvider maxSnack={3}>
        <ThemeProvider theme={theme}>
          <Web3Provider
            render={(network) => (
              <div>
                <NavBar />
                <Route exact path="/">
                  <CoinSwapper network={network} />
                </Route>

                <Route exact path="/liquidity">
                  <Liquidity network={network} />
                </Route>
              </div>
            )}
          ></Web3Provider>
        </ThemeProvider>
      </SnackbarProvider>
    </div>
  );
};

export default App;
