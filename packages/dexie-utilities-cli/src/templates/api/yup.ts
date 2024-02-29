import * as yup from "yup";

const base64Schema = yup.string().matches(/^data\s*:\s*[^:;]+;\s*base64\s*,/i)
const fileSchema = yup.mixed().test((value) => value instanceof File || base64Schema.isValidSync(value)); 
const fileListSchema = yup.array().of(fileSchema);
const filesSchema = yup.mixed().test((value) => {
  return fileSchema.isValidSync(value) || fileListSchema.isValidSync(value);
});

const $yup: typeof yup & {
  files: any
} = {
  ...yup,
  files: () => filesSchema,
};

export default $yup;