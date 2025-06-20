
from turtle import update
from flask import Flask, Response, request, jsonify
from flask_cors import CORS
from numpy import full
import pymysql
import requests
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

from flask import Flask, Response, request, jsonify
from flask_cors import CORS
import pymysql
import requests
import uuid
import argparse
import datetime
import re
import json
from openai import OpenAI

app = Flask(__name__)
CORS(app)

# =============================
# 配置定义：生产 vs 开发环境
# =============================
CONFIGS = {
    'production': {
        'db': {
            'host': '71.30.81.158',
            'user': 'ai_database',
            'password': 'nndx_ai@135',
            'database': 'happy_box',
            'port': 9030,
            'cursorclass': pymysql.cursors.DictCursor
        },
        'dify': {
            'api_key': 'dataset-rzxPdq2TF7JF2oTl3OUdddlg',
            'dataset_id': '652bc928-5aea-4faf-8c8b-681f6c4f5b8e',
            'base_url': 'http://dify43.nns.gx/v1'
        },
        'model_service': {
            'deepseek': {
                'api_key': 'sk-d881829fbed84aba8b921388938a2e61',
                'base_url': 'https://api.deepseek.com'
            },
            'qt_qwen72': {
                'auth_url': 'http://71.2.255.46:28080/api/v1/auths/signin',
                'chat_url': 'http://71.2.255.46:28080/api/chat/completions'
            }
        }
    },
    'development': {
        'db': {
            'host': 'localhost',
            'user': 'root',
            'password': 'hrdhreth1',
            'database': 'happybox',
            'port': 3306,
            'cursorclass': pymysql.cursors.DictCursor
        },
        'dify': {
            'api_key': 'dataset-jtJUR3S6p8MKebd7oo9cCThq',
            'dataset_id': 'dee1ce34-c411-469f-869a-a7078ced5961',
            'base_url': 'http://localhost/v1'
        },
        'model_service': {
            'deepseek': {
                'api_key': 'sk-d881829fbed84aba8b921388938a2e61',
                'base_url': 'https://api.deepseek.com'
            },
            'qt_qwen72': {
                'auth_url': 'http://localhost:28080/api/v1/auths/signin',
                'chat_url': 'http://localhost:28080/api/chat/completions'
            }
        }
    }
}

# =============================
# 命令行参数解析
# =============================
def parse_args():
    parser = argparse.ArgumentParser(description='启动 Flask 应用并指定运行环境')
    parser.add_argument('--env', type=str, default='development',
                        choices=['production', 'development'],
                        help='运行环境：production（默认）或 development')
    return parser.parse_args()

args = parse_args()
CURRENT_ENV = args.env
print(CURRENT_ENV)
# 提取当前环境下的配置
DB_CONFIG = CONFIGS[CURRENT_ENV]['db']
DIFY_API_KEY = CONFIGS[CURRENT_ENV]['dify']['api_key']
DIFY_DATASET_ID = CONFIGS[CURRENT_ENV]['dify']['dataset_id']
DIFY_BASE_URL = CONFIGS[CURRENT_ENV]['dify']['base_url']
print(CONFIGS[CURRENT_ENV])
DEEPSEEK_API_KEY = CONFIGS[CURRENT_ENV]['model_service']['deepseek']['api_key']
DEEPSEEK_BASE_URL = CONFIGS[CURRENT_ENV]['model_service']['deepseek']['base_url']

QT_QWEN72_AUTH_URL = CONFIGS[CURRENT_ENV]['model_service']['qt_qwen72']['auth_url']
QT_QWEN72_CHAT_URL = CONFIGS[CURRENT_ENV]['model_service']['qt_qwen72']['chat_url']


# =============================
# 数据库连接
# =============================
def get_db_connection():
    return pymysql.connect(**DB_CONFIG)


