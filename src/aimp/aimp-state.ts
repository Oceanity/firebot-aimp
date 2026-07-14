import firebot, { PluginContext } from "@crowbartools/firebot-types";
import { networkInterfaces } from "os";
import { TypedEmitter } from "tiny-typed-emitter";
import { AIMPPluginSettings } from "../types";
import { FirebotRemote } from "./firebot-remote";
import { PlayerService } from "./player-service";
import { AIMPRestClient } from "./rest-client";
import { TrackService } from "./track-service";
import { AIMPWebsocketClient } from "./websocket-client";

type Events = {
  ["ready"]: (meta: Record<string, any>) => void;
};

export class AIMPState extends TypedEmitter<Events> {
  readonly #rest: AIMPRestClient;
  readonly #socket: AIMPWebsocketClient;
  readonly #player: PlayerService;
  readonly #track: TrackService;
  readonly #remote: FirebotRemote;

  #firebotUrl: URL;

  constructor(context: PluginContext<AIMPPluginSettings>) {
    super();

    this.#rest = new AIMPRestClient(this, context.parameters.hostname);
    this.#socket = new AIMPWebsocketClient(this, context.parameters.hostname);
    this.#player = new PlayerService(this);
    this.#track = new TrackService(this);
    this.#remote = new FirebotRemote(this);

    this.#firebotUrl = this.#getLocalAddress();

    this.#socket.on("connected", this.#onConnected);
  }

  public get firebotUrl(): URL | null {
    return this.#firebotUrl;
  }

  public get rest() {
    return this.#rest;
  }

  public get socket() {
    return this.#socket;
  }

  public get player() {
    return this.#player;
  }

  public get track() {
    return this.#track;
  }

  public get meta(): Record<string, any> {
    return {
      ...this.#player.meta,
    };
  }

  public async init() {
    await this.#socket.connect();
  }

  public async close() {
    this.#remote.close();
    this.#socket.disconnect();
  }

  #onConnected = async () => {
    await this.#player.fetchRemotePlayerInfo();
    await this.#track.initialize();

    firebot.logger.info(
      JSON.stringify({
        ...this.#player.meta,
        ...this.#track.meta,
      }),
    );

    this.emit("ready", {
      ...this.#player.meta,
      ...this.#track.meta,
    });
  };

  #getLocalAddress = (): URL => {
    try {
      const interfaces = networkInterfaces();
      for (const interfaceName of Object.keys(interfaces)) {
        const connections = interfaces[interfaceName];
        for (const connection of connections ?? []) {
          // Look for IPv4 addresses that are not internal (loopback)
          if (connection.family === "IPv4" && !connection.internal) {
            return new URL(`http://${connection.address}:7472`);
          }
        }
      }
    } catch {
      firebot.logger.warn("Could not get Firebot's local IP Address");
    }

    return new URL("http://localhost:7472");
  };
}
