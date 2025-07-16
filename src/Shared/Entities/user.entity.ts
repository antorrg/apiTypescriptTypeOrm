import { Entity, Column } from 'typeorm'
import { BaseEntity } from './BaseEntity.js'

@Entity({
  name: 'users'
})
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
    email: string

  @Column({ type: 'varchar', length: 100 })
    password: string

  @Column({ type: 'varchar', length: 100 })
    nickname: string

  @Column({ type: 'varchar', length: 255 })
    picture: string

  @Column({ type: 'varchar', length: 100, nullable: true })
    name?: string

  @Column({ type: 'varchar', length: 100, nullable: true })
    surname?: string

  @Column({ type: 'varchar', length: 100, nullable: true })
    country?: string

  @Column({ type: 'boolean', default: false })
    isVerify: boolean

  @Column({ type: 'int', default: 1 })
    role: number

  @Column({ type: 'boolean', default: false })
    isRoot: boolean
}
