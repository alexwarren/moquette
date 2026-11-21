// Moquette's three moving pictures. With squiffy.json, a .js file in the story's folder is added to
// the published page, like this one. (tube.js isn't, as the story reads it with @ui instead.)
//
// The story asks for each of them by putting a class on itself with @class, and moves on by
// itself with {{goto ... after=}}, so nothing here changes the story: it only draws in front of it.
// When the story moves on, the class goes, and so does the effect.
//
//   heather-swarm   her name, all over the screen, in every size
//   blackout        speckles of letters that grow, as everything goes black
//   heather-tube    her name going by like a train that isn't stopping, until it does
//
// A player who has asked for reduced motion gets the blackout's fade, and her name standing still.

(() => {
    const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const still = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    function layer(...classes) {
        const element = document.createElement("div");
        element.classList.add("moquette-effect", ...classes);
        element.setAttribute("aria-hidden", "true");
        document.body.appendChild(element);
        return element;
    }

    function scatter(element, text, size, colour, opacity) {
        const span = document.createElement("span");
        span.textContent = text;
        span.style.left = randomInt(-100, window.innerWidth) + "px";
        span.style.top = randomInt(-100, window.innerHeight) + "px";
        span.style.fontSize = size + "px";
        if (colour) span.style.color = colour;
        if (opacity !== undefined) span.style.opacity = opacity;
        element.appendChild(span);
    }

    async function fadeAway(element, ms) {
        await element.animate({ opacity: [getComputedStyle(element).opacity, 0] }, { duration: ms, fill: "forwards" }).finished;
        element.remove();
    }

    // Each effect starts when its class appears, and returns a function that ends it
    const effects = {
        "heather-swarm"() {
            const element = layer();
            let count = 0;
            const timer = setInterval(() => {
                if (++count >= 150 || still()) clearInterval(timer);
                for (let i = 0; i < 3; i++) {
                    const grey = randomInt(0, 255);
                    scatter(element, "Heather", randomInt(8, 100), `rgb(${grey} ${grey} ${grey})`, Math.random());
                }
            }, 20);
            return () => {
                clearInterval(timer);
                fadeAway(element, 2000);
            };
        },

        "blackout"() {
            const black = layer("black");
            const speckles = layer();
            const fade = black.animate({ opacity: [0, 1] }, { duration: 10000, delay: 1000, easing: "ease-in", fill: "both" });
            const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
            let count = 0;
            const timer = setInterval(() => {
                if (++count >= 150 || still()) return clearInterval(timer);
                for (let i = 0; i < 20; i++) {
                    scatter(speckles, letters[randomInt(0, letters.length - 1)], randomInt(4, 10 + count));
                }
            }, 50);
            return () => {
                clearInterval(timer);
                speckles.remove();
                fade.finish();
                fadeAway(black, 10000);
            };
        },

        "heather-tube"() {
            const element = layer("passing");
            const word = document.createElement("div");
            word.textContent = "HEATHER";
            word.style.opacity = 0;
            element.appendChild(word);
            let over = false;
            (async () => {
                await wait(2000);
                word.style.opacity = 1;
                // Faster than you can read at first, then slower each time it goes by
                for (let ms = 200; ms < 2000 && !over && !still(); ms *= 1.5) {
                    await word.animate({ transform: ["translateX(100vw)", "translateX(-100vw)"] }, { duration: ms }).finished;
                }
                if (!over && !still()) {
                    await word.animate({ transform: ["translateX(100vw)", "translateX(0)"] }, { duration: 2300, easing: "ease-out" }).finished;
                }
                if (!over) await word.animate({ opacity: [1, 0] }, { duration: 3000, fill: "forwards" }).finished;
            })();
            return () => {
                over = true;
                element.remove();
            };
        },
    };

    const running = {};
    const check = () => {
        for (const name of Object.keys(effects)) {
            const now = !!document.querySelector("." + name);
            if (now && !running[name]) running[name] = effects[name]();
            if (!now && running[name]) {
                running[name]();
                delete running[name];
            }
        }
    };
    new MutationObserver(check).observe(document.documentElement, { attributes: true, attributeFilter: ["class"], subtree: true });
    check();
})();
