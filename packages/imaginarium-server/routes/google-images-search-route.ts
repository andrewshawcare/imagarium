import { FromSchema, JSONSchema } from "json-schema-to-ts";
import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import { StatusCodes } from "http-status-codes";
import { RateLimitOptions } from "@fastify/rate-limit"
import Ajv from "ajv";

const ajv = new Ajv.default()

const safetyLevelSchema = {
    type: 'string',
    enum: ['off', 'active']
} as const satisfies JSONSchema;

const searchRequestSchema = {
    type: 'object',
    properties: {
        query: { type: 'string' },
        resultCount: { type: 'number' },
        safetyLevel: safetyLevelSchema
    },
    required: ['query', 'resultCount', 'safetyLevel']
} as const satisfies JSONSchema;
type SearchRequest = FromSchema<typeof searchRequestSchema>

const searchResponseSchema = {
    type: 'object',
    properties: {
        items: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    title: { type: 'string' },
                    image: {
                        type: 'object',
                        properties: {
                            thumbnailHeight: { type: 'number' },
                            thumbnailWidth: { type: 'number' },
                            thumbnailLink: { type: 'string' }
                        },
                        required: ['thumbnailHeight', 'thumbnailWidth', 'thumbnailLink']
                    }
                },
                required: ['title', 'image']
            }
        }
    },
    required: ['items']
} as const satisfies JSONSchema;
type SearchResponse = FromSchema<typeof searchResponseSchema>;
const searchResponseValidator = ajv.compile<SearchResponse>(searchResponseSchema)

class TooManyRequestsError extends Error { }

class GoogleImagesService {
    private readonly apiKey: string;
    private readonly programmableSearchEngineId: string;
    private readonly origin: string;

    constructor({
        apiKey,
        programmableSearchEngineId
    }: {
        apiKey: string,
        programmableSearchEngineId: string
    }) {
        this.apiKey = apiKey;
        this.programmableSearchEngineId = programmableSearchEngineId;
        this.origin = 'https://www.googleapis.com/customsearch/v1'
    }

    async search(request: SearchRequest): Promise<SearchResponse> {
        const { query, resultCount, safetyLevel } = request;

        const urlSearchParams = new URLSearchParams({
            key: this.apiKey,
            cx: this.programmableSearchEngineId,
            q: query,
            num: resultCount.toString(10),
            safe: safetyLevel,
            searchType: "image"
        });

        const searchResponse = await fetch(`${this.origin}?${urlSearchParams}`);

        if (searchResponse.status !== 200) {
            throw new TooManyRequestsError()
        }

        const searchResponseJson: unknown = await searchResponse.json()

        if (!searchResponseValidator(searchResponseJson)) {
            throw new Error(JSON.stringify(searchResponseValidator.errors))
        }

        return searchResponseJson;
    }
}

function register(fastify: FastifyInstance) {
    const {
        GOOGLE_CUSTOM_SEARCH_API_KEY,
        GOOGLE_PROGRAMMABLE_SEARCH_ENGINE_ID
    } = fastify.config;

    const googleImagesService = new GoogleImagesService({
        apiKey: GOOGLE_CUSTOM_SEARCH_API_KEY,
        programmableSearchEngineId: GOOGLE_PROGRAMMABLE_SEARCH_ENGINE_ID
    })

    fastify
        .withTypeProvider<JsonSchemaToTsProvider>()
        .get('/google-images/search', {
            config: {
                rateLimit: {
                    max: 4,
                    timeWindow: 1000 * 60 * 60,
                    keyGenerator: () => 0
                } as const satisfies RateLimitOptions
            },
            schema: {
                querystring: searchRequestSchema,
                response: {
                    [StatusCodes.OK]: searchResponseSchema
                }
            } as const,
            handler: async (request, reply) => {
                const { query, resultCount, safetyLevel } = request.query;

                let searchResponse;
                try {
                    searchResponse = await googleImagesService.search({ query, resultCount, safetyLevel })
                } catch (error) {
                    console.error(error)
                    if (error instanceof TooManyRequestsError) {
                        reply.status(StatusCodes.TOO_MANY_REQUESTS).send();
                    }
                    throw error;
                }

                reply.status(StatusCodes.OK).send(searchResponse);
            }
        })
}

export default {
    register
}