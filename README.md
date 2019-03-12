# Login

- Can register, signin, and logout.

- Run `npm install` to install dependencies

- Database
	- Edit `/config/config.json` with database details
		- development.username is mysql username
		- development.password is mysql password
		- development.database is database name

- `node server.js` to run
	- Some dependencies might not be installed, I might have forgetten to include them in packages.json. It will tell you what is missing so just do `npm install 'missing_dependency'`
	- If it runs then you can go to `localhost:3000/signup`, `localhost:3000/signin`, `localhost:3000/logout`, `localhost:3000/dashboard`

# Spotify

- Currently only copies all playlist names, songs, and artists to a database
	- Songs in the database are tied to an artist
	- A lot of features are missing
		- Doesn't keep track of what songs are in what playlists
		- Playlists aren't tied to a user
		- If a song has multiple artists it only adds the first
		- etc

- I have to update `package.json` to include dependencies so `npm install` doesn't do anything yet
	- All dependencies will have to be installed manually

- Database
	- Edit `config.js` with database details
		- You need at least one user so you can enter a user manually or uncomment the lines at the bottom of `/models/user.js`

- Add your spotify(https://developer.spotify.com/dashboard/applications) `client_id` and `client_secret` in `index.js`

- `node index.js` to run
	- If it runs then you can go to `localhost:3000/login` and login with your spotify account
		- It will start adding all playlist names, songs, and artists to database tables
