import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class Post {
  @Field()
  @PrimaryKey({ autoincrement: true })
  id!: number;

  @Field(() => String)
  @Property({ type: "text" })
  title!: string;

  @Field(() => Date)
  @Property({ type: "date" })
  createdAt? = new Date();

  @Field(() => Date)
  @Property({ type: "date", onUpdate: () => new Date() })
  updatedAt? = new Date();
}