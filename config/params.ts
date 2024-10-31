// to use this config file: 
// import { getRpcUrl, getMultisigAddress, getSquadsProgramID, getTokenProgramID, getVaultIndex } from "@/config/params";

export function getRpcUrl() {
  // return "https://api.mainnet-beta.solana.com";
  return "http://easybeautify.cn:8080";
}

export function getMultisigAddress() {
    return "BKziCKQawwqArkhdWBY7mbLPQaW9Rae9SdqS1dpM6iGD";
}

export function getSquadsProgramID() {
    return "SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf";
}

export function getTokenProgramID() {
    // normal standard token without extension meta.
    // return "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";

    // new standard token with extension metadata support.
    return "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";
}

export function getVaultIndex() {
    return 0;
}