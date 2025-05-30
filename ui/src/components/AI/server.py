from flask import Flask, request, jsonify
from flask_cors import CORS
import pymysql
import uuid  # 新增
### message格式:
# {
#     "role": "user",  # 或 "assistant"
#     "content": "用户输入的内容"
#     "type": "text"  # 或 "image", "video" 等
#     "messageId": "唯一消息ID"  # 可选，若不提供则自动生成
# }

app = Flask(__name__)
CORS(app)
# 数据库配置
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'hrdhreth1',
    'database': 'happybox',
    'charset': 'utf8mb4',
    'cursorclass': pymysql.cursors.DictCursor
}
def getUserInfo(token):
    return {
        'user_id': 1,
        'username': 'admin',
        'email': 'admin@example.com'
    }

def get_db_connection():
    return pymysql.connect(**DB_CONFIG)

def underscore_to_camel(word):
    parts = word.split('_')
    return parts[0] + ''.join(x.title() for x in parts[1:])

def dict_keys_to_camel(d):
    if isinstance(d, dict):
        return {underscore_to_camel(k): dict_keys_to_camel(v) for k, v in d.items()}
    elif isinstance(d, list):
        return [dict_keys_to_camel(i) for i in d]
    else:
        return d

def queryDB(sql, params=None):
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute(sql, params)
            result = cursor.fetchall()
        conn.close()
        # 新增：自动转驼峰
        return dict_keys_to_camel(result)
    except Exception as e:
        print(f"Database query error: {e}")
        return None

def executeDB(sql, params=None, fetch=False):
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute(sql, params)
            if fetch:
                result = cursor.fetchall()
            else:
                result = cursor.lastrowid or cursor.rowcount  # 根据 DB 类型调整
            conn.commit()
            return result
    except Exception as e:
        print(f"Database execute error: {e}")
        raise Exception("数据库操作失败")
@app.route('/getAiChatBaseInfo', methods=['POST'])
def getAiChatBaseInfoController():
    data = request.get_json()
    if not data:
        return jsonify({'error': '未收到请求参数'}), 400
    try:
        chat_id = int(data['chatId'])
        if not chat_id:
            return jsonify({'error': '缺少chatId参数'}), 400
        base_info = queryDB("SELECT * FROM aichat WHERE chat_id = %s limit 1 ", (chat_id,))[0]
        messagges = []
        queries = queryDB("SELECT * FROM aichat_query WHERE chat_id = %s ORDER BY create_time DESC", (chat_id,))
        responses = queryDB("SELECT * FROM aichat_response WHERE chat_id = %s", (chat_id,))
        responses_dict = {}
        for response in responses:
            if response['queryId'] not in responses_dict:
                responses_dict[response['queryId']] = []
            responses_dict[response['queryId']].append(response)
        for query in queries:
            message = {
                'role': 'user',
                'content': query['query'],
                'type': query.get('type', 'text'),
                'messageId': query['id']
            }
            messagges.append(message)
            if query['id'] in responses_dict:
                for response in responses_dict[query['id']]:
                    message = {
                        'role': 'assistant',
                        'content': response['content'],
                        'type': response.get('type', 'text'),
                        'messageId': response['id']  # 自动生成唯一消息ID
                    }
                    messagges.append(message)

        base_info['messages'] = messagges
        if not messagges:
            return jsonify({'error': '未找到对应的聊天记录'}), 404
        return jsonify(base_info)
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': '未知错误,请联系管理员'}), 500
@app.route('/getAiChatHistoryList', methods=['post'])
def getAiChatHistoryListController():
    data = request.get_json()
    if not data:
        return jsonify({'error': '未收到请求参数'}), 400
    try:
        queries = queryDB("SELECT * FROM aichat where user_id = %s ORDER BY update_time DESC ", (int(data['user_id']),))
        return jsonify(queries)
    except Exception as e:
        return jsonify({'error': '未知错误,请联系管理员'}), 500

