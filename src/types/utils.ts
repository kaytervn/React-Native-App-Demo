import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

const dateToString = (val: any) => {
  return val ? dayjs(val).format("DD/MM/YYYY") : null;
};

const stringToDate = (val: any) => {
  return val ? dayjs(val, "DD/MM/YYYY").toDate() : null;
};

const getDate = (inputString: any) => {
  return inputString.slice(0, 10);
};

const uploadImage = async (
  image: string | null,
  post: (url: string, data: any) => Promise<any>
) => {
  if (image) {
    const formData = new FormData();
    formData.append("file", {
      uri: image,
      type: "image/jpeg",
      name: "profile_picture.jpg",
    } as any);
    const uploadResponse = await post("/v1/file/upload", formData);
    if (uploadResponse.result) {
      return uploadResponse.data.filePath;
    }
  }
  return null;
};

export { dateToString, stringToDate, uploadImage, getDate };
