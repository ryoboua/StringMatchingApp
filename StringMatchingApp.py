from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
from StringMatching import matchAccounts

ALLOWED_EXTENSIONS = set(['csv'])

app = Flask(__name__)
CORS(app)

@app.route('/upload', methods=['GET', 'POST'])
def upload_file():
    print(request)
    if request.method == 'POST':
        for fileName in request.files:
            print(fileName)
            fileData = pd.read_csv(request.files[fileName], encoding = 'utf-8')
            newData = matchAccounts(fileName, fileData)
            return jsonify(newData)


 
     

