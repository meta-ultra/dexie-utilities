export const IBranchTableName = "branches";
export const IBranchSchema = "++id, name";
export type IBranchKeyType = number;

export interface IBranch {
    id?: number;
    name: string;
}