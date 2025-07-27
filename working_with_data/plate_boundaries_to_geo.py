import geopandas as gpd

gdf = gpd.read_file("Example_Data_From_Client/plates/plate_boundaries_edit.shp")
print(gdf.head())

# Save it as GeoJSON
gdf.to_file("plate_boundaries.geojson", driver="GeoJSON")

