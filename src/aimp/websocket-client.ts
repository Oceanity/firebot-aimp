import firebot from "@crowbartools/firebot-types";
import ReconnectingWebSocket, { ErrorEvent } from "reconnecting-websocket";
import { TypedEmitter } from "tiny-typed-emitter";
import { AIMP_PLUGIN_RECONNECT_TIMEOUT_MS, HOSTNAME_REGEX } from "../constants";
import { aimp } from "../main";
import { AIMPMessage } from "../types";
import { AIMPState } from "./aimp-state";

type SocketEvents = {
  ["connected"]: () => void;
  ["disconnected"]: () => void;
};

export class AIMPWebsocketClient extends TypedEmitter<SocketEvents> {
  readonly #state: AIMPState;

  #url: URL;
  #socket: ReconnectingWebSocket | null = null;
  #isConnected: boolean = false;

  constructor(state: AIMPState, hostname: string) {
    super();

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

  public get isConnected(): boolean {
    return this.#isConnected;
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
        this.#isConnected = true;

        const playerInfo = await aimp.rest.fetchPlayerState();
        if (!playerInfo) {
          return;
        }

        // Fetch latest data
        // await aimp.player.initialize();

        this.emit("connected");
      };

      this.#socket.onclose = () => {
        firebot.logger.warn(
          `AIMP disconnected, attempting to reconnect in ${Math.floor(AIMP_PLUGIN_RECONNECT_TIMEOUT_MS / 1000)} seconds...`,
        );

        this.#isConnected = false;
        this.emit("disconnected");
      };

      this.#socket.onerror = (event: ErrorEvent) => {
        firebot.logger.warn(
          `Could not connect to AIMP WebSocket, reason: ${event.message}`,
        );

        this.#isConnected = false;
        this.emit("disconnected");
      };

      this.#socket.onmessage = async (event: MessageEvent) => {
        const message = JSON.parse(event.data) as AIMPMessage;

        switch (message.event) {
          case "track_changed": {
            return await this.#state.track.updateInfo(message);
          }

          case "player_state": {
            return this.#state.player.updateState(message.state);
          }

          case "position": {
            return await this.#state.player.updatePosition(
              message.position / 1000,
            );
          }

          case "volume_changed": {
            return await this.#state.player.updateVolume(message.volume);
          }

          case "mute_changed": {
            return await this.#state.player.updateMute(message.mute);
          }

          case "shuffle_changed": {
            return await this.#state.player.updateShuffle(message.shuffle);
          }

          case "repeat_changed": {
            return await this.#state.player.updateRepeat(message.repeat);
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

      this.#isConnected = false;
    } catch (error) {
      firebot.logger.error("Could not disconnect AIMP Websocket Client", error);
    }
  }
}
