export enum RestEndpoint {
  PlayerInfo = "/player/state",
  Volume = "/player/volume",
  Seek = "/player/seek",
  Mute = "/player/mute",
  Shuffle = "/player/shuffle",
  Repeat = "/player/repeat",
  TogglePlayback = "/player/playpause",
  NextTrack = "/player/next",
  PreviousTrack = "/player/previous",
  TrackInfo = "/track/info",
  TrackCover = "/track/cover",
}

export enum ChangePlaybackMode {
  Play = "play",
  Pause = "pause",
  Toggle = "toggle",
}

export enum ToggleBooleanMode {
  Enable = "enable",
  Disable = "disable",
  Toggle = "toggle",
}

export enum FirebotEvent {
  MuteChanged = "mute-changed",
  PlayerState = "player-state",
  Position = "position",
  RepeatChanged = "repeat-changed",
  ShuffleChanged = "shuffle-changed",
  TrackChanged = "track-changed",
  CoverArtChanged = "cover-art-changed",
  TitleChanged = "title-changed",
  ArtistChanged = "artist-changed",
  AlbumChanged = "album-changed",
  VolumeChanged = "volume-changed",
}
