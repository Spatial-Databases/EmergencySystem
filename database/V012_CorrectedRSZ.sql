
CREATE OR REPLACE FUNCTION reverse_strike_zone(lon DOUBLE PRECISION, lat DOUBLE PRECISION, radius DOUBLE PRECISION)
RETURNS VOID AS $$
DECLARE
    zone_buffer GEOMETRY;
BEGIN
    
    zone_buffer := ST_Buffer(ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography, radius)::geometry;

    UPDATE public.emergency_centers
    SET is_available = true
    WHERE ST_Within(point, zone_buffer);
    
    DELETE FROM strike_zone
    WHERE id IN (
        SELECT id FROM strike_zone
        WHERE ST_Within(location, zone_buffer)
    );
END;
$$ LANGUAGE plpgsql;





SELECT reverse_strike_zone(28.0476, -26.2041, 15000)

