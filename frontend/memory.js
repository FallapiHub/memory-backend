const test = document.getElementById("dawg");
const gevondenKaarten = document.getElementById("gevondenKaarten");
const startGame = document.getElementById("startgame");
const jwtData = localStorage.getItem("jwt");
const token = jwtData ? JSON.parse(jwtData).token : null;
const timer = document.getElementById("timer");

let id;

let gamemode = "letters";
let karakter = "*";
let grootte = "4";
let kaartKleur = "#ff7f50";
let openKleur = "#1ec5e5";
let gevondenKleur = "#7af153";
document.getElementById("openkleur").value = openKleur;
document.getElementById("karakter").value = karakter;
document.getElementById("grootte").value = grootte;



let alphabet= [
    'a',    'a',
    'b',    'b',
    'c',    'c',
    'd',    'd',
    'e',    'e',
    'f',    'f',
    'g',    'g',
    'h',    'h',
    'i',    'i',
    'j',    'j',
    'k',    'k',
    'l',    'l',
    'm',    'm',
    'n',    'n',
    'o',    'o',
    'p',    'p',
    'q',    'q',
    'r',    'r',
    's',    's',
    't',    't',
    'u',    'u',
    'v',    'v',
    'w',    'w',
    'x',    'x',
    'y',    'y',
    'z',    'z',
];
let cats = [];

function getCatApi(){
    cats = [];
    const random = Math.floor(Math.random() * (50));
    const limit = (grootte**2)/2;
    fetch('https://cataas.com/api/cats?limit='+limit+'&skip=' + random)
        .then(response => response.json())
        .then(data => {
            data.forEach((cat) => {
                cats.push(`https://cataas.com/cat/${cat.id}?type=square`)
                cats.push(`https://cataas.com/cat/${cat.id}?type=square`)
            })
            //test.innerHTML = cats;
            catTileSetup();
        })
        .catch(error => console.log(error));
}


let countTiles = 0
let openTiles = []
let correctTiles = []
let gameTileValues= []
let boardTiles = []




function boardCreator(size){
    size = parseInt(size, 10)
    const board = document.getElementById("board");

    if(size===2){
        board.style.gridTemplateColumns = "1fr 1fr";
    }
    else if(size===4){
        board.style.gridTemplateColumns = "1fr 1fr 1fr 1fr";
    }
    else if(size===6){
        board.style.gridTemplateColumns = "1fr 1fr 1fr 1fr 1fr 1fr";
    }

    board.innerHTML = "";
    size=size**2;
    for(let i = 0; i < size; i++){
        const tileDiv = document.createElement("div");
        tileDiv.classList.add("tile");
        tileDiv.style.backgroundColor = kaartKleur;
        board.appendChild(tileDiv);
    }
    getTopScores();
}

