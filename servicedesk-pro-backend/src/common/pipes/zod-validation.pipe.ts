import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ZodType, ZodError } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
    constructor(private readonly schema: ZodType<any>) { }

    transform(value: unknown, metadata: ArgumentMetadata) {
        if (metadata.type === 'body') {
            try {
                const parsedValue = this.schema.parse(value);
                return parsedValue;
            } catch (error) {
                if (error instanceof ZodError) {
                    const errorMessages = error.issues.map(
                        (err) => `${err.path.join('.')}: ${err.message}`
                    );
                    throw new BadRequestException({
                        message: 'Validation failed',
                        errors: errorMessages,
                    });
                }
                throw error;
            }
        }
        return value;
    }
}