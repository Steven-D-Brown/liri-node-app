var axios = require("axios");
var inquirer = require("inquirer");
var fs = require("fs");
//console.log(keyData);

//start by asking for the 
inquirer.prompt([
    {
        type: "list",
        name: "ans",
        choices: ["concert-this", "spotify-this-song", "movie-this", "do-what-it-says"],
        message: "Welcome to LIRI! We can help you find information on music and movies. What would you like to do?"
    }
]).then(res => {
    switchRead(res.ans, "");
    //exclude do-what-it-says so as to avoid potential infinite loop
    if (res.ans === "do-what-it-says")
        readTxt();
});

//use this function to read the normal choices
const switchRead = (ans, str) => {
    //three tildes for spacing; text being saved to the file seems to be trimmed and this may allow for better potential automated parsing than other characters
    logData(ans + " " + str);
    switch (ans) {
        //if the client wants a concert
        case "concert-this":
            concertThis(str);
            break;

        //if the user wants to obtain song information
        case "spotify-this-song":
            spotifyThis(str);
            break;

        case "movie-this":
            movieThis(str);
    }
}

const logData = str => {
    fs.appendFile("log.txt", str + " ~~~", function (err) {
        if (err)
            console.log(err);
    });
}

const concertThis = str => {
    //either correct the url to use plus instead of space or tell the user they need to give a band or artist name
    if (str !== "") {
        concertSearch(str);
        return;
    }
    inquirer.prompt([
        {
            type: "input",
            name: "band",
            message: "Which band would you like to find concerts for? "
        }
    ]).then(function (artist) {
        concertSearch(artist.band);
    });
}

//search for concerts based on a band/artist input
const concertSearch = str => {
    var moment = require("moment");
    //no default artist searched
    if (str === "") {
        return report("Unable to find a concert without a band or artist name.");
    }

    axios.get("https://rest.bandsintown.com/artists/" + str + "/events?app_id=codingbootcamp")
        .then(function (resp) {
            let info = resp.data;
            if (info.length === 0) { //if the artist is not on tour
                report("Sorry, but no upcoming concerts were found for that act.");
                return;
            }

            if (info.errorMessage === "[NotFound] The artist was not found") //one of two error checks
                return report("Sorry, but we could not find any information on that artist.");

            //print each concert with the venue name, location, and date; use dotted lines to make more legible
            for (let i = 0; i < info.length; i++) {
                console.log("-----------------------------------------------------------------------------------------------------------");
                report("Venue Name: " + info[i].venue.name);

                if (info[i].venue.region === "") {
                    report("Concert location: " + info[i].venue.city + ", " + info[i].venue.country);
                }
                else
                    report("Concert location: " + info[i].venue.city + ", " + info[i].venue.region + " " + info[i].venue.country);

                report("Concert Date: " + moment(info[i].datetime).format("MM/DD/YYYY"));
            }
            console.log("-----------------------------------------------------------------------------------------------------------");
        //second error check
        }).catch((error) => {
            if (error) {
                report("Sorry, but we could not find any information on that artist.");
            }
        });
}
//log and console log data
const report = str => {
    logData(str);
    console.log(str);
}

//pass search input onto spotifyThis
const spotifyThis = str => {
    if (str !== "") {
        spotifySearch(str);
        return;
    }

    inquirer.prompt([
        {
            type: "input",
            name: "song",
            message: "What is the name of the song for which you would like information? "
        }
    ]).then(userString => {
        spotifySearch(userString.song)
    });
}

//search for song; allow for multiple results based on input information
const spotifySearch = str => {

    //not loaded at the top because we'll only load this when we need it
    require("dotenv").config();
    var keyData = require("./key.js");
    var Spotify = require('node-spotify-api');
    var spotify = new Spotify(keyData.spotify);
    
    if (str === "") {
        //difference here is showing one song for empty string vs showing multiple songs for any other input
        spotify.search({ type: 'track', query: "the sign ace of base" }, function (err, data) {
            if (err) {
                return console.log('Error occurred: ' + err);
            }
            if (data.tracks.items.length === 0)
                return report("Sorry, but we could not find any songs with that title.");
            let info = data.tracks.items;
            console.log("-----------------------------------------------------------------------------------------------------------");
            let artistList = info[0].artists;
            for (let a = 0; a < artistList.length; a++) {
                report("Artist: " + artistList[a].name);
            }
            report("Song Name: " + info[0].name);
            if (info[0].preview_url === null)
                report("Preview Link: Unable to find at this time.");
            else
                report("Preview Link: " + info[0].preview_url);
            report("Album Name: " + info[0].album.name);
            console.log("-----------------------------------------------------------------------------------------------------------");
        });
        return;
    }
    //same as before; just using input as opposed to default case
    spotify.search({ type: 'track', query: str }, function (err, data) {
        if (err) {
            return console.log('Error occurred: ' + err);
        }
        if (data.tracks.items.length === 0)
            return report("Sorry, but we could not find any songs with that title.");

        let info = data.tracks.items;
        console.log("-----------------------------------------------------------------------------------------------------------");
        for (let i = 0; i < info.length; i++) {
            let artistList = info[i].artists;
            for (let a = 0; a < artistList.length; a++) {
                report("Artist: " + artistList[a].name);
            }
            report("Song Name: " + info[i].name);
            if (info[i].preview_url === null)
                report("Preview Link: Unable to find at this time.");
            else
                report("Preview Link: " + info[i].preview_url);
            report("Album Name: " + info[i].album.name);
            console.log("-----------------------------------------------------------------------------------------------------------");
        }
    });
}

