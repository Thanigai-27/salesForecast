from fileinput import filename
import os
import string
import bcrypt
from flask import Flask, flash, redirect, render_template, request, jsonify, session, url_for
from flask_pymongo import PyMongo
from pymongo import MongoClient
from bson.objectid import ObjectId
from flask_cors import CORS
import yaml
import model
from sklearn.model_selection import train_test_split
from werkzeug.utils import secure_filename
from os.path import join, dirname, realpath


app = Flask(__name__)
config = yaml.safe_load(open('database.yaml'))
client = MongoClient(config['uri'])
# db = client.lin_flask
db = client['knf-dev']
CORS(app)

@app.route('/')
def index():
    return render_template('home.html')

@app.route('/signup', methods=['POST', 'GET'])
def data():
    
    # POST a data to database
    if request.method == 'POST':
        body = request.json
        name = body['name']
        email = body['email']
        password=body['password'] 
        # db.users.insert_one({
        db['users'].insert_one({
            "name": name,
            "email":email,
            "password":password
        })
        return jsonify({
            'status': 'Data is posted to MongoDB!',
            'name': name,
            'email':email,
            'password':password
        })
    
    # GET all data from database
    if request.method == 'GET':
        allData = db['users'].find()
        dataJson = []
    
        for data in allData:
            
            name = data['name']
            email = data['email']
            password=data['password']
            dataDict = {
                'id': str(id),
                'name': name,
                'email': email,
                'password':password
            }
            dataJson.append(dataDict)
        print(dataJson)
        return jsonify(dataJson)

UPLOAD_FOLDER = join(dirname(realpath(__file__)), 'static/uploads/')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
 
ALLOWED_EXTENSIONS = set(['txt', 'pdf', 'csv'])
 
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
CORS(app) 

@app.route('/upload', methods=['POST'])
def upload_file():
    # check if the post request has the file part
    if 'files' not in request.files:
        resp = jsonify({'message' : 'No file part in the request'})
        resp.status_code = 400
        return resp
 
    files = request.files.getlist('files')
     
    errors = {}
    success = False
     
    for file in files:      
        if file and allowed_file(file.filename):
            
            filename = secure_filename(file.filename)
           
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
           
            success = True
        else:
            errors[file.filename] = 'File type is not allowed'
 
    if success and errors:
        errors['message'] = 'File(s) successfully uploaded'
        resp = jsonify(errors)
        resp.status_code = 500
        return resp
    if success:
        resp = jsonify({'message' : 'Files successfully uploaded'})
        resp.status_code = 201
        return resp
    else:
        resp = jsonify(errors)
        resp.status_code = 500
        return resp

@app.route('/predict', methods=['GET', 'DELETE', 'PUT'])
def sales_predcit():
    if request.method == 'GET':
         args = request.args
         start_year = args.get("startYear", type=int)
         end_year = args.get("endYear", type=int )
         filename = args.get("filename")
         predicted_sales = model.sales_prediction(start_year, end_year, filename)
         return jsonify(predicted_sales)

@app.route('/accuracy', methods=['GET', 'DELETE', 'PUT'])
def get_accuracy():
    if request.method == 'GET':
         args = request.args
         filename = args.get("filename")
         sales_accuracy = model.get_accuracy(filename)
         return jsonify(sales_accuracy)

@app.route('/predict_year', methods=['GET', 'DELETE', 'PUT'])
def sales_predcit_for_year():
    if request.method == 'GET':
         args = request.args
         year = args.get("year", type=int)
         filename = args.get("filename")
         predicted_sales = model.sales_prediction_for_year(year, filename)
         return jsonify(predicted_sales)


if __name__ == '__main__':
    app.debug = True
    app.run()