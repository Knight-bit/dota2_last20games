require('dotenv').config();
const path 			= require('path')
const axios			= require('axios').default;
const express 		= require('express');
const bodyParser 	= require('body-parser');
const cors 			= require('cors');
const app 			= express();
const PORT 			= process.env.PORT;
const STEAM_API 	= process.env.STEAM_API;
const MATCH_HISTORY = process.env.MATCH_HISTORY;
const MATCH_DETAIL 	= process.env.MATCH_DETAIL;

app.use(bodyParser.json()); //Hace posible acceder a json api
app.use(cors());
app.use("/image", express.static('static/image'));
app.use(express.static(path.join(__dirname, 'build')));



app.use((req, res, next) => {
	let date = new Date()
	process.stdout.write(`[${date.getHours()}:${date.getMinutes() + 1}:${date.getSeconds()}] `);
	next();
})



//Si tiene parametros, devolvelos para que la consuma la api, sino, vacio
const get_params = (query) => {
	let params = "";
	if(Object.entries(query).length !== 0) {
		for(const element in query){
			params += `&${element}=${query[element]}`
		}
		return params;
	}else {
		return params;
	}
}

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'build', 'index.html'))
})


//Aca hacemos los pedidos de las partidas
app.get('/match_history', async (req, res) => {
	//Query for 'hero_id','game_mode','skill','account_id'
	console.log("Query from match history" )
	const params = get_params(req.query) + "&"; 
    const game_mode = "game_mode=1&skill=3"
	axios.get(`${MATCH_HISTORY}?key=${STEAM_API}${params}${game_mode}`).then((data) =>{
		const length = data.data.result.matches.length
		const datos = data.data.result.matches.splice(length - 21 , length - 1);
		return res.json(datos);
	}).catch(err => {
		return res.json(err);
	})
})

app.get('/match_detail', async (req, res) =>{
	//Query with the match_id
	let params = get_params(req.query);
	if(params === "") params = "&match_id=6066259018";
	console.log("Query from match detail " + params);
	axios.get(`${MATCH_DETAIL}?key=${STEAM_API}${params}`).then(data => {
		const datos = data.data.result;
		return res.json(datos);
	}).catch(err => {
		return res.json(err);
	})
})

app.use((req, res, next) => {
	console.log("");
	next();
})

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`)
})
