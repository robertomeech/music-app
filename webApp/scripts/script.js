//GLOBAL VARIABLES
app = {};
//  $
//  _


//PAGE BUILDING FUNCTIONS
app.genres = {
    "Hip Hop/Rap": 18,
    "Country": 6,
    "Alternative": 20,
    "Dance": 17,
    "Pop": 14,
    "Heavy Metal": 1153,
    "R&B/Soul": 15,
    "Rock": 21
  }

app.addGenreOptions = function () {
    for (genre in app.genres) {
        const genreId = app.genres[genre];
        const $option = $('<option>')
            .attr('value', genre)
            .attr('data-genre-id', genreId)
            .text(genre);
        $('#genre').append($option);
    }
}

//Make background image change with change event in select element for different genres

//EVENT FUNCTIONS


// Takes values from form submit returns them in an object organized according to the type of search.
app.getFormSubmit = function (event) {
    const form = event.target;

    const artistSearch = $('#artist').val();
    const genreSearch = $('#genre').val();


    return { //Using ES6 object literal syntax, instead of  {varName: varName}  => {varName}
        artistSearch,
        genreSearch
    }
}

app.makeOptionsObject = function (formValues) {



}

// --Genre, decade, artist
//     => Choose Genre or Artist, and optionally decade.If you don’t choose a decade you get recent hits.
// 		=> With default is the top40 chart.
// 	--Also ask how long they want to play for, and how many players
// --If there is more than one player, they can put in the player names

// API Requests


app.musixMethods = {
    //Use this to get top chart hits
    chart: 'chart.tracks.get',

    //Use this for genre and artist searchs
    track: 'track.search',

    //Use this to get related artists from the artist id.
    related: 'artist.related.get',

    //Use this to get the lyrics after searching for the track IDs
    lyrics: 'track.lyrics.get'
}


//Test config objects
const chartConfig = {
    method: app.musixMethods.chart,
};

const lyricConfig = {
    method: app.musixMethods.lyrics,
    trackId: 149804156,
    f_has_lyrics: true //Test to see if this messes up the search
};

const trackConfig =  {
    method: app.musixMethods.track,
    genreId: 14 //pop
};

//Musix API Info
app.musixUrl = "https://api.musixmatch.com/ws/1.1/";

app.musixApiKey = "0a6e3214ba4afecba8f9ee47cbca8d33";

//Giphy API info
app.giphyUrl = "http://api.giphy.com/v1/gifs/search";
app.giphyApiKey = "gUH1fFCntMG4MW94vqf6UCSWIqCusok1";


//Chart Request
app.musixRequest = function() { //Options is an object with the config for the request.
    const musixResults = $.ajax({
        type: 'GET',
        url: app.musixUrl + app.musixMethods.chart, 
        dataType: "jsonp",
        jsonpCallback: 'jsonp_callback',
        contentType: 'application/json',
        data: {
            apikey: app.musixApiKey,
            format: 'jsonp',
            callback: 'jsonp_callback',


            //Chart search
            f_has_lyrics: 1, 
            page_size: 100,
            //174 results 
        }
    })
    .then(function(result){
        console.log(`Musix API Result:
        ` , result);


        const tracksInfo = result.message.body.track_list.map(track => {
        const { track_id, artist_name, album_name, track_name } =  track.track;

        const genreList = track.track.primary_genres.music_genre_list;
        let genre_name = "";
         if (genreList.length > 0) {
            genre_name = genreList[0].music_genre.music_genre_name;
         }
        
            return {track_id, artist_name, album_name, track_name, genre_name};
        })
        console.log(tracksInfo);
        
        const filtered = app.filterByGenre(tracksInfo, 'Hip Hop/Rap');
        console.log(`filtered`, filtered);
        

        return result;

        // console.log("dataRetreived", result.message.body.lyrics.lyrics_body);

    });

    return musixResults;
}

// Sort Genre Name
app.filterByGenre = function(tracksInfo, genreName) {
    const filteredTracks = tracksInfo.filter(track => {
        return genreName === track.genre_name;
    });
    
    return filteredTracks; 
}

