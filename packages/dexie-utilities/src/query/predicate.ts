import dayjs from "dayjs";
import { get, isObject, isEmpty } from "lodash-es";

const MATCHERS: Record<string, (x: any) => boolean> = {
  IDENTITY: (x: any) => !!x,
  NOT: (x: any) => !x,
};

export function predicate(queries: Record<string, any>, data: Record<string, any>) {
  let matched = true;
  const queryEntries = Object.entries(queries);
  for (let i = 0; matched && i < queryEntries.length; ++i) {
    const [exp, query] = queryEntries[i] || [];
    if (exp) {
      if (
        undefined == query || 
        (typeof query === "string" && query.trim() === "") ||
        (isObject(query) && isEmpty(query))
      ) {
        // undefined, empty string or empty pjo query will be ignored.
        continue;
      }

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