import requests
def modelService(model_name,messages):
    return {'message':{'role':'assistant','content':'模型消息mock','type':'text'},'pipelines':[{'sql': 'SELECT * FROM users', 'status': 'not-started', 'name': '查询用户信息'}]}
    if model_name == 'chat.qwen.aiqwen-Qwen3-235B-A22B':
        model_info=queryDB("SELECT * FROM aichat_model WHERE model_name = 'chat.qwen.aiqwen-Qwen3-235B-A22B' limit 1")
        if not model_info:
            raise Exception("模型不存在")
        model_info = model_info[0]
        auth_url = model_info['auth_url']
        res= requests.post(auth_url,json={"username": model_info['auth_username'], "password": model_info['auth_password']}).json()
        print(res.cookies)
        return "远程Qwen模型服务"
    raise Exception("未知模型")
def getChatTitle(messages):
    return messages[0]['content']

@app.route('/completions', methods=['POST'])
def chatController():
    data = request.get_json()
    print(data)
    if not data:
        return jsonify({'error': 'No JSON data received'}), 400
    token = request.headers.get('Authorization', None)
    messages = data.get('messages', None)
    chat_id = data.get('chatId', None)
    if not messages or not isinstance(messages, list):
        return jsonify({'error': '空对话'}), 400
    if not token:
        return jsonify({'error': '缺少token参数'}), 400
    user_info = getUserInfo(token)
    if not user_info:
        return jsonify({'error': '无效的token'}), 401

    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            if not chat_id:
                model_name = data['modelName']
                title = getChatTitle(messages)
                if not model_name:
                    return jsonify({'error': '缺少模型名称'}), 400
                cursor.execute("INSERT INTO aichat (user_id, model_name, title) VALUES (%s, %s, %s)", (user_info['user_id'], model_name, title))
                chat_id = cursor.lastrowid
            else:
                cursor.execute("SELECT model_name FROM aichat WHERE chat_id = %s limit 1", (chat_id,))
                row = cursor.fetchone()
                if not row:
                    return jsonify({'error': 'chat_id不合法'}), 400
                model_name = row['model_name']
            message = messages[-1]
            cursor.execute("INSERT INTO aichat_query (chat_id , query, type) VALUES (%s,  %s, %s)",
                           (chat_id, message['content'], message.get('type', 'text')))
            query_id = cursor.lastrowid
            response = modelService(model_name, messages)
            response_id =cursor.execute("INSERT INTO aichat_response (chat_id, query_id, content, type , model_name) VALUES (%s, %s, %s, %s, %s)",
                           (chat_id, query_id, response['message']['content'], response['message'].get('type', 'text'), model_name))
            pipelines = response['pipelines']
            for pipeline in pipelines:
                print(f"Pipeline: {pipeline}")
                cursor.execute("INSERT INTO aichat_pipeline (response_id, content, status, name) VALUES (%s, %s, %s, %s)",
                               (response_id, pipeline['sql'], pipeline['status'], pipeline['name']))
            conn.commit()
        return jsonify({'message': response['message'], "sql": pipelines, "chatId": chat_id})
    except Exception as e:
        print(f"Error: {e}")
        if conn:
            conn.rollback()
        return jsonify({'error': '服务异常，请联系管理员', 'detail': str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/getModelList', methods=['POST'])
def getModelListController():
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            sql = "SELECT * FROM aichat_model ORDER BY model_id ASC"
            cursor.execute(sql)
            result = cursor.fetchall()
        conn.close()
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': '未知错误,请联系管理员'}), 500

@app.route('/getModelById', methods=['POST'])
def getModelByIdController():
    data = request.get_json()
    if not data or 'model_id' not in data:
        return jsonify({'error': '缺少model_id参数'}), 400
    model_id = data['model_id']
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            sql = "SELECT * FROM aichat_model WHERE model_id = %s"
            cursor.execute(sql, (int(model_id),))
            result = cursor.fetchone()
        conn.close()
        if not result:
            return jsonify({'error': '未找到对应模型'}), 404
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': '未知错误,请联系管理员'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=15000)
