const quoteElement = document.querySelector(".quote");

let savedQuote = localStorage.getItem("quote");
let savedQuoteAccssedDay = parseInt(localStorage.getItem("quoteAccessedDay"));

async function getQuote() {
    const url = `https://api.allorigins.win/get?url=${encodeURIComponent("https://zenquotes.io/api/today")}`
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error fetching quote: ` + response.status);
        }

        const result = await response.json();
        const data = JSON.parse(result.contents);
        return data[0];

    } catch (error) {
        console.log(error.message)
        return null;
    }
}

async function setQuote() {
    const quoteData = await getQuote();
    if (!quoteData) {
        return;
    }

    savedQuote = JSON.stringify(quoteData);
    localStorage.setItem("quote", savedQuote);
    const date = new Date();
    savedQuoteAccssedDay = date.getUTCDay();
    localStorage.setItem("quoteAccessedDay", date.getUTCDay());

    quoteElement.innerHTML = `"${quoteData.q}" <br> &mdash; ${quoteData.a}`;
    quoteElement.classList.add("show");
}

if (savedQuote && savedQuoteAccssedDay) {
    const date = new Date()
    if (savedQuoteAccssedDay == date.getUTCDay()) {
        const quoteData = JSON.parse(savedQuote);
        quoteElement.innerHTML = `"${quoteData.q}" <br> &mdash; ${quoteData.a}`;
        quoteElement.classList.add("preshow");
    } else {
        setQuote();
    }
} else {
    setQuote();
}