import dayjs from "dayjs";
import { type Table } from "dexie";
import { get, isString, isNumber, isNil } from "lodash-es";
import { getQueryParams, groupQueryKeys, getNestedValue } from "./utils";

const defaultFilter = (queryKey: string | undefined, value: any, queryValue: any): boolean => {
  if (isString(value)) {
    return (value ?? "").indexOf(queryValue) !== -1;
  }
  // TODO: additional predications added here
  // else if () {
  // }
  else if (value instanceof Date) {
    const match = /(\d{4})(?:[-/]?(\d{2}))?(?:[-/]?(\d{2}))?(?:(?:\s*T\s*|\s+)(\d{2})(?::(\d{2}))?(?::(\d{2}))?)?/.exec(queryValue);
    let unit = match && ["year", "month", "day", "hour", "minute", "second"][match.filter((x) => x).length - 2] || "second";
    if (queryKey !== undefined) {
      if (/^(?:start|begin)(?=[A-Z_\W])/.test(queryKey)) {
        return dayjs(queryValue).isBefore(dayjs(value), unit as any) || dayjs(queryValue).isSame(dayjs(value), unit as any);
      }
      if (/^(?:end|stop)(?=[A-Z_\W])/.test(queryKey)) {
        return dayjs(queryValue).isAfter(dayjs(value), unit as any) || dayjs(queryValue).isSame(dayjs(value), unit as any);
      }
    }

    return dayjs(queryValue).isSame(dayjs(value), unit as any);
  }
  else if (isNil(value)) {
    return isNil(queryValue) || queryValue === "";
  }
  else {
    return value === queryValue;
  }
}

const query = async <E = any>(
  $table: Table,
  params: Record<string, any>,
  page?: number,
  pageSize?: number,
  sorter?: {field: string, order: "ascend" | "descend"},
  filter = defaultFilter
): Promise<{ total: number, data: E[] }> => {
  const [queryDirectKeys, queryNestedKeys] = groupQueryKeys(getQueryParams(params));

  let collection = undefined;
  if (queryDirectKeys && queryDirectKeys.length) {
    collection = $table.filter((record) => {
      const result = queryDirectKeys.reduce((result, queryKey) => {
        const value = get(record, queryKey);
        const queryValue = params[queryKey];
        return result && filter(queryKey, value, queryValue);
      }, true)

      return result;
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
            const value = await getNestedValue(record, queryNestedKey);
            const nestestQueryKey = queryNestedKey.split(".").filter(x => x).pop();
            result = filter(nestestQueryKey, value, params[queryNestedKey]);
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