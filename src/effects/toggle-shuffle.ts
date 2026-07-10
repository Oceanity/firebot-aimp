import firebot, { EffectType } from "@crowbartools/firebot-types";
import { ToggleBooleanMode } from "../enums";
import { aimp } from "../main";
import optionsTemplate from "./toggle-shuffle.html";

type EffectModel = {
  mode: ToggleBooleanMode;
};

export const ToggleShuffleEffectType: EffectType<EffectModel> = {
  definition: {
    id: `toggle-shuffle`,
    name: `AIMP - Shuffle`,
    description: `Enables, disables or toggles shuffle on the AIMP player`,
    icon: "fas fa-question",
    categories: ["integrations"],
  },
  getDefaultLabel: (effect) => {
    let verb = "Changing";
    switch (effect.mode) {
      case ToggleBooleanMode.Enable:
        verb = "Enabling";
        break;
      case ToggleBooleanMode.Disable:
        verb = "Disabling";
        break;
      case ToggleBooleanMode.Toggle:
        verb = "Toggling";
        break;
    }
    return `${verb} shuffle on AIMP player`;
  },
  optionsTemplate,
  optionsController: ($scope) => {
    $scope.modes = {
      [ToggleBooleanMode.Enable]: "Enable",
      [ToggleBooleanMode.Disable]: "Disable",
      [ToggleBooleanMode.Toggle]: "Toggle",
    };
  },
  optionsValidator: (effect) => {
    const errors: string[] = [];
    if (!effect.mode) {
      errors.push(`Choose a mode to change shuffle`);
    }
    return errors;
  },
  onTriggerEvent: async ({ effect }) => {
    if (!effect.mode) {
      firebot.logger.warn(`No 'mode' provided to change shuffle effect`);
    }

    const success = await aimp.rest.setShuffle(effect.mode);

    return {
      success,
    };
  },
};
