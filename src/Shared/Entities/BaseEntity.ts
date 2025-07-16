import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BaseEntity as TypeOrmBaseEntity,
  Column
} from 'typeorm'

export abstract class BaseEntity extends TypeOrmBaseEntity {
  @PrimaryGeneratedColumn('uuid')
    id: string

  @CreateDateColumn({ name: 'created_at' })
    createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
    deletedAt?: Date

  @Column({ type: 'boolean', default: true })
    enabled: boolean

  // Métodos comunes que podrían ser útiles para todas las entidades
  toJSON (): Record<string, any> {
    const obj = { ...this }
    delete obj.deletedAt // Por ejemplo, no mostrar campos internos
    return obj
  }
}
