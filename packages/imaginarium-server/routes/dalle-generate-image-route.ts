import { FromSchema, JSONSchema } from "json-schema-to-ts";
import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import Ajv from "ajv"

const ajv = new Ajv.default()

const generateImageRequestSchema = {
    type: 'object',
    properties: {
        prompt: { type: 'string' },
        variations: { type: 'number' },
        width: { type: 'number' },
        height: { type: 'number' }
    },
    required: ['prompt', 'variations', 'width', 'height']
} as const satisfies JSONSchema;
type GenerateImageRequest = FromSchema<typeof generateImageRequestSchema>;

const generateImageResponseSchema = {
    type: 'object',
    properties: {
        data: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    url: { type: 'string' }
                },
                required: ['url']
            }
        },
    },
    required: ['data']
} as const satisfies JSONSchema;
type GenerateImageResponse = FromSchema<typeof generateImageResponseSchema>;
const generateImageResponseValidator = ajv.compile<GenerateImageResponse>(generateImageResponseSchema);

class DalleService {
    private readonly apiKey: string;
    private readonly origin: string;

    constructor({ apiKey }: { apiKey: string }) {
        this.apiKey = apiKey;
        this.origin = 'https://api.openai.com/v1/images/generations';
    }

    async generateImage(request: GenerateImageRequest): Promise<GenerateImageResponse> {
        const { prompt, variations, width, height } = request;

        return fetch(this.origin, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt,
                n: variations,
                size: `${width}x${height}`
            })
        }).then(response => response.json() as Promise<unknown>)
            .then(generateImageResponse => {
                if (!generateImageResponseValidator(generateImageResponse)) {
                    throw new Error(JSON.stringify(generateImageResponseValidator.errors))
                }

                return generateImageResponse;
            })
    }
}

function register(fastify: FastifyInstance) {
    const { DALLE_API_KEY } = fastify.config;

    const dalleService = new DalleService({ apiKey: DALLE_API_KEY })

    fastify
        .withTypeProvider<JsonSchemaToTsProvider>()
        .get('/dalle/generate-image', {
            schema: {
                querystring: generateImageRequestSchema,
                response: {
                    200: generateImageResponseSchema
                }
            } as const,
            handler: async (request, reply) => {
                const { prompt, variations, width, height } = request.query;

                const generateImageResponse: any = await dalleService.generateImage({ prompt, variations, width, height })

                reply.status(200).send(generateImageResponse);
            }
        })
}

export default { register }