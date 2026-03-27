    const timeElement = document.querySelector(".time");
    let dateObject = new Date();

    let totalMilliseconds = Math.floor(dateObject.getTime() - 60000 * dateObject.getTimezoneOffset());
    let minutes = Math.floor((totalMilliseconds/60000)%60);
    let hours = Math.floor((totalMilliseconds/(3600000))%12);

    timeElement.textContent = (hours == 0 ? "12" : (hours.toString().padStart(2, "0"))) + ":" + minutes.toString().padStart(2, "0");

    let millisecondsUntilNextMinute = 60000 - totalMilliseconds%60000;

    setTimeout(() => {
        minutes++;
        if (minutes >= 60) {
            minutes = minutes%60;
            hours++;
            if (hours >= 12) {
                hours = hours%12;
            }
        }
        timeElement.textContent = (hours == 0 ? "12" : hours.toString().padStart(2, "0")) + ":" + minutes.toString().padStart(2, "0");

        setInterval(() => {
            minutes++;
            if (minutes >= 60) {
                minutes = minutes%60;
                hours++;
                if (hours >= 12) {
                    hours = hours%12;
                }
            }
            timeElement.textContent = (hours == 0 ? "12" : hours.toString().padStart(2, "0")) + ":" + minutes.toString().padStart(2, "0");
        }, 60000);
    }, millisecondsUntilNextMinute);