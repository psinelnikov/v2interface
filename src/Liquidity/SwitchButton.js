import React from "react";
import { ButtonGroup, Button } from "@material-ui/core";

export default function SwitchButton(props) {
  const { setDeploy } = props;

  const changeStyles = (K) => {
    if (K === true) {
      let add_button = document.getElementById("add-button");
      add_button.style.backgroundColor = "#00CFFF";
      add_button.style.color = "#000";

      let remove_button = document.getElementById("remove-button");
      remove_button.style.backgroundColor = "#000000";
      remove_button.style.color = "#fff";
    } else {
      let remove_button = document.getElementById("remove-button");
      remove_button.style.backgroundColor = "#00CFFF";
      remove_button.style.color = "#000";

      let add_button = document.getElementById("add-button");
      add_button.style.backgroundColor = "#000000";
      add_button.style.color = "#fff";
    }
  };

  return (
    <div>
      <ButtonGroup size="large" variant="contained">
        <Button
          id="add-button"
          color="primary"
          text="white"
          onClick={() => {
            setDeploy(true);
            changeStyles(true);
          }}
        >
          Deploy Liquidity
        </Button>

        <Button
          id="remove-button"
          color="secondary"
          text="white"
          onClick={() => {
            setDeploy(false);
            changeStyles(false);
          }}
          style={{ color: "#fff" }}
        >
          Remove Liquidity
        </Button>
      </ButtonGroup>
    </div>
  );
}
