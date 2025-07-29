# 2025-ITP2-Group3

## Info

`Example_Data_From_Client/` is data given to us by the client

`initial_test_v1` contains webpage code

`working_with_data` contains code to turn shape files and xslx to geojson


## Requirements

Python installed

`python --version` should return if you have python installed



## Starting server

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



