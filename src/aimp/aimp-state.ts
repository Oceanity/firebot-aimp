import { PluginContext } from "@crowbartools/firebot-types";
import { v4 as uuid } from "uuid";
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

  constructor(context: PluginContext<AIMPPluginSettings>) {
    this.#rest = new AIMPRestClient(this, context.parameters.hostname);
    this.#socket = new AIMPWebsocketClient(this, context.parameters.hostname);
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
    const playerInfo = await this.rest.fetchPlayerInfo();
    this.#playerInfo = playerInfo;

    const trackInfo = await this.#rest.fetchTrackInfo();
  }

  public updatePlayer(playerInfo: PlayerInfo) {
    this.#playerInfo = playerInfo;
  }

  public updatePosition(position: number) {
    this.#position = position;
  }

  public async updateTrack(trackInfo: TrackInfo) {
    this.#trackInfo = trackInfo;

    const cover = await this.#rest.fetchTrackCover();
    if (!cover) {
      this.#coverId = null;
      return;
    }

    const existing = this.#covers.find(
      (storedCover) => storedCover.hash === cover?.hash,
    );
    if (existing) {
      this.#coverId = existing.id;
    }

    const id = uuid();
    this.#coverId = id;
    this.#covers.push({ id, ...cover });
  }

  public getCover(id?: string): StoredCover | null {
    return this.#covers.find((cover) => cover.id === id) ?? null;
  }
}
