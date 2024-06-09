from flask import Flask, request, jsonify
from flask_restful import Api, Resource, reqparse
import mysql.connector
import json
import secrets
import string
import hashlib
import base64

app = Flask(__name__)
api = Api(app)

def get_db_connection():
    try:
        conn = mysql.connector.connect(
            host="127.0.0.1",
            user="root",
            password="",
            database="volunteer_funds"
        )
        return conn
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return None

def generate_token(length=128):
    characters = string.ascii_letters + string.digits
    token = ''.join(secrets.choice(characters) for _ in range(length))
    return token

class Users(Resource): 
    def post(self):
            parser = reqparse.RequestParser()
            parser.add_argument("username", type=str, help="Username is required", required=True)
            parser.add_argument("name", type=str, help="Name is required", required=True)
            parser.add_argument("email", type=str, help="Email is required", required=True)
            parser.add_argument("password", type=str, help="Password is required", required=True)
            parser.add_argument("position", type=str, help="Position is required", required=True)
            parser.add_argument("description", type=str, help="Description is required", required=False, default=None)
            parser.add_argument("verified", type=int, help="Verified is required", required=False, default=0)
            parser.add_argument("photo", type=str, help="Photo is required", required=False, default=None)
            parser.add_argument("favorite_funds", type=str, help="Favorite funds are required", required=False, default=None)

            args = parser.parse_args()

            username = args["username"][:32]
            name = args["name"][:64]
            email = args["email"][:128]
            password = args["password"][:128]
            position = args["position"][:32]
            description = args["description"][:2048] if args["description"] else None
            verified = bool(args["verified"])
            photo = args["photo"][:256] if args["photo"] else None
            favorite_funds = '[]'
            conn = get_db_connection()
            cursor = conn.cursor()
            try:
                cursor.execute("""
                    INSERT INTO users (username, name, email, password, position, description, verified, photo, favorite_funds) 
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (username, name, email, password, position, description, verified, photo, favorite_funds))
                conn.commit()
                cursor.close()
            except Exception as e:
                conn.rollback()
                cursor.close()
                print("Error:", e)
                raise
            cursor = conn.cursor(dictionary=True)
            cursor.execute("""
                SELECT id, username, name, email, position, description, verified, photo, favorite_funds FROM users WHERE email=%s
            """, (email,))
            new_user = cursor.fetchone()
            cursor.fetchall() 
            cursor.close()

            token = generate_token()

            user_data = {
                "Id": new_user["id"],
                "username": new_user["username"],
                "fullName": f"{new_user['name']}",
                "userType": f"{new_user['position']}",
                "email": new_user["email"],
                "description": new_user["description"],
                "verified": new_user["verified"],
                "photo": new_user["photo"],
                "favoriteFunds": json.loads(new_user["favorite_funds"]) if new_user["favorite_funds"] else []
            }

            response_data = {
                "idToken": token,
                "email": new_user["email"],
                "expiresIn": "3600",
                "registered": True,
                "userData": user_data
            }

            return response_data, 201
    
    def put(self):
        parser = reqparse.RequestParser()
        parser.add_argument("id", type=int, required=True, help="User ID is required")
        parser.add_argument("username", type=str)
        parser.add_argument("name", type=str)
        parser.add_argument("email", type=str)
        parser.add_argument("password", type=str)
        parser.add_argument("position", type=str)
        parser.add_argument("description", type=str)
        parser.add_argument("verified", type=int)
        parser.add_argument("photo", type=str)
        parser.add_argument("favorite_funds", type=str)

        args = parser.parse_args()
        user_id = args["id"]
        conn = get_db_connection()
        if user_id:
            cursor = conn.cursor()
            cursor.execute(f"SELECT * FROM users WHERE id={user_id}")
            user = cursor.fetchone()
            cursor.close()
        else:
            return "No id", 415
        
        if not user:
            return "User not found", 404

        query = "UPDATE users SET "
        update_fields = []

        if args["username"]:
            update_fields.append(f"username = '{args['username']}'")
        if args["name"]:
            update_fields.append(f"name = '{args['name']}'")
        if args["email"]:
            update_fields.append(f"email = '{args['email']}'")
        if args["password"]:
            update_fields.append(f"password = '{args['password']}'")
        if args["position"]:
            update_fields.append(f"position = '{args['position']}'")
        if args["description"]:
            update_fields.append(f"description = '{args['description']}'")
        if args["verified"] is not None:
            update_fields.append(f"verified = {args['verified']}")
        if args["photo"]:
            update_fields.append(f"photo = '{args['photo']}'")
        if args["favorite_funds"]:
            update_fields.append(f"favorite_funds = '[{args["favorite_funds"]}]'")
            
        else:
            update_fields.append(f"favorite_funds = '[]'")

        if not update_fields:
            return "No fields to update", 400

        query += ", ".join(update_fields)
        query += f" WHERE id = {user_id}"

        cursor = conn.cursor()
        cursor.execute(query)
        conn.commit()
        cursor.close()

        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, username, name, email, position, description, verified, photo, favorite_funds, password FROM users WHERE id=%s", (user_id,))
        user = cursor.fetchone()
        cursor.close()
        user_data = {
            "Id": user["id"],
            "username": user["username"],
            "fullName": f"{user['name']}",
            "userType": f"{user['position']}", 
            "email": user["email"],
            "description": user["description"],
            "verified": user["verified"],
            "photo": user["photo"],
            "favoriteFunds": json.loads(user["favorite_funds"]) if user["favorite_funds"] else "[]"
        }
        token = generate_token()
        response_data = {
            "idToken": token,  
            "email": user["email"],
            "expiresIn": "3600", 
            "registered": True,
            "userData": user_data
        }
        return response_data, 200


    def delete(self):
        parser = reqparse.RequestParser()
        parser.add_argument("id", type=str, required=True, help="User ID is required")
        args = parser.parse_args()
        user_id = int(args["id"])
        conn = get_db_connection()
        if user_id:
            cursor = conn.cursor()
            cursor.execute(f"SELECT * FROM users WHERE id={user_id}")
            user = cursor.fetchone()
            cursor.close()
        else:
            return "No id", 415
        
        if not user:
            return "User not found", 404

        cursor = conn.cursor()
        cursor.execute(f"DELETE FROM users WHERE id={user_id}")
        conn.commit()
        cursor.close()
        
        return "User deleted successfully", 201
        

class AllUsers(Resource):
    def get(self):
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users")
        all_funds = cursor.fetchall()
        cursor.close()
        return all_funds, 200
    
api.add_resource(AllUsers, "/users", "/users/")

class OneUsers(Resource):
    def post(self):
        conn = get_db_connection()
        parser = reqparse.RequestParser()
        parser.add_argument("username", type=str, required=True, help="Username is required")
        args = parser.parse_args()
        username = args["username"]
        
        if username:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM users WHERE username=%s", (username,))
            user = cursor.fetchone()
            cursor.close()
        else:
            return {"message": "No username provided"}, 415
        
        if user:
            del user["favorite_funds"]
            del user["password"]
            return user, 200
        else:
            return {"message": "User not found"}, 404


class LoginUsers(Resource):
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument("email", type=str, required=True, help="Email is required")
        parser.add_argument("password", type=str, required=True, help="Password is required")
        args = parser.parse_args()
        
        user_login = args["email"]
        user_pass = args["password"]
        conn = get_db_connection()
        if user_login and user_pass:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT id, username, name, email, position, description, verified, photo, favorite_funds, password FROM users WHERE email=%s", (user_login,))
            user = cursor.fetchone()
            cursor.close()
            
            if user and user["password"] == user_pass:
                user_data = {
                    "Id": user["id"],
                    "username": user["username"],
                    "fullName": f"{user['name']}",
                    "userType": f"{user['position']}", 
                    "email": user["email"],
                    "description": user["description"],
                    "verified": user["verified"],
                    "photo": user["photo"],
                    "favoriteFunds": json.loads(user["favorite_funds"]) if user["favorite_funds"] else []
                }
                token = generate_token()
                response_data = {
                    "idToken": token,  
                    "email": user["email"],
                    "expiresIn": "3600",  
                    "registered": True,
                    "userData": user_data
                }
               
                return response_data, 200
            else:
                response_data = {
                    "error": "Invalid email or password"
                }
                return response_data, 401
        else:
            return "Email and password are required", 400



class Funds(Resource):

    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument("user_id", type=str, required=True, help="User ID is required")
        parser.add_argument("name", type=str, required=True, help="Name is required")
        parser.add_argument("description", type=str, required=True, help="Description is required")
        parser.add_argument("city", type=str, required=True, help="Type is required")
        parser.add_argument("required_amount", type=float, required=True, help="Required amount is required")
        parser.add_argument("collected_amount", type=float, default=0)
        parser.add_argument("date", type=int, required=True, help="Date is required")
        parser.add_argument("completed", type=int, default=0)
        parser.add_argument("type", type=str, required=True, help="Type is required")
        parser.add_argument("photo", type=str, required=True, help="Type is required")
        parser.add_argument("payment_type", type=str, required=True, help="Payment type is required")
        parser.add_argument("public_key", type=str, required=True, help="Public key is required")
        parser.add_argument("private_key", type=str, required=True, help="Private key is required")

        args = parser.parse_args()
        conn = get_db_connection()
        user_id = int(args["user_id"])
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO funds (user_id, name, description, city, required_amount, collected_amount, date, completed, type, photo, payment_type, public_key, private_key) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (user_id , args["name"], args["description"], args["city"], args["required_amount"], args["collected_amount"], args["date"], args["completed"], args["type"], args["photo"], args["payment_type"], args["public_key"], args["private_key"]))
        conn.commit()
        cursor.close()
        return "Fund created successfully", 201

    def put(self):
        parser = reqparse.RequestParser()
        parser.add_argument("id", type=int, required=True, help="Fund ID is required")
        parser.add_argument("name", type=str)
        parser.add_argument("description", type=str)
        parser.add_argument("city", type=str)
        parser.add_argument("required_amount", type=float)
        parser.add_argument("collected_amount", type=float)
        parser.add_argument("date", type=int)
        parser.add_argument("completed", type=int)
        parser.add_argument("type", type=str)
        
        args = parser.parse_args()
        fund_id = args["id"]
        conn = get_db_connection()
        if fund_id:
            cursor = conn.cursor()
            cursor.execute(f"SELECT * FROM funds WHERE id={fund_id}")
            fund = cursor.fetchone()
            cursor.close()
        else:
            return "No id", 415
        
        if not fund:
            return "Fund not found", 404

        cursor = conn.cursor()
        query = "UPDATE funds SET "
        update_fields = []

        if args["name"]:
            update_fields.append(f"name = '{args['name']}'")
        if args["description"]:
            update_fields.append(f"description = '{args['description']}'")
        if args["city"]:
            update_fields.append(f"city = '{args['city']}'")
        if args["required_amount"] is not None:
            update_fields.append(f"required_amount = {args['required_amount']}")
        if args["collected_amount"] is not None:
            update_fields.append(f"collected_amount = {args['collected_amount']}")
        if args["date"]:
            update_fields.append(f"date = '{args['date']}'")
        if args["completed"] is not None:
            update_fields.append(f"completed = {args['completed']}")
        if args["type"]:
            update_fields.append(f"type = '{args['type']}'")

        if not update_fields:
            return "No fields to update", 400
        
        query += ", ".join(update_fields)
        query += f" WHERE id = {fund_id}"

        cursor.execute(query)
        conn.commit()
        cursor.close()

        return "Fund updated successfully", 200

    def delete(self):
        parser = reqparse.RequestParser()
        parser.add_argument("id", type=str, required=True, help="Fund ID is required")
        args = parser.parse_args()
        fund_id = int(args["id"])
        conn = get_db_connection()
        if fund_id:
            cursor = conn.cursor()
            cursor.execute(f"SELECT * FROM funds WHERE id={fund_id}")
            fund = cursor.fetchone()
            cursor.close()
        else:
            return "No id", 415
        
        if not fund:
            return "Fund not found", 404

        
        cursor = conn.cursor()
        cursor.execute(f"DELETE FROM funds WHERE id={fund_id}")
        conn.commit()
        cursor.close()
        
        return "Fund deleted successfully", 200
    


# class FundsByUser(Resource):
#     def get(self):
#         parser = reqparse.RequestParser()
#         parser.add_argument("id", type=int, required=True, help="User ID is required")
#         args = parser.parse_args()
#         user_id = args["id"]
#         cursor = conn.cursor(dictionary=True)
#         cursor.execute(f"SELECT * FROM funds WHERE user_id={user_id}")
#         user_funds = cursor.fetchall()
#         cursor.close()
#         if user_funds:
#             response_data = []
#             for fund in all_funds:
#                 user_data = {
#                     "userId": str(fund["user_id"]),
#                     "userFullName": f"{fund['user_name']}",
#                     "userName": fund["user_name"],
#                     "userType": fund["user_position"],
#                     "userPhoto": fund["user_photo"],
#                     "isVerified": fund["user_verified"]
#                 }
#                 fund_data = {
#                     "Id": str(fund["id"]),
#                     "title": fund["name"],
#                     "description": fund["description"],
#                     "imagePath": fund["photo"],
#                     "fundType": fund["type"],
#                     "direction": fund["city"],
#                     "expireOn": fund["date"],
#                     "received": fund["collected_amount"],
#                     "goal": fund["required_amount"],
#                     "user": user_data
#                 }
#                 response_data.append(fund_data)

#             # Вернуть response_data в формате JSON
#             return response_data, 200
#         else:
#             return "User funds not found", 404
    


class AllFunds(Resource):
    def post(self):
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT f.*, u.username AS user_username, u.name AS user_name, u.position AS user_position, u.verified AS user_verified, u.photo AS user_photo  FROM funds f JOIN users u ON f.user_id = u.id")
        all_funds = cursor.fetchall()
        cursor.close()

        response_data = []
        for fund in all_funds:
            user_data = {
                "userId": str(fund["user_id"]),
                "userFullName": f"{fund["user_name"]}",
                "userName": fund["user_username"],
                "userType": fund["user_position"],
                "userPhoto": fund["user_photo"],
                "isVerified": fund["user_verified"]
            }
            fund_data = {
                "Id": str(fund["id"]),
                "title": fund["name"],
                "description": fund["description"],
                "imagePath": fund["photo"],
                "fundType": fund["type"],
                "direction": fund["city"],
                "expireOn": fund["date"],
                "completed": fund["completed"],
                "received": fund["collected_amount"],
                "goal": fund["required_amount"],
                "paymentType": fund["payment_type"],
                "user": user_data
            }
            response_data.append(fund_data)

        return response_data, 200


class Payment(Resource):
    def post(self):
        conn = get_db_connection()
        print('Payment')
        parser = reqparse.RequestParser()
        parser.add_argument("version", type=int, required=True, help="Version is required")
        parser.add_argument("fund_id", type=str, required=True, help="Fund ID is required")
        parser.add_argument("action", type=str, required=True, help="Action is required")
        parser.add_argument("amount", type=float, required=True, help="Amount is required")
        parser.add_argument("currency", type=str, required=True, help="Currency is required")
        parser.add_argument("description", type=str, required=True, help="Description is required")

        args = parser.parse_args()
        fund_id = int(args["fund_id"])
        
        # Извлекаем public_key и private_key из таблицы funds
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT public_key, private_key FROM funds WHERE id=%s", (fund_id,))
        fund = cursor.fetchone()
        if not fund:
            return {"error": "Fund not found"}, 404

        public_key = fund["public_key"]
        private_key = fund["private_key"]

        # Создаем новую запись в таблице orders и получаем order_id
        cursor.execute("INSERT INTO orders (fund_id) VALUES (%s)", (fund_id,))
        conn.commit()
        order_id = cursor.lastrowid

        # Создаем строку данных для LiqPay
        data = {
            "version": args["version"],
            "public_key": public_key,
            "action": args["action"],
            "amount": args["amount"],
            "currency": args["currency"],
            "description": args["description"],
            "order_id": order_id,
            "server_url": "https://2f9b-46-149-95-75.ngrok-free.app/callback"
        }

        data_json = json.dumps(data)
        

        data_base64 = base64.b64encode(data_json.encode('utf-8')).decode('utf-8')

        signature_string = private_key + data_base64 + private_key
        signature = base64.b64encode(hashlib.sha1(signature_string.encode('utf-8')).digest()).decode('utf-8')

        liqpay_data = {
            "data": data_base64,
            "signature": signature
        }
        
        return liqpay_data

class LiqPayCallback(Resource):
    def post(self):
        print('LiqPayCallback')
        data = request.form.get('data')
        signature = request.form.get('signature')
        
        if not data or not signature:
            return {"error": "Missing data or signature"}, 400
        
        data_decoded = base64.b64decode(data).decode('utf-8')
        data_json = json.loads(data_decoded)
        order_id = data_json.get("order_id")
        status = data_json.get("status")
        conn = get_db_connection()
        # Проверяем подпись
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT fund_id FROM orders WHERE id=%s", (order_id,))
        order = cursor.fetchone()
        cursor.close()
        
        if not order:
            return {"error": "Order not found"}, 404
        
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT private_key, collected_amount, required_amount FROM funds WHERE id=%s", (order["fund_id"],))
        fund = cursor.fetchone()
        cursor.close()
        
        if not fund:
            return {"error": "Fund not found"}, 404
        
        private_key = fund["private_key"]
        signature_check = base64.b64encode(hashlib.sha1((private_key + data + private_key).encode('utf-8')).digest()).decode('utf-8')
            
        if signature != signature_check:
            return {"error": "Invalid signature"}, 400
        
        if status == "success":
            
            
            
            
            
            # Обработка данных и обновление статуса заказа
            
            amount = data_json.get("amount")
        
        
            collected_amount = fund["collected_amount"] + amount
            cursor = conn.cursor()
            cursor.execute("UPDATE funds SET collected_amount=%s WHERE id=%s", (collected_amount, order["fund_id"]))
            if collected_amount >= fund["required_amount"]:
                cursor.execute("UPDATE funds SET completed=%s WHERE id=%s", (1, order["fund_id"]))
            cursor.execute("UPDATE orders SET status=%s WHERE id=%s", (status, order_id))
            conn.commit()
            cursor.close()
        
        return {"message": "Callback processed successfully"}, 200


api.add_resource(Users, "/user", "/user/")
api.add_resource(OneUsers, "/oneuser", "/oneuser/")
api.add_resource(LoginUsers, "/login", "/login/")
api.add_resource(Funds, "/fund", "/fund/")    
api.add_resource(AllFunds, "/funds", "/funds/")
api.add_resource(Payment, "/payment", "/payment/")
api.add_resource(LiqPayCallback, "/callback", "/callback/")
# api.add_resource(FundsByUser, "/user_funds/<int:user_id>")


if __name__ == '__main__':
    app.run(debug=True)
    
# conn.close()
