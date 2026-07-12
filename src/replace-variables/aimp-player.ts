import { ReplaceVariable } from "@crowbartools/firebot-types";
import { aimp } from "../main";
import { StoredPlayerInfoKey } from "../types";

export const AIMPPlayerReplaceVariable: ReplaceVariable = {
  definition: {
    handle: "aimpPlayer",
    description: "Fetches all data about the connected AIMP player",
    usage: "aimpPlayer[field]",
    possibleDataOutput: ["object", "text", "number"],
    examples: [
      {
        usage: "aimpPlayer[mute]",
        description: "Returns `true` if the AIMP Player is muted",
      },
    ],
  },
  evaluator: async (_trigger, subject?: string) => {
    if (typeof subject === "string" && subject in aimp.player.info) {
      return aimp.player.info[subject as StoredPlayerInfoKey];
    }

    return aimp.player.info;
  },
};
