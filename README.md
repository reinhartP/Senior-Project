
# Senior Proj

## Instructions
- Install packages: `npm install`
- Create a `.env` file and add these lines:
    ```
	PORT=''
	NODE_ENV='development'

	GOOGLE_CLIENT_ID='395161992549-2fiscjq7pmbfmd6il80mnma2ca937v2m.apps.googleusercontent.com'
	GOOGLE_CLIENT_SECRET='X7QOgc3AuRm5N0vhbF3X3bkC'
	GOOGLE_CALLBACK_URL='http:/:3000/auth/google/callback'
	SPOTIFY_CLIENT_ID='e2a3a3a51acc4e19bbe35d1d59494900'
	SPOTIFY_CLIENT_SECRET='c95bafabf2e343efb29a0aa65958ee39'
	SPOTIFY_CALLBACK_URL='http://myresinaplex.ddns.net:3000/spotify/callback'

	YOUTUBE_API_KEY=''

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

- Currently only copies all playlist names, songs, and artists to a database
	- Songs in the database are tied to an artist
	- Songs in a playlist are stored in playlist_songs table
		- playlist_songs stores song_id and playlist_id
	- A lot of features are missing
		- If a song has multiple artists it only adds the first
		- etc

## Issues

- Improvements need to be made on link/unlink
    - There's no logic to check if a Google account already belongs to another local account
    - Unlinking should maybe remove the data belonging to the Google account(id, email, name)
