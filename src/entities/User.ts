import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ID, ObjectType } from "type-graphql";
import { v4 as uuid} from 'uuid';

@ObjectType()
@Entity()
export class User {
  @Field(() => ID)
  @PrimaryKey()
  id: string = uuid();

  @Field(() => Date)
  @Property({ type: "date" })
  createdAt? = new Date();

  @Field(() => Date)
  @Property({ type: "date", onUpdate: () => new Date() })
  updatedAt? = new Date();

  @Field(() => String)
  @Property({ type: "text", unique: true })
  username!: string;

  @Property({ type: "text" })
  password!: string;
}