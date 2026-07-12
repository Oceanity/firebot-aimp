import { OverlayWidgetType } from "@crowbartools/firebot-types";
import { AIMP_PLUGIN_ID } from "../constants";
import { CoverArtOverlayWidget } from "./cover-art";

export const AllAIMPOverlayWidgets: OverlayWidgetType<any, any>[] = [
  CoverArtOverlayWidget,
].map((overlayWidget) => {
  overlayWidget.id = `${AIMP_PLUGIN_ID}:${overlayWidget.id}`;

  return overlayWidget;
});
