import { ReplaceVariable } from "@crowbartools/firebot-types";
import { aimp } from "../main";

export const AIMPIsConnectedReplaceVariable: ReplaceVariable = {
  definition: {
    handle: "aimpIsConnected",
    description:
      "Returns `true` if the AIMP WebSocket client is currently connected",
    usage: "aimpIsConnected",
    possibleDataOutput: ["bool"],
  },
  evaluator: async (_trigger) => {
    return aimp.socket.isConnected;
  },
};
