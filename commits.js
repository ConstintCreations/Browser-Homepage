const githubConfirmUsernameElement = document.querySelector(".github-username-button");
const githubUsernameInputElement = document.querySelector("#github-username-input");

const githubRepoLinkElement = document.querySelector(".github-logo-link");

const githubUsernameElement = document.querySelector(".github-username");
const commitTracker = document.querySelector(".commit-tracker");

const lastCommitsElement = document.querySelector(".last-commits");

let isFresh = false;

let savedGithubUsername = localStorage.getItem("githubUsername");
let savedCommitHistory = localStorage.getItem("githubCommitHistory");
let savedCommitHistoryAccessTime = parseInt(localStorage.getItem("commitHistoryAccessed"));

let githubUsername;
if (savedGithubUsername) {
    githubUsername = savedGithubUsername;
    showCommitHistory();
} else {
    githubUsernameElement.classList.add("preshow");
}

githubConfirmUsernameElement.addEventListener("click", () => {
    githubUsernameElement.classList.remove("show");
    githubUsernameElement.classList.remove("preshow");
    const githubUsernameRegex = (/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i);
    if (githubUsernameRegex.test(githubUsernameInputElement.value.trim())) {
        githubUsername = githubUsernameInputElement.value.trim();
    }

    showCommitHistory();
});

function getLastTwoWeeksOfCommits(events) {
    let commitsPerDay = {};

    events.forEach(event => {
        if (event["type"] == "PushEvent") {
            const date = event["created_at"].slice(0, 10);
            commitsPerDay[date] = (commitsPerDay[date] || 0) + 1;
        }
    });

    const lastTwoWeeksOfCommits = [];
    const today = new Date();

    for (let i = 13; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);

        const key = date.toISOString().slice(0, 10);
        lastTwoWeeksOfCommits.push(commitsPerDay[key] || 0);
    }

    return lastTwoWeeksOfCommits;
}

function assignCommitLevels(lastCommits) {
    const boxes = lastCommitsElement.querySelectorAll(".commit-box");

    const maxCommits = Math.max(...lastCommits);

    const today = new Date();

    boxes.forEach((box, index) => {
        const commitCount = lastCommits[index];

        box.classList.remove("level-1", "level-2", "level-3", "level-4");

        if (commitCount > 0) {
            if (maxCommits <= 4) {
                box.classList.add(`level-${commitCount}`);
            } else {
                const proportionalLevel = Math.ceil((commitCount / maxCommits) * 4);
                box.classList.add(`level-${proportionalLevel}`);
            }
        }

        
        const date = new Date();
        date.setDate(today.getDate() - (13 - index));

        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();

        box.dataset.tooltip = `${commitCount} commit${commitCount == 1 ? "" : "s"} on ${month}-${day}-${year}`;
    });
}

async function showCommitHistory() {
    let returnedCommitHistory = await getCommitHistory();
    if (!returnedCommitHistory) {
        githubUsernameElement.classList.add("show");
        githubRepoLinkElement.href = "https://github.com/repos?q=owner%3A%40me+sort%3Aupdated";
        return;
    }

    localStorage.setItem("commitHistoryAccessed", Date.now());
    savedCommitHistoryAccessTime = Date.now();
    if (savedGithubUsername != githubUsername) {
        savedGithubUsername = githubUsername;
        localStorage.setItem("githubUsername", githubUsername);
    }


    let lastTwoWeeksOfCommits;

    if (isFresh) {
        lastTwoWeeksOfCommits = getLastTwoWeeksOfCommits(returnedCommitHistory);
    } else {
        lastTwoWeeksOfCommits = returnedCommitHistory;
    }
    
    savedCommitHistory = lastTwoWeeksOfCommits;
    localStorage.setItem("githubCommitHistory", JSON.stringify(lastTwoWeeksOfCommits));

    assignCommitLevels(lastTwoWeeksOfCommits);

    commitTracker.classList.add("show");
    githubRepoLinkElement.href = `https://github.com/${githubUsername}?tab=repositories`;
}

async function getCommitHistory() {
    if (githubUsername == savedGithubUsername && savedCommitHistory && savedCommitHistoryAccessTime) {
        if (Date.now() - parseInt(savedCommitHistoryAccessTime) < 3600000) {
            isFresh = false;
            return JSON.parse(savedCommitHistory);
        }
    }
    const url = `https://api.github.com/users/${githubUsername}/events?per_page=100`;
    try {
        response = await fetch(url);
        if (!response.ok) {
            throw new Error("Failed to fetch commit history: " + response.status);
        }
        const result = await response.json();
        isFresh = true;
        return result;
    } catch (error) {
        console.log(error.message);
        return null;
    }
}