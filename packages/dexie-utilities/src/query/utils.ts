import { groupBy, capitalize, isEmpty, get, isFunction } from "lodash-es";
import { type Table } from "dexie";

/**
 * separate nested keys such as "villager.groupId" from direct keys like "name".
 */
const groupQueryKeys = (params: Record<string, string>): [undefined | string[], undefined | string[]] => {
  const { queryDirectKeys, queryNestedKeys } = groupBy(
    Object.keys(params).filter((key) => params[key] !== undefined),
    (key) => key.indexOf(".") === -1 ? "queryDirectKeys" : "queryNestedKeys"
  );

  return [queryDirectKeys, queryNestedKeys];
};

/**
 * get the value of a specific nested key 
 * @returns 
 */
const getNestedValue = async (
  record: Table,
  queryNestedKey: string,
  getLoaderName = (name: string) => `load${capitalize(name)}`
) => {
  // call the loadXXX method chain first
  let nestedRecord = record;
  const nestedKeys = queryNestedKey.split(".").filter(x => !isEmpty(x));
  for (const nestedKey of nestedKeys) {
    if (nestedKey) {
      if (!(nestedKey in nestedRecord)) {
        const load = (nestedRecord as any)[getLoaderName(nestedKey)];
        if (isFunction(load)) {
          await load.call(nestedRecord);
        }
      }
      if ((nestedKey in nestedRecord)) {
        nestedRecord = (nestedRecord as any)[nestedKey];
      }
      else {
        console.log(`The nested property "${nestedKey}" does not exist.`);
        break;
      }
    }
  }

  return get(record, nestedKeys.join("."));
};

export { groupQueryKeys, getNestedValue };