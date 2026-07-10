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

export enum FirebotEvents {
  MuteChanged = "mute-changed",
  PlayerState = "player-state",
  Position = "position",
  RepeatChanged = "repeat-changed",
  ShuffleChanged = "shuffle-changed",
  TrackChanged = "track-changed",
  VolumeChanged = "volume-changed",
}
