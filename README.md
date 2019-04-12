
# Senior Proj

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

- To run a query for the songs in all playlists:
    ```
    SELECT songs.name "Song", artists.name "Artist", playlists.name "Playlist", users.email "User" FROM songs LEFT JOIN artists ON songs.artist_id = artists.id LEFT JOIN playlist_songs ON songs.id = playlist_songs.song_id LEFT JOIN playlists ON playlist_songs.playlist_id = playlists.id LEFT JOIN users ON playlists.user_id = users.id WHERE playlists.name IS NOT NULL;
    ```
    - Can add `AND playlists.name = "{playlist name}"` to search for a specific playlist or `AND users.email = "{user email}"` to search for a certain user's songs
- Signup with an email/password creating a local account
- Signup with a Google account
- Signin with either local account or Google account when an account has both
- Link a Google account with an existing local account
- Unlink Google account from local account
- Link an existing local account with an existing Google account
    - Removes the record of the existing local account and merges it into the record of the existing Google account

- Clicking the sync spotify button syncs the playlist information to the database(playlist name, # of songs, spotify id)
    - Individual buttons are displayed to sync the playlists
        - Clicking one of these buttons does two things:
            1. Syncs the songs and artists to the appropriate tables
            2. Syncs the song_id and playlist_id to another table to keep track of what songs are in what playlist

- `/youtube` has a youtube search form and an embedded youtube video
    - The page plays a random video in the top 10 trending music videos
    - The youtube search works on the backend but it doesn't update the video being played
    
- To check the songs in a playlist for a user:
    ```
    localhost:3000/api/test2?email=
    ```
    Email defaults to `test@test.com` for testing purposes if no email is specified

- To run a query for the songs in all playlists:
    ```
    SELECT songs.name "Song", artists.name "Artist", playlists.name "Playlist", users.email "User" FROM songs LEFT JOIN artists ON songs.artist_id = artists.id LEFT JOIN playlist_songs ON songs.id = playlist_songs.song_id LEFT JOIN playlists ON playlist_songs.playlist_id = playlists.id LEFT JOIN users ON playlists.user_id = users.id WHERE playlists.name IS NOT NULL;
    ```
    - Can add `AND playlists.name = "{playlist name}"` to search for a specific playlist or `AND users.email = "{user email}"` to search for a certain user's songs

## Issues

- If a song has multiple artists it only syncs the first one
- Can't update the youtube video that is currently being played
- Youtube api limits are pretty restrictive
    - Daily quota is 10,000 requests
        - A search counts as 100 requests
        - Getting the trending videos counts as 1 request, this is at most done once a day since it's stored in the database
    - need to store the youtube video id so we don't have to repeat searches
- Improvements need to be made on link/unlink
    - There's no logic to check if a Google account already belongs to another local account
    - Unlinking should maybe remove the data belonging to the Google account(id, email, name)
