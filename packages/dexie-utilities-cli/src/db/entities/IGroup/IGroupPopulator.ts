import { type ApplicationDexie } from "../../db";
import { IGroupTableName } from "./IGroup";
import { mock, Random } from "mockjs";

export async function populateIGroup(db: ApplicationDexie) {
  const $table = db[IGroupTableName];
  await $table.clear();

  const data = [];

  await $table.bulkAdd(data);
}