-- create function for box to generate random points
CREATE OR REPLACE FUNCTION random_point_in_polygon(geom geometry)
RETURNS geometry AS $$
DECLARE
    x_min DOUBLE PRECISION;
    y_min DOUBLE PRECISION;
    x_max DOUBLE PRECISION;
    y_max DOUBLE PRECISION;
    x_rand DOUBLE PRECISION;
    y_rand DOUBLE PRECISION;
    point geometry;
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

CREATE TABLE emergency_centers AS
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
    gid,
    point
FROM points;

ALTER TABLE emergency_centers
ADD COLUMN is_available BOOLEAN DEFAULT true;
