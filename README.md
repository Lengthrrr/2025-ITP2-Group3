# 2025-ITP2-Group3

Username and Password for Students

"Indo Pacific" and "Indo Pacific"

Username and Password for Lecturers

"Indo Pacific" and "ILoveIndoPacific"


## Info

`Example_Data_From_Client/` is data given to us by the client

`initial_test_v1` contains webpage code

`working_with_data` contains code to turn shape files and xslx to geojson


## Requirements

Python installed

`python --version` should return if you have python installed

## Starting it (NEW and CURRENT)

Make sure you have nodejs downloaded [https://nodejs.org/](https://nodejs.org/)

Check it's installed with `node -v`

Clone repository

Move into node_test_v1 `cd node_test_v1`

Install relevant node modules with

`
npm install express
`

(You might have to delete the node modules folder if you are getting an error.)

Run the server with `node src/server.js`

If that doesn't work lmk

You should be able to go to [http://localhost:8001/](http://localhost:8001/) to get to the login page

Login is `User Testing` for the username and password


## Starting server (OLD)

Clone repository

Move into initial_test_v1 `cd initial_test_v1`

Run server with `python -m http.server 8000`

Go to `localhost:8000` in chrome

You should be able to see the map there

## Working with Data

Clone repository

Move into repository

Create virtual env `python -m venv .venv`

Activate virtual env `source .venv/bin/activate`

Install reqs to virtual env `pip install -r requirements.txt`

Run python code `python /working_with_data/volcanoes_to_geo.py`

## Features to implement

Adding zoom capability

Click to add side bar

Different maps

Quiz mode



