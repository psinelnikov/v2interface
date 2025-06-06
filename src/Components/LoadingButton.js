import React from "react";
import { Button, CircularProgress, makeStyles } from "@material-ui/core";
import green from "@material-ui/core/colors/green";

const useStyles = makeStyles((theme) => ({
  wrapper: {
    margin: 0,
    position: "relative",
  },
  progress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
  disabledButton: {
    backgroundColor: theme.palette.secondary.main + " !important",
    color: theme.palette.secondary.contrastText + " !important",
  },
}));

export default function LoadingButton(props) {
  const classes = useStyles();
  const { children, loading, valid, success, fail, onClick, ...other } = props;
  return (
    <div className={classes.wrapper}>
      <Button
        variant="contained"
        color="primary"
        fullWidth
        disabled={loading || !valid}
        type="submit"
        onClick={onClick}
        classes={{ disabled: classes.disabledButton }}
        {...other}
      >
        {children}
      </Button>
      {loading && <CircularProgress size={24} className={classes.progress} />}
    </div>
  );
}
