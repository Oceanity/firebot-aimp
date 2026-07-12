import firebot from "@crowbartools/firebot-types";
import { TypedEmitter } from "tiny-typed-emitter";
import { AIMP_PLUGIN_ID } from "../constants";
import { FirebotEvent } from "../enums";
import { AIMPState } from "./aimp-state";

/**
 * Service that handles all communication between the script and the various event consumers in Firebot
 */
export class FirebotRemote {
  readonly #state: AIMPState;

  #unbindSocketFirebotEvents: () => void;
  #unbindPlayerFirebotEvents: () => void;
  #unbindTrackFirebotEvents: () => void;

  constructor(state: AIMPState) {
    this.#state = state;

    this.#unbindSocketFirebotEvents = this.#bindFirebotEvent(
      this.#state.socket,
      {
        connected: FirebotEvent.Connected,
        disconnected: FirebotEvent.Disconnected,
      },
    );

    this.#unbindPlayerFirebotEvents = this.#bindFirebotEvent(
      this.#state.player,
      {
        "position-updated": FirebotEvent.PositionChanged,
        "volume-updated": FirebotEvent.VolumeChanged,
        "mute-updated": FirebotEvent.MuteToggled,
        "repeat-updated": FirebotEvent.RepeatToggled,
        "shuffle-updated": FirebotEvent.ShuffleToggled,
      },
    );

    this.#unbindTrackFirebotEvents = this.#bindFirebotEvent(this.#state.track, {
      "title-updated": FirebotEvent.TitleChanged,
      "artist-updated": FirebotEvent.ArtistChanged,
      "album-updated": FirebotEvent.AlbumChanged,
      "cover-art-updated": FirebotEvent.CoverArtChanged,
    });

    this.#state.track.on("cover-art-updated", this.#onCoverArtChanged);
  }

  public close() {
    this.#unbindSocketFirebotEvents();
    this.#unbindPlayerFirebotEvents();
    this.#unbindTrackFirebotEvents();
  }

  //#endregion

  #onCoverArtChanged = (meta: Record<string, unknown>) => {
    //@ts-ignore
    const overlays = firebot.overlay.getConfigsOfType(
      `${AIMP_PLUGIN_ID}:cover-art`,
    );

    for (const overlay of overlays) {
      //@ts-ignore
      firebot.overlay.setWidgetState(
        overlay.id,
        { url: meta.aimpTrackCoverArtUrl },
        true,
      );
    }
  };

  #bindFirebotEvent = <T extends TypedEmitter<any>>(
    emitter: T,
    mapping: Record<string, FirebotEvent>,
  ) => {
    const handlers = new Map<
      string,
      (meta?: Record<string, unknown>) => void
    >();

    for (const [event, firebotEvent] of Object.entries(mapping)) {
      const handler = (meta?: Record<string, unknown>) =>
        firebot.events.trigger(AIMP_PLUGIN_ID, firebotEvent, meta);

      handlers.set(event, handler);
      emitter.on(event, handler);
    }

    return () => {
      for (const [event, handler] of handlers) {
        emitter.off(event, handler);
      }
    };
  };
}
