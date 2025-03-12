import { httpAuthPost } from "../utils";
export default function usePostTask() {
  const onPost = async (taskId: number) => {
    if (!taskId) return;
    await httpAuthPost(`/task?task_id=${taskId}`);
  };
  return { onPost };
}
