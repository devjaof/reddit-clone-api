import {
  Entity,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  PrimaryColumn,
  Generated,
} from 'typeorm';
import { Field, ID, ObjectType } from 'type-graphql';
import { v4 as uuid } from 'uuid';
import { Post } from './Post';

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => ID)
  @PrimaryColumn({ unique: true })
  @Generated('uuid')
  id: string = uuid();

  @Field(() => String)
  @Column({ nullable: false, unique: true })
  username: string;

  @Column({ nullable: false })
  password: string;

  @Field(() => String)
  @Column({ unique: true, nullable: false })
  email: string;

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @Field()
  @CreateDateColumn()
  createdAt?: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt?: Date;
}
