CREATE TABLE public.emergency_center_log (
    id SERIAL PRIMARY KEY,
    input_point GEOMETRY,
    emergency_center_id INTEGER,
    distance DOUBLE PRECISION,
    municipality_name TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



CREATE OR REPLACE FUNCTION public.find_closest_emergency_center_and_log(user_point GEOMETRY)
RETURNS TABLE (emergency_center_id INTEGER, distance DOUBLE PRECISION, municipality_name TEXT) AS
$$
DECLARE
    closest_center_id INTEGER;
    closest_distance DOUBLE PRECISION;
    center_point GEOMETRY;
BEGIN
    -- Find the closest emergency center
    SELECT 
        ec.gid AS emergency_center_id,
        ST_Distance(
            ST_Transform(user_point, 3857), 
            ST_Transform(ec.point, 3857)
        ) AS distance,
        ST_Transform(ec.point, 3857) AS center_point
    INTO 
        closest_center_id, closest_distance, center_point
    FROM 
        public.emergency_centers ec
    WHERE 
        ec.is_available = true
    ORDER BY 
        distance
    LIMIT 1;

    -- Get the municipality name for the closest emergency center
    SELECT municipalities
    INTO municipality_name
    FROM public.zaf_admbnda_adm3_sadb_ocha_20201109_gauteng
    WHERE ST_Contains(
        ST_Transform(geom, 3857),  -- Transform MultiPolygon to SRID 3857
        center_point
    )
    LIMIT 1;

    -- Log the details into the emergency_center_log table
    INSERT INTO public.emergency_center_log (input_point, emergency_center_id, distance, municipality_name)
    VALUES (user_point, closest_center_id, closest_distance, municipality_name);

    -- Return the results
    RETURN QUERY
    SELECT 
        closest_center_id AS emergency_center_id,
        closest_distance AS distance,
        municipality_name;
END;
$$
LANGUAGE plpgsql;



SELECT * FROM public.find_closest_emergency_center_and_log(ST_SetSRID(ST_MakePoint(28.0476, -26.2041), 4326));

