// Moquette's three moving pictures. With squiffy.json, a .js file in the story's folder is added to
// the published page, like this one. (tube.js isn't, as the story reads it with @ui instead.)
//
// A section asks for one of them with @tag, and moves on by itself with {{goto ... after=}}, so
// nothing here changes the story: it only draws in front of it. The story says when the player
// has moved to a section (also when they go back, restart, or load a saved game), and when
// that's a section without the tag, the effect ends.
//
//   heather-swarm   her name, all over the screen, in every size
//   blackout        speckles of letters that grow, as everything goes black
//   heather-tube    her name going by like a train that isn't stopping, until it does
//
// A player who has asked for reduced motion gets the blackout's fade, and her name standing still.

(() => {
    const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const still = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
    // How many letters the blackout adds each time, for every million pixels of window
    const PER_MEGAPIXEL = 50;
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    function layer(...classes) {
        const element = document.createElement("div");
        element.classList.add("moquette-effect", ...classes);
        element.setAttribute("aria-hidden", "true");
        document.body.appendChild(element);
        return element;
    }

    // A canvas that fills a layer, to draw on in CSS pixels. Thousands of letters, some of them
    // huge, are too many elements for a browser to add, or fade, at a steady speed.
    function canvas(element) {
        const canvas = document.createElement("canvas");
        const scale = window.devicePixelRatio || 1;
        const width = window.innerWidth, height = window.innerHeight;
        canvas.width = width * scale;
        canvas.height = height * scale;
        element.appendChild(canvas);
        const context = canvas.getContext("2d");
        context.scale(scale, scale);
        context.textBaseline = "top";
        return { context, width, height };
    }

    // Waits for the page to finish scrolling to new text: half a second, and twenty frames, with
    // no scrolling (frames, because a browser that's busy may not have started yet)
    async function scrolled() {
        const start = performance.now();
        let at = window.scrollY, since = start, frames = 0;
        while ((frames < 20 || performance.now() - since < 500) && performance.now() - start < 4000) {
            await new Promise(resolve => requestAnimationFrame(resolve));
            frames++;
            if (window.scrollY != at) {
                at = window.scrollY;
                since = performance.now();
                frames = 0;
            }
        }
    }

    async function fadeAway(element, ms) {
        await element.animate({ opacity: [getComputedStyle(element).opacity, 0] }, { duration: ms, fill: "forwards" }).finished;
        element.remove();
    }

    // Each effect starts when the story reaches a section with its tag, and returns a function that ends it
    const effects = {
        // By the time the screen is full of her name, nothing of the page can be seen: a layer
        // of the page's own colour comes up behind the names, to fill the gaps between them. So
        // the next text arrives, and the page scrolls to it, out of sight, and it's there when
        // the names fade away.
        "heather-swarm"() {
            const cover = layer("cover");
            const element = layer();
            const { context, width, height } = canvas(element);
            cover.animate({ opacity: [0, 1] }, { duration: 3000, easing: "ease-in", fill: "both" });
            let count = 0;
            const timer = setInterval(() => {
                for (let i = 0; i < 3; i++) {
                    const grey = randomInt(0, 255);
                    context.font = randomInt(8, 100) + "px Georgia, serif";
                    context.fillStyle = `rgb(${grey} ${grey} ${grey})`;
                    context.globalAlpha = Math.random();
                    context.fillText("Heather", randomInt(-100, width), randomInt(-100, height));
                }
                if (++count >= 150 || still()) clearInterval(timer);
            }, 20);
            return async () => {
                clearInterval(timer);
                await scrolled();
                fadeAway(cover, 2000);
                fadeAway(element, 2000);
            };
        },

        // Everything goes black, and it's the letters that do it: more of them on a bigger screen,
        // and bigger all the time, until there's nothing between them. (The black behind them only
        // comes at the end, for the last few specks of the page.)
        "blackout"() {
            const black = layer("black");
            const speckles = layer();
            const { context, width, height } = canvas(speckles);
            context.textBaseline = "middle";
            context.textAlign = "center";
            const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
            // 200 lots of letters, one every 50ms: ten seconds, starting after one
            const LOTS = 200, EACH = Math.max(4, Math.round(width * height / 1e6 * PER_MEGAPIXEL));
            const reduced = still();
            const fade = black.animate({ opacity: [0, 1] }, reduced
                ? { duration: 10000, delay: 1000, easing: "ease-in", fill: "both" }
                : { duration: 2000, delay: 9000, fill: "both" });
            let count = 0, began, frame;
            function draw(now) {
                began ??= now;
                // However often this is called, the letters keep time
                const due = Math.min(LOTS, Math.floor((now - began - 1000) / 50));
                for (; count < due; count++) {
                    for (let i = 0; i < EACH; i++) {
                        context.font = randomInt(4, 10 + count) + "px Georgia, serif";
                        context.fillText(letters[randomInt(0, letters.length - 1)], randomInt(0, width), randomInt(0, height));
                    }
                }
                if (count < LOTS) frame = requestAnimationFrame(draw);
            }
            if (!reduced) frame = requestAnimationFrame(draw);
            return () => {
                cancelAnimationFrame(frame);
                speckles.remove();
                fade.finish();
                // It stays black for a second after the next page arrives underneath
                black.animate({ opacity: [1, 0] }, { duration: 10000, delay: 1000, easing: "ease-in", fill: "forwards" })
                    .finished.then(() => black.remove());
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
    document.addEventListener("squiffy:ready", ({ detail: squiffy }) => {
        squiffy.on("navigated", ({ section }) => {
            const tags = squiffy.story.tags(section);
            for (const name of Object.keys(effects)) {
                const now = tags.includes(name);
                if (now && !running[name]) running[name] = effects[name]();
                if (!now && running[name]) {
                    running[name]();
                    delete running[name];
                }
            }
        });
    });
})();
