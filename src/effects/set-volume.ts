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
    if (!effect.volume) {
      firebot.logger.warn("No 'mode' provided to Change Playback State");
    }

    const success = await aimp.rest.setVolume(parseInt(effect.volume));

    return {
      success,
    };
  },
};
