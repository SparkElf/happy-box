import axios from "axios";

const request = axios.create({
  baseURL: import.meta.env.VITE_AI_CHAT_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: getToken(),
  },
});
function getToken() {
  return "abcdefghijklmnopqrstuvwxyz"; // Replace with actual token retrieval logic
}
export async function chatApi({ messages, chatId, modelName, stream }: { messages: any[], chatId: number | null, modelName: string, stream: boolean }) {
  return request.post("/completions", { messages, chatId, modelName, stream });
}
export async function chatStreamApi({ messages, chatId, modelName, responseId, onChunk, onComplete }: { messages: any[], chatId: number | null, modelName: string, responseId: string, onChunk: (chunk: string, fullText: string) => void, onComplete?: (fullText: string) => void }) {
  await fetchStream(import.meta.env.VITE_AI_CHAT_BASE_URL + "/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: getToken(),
    },
    body: JSON.stringify({ messages, chatId, modelName, responseId, stream: true }),
  }, onChunk || (() => { }), onComplete || (() => { }));
}

export async function getChatHistoryListApi({ userId }) {
  return request.post("/getAiChatHistoryList", { user_id: userId });
}


export async function delChatApi({ chatId }) {
  return request.post("/deleteChat", { chatId: chatId });
}

export async function getModelListApi() {
  return request.post("/getModelList");
}

export async function getModelByIdApi({ modelId }) {
  return request.post("/getModelById", { model_id: modelId });
}

export async function getAiChatBaseInfoApi({ chatId }) {
  return request.post("/getAiChatBaseInfo", { chatId: chatId });
}
export async function getPipelinesApi({ queryId }) {
  return request.post("/getPipelineList", { queryId: queryId });
}
import { message } from 'ant-design-vue';

export async function fetchStream(url, options, onChunk, onComplete) {
  try {
    const response = await fetch(url, options);
    if (!response.ok || !response.body) {
      const data = await response.json();
      throw new Error(data.detail);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      fullText += chunk;
      onChunk(chunk, fullText); // 实时更新 UI
    }

    if (onComplete) onComplete(fullText);
  } catch ( e ) {

    console.log(e)
    message.error(e.message);
  }



}
