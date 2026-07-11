import firebot, { PluginContext } from "@crowbartools/firebot-types";
import { networkInterfaces } from "os";
import { v4 as uuid } from "uuid";
import { AIMP_PLUGIN_ID } from "../constants";
import { FirebotEvent } from "../enums";
import {
  AIMPPluginSettings,
  PlayerInfo,
  StoredCover,
  TrackInfo,
} from "../types";
import { AIMPRestClient } from "./rest-client";
import { AIMPWebsocketClient } from "./websocket-client";

export class AIMPState {
  readonly #rest: AIMPRestClient;
  readonly #socket: AIMPWebsocketClient;

  #playerInfo: PlayerInfo | null = null;
  #position: number = -1;
  #trackInfo: TrackInfo | null = null;
  #coverId: string | null = null;
  #covers: ({ id: string } & StoredCover)[] = [];
  #firebotUrl: URL | null = null;

  constructor(context: PluginContext<AIMPPluginSettings>) {
    this.#rest = new AIMPRestClient(this, context.parameters.hostname);
    this.#socket = new AIMPWebsocketClient(this, context.parameters.hostname);

    try {
      const interfaces = networkInterfaces();
      for (const interfaceName of Object.keys(interfaces)) {
        const connections = interfaces[interfaceName];
        for (const connection of connections ?? []) {
          // Look for IPv4 addresses that are not internal (loopback)
          if (connection.family === "IPv4" && !connection.internal) {
            this.#firebotUrl = new URL(`http://${connection.address}:7472`);
            firebot.logger.info(this.#firebotUrl.toString());
          }
        }
      }
    } catch {
      firebot.logger.warn("Could not get Firebot's local IP Address");
      this.#firebotUrl = null;
    }
  }

  public get rest() {
    return this.#rest;
  }

  public get socket() {
    return this.#socket;
  }

  public get playerInfo() {
    return this.#playerInfo;
  }

  public get position() {
    return this.#position;
  }

  public get trackInfo() {
    return this.#trackInfo;
  }

  public get coverId() {
    return this.#coverId;
  }

  public async init() {
    await this.#socket.connect();
  }

  public async close() {
    this.#socket.disconnect();
  }

  public updatePlayer(playerInfo: PlayerInfo) {
    this.#playerInfo = playerInfo;
  }

  public async updatePosition(
    position: number,
    isInMilliseconds: boolean,
    forceEvent?: boolean,
  ): Promise<number> {
    let fetched = false;
    if (!this.#playerInfo) {
      this.#playerInfo = await this.#rest.fetchPlayerInfo();

      fetched = true;

      if (!this.#playerInfo) {
        firebot.logger.warn(
          "Could not fetch current player info during update position",
        );
        return -1;
      }
    }

    // Converts MS to seconds because the plugin is a bit loosey-goosey on what it returns
    const normalizedPosition = isInMilliseconds
      ? position / 1000
      : Math.round(position * 100) / 100;

    // If changed, update and trigger event
    if (
      forceEvent ||
      fetched ||
      this.#playerInfo.position !== normalizedPosition
    ) {
      this.#playerInfo.position = normalizedPosition;
      this.#position = normalizedPosition;

      firebot.events.trigger(AIMP_PLUGIN_ID, FirebotEvent.CoverArtChanged, {
        aimpPlayerPosition: normalizedPosition,
        aimpPlayerDuration: this.#playerInfo.duration,
        aimpPlayerProgressPercent:
          normalizedPosition / this.#playerInfo.duration,
      });
    }

    return normalizedPosition;
  }

  public async updateTrack(trackInfo: TrackInfo) {
    this.#trackInfo = trackInfo;

    await this.updateCoverArt();
  }

  public async updateCoverArt() {
    let newCoverId: string | null = null;

    const cover = await this.#rest.fetchTrackCover();

    if (cover) {
      const existing = this.#covers.find(
        (storedCover) => storedCover.hash === cover?.hash,
      );
      if (existing) {
        newCoverId = existing.id;
      } else {
        newCoverId = uuid();
        this.#covers.push({ id: newCoverId, ...cover });
      }
    }

    if (this.#coverId !== newCoverId) {
      this.#coverId = newCoverId;
      const address = this.#getCoverArtAddress(this.#coverId);

      firebot.logger.info(`New Cover Art! ${address}`);

      firebot.events.trigger(AIMP_PLUGIN_ID, FirebotEvent.CoverArtChanged, {
        aimpTrackCoverArtUrl: address,
      });
    }
  }

  public getCover(id?: string): StoredCover | null {
    return this.#covers.find((cover) => cover.id === id) ?? null;
  }

  #getCoverArtAddress(id?: string | null): string | null {
    return this.#firebotUrl
      ? `${this.#firebotUrl}plugins/oceanity/aimp/cover/${id ?? "default"}`
      : null;
  }
}
