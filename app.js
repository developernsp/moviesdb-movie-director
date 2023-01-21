const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbpath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const getMovieNames = (movie) => {
  return { movieName: movie.movie_name };
};

//GET movies API
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT 
        *
    FROM
        movie;`;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(moviesArray.map((eachMovie) => getMovieNames(eachMovie)));
});

//POST movie API
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;

  const addMovieQuery = `
        INSERT INTO
            movie(director_id, movie_name, lead_actor)
        VALUES(
            ${directorId},
            "${movieName}",
            "${leadActor}");`;
  const dbResponse = await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

//GET movie API
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
        SELECT 
             *
        FROM 
             movie
        WHERE 
            movie_id = ${movieId};`;

  const movie = await db.get(getMovieQuery);
  response.send(movie);
});

//PUT movie API
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;

  const updateMovieQuery = `
        UPDATE movie
        SET 
             movie_id = ${movieId},
             director_id = ${directorId},
             lead_actor = "${leadActor}"
        WHERE 
             movie_id = ${movieId};`;

  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//DELETE movie API
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
             DELETE 
                 FROM
             movie
             WHERE
                 movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});
