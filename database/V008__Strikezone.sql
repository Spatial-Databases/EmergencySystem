-- Create the strike_zone table
CREATE TABLE IF NOT EXISTS strike_zone (
    id SERIAL PRIMARY KEY,
    location GEOMETRY(Point, 4326),
    buffer_zone GEOMETRY(Polygon, 4326)
);

-- Create the insert_strike_zone function
CREATE OR REPLACE FUNCTION insert_strike_zone(lon DOUBLE PRECISION, lat DOUBLE PRECISION, radius DOUBLE PRECISION)
RETURNS VOID AS $$
BEGIN
    INSERT INTO strike_zone (location, buffer_zone)
    VALUES (
        ST_SetSRID(ST_MakePoint(lon, lat), 4326),
        ST_Buffer(ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography, radius)::geometry
    );
END;
$$ LANGUAGE plpgsql;


SELECT insert_strike_zone(-26.2041, 28.0473, 1000); --meters

SELECT * FROM strike_zone;


