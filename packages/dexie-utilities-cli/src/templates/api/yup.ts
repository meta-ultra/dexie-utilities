import * as yup from "yup";
import { isArrayLike, toArray } from "@meta-ultra/app-router";

const base64 = yup.string().matches(/^data\s*:\s*[^:;]+;\s*base64\s*,/i)
const file = () => yup.mixed().test((value) => value instanceof File || base64.isValidSync(value)); 

function maybeArrayOf(schema: yup.Schema) {
  const batchSchema = yup.array().of(schema).transform((value) => {
    return value.map((item: any) => schema.cast(item));
  });
  const mixedSchema = yup.mixed().test((value) => {
    return isArrayLike(value as any) ? batchSchema.isValid(toArray(value as any)) : schema.isValid(value);
  }).transform((value) => {
    return isArrayLike(value as any) ? batchSchema.cast(toArray(value)) : schema.cast(value);
  });

  return mixedSchema;
}

const $yup: typeof yup & {
  dates: () => yup.MixedSchema;
  file: () => yup.MixedSchema;
  maybeArrayOf: (schema: yup.Schema) => yup.MixedSchema;
} = {
  ...yup,
  dates: file,
  file,
  maybeArrayOf,
};

export default $yup;