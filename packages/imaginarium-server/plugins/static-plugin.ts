import path from "node:path"
import url from "node:url"
import fastifyStatic from "@fastify/static";
import { FastifyInstance } from "fastify";

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

export default {
    async register(fastify: FastifyInstance): Promise<FastifyInstance> {
        fastify.register(fastifyStatic, {
            root: path.join(__dirname, '..', 'static')
        });
        return fastify;
    }
}