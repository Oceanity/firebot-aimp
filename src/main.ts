import firebot, { Plugin, PluginContext } from "@crowbartools/firebot-types";
import { AIMPState } from "./aimp/aimp-state";
import {
  AIMP_PLUGIN_AUTHOR,
  AIMP_PLUGIN_DESCRIPTION,
  AIMP_PLUGIN_EVENT_SOURCE,
  AIMP_PLUGIN_ICON_BACKGROUND,
  AIMP_PLUGIN_ICON_DATA_URI,
  AIMP_PLUGIN_NAME,
  AIMP_PLUGIN_VERSION,
} from "./constants";
import { AllAIMPEffectTypes } from "./effects";
import { AIMPHttpRoutes } from "./http-routes";
import { AIMPPluginSettings } from "./types";

export let aimp: AIMPState;

const plugin: Plugin<AIMPPluginSettings> = {
  manifest: {
    name: AIMP_PLUGIN_NAME,
    description: AIMP_PLUGIN_DESCRIPTION,
    icon: {
      type: "custom",
      url: AIMP_PLUGIN_ICON_DATA_URI,
      backgroundColor: AIMP_PLUGIN_ICON_BACKGROUND,
    },
    version: AIMP_PLUGIN_VERSION,
    author: AIMP_PLUGIN_AUTHOR,
  },
  parametersSchema: [
    {
      name: "hostname",
      type: "string",
      default: "localhost",
      title: "AIMP Server Hostname",
      description:
        "The url of the device the AIMP server is being hosted on, use `localhost` if its the same device as Firebot",
    },
  ],
  registers: {
    effects: AllAIMPEffectTypes,
    eventSources: [AIMP_PLUGIN_EVENT_SOURCE],
    httpRoutes: AIMPHttpRoutes,
  },
  onLoad: async (context) => {
    await connect(context);
  },
  onParameterUpdate: async (context) => {
    await connect(context);
  },
  onUnload: async (context) => {
    disconnect();
  },
};

async function connect(context: PluginContext<AIMPPluginSettings>) {
  try {
    disconnect();

    aimp = new AIMPState(context);
    await aimp.socket.connect();

    const state = await aimp.rest.fetchPlayerInfo();
    const volume = await aimp.rest.fetchVolume();

    firebot.logger.info(JSON.stringify(state));
    firebot.logger.info(`Volume: ${volume}`);
  } catch (error) {
    firebot.logger.error("Error initializing AIMP client", error);
  }
}

function disconnect() {
  if (aimp) {
    aimp.socket.disconnect();
  }
}

export default plugin;
