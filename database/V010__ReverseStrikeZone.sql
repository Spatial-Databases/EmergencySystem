CREATE OR REPLACE FUNCTION reverse_strike_zone(lon DOUBLE PRECISION, lat DOUBLE PRECISION, radius DOUBLE PRECISION)
RETURNS VOID AS $$
DECLARE
    buffer_zone GEOMETRY;
BEGIN
    -- buffer zone
    buffer_zone := ST_Buffer(ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography, radius)::geometry;
    
    -- Update the status of ec
    UPDATE public.emergency_centers
    SET is_available = true
    WHERE ST_Within(point, buffer_zone);
END;
$$ LANGUAGE plpgsql;


SELECT reverse_strike_zone(-26.2041, 28.0473, 80000)

