import { isArray, isObject } from "lodash-es";

/**
 * Convert the file instance to dataURI string.
 * @param input 
 * @returns 
 */
async function dataUrify(input: File | any[] | Record<string, any>): Promise<any> {
  if (input instanceof File) {
    return dataURIifyFile(input);
  }
  else if (isArray(input)) {
    return dataURIifyArray(input);
  }
  else if (isObject(input)) {
    return dataURIifyObject(input);
  }
  else {
    return input;
  }
}
function dataURIifyFile(input: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(input);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
async function dataURIifyObject(input: Record<string, any>) {
  const obj: Record<string, any> = {};
  for (const [name, value] of Object.entries(input)) {
    obj[name] = await dataUrify(value);
  }

  return obj;
}
async function dataURIifyArray(input: any[]) {
  const array: any[] = [];
  for (const item of input) {
    array.push(await dataUrify(item));
  }

  return array;
}

export default dataUrify;