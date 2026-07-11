import firebot from "@crowbartools/firebot-types";
import ReconnectingWebSocket, { ErrorEvent } from "reconnecting-websocket";
import {
  AIMP_PLUGIN_ID,
  AIMP_PLUGIN_RECONNECT_TIMEOUT_MS,
  HOSTNAME_REGEX,
} from "../constants";
import { FirebotEvent } from "../enums";
import { AIMPMessage } from "../types";
import { AIMPState } from "./aimp-state";

export class AIMPWebsocketClient {
  readonly #state: AIMPState;

  #url: URL;
  #socket: ReconnectingWebSocket | null = null;

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
      this.disconnect();

      firebot.logger.info("Connecting to AIMP WebSocket...");

      this.#socket = new ReconnectingWebSocket(this.#url.toString(), [], {
        connectionTimeout: AIMP_PLUGIN_RECONNECT_TIMEOUT_MS,
      });

      this.#socket.onopen = async () => {
        firebot.logger.info("Connected to AIMP WebSocket Server!");
      };

      this.#socket.onclose = () => {
        firebot.logger.warn(
          `AIMP disconnected, attempting to reconnect in ${Math.floor(AIMP_PLUGIN_RECONNECT_TIMEOUT_MS / 1000)} seconds...`,
        );
      };

      this.#socket.onerror = (event: ErrorEvent) => {
        firebot.logger.warn(
          `Could not connect to AIMP WebSocket, reason: ${event.message}`,
        );
      };

      this.#socket.onmessage = async (event: MessageEvent) => {
        const message = JSON.parse(event.data) as AIMPMessage;

        switch (message.event) {
          case "track_changed": {
            firebot.logger.info(JSON.stringify(message));

            await this.#state.updateTrack(message);

            firebot.logger.info(`Track Cover Id: ${this.#state.coverId}`);

            firebot.events.trigger(AIMP_PLUGIN_ID, FirebotEvent.TrackChanged, {
              // TODO: Meta
            });

            return;
          }

          case "player_state": {
            firebot.logger.info(JSON.stringify(message));

            firebot.events.trigger(AIMP_PLUGIN_ID, FirebotEvent.PlayerState, {
              // TODO: Meta
            });

            return;
          }

          case "position": {
            const newPosition = await this.#state.updatePosition(
              message.position,
              true,
            );

            firebot.logger.info(
              `Position: ${newPosition} / ${this.#state.playerInfo?.duration}`,
            );

            firebot.events.trigger(AIMP_PLUGIN_ID, FirebotEvent.Position, {
              // TODO: Meta
            });

            return;
          }

          case "volume_changed": {
            firebot.logger.info(JSON.stringify(message));

            firebot.events.trigger(AIMP_PLUGIN_ID, FirebotEvent.VolumeChanged, {
              // TODO: Meta
            });

            return;
          }

          case "mute_changed": {
            firebot.logger.info(JSON.stringify(message));

            firebot.events.trigger(AIMP_PLUGIN_ID, FirebotEvent.MuteChanged, {
              // TODO: Meta
            });

            return;
          }

          case "shuffle_changed": {
            firebot.events.trigger(
              AIMP_PLUGIN_ID,
              FirebotEvent.ShuffleChanged,
              {
                aimpPlayerShuffle: message.shuffle,
              },
            );

            return;
          }

          case "repeat_changed": {
            firebot.events.trigger(AIMP_PLUGIN_ID, FirebotEvent.RepeatChanged, {
              aimpPlayerRepeat: message.repeat,
            });

            return;
          }
        }
      };

      return true;
    } catch (error) {
      firebot.logger.error(
        `Could not connect to AIMP WebSocket Server, retrying in ${Math.floor(AIMP_PLUGIN_RECONNECT_TIMEOUT_MS / 1000)} seconds...`,
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
      this.#socket.onopen = null;
      this.#socket.onclose = null;
      this.#socket.onerror = null;
      this.#socket.onmessage = null;

      this.#socket.close();
    } catch (error) {
      firebot.logger.error("Could not disconnect AIMP Websocket Client", error);
    }
  }
}
