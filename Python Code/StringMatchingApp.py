from flask import Flask, jsonify, request, Response
from flask_cors import CORS
import pandas as pd
from StringMatching import fileCheck

ALLOWED_EXTENSIONS = set(['csv'])

app = Flask(__name__)
CORS(app)
@app.route('/upload', methods=['GET', 'POST'])
def match_accounts():
    print(request)
    if request.method == 'POST':
        for fileName in request.files:
            try:
                print(fileName)
                fileData = pd.read_csv(request.files[fileName], encoding = 'utf-8')
                package = fileCheck(fileName, fileData)
                print(package)
                return jsonify(package)
            except:
                return jsonify({'parsingError': { 'fileName': fileName,'reason': 'File broke the app'}})
                

    
        

