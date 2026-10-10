from flask import Flask, jsonify, request
from datetime import datetime
from flask_cors import CORS
from dotenv import load_dotenv
import os
from db import get_db_connection

load_dotenv()

app = Flask(__name__)
CORS(app)

# Global error handlers
@app.errorhandler(400)
def bad_request(error):
    return jsonify({"error": "Bad Request", "message": str(error.description)}), 400

@app.errorhandler(500)
def internal_server_error(error):
    return jsonify({"error": "Internal Server Error", "message": "An unexpected error occurred."}), 500

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "Research Opportunity Portal API is running."})

@app.route('/api/opportunities', methods=['GET'])
def get_opportunities():
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM research_opportunities")
        records = cursor.fetchall()
        return jsonify(records), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/opportunities/<int:id>', methods=['GET'])
def get_opportunity(id):
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM research_opportunities WHERE id = %s", (id,))
        record = cursor.fetchone()
        if not record:
            return jsonify({"error": "Opportunity not found"}), 404
        return jsonify(record), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/opportunities', methods=['POST'])
def create_opportunity():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Bad Request", "message": "No input data provided"}), 400
        
    required_fields = ['title', 'description', 'area', 'faculty_name', 'department', 'required_skills', 'available_positions', 'application_deadline']
    for field in required_fields:
        if field not in data or not str(data[field]).strip():
            return jsonify({"error": "Bad Request", "message": f"Missing required field: {field}"}), 400
    try:
        if int(data['available_positions']) <= 0:
            return jsonify({"error": "Bad Request", "message": "Available positions must be positive"}), 400
    except ValueError:
        return jsonify({"error": "Bad Request", "message": "Available positions must be an integer"}), 400

    try:
        datetime.strptime(str(data['application_deadline']), "%Y-%m-%d")
    except ValueError:
        return jsonify({"error": "Bad Request", "message": "Date must be YYYY-MM-DD format"}), 400
        
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
        
    cursor = conn.cursor()
    try:
        query = """
        INSERT INTO research_opportunities 
        (title, description, area, faculty_name, department, required_skills, available_positions, application_deadline, status) 
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        status = data.get('status', 'Open')
        values = (
            data['title'], data['description'], data['area'], data['faculty_name'], 
            data['department'], data['required_skills'], data['available_positions'], 
            data['application_deadline'], status
        )
        cursor.execute(query, values)
        conn.commit()
        new_id = cursor.lastrowid
        return jsonify({"message": "Opportunity created successfully", "id": new_id}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/opportunities/<int:id>', methods=['PUT'])
def update_opportunity(id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Bad Request", "message": "No input data provided"}), 400
        
    required_fields = ['title', 'description', 'area', 'faculty_name', 'department', 'required_skills', 'available_positions', 'application_deadline', 'status']
    for field in required_fields:
        if field not in data or not str(data[field]).strip():
            return jsonify({"error": "Bad Request", "message": f"Missing required field: {field}"}), 400
            
    if data['status'] not in ['Open', 'Closed']:
        return jsonify({"error": "Bad Request", "message": "Status must be 'Open' or 'Closed'"}), 400
    try:
        if int(data['available_positions']) <= 0:
            return jsonify({"error": "Bad Request", "message": "Available positions must be positive"}), 400
    except ValueError:
        return jsonify({"error": "Bad Request", "message": "Available positions must be an integer"}), 400

    try:
        datetime.strptime(str(data['application_deadline']), "%Y-%m-%d")
    except ValueError:
        return jsonify({"error": "Bad Request", "message": "Date must be YYYY-MM-DD format"}), 400
        
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
        
    cursor = conn.cursor()
    try:
        # First check if exists
        cursor.execute("SELECT id FROM research_opportunities WHERE id = %s", (id,))
        if not cursor.fetchone():
            return jsonify({"error": "Opportunity not found"}), 404
            
        query = """
        UPDATE research_opportunities SET 
        title = %s, description = %s, area = %s, faculty_name = %s, 
        department = %s, required_skills = %s, available_positions = %s, 
        application_deadline = %s, status = %s
        WHERE id = %s
        """
        values = (
            data['title'], data['description'], data['area'], data['faculty_name'], 
            data['department'], data['required_skills'], data['available_positions'], 
            data['application_deadline'], data['status'], id
        )
        cursor.execute(query, values)
        conn.commit()
        return jsonify({"message": "Opportunity updated successfully"}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/opportunities/<int:id>', methods=['DELETE'])
def delete_opportunity(id):
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
        
    cursor = conn.cursor()
    try:
        # First check if exists
        cursor.execute("SELECT id FROM research_opportunities WHERE id = %s", (id,))
        if not cursor.fetchone():
            return jsonify({"error": "Opportunity not found"}), 404
            
        cursor.execute("DELETE FROM research_opportunities WHERE id = %s", (id,))
        conn.commit()
        return jsonify({"message": "Opportunity deleted successfully"}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    app.run(debug=True, port=5000)
