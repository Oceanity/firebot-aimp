import firebot, { EffectType } from "@crowbartools/firebot-types";
import { ChangePlaybackMode } from "../enums";
import { aimp } from "../main";
import optionsTemplate from "./change-playback.html";

type EffectModel = {
  mode: ChangePlaybackMode;
};

export const ChangePlaybackEffectType: EffectType<EffectModel> = {
  definition: {
    id: "play-pause",
    name: "AIMP - Play/Pause",
    description: "Plays, pauses or toggles playback of AIMP player",
    icon: "far fa-play-circle",
    categories: ["integrations"],
  },
  getDefaultLabel: (effect) => {
    let verb = "Changing";
    switch (effect.mode) {
      case ChangePlaybackMode.Pause:
        verb = "Pausing";
        break;
      case ChangePlaybackMode.Play:
        verb = "Resuming";
        break;
      case ChangePlaybackMode.Toggle:
        verb = "Toggling";
        break;
    }
    return `${verb} AIMP playback`;
  },
  optionsTemplate,
  optionsController: ($scope) => {
    $scope.modes = {
      play: "Play",
      pause: "Pause",
      toggle: "Toggle",
    };
  },
  optionsValidator: (effect) => {
    const errors: string[] = [];
    if (!effect.mode) {
      errors.push("Choose a mode to change playback by");
    }
    return errors;
  },
  onTriggerEvent: async ({ effect }) => {
    if (!effect.mode) {
      firebot.logger.warn("No 'mode' provided to Change Playback State");
    }

    const success = await aimp.rest.setPlaybackState(effect.mode);

    return {
      success,
    };
  },
};
