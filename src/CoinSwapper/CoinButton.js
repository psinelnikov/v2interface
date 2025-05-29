import React from "react";
import { ButtonBase, Grid, makeStyles, Typography } from "@material-ui/core";
import PropTypes from "prop-types";

const useStyles = makeStyles((theme) => ({
  button: {
    width: "100%",
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
    color: "#fff", // Softer light gray text
    backgroundColor: "#263238", // Much darker blue-gray
    borderRadius: theme.spacing(1),
    "&:hover, &$focusVisible": {
      backgroundColor: "#11171a", // Even darker on hover
    },
  },
  coinName: {
    opacity: 0.8,
    color: "#e0e0e0", // Softer light gray for coin name
  },
}));

CoinButton.propTypes = {
  coinName: PropTypes.string.isRequired,
  coinAbbr: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default function CoinButton(props) {
  const { coinName, coinAbbr, onClick } = props;
  const classes = useStyles();

  return (
    <ButtonBase focusRipple className={classes.button} onClick={onClick}>
      <Grid container direction="column">
        <Typography variant="h6">{coinAbbr}</Typography>
        <Typography variant="body2" className={classes.coinName}>
          {coinName}
        </Typography>
      </Grid>
    </ButtonBase>
  );
}
