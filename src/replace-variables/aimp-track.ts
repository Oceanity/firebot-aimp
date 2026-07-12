import { ReplaceVariable } from "@crowbartools/firebot-types";
import { aimp } from "../main";
import { StoredTrackInfoKey } from "../types";

export const AIMPTrackReplaceVariable: ReplaceVariable = {
  definition: {
    handle: "aimpTrack",
    description: "Fetches all data about the current playing track in AIMP",
    usage: "aimpTrack[field]",
    possibleDataOutput: ["object", "text"],
    examples: ["title", "artist", "album", "genre"].map((key) => ({
      usage: `aimpTrack[${key}]`,
      description: `Outputs the ${key} of the currently playing track in AIMP or an empty string if nothing is playing`,
    })),
  },
  evaluator: async (_trigger, subject?: string) => {
    if (!aimp.socket.isConnected || aimp.player.info.state === "stopped") {
      return "";
    }

    if (typeof subject === "string" && subject in aimp.track.info) {
      return aimp.track.info[subject as StoredTrackInfoKey];
    }

    return aimp.track.info;
  },
};
