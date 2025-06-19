const test = document.getElementById("dawg")
const gevondenKaarten = document.getElementById("gevondenKaarten")
const startGame = document.getElementById("startgame")


//kleuren
let gamemode = "letters";
let karakter = "*";
let grootte = "4";
let kaartKleur = "#ff7f50"
let openKleur = "#1ec5e5"
let gevondenKleur = "#7af153"

document.getElementById("kaartkleur").value = kaartKleur
document.getElementById("openkleur").value =  openKleur
document.getElementById("gevondenkleur").value = gevondenKleur
document.getElementById("karakter").value = karakter
document.getElementById("grootte").value = grootte
document.getElementById("gamemode").value = gamemode

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

function reset(){
    removeTiles()
    gameTileValues = []
    countTiles = 0
    openTiles = []
    correctTiles = []
    gameTileValues = []
    const tile = document.getElementsByClassName("tile");
    kaartKleur = document.getElementById("kaartkleur").value
    openKleur =  document.getElementById("openkleur").value
    gevondenKleur =  document.getElementById("gevondenkleur").value
    karakter =  document.getElementById("karakter").value
    grootte =  document.getElementById("grootte").value
    gamemode =  document.getElementById("gamemode").value
    gevondenKaarten.innerText = "Gevonden kaarten: " + countTiles
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
}

startGame.addEventListener("click", function () {
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

alphabetTileSetup()