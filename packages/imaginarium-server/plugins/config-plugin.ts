import fastifyEnv from "@fastify/env";
import { FastifyInstance, FastifyRegister } from "fastify";
import { FromSchema, JSONSchema } from "json-schema-to-ts";

const envSchema = {
    type: 'object',
    properties: {
        DALLE_API_KEY: { type: 'string' },
        GOOGLE_CUSTOM_SEARCH_API_KEY: { type: 'string' },
        GOOGLE_PROGRAMMABLE_SEARCH_ENGINE_ID: { type: 'string' },
        MIDJOURNEY_API_KEY: { type: 'string' },
        MIDJOURNEY_CHANNEL_ID: { type: 'string' },
        MIDJOURNEY_SERVER_ID: { type: 'string' },
        PORT: { type: 'number' }
    },
    required: [
        'DALLE_API_KEY',
        'GOOGLE_CUSTOM_SEARCH_API_KEY',
        'GOOGLE_PROGRAMMABLE_SEARCH_ENGINE_ID',
        'MIDJOURNEY_API_KEY',
        'MIDJOURNEY_CHANNEL_ID',
        'MIDJOURNEY_SERVER_ID',
        'PORT'
    ]
} as const satisfies JSONSchema;

declare module 'fastify' {
    interface FastifyInstance {
        config: FromSchema<typeof envSchema>
    }
}

export default {
    register: async (fastify: FastifyInstance): Promise<FastifyInstance> => {
        fastify.register(
            fastifyEnv,
            {
                dotenv: true,
                schema: envSchema
            }
        );
        return fastify;
    }
}