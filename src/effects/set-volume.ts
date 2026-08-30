import firebot, { EffectType } from "@crowbartools/firebot-types";
import { aimp } from "../main";
import optionsTemplate from "./set-volume.html";

type EffectModel = {
  volume: string;
};

export const SetVolumeEffectType: EffectType<EffectModel> = {
  definition: {
    id: "set-volume",
    name: "AIMP - Set Volume",
    description: "Sets the volume of the connected AIMP player",
    icon: "fas fa-volume",
    categories: ["integrations"],
  },
  getDefaultLabel: (effect) => {
    return `Setting AIMP volume to: ${effect.volume ?? "Unspecified"}`;
  },
  optionsTemplate,
  optionsValidator: (effect) => {
    const errors: string[] = [];
    if (!effect.volume) {
      errors.push("Enter a volume to set the player to");
    }
    return errors;
  },
  onTriggerEvent: async ({ effect }) => {
    try {
      if (!effect.volume) {
        throw new Error("No 'volume' provided to Set Volume");
      }

      const volumeInt = parseInt(effect.volume);
      if (isNaN(volumeInt)) {
        throw new Error(
          `Invalid 'volume' ${effect.volume} provided to Set Volume`,
        );
      }

      const success = await aimp.rest.setVolume(volumeInt);

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
