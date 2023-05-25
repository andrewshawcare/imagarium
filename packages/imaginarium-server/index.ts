import Fastify from "fastify";

import ConfigPlugin from "./plugins/config-plugin.js";
import CorsPlugin from "./plugins/cors-plugin.js";

import DalleGenerateImageRoute from "./routes/dalle-generate-image-route.js"
import GoogleImagesSearchRoute from "./routes/google-images-search-route.js";
import MidjourneyGenerateImageRoute from "./routes/midjourney-generate-image-route.js";

const fastify = Fastify();

await ConfigPlugin.register(fastify);
await CorsPlugin.register(fastify);

DalleGenerateImageRoute.register(fastify);
GoogleImagesSearchRoute.register(fastify);
MidjourneyGenerateImageRoute.register(fastify);

fastify.listen({ port: fastify.config.PORT })
