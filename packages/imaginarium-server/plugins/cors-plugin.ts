import fastifyCors from "@fastify/cors";
import { FastifyInstance } from "fastify";

export default {
    async register(fastify: FastifyInstance): Promise<FastifyInstance> {
        fastify.register(fastifyCors);
        return fastify;
    }
}