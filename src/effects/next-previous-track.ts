import firebot, { EffectType } from "@crowbartools/firebot-types";
import { SkipMode } from "../enums";
import { aimp } from "../main";
import optionsTemplate from "./next-previous-track.html";

type EffectModel = {
  mode: SkipMode;
};

export const NextPreviousTrackEffectType: EffectType<EffectModel> = {
  definition: {
    id: "next-previous-track",
    name: "AIMP - Next/Previous Track",
    description: "Skips to the next or previous track",
    icon: "fas fa-forward",
    categories: ["integrations"],
  },
  getDefaultLabel: (effect) => {
    return `Skipping to ${effect.mode} track.`;
  },
  optionsController: ($scope) => {
    $scope.modes = {
      [SkipMode.Next]: "Next",
      [SkipMode.Previous]: "Previous",
    };
  },
  optionsTemplate,
  onTriggerEvent: async ({ effect }) => {
    let success: boolean = false;
    switch (effect.mode) {
      case SkipMode.Next: {
        success = await aimp.rest.nextTrack();
        break;
      }

      case SkipMode.Previous: {
        success = await aimp.rest.previousTrack();
        break;
      }

      default: {
        firebot.logger.warn(
          `Invalid 'mode' ${effect.mode} provided to Next/Previous Track Effect`,
        );
        break;
      }
    }

    return {
      success,
    };
  },
};
