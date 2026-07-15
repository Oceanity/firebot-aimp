import firebot from "@crowbartools/firebot-types";
import { TypedEmitter } from "tiny-typed-emitter";
import { AIMP_PLUGIN_ID } from "../constants";
import { FirebotEvent } from "../enums";
import { aimp } from "../main";
import { AIMPState } from "./aimp-state";

/**
 * Service that handles all communication between the script and the various event consumers in Firebot
 */
export class FirebotRemote {
  readonly #state: AIMPState;

  #unbindAIMPFirebotEvents: () => void;
  #unbindSocketFirebotEvents: () => void;
  #unbindPlayerFirebotEvents: () => void;
  #unbindTrackFirebotEvents: () => void;

  constructor(state: AIMPState) {
    this.#state = state;

    this.#unbindAIMPFirebotEvents = this.#bindFirebotEvent(this.#state, {
      ready: {
        event: FirebotEvent.Connected,
        additionalHandlers: [
          this.#updateCoverArtOverlays,
          this.#updateProgressBarOverlays,
          this.#updatePositionDurationOverlays,
          this.#updateTrackInfoOverlays,
        ],
      },
    });

    this.#unbindSocketFirebotEvents = this.#bindFirebotEvent(
      this.#state.socket,
      {
        disconnected: { event: FirebotEvent.Disconnected },
      },
    );

    this.#unbindPlayerFirebotEvents = this.#bindFirebotEvent(
      this.#state.player,
      {
        "position-updated": {
          event: FirebotEvent.PositionChanged,
          additionalHandlers: [
            this.#updateProgressBarOverlays,
            this.#updatePositionDurationOverlays,
            this.#updateTrackInfoOverlays,
          ],
        },
        "volume-updated": { event: FirebotEvent.VolumeChanged },
        "mute-updated": { event: FirebotEvent.MuteToggled },
        "repeat-updated": { event: FirebotEvent.RepeatToggled },
        "shuffle-updated": { event: FirebotEvent.ShuffleToggled },
      },
    );

    this.#unbindTrackFirebotEvents = this.#bindFirebotEvent(this.#state.track, {
      "title-updated": { event: FirebotEvent.TitleChanged },
      "artist-updated": { event: FirebotEvent.ArtistChanged },
      "album-updated": { event: FirebotEvent.AlbumChanged },
      "cover-art-updated": {
        event: FirebotEvent.CoverArtChanged,
        additionalHandlers: [this.#updateCoverArtOverlays],
      },
      "track-updated": {
        event: FirebotEvent.TrackChanged,
        additionalHandlers: [this.#updateTrackInfoOverlays],
      },
    });
  }

  public close() {
    this.#unbindAIMPFirebotEvents();
    this.#unbindSocketFirebotEvents();
    this.#unbindPlayerFirebotEvents();
    this.#unbindTrackFirebotEvents();
  }

  //#endregion

  #bindFirebotEvent = <T extends TypedEmitter<any>>(
    emitter: T,
    mapping: Record<
      string,
      {
        event: FirebotEvent;
        additionalHandlers?: Array<(meta?: Record<string, unknown>) => void>;
      }
    >,
  ) => {
    const handlerMap = new Map<
      string,
      Array<(meta?: Record<string, unknown>) => void>
    >();

    for (const [event, data] of Object.entries(mapping)) {
      const handlers: Array<() => void> = [];
      const firebotEvent = (meta?: Record<string, unknown>) =>
        firebot.events.trigger(AIMP_PLUGIN_ID, data.event, meta);
      emitter.on(event, firebotEvent);
      handlers.push(firebotEvent);

      if (data.additionalHandlers) {
        for (const extraHandler of data.additionalHandlers) {
          emitter.on(event, extraHandler);
          handlers.push(extraHandler);
        }
      }

      handlerMap.set(event, handlers);
    }

    return () => {
      for (const [event, handlers] of handlerMap) {
        for (const handler of handlers) {
          emitter.off(event, handler);
        }
      }
    };
  };

  #updateCoverArtOverlays = (meta?: Record<string, unknown>) => {
    if (!meta || !meta.aimpTrackCoverArtUrl) {
      return;
    }

    const overlays = firebot.overlay.widgets.getConfigsOfType(
      `${AIMP_PLUGIN_ID}:cover-art`,
    );

    for (const overlay of overlays) {
      firebot.overlay.widgets.setWidgetState(
        overlay.id,
        { id: meta.aimpTrackCoverArtId, url: meta.aimpTrackCoverArtUrl },
        true,
      );
    }
  };

  #updateProgressBarOverlays = (meta?: Record<string, unknown>) => {
    if (!meta || !meta.aimpPlayerProgressPercent) {
      return;
    }

    const overlays = firebot.overlay.widgets.getConfigsOfType(
      `${AIMP_PLUGIN_ID}:player-progress-bar`,
    );

    for (const overlay of overlays) {
      firebot.overlay.widgets.setWidgetState(
        overlay.id,
        { progress: meta.aimpPlayerProgressPercent },
        true,
      );
    }
  };

  #updateTrackInfoOverlays = () => {
    const overlays = firebot.overlay.widgets.getConfigsOfType(
      `${AIMP_PLUGIN_ID}:track-info`,
    );

    for (const overlay of overlays) {
      firebot.overlay.widgets.setWidgetState(
        overlay.id,
        { ...aimp.player.meta, ...aimp.track.meta },
        true,
      );
    }
  };

  #updatePositionDurationOverlays = (meta?: Record<string, unknown>) => {
    if (!meta || !meta.aimpPlayerPosition || !meta.aimpPlayerDuration) {
      return;
    }

    const overlays = firebot.overlay.widgets.getConfigsOfType(
      `${AIMP_PLUGIN_ID}:player-position-duration`,
    );

    for (const overlay of overlays) {
      firebot.overlay.widgets.setWidgetState(
        overlay.id,
        {
          position: meta.aimpPlayerPosition,
          duration: meta.aimpPlayerDuration,
        },
        true,
      );
    }
  };
}
