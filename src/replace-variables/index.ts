import firebot, { ReplaceVariable } from "@crowbartools/firebot-types";
import {
  AIMP_PLUGIN_ID,
  AIMP_PLUGIN_PLAYER_VARIABLE_PREFIX,
  AIMP_PLUGIN_TRACK_VARIABLE_PREFIX,
} from "../constants";
import { FirebotEvent } from "../enums";
import { AIMPPlayerReplaceVariable } from "./aimp-player";
import { AIMPTrackReplaceVariable } from "./aimp-track";
import { AIMPIsConnectedReplaceVariable } from "./is-connected";

type ReplaceVariableType =
  | ReplaceVariable["definition"]["possibleDataOutput"][number]
  | ReplaceVariable["definition"]["possibleDataOutput"];

type SpecialtyReplaceVarDefinition = {
  event: FirebotEvent;
  key: string;
  description: string;
  type: ReplaceVariableType;
};

const playerVariableDefinitions: SpecialtyReplaceVarDefinition[] = [
  {
    event: FirebotEvent.StateUpdated,
    key: "PlayerState",
    description:
      "The playback state of the player, will be `playing`, `paused` or `stopped`",
    type: "text",
  },
];

const trackVariableDefinitions: SpecialtyReplaceVarDefinition[] = [
  {
    event: FirebotEvent.TitleChanged,
    key: "Title",
    description: "The Title of the currently playing track",
    type: "text",
  },
  {
    event: FirebotEvent.ArtistChanged,
    key: "Artist",
    description: "The Artist of the currently playing track",
    type: "text",
  },
  {
    event: FirebotEvent.AlbumChanged,
    key: "Album",
    description: "The Album of the currently playing track",
    type: "text",
  },
  {
    event: FirebotEvent.CoverArtChanged,
    key: "CoverArtUrl",
    description: "The Url of the Cover Art of the currently playing track",
    type: "text",
  },
];

export const AllAIMPVariables: ReplaceVariable[] = [
  AIMPIsConnectedReplaceVariable,
  AIMPPlayerReplaceVariable,
  AIMPTrackReplaceVariable,

  ...buildPlayerVariables([FirebotEvent.Connected, FirebotEvent.StateUpdated]),

  ...trackVariableDefinitions.map(({ event, key, description, type }) =>
    buildAIMPVariable(
      `${AIMP_PLUGIN_TRACK_VARIABLE_PREFIX}${key}`,
      `The ${description} of the currently playing track`,
      [FirebotEvent.Connected, FirebotEvent.TrackChanged, event],
      type,
    ),
  ),

  ...buildPlayerPositionVariables([
    FirebotEvent.Connected,
    FirebotEvent.PositionChanged,
  ]),
];

function buildAIMPVariable(
  eventProperty: string,
  description: string,
  events: FirebotEvent[],
  type: ReplaceVariableType,
) {
  return firebot.factories.variables.createEventDataVariable({
    handle: eventProperty,
    description,
    events: events.map((event) => `${AIMP_PLUGIN_ID}:${event}`),
    eventMetaKey: eventProperty,
    type,
  });
}

function buildAIMPVariables(
  prefix: string,
  events: FirebotEvent[],
  definitions: [string, string, ReplaceVariableType][],
) {
  return definitions.map(([name, description, type]) => {
    const eventProperty = `${prefix}${name}`;
    return buildAIMPVariable(eventProperty, description, events, type);
  });
}

function buildPlayerVariables(events: FirebotEvent[]) {
  return buildAIMPVariables(AIMP_PLUGIN_PLAYER_VARIABLE_PREFIX, events, [
    ["Volume", "The volume of the player from 0.0-100.0", "number"],
    [
      "State",
      "The playback state of the player, will be `playing`, `paused` or `stopped`",
      "text",
    ],
  ]);
}

function buildPlayerPositionVariables(events: FirebotEvent[]) {
  return buildAIMPVariables(AIMP_PLUGIN_PLAYER_VARIABLE_PREFIX, events, [
    [
      "Position",
      "The current position of the player formatted to M:SS or H:MM:SS",
      "text",
    ],
    [
      "PositionSeconds",
      "The current position of the player in seconds",
      "number",
    ],
    [
      "Duration",
      "The duration of the current track formatted to M:SS or H:MM:SS",
      "text",
    ],
    [
      "DurationSeconds",
      "The duration of the current track in seconds",
      "number",
    ],
    [
      "ProgressPercent",
      "The percent of progress towards the end of the current track from 0-100",
      "number",
    ],
  ]);
}
