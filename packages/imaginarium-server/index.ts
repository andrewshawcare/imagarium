import Fastify from "fastify";

import ConfigPlugin from "./plugins/config-plugin.js";
import CorsPlugin from "./plugins/cors-plugin.js";
import RateLimitPlugin from "./plugins/rate-limit-plugin.js";
import StaticPlugin from "./plugins/static-plugin.js"

import DalleGenerateImageRoute from "./routes/dalle-generate-image-route.js"
import GoogleImagesSearchRoute from "./routes/google-images-search-route.js";
import MidjourneyGenerateImageRoute from "./routes/midjourney-generate-image-route.js";

const fastify = Fastify();

await ConfigPlugin.register(fastify);
await CorsPlugin.register(fastify);
await RateLimitPlugin.register(fastify);
await StaticPlugin.register(fastify);

DalleGenerateImageRoute.register(fastify);
GoogleImagesSearchRoute.register(fastify);
MidjourneyGenerateImageRoute.register(fastify);

fastify.listen({ port: fastify.config.PORT })
