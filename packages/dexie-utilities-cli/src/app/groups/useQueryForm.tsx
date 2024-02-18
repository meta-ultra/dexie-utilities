import { type ReactNode, useEffect } from 'react';
import { type FormInstance, Form, Row, Col, Input, Select } from "antd";
import { isArray, isNumber } from "lodash-es";
import { useSuspenseQuery } from "@tanstack/react-query";
import $axios from "@/utils/$axios";

export default function useQueryForm(queries?: Record<string, any>): [ReactNode, FormInstance<any>] {
  const [form] = Form.useForm();
  const {data: branches} = useSuspenseQuery({
    queryKey: [`/api/branches`, ],
    async queryFn({queryKey}) {
      const res: {total: number, data: any[]} | any[] = await $axios.get(queryKey[0] as string, {params: queryKey[1] || {}});
      if (isArray(res)) {
        return res;
      }
      else if (isNumber(res.total) && isArray(res.data)) {
        return res.data;
      }
    }
  });

  const component = (
    <Form form={form}>
      <Row gutter={16}>
        <Col span={6}>
          <Form.Item label={"名称"} name={"name"}>
            <Input allowClear/>
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label={"分支"} name={"branchId"}>
            <Select allowClear  showSearch filterOption={(input, option) => !!(option && option.children && option.children.indexOf(input as any) !== -1)}>{branches && branches.map((branch) => (<Select.Option key={branch.id} value={branch.id}>{branch.name}</Select.Option>))}</Select>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
  useEffect(() => {
    form.setFieldsValue(queries);
  }, []);

  return [component, form];
}
