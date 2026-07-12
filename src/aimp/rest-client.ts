import firebot from "@crowbartools/firebot-types";
import { createHash } from "crypto";
import { HOSTNAME_REGEX } from "../constants";
import { ChangePlaybackMode, RestEndpoint, ToggleBooleanMode } from "../enums";
import {
  PlaybackState,
  PlayerInfo as PlayerState,
  SetVolumeResponse,
  StoredCover,
  ToggleBooleanResponse,
  TogglePlaybackResponse,
  ToggleRepeatResponse,
  ToggleShuffleResponse,
  TrackInfo,
  VolumeResponse,
} from "../types";
import { AIMPState } from "./aimp-state";

export class AIMPRestClient {
  readonly #state: AIMPState;

  #url: URL;

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
      this.#url.protocol.toLocaleLowerCase() !== "http:" &&
      this.#url.protocol.toLocaleLowerCase() !== "https:"
    ) {
      this.#url.protocol = "http:";
    }

    if (!this.#url.port) {
      this.#url.port = "3553";
    }
  }

  async fetchPlayerState(): Promise<PlayerState | null> {
    const playerInfo = await this.#fetch<PlayerState>(RestEndpoint.PlayerInfo);
    if (!playerInfo) {
      return null;
    }

    const { position, duration, ...info } = playerInfo;
    return {
      ...info,
      position: position / 1000,
      duration: duration / 1000,
    };
  }

  async fetchTrackInfo(): Promise<TrackInfo | null> {
    return await this.#fetch<TrackInfo>(RestEndpoint.TrackInfo);
  }

  async fetchCoverArt(): Promise<StoredCover | null> {
    try {
      const response = await fetch(
        this.#getEndpointUrl(RestEndpoint.TrackCover),
      );

      const mimeType = response.headers.get("Content-Type");
      if (!response.ok || !mimeType) {
        return null;
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const hash = createHash("sha256")
        .update(Buffer.from(buffer))
        .digest("hex");

      return {
        hash,
        mimeType,
        data: buffer,
      };
    } catch (error) {
      firebot.logger.error("Could not retrieve cover for current track", error);
    }
    return null;
  }

  async fetchVolume(): Promise<number> {
    return (
      (await this.#fetch<VolumeResponse>(RestEndpoint.Volume))?.volume ?? -1
    );
  }

  async setPlaybackState(mode: ChangePlaybackMode): Promise<boolean> {
    try {
      // If toggle, no need to fetch current mode
      if (mode === ChangePlaybackMode.Toggle) {
        const response = await this.#post<TogglePlaybackResponse>(
          RestEndpoint.TogglePlayback,
        );

        return response?.status === "ok";
      }

      const player = await this.fetchPlayerState();

      if (!player) {
        return false;
      }

      if (
        (mode === ChangePlaybackMode.Play &&
          player.state === PlaybackState.Playing) ||
        (mode === ChangePlaybackMode.Pause &&
          player.state === PlaybackState.Paused)
      ) {
        return true;
      }

      const response = await this.#post<TogglePlaybackResponse>(
        RestEndpoint.TogglePlayback,
      );

      return !!response && response.status === "ok";
    } catch (error) {
      firebot.logger.warn("Could not change Playback State");
    }
    return false;
  }

  async setVolume(volume: number): Promise<boolean> {
    // gonna get the CLAMPS
    volume = Math.max(0, Math.min(100, volume));

    const response = await this.#post<SetVolumeResponse>(RestEndpoint.Volume, {
      volume,
    });

    return response?.status === "ok";
  }

  async setMute(mode: ToggleBooleanMode): Promise<boolean> {
    return await this.#toggleBoolean<ToggleRepeatResponse>(
      RestEndpoint.Mute,
      "mute",
      mode,
    );
  }

  async setShuffle(mode: ToggleBooleanMode): Promise<boolean> {
    return await this.#toggleBoolean<ToggleShuffleResponse>(
      RestEndpoint.Shuffle,
      "shuffle",
      mode,
    );
  }

  async setRepeat(mode: ToggleBooleanMode): Promise<boolean> {
    return await this.#toggleBoolean<ToggleRepeatResponse>(
      RestEndpoint.Repeat,
      "repeat",
      mode,
    );
  }

  #fetch = async <T>(endpoint: RestEndpoint): Promise<T | null> => {
    const url = this.#getEndpointUrl(endpoint);

    try {
      const response = await fetch(url);

      if (!response.ok) {
        firebot.logger.warn(
          `Request GET '${url}' returned status ${response.status}: ${response.statusText ?? "Unknown error"}`,
        );
        return null;
      }

      const data = (await response.json()) as T;

      return data;
    } catch (error) {
      firebot.logger.warn(`Could not access endpoint at '${url}'`);
    }

    return null;
  };

  #post = async <T>(
    endpoint: RestEndpoint,
    body?: Record<string, any>,
  ): Promise<T | null> => {
    const url = this.#getEndpointUrl(endpoint);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        firebot.logger.warn(
          `Request POST '${url}' returned status ${response.status}: ${response.statusText ?? "Unknown error"}`,
        );
        return null;
      }

      const data = (await response.json()) as T;

      return data;
    } catch (error) {
      firebot.logger.warn(`Could not POST to endpoint at '${url}'`);
    }

    return null;
  };

  #toggleBoolean = async <T extends ToggleBooleanResponse>(
    endpoint: RestEndpoint,
    key: keyof PlayerState,
    mode: ToggleBooleanMode,
  ): Promise<boolean> => {
    if (mode === ToggleBooleanMode.Toggle) {
      const response = await this.#post<T>(endpoint);

      return !!response?.success;
    }

    const player = await this.fetchPlayerState();

    if (!player || typeof player[key] !== "boolean") {
      return false;
    }

    if (
      (mode === ToggleBooleanMode.Enable && player[key]) ||
      (mode === ToggleBooleanMode.Disable && !player[key])
    ) {
      return true;
    }

    const response = await this.#post<T>(endpoint);

    return !!response?.success;
  };

  #getEndpointUrl = (endpoint: RestEndpoint): string => {
    return `${this.#url}${endpoint.startsWith("/") ? endpoint.substring(1) : endpoint}`;
  };
}
