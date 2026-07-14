import { OverlayWidgetType } from "@crowbartools/firebot-types";

type Settings = {
  borderRadius: number;
  padding: number;
  barColor: string;
  trackColor: string;
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type State = {
  progress: number;
};

export const PlayerProgressBarOverlayWidget: OverlayWidgetType<
  Settings,
  State
> = {
  id: "player-progress-bar",
  name: "AIMP - Player Progress Bar",
  description: "Displays the cover art of the currently playing track on AIMP",
  icon: "fa-image",
  initialAspectRatio: {
    width: 25,
    height: 2,
  },
  settingsSchema: [
    {
      name: "borderRadius",
      title: "Corner Radius (px)",
      description: "How round the corners of the progress bar should be",
      type: "number",
    },
    {
      name: "padding",
      title: "Padding (px)",
      description:
        "The amount of space between the edge of the track and the bar",
      type: "number",
    },
    {
      name: "trackColor",
      title: "Track Color",
      type: "hexcolor",
      allowAlpha: true,
      default: "#000000",
      validation: {
        required: true,
      },
    },
    {
      name: "barColor",
      title: "Bar Color",
      type: "hexcolor",
      allowAlpha: true,
      default: "#FFFFFF",
      validation: {
        required: true,
      },
    },
  ],
  initialState: {
    progress: 0,
  },
  supportsLivePreview: true,
  livePreviewState: {
    progress: 50,
  },
  overlayExtension: {
    eventHandler: (event, utils) => {
      const { progress } = event.data.widgetConfig.state as State;
      const { borderRadius, padding, barColor, trackColor } = event.data
        .widgetConfig.settings as Settings;

      const generateWidgetHtml = (
        config: (typeof event)["data"]["widgetConfig"],
      ) => {
        const containerStyles = {
          position: "relative",
          display: "flex",
          padding: `${padding ?? 0}px`,
          width: "100%",
          height: "100%",
          "box-sizing": "border-box",
          "border-radius": `${borderRadius ?? 0}px`,
          overflow: "hidden",
          background: trackColor,
        };

        const barWrapper = {
          position: "relative",
          width: "100%",
          height: "100%",
          "border-radius": `${borderRadius ?? 0}px`,
          overflow: "hidden",
        };

        const barStyles = {
          width: `${progress}%`,
          height: "100%",
          // "border-radius": `${borderRadius ?? 0}px`,
          background: barColor,
        };

        return `<div class="oceanity-aimp-track-progress-bar-${config.id}" style="${utils.stylesToString(containerStyles)}">
                  <div class="bar-wrapper" style="${utils.stylesToString(barWrapper)}">
                    <div style="${utils.stylesToString(barStyles)}">
                  </div>
                </div>`;
      };

      utils.handleOverlayEvent(generateWidgetHtml);
    },
  },
};
