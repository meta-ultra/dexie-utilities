import { type ApplicationDexie } from "../../db";
import { IBranchTableName } from "./IBranch";
import { mock, Random } from "mockjs";

export async function populateIBranch(db: ApplicationDexie) {
  const $table = db[IBranchTableName];
  await $table.clear();

  const data = [];

  await $table.bulkAdd(data);
}