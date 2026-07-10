import { EventSource } from "@crowbartools/firebot-types";
import * as packageJson from "../package.json";
import { FirebotEvents } from "./enums";

export const {
  displayName: AIMP_PLUGIN_NAME,
  description: AIMP_PLUGIN_DESCRIPTION,
  author: AIMP_PLUGIN_AUTHOR,
  version: AIMP_PLUGIN_VERSION,
} = packageJson;

export const AIMP_PLUGIN_ID = "oceanity:aimp";

export const AIMP_PLUGIN_ICON_DATA_URI =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAklQTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACwkASz0AeWMAjnQAjXMAdWAARTgABwYAAAAAAAAAAAAAAAAATkAAupgA8cUA98oA7sMAspEAPjMAAAAAAAAAIxwAvJoAsJAAFxMAAAAAAAAAAAAASTsA6b4A9McA4bgAMyoAAAAAAAAAAAAASTwA78QAZlMAv50A68AAMikAAAAAIBoA6L4Az6oABwUAKiIA88YAFRIAAAAAvZsAQDQAkngAo4YAAAAAAAAAAAAATD4AqIkADAoA37YAAAAAuZcA88cAIBsAXkwAmX4AAAAAAAAADQoAe2UADgsACQcAAAAA4LcApogAAAAAAAAAemQAU0QAQjYA9ckA4rkAEQ4AUUIAAAAAAAAAkHYAvpwAAwIAAgIA0asAkXYAYE8Aj3UALycA9skAOC4AX04AAAAAdmEAGhUA0qwAT0EAAAAAAAAARjkA7MEAFhIAa1gArY0AKiMALiYAAAAAAAAAaFUAAQEAwZ4AJx8A6r8ABgUAAAAAsZEAJB4A78MAAgEAPTIA3rUAxqIA68EAzacA5rwAKCEAAAAAkXcA1q8ADgwAAAAAAAAA5bsAIx0AAAAA4rgA17AAAAAAAAAAAAAAoYQAEA0AAAAAAAAANCoAm38AkHUAAAAAXk0ABQQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAiunI/wAAAMN0Uk5TABZxtdjv/Pvt1bBoDza4+v/3rieomQo14v//////////1iRF8v/////////sMP/////rDuX//////9cJp////////4b/////////I/////+SFfn/////9v//////S7L/////i///xPH/////////6f3////////////////u/////+bU/////////7+t////////hP//////////////q////xqY//91///BBiX//+EY////If//+AeV84hMjufkwIdG9i1h7QAAAnxJREFUeJxlU1tIFVEUXStLrs80KylCyLAoFCr90LKo7GGZ6TWNq2CRZGmkqUgmphhXJSopSDGlUEsQLer2/qkwo/KjJHoQhCj0Uuzh7SKWBE1n5p4ZxzwfZ7/W7L32nn0I49B0Rie8uuIn3Gbs98kAX4vLG+ajeHLYBAjmb1V4yQJO1QhkvwFYxG/inqMXEfKzEAv4WgL8gkU8hOOmChYOAKHOfg0QyT4gjC4tMvOnGxHAd8AyPlEBsW+ACElJsBlyK/PYK759IADBI96I4ke3O0TUH5A5Zj3Fr413CA8/kaRP1g57jLXvpb7kEbDOQSsfIu6t9IXfBzbxlbTm92JLH6f5A/Ev3Z4VvCvuhBcSEHUbSOTum0jqkfOMdsB6HVgueTLmGnZyuq9RIfbPDaR1fUW0zlPU2MUDHbB1ue317cgQXVw2eG6+hD0saMHee5q5jRf38RZ2NBk8kxoxRk9v5Dg009oAH9FyCut1nql1UFh+DvmdqrW4G4e7B4Via3FKnulnUER7LYrbhJHJkyhRu2kfH3OhtEvlmVWDMp6uQsozBci2y+4reD63UuOZywrY6TMDqKpD4hWn/qur2ZhTqvIcFZsZxMh+BSfOonBiIcHa4r/wOIUjRZjtIpoLtRRTz9ECwJ5HBI16YdUP55R4KfOxwZopMrcdApZaBv+Ll/Mg0JCubtTqLyPAyv2Vk+LHqz8ATUzTlvZqjVjOhcfKTPGta7KAZibLtY9QPom7lSWKFs0Nre8RwnJhO/SHkxBdq4qA0HD/mILs8AzVaPJMhgHA3IjnpkGoA3cGxsMEEK+kwaYY4U4OZepTm/jI18EOmzUuT+xM6rDh/QfBnKzXpqHJ1AAAAABJRU5ErkJggg==";
export const AIMP_PLUGIN_ICON_BACKGROUND = "#454545";

export const AIMP_PLUGIN_EVENT_SOURCE: EventSource = {
  id: AIMP_PLUGIN_ID,
  name: "AIMP",
  events: [
    {
      id: FirebotEvents.PlayerState,
      name: "Player State Changed",
      description: "When one or more aspects of the player state are changed",
    },
    {
      id: FirebotEvents.Position,
      name: "Player Position Changed",
      description:
        "An event that is periodically called to update where the current position of the track is",
    },
    {
      id: FirebotEvents.TrackChanged,
      name: "Track Changed",
      description: "When the currently playing track changes",
    },
    {
      id: FirebotEvents.VolumeChanged,
      name: "Volume Changed",
      description: "When the volume of the player changes",
    },
    {
      id: FirebotEvents.MuteChanged,
      name: "Mute Changed",
      description: "When the player is muted or unmuted",
    },
    {
      id: FirebotEvents.RepeatChanged,
      name: "Repeat Changed",
      description: "When repeat is enabled or disabled",
    },
    {
      id: FirebotEvents.ShuffleChanged,
      name: "ShuffleChanged",
      description: "When shuffle is enabled or disabled",
    },
  ],
};

export const HOSTNAME_REGEX = /^[a-zA-Z]+:\/\/([\w\.]+)(\/.+)?/;
