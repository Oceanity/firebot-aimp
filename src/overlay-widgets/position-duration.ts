import { FontOptions, OverlayWidgetType } from "@crowbartools/firebot-types";

type Settings = {
  fontOptions: FontOptions;
  spacing: number;
  separator: string;
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type State = {
  position: string;
  duration: string;
};

export const PlayerPositionDurationOverlayWidget: OverlayWidgetType<
  Settings,
  State
> = {
  id: "player-position-duration",
  name: "AIMP - Player Position / Duration",
  description:
    "Displays the time and length of the current song in 0:00 / 0:00 format",
  icon: "fa-image",
  initialAspectRatio: {
    width: 5,
    height: 1,
  },
  settingsSchema: [
    {
      name: "fontOptions",
      title: "Font Options",
      type: "font-options",
      default: {
        family: "Inter",
        weight: 600,
        size: 24,
        italic: false,
        color: "#FFFFFF",
      },
      allowAlpha: true,
      showBottomHr: true,
    },
    {
      name: "separator",
      title: "Separator",
      description: "The character between the position and duration",
      type: "string",
      default: "/",
    },
    {
      name: "spacing",
      title: "Spacing (px)",
      description: "The space between the numbers and the separator",
      type: "number",
    },
  ],
  initialState: {
    position: "0:00",
    duration: "0:00",
  },
  supportsLivePreview: true,
  livePreviewState: {
    position: "4:20",
    duration: "6:21",
  },
  overlayExtension: {
    eventHandler: (event, utils) => {
      const { position, duration } = event.data.widgetConfig.state as State;
      const { fontOptions, separator, spacing } = event.data.widgetConfig
        .settings as Settings;

      const generateWidgetHtml = (
        config: (typeof event)["data"]["widgetConfig"],
      ) => {
        const containerStyles = {
          display: "flex",
          gap: `${spacing ?? 0}px`,
          "font-family": fontOptions?.family
            ? `'${fontOptions?.family}'`
            : "Inter, sans-serif",
          "font-size": fontOptions?.size ? `${fontOptions.size}px` : "48px",
          "font-weight": fontOptions?.weight?.toString() || "400",
          "font-style": fontOptions?.italic ? "italic" : "normal",
          color: fontOptions?.color || "#FFFFFF",
        };

        return `<div class="oceanity-aimp-player-position-duration-${config.id}" style="${utils.stylesToString(containerStyles)}">
                  <span>${position}</span><span>${separator || " "}</span><span>${duration}</span>
                </div>`;
      };

      utils.handleOverlayEvent(generateWidgetHtml);
    },
  },
};