//search for an input movie or default to mr. nobody
const movieThis = str => {
    if (str !== "") {
        movSearch(str);
        return;
    }
    inquirer.prompt([
        {
            type: "input",
            name: "movie",
            message: "Which movie would you like to find information for?"
        }
    ]).then(userString => {
        if (userString.movie === "")
            movSearch("Mr. Nobody");
        else
            movSearch(userString.movie);
    });
}

//search for a movie based on information passed to the function; default handled by movThis
const movSearch = str => {
    axios.get("https://www.omdbapi.com/?t=" + str + "&y=&type=movie&plot=short&apikey=trilogy")
        .then(function (resp) {
            let movDat = resp.data;
            if (movDat.Title === undefined)
                return report("Sorry, but we could not find any results for that movie.");
            console.log("-----------------------------------------------------------------------------------------------------------");
            report("Movie Title: " + movDat.Title);
            report("Release Year: " + movDat.Year);
            report("IMDB Rating: " + movDat.Rated);
            if (movDat.Ratings.length < 2)
                report("Rotten Tomatoes Rating: Unavailable at this time.");
            else
                report("Rotten Tomatoes Rating: " + movDat.Ratings[1].Value);
            report("Country Where the Movie Was Produced: " + movDat.Country);
            report("Languages of the Movie: " + movDat.Language);
            report("Plot Summary: " + movDat.Plot);
            report("Actors: " + movDat.Actors);
            console.log("-----------------------------------------------------------------------------------------------------------");
        });
}

//reads text, logs user attempt to do whatever it says
const readTxt = () => {
    logData("do-what-it-says");
    fs.readFile("random.txt", "utf8", function (error, data) {
        if (error)
            return console.log(error);
        if (data.indexOf(",") === -1) {
            switchRead(data, "");
            return;
        }

        //split at the comma to find command and input
        var arrHold = data.split(",");
        var userInput = null;
        
        //if there are quotes we try to trim them off; also trim off any spaces; then hand the information to switchRead again
        if (arrHold.length > 1) {
            if (arrHold[1].charAt(0) === "\"" || arrHold[1].charAt(0) === "\'") {
                userInput = noMoreQuotes(arrHold[1].trim());
                console.log(userInput);
            }
            else
            userInput = arrHold[1].trim();
        }
        var command = arrHold[0];
        switchRead(command.trim(), userInput);
    });
}

//tries to get rid of quotes if there are some; does not work if quotes are in the middle of things
const noMoreQuotes = x => { return x.substring(1, x.length - 1) };

/*
    LIRI COMMANDS:

    * `node liri.js concert-this <artist/band name here>`

        * This will search the Bands in Town Artist Events API (`"https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp"`) for an artist and render the following information about each event to the terminal:

            * Name of the venue

            * Venue location

            * Date of the Event (use moment to format this as "MM/DD/YYYY")

    * `node liri.js spotify-this-song '<song name here>'`

        * This will show the following information about the song in your terminal/bash window

            * Artist(s)

            * The song's name

            * A preview link of the song from Spotify

            * The album that the song is from

        * If no song is provided then your program will default to "The Sign" by Ace of Base.

        * You will utilize the [node-spotify-api](https://www.npmjs.com/package/node-spotify-api) package in order to retrieve song information from the Spotify API.

    * `node liri.js movie-this '<movie name here>'`

        * This will output the following information to your terminal/bash window:

            ```
            * Title of the movie.
            * Year the movie came out.
            * IMDB Rating of the movie.
            * Rotten Tomatoes Rating of the movie.
            * Country where the movie was produced.
            * Language of the movie.
            * Plot of the movie.
            * Actors in the movie.
            ```

            * If the user doesn't type a movie in, the program will output data for the movie 'Mr. Nobody.'

            * If you haven't watched "Mr. Nobody," then you should: <http://www.imdb.com/title/tt0485947/>

                * It's on Netflix!

            * You'll use the `axios` package to retrieve data from the OMDB API. Like all of the in-class activities, the OMDB API requires an API key. You may use `trilogy`.

    * `node liri.js do-what-it-says`

        * Using the `fs` Node package, LIRI will take the text inside of random.txt and then use it to call one of LIRI's commands.

        * It should run `spotify-this-song` for "I Want it That Way," as follows the text in `random.txt`.

        * Edit the text in random.txt to test out the feature for movie-this and concert-this.

    BONUS

        * In addition to logging the data to your terminal/bash window, output the data to a .txt file called `log.txt`.

        * Make sure you append each command you run to the `log.txt` file.

        * Do not overwrite your file each time you run a command.
*/