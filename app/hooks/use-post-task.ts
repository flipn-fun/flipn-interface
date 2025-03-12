import { useCallback, useEffect, useState } from "react";
import { httpAuthGet, httpAuthPost } from "../utils";
import { useAuth } from "../context/auth";
export default function usePostTask(taskId?: number) {
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDone, setIsDone] = useState<any>(false);
  const { accountRefresher } = useAuth();

  const onPost = useCallback(async () => {
    if (!taskId) return;
    try {
      setPosting(true);
      await httpAuthPost(`/task?task_id=${taskId}`);
      onQuery();
    } catch (err) {
    } finally {
      setPosting(false);
    }
  }, [taskId]);
  const onQuery = useCallback(async () => {
    if (!taskId) return;
    try {
      setLoading(true);
      const res = await httpAuthGet(`/task_history?task_id=${taskId}`);
      setIsDone(!!res.data.length);
    } catch (err) {
      setIsDone(false);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    onQuery();
  }, [taskId, accountRefresher]);

  return { onPost, loading, posting, isDone };
}
