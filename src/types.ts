export type AIMPPluginSettings = {
  hostname: string;
};

export enum PlaybackState {
  Stopped = 0,
  Paused = 1,
  Playing = 2,
}

export type PlaybackStateString = "stopped" | "paused" | "playing";

export const PlaybackStateStrings: Record<PlaybackState, PlaybackStateString> =
  Object.freeze({
    [PlaybackState.Stopped]: "stopped",
    [PlaybackState.Paused]: "paused",
    [PlaybackState.Playing]: "playing",
  });

export interface PlayerInfo {
  duration: number;
  mute: boolean;
  position: number;
  repeat: boolean;
  shuffle: boolean;
  state: PlaybackState;
  volume: number;
}

export type VolumeResponse = {
  volume: number;
};

export type TrackInfo = {
  album: string;
  artist: string;
  bitrate: number;
  genre: string;
  play_count: number;
  rating: number;
  sample_rate: number;
  title: string;
};

export type StoredCover = {
  hash: string;
  mimeType: string;
  data: Buffer;
};

//#region Firebot Data

export type StoredPlayerInfoKey = Extract<keyof StoredPlayerInfo, string>;
export type StoredPlayerInfo = {
  position: string;
  positionSeconds: number;
  duration: string;
  durationSeconds: number;
  progressPercent: number;
  volume: number;
  mute: boolean;
  repeat: boolean;
  shuffle: boolean;
  state: PlaybackStateString;
};

export type StoredTrackInfoKey = Extract<keyof StoredTrackInfo, string>;
export type StoredTrackInfo = {
  title: string;
  artist: string;
  album: string;
  coverArtId: string | null;
  genre: string;
  rating: number;
  playCount: number;
  bitrate: number;
  sampleRate: number;
};

//#endregion

//#region Rest Responses

type StatusMessageResponse = {
  status: string;
  message: string;
};

export type TogglePlaybackResponse = StatusMessageResponse;
export type NextTrackResponse = StatusMessageResponse;
export type PreviousTrackResponse = StatusMessageResponse;

export type SetVolumeResponse = {
  status: string;
  volume: number;
};

export type SetSeekResponse = {
  status: string;
  position: number;
};

export type ToggleBooleanResponse = {
  success: boolean;
};

export type ToggleMuteResponse = ToggleBooleanResponse & {
  mute: boolean;
};

export type ToggleShuffleResponse = ToggleBooleanResponse & {
  shuffle: boolean;
};

export type ToggleRepeatResponse = ToggleBooleanResponse & {
  repeat: boolean;
};

//#endregion

//#region WebSocket Client

interface BaseMessage {
  event: string;
}

export interface TrackChangedMessage extends BaseMessage {
  event: "track_changed";
  title: string;
  artist: string;
  album: string;
  genre: string;
  duration: number;
  play_count: number;
  rating: number;
  bitrate: number;
  sample_rate: number;
  playlist_id: string;
}

export interface PlayerStateMessage extends BaseMessage {
  event: "player_state";
  state: PlaybackState;
}

export interface PositionMessage extends BaseMessage {
  event: "position";
  position: number;
  seeked?: boolean; // For some reason if seeked is true, position is seconds as float, not ms, may be upstream bug
}

export interface VolumeChangedMessage extends BaseMessage {
  event: "volume_changed";
  volume: number;
}

export interface MuteChangedMessage extends BaseMessage {
  event: "mute_changed";
  mute: boolean;
}

export interface ShuffleChangedMessage extends BaseMessage {
  event: "shuffle_changed";
  shuffle: boolean;
}

export interface RepeatChangedMessage extends BaseMessage {
  event: "repeat_changed";
  repeat: boolean;
}

export type AIMPMessage =
  | TrackChangedMessage
  | PlayerStateMessage
  | PositionMessage
  | VolumeChangedMessage
  | MuteChangedMessage
  | ShuffleChangedMessage
  | RepeatChangedMessage;

//#endregion
