import { Table } from "dexie";
import { db } from "../../db";
import { pick, isEqual } from "lodash-es";
import { type IBranch, IBranchTableName } from "./IBranch";
import { type IGroup, IGroupTableName, Group } from "../IGroup";

export class Branch implements IBranch {
  $table: Table;

  id?: number;
  name: string;

  groups?: Group[];

  constructor(name: string, id?: number) {
    this.$table = db[IBranchTableName];

    this.name = name;
    if (id !== undefined) this.id = id;
  }

  async loadGroups() {

    this.groups = await db[IGroupTableName].filter((record) => {
      return record.branchId === this.id;
    }).toArray();
  }
}