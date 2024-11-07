"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { useState } from "react";
import {
  createAssociatedTokenAccountIdempotentInstruction,
  createTransferCheckedInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import * as multisig from "@sqds/multisig";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Connection,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
  clusterApiUrl,
} from "@solana/web3.js";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { isPublickey } from "@/lib/isPublickey";

import { getRpcUrl, getMultisigAddress, getSquadsProgramID, getTokenProgramID, getVaultIndex } from "@/config/params";

type SendTokensProps = {
  tokenAccount: string;
  mint: string;
  decimals: number;
  rpcUrl: string;
  multisigPda: string;
  vaultIndex: number;
  programId?: string;
};

const SendTokens = ({
  tokenAccount,
  mint,
  decimals,
  rpcUrl,
  multisigPda,
  vaultIndex,
  programId,
}: SendTokensProps) => {
  const wallet = useWallet();
  const walletModal = useWalletModal();
  const [amount, setAmount] = useState(0);
  const [recipient, setRecipient] = useState("");
  const router = useRouter();

  const transfer = async () => {
    console.log("try set walletModal.setVisible=true");
    console.log(amount);
    const transfer_amount = Math.floor(amount * 10 ** decimals);
    console.log(transfer_amount);

    if (!wallet.publicKey) {
      walletModal.setVisible(true);
      return;
    }
    const recipientATA = getAssociatedTokenAddressSync(
      new PublicKey(mint),
      new PublicKey(recipient),
      true,
      new PublicKey(getTokenProgramID())
    );

    const vaultAddress = multisig
      .getVaultPda({
        index: vaultIndex,
        multisigPda: new PublicKey(multisigPda),
        programId: programId ? new PublicKey(programId) : multisig.PROGRAM_ID,
      })[0]
      .toBase58();

    const createRecipientATAInstruction =
      createAssociatedTokenAccountIdempotentInstruction(
        new PublicKey(vaultAddress),
        recipientATA,
        new PublicKey(recipient),
        new PublicKey(mint),
        new PublicKey(getTokenProgramID())
      );

    const transferInstruction = createTransferCheckedInstruction(
      new PublicKey(tokenAccount),
      new PublicKey(mint),
      recipientATA,
      new PublicKey(vaultAddress),
      transfer_amount,
      decimals,
      [],
      new PublicKey(getTokenProgramID())
    );

    const connection = new Connection(rpcUrl || clusterApiUrl("mainnet-beta"), {
      commitment: "confirmed",
    });

    const multisigInfo = await multisig.accounts.Multisig.fromAccountAddress(
      connection,
      new PublicKey(multisigPda)
    );

    const blockhash = (await connection.getLatestBlockhash()).blockhash;

    const transferMessage = new TransactionMessage({
      instructions: [createRecipientATAInstruction, transferInstruction],
      payerKey: wallet.publicKey,
      recentBlockhash: blockhash,
    });

    const transactionIndex = Number(multisigInfo.transactionIndex) + 1;
    const transactionIndexBN = BigInt(transactionIndex);

    const multisigTransactionIx = multisig.instructions.vaultTransactionCreate({
      multisigPda: new PublicKey(multisigPda),
      creator: wallet.publicKey,
      ephemeralSigners: 0,
      transactionMessage: transferMessage,
      transactionIndex: transactionIndexBN,
      addressLookupTableAccounts: [],
      rentPayer: wallet.publicKey,
      vaultIndex: vaultIndex,
    });

    console.log("vaultTransactionCreate done");

    const proposalIx = multisig.instructions.proposalCreate({
      multisigPda: new PublicKey(multisigPda),
      creator: wallet.publicKey,
      isDraft: false,
      transactionIndex: transactionIndexBN,
      rentPayer: wallet.publicKey,
      programId: programId ? new PublicKey(programId) : multisig.PROGRAM_ID,
    });
    console.log("proposalCreate done");

    const approveIx = multisig.instructions.proposalApprove({
      multisigPda: new PublicKey(multisigPda),
      member: wallet.publicKey,
      transactionIndex: transactionIndexBN,
      programId: programId ? new PublicKey(programId) : multisig.PROGRAM_ID,
    });
    console.log("proposalApprove done");

    const message = new TransactionMessage({
      instructions: [multisigTransactionIx, proposalIx, approveIx],
      payerKey: wallet.publicKey,
      recentBlockhash: blockhash,
    }).compileToV0Message();
    console.log("create new TransactionMessage done");

    const transaction = new VersionedTransaction(message);

    const signature = await wallet.sendTransaction(transaction, connection, {
      skipPreflight: true,
    });
    console.log("Transaction signature", signature);
    toast.loading("Confirming...", {
      id: "transaction",
    });
    await connection.getSignatureStatuses([signature]);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    router.refresh();
  };

  return (
    <Dialog>
      <DialogTrigger>
        <Button>Send Tokens</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer tokens</DialogTitle>
          <DialogDescription>
            Create a proposal to transfer tokens to another address.
          </DialogDescription>
        </DialogHeader>
        <Input
          placeholder="Recipient"
          type="text"
          onChange={(e) => setRecipient(e.target.value)}
        />
        {isPublickey(recipient) ? null : (
          <p className="text-xs">Invalid recipient address</p>
        )}
        <Input
          placeholder="Amount"
          type="number"
          onChange={(e) => setAmount(parseFloat(e.target.value))}
        />
        <Button
          onClick={() =>
            toast.promise(transfer, {
              id: "transaction",
              loading: "Loading...",
              success: "Transfer proposed.",
              error: (e) => `Failed to propose: ${e}`,
            })
          }
          disabled={!isPublickey(recipient)}
        >
          Transfer
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default SendTokens;