function getTopScores(){
    fetch('http://localhost:8000/memory/top-scores', {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
    })
        .then(resp => {
            if (!resp.ok) {
                throw new Error("Kan top-scores niet krijgen");
            }
            return resp.json();
        })
        .then(json => {
            const list = document.getElementById("top-scores");
            list.innerHTML = "";
            console.log(json)

            for (let i = 0; i < json.length; i++) {
                const score = document.createElement("ul");
                score.innerText = `${i + 1}. ${json[i].username} ${json[i].score}`;
                list.appendChild(score);
                if(i === 4){
                    return
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function boardTileSlice(size){
    size=size**2;
    boardTiles = alphabet.slice(0, size);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const random = Math.floor(Math.random() * (i + 1));
        [array[i], array[random]] = [array[random], array[i]];
    }
    return array;
}

let startTime;
let stopwatchInterval;
let elapsedTime = 0;

function startTimer() {
    if (!stopwatchInterval) {
        startTime = new Date().getTime();
        stopwatchInterval = setInterval(updateTimer, 1000);
    }
}

function stopTimer() {
    clearInterval(stopwatchInterval);
    stopwatchInterval = null;
}

function updateTimer() {
    let currentTime = new Date().getTime();
    elapsedTime = currentTime - startTime;
    let seconds = Math.floor(elapsedTime / 1000);
    timer.innerHTML = "Verlopen tijd: " + seconds;
}

function hasWon(){
    if(countTiles === grootte*grootte){
        test.innerText="je hebt gewonnen"
        stopTimer()
        let score = elapsedTime / 100;
        test.innerText="won" + score;

        //curl -X POST -d '{"id":3,"score":131,"api":"clouds","color_found":"blue", "color_closed":"black" }' localhost:8000/game/save
        fetch('http://localhost:8000/game/save', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({"id":id, "score":score, "api":gamemode, "color_found":gevondenKleur, "color_closed": kaartKleur }),
        })
            .then(async resp => {
                if (!resp.ok) {
                    throw new Error("Spelscore opslaan mislukt");
                }
                console.log(resp)


            })
            .catch(error => {
                console.error('Error:', error);

            });
    }

}


async function reset(){
    stopTimer()
    timer.innerHTML = "Verlopen tijd: 0";

    removeTiles()
    gameTileValues = []
    countTiles = 0
    openTiles = []
    correctTiles = []
    gameTileValues = []
    const tile = document.getElementsByClassName("tile");

    gevondenKaarten.innerText = "Gevonden kaarten: " + countTiles
    try{
        const resp = await fetch('http://localhost:8000/player/preferences', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Accept': 'application/json'
            },
        });
        if (!resp.ok) {
            throw new Error("Kan preferences niet krijgen");
        }
        const json = await resp.json();
        console.log(json)

        if (json.preferred_api !== "" && json.color_found !== "" && json.color_closed !== "") {
            gamemode = json.preferred_api;
            gevondenKleur = json.color_found;
            kaartKleur = json.color_closed;
        }

        openKleur = document.getElementById("openkleur").value;
        karakter = document.getElementById("karakter").value;
        grootte = document.getElementById("grootte").value;

        document.getElementById("kaartkleur").value = kaartKleur
        document.getElementById("gevondenkleur").value = gevondenKleur
        document.getElementById("gamemode").value = gamemode
        document.getElementById("openkleur").value = openKleur
        document.getElementById("karakter").value = karakter
        document.getElementById("grootte").value = grootte

        for  (let i = 0; i < tile.length; i++) {
            tile[i].style.backgroundColor = kaartKleur
        }

        if(gamemode === "cats"){
            getCatApi()
        }
        else if(gamemode === "letters"){
            alphabetTileSetup()
        }
        else{
            alphabetTileSetup()
        }

    }catch (error){
        console.error('Error:', error);
        alphabetTileSetup()

    }

}

function setPreferences(){
    //curl -v -H @player_token -X POST -d '{"id":1,"api":"dogs","color_found":"#ff0","color_closed":"#0ff"}' localhost:8000/player/preferences
    kaartKleur = document.getElementById("kaartkleur").value
    openKleur =  document.getElementById("openkleur").value
    gevondenKleur =  document.getElementById("gevondenkleur").value
    gamemode =  document.getElementById("gamemode").value


    fetch('http://localhost:8000/player/preferences', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"api":gamemode, "color_found":gevondenKleur, "color_closed": kaartKleur }),
    })
        .then(async resp => {
            if (!resp.ok) {
                throw new Error("preferences aanpassen mislukt");
            }
            console.log(resp)

            const raw = await resp.text();

            if (raw){
                return JSON.parse(raw);
            } else{
                return null;
            }
        })
        .then(json => {
            console.log(json)
        })
        .catch(error => {
            console.error('Error:', error);

        });
}


startGame.addEventListener("click", function () {
    setPreferences()
    reset()
})


function checkAlphabetTiles(){
    let TileA = openTiles[0]
    let TileB = openTiles[1]

    if(TileA.innerText == TileB.innerText){
        correctTiles.push(TileA)
        correctTiles.push(TileB)
        TileA.style.backgroundColor = gevondenKleur
        TileB.style.backgroundColor = gevondenKleur
        countTiles = countTiles + 2
        gevondenKaarten.innerText = "Gevonden kaarten: " + countTiles
        hasWon()
    }
    else{

        TileA.style.backgroundColor = kaartKleur
        TileB.style.backgroundColor = kaartKleur
        TileA.innerText = karakter
        TileB.innerText = karakter
    }
    openTiles.shift();
    openTiles.shift();

}

