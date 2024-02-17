import { type NextRequest, type NextContext, NextResponse, objectify, withValidation } from "@meta-ultra/app-router";
import * as yup from "yup";
import { db, IGroupTableName, Group } from "@/db";

const $table = db[IGroupTableName];

const paramsSchemaOfGet = yup.object({
  name: yup.string(),
  id: yup.number(),
  branchId: yup.number(),
});
export const GET = withValidation(
  { paramsSchema: paramsSchemaOfGet },
  async function (request: NextRequest, context: NextContext) {
    try {
      const params = paramsSchemaOfGet.cast(context.params);
      const data = await $table.get(params) as Group | undefined;
      if (data) {
        await Promise.all([
          await data.loadBranch(),
        ]);
      }

      return NextResponse.json({
        code: 0,
        data,
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

const paramsSchemaOfPut = yup.object({
  id: yup.number().required()
});
const bodySchemaOfPut = yup.object({
  name: yup.string(),
  id: yup.number(),
  branchId: yup.number(),
});
export const PUT = withValidation(
  { 
    paramsSchema: paramsSchemaOfPut, 
    bodySchema: bodySchemaOfPut,
  },
  async function (request: NextRequest, context: NextContext) {
    try {
      const params = paramsSchemaOfPut.cast(context.params);
      const data = bodySchemaOfPut.cast(await request.json());
      await $table.update(params.id, data);
      return NextResponse.json({ code: 0 });
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