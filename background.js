const backgroundElement = document.querySelector(".background");

function loadImage(url) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = url;

        image.onload = () => resolve(url);
        image.onerror = reject;
    });
}

async function saveRandomBackground(url, day) {
    const response = await fetch(url);
    const blob = await response.blob()

    const reader = new FileReader();
    reader.onloadend = () => {
        if (day == "today") {
            localStorage.setItem("todayBackground", reader.result);
        } else if (day == "new") {
            localStorage.setItem("newDayBackground", reader.result);
        }
    };

    reader.readAsDataURL(blob);
}

function getRandomBackgroundUrl() {
    return `https://picsum.photos/${screen.width}/${screen.height}`;
}

function getDateString() {
    const date = new Date();
    return date.toISOString().slice(0,10);
}

async function getBackground() {
    const url = getRandomBackgroundUrl();

    try {
        const loadedImageUrl = await loadImage(url);
        saveRandomBackground(url, "today");
        return loadedImageUrl;
    } catch(error) {
        console.log(error);
        return null;
    }
}

window.onload = () => {
    const todayBackground = localStorage.getItem("todayBackground");
    const newDayBackground = localStorage.getItem("newDayBackground");
    
    if (todayBackground) {
        backgroundElement.style["background-image"] = `url(${todayBackground})`;
        
        const currentDay = localStorage.getItem("currentDay");
        if (currentDay) {
            if (currentDay != getDateString()) {
                if (newDayBackground) {
                    backgroundElement.style["background-image"] = `url(${newDayBackground})`;
                    localStorage.setItem("todayBackground", newDayBackground);
                }
                
                backgroundElement.classList.add("preloaded");
                saveRandomBackground(getRandomBackgroundUrl(), "new");
            } else {
                backgroundElement.classList.add("preloaded");
                if (!newDayBackground) saveRandomBackground(getRandomBackgroundUrl(), "new");
            }
        }
    } else {
        getBackground().then((imageUrl) => {
            if (!imageUrl || ! backgroundElement) return;

            backgroundElement.style["background-image"] = `url(${imageUrl})`;
            backgroundElement.classList.add("loaded");

            saveRandomBackground(getRandomBackgroundUrl(), "new");
        });
    }

    localStorage.setItem("currentDay", getDateString());
}