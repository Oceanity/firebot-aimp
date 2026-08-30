import firebot, { EffectType } from "@crowbartools/firebot-types";
import { aimp } from "../main";
import optionsTemplate from "./seek-to-position.html";

type EffectModel = {
  position: string;
};

export const SeekToPositionEffectType: EffectType<EffectModel> = {
  definition: {
    id: "seek-to-position",
    name: "AIMP - Seek to Position",
    description:
      "Seeks to a position in the currently playing track of the connected AIMP player",
    icon: "fas fa-forward",
    categories: ["integrations"],
  },
  getDefaultLabel: (effect) => {
    return `Seeking AIMP track to: ${effect.position ?? "Unspecified"}`;
  },
  optionsTemplate,
  optionsValidator: (effect) => {
    const errors: string[] = [];
    if (!effect.position) {
      errors.push("Enter a position to seek the player to");
    }
    return errors;
  },
  onTriggerEvent: async ({ effect }) => {
    try {
      if (!effect.position) {
        throw new Error("No 'position' provided to Seek to Position");
      }

      const positionInt = parseInt(effect.position);
      if (isNaN(positionInt)) {
        throw new Error(
          `Invalid 'position' ${effect.position} provided to Seek to Position`,
        );
      }

      const success = await aimp.rest.seek(positionInt * 1000);

      return {
        success,
      };
    } catch (error) {
      firebot.logger.warn((error as Error).message);

      return {
        success: false,
      };
    }
  },
};
