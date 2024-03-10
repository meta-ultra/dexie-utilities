import dayjs from "dayjs";
import { type Table } from "dexie";
import { get, isString, isNumber, isNil, isArray, pick } from "lodash-es";
import { groupQueryKeys, getNestedValue } from "./utils";

      // const match = /(\d{4})(?:[-/]?(\d{2}))?(?:[-/]?(\d{2}))?(?:(?:\s*T\s*|\s+)(\d{2})(?::(\d{2}))?(?::(\d{2}))?)?/.exec(queryValue[0]);
      // let unit = match && ["year", "month", "day", "hour", "minute", "second"][match.filter((x) => x).length - 2] || "second";

const MATCHERS: Record<string, (x: any) => boolean> = {
  IDENTITY: (x: any) => !!x,
  NOT: (x: any) => !x,
};

function defaultPredicate(queries: Record<string, any>, data: Record<string, any>) {
  let matched = true;
  const queryEntries = Object.entries(queries);
  for (let i = 0; matched && i < queryEntries.length; ++i) {
    const [exp, query] = queryEntries[i] || [];
    if (exp) {
      if (undefined == query || (typeof query === "string" && query.trim() === "")) continue;

      const [name, matcherName = "identity"] = exp.split("$");
      const matcher = MATCHERS[matcherName.toUpperCase()] || MATCHERS.IDENTITY as (x: any) => boolean;

      if (name) {
        const value = get(data, name);
        if (typeof value === "string" && typeof query === "string") {
          matched = matcher(value.indexOf(query) !== -1);
        }
        else if (typeof query === "number") {
          matched = matcher(value === query);
        }
        else if (Object.prototype.toString.call(query) === "[object Array]") {
          if (
            query.length === 2 &&
            dayjs(query[0]).isValid() &&
            dayjs(query[1]).isValid()
          ) {
            if (value && dayjs(value).isValid()) {
              const [v,s,e] = [dayjs(value), dayjs(query[0]), dayjs(query[1])];
              matched = matcher((v.isAfter(s) || v.isSame(s)) && (v.isBefore(e) || v.isSame(e)));
            }
            else {
              matched = false;
            }
          }
          else {
            matched = matcher(query.find((q: any) => {
              if (typeof value === "string" && typeof q === "string") {
                return value.indexOf(q) !== -1;
              }
              else {
                return value == q;
              }
            }));
          }
        }
        else {
          matched = matcher(value == query);
        }
      }
      else {
        matched = false;
      }
    }
  }  

  return matched;
}

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