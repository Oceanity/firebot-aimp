import { FontOptions, OverlayWidgetType } from "@crowbartools/firebot-types";
import { AIMP_PLUGIN_DEFAULT_COVER_ART_DATA_URI } from "../constants";

type Settings = {
  fontOptions: FontOptions;
  spacing: number;
  cssTemplate: string;
  htmlTemplate: string;
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type State = {
  aimpTrackTitle: string;
  aimpTrackArtist: string;
  aimpTrackAlbum: string;
  aimpTrackGenre: string;
  aimpPlayerPosition: string;
  aimpPlayerDuration: string;
  coverArtUrl: string;
};

export const TrackInfoOverlayWidget: OverlayWidgetType<Settings, State> = {
  id: "track-info",
  name: "AIMP - Track Info",
  description:
    "Displays various information about the currently playing track in AIMP",
  icon: "fa-text",
  initialAspectRatio: {
    width: 3,
    height: 2,
  },
  settingsSchema: [
    {
      name: "fontOptions",
      title: "Font Options",
      type: "font-options",
      default: {
        family: "Inter",
        weight: 600,
        size: 48,
        italic: false,
        color: "#FFFFFF",
      },
      allowAlpha: true,
      showBottomHr: true,
    },
    {
      name: "cssTemplate",
      title: "CSS Template",
      description: `Any CSS styles, along with custom CSS classes, that you want to use in your widget. This value will automatically be put inside of a \`<style>\` tag.

The following fields will automatically get replaced with their corresponding CSS class names:
- \`{{containerClass}}\`: The \`<div>\` element automatically created by the widget that contains the provided HTML template.
- \`{{titleClass}}\`: The \`<span>\` element created by \`{{title}}\` in the HTML Template.
- \`{{artistClass}}\`: The \`<span>\` element created by \`{{artist}}\` in the HTML Template.
- \`{{albumClass}}\`: The \`<span>\` element created by \`{{album}}\` in the HTML Template.
- \`{{genreClass}}\`: The \`<span>\` element created by \`{{genre}}\` in the HTML Template.
- \`{{positionClass}}\`: The \`<span>\` element created by \`{{position}}\` in the HTML Template.
- \`{{durationClass}}\`: The \`<span>\` element created by \`{{duration}}\` in the HTML Template.`,
      type: "codemirror",
      default: `{{containerClass}} {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
}

{{containerClass}} > span {
  text-wrap: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.position-duration-row {
  display: flex;
}

.aimp-player-position,
.aimp-player-duration {
  flex-basis: 40%;
}`,
      settings: {
        mode: "css",
        theme: "blackboard",
      },
    },
    {
      name: "htmlTemplate",
      title: "HTML Template",
      description: `The HTML template to use when generating the widget.

The following fields are available:
- \`{{title}}\`: HTML \`<span>\` containing the title of the currently playing track
- \`{{artist}}\`: HTML \`<span>\` containing the artist of the currently playing track
- \`{{album}}\`: HTML \`<span>\` containing the album of the currently playing track
- \`{{position}}\`: HTML \`<span>\` containing the player's position in the current track formatted as \`0:00\`
- \`{{duration}}\`: HTML \`<span>\` containing the duration of the current track formatted as \`0:00\``,
      type: "codemirror",
      default: `{{title}}
{{artist}}
{{album}}
<div class="position-duration-row">
  {{position}}<span>/</span>{{duration}}
</div>`,
      settings: {
        mode: "htmlmixed",
        theme: "blackboard",
      },
      showBottomHr: true,
    },
    {
      name: "spacing",
      title: "Spacing (px)",
      description: "The space between the numbers and the separator",
      type: "number",
    },
  ],
  initialState: {
    aimpTrackTitle: "",
    aimpTrackArtist: "",
    aimpTrackAlbum: "",
    aimpTrackGenre: "",
    aimpPlayerPosition: "0:00",
    aimpPlayerDuration: "0:00",
    coverArtUrl: AIMP_PLUGIN_DEFAULT_COVER_ART_DATA_URI,
  },
  supportsLivePreview: true,
  livePreviewState: {
    aimpTrackTitle: "Firebotter",
    aimpTrackArtist: "The Caw-digy",
    aimpTrackAlbum: "The Chat of the Land",
    aimpTrackGenre: "Drumstick & Bass",
    aimpPlayerPosition: "4:20",
    aimpPlayerDuration: "6:21",
    coverArtUrl: AIMP_PLUGIN_DEFAULT_COVER_ART_DATA_URI,
  },
  overlayExtension: {
    eventHandler: (event, utils) => {
      const dataMapping: Record<string, keyof State> = {
        title: "aimpTrackTitle",
        artist: "aimpTrackArtist",
        album: "aimpTrackAlbum",
        genre: "aimpTrackGenre",
        position: "aimpPlayerPosition",
        duration: "aimpPlayerDuration",
      };

      const { fontOptions, spacing, htmlTemplate, cssTemplate } = event.data
        .widgetConfig.settings as Settings;

      const generateInfoSpan = (className: string, data?: string): string => {
        return `<span class="aimp-info-${className}">${data ?? "&nbsp;"}</span>`;
      };

      const generateWidgetHtml = (
        config: (typeof event)["data"]["widgetConfig"],
      ) => {
        const containerStyles = {
          "justify-content": "space-between",
          gap: `${spacing ?? 0}px`,
          "font-family": fontOptions?.family
            ? `'${fontOptions?.family}'`
            : "Inter, sans-serif",
          "font-size": fontOptions?.size ? `${fontOptions.size}px` : "48px",
          "font-weight": fontOptions?.weight?.toString() || "400",
          "font-style": fontOptions?.italic ? "italic" : "normal",
          color: fontOptions?.color || "#FFFFFF",
        };

        let styleMarkup = `<style>${cssTemplate.replaceAll("{{containerClass}}", `.oceanity-aimp-track-information-${config.id}`)}</style>`;

        let htmlLayout = `${styleMarkup}<div class="oceanity-aimp-track-information-${config.id}" style="${utils.stylesToString(containerStyles)}">
                  ${htmlTemplate}
                </div>`;

        for (const [key, value] of Object.entries(dataMapping)) {
          styleMarkup = styleMarkup.replaceAll(
            `{{${key}Class}}`,
            `.aimp-info-${key}`,
          );

          htmlLayout = htmlLayout.replaceAll(
            `{{${key}}}`,
            generateInfoSpan(
              key,
              (event.data.widgetConfig.state as State)[value],
            ),
          );
        }

        return htmlLayout;
      };

      switch (event.name) {
        case "show":
          utils.initializeWidget(generateWidgetHtml(event.data.widgetConfig), {
            overflow: "hidden",
          });
          break;
        case "settings-update":
          utils.updateWidgetContent(
            generateWidgetHtml(event.data.widgetConfig),
          );
          utils.updateWidgetPosition();
          break;
        case "state-update":
          const parent = $(
            `.oceanity-aimp-track-information-${event.data.widgetConfig.id}`,
          );

          for (const [key, value] of Object.entries(dataMapping)) {
            const newValue = (event.data.widgetConfig.state as State)[value];

            if (newValue !== undefined) {
              parent.find(`.aimp-info-${key}`).text(newValue);
            }
          }

          break;
      }
      // - \`{{coverArt}}\`: Pre-made Cover Art widget that will automatically cycle
      // - \`{{coverArtUrl}}\`: URL for the chatter's avatar
      // - \`{{title}}\`: The title of the currently playing track
      // - \`{{artist}}\`: The artist of the currently playing track
      // - \`{{album}}\`: The album of the currently playing track
      // - \`{{position}}\`: The player's position in the current track formatted as \`0:00\`
      // - \`{{duration}}\`: The duration of the current track formatted as \`0:00\`
      // - \`{{progressPercent}}\`: The percent progress the player has made towards the end of the track from 0.0 to 100.0

      //utils.handleOverlayEvent(generateWidgetHtml);
    },
  },
};
