const router = require("express").Router();
const client = require("../config/db");
const auth = require("../AuthMiddleware")

// Gets ALL the info on ALL shelters in the db (table zaf_admbnda_adm3_sadb_ocha_20201109_gauteng)
router.get("/getAllSheltersInfo", async (req, res) => {
  try {
    const spatial_response = await client.query(
      "SELECT gid, shape_leng, shape_area, municipalities, province, country, ST_AsGeojson(geom)::json as coordinates FROM public.zaf_admbnda_adm3_sadb_ocha_20201109_gauteng"
    );
    res.json(spatial_response.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Internal server error");
  }
});

// Gets all the shelter COORDINATES in the db (table emergency_centers)
router.get("/getAllShelterCords", async (req, res) => {
  try {
    const spatial_response = await client.query(
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
router.get("/distance", async (req, res) => {
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

    const spatial_response = await client.query(
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
router.get("/findmunicipality", async (req, res) => {
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

    const spatial_response = await client.query(
      "SELECT public.find_municipality_name(ST_SetSRID(ST_MakePoint($1, $2), 4326));",
      [longitude, latitude]
    );

    res.json(spatial_response.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Internal server error");
  }
});

  router.get('/emergencycenters', async (req, res) => {
    let { lon, lat } = req.query;
    console.log(`${lon} ${lat}`);
    const parsedLat = parseFloat(lat);
    const parsedLon = parseFloat(lon);
    console.log(`${parsedLat} ${parsedLon}`);

    console.log('here')
    try {
      console.log('HERE');
      const queryThis = `SELECT * FROM public.find_closest_emergency_center(ST_SetSRID(ST_MakePoint($1, $2), 4326));`
      const result = await client.query(queryThis, [lon, lat]
      );
      console.log(result)
      res.json(result.rows);
    } catch (err) {
      console.error("There was an error with the query: " + err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.get("/shelterswithindistance", async (req, res) => {
    try {
      const { longitude, latitude, distance } = req.query;
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

      if (distance <=0) {
        return res.status(400).send("Invalid distance.");
      }
  
      const spatial_response = await client.query(
        "SELECT * From get_emergency_centers_in_buffer($1,$2,$3)",
        [longitude, latitude, distance]
      );
      res.json(spatial_response.rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Internal server error");
    }
  });
  
  router.get("/admin/strikezone", auth, async (req, res) => {
    try {
      const { longitude, latitude, distance } = req.query;
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

      if (distance <=0) {
        return res.status(400).send("Invalid distance.");
      }
  
      const spatial_response = await client.query(
        "SELECT insert_strike_zone($1,$2,$3);",
        [longitude, latitude, distance]
      );
      const spatial_response2 = await client.query(
        "SELECT update_emergency_centers_in_buffer($1,$2,$3);",
        [longitude, latitude, distance]
      );
      res.json("SUCCESS: Strikezone added.");
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Internal server error");
    }
  });

  router.get("/admin/reversestrikezone", auth, async (req, res) => {
    try {
      const { longitude, latitude, distance } = req.query;
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

      if (distance <=0) {
        return res.status(400).send("Invalid distance.");
      }
  
      const spatial_response = await client.query(
        "SELECT reverse_strike_zone($1,$2,$3);",
        [longitude, latitude, distance]
      );
      res.json("SUCCESS: Strikezone reversed.");
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Internal server error");
    }
  });

  router.get("/admin/createemergencylog", auth, async (req, res) => {
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
  
      const spatial_response = await client.query(
        "SELECT * FROM public.find_closest_emergency_center_and_log(ST_SetSRID(ST_MakePoint($1, $2), 4326));",
        [longitude, latitude]
      );
  
      res.json(spatial_response.rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Internal server error");
    }
  });



module.exports = router;
