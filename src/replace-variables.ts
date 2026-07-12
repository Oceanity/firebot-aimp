import firebot, { ReplaceVariable } from "@crowbartools/firebot-types";
import {
  AIMP_PLUGIN_ID,
  AIMP_PLUGIN_PLAYER_VARIABLE_PREFIX,
} from "./constants";
import { FirebotEvent } from "./enums";
import { AIMPTrackReplaceVariable } from "./replace-variables/aimp-track";

export const AllAIMPVariables: ReplaceVariable[] = [
  AIMPTrackReplaceVariable,

  buildAIMPVariable(
    "aimpTrackCoverArtUrl",
    "The Cover Art of the currently playing track",
    [
      FirebotEvent.Connected,
      FirebotEvent.TrackChanged,
      FirebotEvent.CoverArtChanged,
    ],
    "text",
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
  type:
    | ReplaceVariable["definition"]["possibleDataOutput"][number]
    | ReplaceVariable["definition"]["possibleDataOutput"],
) {
  return firebot.variableFactory.createEventDataVariable({
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
  definitions: [
    string,
    string,
    (
      | ReplaceVariable["definition"]["possibleDataOutput"][number]
      | ReplaceVariable["definition"]["possibleDataOutput"]
    ),
  ][],
) {
  return definitions.map(([name, description, type]) => {
    const eventProperty = `${prefix}${name}`;
    return buildAIMPVariable(eventProperty, description, events, type);
  });
}

function buildPlayerPositionVariables(events: Array<FirebotEvent>) {
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
