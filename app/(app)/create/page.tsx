import CreateSquadForm from "@/components/CreateSquadForm";
import { Card, CardContent } from "@/components/ui/card";
import { headers } from "next/headers";

import { getRpcUrl, getMultisigAddress, getSquadsProgramID, getTokenProgramID, getVaultIndex } from "@/config/params";

export default async function CreateSquad() {
  //const rpcUrl = headers().get("x-rpc-url");
  const rpcUrl = getRpcUrl();

  return (
    <div className="">
      <div className="flex-col space-y-1 mb-4">
        <h1 className="text-3xl font-bold">Create a Squad</h1>
        <h3 className="text-base text-slate-500">
          Create a Squad and set it as your default account.
        </h3>
      </div>
      <Card className="pt-5">
        <CardContent>
          <CreateSquadForm rpc={rpcUrl!} />
        </CardContent>
      </Card>
    </div>
  );
}
