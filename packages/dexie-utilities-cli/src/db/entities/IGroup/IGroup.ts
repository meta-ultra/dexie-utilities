export const IGroupTableName = "groups";
export const IGroupSchema = "++id, branchId, name";
export type IGroupKeyType = number;

export interface IGroup {
    id?: number;
    branchId?: number;
    name: string;
}