import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { cookies, headers } from "next/headers";
import * as multisig from "@sqds/multisig";
import { TokenList } from "@/components/TokenList";
import { VaultDisplayer } from "@/components/VaultDisplayer";
import ConnectWallet from "@/components/ConnectWalletButton";
import { getRpcUrl, getMultisigAddress, getSquadsProgramID, getTokenProgramID, getVaultIndex } from "@/config/params";

export default async function Home() {
  //const rpcUrl = headers().get("x-rpc-url");
  const rpcUrl = getRpcUrl();

  const connection = new Connection(rpcUrl || clusterApiUrl("mainnet-beta"));

  // const multisigCookie = headers().get("x-multisig");
  const multisigCookie = getMultisigAddress();

  const multisigPda = new PublicKey(multisigCookie!);

  // const vaultIndex = Number(headers().get("x-vault-index"));
  const vaultIndex = Number(getVaultIndex());

  //const programIdCookie = cookies().get("x-program-id")?.value;
  const programIdCookie = getSquadsProgramID();

  const programId = programIdCookie
    ? new PublicKey(programIdCookie!)
    : multisig.PROGRAM_ID;

  const multisigVault = multisig.getVaultPda({
    multisigPda,
    index: vaultIndex || 0,
    programId: programId ? programId : multisig.PROGRAM_ID,
  })[0];

  const solBalance = await connection.getBalance(multisigVault);

  const tokensInWallet = await connection.getParsedTokenAccountsByOwner(
    multisigVault,
    {
      // normal standard token without extension meta.
      //programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),

      // new standard token with extension metadata support.
      // programId: new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"),

      programId: new PublicKey(getTokenProgramID()),
    }
  );

  return (
    <main className="">
      <div>
        <h1 className="text-3xl font-bold mb-4">Overview</h1>

        <VaultDisplayer
          multisigPdaString={multisigCookie!}
          vaultIndex={vaultIndex || 0}
          programId={programIdCookie!}
        />
        <TokenList
          solBalance={solBalance}
          tokens={tokensInWallet}
          rpcUrl={rpcUrl!}
          multisigPda={multisigCookie!}
          vaultIndex={vaultIndex || 0}
          programId={programIdCookie!}
        />

<ConnectWallet />
      </div>
    </main>
  );
}
