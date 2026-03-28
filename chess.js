const chessConfirmUsernameElement = document.querySelector(".chess-username-button");
const chessUsernameInputElement = document.querySelector("#chess-username-input");

const chessLinkElement = document.querySelector(".chess-logo-link");

const chessUsernameElement = document.querySelector(".chess-username");

const chessDataElement = document.querySelector(".chess-data");

const chessGameIconElement = document.querySelector(".chess-game-icon");
const chessRatingElement = document.querySelector(".chess-rating");
const chessWinDrawLossRecordElement = document.querySelector(".chess-win-draw-loss-record");

const modes = ["chess_daily", "chess_rapid", "chess_bullet", "chess_blitz"];
const iconsMapping = {
    "chess_daily": "icons/chess/daily.svg",
    "chess_rapid": "icons/chess/rapid.svg",
    "chess_bullet": "icons/chess/bullet.svg", 
    "chess_blitz": "icons/chess/blitz.svg"
};

let savedChessUsername = localStorage.getItem("chessUsername");
let savedChessData = localStorage.getItem("chessData");
let savedChessAccessed = parseInt(localStorage.getItem("chessDataAccessed"));

let chessUsername;
if (savedChessUsername) {
    chessUsername = savedChessUsername;
    showChessData();
} else {
    chessUsernameElement.classList.add("preshow");
}

chessConfirmUsernameElement.addEventListener("click", () => {
    chessUsernameElement.classList.remove("show");
    chessUsernameElement.classList.remove("preshow");
    chessUsername = chessUsernameInputElement.value.trim();

    showChessData();
});

async function showChessData() {
    let returnedChessData = await getChessData();
    if (!returnedChessData) {
        chessUsernameElement.classList.add("show");
        chessLinkElement.href = "chess.com/home";
        return;
    }

    localStorage.setItem("chessDataAccessed", Date.now());
    savedChessAccessed = Date.now();
    localStorage.setItem("chessData", JSON.stringify(returnedChessData));
    savedChessData = JSON.stringify(returnedChessData);
    if (savedChessUsername != chessUsername) {
        savedChessUsername = chessUsername;
        localStorage.setItem("chessUsername", chessUsername);
    }

    const playedModes = modes.filter(mode => returnedChessData[mode] && returnedChessData[mode].last);

    if (playedModes.length == 0) {
        chessUsernameElement.classList.add("show");
        return;
    }

    playedModes.sort((a, b) => {
        const gamesA = returnedChessData[a].record.win + returnedChessData[a].record.loss + (returnedChessData[a].record.draw || 0);
        const gamesB = returnedChessData[b].record.win + returnedChessData[b].record.loss + (returnedChessData[b].record.draw || 0);
        return gamesB - gamesA;
    });

    let chessMode = playedModes[0];

    chessRatingElement.textContent = returnedChessData[chessMode]["last"]["rating"];

    const record = returnedChessData[chessMode].record;
    const totalGames = record.win + (record.draw || 0) + record.loss;

    const winPercentage = (record.win / totalGames) * 100;
    const drawPercentage = ((record.draw || 0) / totalGames) * 100;
    const lossPercentage = (record.loss / totalGames) * 100;

    chessGameIconElement.src = iconsMapping[chessMode];

    chessWinDrawLossRecordElement.querySelector(".win").style.flex = winPercentage;
    chessWinDrawLossRecordElement.querySelector(".draw").style.flex = drawPercentage;
    chessWinDrawLossRecordElement.querySelector(".loss").style.flex = lossPercentage;

    chessWinDrawLossRecordElement.querySelector(".win").dataset.tooltip = `Wins: ${record.win}/${totalGames} (${Math.floor(winPercentage)}%)`;
    chessWinDrawLossRecordElement.querySelector(".draw").dataset.tooltip = `Draws: ${record.draw || 0}/${totalGames} (${Math.floor(drawPercentage)}%)`;
    chessWinDrawLossRecordElement.querySelector(".loss").dataset.tooltip = `Losses: ${record.loss}/${totalGames} (${Math.floor(lossPercentage)}%)`;

    chessDataElement.classList.add("show");
    chessLinkElement.href = `https://www.chess.com/member/${chessUsername}`;
}

async function getChessData() {
    if (chessUsername == savedChessUsername && savedChessData && savedChessAccessed) {
        if (Date.now() - parseInt(savedChessAccessed) < 3600000) {
            return JSON.parse(savedChessData);
        }
    }
    const url = `https://api.chess.com/pub/player/${chessUsername}/stats`;
    try {
        response = await fetch(url);
        if (!response.ok) {
            throw new Error("Failed to fetch chess data: " + response.status);
        }
        const result = await response.json();
        return result;
    } catch (error) {
        console.log(error.message);
        return null;
    }
}