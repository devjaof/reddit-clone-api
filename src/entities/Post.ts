import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ID, ObjectType } from "type-graphql";
import { v4 as uuid} from 'uuid';

@ObjectType()
@Entity()
export class Post {
  @Field(() => ID)
  @PrimaryKey()
  id: string = uuid();

  @Field(() => String, { nullable: true })
  @Property({ type: "text" })
  title?: string;

  @Field(() => Date)
  @Property({ type: "date" })
  createdAt? = new Date();

  @Field(() => Date)
  @Property({ type: "date", onUpdate: () => new Date() })
  updatedAt? = new Date();
}