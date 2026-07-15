import { OverlayWidgetType } from "@crowbartools/firebot-types";
import { AIMP_PLUGIN_ID } from "../constants";
import { CoverArtOverlayWidget } from "./cover-art";
import { PlayerProgressBarOverlayWidget } from "./progress-bar";
import { TrackInfoOverlayWidget } from "./track-info";

export const AllAIMPOverlayWidgets: OverlayWidgetType<any, any>[] = [
  CoverArtOverlayWidget,
  PlayerProgressBarOverlayWidget,
  TrackInfoOverlayWidget,
].map((overlayWidget) => {
  overlayWidget.id = `${AIMP_PLUGIN_ID}:${overlayWidget.id}`;

  return overlayWidget;
});
