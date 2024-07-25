CREATE OR REPLACE FUNCTION get_emergency_centers_in_buffer(lon DOUBLE PRECISION, lat DOUBLE PRECISION, radius DOUBLE PRECISION)
RETURNS TABLE (gid INTEGER, latitude DOUBLE PRECISION, longitude DOUBLE PRECISION) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ec.gid,
        ST_Y(ec.point::geometry) AS latitude,
        ST_X(ec.point::geometry) AS longitude
    FROM
        public.emergency_centers ec
    WHERE
        ST_Within(ec.point, ST_Buffer(ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography, radius)::geometry);
END;
$$ LANGUAGE plpgsql;

SELECT * From get_emergency_centers_in_buffer(-25.98323,27.72067, 1000)

-25.98323,27.72067