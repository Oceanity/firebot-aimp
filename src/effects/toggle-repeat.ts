import firebot, { EffectType } from "@crowbartools/firebot-types";
import { ToggleBooleanMode } from "../enums";
import { aimp } from "../main";
import optionsTemplate from "./toggle-repeat.html";

type EffectModel = {
  mode: ToggleBooleanMode;
};

export const ToggleRepeatEffectType: EffectType<EffectModel> = {
  definition: {
    id: `toggle-repeat`,
    name: `AIMP - Repeat`,
    description: `Enables, disables or toggles repeat on the AIMP player`,
    icon: "fas fa-repeat",
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
    return `${verb} repeat on AIMP player`;
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
      errors.push(`Choose a mode to change repeat`);
    }
    return errors;
  },
  onTriggerEvent: async ({ effect }) => {
    if (!effect.mode) {
      firebot.logger.warn(`No 'mode' provided to change repeat effect`);
    }

    const success = await aimp.rest.setRepeat(effect.mode);

    return {
      success,
    };
  },
};
