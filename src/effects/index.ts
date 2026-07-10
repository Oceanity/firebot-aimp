import { EffectType } from "@crowbartools/firebot-types";
import { AIMP_PLUGIN_ID } from "../constants";
import { ChangePlaybackEffectType } from "./change-playback";
import { SetVolumeEffectType } from "./set-volume";
import { ToggleMuteEffectType } from "./toggle-mute";
import { ToggleRepeatEffectType } from "./toggle-repeat";
import { ToggleShuffleEffectType } from "./toggle-shuffle";

export const AllAIMPEffectTypes: EffectType<any>[] = [
  ChangePlaybackEffectType,
  ToggleMuteEffectType,
  SetVolumeEffectType,
  ToggleRepeatEffectType,
  ToggleShuffleEffectType,
].map((effectType) => {
  effectType.definition.id = `${AIMP_PLUGIN_ID}:${effectType.definition.id}`;

  return effectType;
});
