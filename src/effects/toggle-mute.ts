import firebot, { EffectType } from "@crowbartools/firebot-types";
import { ToggleBooleanMode } from "../enums";
import { aimp } from "../main";
import optionsTemplate from "./toggle-mute.html";

type EffectModel = {
  mode: ToggleBooleanMode;
};

export const ToggleMuteEffectType: EffectType<EffectModel> = {
  definition: {
    id: `toggle-mute`,
    name: `AIMP - Mute`,
    description: `Enables, disables or toggles mute on the AIMP player`,
    icon: "fas fa-volume-mute",
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
    return `${verb} mute on AIMP player`;
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
      errors.push(`Choose a mode to change mute`);
    }
    return errors;
  },
  onTriggerEvent: async ({ effect }) => {
    if (!effect.mode) {
      firebot.logger.warn(`No 'mode' provided to change mute effect`);
    }

    const success = await aimp.rest.setMute(effect.mode);

    return {
      success,
    };
  },
};
