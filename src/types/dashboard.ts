export type ActivityEvent = {
  id: string;
  time: string;
  title: string;
  status: "ok" | "warning" | "error";
};
