import { PluginHttpRouteDefinition } from "@crowbartools/firebot-types";
import defaultCoverArt from "../assets/default-cover-art.webp";
import { aimp } from "./main";

export const AIMPHttpRoutes: PluginHttpRouteDefinition = {
  prefix: "/oceanity/aimp",
  routes: [
    {
      path: "/cover/:id",
      method: "GET",
      handler: async (req, res) => {
        const id =
          typeof req.params.id === "string"
            ? req.params.id
            : req.params.id.shift();

        const cover = aimp.track.getCoverArt(id);
        if (!cover) {
          res.setHeader("Content-Type", "image/webp");
          res.send(defaultCoverArt);
          return;
        }

        res.setHeader("Content-Type", cover.mimeType);
        res.send(cover.data);
      },
    },
  ],
};
