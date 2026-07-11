import { PluginHttpRouteDefinition } from "@crowbartools/firebot-types";
import defaultImage from "../assets/default-album-art.webp";
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

        if (id === "default") {
          res.setHeader("Content-Type", "image/webp");
          res.send(defaultImage);
          return;
        }

        const cover = aimp.getCover(id);
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
