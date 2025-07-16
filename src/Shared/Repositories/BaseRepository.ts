import { type Repository, type FindOptionsWhere, type FindOptionsOrder, type DeepPartial, type EntityTarget, type ObjectLiteral } from 'typeorm'
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity.js'
import { AppDataSource } from '../../Configs/dataSource.js'
import eh from '../../Configs/errorHandlers.js'

interface Pagination {
  page?: number
  limit?: number
  filters?: Record<string, any>
}
interface ResponseWithPagination<T> {
  message: string
  results: T[]
  info: {
    totalPages: number
    total: number
    page: number
    limit: number
    count: number
  }
}

export class BaseRepository<T extends ObjectLiteral> {
  protected readonly model: Repository<T>
  protected readonly modelName?: string
  protected readonly whereField?: string
  constructor (
    entityClass: EntityTarget<T>,
    modelName?: string,
    whereField?: string
  ) {
    this.model = AppDataSource.getRepository(entityClass)
    this.modelName = modelName
    this.whereField = whereField
  }

  async getAll (): Promise<{ message: string, results: T[] }> {
    const docs = await this.model.find()
    if (!docs) { eh.throwError(`${this.modelName} not found`, 404) }
    if (docs.length === 0) { return { message: `No ${this.modelName} yet`, results: [] } }
    return {
      message: `${this.modelName} retrieved`,
      results: docs
    }
  }

  async findWithPagination (query: Pagination & { sort?: FindOptionsOrder<T> }): Promise<ResponseWithPagination<T>> {
    const page = query.page ?? 1
    const limit = query.limit ?? 10
    const skip = (page - 1) * limit
    const filters = (query.filters != null) && typeof query.filters === 'object' ? query.filters : {}
    const order = (query.sort != null) && typeof query.sort === 'object' ? query.sort : {}

    const [docs, total] = await this.model.findAndCount({
      where: filters,
      order,
      skip,
      take: limit
    })
    const totalPages = Math.ceil(total / limit)

    return {
      message: `${this.modelName} list retrieved`,
      results: docs,
      info: {
        total,
        page,
        totalPages,
        limit,
        count: docs.length
      }
    }
  }

  async getById (id: string): Promise<{ message: string, results: T | null }> {
    const doc = await this.model.findOneBy({ id } as unknown as FindOptionsWhere<T>)
    if (doc == null) {
      eh.throwError(`${this.modelName} not found`, 404)
    }
    return {
      message: `${this.modelName} retrieved`,
      results: doc
    }
  }

  async getOne (where: FindOptionsWhere<T>): Promise<{ message: string, results: T | null }> {
    const doc = await this.model.findOneBy(where)
    if (doc == null) {
      eh.throwError(`This ${this.modelName} not found`, 404)
    }
    return {
      message: `${this.modelName} retrieved`,
      results: doc
    }
  }

  async create (data: DeepPartial<T>): Promise<{ message: string, results: T }> {
    if (!this.whereField) {
      throw new Error('No field specified for search')
    }
    if (!(this.whereField in data)) {
      throw new Error(`Missing value for field "${String(this.whereField)}" in data`)
    }
    const fieldValue = data[this.whereField as keyof DeepPartial<T>]
    const exists = await this.model.findOneBy({ [this.whereField]: fieldValue } as FindOptionsWhere<T>)
    if (exists != null) {
      eh.throwError(`This ${this.modelName} already exists`, 400)
    }
    const entity = this.model.create(data)
    const newDoc = await this.model.save(entity)
    return {
      message: `${this.modelName} created successfully`,
      results: newDoc
    }
  }

  async update (id: string, data: QueryDeepPartialEntity<T>): Promise<{ message: string, results: T | null }> {
    await this.model.update(id, data)
    const updated = await this.model.findOneBy({ id } as unknown as FindOptionsWhere<T>)
    if (updated == null) {
      eh.throwError(`${this.modelName} not found`, 404)
    }
    return {
      message: `${this.modelName} updated successfully`,
      results: updated
    }
  }

  async delete (id: string): Promise<{ message: string }> {
    const result = await this.model.delete(id)
    if (result.affected === 0) {
      eh.throwError(`${this.modelName} not found`, 404)
    }
    return {
      message: `${this.modelName} deleted successfully`
    }
  }
}