function openAlphabetTile(obj) {
    if(!openTiles.includes(obj) && !correctTiles.includes(obj)){
        openTiles[openTiles.length] = obj
        if (openTiles.length===2){
            obj.style.backgroundColor = openKleur;

            const tile = gameTileValues.find(tile => tile[0] === obj);
            obj.innerText = tile[1];


            setTimeout(checkAlphabetTiles, 1000)

        }
        else{
            obj.style.backgroundColor = openKleur;

            const tile = gameTileValues.find(tile => tile[0] === obj);
            obj.innerText = tile[1];

        }

    }

}




function checkCatTiles(){
    let TileA = openTiles[0]
    let TileB = openTiles[1]

    const A = gameTileValues.find(tile => tile[0] === TileA);
    const B = gameTileValues.find(tile => tile[0] === TileB);



    if(A[1] === B[1]){
        correctTiles.push(TileA)
        correctTiles.push(TileB)
        countTiles = countTiles + 2

        gevondenKaarten.innerText = "Gevonden kaarten: " + countTiles
        hasWon()

    }
    else{

        TileA.style.backgroundColor = kaartKleur
        TileB.style.backgroundColor = kaartKleur
        TileA.style.backgroundImage = null;
        TileB.style.backgroundImage = null;
        TileA.innerText = karakter
        TileB.innerText = karakter
    }
    openTiles.shift();
    openTiles.shift();

}

function openCatTile(obj){
    const tile = document.getElementsByClassName("tile");
    if(!openTiles.includes(obj) && !correctTiles.includes(obj)){
        openTiles[openTiles.length] = obj
        if (openTiles.length>=2){
            const tile = gameTileValues.find(tile => tile[0] === obj);
            obj.innerText = "";
            obj.style.backgroundImage = "url(" + tile[1] + ")";




            setTimeout(checkCatTiles, 1000)

        }
        else{

            obj.innerText = "";
            const tile = gameTileValues.find(tile => tile[0] === obj);
            obj.style.backgroundImage = "url(" + tile[1] + ")";



        }

    }

}

function catTileSetup(){
    boardCreator(grootte)
    const tile = document.getElementsByClassName("tile");
    shuffleArray(cats);
    for  (let i = 0; i < tile.length; i++) {
        gameTileValues.push([tile[i], cats[i]]);
        const handler = clickCatHandler.bind(tile[i], i);

        handlers[i] = handler;

        tile[i].addEventListener("click", handler);

        tile[i].innerText = karakter;
        tile[i].style.backgroundColor = kaartKleur
    }
    startTimer()
}

function alphabetTileSetup(){
    boardTileSlice(grootte)
    boardCreator(grootte)
    const tile = document.getElementsByClassName("tile");
    shuffleArray(boardTiles);
    for  (let i = 0; i < tile.length; i++) {
        gameTileValues.push([tile[i], boardTiles[i]]);
        const handler = clickAlphabetHandler.bind(tile[i], i);

        handlers[i] = handler;

        tile[i].addEventListener("click", handler);

        tile[i].innerText = karakter;
        tile[i].style.backgroundColor = kaartKleur
    }
    startTimer()
}


function clickCatHandler(i){
    openCatTile(this);
}

function clickAlphabetHandler(i){
    openAlphabetTile(this);
}

const handlers = [];


function removeTiles(){
    const tile = document.getElementsByClassName("tile");
    for  (let i = 0; i < tile.length; i++) {
        if (handlers[i]) {
            tile[i].removeEventListener("click", handlers[i]);
        }
    }
    handlers.length = 0;
}
fetch('http://localhost:8000/player', {
    method: 'GET',
    headers: {
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/json'
    },
})
    .then(resp => {
        if (!resp.ok) {
            throw new Error("je bent niet ingelogd");
        }
        return resp.json();
    })
    .then(json => {
        console.log(json)
        id = json.id;
        reset()
    })
    .catch(error => {
        console.error('Error:', error);
        window.location.href = 'index.html';

    });