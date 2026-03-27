const backgroundElement = document.querySelector(".background");

function loadImage(url) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = url;

        image.onload = () => resolve(url);
        image.onerror = reject;
    });
}

async function getBackground() {
    const url = `https://picsum.photos/${window.innerWidth}/${window.innerHeight}`;

    try {
        const loadedImageUrl = await loadImage(url);
        return loadedImageUrl;
    } catch(error) {
        console.log(error);
        return null;
    }
}

window.onload = () => {
    getBackground().then((imageUrl) => {
        if (!imageUrl || ! backgroundElement) return;

        backgroundElement.style["background-image"] = `url(${imageUrl})`;
        backgroundElement.classList.add("loaded");
    })
}