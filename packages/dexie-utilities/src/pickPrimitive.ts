import { isObject, isArray } from "lodash-es";

function pickPrimitive(object: Record<string, any>) {
  const obj: Record<string, any> = {};
  for (const [name, value] of Object.entries(object)) {
    if (!isObject(value) && !isArray(value) && !/^data\s*:\s*[^:;]+;\s*base64\s*,/i.test(value)) {
      obj[name] = value;
    }
  }

  return obj;
}

export default pickPrimitive;