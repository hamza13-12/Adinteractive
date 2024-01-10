from flask import Flask
from flask import current_app, flash, jsonify, make_response, redirect, request, url_for
import json

from flask import Flask, render_template, request, session
import os
from werkzeug.utils import secure_filename
from flask_cors import CORS
import base64

from PIL import Image
import time
import io


from werkzeug.datastructures import FileStorage
from ultralytics import YOLO
import numpy as np
import argparse
import cv2
from pathlib import Path

import json



#*** Backend operation

# WSGI Application
# Defining upload folder path
UPLOAD_FOLDER = os.path.join('staticFiles', 'uploads')
# # Define allowed files
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'}

# Provide template folder name
# The default folder name should be "templates" else need to mention custom folder name for template path
# The default folder name for static files should be "static" else need to mention custom folder for static path
app = Flask(__name__, template_folder='templates', static_folder='static')
# Configure upload folder for Flask application
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['SECRET_KEY'] = '7d441f27d441f27567d441f2b6176a'
CORS(app)


# Define secret key to enable session
# app.secret_key = 'This is your secret key to utilize session in Flask'
prevMovieName = ""

# @app.before_first_request
def load_model(movie_name):
    global model, classNames, descriptions, links, labels, images, prevMovieName

    
    video_ids = ["GgKmhDaVo48", "granTurismo", "redNotice", "GVPzGBvPrzw"]
    if movie_name in video_ids:

        with open("cfg/granTurismo.json") as json_data_file:
            data = json.load(json_data_file)


      # Load model
        model = YOLO("gran_turismo_m.pt")


        print("Model loaded...", movie_name)
        classNames = model.module.names if hasattr(model, 'module') else model.names

        descriptions = data["descriptions"]
        links = data["links"]
        labels = data["labels"]
        images = data["images"]

        prevMovieName = movie_name
    else:
        print("Data not found for this movie...")




def get_predictions(movie_name):
    
    results = model("frame.jpg", stream=False, conf=0.6, iou=0.7)

    for result in results:

        result = result.cpu().numpy()

        # print(result)

        # resultPlotted = result.plot(line_width = 1, show_conf = True, font_size = 1)
        # print(result.boxes.xywhn)

        # resultPlotted = drawBoxes(result.orig_img, result.boxes.xyxy, result.boxes.conf, result.boxes.cls, result.names, corneredBbox = True)
        resultPlotted = result.orig_img
        classIdxs = result.boxes.cls
        # classNames = result.names
        json_response = []
        for i, bbox in enumerate(result.boxes.xyxy):

            object_name = f'{classNames[int(classIdxs[i])]}'

            x1, y1, x2, y2 = [int(b) for b in bbox]
            if object_name == "livingRoomTable":
                center_coordinates = ((int((x1 + x2)/2))/resultPlotted.shape[1], (int((y1 + ((y2-y1)*70/100))))/resultPlotted.shape[0])
            else:
                center_coordinates = ((int((x1 + x2)/2))/resultPlotted.shape[1], (int((y1 + ((y2-y1)*30/100))))/resultPlotted.shape[0])
            # cv2.circle(resultPlotted, center_coordinates, 5, (0,0,255), thickness=-1)

            # resultPlotted = drawCenters(resultPlotted, result.boxes.xyxy)

                    # print(xyxy)

            json_response.append({
                "label":labels[object_name],
                "description":descriptions[object_name],
                "coordinates":list(center_coordinates),
                "link":links[object_name],
                "image": images[object_name]
                }
            )
    print(json_response)
    return json_response


@app.route('/',  methods=("POST", "GET"))
def uploadFile():
    if request.method == 'GET':
        return render_template('redNotice.html')
    elif request.method == 'POST':
        # Get the frame data from the JSON payload
        frame_data = request.json.get('frameData')

        movie_name = request.json.get('movieName')
        print("Movie requested", movie_name, "\n", "Previous movie...", prevMovieName)

        if movie_name != prevMovieName:
            load_model(movie_name)

        # Decode the base64-encoded frame data
        image_data = base64.b64decode(frame_data.split(',')[1])

        # Save the image data to a file on the hard drive
        with open('frame.jpg', 'wb') as f:
            f.write(image_data)

        print("File saved...")

        json_response = get_predictions(movie_name)

        time.sleep(0.5)

        response = jsonify(json_response)

        print("response sent...")
        return response

if __name__ == "__main__":

    app.run(host='0.0.0.0', debug=True)