/* =====================================================
   DATE PLAN
===================================================== */

const datePlan = {

    response: null,

    vibe: null,

    food: null,

    activity: null,

    time: null,

    date: null

};


/* =====================================================
   SCREEN CONTROL
===================================================== */

let currentScreen = 1;


function showScreen(number) {

    document.querySelectorAll(".screen").forEach(screen => {

        screen.classList.remove("active");

    });


    const next = document.getElementById(`screen${number}`);

    if (next) {

        next.classList.add("active");

        currentScreen = number;

    }

}


/* =====================================================
   NEXT SCREEN
===================================================== */

function nextScreen() {

    showScreen(currentScreen + 1);

}


/* =====================================================
   YES / NO
===================================================== */

let noAttempts = 0;


/*
   Escalating commentary every time the NO button
   gets clicked. Runs out of patience on purpose.
*/

const noMessages = [

    "wait, really? 😭",

    "the button is judging you right now",

    "I built an entire website for this, c'mon",

    "okay, the NO button is now legally required to run",

    "it's giving main character energy (the running, not the 'no')",

    "at this point clicking YES is just less exercise",

    "the NO button has left the chat. only YES remains."

];


function answerYes() {

    datePlan.response = "YES";

    burstConfetti();

    showScreen(3);

}


/*
   Hover-dodging only makes sense on devices with a
   real mouse. Touch screens have no hover state, so
   we skip that trick there and just let the button
   dodge on tap instead, which works everywhere.
*/

const hasHover =
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;


function answerNo() {

    noAttempts++;

    const message = document.getElementById("funnyMessage");

    const button = document.getElementById("noButton");


    const index = Math.min(noAttempts, noMessages.length) - 1;

    message.textContent = noMessages[index];


    /*
       After every attempt, the NO button hops to a
       new spot. Works the same on mouse and touch.
    */

    dodgeButton(button);


    /*
       Past attempt 3, on mouse devices only, it also
       dodges the cursor on hover, before it can even
       be clicked.
    */

    if (hasHover && noAttempts >= 3 && !button.dataset.dodging) {

        button.dataset.dodging = "true";

        button.addEventListener("mouseenter", () => dodgeButton(button));

    }

}


function dodgeButton(button) {

    /*
       Keep the dodge within a safe range so the
       button never jumps off-screen on small
       phone widths.
    */

    const maxX = Math.min(80, window.innerWidth * 0.22);

    const maxY = Math.min(50, window.innerHeight * 0.08);

    const x = Math.random() * maxX * 2 - maxX;

    const y = Math.random() * maxY * 2 - maxY;

    button.style.transform =
        `translate(${x}px, ${y}px)`;

}


/* =====================================================
   OPTION SELECTION
===================================================== */

function selectOption(type, value, element) {

    /*
       Save the answer
    */

    datePlan[type] = value;


    /*
       Remove selected state from buttons
       on the current screen.
    */

    const currentScreenElement =
        document.getElementById(`screen${currentScreen}`);


    currentScreenElement
        .querySelectorAll(".option, .time-option, .date-option")
        .forEach(button => {

            button.classList.remove("selected");

        });


    /*
       Highlight selected option
    */

    element.classList.add("selected");


    /*
       Small delay makes the interaction
       feel smoother.
    */

    setTimeout(() => {

        /*
           If the user selected the date,
           show the final summary.
        */

        if (type === "date") {

            showSummary();

        }

        else {

            nextScreen();

        }

    }, 250);

}


/* =====================================================
   GENERATE DATES
===================================================== */

function generateDates() {

    const container =
        document.getElementById("dateOptions");


    container.innerHTML = "";


    /*
       Fixed range: Saturday Aug 22 through
       Tuesday Aug 25, 2026.
    */

    const dayNumbers = [22, 23, 24, 25];


    for (let i = 0; i < dayNumbers.length; i++) {

        const date = new Date(2026, 7, dayNumbers[i]);

        // Month is 0-indexed, so 7 = August.


        const weekday =
            date.toLocaleDateString(
                "en-US",
                {
                    weekday: "short"
                }
            );


        const month =
            date.toLocaleDateString(
                "en-US",
                {
                    month: "short"
                }
            );


        const dayNumber =
            date.getDate();


        /*
           Example:

           Tue
           Aug 25
        */

        const button =
            document.createElement("button");


        button.className =
            "date-option";


        button.innerHTML = `
            <span class="day">
                ${weekday}
            </span>

            <span class="date">
                ${month} ${dayNumber}
            </span>
        `;


        /*
           Store a readable date.
        */

        const fullDate =
            date.toLocaleDateString(
                "en-US",
                {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                }
            );


        button.onclick = function () {

            selectOption(
                "date",
                fullDate,
                button
            );

        };


        container.appendChild(button);

    }

}


