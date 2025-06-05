from turtle import update
from flask import Flask, Response, request, jsonify
from flask_cors import CORS
from numpy import full
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
def toolSelection(messages, model_name):
    prompt = "请根据对话记录判断用户当前是简单聊天还是需要执行SQL查询，返回结果为json格式,如果是简单聊天返回{'type':'chat'}，如果需要执行SQL查询返回{'type':'sql'}"
    query = messages+ [{'role': 'system', 'content': prompt}]
    response = modelService(model_name, query)
    if response['type'] == 'text':
        content = response['content']
        if 'sql' in content.lower():
            return {'type': 'sql'}
        else:
            return {'type': 'chat'}
    else:
        raise Exception("模型返回格式错误")

# pipeline的seq是从1开始的
def initPipeline( model_name,messages,response_id,conn):
    pipelines = [(response_id, "", "running","初始化"),(response_id, "", "not-started","选择工具")]

    for i, pipeline in enumerate(pipelines):
        pipelines[i] = (pipeline[0], pipeline[1], pipeline[2], pipeline[3], i + 1)  # 添加序号
    try:
        batch_insert_pipeline(conn, pipelines)
    except Exception as e:
        print(f"Error initializing pipeline: {e}")
        raise Exception("初始化管道失败")
# pipeline的seq是从1开始的
def initToolPipeline(type, model_name,messages,response_id,conn):
    lastPipelineSeq = queryDB("SELECT MAX(seq) as maxseq FROM aichat_pipeline WHERE response_id = %s", (response_id,))
    if lastPipelineSeq and lastPipelineSeq[0]['maxseq']:
        lastPipelineSeq = lastPipelineSeq[0]['maxseq']
    else:
        lastPipelineSeq = 0

    if type == 'sql':
        pipelines += [(response_id, "", "not-started","生成SQL查询"),(response_id, "", "not-started","执行SQL查询")]
    pipelines += [(response_id, "", "not-started","生成回复")]
    for i, pipeline in enumerate(pipelines):
        pipelines[i] = (pipeline[0], pipeline[1], pipeline[2], pipeline[3], i + 1+lastPipelineSeq)  # 添加序号
    try:
        batch_insert_pipeline(conn, pipelines)
    except Exception as e:
        print(f"Error initializing pipeline: {e}")
        raise Exception("初始化管道失败")

def sqlToolExecutor(messages, model_name, response_id, conn):
    updatePipeline(conn, response_id, "生成SQL查询", "running")
    updatePipeline(conn, response_id, "生成SQL查询", "completed")
    updatePipeline(conn, response_id, "执行SQL查询", "running")
    updatePipeline(conn, response_id, "执行SQL查询", "completed")
def insertPipeline(conn,response_id, name,status,content=""):
    try:
        with conn.cursor() as cursor:
            cursor.execute("INSERT INTO aichat_pipeline (response_id, content, status, name) VALUES (%s, %s, %s, %s)",
                           (response_id, content, status, name))
        conn.commit()
    except Exception as e:
        print(f"Error inserting pipeline: {e}")
        raise Exception("插入管道失败")
def updatePipeline(conn,response_id,name, status,content=None):
    try:
        with conn.cursor() as cursor:
            if content:
                cursor.execute("UPDATE aichat_pipeline SET status = %s, content = %s WHERE response_id = %s and name = %s",
                               (status, content, response_id, name))
            else:
                cursor.execute("UPDATE aichat_pipeline SET status = %s WHERE response_id = %s and name = %s", (status, response_id, name))
        conn.commit()
    except Exception as e:
        print(f"Error updating pipeline: {e}")
        raise Exception("更新管道状态失败")
def batch_insert_pipeline(conn, items):
    """
    批量插入 aichat_pipeline 记录

    :param conn: pymysql 连接对象
    :param items: 列表，每项是 (response_id, content, status, name)
    """
    if not items:
        print("没有数据需要插入")
        return

    sql = "INSERT INTO aichat_pipeline (response_id, content, status, name, seq) VALUES (%s, %s, %s, %s, %s)"

    try:
        with conn.cursor() as cursor:
            cursor.executemany(sql, items)
        conn.commit()
    except Exception as e:
        conn.rollback()
        print(f"Error batch inserting pipeline: {e}")
        raise Exception("批量插入管道失败")
