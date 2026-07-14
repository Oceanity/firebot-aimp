import {
  IOverlayWidgetEventUtils,
  OverlayWidgetType,
  WidgetOverlayEvent,
} from "@crowbartools/firebot-types";
import { AIMP_PLUGIN_DEFAULT_COVER_ART_DATA_URI } from "../constants";

type Settings = {
  borderRadius: number;
  newCoverAnimation: Animation;
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type State = {
  id: string;
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
  settingsSchema: [
    {
      name: "borderRadius",
      title: "Corner Radius (px)",
      description: "How round the corners of the image should be",
      type: "number",
    },
    {
      name: "newCoverAnimation",
      title: "New Cover Art Entry Animation",
      description: "Animation to use when new cover art arrive",
      type: "animation-select",
      animationType: "enter",
    },
  ],
  initialState: {
    id: "00000000-0000-0000-0000-000000000000",
    url: AIMP_PLUGIN_DEFAULT_COVER_ART_DATA_URI,
  },
  supportsLivePreview: true,
  livePreviewState: {
    id: "00000000-0000-0000-0000-000000000000",
    url: AIMP_PLUGIN_DEFAULT_COVER_ART_DATA_URI,
  },
  overlayExtension: {
    eventHandler: (
      event: WidgetOverlayEvent<
        Record<string, unknown>,
        Record<string, unknown>
      >,
      utils: IOverlayWidgetEventUtils,
    ) => {
      const { id, url } = event.data.widgetConfig.state as State;

      const generateWidgetHtml = (
        config: (typeof event)["data"]["widgetConfig"],
      ) => {
        const containerStyles = {
          position: "relative",
          display: "flex",
          width: "100%",
          height: "100%",
          "border-radius": `${config.settings.borderRadius ?? 0}px`,
          overflow: "hidden",
        };

        const image = generateImageHtml(id, url);

        return `<div class="oceanity-aimp-cover-art-${config.id}" style="${utils.stylesToString(containerStyles)}">
          ${image}
        </div>`;
      };

      const generateImageHtml = (id: string, url?: string) => {
        const imageEl = document.createElement("img");

        const imageStyles = {
          position: "absolute",
          "object-fit": "cover",
          width: "100%",
          height: "100%",
          "border-radius": `${event.data.widgetConfig.settings.borderRadius ?? 0}px`,
        };

        imageEl.setAttribute("data-id", id);
        imageEl.setAttribute("style", utils.stylesToString(imageStyles));
        imageEl.setAttribute(
          "src",
          url || AIMP_PLUGIN_DEFAULT_COVER_ART_DATA_URI,
        );

        return imageEl.outerHTML;
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
          const newImage = generateImageHtml(id, url);

          try {
            const coverArt = document.getElementsByClassName(
              `oceanity-aimp-cover-art-${event.data.widgetConfig.id}`,
            )[0];

            // Store previous to yoink out later
            const previousImages = $(
              `.oceanity-aimp-cover-art-${event.data.widgetConfig.id}`,
            ).find(`img`);

            coverArt.insertAdjacentHTML("beforeend", newImage);

            const animation = event.data.widgetConfig.settings
              .newCoverAnimation as Record<string, any>;
            const animationClass = animation.class;
            const animationDuration = animation.duration;

            if (
              animationClass != null &&
              animationClass !== "" &&
              animationClass !== "none"
            ) {
              const duration = animationDuration
                ? `${animationDuration}s`
                : undefined;

              $(`.oceanity-aimp-cover-art-${event.data.widgetConfig.id}`)
                .find(`[data-id=${event.data.widgetConfig.state?.id}]`) //@ts-ignore
                .animateCss(animationClass, duration, null, null, () => {
                  previousImages.remove();
                });
            } else {
              setTimeout(() => {
                previousImages.remove();
              }, 100);
            }
          } catch {}
          break;

        case "remove":
          utils.removeWidget();
          break;
      }

      // utils.handleOverlayEvent(generateWidgetHtml);
    },
  },
};
