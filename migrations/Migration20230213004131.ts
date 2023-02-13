import { Migration } from '@mikro-orm/migrations';

export class Migration20230213004131 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "post" ("id" varchar(255) not null, "title" varchar(255) not null, "created_at" varchar(255) not null, "updated_at" varchar(255) not null, constraint "post_pkey" primary key ("id"));');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "post" cascade;');
  }

}
