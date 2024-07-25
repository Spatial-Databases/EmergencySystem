-- update emergency centers within the buffer zone
CREATE OR REPLACE FUNCTION update_emergency_centers_in_buffer(lon DOUBLE PRECISION, lat DOUBLE PRECISION, radius DOUBLE PRECISION)
RETURNS VOID AS $$
DECLARE
    buffer_zone GEOMETRY;
BEGIN
    --The buffer zone
    buffer_zone := ST_Buffer(ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography, radius)::geometry;
    
    -- Update the status of ec
    UPDATE public.emergency_centers
    SET is_available = false
    WHERE ST_Within(point, buffer_zone);
END;
$$ LANGUAGE plpgsql;

SELECT insert_strike_zone(-26.2041, 28.0473, 1000);


SELECT * from update_emergency_centers_in_buffer(-26.2041, 28.0473, 80000); 


SELECT * FROM strike_zone;

SELECT * FROM public.emergency_centers;

