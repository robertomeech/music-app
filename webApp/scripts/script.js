app = {};

// Form Event
// --Takes values from form submit and translates them into a parameter object for use with API queries

app.getFormSubmit = function (event) {
    const form = event.target;
    
    const artistSearch = $('#artist').val();
    const genreSearch = $('#genre').val();
    
    
    return { //Using ES6 object literal syntax, instead of  {varName: varName}  => {varName}
        artistSearch,
        genreSearch
    }

    // console.log('form submit',$(event.target).serializeArray());
    //  console.log('event.target', event.target);
    //  console.log(`$this`, $(this));
}

app.makeOptionsObject = function (formValues) {

}

// --Genre, decade, artist
//     => Choose Genre or Artist, and optionally decade.If you don’t choose a decade you get recent hits. 
// 		=> With default is the top40 chart. 
// 	--Also ask how long they want to play for, and how many players
// --If there is more than one player, they can put in the player names

// API Requests


app.methods = {
    chart: 'chart.tracks.get',
    lyrics: 'track.lyrics.get',
    track: 'track.search'
}  

const chartConfig = {
    method: app.methods.chart,
    lyrics: true,
    numOfResults: 100
}

const lyricConfig = {
    method: app.methods.lyrics,
    trackId: 149804156
}

//Musix API Info
app.musixUrl = "https://api.musixmatch.com/ws/1.1/";

app.musixApiKey = "0a6e3214ba4afecba8f9ee47cbca8d33";

//Giphy API info
app.giphyUrl = "http://api.giphy.com/v1/gifs/search";
app.giphyApiKey = "gUH1fFCntMG4MW94vqf6UCSWIqCusok1";



app.musixRequest = function(options) { //Options is an object with the config for the request.
    const musixResults = $.ajax({
        type: 'GET',
        url: app.musixUrl + options.method, // OPTIONS MUST INCLUDE METHOD
        dataType: "jsonp",
        jsonpCallback: 'jsonp_callback',
        contentType: 'application/json',
        data: {
            apikey: app.musixApiKey,
            format: 'jsonp',
            callback: 'jsonp_callback',

            //Chart search
            f_has_lyrics: (options.lyrics) ? options.lyrics : '',
            page_size: (options.numOfResults) ? options.numOfResults : '',

            //Lyrics Search
            track_id: (options.trackId) ? options.trackId : '',

            //Track Search
            f_music_genre_id: (options.genreId) ? options.genreId : ''

        }
    })
    .then(function(result){ 
        console.log(`Musix API Result: 
        ` , result);
        
        return result;
        
        // console.log("dataRetreived", result.message.body.lyrics.lyrics_body);

    });

    return musixResults;
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

app.makeMapFromArrays = function (keys, values) {

    const newMap = new Map();

    for (let i = 0; i < keys.length; i++) {

        newMap.set(keys[i], values[i]);

    }

    return newMap;
}


app.getGenres = function (tracksData) {
    const trackList = tracksData.message.body.track_list;
    
    console.log(`tracklist: `, trackList);
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

    const genreMap = app.makeMapFromArrays(genreNameUnique, genreIdUnique);


    console.log(`ids and names`, genreMap);
   
    
    // console.log(genreArray);

    // —forEach
    // element.track.primary_genres.music_genre_list[0].music_genre.music_genre_id


    // element.track.primary_genres.music_genre_list[0].music_genre.music_genre_id.primary_genres.music_genre_list[0].music_genre.music_genre_name
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

$(function(){
    const musicPromise = app.musixRequest(chartConfig)
        .then( function (result){

            app.getGenres(result);
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