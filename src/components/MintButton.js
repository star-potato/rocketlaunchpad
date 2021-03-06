import log from "loglevel";
import React from "react";
import {
  useRecoilValueLoadable,
  useResetRecoilState,
  useSetRecoilState,
} from "recoil";
import "./MintButton.css";
import {
  keplrDerviedState,
  newTokenAddedSelector,
  mintedCountState,
  mintErrorDetails,
} from "../state";
import AsyncNftHelper from "../utils/AsyncNftHelper";

const mintStates = {
  loaded: {
    label: "Launch",
    disabled: false,
    loading: false,
  },
  loading: {
    label: "Loading...",
    disabled: true,
    loading: true,
  },
  minting: {
    label: "Launching...",
    disabled: true,
    loading: true,
  },
  error: {
    label: "Error",
    disabled: true,
    loading: false,
  },
  mint_error: {
    label: "Launch Error",
    disabled: true,
    loading: false,
  },
};

function MintButton() {
  const resetMintedCount = useResetRecoilState(mintedCountState);
  const kState = useRecoilValueLoadable(keplrDerviedState);
  const setKeplrState = useSetRecoilState(keplrDerviedState);
  const setNewToken = useSetRecoilState(newTokenAddedSelector);
  const setMintErrorDetails = useSetRecoilState(mintErrorDetails);

  const buttonState =
    kState.map((s) => mintStates[s]).valueMaybe() || mintStates.loading;

  const Mint = async () => {
    setKeplrState("minting");
    const nftHelper = await AsyncNftHelper.getInstance();
    try {
      nftHelper
        .mintSender()
        .then((tokenId) => {
          setNewToken(tokenId);
          resetMintedCount();
          setKeplrState("loaded");
        })
        .catch((e) => {
          if (e.message === "Request rejected") {
            log.debug("Request rejected, reloading");
            setKeplrState("loaded");
          } else {
            log.error(e);
            setKeplrState("mint_error");
            setMintErrorDetails(e.message);
          }
        });
    } catch (e) {
      setKeplrState("mint_error");
      setMintErrorDetails(e.message);
    }
  };
  return (
    <button
      className="mintButton"
      aria-busy={buttonState.loading}
      disabled={buttonState.disabled}
      onClick={Mint}
    >
      {buttonState.label}
    </button>
  );
}

export default MintButton;
