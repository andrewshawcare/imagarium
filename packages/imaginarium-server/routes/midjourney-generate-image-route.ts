import { FromSchema, JSONSchema } from "json-schema-to-ts";
import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import { FastifyInstance } from "fastify";
import Ajv from "ajv"
import { Midjourney } from "midjourney";

const ajv = new Ajv.default()

const generateImageRequestSchema = {
    type: 'object',
    properties: {
        prompt: { type: 'string' }
    },
    required: ['prompt']
} as const satisfies JSONSchema;
type GenerateImageRequest = FromSchema<typeof generateImageRequestSchema>;

const generateImageResponseSchema = {
    type: 'object',
    properties: {
        uri: { type: 'string' }
    },
    required: ['uri']
} as const satisfies JSONSchema;
type GenerateImageResponse = FromSchema<typeof generateImageResponseSchema>;
const generateImageResponseValidator = ajv.compile<GenerateImageResponse>(generateImageResponseSchema);

type MidjourneyServiceParameters = {
    apiKey: string,
    serverId: string,
    channelId: string
}

class MidjourneyService {
    private readonly midjourney: Midjourney;

    constructor(parameters: MidjourneyServiceParameters) {
        this.midjourney = new Midjourney({
            ServerId: parameters.serverId,
            ChannelId: parameters.channelId,
            SalaiToken: parameters.apiKey,
            Debug: true,
            Ws: true
        });
    }

    async generateImage(request: GenerateImageRequest): Promise<GenerateImageResponse> {
        const { prompt } = request;

        return this.midjourney.Imagine(prompt).then(mjMessage => {
            if (!generateImageResponseValidator(mjMessage)) {
                throw new Error(JSON.stringify(generateImageResponseValidator.errors))
            }
            return mjMessage;
        });
    }
}

function register(fastify: FastifyInstance) {
    const {
        MIDJOURNEY_API_KEY,
        MIDJOURNEY_SERVER_ID,
        MIDJOURNEY_CHANNEL_ID
    } = fastify.config;

    const midjourneyService = new MidjourneyService({
        apiKey: MIDJOURNEY_API_KEY,
        serverId: MIDJOURNEY_SERVER_ID,
        channelId: MIDJOURNEY_CHANNEL_ID
    });

    fastify
        .withTypeProvider<JsonSchemaToTsProvider>()
        .get('/midjourney/generate-image', {
            schema: {
                querystring: generateImageRequestSchema,
                response: {
                    200: generateImageResponseSchema
                }
            } as const,
            handler: async (request, reply) => {
                const { prompt } = request.query;

                const generateImageResponse: any = await midjourneyService.generateImage({ prompt })

                reply.status(200).send(generateImageResponse);
            }
        })
}

export default { register }