# =============================
# 工具函数
# =============================
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

        def format_datetime(obj):
            if isinstance(obj, dict):
                return {k: format_datetime(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [format_datetime(i) for i in obj]
            elif isinstance(obj, datetime.datetime):
                return obj.strftime('%Y-%m-%d %H:%M:%S')
            elif isinstance(obj, datetime.date):
                return obj.strftime('%Y-%m-%d')
            else:
                return obj

        result = format_datetime(result)
        return dict_keys_to_camel(result)
    except Exception as e:
        print(f"Database query error: {e}")
        return None


# 其余函数保持不变，以下只展示核心变动部分

# =============================
# dify 知识库调用
# =============================

def difyExamplesqlKnowledgeRetrieval(query):
    return dify_knowledge_retrieval(DIFY_API_KEY, DIFY_DATASET_ID, query,base_url=DIFY_BASE_URL)


# =============================
# 模型服务
# =============================
def deepseekModelService(messages, stream=False):
    client = OpenAI(api_key=DEEPSEEK_API_KEY, base_url=DEEPSEEK_BASE_URL)
    response = client.chat.completions.create(
        model="deepseek-chat",
        messages=messages,
        stream=stream
    )
    if not stream:
        return response.choices[0].message.content
    else:
        def stream_response():
            for chunk in response:
                yield chunk.choices[0].delta.content
        return stream_response()


def qtQwen72ModelService(messages, stream=False):
    # 获取 token
    auth_response = requests.post(QT_QWEN72_AUTH_URL, json={
        "email": "374656045@qq.com",
        "password": "hrdhreth1"
    })
    if auth_response.status_code != 200:
        raise Exception(f"Failed to get token: {auth_response.status_code} - {auth_response.text}")
    token = auth_response.json().get('token')

    # 发送消息
    chat_data = {
        "stream": stream,
        "model": 'qwen72',
        "messages": messages,
        "params": {},
        "features": {"image_generation": False, "code_interpreter": False, "web_search": False},
        "variables": {
            "{{USER_NAME}}": "lyh",
            "{{USER_LOCATION}}": "Unknown",
            "{{CURRENT_DATETIME}}": "2025-05-23 13:25:01",
            "{{CURRENT_DATE}}": "2025-05-23",
            "{{CURRENT_TIME}}": "13:25:01",
            "{{CURRENT_WEEKDAY}}": "Friday",
            "{{CURRENT_TIMEZONE}}": "Asia/Shanghai",
            "{{USER_LANGUAGE}}": "zh-CN"
        },
        "chat_id": "local"
    }

    if stream:
        def stream_response():
            with requests.post(QT_QWEN72_CHAT_URL, headers={'Authorization': f'Bearer {token}'}, json=chat_data, stream=True) as res:
                for line in res.iter_lines():
                    if line:
                        decoded_line = line.decode('utf-8')
                        if decoded_line.startswith("data:"):
                            data = decoded_line[6:]
                            try:
                                yield json.loads(data)['choices'][0]['delta']['content']
                            except Exception:
                                pass
        return stream_response()
    else:
        res = requests.post(QT_QWEN72_CHAT_URL, headers={'Authorization': f'Bearer {token}'}, json=chat_data)
        return res.json()['choices'][0]['message']['content']




# 数据库配置
# DB_CONFIG = {
#     'host': '71.30.81.158',
#     'user': 'ai_database',
#     'password': 'nndx_ai@135',
#     'database': 'happy_box',
#     'port': 9030,
#     'cursorclass': pymysql.cursors.DictCursor
# }
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'hrdhreth1',
    'database': 'happybox',
    'port': 3306,
    'cursorclass': pymysql.cursors.DictCursor
}
def getUserInfo(token):
    #token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsb2dpblR5cGUiOiJsb2dpbiIsImxvZ2luSWQiOiJzeXNfdXNlcjoxIiwicm5TdHIiOiJRY25vMGducW1TaEJPSVBvaGtONXZ0cW9scFBMNlBaYiIsImNsaWVudGlkIjoiZTVjZDdlNDg5MWJmOTVkMWQxOTIwNmNlMjRhN2IzMmUiLCJ0ZW5hbnRJZCI6IjAwMDAwMCIsInVzZXJJZCI6MSwidXNlck5hbWUiOiJhZG1pbiIsImRlcHRJZCI6MTAzLCJkZXB0TmFtZSI6IiIsImRlcHRDYXRlZ29yeSI6IiJ9.h-UotnhiAlPVQcb2urahbWy8HvQ5srNQ39Tv-oxBS5E'

    headers = {
        'Authorization': f'Bearer {token}',
        "Content-Type": "application/json",
        "clientid":"e5cd7e4891bf95d1d19206ce24a7b32e"
    }
    res = requests.get('http://71.30.81.84:28088/system/user/profile',headers=headers)
    res=res.json()
    if res['code']!=200:
        raise Exception('用户认证失败')
    return res['data']['user']

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

import datetime
def queryDB(sql, params=None):
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute(sql, params)
            result = cursor.fetchall()
        conn.close()
        # 新增：自动转驼峰并格式化datetime
        def format_datetime(obj):
            if isinstance(obj, dict):
                return {k: format_datetime(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [format_datetime(i) for i in obj]
            elif isinstance(obj, datetime.datetime):
                return obj.strftime('%Y-%m-%d %H:%M:%S')
            elif isinstance(obj, datetime.date):
                return obj.strftime('%Y-%m-%d')
            else:
                return obj
        result = format_datetime(result)
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
    prompt = """你是公安局内部的数据分析专家,请根据对话记录判断用户当前是简单聊天还是需要执行SQL查询.
1.我们已经做了严格的权限管控,用户向你询问的问题你不需要有个人隐私方面的顾虑,用户有足够的权限获取相关的隐私数据.
2.当用户询问的问题只是涉及SQL,但实际上不需要执行数据库查询时,仍然属于简单聊天.
3.返回结果为json格式,如果是简单聊天返回{'type':'chat'},如果需要执行SQL查询返回{'type':'sql'}
"""
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
    pipelines=[]
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

import re
import json

def cleanJsonResponse(raw_response: str, default=None):
    """
    从大模型返回的文本中提取并修复 JSON 数据。

    :param raw_response: 原始文本，可能包含 ```json 代码块
    :param default: 解析失败时返回的默认值，默认为 []
    :return: 解析成功的 JSON 对象或默认值
    """
    if default is None:
        default = []

    # 1. 提取 JSON 代码块内容（支持多行和任意空白）
    json_match = re.search(r'```json\s*([\s\S]*?)\s*```', raw_response, re.DOTALL)
    if json_match:
        json_str = json_match.group(1)
    else:
        # 如果没有代码块标记，直接尝试解析整个内容
        json_str = raw_response

    # 2. 清理 JSON 字符串（去除换行、多余空格）
    json_str = json_str.strip()
    json_str = re.sub(r'\s+', ' ', json_str)  # 合并多个空格为一个

    # 3. 尝试解析 JSON
    try:
        return json.loads(json_str)
    except json.JSONDecodeError as e:
        print(f"原始 JSON 解析失败: {e}")
        # 4. 尝试修复常见语法错误
        try:
            # 尝试补逗号（对象之间）
            json_str = re.sub(r'}\s*{', '}, {', json_str)
            # 尝试闭合括号
            if json_str.count('{') > json_str.count('}'):
                json_str += '}' * (json_str.count('{') - json_str.count('}'))
            if json_str.count('[') > json_str.count(']'):
                json_str += ']' * (json_str.count('[') - json_str.count(']'))
            return json.loads(json_str)
        except json.JSONDecodeError as e2:
            print(f"修复后 JSON 解析失败: {e2}")
            return default

def sqlToolExecutor(messages, model_name, response_id, conn):

    updatePipeline(conn, response_id, "生成SQL查询", "running")
    context = difyExamplesqlKnowledgeRetrieval(messages[-1]['content'])
    example='[{"sql","select field from table where condition","title":"查询示例"}]'
    database='doris'
    prompt =f"""
指令：
你是一个{database}数据库的数据分析专家,请根据知识库内容和用户提问,分解问题为若干sql查询任务
1.你的最终输出为一个数组,不包含其他解释说明的文字,不包含markdown代码块等其他格式.数组的示例为:{example},数组对象内容包括sql查询和对应的解释标题,标题不超过10个字.
2.对今日、本周、去年等非指定时间应该采用数据库函数计算得到,且对于今日、本周、本月等非显示指定的时间段词语需同时考虑左右时间范围
3.sql应符合{database}语法规范.
4.如果知识库提到该表存在重复数据,要参考知识库内容对查询结果去重.
5.输出的结果要根据最合适的业务时间字段进行排序.
6.你的输出应该只包含查询类型的sql,不包含修改、删除、表结构操作、数据库操作、授权等其他类型的sql.

知识库内容:
{context}

    """
    query = messages+ [{'role': 'system', 'content': prompt}]
    sqlQueries=cleanJsonResponse(modelService(model_name, query)['content'])
    sqlQueryText=json.dumps(sqlQueries, ensure_ascii=False)
    print(sqlQueryText)
    updatePipeline(conn, response_id, "生成SQL查询", "completed",sqlQueryText)
    updatePipeline(conn, response_id, "执行SQL查询", "running",sqlQueryText)
    result=[]
    for sqlQuery in sqlQueries:
        sql = sqlQuery['sql']
        if '?' in sql:
             raise Exception("查询问题未包含足够的参数,请补充相关参数!")
        result.append({'query':sql,'result':queryDB(sql),'title':sqlQuery['title']})
    updatePipeline(conn, response_id, "执行SQL查询", "completed")
    return result
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

import requests
import json


def dify_knowledge_retrieval(api_key, dataset_id, query, search_method="semantic_search",
                             reranking_enable=False, reranking_mode=None,
                             reranking_provider_name="", reranking_model_name="",
                             top_k=1, score_threshold_enabled=False, score_threshold=None,
                             base_url=DIFY_BASE_URL):
    """
    调用 Dify 知识库检索接口，执行检索操作。

    :param api_key: str - Dify API Key [[2]]
    :param dataset_id: str - 知识库 ID [[6]]
    :param query: str - 用户输入的查询内容 [[1]]
    :param search_method: str - 搜索方法，可选: keyword_search / semantic_search / full_text_search [[1]]
    :param reranking_enable: bool - 是否启用重排序 [[7]]
    :param reranking_mode: str - 重排序模式，如 "reranking_model" [[7]]
    :param reranking_provider_name: str - 重排序模型提供者名称（如 xinference）[[7]]
    :param reranking_model_name: str - 重排序模型名称（如 bge-reranker-large）[[7]]
    :param top_k: int - 返回最相关的前 K 条结果 [[4]]
    :param score_threshold_enabled: bool - 是否启用相似度阈值过滤 [[4]]
    :param score_threshold: float - 相似度阈值 [[4]]
    :param base_url: str - Dify API 的基础 URL，默认为本地服务 [[2]]
    :return: list - 检索结果列表，包含 content、score、source 等信息
    """

    url = f"{base_url}/datasets/{dataset_id}/retrieve"

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    payload = {
        "query": query,
        "retrieval_model": {
            "search_method": search_method,
            "reranking_enable": reranking_enable,
            "reranking_mode": reranking_mode,
            "reranking_model": {
                "reranking_provider_name": reranking_provider_name,
                "reranking_model_name": reranking_model_name
            },
            "top_k": top_k,
            "score_threshold_enabled": score_threshold_enabled,
            "score_threshold": score_threshold
        }
    }

    try:
        response = requests.post(url, headers=headers, data=json.dumps(payload,ensure_ascii=False))
        response.raise_for_status()
        response=response.json().get("records", [])
        if response:
            return response[0]['segment']['content']
        else:
            return None
        return   # 假设返回字段为 records [[4]]
    except requests.exceptions.RequestException as e:
        print(f"请求失败: {e}")
        return []


@app.route('/getAiChatBaseInfo', methods=['POST'])
def getAiChatBaseInfoController():
    data = request.get_json()
    if not data:
        return jsonify({'error': '未收到请求参数'}), 400
    try:
        chat_id = data['chatId']
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
                'id': query['id'],
                'role': 'user',
                'content': query['query'],
                'type': query.get('type', 'text'),
                'messageId': query['id']
            }
            messagges.append(message)
            if query['id'] in responses_dict:
                for response in responses_dict[query['id']]:
                    message = {
                        'id': response['id'],
                        'role': 'assistant',
                        'content': response['content'],
                        'type': response.get('type', 'text'),
                        'messageId': response['id'],  # 自动生成唯一消息ID
                        'modelName': response.get('modelName', '未知模型'),  # 模型名称
                        'sqlResult': json.loads(response['sqlResult']) if response['sqlResult'] else None  # SQL查询结果
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
        response = deepseekModelService(messages,stream)
    if model_name =='qt-qwen72':
        response = qtQwen72ModelService(messages,stream)
    if not stream:
        return {"content":response,"type":"text"}
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
        task_massages = messages+ [{'role': 'system', 'content': '请根据用户输入的内容概括总结生成标题,不超过10个字,请直接输出标题,不包括解释说明和json等其他格式的信息'}]
        response = modelService(model_name, task_massages)
        return response['content']

import time
@app.route('/completions', methods=['POST'])
def chatController():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No JSON data received'}), 400
    token = request.headers.get('Authorization', 'None')
    print(token)
    messages = data.get('messages', None)
    chat_id = data.get('chatId', None)
    if not chat_id:
        return jsonify({'error': '缺少chatId参数'}), 400
    stream = data.get('stream', False)
    response_id = data.get('responseId', None)
    first_chat = data.get('firstChat', False)
    if not messages or not isinstance(messages, list):
        return jsonify({'error': '空对话'}), 400
    if not token:
        return jsonify({'error': '缺少token参数'}), 400
#     user_info = getUserInfo(token)
    user_info = {
        "userId": 1
    }
    if not user_info:
        return jsonify({'error': '无效的token'}), 401
    user_id = user_info['userId']
    conn = None
    try:
        message = messages[-1]
        conn = get_db_connection()
        cursor = conn.cursor()
        title = None
        if first_chat:
            model_name = data['modelName']
            title = message['content'][:10] if 'content' in message else '无标题'
            if not model_name:
                return jsonify({'error': '缺少模型名称'}), 400
            cursor.execute("INSERT INTO aichat (user_id, model_name, title,chat_id) VALUES (%s, %s, %s, %s)", (user_info['userId'], model_name, title,chat_id))
        else:
            cursor.execute("SELECT model_name FROM aichat WHERE chat_id = %s limit 1", (chat_id,))
            row = cursor.fetchone()
            if not row:
                return jsonify({'error': 'chat_id不合法'}), 400
            model_name = row['model_name']

        cursor.execute("INSERT INTO aichat_query (chat_id , query, type) VALUES (%s,  %s, %s)",
                        (chat_id, message['content'], message.get('type', 'text')))
        query_id = cursor.lastrowid
#         response_id = cursor.execute("INSERT INTO aichat_response (id,chat_id, query_id, content, type , model_name) VALUES (%s, %s, %s, %s, %s)",
#                             (chat_id, query_id, "", "text", model_name))
        cursor.execute("INSERT INTO aichat_response (id,chat_id, query_id, content, type , model_name) VALUES (%s,%s, %s, %s, %s, %s)",
                                    (response_id,chat_id, query_id, "", "text", model_name))
        initPipeline(model_name, messages, response_id, conn)
        if first_chat:
            title = getChatTitle(messages, model_name)
            cursor.execute("UPDATE aichat SET title = %s WHERE chat_id = %s", (title, chat_id))
        updatePipeline(conn, response_id, "初始化", "completed")
        updatePipeline(conn, response_id, "选择工具", "running")
        tool = toolSelection(messages, model_name)
        initToolPipeline(tool['type'], model_name, messages, response_id, conn)
        updatePipeline(conn, response_id, "选择工具", "completed")
        sql_query_result =[]
        if tool['type'] == 'sql':
            sql_query_result=sqlToolExecutor(messages, model_name, response_id, conn)
        query=messages if tool['type']=='chat' else messages+[{'role': 'system', 'content': f'请根据用户输入的内容和sql查询结果生成回复.\nsql查询结果: {json.dumps(sql_query_result,ensure_ascii=False)}'}]
        response = modelService(model_name, query,stream=stream)
        full_content = ""
        if stream:
            def generate():
                print(response)
                nonlocal full_content
                nonlocal cursor
                nonlocal sql_query_result
                nonlocal chat_id
                nonlocal response_id
                try:
                    yield json.dumps({'type':tool['type'],'sqlQueryResult':sql_query_result,'chatId':chat_id,'responseId':response_id},ensure_ascii=False)
                    yield ':META DATA DONE:'
                    updatePipeline(conn, response_id, "生成回复", "completed")
                    for chunk in response['content']:
                        if chunk:
                            print(chunk)
                            full_content += chunk
                            yield chunk

                except Exception as e:
                    print(f"Error during streaming: {e}")
                    conn.rollback()
                finally:
                    cursor.execute("update aichat_response set content = %s,sql_result = %s where id = %s",
                            (full_content,json.dumps(sql_query_result,ensure_ascii=False) ,response_id))
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
    print(jsonify(queryDB( "SELECT * FROM aichat_model ORDER BY model_name")))
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
        pipelines = queryDB("SELECT * FROM aichat_pipeline WHERE response_id = %s ORDER BY seq", (query_id,))
        if not pipelines:
            pipelines = [{
                "name": "初始化",
                "status": "running"
            },{
                "name": "准备工具",
                "status": "non-started"
            },{
                "name": "生成回复",
                "status": "non-started"
            },]
        if len(pipelines) == 1:
            pipelines += [{ "name": "准备工具", "status": "non-started" },{ "name": "生成回复", "status": "non-started" }]
        if len(pipelines) == 2 :
            pipelines += [{ "name": "生成回复", "status": "non-started" }]
        return jsonify(pipelines)
    except Exception as e:
        return jsonify({'error': '未知错误,请联系管理员'}), 500

@app.route('/deleteChat', methods=['POST'])
def delete_chat():
    data = request.get_json()
    if not data or 'chatId' not in data:
        return jsonify({'error': '缺少chatId参数'}), 400
    chat_id = data['chatId']
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            # 查找所有 response_id
            cursor.execute("SELECT id FROM aichat_response WHERE chat_id = %s", (chat_id,))
            response_ids = [row['id'] for row in cursor.fetchall()]
            # 删除 pipeline
            if response_ids:
                format_strings = ','.join(['%s'] * len(response_ids))
                cursor.execute(f"DELETE FROM aichat_pipeline WHERE response_id IN ({format_strings})", tuple(response_ids))
            # 删除 response
            cursor.execute("DELETE FROM aichat_response WHERE chat_id = %s", (chat_id,))
            # 删除 query
            cursor.execute("DELETE FROM aichat_query WHERE chat_id = %s", (chat_id,))
            # 删除 chat
            cursor.execute("DELETE FROM aichat WHERE chat_id = %s", (chat_id,))
        conn.commit()
        return jsonify({'success': True})
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"Error deleting chat: {e}")
        return jsonify({'error': '删除失败', 'detail': str(e)}), 500
    finally:
        if conn:
            conn.close()
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=15000, debug=True)
