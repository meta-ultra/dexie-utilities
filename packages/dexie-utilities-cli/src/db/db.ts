import Dexie, { type Table } from 'dexie';
import { type IBranch, IBranchTableName, IBranchSchema, IBranchKeyType, Branch, populateIBranch } from './entities/IBranch';
import { type IGroup, IGroupTableName, IGroupSchema, IGroupKeyType, Group, populateIGroup } from './entities/IGroup';

export class ApplicationDexie extends Dexie {
  [IBranchTableName]!: Table<IBranch, IBranchKeyType>;
  [IGroupTableName]!: Table<IGroup, IGroupKeyType>;

  constructor() {
    super("applicationDatabase");
    this.version(1).stores({
      [IBranchTableName]: IBranchSchema,
      [IGroupTableName]: IGroupSchema,
    });
  }
}

export const db = new ApplicationDexie();

db[IBranchTableName].mapToClass(Branch);
db[IGroupTableName].mapToClass(Group);

const populate = async function populate(this: ApplicationDexie) {
  console.info("[@meta-ultra/app-router] population is done.");

  await populateIBranch(this);
  await populateIGroup(this);
}.bind(db);
db.on("populate", () => populate());

// expose for debugging
(window as unknown as {db: Dexie}).db = db;
(window as unknown as {populate: (this: ApplicationDexie) => Promise<any>}).populate = populate;