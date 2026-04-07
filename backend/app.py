from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error

app = Flask(__name__)
CORS(app)

# Conexión a MySQL
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",         # Cambia si es otro usuario
        password="",          # Cambia si tienes contraseña
        database="inventia2"
    )

# -----------------------------
# RUTAS: ESTADOS Y UBICACIONES
# -----------------------------
@app.route("/estados", methods=["GET"])
def get_estados():
    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT * FROM estados")
        resultados = cursor.fetchall()
        cursor.close()
        db.close()
        return jsonify(resultados)
    except Error as e:
        return jsonify({"error": str(e)}), 500

@app.route("/ubicaciones", methods=["GET"])
def get_ubicaciones():
    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT * FROM ubicaciones")
        resultados = cursor.fetchall()
        cursor.close()
        db.close()
        return jsonify(resultados)
    except Error as e:
        return jsonify({"error": str(e)}), 500

# -----------------------------
# RUTAS: ACTIVOS
# -----------------------------
@app.route("/activos", methods=["GET"])
def get_activos():
    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)
        cursor.execute("""
            SELECT a.id_activo, a.nombre, a.descripcion,
                   a.id_estado, e.nombre AS estado_nombre,
                   a.id_ubicacion, u.nombre AS ubicacion_nombre
            FROM activos a
            LEFT JOIN estados e ON a.id_estado = e.id_estado
            LEFT JOIN ubicaciones u ON a.id_ubicacion = u.id_ubicacion
        """)
        resultados = cursor.fetchall()
        cursor.close()
        db.close()
        return jsonify(resultados)
    except Error as e:
        return jsonify({"error": str(e)}), 500

@app.route("/activos", methods=["POST"])
def crear_activo():
    data = request.get_json()
    # Validación de campos
    if not all(k in data for k in ("nombre", "descripcion", "id_estado", "id_ubicacion")):
        return jsonify({"error": "Faltan campos"}), 400
    try:
        db = get_db_connection()
        cursor = db.cursor()
        sql = "INSERT INTO activos (nombre, descripcion, id_estado, id_ubicacion) VALUES (%s,%s,%s,%s)"
        cursor.execute(sql, (
            data['nombre'],
            data['descripcion'],
            int(data['id_estado']),
            int(data['id_ubicacion'])
        ))
        db.commit()
        cursor.close()
        db.close()
        return jsonify({"mensaje": "Activo creado"})
    except Error as e:
        return jsonify({"error": str(e)}), 500

@app.route("/activos/<int:id_activo>", methods=["PUT"])
def actualizar_activo(id_activo):
    data = request.get_json()
    try:
        db = get_db_connection()
        cursor = db.cursor()
        sql = """
            UPDATE activos
            SET nombre=%s, descripcion=%s, id_estado=%s, id_ubicacion=%s
            WHERE id_activo=%s
        """
        cursor.execute(sql, (
            data.get('nombre'),
            data.get('descripcion'),
            int(data.get('id_estado')),
            int(data.get('id_ubicacion')),
            id_activo
        ))
        db.commit()
        cursor.close()
        db.close()
        return jsonify({"mensaje": "Activo actualizado"})
    except Error as e:
        return jsonify({"error": str(e)}), 500

@app.route("/activos/<int:id_activo>", methods=["DELETE"])
def eliminar_activo(id_activo):
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute("DELETE FROM activos WHERE id_activo=%s", (id_activo,))
        db.commit()
        cursor.close()
        db.close()
        return jsonify({"mensaje": "Activo eliminado"})
    except Error as e:
        return jsonify({"error": str(e)}), 500

# -----------------------------
# EJECUTAR FLASK
# -----------------------------
if __name__ == "__main__":
    app.run(debug=True, port=5000)