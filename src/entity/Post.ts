import {
  Entity,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Generated,
  PrimaryColumn,
} from 'typeorm';
import { Field, ID, Int, ObjectType } from 'type-graphql';
import { v4 as uuid } from 'uuid';
import { User } from './User';

@ObjectType()
@Entity()
export class Post {
  @Field(() => ID)
  @PrimaryColumn({ unique: true })
  @Generated('uuid')
  id: string = uuid();

  @Field(() => String, { nullable: false })
  @Column({ type: 'text' })
  title: string;

  @Field(() => String, { nullable: false })
  @Column({ type: 'text' })
  body: string;

  @ManyToOne(() => User, (user) => user.posts)
  user: User;

  @Field(() => Int)
  @Column({ type: 'int', default: 0 })
  points: string;

  @Field()
  @CreateDateColumn()
  createdAt?: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt?: Date;
}
