CREATE OR REPLACE FUNCTION public.find_closest_emergency_center(user_point GEOMETRY)
RETURNS TABLE (emergency_center_id INTEGER, distance DOUBLE PRECISION) AS
$$
BEGIN
    RETURN QUERY
    SELECT 
        ec.gid AS emergency_center_id,
        ST_Distance(
            ST_Transform(user_point, 3857), 
            ST_Transform(ec.point, 3857)
        ) AS distance
    FROM 
        public.emergency_centers ec
    WHERE 
        ec.is_available = true
    ORDER BY 
        distance
    LIMIT 1;
END;
$$
LANGUAGE plpgsql;


DROP FUNCTION IF EXISTS public.find_closest_emergency_center(GEOMETRY);


SELECT * FROM public.find_closest_emergency_center(ST_SetSRID(ST_MakePoint(28.0476, -26.2041), 4326));


