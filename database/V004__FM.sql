CREATE OR REPLACE FUNCTION public.find_municipality_name(point GEOMETRY)
RETURNS TEXT AS
$$
DECLARE
    municipality_name TEXT;
BEGIN
    -- Query to find the municipality name where the point is located
    SELECT municipalities
    INTO municipality_name
    FROM public.zaf_admbnda_adm3_sadb_ocha_20201109_gauteng
    WHERE ST_Contains(geom, point)
    LIMIT 1; -- Assuming you want to return just one municipality name if multiple match

    RETURN municipality_name;
END;
$$
LANGUAGE plpgsql;

SELECT public.find_municipality_name(ST_SetSRID(ST_MakePoint(28.0476, -26.2041), 4326));
