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

const getMovieDetails = (movie) => {
  return {
    movieId: movie.movie_id,
    directorId: movie.director_id,
    movieName: movie.movie_name,
    leadActor: movie.lead_actor,
  };
};

const getDirectorsDetails = (director) => {
  return {
    directorId: director.director_id,
    directorName: director.director_name,
  };
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
  response.send(getMovieDetails(movie));
});

//PUT movie API
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;

  const updateMovieQuery = `
        UPDATE movie
        SET 
             director_id = ${directorId},
             movie_name = "${movieName}",
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

//GET director table details API

app.get("/directors/", async (request, response) => {
  const getDirectorsDetails = `
    SELECT 
       *
    FROM
       director;`;
  const directorsArray = await db.all(getDirectorsDetails);
  response.send(
    directorsArray.map((director) => getDirectorsDetails(director))
  );
});

//GET director all movies API
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `
       SELECT 
            *
       FROM 
            movie 
       NATURAL JOIN director
       WHERE director_id = ${directorId};`;
  const directorMoviesArray = await db.all(getDirectorMoviesQuery);
  response.send(directorMoviesArray.map((movie) => getMovieNames(movie)));
});

module.exports = app;
