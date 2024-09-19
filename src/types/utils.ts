import dayjs from "dayjs";

const formatDate = (val: any) => {
  return val ? dayjs(val).format("DD/MM/YYYY HH:mm:ss") : null;
};

export { formatDate };
