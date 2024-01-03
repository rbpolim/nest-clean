import { ZodError, ZodSchema } from 'zod'
import { BadRequestException } from '@nestjs/common'
import { fromZodError } from 'zod-validation-error'

export class ZodValidationPipe {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    try {
      const parsedValue = this.schema.parse(value)
      return parsedValue
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          message: 'Validation failed',
          statusCode: 400,
          errors: fromZodError(error),
        })
      }

      throw new BadRequestException('Validation failed')
    }
  }
}
