import { type BaseRepository } from '../Repositories/BaseRepository.js'
import { type FindOptionsWhere, type ObjectLiteral, type DeepPartial } from 'typeorm'
import { type deletFunctionTrue } from '../../../test/generalFunctions.js'
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity.js'

type ParserFunction<T> = (doc: T) => any

export class BaseService<T extends ObjectLiteral> {
  protected readonly repository: BaseRepository<T>
  protected readonly useImages: boolean
  protected readonly deleteImages?: typeof deletFunctionTrue
  protected readonly parserFunction?: ParserFunction<T>

  constructor (
    repository: BaseRepository<T>,
    useImages = false,
    deleteImages?: typeof deletFunctionTrue,
    parserFunction?: ParserFunction<T>
  ) {
    this.repository = repository
    this.useImages = useImages
    this.deleteImages = deleteImages
    this.parserFunction = parserFunction
  }

  async getAll () {
    const res = await this.repository.getAll()
    return {
      ...res,
      results: (this.parserFunction != null) ? res.results.map(this.parserFunction) : res.results
    }
  }

  async findWithPagination (query: any) {
    const res = await this.repository.findWithPagination(query)
    return {
      ...res,
      results: (this.parserFunction != null) ? res.results.map(this.parserFunction) : res.results
    }
  }

  async getById (id: string) {
    const res: { message: string, results: any } = await this.repository.getById(id)
    return {
      ...res,
      results: (this.parserFunction != null) ? this.parserFunction(res.results) : res.results
    }
  }

  async getOne (where: FindOptionsWhere<T>) {
    const res: { message: string, results: any } = await this.repository.getOne(where)
    return {
      ...res,
      results: (this.parserFunction != null) ? this.parserFunction(res.results) : res.results
    }
  }

  async create (data: DeepPartial<T>) {
    const res: { message: string, results: any } = await this.repository.create(data)
    return {
      ...res,
      results: (this.parserFunction != null) ? this.parserFunction(res.results) : res.results
    }
  }

  async update (id: string, data: QueryDeepPartialEntity<T>) {
    let imageUrl
    if (this.useImages && (this.deleteImages != null)) {
      const prev = await this.repository.getById(id)
      if ((prev.results as any).picture && (data as any).picture && (prev.results as any).picture !== (data as any).picture) {
        imageUrl = (prev.results as any).picture
      }
    }
    const res: { message: string, results: any } = await this.repository.update(id, data)
    if (this.useImages && (this.deleteImages != null) && imageUrl) { await this.deleteImages(imageUrl) }
    return {
      ...res,
      results: (this.parserFunction != null) ? this.parserFunction(res.results) : res.results
    }
  }

  async delete (id: string) {
    if (this.useImages && (this.deleteImages != null)) {
      const prev = await this.repository.getById(id)
      if ((prev.results as any).picture) {
        await this.deleteImages((prev.results as any).picture)
      }
    }
    return await this.repository.delete(id)
  }
}
