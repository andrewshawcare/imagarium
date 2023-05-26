import fastifyRateLimit from "@fastify/rate-limit";
import { FastifyInstance } from "fastify";

export default {
    async register(fastify: FastifyInstance): Promise<FastifyInstance> {
        fastify.register(fastifyRateLimit.default);
        return fastify;
    }
}