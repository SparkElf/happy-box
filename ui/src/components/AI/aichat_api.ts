import axios from "axios";

const request = axios.create({
  baseURL: import.meta.env.VITE_AI_CHAT_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: getToken(),
  },
});
function getToken() {
  return ""
}
export async function sendMessageApi({ message, type }) {
  return request.post("/completions", { message, type });
}

export async function getChatHistoryListApi({ userId }) {
  return request.post("/getAiChatHistoryList", { user_id: userId });
}

export async function getModelListApi() {
  return request.post("/getModelList");
}

export async function getModelByIdApi({ modelId }) {
  return request.post("/getModelById", { model_id: modelId });
}