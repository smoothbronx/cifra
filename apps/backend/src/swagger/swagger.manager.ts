import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { OpenAPIObject } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

const CONTEXT = 'SwaggerManager';

export class SwaggerManager {
    public static readDocument(
        path = './src/swagger/openapi.json',
    ): OpenAPIObject {
        const data = readFileSync(path, { encoding: 'utf-8' });
        return JSON.parse(data) as OpenAPIObject;
    }

    /**
     * Creates an open api.json specification file
     * @param specData - The OpenAPI specification object
     * @param logger - The logger object
     * @param path - The path to the file from the root directory of the NestJS application
     */
    public static writeDocument(
        specData: OpenAPIObject,
        logger: Logger,
        path = './',
    ) {
        const filename =
            (path.endsWith('/') ? path : path + '/').replace('./', '') +
            'openapi.json';

        try {
            writeFileSync(
                join(__dirname, '../../', filename),
                JSON.stringify(specData, null, 4),
                {
                    encoding: 'utf-8',
                },
            );
            logger.log(
                'The specification file has been successfully overwritten',
                CONTEXT,
            );
        } catch (error) {
            logger.error('Failed to create a specification file', CONTEXT);
            console.log(error);
        }
    }
}
