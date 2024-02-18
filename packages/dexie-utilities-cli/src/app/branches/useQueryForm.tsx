import { type ReactNode, useEffect } from 'react';
import { type FormInstance, Form, Row, Col, Input } from "antd";

export default function useQueryForm(queries?: Record<string, any>): [ReactNode, FormInstance<any>] {
  const [form] = Form.useForm();

  const component = (
    <Form form={form}>
      <Row gutter={16}>
        <Col span={6}>
          <Form.Item label={"名称"} name={"name"}>
            <Input allowClear/>
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
