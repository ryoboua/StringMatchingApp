from flask import Flask, jsonify, render_template, url_for, request, Response
from flask_cors import CORS
import pandas as pd
from StringMatching import matchAccounts
import os


UPLOAD_FOLDER = '/uploads'
ALLOWED_EXTENSIONS = set(['csv'])

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
CORS(app)


@app.route('/upload', methods=['GET', 'POST'])
def upload_file():
    print(request)
    if request.method == 'POST':
        for file in request.files:
            print(file)
            document = pd.read_csv(request.files[file], encoding = 'utf-8')
            matchAccounts(document)

            return_file = open('ngram_results.csv', 'r')

            return Response(return_file,mimetype="text/csv",headers={"Content-disposition":"attachment; filename=ngram_results.csv"})

 
     

