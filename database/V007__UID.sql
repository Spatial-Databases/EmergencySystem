--Drop the existing table if it exists
DROP TABLE IF EXISTS public.emergency_centers CASCADE;

-- Create the table with gid as a unique column
CREATE TABLE public.emergency_centers
(
    gid SERIAL PRIMARY KEY,
    point GEOMETRY,
    is_available BOOLEAN DEFAULT true
);

-- Define the random_point_in_polygon function
CREATE OR REPLACE FUNCTION random_point_in_polygon(geom GEOMETRY)
RETURNS GEOMETRY AS $$
DECLARE
    x_min DOUBLE PRECISION;
    y_min DOUBLE PRECISION;
    x_max DOUBLE PRECISION;
    y_max DOUBLE PRECISION;
    x_rand DOUBLE PRECISION;
    y_rand DOUBLE PRECISION;
    point GEOMETRY;
BEGIN
    SELECT ST_XMin(geom), ST_YMin(geom), ST_XMax(geom), ST_YMax(geom)
    INTO x_min, y_min, x_max, y_max;

    LOOP
        x_rand := random() * (x_max - x_min) + x_min;
        y_rand := random() * (y_max - y_min) + y_min;
        point := ST_SetSRID(ST_MakePoint(x_rand, y_rand), ST_SRID(geom));

        IF ST_Contains(geom, point) THEN
            RETURN point;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

INSERT INTO public.emergency_centers (point)
WITH polygons AS (
    SELECT gid, geom
    FROM public.zaf_admbnda_adm3_sadb_ocha_20201109_gauteng
),
points AS (
    SELECT
        gid,
        random_point_in_polygon(geom) AS point
    FROM polygons
    CROSS JOIN generate_series(1, 3) AS series
)
SELECT
    point
FROM points;

SELECT * FROM public.emergency_centers;