def delPipelineByResponseIdAndName(response_id,conn,name=None):
    """
    删除指定 response_id 和 name 的管道记录
    """
    try:
        with conn.cursor() as cursor:
            if name:
                cursor.execute("DELETE FROM aichat_pipeline WHERE response_id = %s AND name = %s", (response_id, name))
            else:
                cursor.execute("DELETE FROM aichat_pipeline WHERE response_id = %s", (response_id,))
        conn.commit()
    except Exception as e:
        print(f"Error deleting pipeline: {e}")
        raise Exception("删除管道失败")


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
        queries = queryDB("SELECT * FROM aichat_query WHERE chat_id = %s ORDER BY create_time ASC", (chat_id,))
        responses = queryDB("SELECT * FROM aichat_response WHERE chat_id = %s ORDER BY update_time ASC", (chat_id,))
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
                        'messageId': response['id'],  # 自动生成唯一消息ID
                        'modelName': response.get('modelName', '未知模型')  # 模型名称
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
from openai import OpenAI
def modelService(model_name,messages,stream=False):
    if model_name == 'deepseek':
        client = OpenAI(api_key="sk-d881829fbed84aba8b921388938a2e61", base_url="https://api.deepseek.com")
        response = client.chat.completions.create(
                model="deepseek-chat",
                messages=messages,
                stream=stream
            )
        if not stream:
            return {"content":response.choices[0].message.content,"type":"text"}
        else:
            return {"content":response,"type":"streamtext"}
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
def getChatTitle(messages,model_name=None):
    if not model_name:
        return messages[0]['content']
    if model_name == 'deepseek':
        task_massages = messages+ [{'role': 'system', 'content': '请根据用户输入的内容概括总结生成标题,不超过10个字'}]
        response = modelService(model_name, task_massages)
        return response['content']

@app.route('/completions', methods=['POST'])
def chatController():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No JSON data received'}), 400
    token = request.headers.get('Authorization', None)
    messages = data.get('messages', None)
    chat_id = data.get('chatId', None)
    stream = data.get('stream', False)
    if not messages or not isinstance(messages, list):
        return jsonify({'error': '空对话'}), 400
    if not token:
        return jsonify({'error': '缺少token参数'}), 400
    user_info = getUserInfo(token)
    if not user_info:
        return jsonify({'error': '无效的token'}), 401

    conn = None
    try:
        message = messages[-1]
        conn = get_db_connection()
        cursor = conn.cursor()
        if not chat_id:
            model_name = data['modelName']
            title = message['content'][:10] if 'content' in message else '无标题'
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

        cursor.execute("INSERT INTO aichat_query (chat_id , query, type) VALUES (%s,  %s, %s)",
                        (chat_id, message['content'], message.get('type', 'text')))
        query_id = cursor.lastrowid
        response_id = cursor.execute("INSERT INTO aichat_response (chat_id, query_id, content, type , model_name) VALUES (%s, %s, %s, %s, %s)",
                            (chat_id, query_id, "", response.get('type', 'text'), model_name))
        response_id = cursor.lastrowid
        initPipeline(model_name, messages, response_id, conn)
        if title:
            title = getChatTitle(messages, model_name)
            cursor.execute("UPDATE aichat SET title = %s WHERE chat_id = %s", (title, chat_id))
        updatePipeline(conn, response_id, "初始化", "completed")
        updatePipeline(conn, response_id, "选择工具", "running")
        tool = toolSelection(messages, model_name)
        initToolPipeline(tool['type'], model_name, messages, response_id, conn)
        if tool['type'] == 'sql':
            sqlToolExecutor(messages, model_name, response_id, conn)
        response = modelService(model_name, messages,stream=stream)
        full_content = ""
        if stream:
            def generate():
                print(response)
                nonlocal full_content
                nonlocal cursor
                try:
                    for chunk in response['content']:
                        print(chunk)
                        content=chunk.choices[0].delta.content
                        if content:
                            full_content += content
                            yield content
                except Exception as e:
                    print(f"Error during streaming: {e}")
                    conn.rollback()
                finally:
                    cursor.execute("update aichat_response set content = %s where id = %s",
                            (full_content, response_id))
                    conn.commit()
                    conn.close()
            return Response(generate(), mimetype='text/event-stream')
        else:
            full_content = response['content']
        if response['type'] == 'text':
            cursor.execute("update aichat_response set content = %s where id = %s",
                            (full_content, response_id))

            # pipelines = response['pipelines']
            # for pipeline in pipelines:
            #     print(f"Pipeline: {pipeline}")
            #     cursor.execute("INSERT INTO aichat_pipeline (response_id, content, status, name) VALUES (%s, %s, %s, %s)",
            #                    (response_id, pipeline['sql'], pipeline['status'], pipeline['name']))
            conn.commit()
        return jsonify({'message': response['content'], "sql": None, "chatId": chat_id})
    except Exception as e:
        print(f"Error: {e}")
        if conn:
            conn.rollback()
        return jsonify({'error': '服务异常，请联系管理员', 'detail': str(e)}), 500
    finally:
        if conn and not stream:
            conn.close()

@app.route('/getModelList', methods=['POST'])
def getModelListController():
    try:
        return jsonify(queryDB( "SELECT * FROM aichat_model ORDER BY model_name"))
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
@app.route('/getPipelineList', methods=['POST'])
def getPipelineListController():
    data = request.get_json()
    if not data or 'queryId' not in data:
        return jsonify({'error': '缺少queryId参数'}), 400
    query_id = data['queryId']
    try:
        pipelines = queryDB("SELECT * FROM aichat_pipeline WHERE query_id = %s ORDER BY seq", (int(query_id),))
        if not pipelines:
            pipelines = []
        return jsonify(pipelines)
    except Exception as e:
        return jsonify({'error': '未知错误,请联系管理员'}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=15000, debug=True)