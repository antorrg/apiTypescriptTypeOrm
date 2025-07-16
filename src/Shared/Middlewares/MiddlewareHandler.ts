import { validate as uuidValidate } from 'uuid'
import { type Request, type Response, type NextFunction } from 'express'

type FieldType = 'boolean' | 'int' | 'float' | 'string' | 'array'

interface FieldDefinition {
  name: string
  type: FieldType
  default?: any
}

export class MiddlewareHandler {
  static middError = (message: string, status: number): Error & { statusCode?: number } => {
    const error = new Error(message) as Error & { status?: number }
    error.status = status
    return error
  }

  static getDefaultValue (type: FieldType): any {
    switch (type) {
      case 'boolean': return false
      case 'int': return 1
      case 'float': return 1.0
      case 'string': return ''
      default: return null
    }
  }

  static validateBoolean (value: any): boolean {
    if (typeof value === 'boolean') return value
    if (value === 'true') return true
    if (value === 'false') return false
    throw new Error('Invalid boolean value')
  }

  static validateInt (value: any): number {
    const intValue = Number(value)
    if (isNaN(intValue) || !Number.isInteger(intValue)) {
      throw new Error('Invalid integer value')
    }
    return intValue
  }

  static validateFloat (value: any): number {
    const floatValue = parseFloat(value)
    if (isNaN(floatValue)) {
      throw new Error('Invalid float value')
    }
    return floatValue
  }

  static validateValue (
    value: any,
    fieldType: FieldType,
    fieldName: string,
    itemIndex: number | null = null
  ): any {
    const indexInfo = itemIndex !== null ? ` in item[${itemIndex}]` : ''

    switch (fieldType) {
      case 'boolean':
        return this.validateBoolean(value)
      case 'int':
        return this.validateInt(value)
      case 'float':
        return this.validateFloat(value)
      case 'array':
        if (!Array.isArray(value)) {
          throw new Error(`Invalid array value for field ${fieldName}${indexInfo}`)
        }
        return value
      case 'string':
      default:
        if (typeof value !== 'string') {
          throw new Error(`Invalid string value for field ${fieldName}${indexInfo}`)
        }
        return value
    }
  }

  static validateFields (requiredFields: FieldDefinition[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      const newData = req.body
      if (!newData || Object.keys(newData).length === 0) {
        next(this.middError('Invalid parameters', 400)); return
      }

      const missingFields = requiredFields.filter(field => !(field.name in newData))
      if (missingFields.length > 0) {
        next(this.middError(`Missing parameters: ${missingFields.map(f => f.name).join(', ')}`, 400)); return
      }

      try {
        requiredFields.forEach(field => {
          const value = newData[field.name]
          newData[field.name] = this.validateValue(value, field.type, field.name)
        })

        Object.keys(newData).forEach(key => {
          if (!requiredFields.some(field => field.name === key)) {
            delete newData[key]
          }
        })
      } catch (error: any) {
        next(this.middError(error.message, 400)); return
      }

      req.body = newData
      next()
    }
  }

  static validateFieldsWithItems (
    requiredFields: FieldDefinition[],
    secondFields: FieldDefinition[],
    arrayFieldName: string
  ) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const firstData = { ...req.body }
        const secondData = Array.isArray(req.body[arrayFieldName])
          ? [...req.body[arrayFieldName]]
          : null

        if (!firstData || Object.keys(firstData).length === 0) {
          next(this.middError('Invalid parameters', 400)); return
        }

        const missingFields = requiredFields.filter((field) => !(field.name in firstData))
        if (missingFields.length > 0) {
          next(this.middError(`Missing parameters: ${missingFields.map(f => f.name).join(', ')}`, 400)); return
        }

        requiredFields.forEach(field => {
          const value = firstData[field.name]
          firstData[field.name] = this.validateValue(value, field.type, field.name)
        })

        Object.keys(firstData).forEach(key => {
          if (!requiredFields.some(field => field.name === key)) {
            delete firstData[key]
          }
        })

        if ((secondData == null) || secondData.length === 0) {
          next(this.middError(`Missing ${arrayFieldName} array or empty array`, 400)); return
        }

        const invalidStringItems = secondData.filter((item) => typeof item === 'string')
        if (invalidStringItems.length > 0) {
          next(
            this.middError(
              `Invalid "${arrayFieldName}" content: expected objects but found strings (e.g., ${invalidStringItems[0]})`,
              400
            )
          ); return
        }

        const validatedSecondData = secondData.map((item, index) => {
          const missingItemFields = secondFields.filter((field) => !(field.name in item))
          if (missingItemFields.length > 0) {
            throw this.middError(
              `Missing parameters in ${arrayFieldName}[${index}]: ${missingItemFields.map(f => f.name).join(', ')}`,
              400
            )
          }

          secondFields.forEach(field => {
            const value = item[field.name]
            item[field.name] = this.validateValue(value, field.type, field.name, index)
          })

          return secondFields.reduce((acc: any, field) => {
            acc[field.name] = item[field.name]
            return acc
          }, {})
        })

        req.body = {
          ...firstData,
          [arrayFieldName]: validatedSecondData
        }

        next()
      } catch (err: any) {
        next(this.middError(err.message, 400))
      }
    }
  }

  static validateQuery (requiredFields: FieldDefinition[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const validatedQuery: Record<string, any> = {}

        requiredFields.forEach(({ name, type, default: defaultValue }) => {
          let value = req.query[name]

          if (value === undefined) {
            value = defaultValue !== undefined ? defaultValue : this.getDefaultValue(type)
          } else {
            value = this.validateValue(value, type, name)
          }

          validatedQuery[name] = value
        })

        ;(req as any).validatedQuery = validatedQuery
        next()
      } catch (error: any) {
        next(this.middError(error.message, 400))
      }
    }
  }

  static validateRegex (validRegex: RegExp, nameOfField: string, message: string | null = null) {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!validRegex || !nameOfField || nameOfField.trim() === '') {
        next(this.middError('Missing parameters in function!', 400)); return
      }
      const field = req.body[nameOfField]
      const personalizedMessage = message ? ' ' + message : ''
      if (!field || typeof field !== 'string' || field.trim() === '') {
        next(this.middError(`Missing ${nameOfField}`, 400)); return
      }
      if (!validRegex.test(field)) {
        next(this.middError(`Invalid ${nameOfField} format!${personalizedMessage}`, 400)); return
      }
      next()
    }
  }

  static middUuid (fieldName: string) {
    return (req: Request, res: Response, next: NextFunction) => {
      const id = req.params[fieldName]
      if (!id) { next(this.middError('Falta el id', 400)); return }
      if (!uuidValidate(id)) { next(this.middError('Parametros no permitidos', 400)); return }
      next()
    }
  }

  static middIntId (fieldName: string) {
    return (req: Request, res: Response, next: NextFunction) => {
      const id = req.params[fieldName]
      if (!id) { next(this.middError('Falta el id', 400)); return }
      if (!Number.isInteger(Number(id))) { next(this.middError('Parametros no permitidos', 400)); return }
      next()
    }
  }

  static logRequestBody (req: Request, res: Response, next: NextFunction) {
    if (process.env.NODE_ENV !== 'test') {
      next(); return
    }
    const timestamp = new Date().toISOString()
    console.log(`[${timestamp}] Request Body:`, req.body)
    next()
  }
}
