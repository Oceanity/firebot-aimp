import firebot, {
  IOverlayWidgetEventUtils,
  OverlayWidgetType,
  WidgetOverlayEvent,
} from "@crowbartools/firebot-types";
import { AIMP_PLUGIN_DEFAULT_COVER_ART_DATA_URI } from "../constants";

type Settings = {
  imageType: "local" | "url";
  filepath: string;
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type State = {
  url: string;
};

export const CoverArtOverlayWidget: OverlayWidgetType<Settings, State> = {
  id: "cover-art",
  name: "AIMP - Cover Art",
  description: "Displays the cover art of the currently playing track on AIMP",
  icon: "fa-image",
  initialAspectRatio: {
    width: 1,
    height: 1,
  },
  initialState: {
    url: AIMP_PLUGIN_DEFAULT_COVER_ART_DATA_URI,
  },
  supportsLivePreview: true,
  livePreviewState: {
    url: AIMP_PLUGIN_DEFAULT_COVER_ART_DATA_URI,
  },
  onStateUpdate: async (event) => {
    firebot.logger.info(JSON.stringify(event));
  },
  overlayExtension: {
    eventHandler: (
      event: WidgetOverlayEvent<
        Record<string, unknown>,
        Record<string, unknown>
      >,
      utils: IOverlayWidgetEventUtils,
    ) => {
      const generateWidgetHtml = (
        config: (typeof event)["data"]["widgetConfig"],
      ) => {
        const state = config.state as State;

        const containerStyles = {
          display: "flex",
          width: "100%",
          height: "100%",
          overflow: "hidden",
        };

        const imageStyles = {
          "object-fit": "cover",
          width: "100%",
          height: "100%",
        };

        const imageSrc = !!state?.url.length
          ? state.url
          : AIMP_PLUGIN_DEFAULT_COVER_ART_DATA_URI;

        return `<div id="cover-art" style="${utils.stylesToString(containerStyles)}"><img src="${imageSrc}" style="${utils.stylesToString(imageStyles)}" /></div>`;
      };

      utils.handleOverlayEvent(generateWidgetHtml);
    },
  },
};
