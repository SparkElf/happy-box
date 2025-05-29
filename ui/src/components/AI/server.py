from flask import Flask, request, jsonify
from flask_cors import CORS
import pymysql

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

def get_db_connection():
    return pymysql.connect(**DB_CONFIG)

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

@app.route('/completions', methods=['POST'])
def chatController():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No JSON data received'}), 400
    # 处理接收到的数据
    # 例如，假设我们只回显收到的数据
    message = data['message']
    type = data['type']
    if type == 'text':
        response = "文本消息"
    return jsonify({'message': response,"sql":["select * from aichat where user_id = 1"]})

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
