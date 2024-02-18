import { Table } from "dexie";
import { db } from "../../db";
import { pick, isEqual } from "lodash-es";
import { type IGroup, IGroupTableName } from "./IGroup";
import { type IBranch, IBranchTableName, Branch } from "../IBranch";

export class Group implements IGroup {
  $table: Table;

  id?: number;
  branchId?: number;
  name: string;

  branch?: Branch;

  constructor(name: string, id?: number, branchId?: number) {
    this.$table = db[IGroupTableName];

    this.name = name;
    if (id !== undefined) this.id = id;
    if (branchId !== undefined) this.branchId = branchId;
  }

  async loadBranch() {
    if (this.branchId !== undefined) {
      const record = await db[IBranchTableName].get({
        "id": this.branchId,
...( || {}),      });
      if (record) {
        this.branch = record as Branch;
      }
    }
  }
}