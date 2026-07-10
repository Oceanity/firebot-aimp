import { PluginHttpRouteDefinition } from "@crowbartools/firebot-types";
import { aimp } from "./main";

export const AIMPHttpRoutes: PluginHttpRouteDefinition = {
  prefix: "/oceanity/aimp",
  routes: [
    {
      path: "/cover",
      method: "GET",
      handler: (req, res) => {
        const { id } = req.query;

        const cover = aimp.getCover(id as string);
        if (!cover) {
          res.send(null);
          return;
        }

        res.setHeader("Content-Type", cover.mimeType);
        res.send(cover.data);
      },
    },
  ],
};
