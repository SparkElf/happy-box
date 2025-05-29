from flask import Flask, request, jsonify
from flask_cors import CORS
import pymysql
import uuid  # 新增
### message格式:
# {
#     "role": "user",  # 或 "assistant"
#     "content": "用户输入的内容"
#     "type": "text"  # 或 "image", "video" 等
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
def queryDB(sql, params=None):
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute(sql, params)
            result = cursor.fetchall()
        conn.close()
        return result
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
        return False
@app.route('/getAiChatHistoryList', methods=['post'])
def getAiChatHistoryListController():
    data = request.get_json()
    if not data:
        return jsonify({'error': '未收到请求参数'}), 400
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            sql = f"SELECT * FROM aichat where user_id = %s ORDER BY update_time DESC "
            cursor.execute(sql, (int(data['user_id']),))
            result = cursor.fetchall()
        conn.close()
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': '未知错误,请联系管理员'}), 500

import requests
def modelService(model_name,messages,type):
    return {'message':"模型消息mock",'pipelines':[{'sql': 'SELECT * FROM users', 'status': 'not-started', 'name': '查询用户信息'}]}
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
    if not data:
        return jsonify({'error': 'No JSON data received'}), 400
    # 处理接收到的数据
    # 例如，假设我们只回显收到的数据
    messages = data['messages']
    type = data['type']
    chat_id = data['chatId']
    token = data['token']
    if not token:
        return jsonify({'error': '缺少token参数'}), 400
    user_info = getUserInfo(token)
    if not user_info:
        return jsonify({'error': '无效的token'}), 401
    if not chat_id:
        model_name = data['model_name']
        title = getChatTitle(messages)
        if not model_name:
            return jsonify({'error': '缺少模型名称'}), 400
        chat_id=executeDB("INSERT INTO aichat (user_id, model_name, title) VALUES (%s, %s, %s)", (user_info['user_id'], model_name, title))
    else:
        model_name = queryDB("SELECT model_name FROM aichat WHERE chat_id = %s limit 1", (chat_id,))[0]['model_name']
    if not model_name:
        return jsonify({'error': 'chat_id不合法'}), 400
    message_id=executeDB("INSERT INTO aichat_message (chat_id, user_id, query_content, type) VALUES (%s, %s, %s, %s)",)
    response = modelService(model_name, messages, type)
    executeDB("UPDATE aichat_message SET response_content = %s WHERE message_id = %s", (response, message_id))
    pipelines = response['pipelines']
    for pipeline in pipelines:
        executeDB("INSERT INTO aichat_pipeline (message_id, sql, status, name) VALUES (%s, %s, %s, %s)",
                   (message_id, pipeline['sql'], pipeline['status'], pipeline['name']))
    return jsonify({'message': response['message'], "sql": pipelines, "chatId": chat_id})

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
