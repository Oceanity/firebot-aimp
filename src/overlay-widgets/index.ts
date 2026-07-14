import { OverlayWidgetType } from "@crowbartools/firebot-types";
import { AIMP_PLUGIN_ID } from "../constants";
import { CoverArtOverlayWidget } from "./cover-art";
import { PlayerPositionDurationOverlayWidget } from "./position-duration";
import { PlayerProgressBarOverlayWidget } from "./progress-bar";

export const AllAIMPOverlayWidgets: OverlayWidgetType<any, any>[] = [
  CoverArtOverlayWidget,
  PlayerPositionDurationOverlayWidget,
  PlayerProgressBarOverlayWidget,
].map((overlayWidget) => {
  overlayWidget.id = `${AIMP_PLUGIN_ID}:${overlayWidget.id}`;

  return overlayWidget;
});
