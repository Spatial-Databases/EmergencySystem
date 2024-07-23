const router = require("express").Router();
const pool = require("../db");

// Gets ALL the info on ALL shelters in the db (table zaf_admbnda_adm3_sadb_ocha_20201109_gauteng)
router.get("/api/getAllSheltersInfo", async (req, res) => {
  try {
    const spatial_response = await pool.query(
      "SELECT gid, shape_leng, shape_area, municipalities, province, country, ST_AsGeojson(geom)::json as coordinates FROM public.zaf_admbnda_adm3_sadb_ocha_20201109_gauteng"
    );
    res.json(spatial_response.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Internal server error");
  }
});

// Gets all the shelter COORDINATES in the db (table emergency_centers)
router.get("/api/getAllShelterCords", async (req, res) => {
  try {
    const spatial_response = await pool.query(
      "SELECT gid, is_available, ST_AsGeojson(point)::json as coordinates FROM public.emergency_centers"
    );
    res.json(spatial_response.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Internal server error");
  }
});

// Get the closest shelter (in distance/m) to the given longitude and latitude.
// Example usage: http://localhost:5000/data/api/distance?longitude=28.0476&latitude=-26.2041
router.get("/api/distance", async (req, res) => {
  try {
    const { longitude, latitude } = req.query;
    const lonLatRegex = /^-?\d+(\.\d+)?$/;

    // Check if longitude & latitude is in the correct format (number/decimal with only '.')
    if (!lonLatRegex.test(longitude) || !lonLatRegex.test(latitude)) {
      return res
        .status(400)
        .send("Longitude & latitude must be numerical or decimal.");
    }

    // Check if longitude & latitude in range
    if (
      parseFloat(longitude) < -180 ||
      parseFloat(longitude) > 180 ||
      parseFloat(latitude) < -90 ||
      parseFloat(latitude) > 90
    ) {
      return res.status(400).send("Coordinates out of bounds.");
    }

    const spatial_response = await pool.query(
      "SELECT * FROM public.find_closest_emergency_center(ST_SetSRID(ST_MakePoint($1, $2), 4326));",
      [longitude, latitude]
    );
    res.json(spatial_response.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Internal server error");
  }
});

// Find the municipality in which a set of coordinates are placed
router.get("/api/findmunicipality", async (req, res) => {
    try {
      const { longitude, latitude } = req.query;
      const lonLatRegex = /^-?\d+(\.\d+)?$/;
  
      // Check if longitude & latitude is in the correct format (number/decimal with only '.')
      if (!lonLatRegex.test(longitude) || !lonLatRegex.test(latitude)) {
        return res
          .status(400)
          .send("Longitude & latitude must be numerical or decimal.");
      }
  
      // Check if longitude & latitude in range
      if (
        parseFloat(longitude) < -180 ||
        parseFloat(longitude) > 180 ||
        parseFloat(latitude) < -90 ||
        parseFloat(latitude) > 90
      ) {
        return res.status(400).send("Coordinates out of bounds.");
      }
  
      const spatial_response = await pool.query(
        "SELECT public.find_municipality_name(ST_SetSRID(ST_MakePoint($1, $2), 4326));",
        [longitude, latitude]
      );
    //   if (spatial_response[0] == null) {
    //     return res
    //       .status(400)
    //       .send("Coordinates not within a valid municipality.");
    //   }
      res.json(spatial_response.rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Internal server error");
    }
  });

module.exports = router;
