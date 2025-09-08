# map_config_1.py

# Marker colors for polygons (countries)
non_marker_colour = "a0a0a0"
non_marker_fill = "5ca2ff"
non_marker_width = 0.2

marker_colour = "000000"
marker_fill = "ffcc00"
marker_width = 1.4 

# Map view
map_center = [-10, 140]
map_zoom = 3

# Define marker types (shapes/icons)
marker_types = {
    "country_marker": {
        "shape": "diamond",
        "width": 11,
        "height": 11,
        "color": "#ffccff",
        "border_width": 2,
        "border_color": "black",
        "shadow_width": 3,
        "shadow_alpha": 1.0,
    },
    "city_marker": {
        "shape": "square",
        "width": 14,
        "height": 14,
        "color": "#ffcc00",
        "border_width": 2,
        "border_color": "white",
        "shadow_width": 3,
        "shadow_alpha": 0.35,
    },
    "latlong_marker": {
        "shape": "triangle",
        "width": 14,
        "height": 14,
        "color": "red",
        "border_width": 0,
        "border_color": "",
        "shadow_width": 0,
        "shadow_alpha": 0,
    },
}

# Marker profiles
profiles = [
    {
        "Country": "Australia",
        "Type": "Country",
        "MarkerType": "country_marker",
        "DescriptionHTML": """
        <div style="font-family:system-ui;min-width:240px;line-height:1.35">
          <h3>Australia</h3>
          <p>This is a manually created description for the Australia marker. You can include
          <b>any HTML</b> here, including images, links, or styled text.</p>
        </div>
        """
    },
    {
        "Country": "Australia",
        "Lat": -33.8688,
        "Lon": 151.2093,
        "Type": "LatLong",
        "MarkerType": "latlong_marker",
        "DescriptionHTML": "<div><b>Sydney:</b> A major city in Australia.</div>"
    },
    {
        "Country": "Pacific Ocean",
        "Lat": 0,
        "Lon": -160,
        "Type": "LatLong",
        "MarkerType": "latlong_marker",
        "DescriptionHTML": "<div><b>Random Point:</b> Example of arbitrary point marker.</div>"
    },

      {
          "Country": "India",
              "Type": "Country",
              "MarkerType": "country_marker",
              "DescriptionHTML": """Test1122"""
      },
      {
          "Country": "India",
              "Type": "Country",
              "MarkerType": "country_marker",
              "DescriptionHTML": """TTT!!"""
      },

      {
          "Country": "QQQ",
              "Lat": 215.353333,
              "Lon": 149.234161,
              "Type": "LatLong",
              "MarkerType": "latlong_marker",
              "DescriptionHTML": """TTT123321"""
      },
      {
          "Country": "QQ2",
              "Lat": -35.353333,
              "Lon": 149.234161,
              "Type": "LatLong",
              "MarkerType": "country_marker",
              "DescriptionHTML": """Test222123"""
      },
      {
          "Country": "Thailand",
              "Type": "Country",
              "MarkerType": "country_marker",
              "DescriptionHTML": """Test 8"""
      },
      {
          "Country": "Brazil",
              "Type": "Country",
              "MarkerType": "country_marker",
              "DescriptionHTML": """brazil"""
      },
      {
          "Country": "Indonesia",
              "Type": "Country",
              "MarkerType": "country_marker",
              "DescriptionHTML": """Description for indonesia"""
      },
]

