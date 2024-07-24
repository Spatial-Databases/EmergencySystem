-- Create the new table with the schema and data filtered by adm1_en = 'Gauteng'
CREATE TABLE public.zaf_admbnda_adm3_sadb_ocha_20201109_gauteng AS
SELECT
    gid,
    shape_leng,
    shape_area,
    adm3_en AS municipalities,
    adm1_en AS province,
    adm0_en AS country,
    geom
FROM public.zaf_admbnda_adm3_sadb_ocha_20201109
WHERE 
    adm1_en = 'Gauteng';

-- Add the primary key constraint to the new table
ALTER TABLE public.zaf_admbnda_adm3_sadb_ocha_20201109_gauteng
ADD CONSTRAINT zaf_admbnda_adm3_sadb_ocha_20201109_gauteng_pkey PRIMARY KEY (gid);