/* =====================================================
   SHOW SUMMARY
===================================================== */

function showSummary() {

    document.getElementById("summaryVibe").textContent =
        datePlan.vibe;

    document.getElementById("summaryFood").textContent =
        datePlan.food;

    document.getElementById("summaryActivity").textContent =
        datePlan.activity;

    document.getElementById("summaryTime").textContent =
        datePlan.time;

    document.getElementById("summaryDate").textContent =
        datePlan.date;


    showScreen(9);

}


/* =====================================================
   SUBMIT TO GOOGLE SHEET
===================================================== */

/*
   Paste the "Web app URL" you get after deploying the
   Apps Script (see the Code.gs file / setup notes)
   here. It looks like:

   https://script.google.com/macros/s/AKfycb.../exec
*/

const SHEET_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwv8GbRUiXUiO70T5HaTS00fp-f2lXQb7kOCM_2tUOxfRsZ2J8vNYD7qfh4qKejvDR8Eg/exec";


function submitResponse() {

    // Don't try to submit if the URL hasn't been set yet.

    if (SHEET_WEB_APP_URL.includes("PASTE_YOUR")) {

        console.warn(
            "Apps Script URL has not been configured."
        );

        return;

    }


    /*
       Apps Script web apps don't send back CORS headers,
       so the browser can't read the response. That's
       fine here, we don't need to read anything back,
       "no-cors" just fires the request and moves on.
    */

    fetch(SHEET_WEB_APP_URL, {

        method: "POST",

        mode: "no-cors",

        headers: {

            /*
               Apps Script doesn't handle the CORS
               preflight that "application/json" triggers.
               "text/plain" skips the preflight; Apps
               Script still reads the raw body and
               JSON.parses it fine on its end.
            */

            "Content-Type": "text/plain;charset=utf-8"

        },

        body: JSON.stringify(datePlan)

    }).catch(error => {

        // Fails silently for the user; logged for you to debug.

        console.error("Couldn't save the response:", error);

    });

}


/* =====================================================
   CONFIRM DATE
===================================================== */

function confirmDate() {

    console.log("DATE RESPONSE");

    console.log(datePlan);


    submitResponse();

    burstConfetti();

    showScreen(10);


    /*
       Reveal the P.S. line a beat after the
       screen lands, like a little afterthought.
    */

    const ps = document.getElementById("psLine");

    ps.classList.remove("show");

    setTimeout(() => {

        ps.classList.add("show");

    }, 1200);

}


/* =====================================================
   CONFETTI
===================================================== */

const confettiPieces = ["❤️", "💗", "✨", "💕", "🎉"];


function burstConfetti() {

    const layer = document.getElementById("confettiLayer");

    const pieceCount = 26;


    for (let i = 0; i < pieceCount; i++) {

        const piece = document.createElement("span");

        piece.className = "confetti-piece";

        piece.textContent =
            confettiPieces[
                Math.floor(Math.random() * confettiPieces.length)
            ];


        const startX = Math.random() * 100;

        const drift = Math.random() * 140 - 70;

        const duration = 2.2 + Math.random() * 1.4;

        const delay = Math.random() * 0.3;

        const size = 14 + Math.random() * 16;


        piece.style.left = `${startX}vw`;

        piece.style.setProperty("--drift", `${drift}px`);

        piece.style.animationDuration = `${duration}s`;

        piece.style.animationDelay = `${delay}s`;

        piece.style.fontSize = `${size}px`;


        layer.appendChild(piece);


        /*
           Clean up after the animation finishes so the
           DOM doesn't quietly fill up with old confetti.
        */

        setTimeout(() => {

            piece.remove();

        }, (duration + delay) * 1000 + 100);

    }

}


/* =====================================================
   INITIALIZE
===================================================== */

generateDates();