//LYRICS SEARCH
app.lyricsRequest = function(trackId){
    const lyricsUnedited = $.ajax({
        type: 'GET',
        url: app.musixUrl + app.musixMethods.lyrics, // OPTIONS MUST INCLUDE METHOD
        dataType: "jsonp",
        jsonpCallback: 'jsonp_callback',
        contentType: 'application/json',
        data: {
            apikey: app.musixApiKey,
            format: 'jsonp',
            callback: 'jsonp_callback',



            track_id: trackId,
            page_size: 100
            // page: 2,


            // IF WE DO ARTIST SEARCH

            //Track Search
            // f_lyrics_language: 'en',
            // q_artist: (options.artist) ? options.artist : '',
            //sort by track popularity
            // s_track_rating: true,
        }
    })
        .then(function (lyrics) {
            console.log(`Musix API lyrics:
        ` , lyrics.message.body.lyrics.lyrics_body);

            return lyrics.message.body.lyrics.lyrics_body;

            // console.log("dataRetreived", result.message.body.lyrics.lyrics_body);

        });

        return lyricsUnedited;
        
}


//Giphy
app.giphyRequest = function(artistSearch){  //parameter is relative to the function
    $.ajax ({
        type: 'GET',
        url: app.giphyUrl,
        dataType: 'json',
        data: {
            api_key: app.giphyApiKey,
            q: artistSearch,
            limit: 30,
            rating: 'pg'
        }

    })
    .then(function(result){
       return result;
    })
}



//Data Manipulate Functions

//A utility function used with the getGenre's function
app.makeObjectFromArrays = function (keys, values) {
    const newObject = {};
    for (let i = 0; i < keys.length; i++) {
        newObject[keys[i]] =  values[i];
    }
    return newObject;
}

//Note this function is not used at run time, but we needed to write it to extract the genre-name and genre-id pairings from the track data so that we could use these for the genre-search API request
app.getGenres = function (tracksData) {
    const trackList = tracksData.message.body.track_list;
    const genreArray = [];
    let genreId = [];
    let genreName = [];
    trackList.forEach( (elTrack) => {
        const genreList = elTrack.track.primary_genres.music_genre_list;
        if (genreList.length > 0) {
            genreId.push( genreList[0].music_genre.music_genre_id );
            genreName.push( genreList[0].music_genre.music_genre_name );
        }
    }); //End of forEach
    let genreIdUnique = (new Set(genreId));
    genreIdUnique = Array.from(genreIdUnique);

    let genreNameUnique = (new Set(genreName));
    genreNameUnique = Array.from(genreNameUnique);

    const genreMap = app.makeObjectFromArrays(genreNameUnique, genreIdUnique);
    // console.log(`ids and names`, genreMap);
}



//     - For each API build a get function that takes a parameter object as an argument
//         - Use the parameter object to set the values of the $.ajax parameters
//             - Use a then() method to do something with the returned data(see data processing).

//                 Processing
// --Lyrics getter function to get the lyrics from the object and manipulate the text as needed
// --Process other info like, track name, album, etc for display after the player answers the challenge


// Game Functionality
// --Create a function to randomly generate a lyric challenge
// --Create a function to post the challenge to the page
// --Let them know what player is up
// --Accept user feedback through click or touch
// --Display feedback based on whether they were correct
// --Adjust the score for that player
// 	--Track players with an array of player object.Properties includes score and player name(Stretch goal: have player avatars).

//Document Ready Function
$(function(){
   app.addGenreOptions();

    const musicPromise = app.musixRequest()
        .then( function (result){
            // app.getGenres(result);
        });
    // app.musixRequest(lyricConfig);
    // app.giphyRequest('Eminem');

    // console.log(`promise`, musicPromise);

    //Form event handler
    $('.game-options').on("submit", function (event) {
        event.preventDefault();
       const formValues =  app.getFormSubmit(event);
       console.log(`formvalues: `, formValues);
    });


});


