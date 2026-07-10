import firebot from "@crowbartools/firebot-types";
import WebSocket from "ws";
import { AIMP_PLUGIN_ID, HOSTNAME_REGEX } from "../constants";
import { FirebotEvents } from "../enums";
import { AIMPMessage } from "../types";
import { AIMPState } from "./aimp-state";

export class AIMPWebsocketClient {
  readonly #state: AIMPState;

  #url: URL;
  #socket: WebSocket | null = null;

  constructor(state: AIMPState, hostname: string) {
    this.#state = state;

    if (!HOSTNAME_REGEX.test(hostname)) {
      hostname = `http://${hostname}`;

      if (!HOSTNAME_REGEX.test(hostname)) {
        throw new Error(`Hostname invalid even after being manually formatted`);
      }
    }

    this.#url = new URL(hostname);
    if (
      this.#url.protocol.toLocaleLowerCase() !== "ws:" &&
      this.#url.protocol.toLocaleLowerCase() !== "wss:"
    ) {
      this.#url.protocol = "ws:";
    }

    if (!this.#url.port) {
      this.#url.port = "3554";
    }
  }

  public async connect(): Promise<boolean> {
    try {
      this.#socket = new WebSocket(this.#url);

      this.#socket.on("message", async (data: WebSocket.Data) => {
        const message = JSON.parse(data.toString()) as AIMPMessage;

        firebot.logger.info(JSON.stringify(message));

        switch (message.event) {
          case "track_changed":
            await this.#state.updateTrack(message);

            firebot.logger.info(`Track Cover Id: ${this.#state.coverId}`);

            firebot.events.trigger(AIMP_PLUGIN_ID, FirebotEvents.TrackChanged, {
              // TODO: Meta
            });
            break;
          case "player_state":
            firebot.events.trigger(AIMP_PLUGIN_ID, FirebotEvents.PlayerState, {
              // TODO: Meta
            });
            break;
          case "position":
            this.#state.updatePosition(message.position);

            firebot.events.trigger(AIMP_PLUGIN_ID, FirebotEvents.Position, {
              // TODO: Meta
            });
            break;
          case "volume_changed":
            firebot.events.trigger(
              AIMP_PLUGIN_ID,
              FirebotEvents.VolumeChanged,
              {
                // TODO: Meta
              },
            );
            break;
          case "mute_changed":
            firebot.events.trigger(AIMP_PLUGIN_ID, FirebotEvents.MuteChanged, {
              // TODO: Meta
            });
            break;
          case "shuffle_changed":
            firebot.events.trigger(
              AIMP_PLUGIN_ID,
              FirebotEvents.ShuffleChanged,
              {
                // TODO: Meta
              },
            );
            break;
          case "repeat_changed":
            firebot.events.trigger(
              AIMP_PLUGIN_ID,
              FirebotEvents.RepeatChanged,
              {
                // TODO: Meta
              },
            );
            break;
        }
      });

      return true;
    } catch (error) {
      firebot.logger.error(
        "Could not connect to Fluke WebSocket Server",
        error,
      );
    }
    return false;
  }

  public disconnect(): void {
    if (!this.#socket) {
      return;
    }
    try {
      this.#socket.removeAllListeners();

      this.#socket.close();
    } catch (error) {
      firebot.logger.error("Could not disconnect AIMP Websocket Client", error);
    }
  }
}
