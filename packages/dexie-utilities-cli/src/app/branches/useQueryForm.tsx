import { type ReactNode, useEffect } from 'react';
import { type FormInstance, Form, Row, Col, Input, Select } from "antd";
import { isArray, isNumber } "lodash-es";
import { useSuspenseQuery } from "@tanstack/react-query";
import $axios from "@/utils/$axios";

export default function useQueryForm(queries?: Record<string, any>): [ReactNode, FormInstance<any>] {
  const [form] = Form.useForm();

  const component = (
    <Form form={form}>
      <Row gutter={16}>
        <Col span={6}>
          <Form.Item label={"名称"} name={"name"}>
            <Input />
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
