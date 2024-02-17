import { ReactNode, useState,} from "react";
import { Row, Col, Table, Button } from "antd";
import { useQuery } from "@tanstack/react-query";
import useEvent from "react-use-event-hook";
import { useNavigate } from "react-router-dom";
import { IoSearch } from "react-icons/io5";
import { IoMdAddCircleOutline } from "react-icons/io";
import { TbDatabaseExport, TbDatabaseImport } from "react-icons/tb";
import { useCache } from "@meta-ultra/cache";
import RouteModal from "./RouteModal";
import $axios from "@/utils/$axios";
import useTableColumns from "./useTableColumns";
import useQueryForm from "./useQueryForm";

type Queries = {[name: string]: any, page?: number, pageSize?: number, sorter?: {field: string, order: string}};

export default function Layout({children}: {children: ReactNode}) {
  const navigate = useNavigate();
  const cache = useCache();

  const columns = useTableColumns();
  const [queries, setQueries] = useState<Queries>({page: 1, pageSize: 10, ...(cache.get("groups") || {})});
  const { isLoading, data: dataSource = {data: [], total: 0} } = useQuery<{data: any[], total: number}>({
    queryKey: ["/groups", queries],
    queryFn: ({queryKey}) => $axios.get(queryKey[0] as string, {params: queryKey[1]})
  });
  const onTableChange = useEvent((pagination, filters, sorter, extra) => {
    setQueries((queries) => {
      const newQueries = {
        ...queries,
        page: pagination.current,
        pageSize: pagination.pageSize,
      };
      if (sorter.order) {
        newQueries.sorter = {
          field: sorter.field,
          order: sorter.order,
        };
      }
      else {
        delete newQueries.sorter;
      }
      return newQueries;
    });
  });

  const [queryForm, queryFormRef] = useQueryForm(queries);
  const onSearch = useEvent(() => {
    setQueries((queries) => {
      return {
        ...queries,
        ...queryFormRef.getFieldsValue(),
        page: 1,
      }
    })
  });

  useEffect(() => {
    cache.set("groups", queries);
  }, [queries]);

  const scroll = useMemo(() => ({x: 1000, y: 500}), []);
  const pagiation = useMemo(() => ({total: dataSource.total || dataSource.data.length}), [dataSource]);

  return (
    <section>
      <section className="rounded mt-1 mb-2 p-5 shadow-[1px_1px_5px_0px_#cdcdcd]">
        {queryForm}
        <Row justify={"end"} gutter={16}>
          <Col><Button type="primary" onClick={onSearch}><IoSearch size={20} className="inline-block relative -top-[2px] mr-2"/>查 询</Button></Col>
          <Col><Button onClick={() => navigate(`add`)}><IoMdAddCircleOutline size={20} className="inline-block relative -top-[2px] mr-2"/>新 增</Button></Col>
          <Col><Button onClick={() => navigate(`export`)}><TbDatabaseExport size={20} className="inline-block relative -top-[2px] mr-2"/>导 出</Button></Col>
          <Col><Button onClick={() => navigate(`import`)}><TbDatabaseImport size={20} className="inline-block relative -top-[2px] mr-2"/>导 入</Button></Col>
        </Row>
      </section>
      <section className="rounded mt-1 mb-2 p-5 shadow-[1px_1px_5px_0px_#cdcdcd]">
        <Table
          rowKey={"id"}
          columns={columns}
          scroll={scroll}
          loading={isLoading}
          dataSource={dataSource.data}
          pagination={pagiation}
          onChange={onTableChange}
        />
      </section>
      <RouteModal routes={[
        /\/(delete|add|import|export)$/,
        /\/[^/]+\/(edit)$/,
      ]}>
        {children}
      </RouteModal>
    </section>
  )
}
