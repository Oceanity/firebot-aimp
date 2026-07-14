import { EventSource } from "@crowbartools/firebot-types";
import { AIMP_PLUGIN_ID } from "./constants";
import { FirebotEvent } from "./enums";

const trackDataChangeDefinitions: [FirebotEvent, string][] = [
  [FirebotEvent.TitleChanged, "Title"],
  [FirebotEvent.ArtistChanged, "Artist"],
  [FirebotEvent.AlbumChanged, "Album Changed"],
  [FirebotEvent.CoverArtChanged, "Cover Art Changed"],
];

export const AIMPPluginEventSource: EventSource = {
  id: AIMP_PLUGIN_ID,
  name: "AIMP",
  events: [
    {
      id: FirebotEvent.Connected,
      name: "Connected",
      description:
        "When you connect or reconnect to the AIMP client, returns all variables",
    },
    {
      id: FirebotEvent.Disconnected,
      name: "Disconnected",
      description:
        "When you disconnect from the AIMP client or connection is lost",
    },
    {
      id: FirebotEvent.PlayerState,
      name: "Player State Changed",
      description: "When one or more aspects of the player state are changed",
    },
    {
      id: FirebotEvent.PositionChanged,
      name: "Player Position Changed",
      description:
        "An event that is periodically called to update where the current position of the track is",
    },
    {
      id: FirebotEvent.TrackChanged,
      name: "Track Changed",
      description: "When the currently playing track changes",
    },
    {
      id: FirebotEvent.VolumeChanged,
      name: "Volume Changed",
      description: "When the volume of the player changes",
    },
    {
      id: FirebotEvent.MuteToggled,
      name: "Mute Toggled",
      description: "When the player is muted or unmuted",
    },
    {
      id: FirebotEvent.RepeatToggled,
      name: "Repeat Toggled",
      description: "When repeat is enabled or disabled",
    },
    {
      id: FirebotEvent.ShuffleToggled,
      name: "Shuffle Toggled",
      description: "When shuffle is enabled or disabled",
    },
    //#region Track changes

    ...trackDataChangeDefinitions.map(([event, property]) => ({
      id: event,
      name: `${property} Changed`,
      description: `When the ${property.toLowerCase()} is different between tracks during a track change`,
    })),

    //#endregion
  ],
};
