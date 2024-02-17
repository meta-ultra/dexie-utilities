import { type NextRequest, type NextContext, NextResponse, objectify, withValidation } from "@meta-ultra/app-router";
import { query } from "@meta-ultra/dexie-utilities";
import { isEqual, isArray, isString } from "lodash-es";
import * as yup from "yup";
import { db, IBranchTableName, IBranch, Branch } from "@/db";

const $table = db[IBranchTableName];

const searchParamsSchemaOfGet = yup.object({
  page: yup.number().integer().min(1),
  pageSize: yup.number().integer().min(1),
  name: yup.string(),
  id: yup.number(),
});
export const GET = withValidation(
  { searchParamsSchema: searchParamsSchemaOfGet },
  async function (request: NextRequest, context: NextContext) {
    try {
      const { page, pageSize, ...rest } = searchParamsSchemaOfGet.cast(objectify(request.nextUrl.searchParams));
      const { total, data } = await query($table, rest, page, pageSize);

      await Promise.all(
        data.map(async (record: Branch) => {
          return Promise.all([
            await record.loadGroups(),
          ])
        })
      );

      return NextResponse.json({
        code: 0,
        data: {
          total,
          data,
        }
      });
    }
    catch(e) {
      return NextResponse.json({
        code: 1,
        error: e,
        message: (e as {message?: string}).message,
      });
    }
  }
);

const searchParamsSchemaOfDelete = yup.object({
  ids: yup.mixed().test((value) => yup.number().isValidSync(value) || yup.array().of(yup.number()).isValidSync(value)),
  name: yup.string(),
  id: yup.number(),
});
export const DELETE = withValidation(
  { searchParamsSchema: searchParamsSchemaOfDelete },
  async function (request: NextRequest, context: NextContext) {
    try {
      let { ids, ...rest } = searchParamsSchemaOfDelete.cast(objectify(request.nextUrl.searchParams));
      await db.transaction("rw", $table, async () => {
        if (isArray(ids)) {
          ids = yup.array().of(yup.number()).cast(ids);
          await $table.bulkDelete((ids as any[]).filter((x) => x !== undefined) as number[]);
        }
        else if (isString(ids)) {
          ids = yup.number().cast(ids);
          await $table.bulkDelete([ids] as number[]);
        }
        else {
          const { total, data } = await query($table, rest);
          await Promise.all(data.map(async (target) => {
            return $table.filter((record: IBranch) => {
              return isEqual(record, target);
            }).delete();
          }));
        }
      });
      return NextResponse.json({code: 0});
    }
    catch(e) {
      return NextResponse.json({
        code: 1,
        error: e,
        message: (e as {message?: string}).message,
      });
    }
  }
);

const bodySchemaOfPost = yup.object({
  name: yup.string().required(),
  id: yup.number(),
});
export const POST = withValidation(
  { bodySchema: bodySchemaOfPost },
  async function (request: NextRequest, context: NextContext) {
    try {
      const data = bodySchemaOfPost.cast(await request.json());
      $table.add({...data});
      return NextResponse.json({code: 0});
    }
    catch(e) {
      return NextResponse.json({
        code: 1,
        error: e,
        message: (e as {message?: string}).message,
      });
    }
  }
);