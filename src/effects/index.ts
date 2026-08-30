import { EffectType } from "@crowbartools/firebot-types";
import { AIMP_PLUGIN_ID } from "../constants";
import { ChangePlaybackEffectType } from "./change-playback";
import { NextPreviousTrackEffectType } from "./next-previous-track";
import { SeekToPositionEffectType } from "./seek-to-position";
import { SetVolumeEffectType } from "./set-volume";
import { ToggleMuteEffectType } from "./toggle-mute";
import { ToggleRepeatEffectType } from "./toggle-repeat";
import { ToggleShuffleEffectType } from "./toggle-shuffle";

export const AllAIMPEffectTypes: EffectType<any>[] = [
  ChangePlaybackEffectType,
  NextPreviousTrackEffectType,
  SeekToPositionEffectType,
  SetVolumeEffectType,
  ToggleMuteEffectType,
  ToggleRepeatEffectType,
  ToggleShuffleEffectType,
].map((effectType) => {
  effectType.definition.id = `${AIMP_PLUGIN_ID}:${effectType.definition.id}`;

  return effectType;
});
