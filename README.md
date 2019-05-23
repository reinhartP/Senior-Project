
# Senior Proj

Demo at https://paghunie.com

## Instructions
- Install packages: `npm install`
- Create a `.env` file and add these lines:
    ```
    PORT=''
    NODE_ENV='development'

    GOOGLE_CLIENT_ID='395161992549-2fiscjq7pmbfmd6il80mnma2ca937v2m.apps.googleusercontent.com'
    GOOGLE_CLIENT_SECRET='X7QOgc3AuRm5N0vhbF3X3bkC'
    GOOGLE_CALLBACK_URL='http://myresinaplex.ddns.net:3000/auth/google/callback'
    SPOTIFY_CLIENT_ID='e2a3a3a51acc4e19bbe35d1d59494900'
    SPOTIFY_CLIENT_SECRET='c95bafabf2e343efb29a0aa65958ee39'
    SPOTIFY_CALLBACK_URL='http://myresinaplex.ddns.net:3000/spotify/callback'

    YOUTUBE_API_KEY='AIzaSyAo9zkL3zMd2aD2VmhJ_fW-5joc_8yCG8Y'

    DATABASE_USERNAME='seniorProj'
    DATABASE_PASSWORD='cppseniorproj'
    DATABASE_NAME='spotifydb'
    DATABASE_HOST='cppseniorproj.cpcd4bxgigxr.us-west-1.rds.amazonaws.com'
    ```
- Launch: `node server.js`
- Visit in your browser at `http://localhost:3000`

## Usage
### Authorization features
---

- Signup with an email/username/password creating a local account
### Spotify features
------
- Clicking the sync spotify button authorizes the user's spotify account with our server and gives us the user's access/refresh token
    - Both tokens are stored in the database. The access token expires every hour while the refresh token lasts as long as the user doesn't disconnect their account with our website through spotify.
- The sync spotify button changes to update playlists once the spotify accounnt is authorized. This button syncs the playlist information to the database(playlist name, # of songs, spotify id)
    - Individual buttons are displayed to sync the playlists
        - Clicking one of these buttons does two things:
            1. Syncs the songs and artists to the appropriate tables
            2. Syncs the song_id and playlist_id to another table to keep track of what songs are in what playlist
### Youtube features
------
- `/youtube` has a youtube search form and an embedded youtube video
    - The page by default plays a random video in the top 10 trending music videos
    - Searching for a song adds it to a queue
        - Video changes when song ends or when next song button is pressed
        - Real time suggestions by querying our database
            - Can only give suggestion if the song is in the database but you can still search for a song even if it doesn't give a suggestion
------
- To check the songs in a playlist for a user:
    - Use the search bar at the top of the profiles page
        - Searching with no email entered displays the current users songs

- BACKEND QUERY: To run a query for the songs in all playlists:
    ```
    SELECT songs.name "Song", artists.name "Artist", playlists.name "Playlist", users.email "User" FROM songs LEFT JOIN artists ON songs.artist_id = artists.id LEFT JOIN playlist_songs ON songs.id = playlist_songs.song_id LEFT JOIN playlists ON playlist_songs.playlist_id = playlists.id LEFT JOIN users ON playlists.user_id = users.id WHERE playlists.name IS NOT NULL;
    ```
    - Can add `AND playlists.name = "{playlist name}"` to search for a specific playlist or `AND users.email = "{user email}"` to search for a certain user's songs

## Issues/Improvements

- Create rooms with socket.io
- Queue songs from playlists on the youtube page
- If a song has multiple artists it only syncs the first one
- We request a new spotify access token every time a user makes a new request to spotify(sync a playlist)
    - Maybe add an access token timer to check age of token before requesting a new one to lower number of spotify api requests
- Add protections when searching for a user's playlists/songs
- Youtube api limits are pretty restrictive
    - Daily quota is 10,000 requests
        - A search counts as 100 requests
        - Getting the trending videos counts as 1 request, this is at most done once a day since it's stored in the database
    - Currently all searches are cached in a table and repeat searches use the etag to verify if the results are the same
        - there's sometimes false negatives with the etag where the result is the same but a different etag is provided
            - in this case we end up doing a new search using up 100 requests
        - need to store the youtube video id so we don't have to repeat searches
- Pressing enter or on the youtube page search should  submit the form and clear the form
- Add a loading indicator when syncing playlists
