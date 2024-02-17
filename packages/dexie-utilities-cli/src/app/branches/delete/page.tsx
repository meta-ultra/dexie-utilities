import { useContext, useEffect } from 'react'
import { useLocation } from 'react-router-dom';
import { Button } from "antd";
import { useQueryClient, useMutation } from '@tanstack/react-query';
import useEvent from 'react-use-event-hook';
import { AiFillQuestionCircle } from "react-icons/ai"
import $axios from '@/utils/$axios';
import { RouteModalContext } from '../RouteModal'
import { usePopup } from '@/utils/PopupContext';

export default function Page() {
  const location = useLocation();
  const context = useContext(RouteModalContext);
  const { message } = usePopup();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn() {
      return $axios.delete(`/branches`, {params: {ids: location.state.ids}});
    }
  });

  const onConfirm = useEvent(async () => {
    try {
      await mutation.mutateAsync();
      queryClient.invalidateQueries({ queryKey: ["/branches"] });
      context.onCancel && context.onCancel();
      message.success("操作成功");
    }
    catch(e) {
      message.error("操作失败: " + (e as Error).message);
    }
  });
  useEffect(() => {
    if (context) {
      context.setModal({
        footer: [
          <Button onClick={context.onCancel}>取 消</Button>,
          <Button loading={mutation.isPending} type='primary' onClick={onConfirm}>确 定</Button>,
        ]
      });
    }
  }, [mutation.isPending]);

  return (
    <div><AiFillQuestionCircle size={24} className='relative inline-block -top-[2px] mr-3 text-yellow-500'/>确定删除？</div>
  )
}
