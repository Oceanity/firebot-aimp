import firebot, { Plugin, PluginContext } from "@crowbartools/firebot-types";
import { AIMPState } from "./aimp/aimp-state";
import {
  AIMP_PLUGIN_AUTHOR,
  AIMP_PLUGIN_DESCRIPTION,
  AIMP_PLUGIN_GIT_REPO_URL,
  AIMP_PLUGIN_ICON_BACKGROUND,
  AIMP_PLUGIN_ICON_DATA_URI,
  AIMP_PLUGIN_NAME,
  AIMP_PLUGIN_VERSION,
} from "./constants";
import { AllAIMPEffectTypes as AllAIMPEffects } from "./effects";
import { AIMPPluginEventSource } from "./event-source";
import { AIMPHttpRoutes } from "./http-routes";
import { AllAIMPOverlayWidgets } from "./overlay-widgets";
import { AllAIMPVariables } from "./replace-variables";
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
    repo: AIMP_PLUGIN_GIT_REPO_URL,
  },
  parametersSchema: [
    {
      name: "hostname",
      type: "string",
      default: "localhost",
      title: "AIMP Server Hostname",
      description:
        "The url of the device the AIMP server is being hosted on, use `localhost` if its the same device as Firebot.\n\nYou need the **[Fluke AIMP Remote Control plugin](https://github.com/ReitanSora/fluke-aimp-remote-plugin/releases/latest)** to be installed in AIMP (Preferences > Plugins > Install) and running to connect",
    },
  ],
  registers: {
    effects: AllAIMPEffects,
    eventSources: [AIMPPluginEventSource],
    httpRoutes: AIMPHttpRoutes,
    overlayWidgets: AllAIMPOverlayWidgets,
    variables: AllAIMPVariables,
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

    await aimp.init();
  } catch (error) {
    firebot.logger.error("Error initializing AIMP client", error);
  }
}

function disconnect() {
  if (aimp) {
    aimp.close();
  }
}

export default plugin;
