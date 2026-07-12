import { TypedEmitter } from "tiny-typed-emitter";
import {
  formatDurationString as getDurationString,
  getMuteMetadata,
  getPositionMetadata,
  getRepeatMetadata,
  getShuffleMetadata,
  getStateMetadata,
  getVolumeMetadata,
} from "../helpers";
import {
  PlaybackState,
  PlaybackStateStrings,
  PlayerInfo,
  StoredPlayerInfo,
} from "../types";
import { AIMPState } from "./aimp-state";

type Events = {
  ["position-updated"]: (meta: Record<string, any>) => void;
  ["volume-updated"]: (meta: Record<string, any>) => void;
  ["mute-updated"]: (meta: Record<string, any>) => void;
  ["repeat-updated"]: (meta: Record<string, any>) => void;
  ["shuffle-updated"]: (meta: Record<string, any>) => void;
  ["state-updated"]: (meta: Record<string, any>) => void;
};

export class PlayerService extends TypedEmitter<Events> {
  readonly #state: AIMPState;
  readonly #playerInfo: StoredPlayerInfo;

  constructor(state: AIMPState) {
    super();

    this.#state = state;

    // Seed initial data to avoid null checks
    this.#playerInfo = {
      position: "0:00",
      positionSeconds: 0,
      duration: "0:00",
      durationSeconds: 0,
      progressPercent: 0,
      volume: 0,
      mute: false,
      shuffle: false,
      repeat: false,
      state: "stopped",
    };
  }

  public get info(): StoredPlayerInfo {
    return this.#playerInfo;
  }

  /**
   * Returns all Firebot-decorated metadata for AIMP Player
   */
  public get meta(): Record<string, any> {
    return {
      ...getPositionMetadata(this.#playerInfo),
      ...getVolumeMetadata(this.#playerInfo.volume),
      ...getMuteMetadata(this.#playerInfo.mute),
      ...getRepeatMetadata(this.#playerInfo.repeat),
      ...getShuffleMetadata(this.#playerInfo.shuffle),
    };
  }

  public async initialize() {
    const remotePlayerInfo = await this.#state.rest.fetchPlayerState();
    if (remotePlayerInfo) {
      this.updateInfo(remotePlayerInfo);
    }
  }

  public updateInfo(playerInfo: PlayerInfo) {
    this.updatePosition(playerInfo.position, playerInfo.duration);
    this.updateVolume(playerInfo.volume);
    this.updateMute(playerInfo.mute);
    this.updateRepeat(playerInfo.repeat);
    this.updateShuffle(playerInfo.shuffle);
  }

  public updatePosition(positionSeconds: number, durationSeconds?: number) {
    if (durationSeconds) {
      this.#playerInfo.duration = getDurationString(positionSeconds);
      this.#playerInfo.durationSeconds = durationSeconds;
    }

    this.#playerInfo.position = getDurationString(positionSeconds);
    this.#playerInfo.positionSeconds = positionSeconds;
    this.#playerInfo.progressPercent =
      this.#playerInfo.durationSeconds === 0
        ? 0
        : positionSeconds / this.#playerInfo.durationSeconds;

    this.emit("position-updated", getPositionMetadata(this.#playerInfo));
  }

  public updateVolume(volume: number) {
    this.#playerInfo.volume = volume;
    this.emit("volume-updated", getVolumeMetadata(volume));
  }

  public updateMute(mute: boolean) {
    this.#playerInfo.mute = mute;
    this.emit("mute-updated", getMuteMetadata(mute));
  }

  public updateRepeat(repeat: boolean) {
    this.#playerInfo.repeat = repeat;
    this.emit("repeat-updated", getRepeatMetadata(repeat));
  }

  public updateShuffle(shuffle: boolean) {
    this.#playerInfo.shuffle = shuffle;
    this.emit("shuffle-updated", getShuffleMetadata(shuffle));
  }

  public updateState(state: PlaybackState) {
    const stateString = PlaybackStateStrings[state];
    this.#playerInfo.state = stateString;
    this.emit("state-updated", getStateMetadata(stateString));
  }
}
