import {
  AIMP_PLUGIN_PLAYER_VARIABLE_PREFIX as PLAYER_PREFIX,
  AIMP_PLUGIN_TRACK_VARIABLE_PREFIX as TRACK_PREFIX,
} from "./constants";
import { PlaybackStateString, StoredPlayerInfo } from "./types";

//#region Player Metadata

export function getPositionMetadata(playerInfo: StoredPlayerInfo) {
  return {
    [`${PLAYER_PREFIX}Position`]: playerInfo.position,
    [`${PLAYER_PREFIX}PositionSeconds`]: playerInfo.positionSeconds,
    [`${PLAYER_PREFIX}Duration`]: playerInfo.duration,
    [`${PLAYER_PREFIX}DurationSeconds`]: playerInfo.durationSeconds,
    [`${PLAYER_PREFIX}ProgressPercent`]: playerInfo.progressPercent,
  };
}

export function getVolumeMetadata(volume: number) {
  return {
    [`${PLAYER_PREFIX}Volume`]: volume,
  };
}

export function getMuteMetadata(mute: boolean) {
  return {
    [`${PLAYER_PREFIX}IsMuted`]: mute,
  };
}

export function getRepeatMetadata(repeat: boolean) {
  return {
    [`${PLAYER_PREFIX}IsRepeating`]: repeat,
  };
}

export function getShuffleMetadata(shuffle: boolean) {
  return {
    [`${PLAYER_PREFIX}IsShuffled`]: shuffle,
  };
}

export function getStateMetadata(state: PlaybackStateString) {
  return {
    [`${PLAYER_PREFIX}State`]: state,
  };
}

//#endregion

//#region Track Metadata

export function getTitleMetadata(title: string) {
  return {
    [`${TRACK_PREFIX}Title`]: title,
  };
}

export function getArtistMetadata(artist: string) {
  return {
    [`${TRACK_PREFIX}Artist`]: artist,
  };
}

export function getAlbumMetadata(album: string) {
  return {
    [`${TRACK_PREFIX}Album`]: album,
  };
}

export function getGenreMetadata(genre: string) {
  return {
    [`${TRACK_PREFIX}Genre`]: genre,
  };
}

export function getCoverArtMetadata(coverArtUrl: string) {
  return {
    [`${TRACK_PREFIX}CoverArtUrl`]: coverArtUrl,
  };
}

//#endregion

export function getImageDataUri(
  mimeType: string,
  arrayBuffer: ArrayBuffer,
): string {
  return `data:${mimeType};base64,${Buffer.from(arrayBuffer).toString("base64")}`;
}

export function formatDurationString(seconds: number): string {
  const rounded = Math.round(seconds);
  const hourString = rounded >= 3600 ? `${Math.floor(rounded / 3600)}:` : "";
  const minuteString = `${Math.floor(rounded / 60)}:`.padStart(
    !!hourString.length ? 2 : 1,
    "0",
  );
  const secondString = `${rounded % 60}`.padStart(2, "0");

  return `${hourString}${minuteString}${secondString}`;
}
