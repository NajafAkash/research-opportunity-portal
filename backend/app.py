from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from db import get_db_connection

load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "Research Opportunity Portal API is running."})

@app.route('/api/opportunities', methods=['GET'])
def get_opportunities():
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM research_opportunities")
    records = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(records), 200

@app.route('/api/opportunities/<int:id>', methods=['GET'])
def get_opportunity(id):
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM research_opportunities WHERE id = %s", (id,))
    record = cursor.fetchone()
    cursor.close()
    conn.close()
    
    if not record:
        return jsonify({"error": "Opportunity not found"}), 404
        
    return jsonify(record), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)
