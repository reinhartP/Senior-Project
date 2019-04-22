
# Senior Proj

Demo at http://myresinaplex.ddns.net

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

- Signup with an email/password creating a local account
- Signup with a Google account
- Signin with either local account or Google account when an account has both
- Link a Google account with an existing local account
- Unlink Google account from local account
- Link an existing local account with an existing Google account
    - Removes the record of the existing local account and merges it into the record of the existing Google account
### Spotify features
------
- Clicking the sync spotify button authorizes the user's spotify account with our server and gives us the user's access/refresh token
    - Both tokens are stored in the database. The access token expires every hour while the refresh token lasts as long as the user doesn't disconnect their account with our website through spotify.
- Clicking the sync spotify button syncs the playlist information to the database(playlist name, # of songs, spotify id)
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
            - Clicking a suggestion auto submits the form and plays the video
------
- To check the songs in a playlist for a user:
    - Use the search bar at the top of the profiles page
        - Searching with no email entered displays the current users songs
        - If nothing appears after a few seconds then either that email doesn't exist or that user has no songs synced
            - You have to refresh or reopen the page since this causes the server to hang

- To run a query for the songs in all playlists:
    ```
    SELECT songs.name "Song", artists.name "Artist", playlists.name "Playlist", users.email "User" FROM songs LEFT JOIN artists ON songs.artist_id = artists.id LEFT JOIN playlist_songs ON songs.id = playlist_songs.song_id LEFT JOIN playlists ON playlist_songs.playlist_id = playlists.id LEFT JOIN users ON playlists.user_id = users.id WHERE playlists.name IS NOT NULL;
    ```
    - Can add `AND playlists.name = "{playlist name}"` to search for a specific playlist or `AND users.email = "{user email}"` to search for a certain user's songs

## Issues/Improvements

- If a song has multiple artists it only syncs the first one
- We request a new spotify access token every time a user makes a new request to spotify(sync a playlist)
    - Maybe add an access token timer to check age of token before requesting a new one to lower number of spotify api requests
- Add protections when searching for a user's playlists/songs
    - User doesn't exist or user doesn't have anything synced
        - Server currently hangs when these conditions are met requiring page refresh or close/open tab
- Youtube api limits are pretty restrictive
    - Daily quota is 10,000 requests
        - A search counts as 100 requests
        - Getting the trending videos counts as 1 request, this is at most done once a day since it's stored in the database
    - need to store the youtube video id so we don't have to repeat searches
- Pressing enter or add to queue button on the youtube page should clear the form
- Improvements need to be made on link/unlink
    - There's no logic to check if a Google account already belongs to another local account
    - Unlinking should maybe remove the data belonging to the Google account(id, email, name)
- Add a loading indicator when syncing playlists