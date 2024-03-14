import { type Table } from "dexie";
import { isNumber, pick } from "lodash-es";
import { groupQueryKeys, getNestedValue } from "./utils";
import { predicate as defaultPredicate } from "./predicate";

const query = async <E = any>(
  $table: Table,
  params: Record<string, any>,
  page?: number,
  pageSize?: number,
  sorter?: {field?: string, order?: "ascend" | "descend"},
  predicate = defaultPredicate
): Promise<{ total: number, data: E[] }> => {
  const [queryDirectKeys, queryNestedKeys] = groupQueryKeys(params);

  let collection = undefined;
  if (queryDirectKeys && queryDirectKeys.length) {
    const directQueries = pick(params, queryDirectKeys);
    collection = $table.filter((record) => {
      return predicate(directQueries, record);
    })
  }
  else {
    collection = $table.toCollection();
  }

  if (queryNestedKeys && queryNestedKeys.length) {
    const filteredIds: any[] = [];
    const records = await collection.toArray();
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      if (record) {
        let result = true;
        for (let j = 0; result && j < queryNestedKeys.length; j++) {
          const queryNestedKey = queryNestedKeys[j];
          if (queryNestedKey) {
            const [name, matcher] = queryNestedKey.split("$");
            if (name) {
              const value = await getNestedValue(record, name);
              result = predicate({[queryNestedKey]: params[queryNestedKey]}, {[name]: value});
            }
          }
        }

        if (result) {
          filteredIds.push(record.id);
        }
      }
    }

    collection = collection.filter((record) => filteredIds.indexOf(record.id) !== -1);
  }

  const total = await collection.count();
  let data = [];
  if (isNumber(page) && isNumber(pageSize)) {
    // page starts from 1.
    if ((page - 1)* pageSize > total) {
      page = Math.floor(total / pageSize) + 1;
    }
    if (sorter && sorter.field && sorter.order) {
      if (sorter.order === "ascend") {
        data = (await collection.offset((page - 1)* pageSize).limit(pageSize).reverse().sortBy(sorter.field)) as E[];
      }
      else {
        data = (await collection.offset((page - 1)* pageSize).limit(pageSize).sortBy(sorter.field)) as E[];
      }
    }
    else {
      data = (await collection.offset((page - 1)* pageSize).limit(pageSize).toArray()) as E[];
    }
  }
  else {
    if (sorter && sorter.field && sorter.order) {
      if (sorter.order === "ascend") {
        data = (await collection.reverse().sortBy(sorter.field)) as E[];
      }
      else {
        data = (await collection.sortBy(sorter.field)) as E[];
      }
    }
    else {
      data = (await collection.toArray()) as E[];
    }
  }

  return { total, data };
};

export { query };