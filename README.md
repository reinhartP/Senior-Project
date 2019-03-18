
# Senior Proj

## Instructions
- Install packages: `npm install`
- Create a `.env` file and add these lines:
    ```
    PORT=''
    NODE_ENV='development'

    GOOGLE_CLIENT_ID=''
    GOOGLE_CLIENT_SECRET=''
    GOOGLE_CALLBACK_URL=''
    SPOTIFY_CLIENT_SECRET=''
    SPOTIFY_CLIENT_ID=''
    SPOTIFY_CALLBACK_URL=''

    YOUTUBE_API_KEY=''

    DATABASE_USERNAME=''
    DATABASE_PASSWORD=''
    DATABASE_NAME=''
    DATABASE_HOST=''
    ```
- Launch: `node server.js`
- Visit in your browser at `http://localhost:3000`

## Usage

- Signup with an email/password creating a local account
- Signup with a Google account
- Signin with either local account or Google account when an account has both
- Link a Google account with an existing local account
- Unlink Google account from local account
- Link an existing local account with an existing Google account
    - Removes the record of the existing local account and merges it into the record of the existing Google account
    
- Currently only copies all playlist names, songs, and artists to a database
	- Songs in the database are tied to an artist
	- A lot of features are missing
		- Doesn't keep track of what songs are in what playlists
		- Playlists aren't tied to a user
		- If a song has multiple artists it only adds the first
		- etc

## Issues

- Improvements need to be made on link/unlink
    - There's no logic to check if a Google account already belongs to another local account
    - Unlinking should maybe remove the data belonging to the Google account(id, email, name)
