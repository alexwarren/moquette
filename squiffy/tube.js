// The London Underground, for Moquette: Zone 1's lines and platforms, and who gets on and off.
//
// The story reads this with "@ui tube.js", so it runs once when the story starts. It adds a few
// helpers for the story's text to use, such as {{board}} and {{doors}}. They keep everything they
// know in the story's attributes, so the Back button and saved games work.
//
//   line, direction     the train I'm on, or about to get on: a line below, and 1 or -1 along it
//   station, next       where the train is (or was last), and where it stops next ("" at the end)
//   aboard              the passengers in the carriage: names of passages in people.squiffy
//   platform, ways      the platform I'm standing on, and the others I could change to

// Each line's stations in order. A train going in direction 1 is going towards the end of the
// list, and its platform is called ends[1]. The Northern and District lines are each two lines
// here, one for each branch.
const LINES = {
    bakerloo: { name: "Bakerloo", ends: ["northbound", "southbound"], stations: [
        "Paddington", "Edgware Road", "Marylebone", "Baker Street", "Regent's Park",
        "Oxford Circus", "Piccadilly Circus", "Charing Cross", "Embankment", "Waterloo",
        "Lambeth North", "Elephant & Castle",
    ] },
    central: { name: "Central", ends: ["westbound", "eastbound"], stations: [
        "Notting Hill Gate", "Queensway", "Lancaster Gate", "Marble Arch", "Bond Street",
        "Oxford Circus", "Tottenham Court Road", "Holborn", "Chancery Lane", "St. Paul's",
        "Bank", "Liverpool Street",
    ] },
    circle: { name: "Circle", ends: ["anticlockwise", "clockwise"], stations: [
        "Baker Street", "Great Portland Street", "Euston Square", "King's Cross St. Pancras", "Farringdon",
        "Barbican", "Moorgate", "Liverpool Street", "Aldgate", "Tower Hill",
        "Monument", "Cannon Street", "Mansion House", "Blackfriars", "Temple",
        "Embankment", "Westminster", "St. James's Park", "Victoria", "Sloane Square",
        "South Kensington", "Gloucester Road", "High Street Kensington", "Notting Hill Gate", "Bayswater",
        "Edgware Road",
    ] },
    district1: { name: "District", ends: ["southbound", "northbound"], stations: [
        "Earl's Court", "High Street Kensington", "Notting Hill Gate", "Bayswater", "Edgware Road",
    ] },
    district2: { name: "District", ends: ["westbound", "eastbound"], stations: [
        "Earl's Court", "Gloucester Road", "South Kensington", "Sloane Square", "Victoria",
        "St. James's Park", "Westminster", "Embankment", "Temple", "Blackfriars",
        "Mansion House", "Cannon Street", "Monument", "Tower Hill", "Aldgate East",
    ] },
    hc: { name: "Hammersmith & City", ends: ["westbound", "eastbound"], stations: [
        "Paddington", "Edgware Road", "Baker Street", "Great Portland Street", "Euston Square",
        "King's Cross St. Pancras", "Farringdon", "Barbican", "Moorgate", "Liverpool Street",
        "Aldgate East",
    ] },
    jubilee: { name: "Jubilee", ends: ["northbound", "southbound"], stations: [
        "Baker Street", "Bond Street", "Green Park", "Westminster", "Waterloo",
        "Southwark", "London Bridge",
    ] },
    metropolitan: { name: "Metropolitan", ends: ["westbound", "eastbound"], stations: [
        "Baker Street", "Great Portland Street", "Euston Square", "King's Cross St. Pancras", "Farringdon",
        "Barbican", "Moorgate", "Liverpool Street", "Aldgate",
    ] },
    northern1: { name: "Northern", ends: ["northbound", "southbound"], stations: [
        "Euston", "King's Cross St. Pancras", "Angel", "Old Street", "Moorgate",
        "Bank", "London Bridge", "Borough", "Elephant & Castle", "Kennington",
        "Oval", "Stockwell",
    ] },
    northern2: { name: "Northern", ends: ["northbound", "southbound"], stations: [
        "Euston", "Warren Street", "Goodge Street", "Tottenham Court Road", "Leicester Square",
        "Charing Cross", "Embankment", "Waterloo", "Kennington",
    ] },
    piccadilly: { name: "Piccadilly", ends: ["southbound", "northbound"], stations: [
        "Earl's Court", "Gloucester Road", "South Kensington", "Knightsbridge", "Hyde Park Corner",
        "Green Park", "Piccadilly Circus", "Leicester Square", "Covent Garden", "Holborn",
        "Russell Square", "King's Cross St. Pancras",
    ] },
    victoria: { name: "Victoria", ends: ["northbound", "southbound"], stations: [
        "King's Cross St. Pancras", "Euston", "Warren Street", "Oxford Circus", "Green Park",
        "Victoria", "Pimlico", "Vauxhall", "Stockwell", "Brixton",
    ] },
    wc: { name: "Waterloo & City", ends: ["southbound", "northbound"], stations: [
        "Waterloo", "Bank",
    ] },
};

// Where lines share a platform, or a station is at the end of a line, the platforms are listed
// here: the name on the signs, then the trains that call there and which way they go. Any
// station that isn't here has a platform each way for each of its lines.
const PLATFORMS = {
    "Aldgate": [
        ["northbound Circle/Metropolitan lines", { circle: -1, metropolitan: -1 }],
        ["southbound Circle line", { circle: 1 }],
    ],
    "Aldgate East": [
        ["westbound Hammersmith & City/District lines", { hc: -1, district2: -1 }],
    ],
    "Baker Street": [
        ["northbound Bakerloo line", { bakerloo: -1 }],
        ["southbound Bakerloo line", { bakerloo: 1 }],
        ["eastbound Hammersmith & City/Circle lines", { hc: 1, circle: 1 }],
        ["westbound Hammersmith & City", { hc: -1 }],
        ["eastbound Metropolitan line", { metropolitan: 1 }],
        ["southbound Jubilee line", { jubilee: 1 }],
    ],
    "Barbican": [
        ["westbound Hammersmith & City/Circle/Metropolitan lines", { hc: -1, circle: -1, metropolitan: -1 }],
        ["eastbound Hammersmith & City/Circle/Metropolitan lines", { hc: 1, circle: 1, metropolitan: 1 }],
    ],
    "Bayswater": [
        ["northbound Circle/District lines", { circle: 1, district1: 1 }],
        ["southbound Circle/District lines", { circle: -1, district1: -1 }],
    ],
    "Blackfriars": [
        ["westbound Circle/District lines", { circle: 1, district2: -1 }],
        ["eastbound Circle/District lines", { circle: -1, district2: 1 }],
    ],
    "Cannon Street": [
        ["westbound Circle/District lines", { circle: 1, district2: -1 }],
        ["eastbound Circle/District lines", { circle: -1, district2: 1 }],
    ],
    "Earl's Court": [
        ["District line", { district1: 1, district2: 1 }],
        ["eastbound Piccadilly line", { piccadilly: 1 }],
    ],
    "Edgware Road": [
        ["northbound Bakerloo line", { bakerloo: -1 }],
        ["southbound Bakerloo line", { bakerloo: 1 }],
        ["eastbound Hammersmith & City", { hc: 1 }],
        ["westbound Hammersmith & City/Circle/District lines", { hc: -1, circle: -1, district1: -1 }],
    ],
    "Embankment": [
        ["westbound Circle/District lines", { circle: 1, district2: -1 }],
        ["eastbound Circle/District lines", { circle: -1, district2: 1 }],
        ["northbound Northern line", { northern2: -1 }],
        ["southbound Northern line", { northern2: 1 }],
        ["northbound Bakerloo line", { bakerloo: -1 }],
        ["southbound Bakerloo line", { bakerloo: 1 }],
    ],
    "Euston Square": [
        ["westbound Hammersmith & City/Circle/Metropolitan lines", { hc: -1, circle: -1, metropolitan: -1 }],
        ["eastbound Hammersmith & City/Circle/Metropolitan lines", { hc: 1, circle: 1, metropolitan: 1 }],
    ],
    "Farringdon": [
        ["westbound Hammersmith & City/Circle/Metropolitan lines", { hc: -1, circle: -1, metropolitan: -1 }],
        ["eastbound Hammersmith & City/Circle/Metropolitan lines", { hc: 1, circle: 1, metropolitan: 1 }],
    ],
    "Gloucester Road": [
        ["westbound Circle/District lines", { circle: 1, district2: -1 }],
        ["eastbound Circle/District lines", { circle: -1, district2: 1 }],
        ["eastbound Piccadilly line", { piccadilly: 1 }],
        ["westbound Piccadilly line", { piccadilly: -1 }],
    ],
    "Great Portland Street": [
        ["westbound Hammersmith & City/Circle/Metropolitan lines", { hc: -1, circle: -1, metropolitan: -1 }],
        ["eastbound Hammersmith & City/Circle/Metropolitan lines", { hc: 1, circle: 1, metropolitan: 1 }],
    ],
    "High Street Kensington": [
        ["northbound Circle/District lines", { circle: 1, district1: 1 }],
        ["southbound Circle/District lines", { circle: -1, district1: -1 }],
    ],
    "King's Cross St. Pancras": [
        ["westbound Hammersmith & City/Circle/Metropolitan lines", { hc: -1, circle: -1, metropolitan: -1 }],
        ["eastbound Hammersmith & City/Circle/Metropolitan lines", { hc: 1, circle: 1, metropolitan: 1 }],
        ["northbound Northern line", { northern1: -1 }],
        ["southbound Northern line", { northern1: 1 }],
        ["southbound Piccadilly line", { piccadilly: -1 }],
        ["southbound Victoria line", { victoria: 1 }],
    ],
    "Liverpool Street": [
        ["westbound Hammersmith & City/Circle/Metropolitan lines", { hc: -1, circle: -1, metropolitan: -1 }],
        ["eastbound Hammersmith & City/Circle/Metropolitan lines", { hc: 1, circle: 1, metropolitan: 1 }],
        ["westbound Central line", { central: -1 }],
    ],
    "Mansion House": [
        ["westbound Circle/District lines", { circle: 1, district2: -1 }],
        ["eastbound Circle/District lines", { circle: -1, district2: 1 }],
    ],
    "Monument": [
        ["westbound Circle/District lines", { circle: 1, district2: -1 }],
        ["eastbound Circle/District lines", { circle: -1, district2: 1 }],
    ],
    "Moorgate": [
        ["westbound Hammersmith & City/Circle/Metropolitan lines", { hc: -1, circle: -1, metropolitan: -1 }],
        ["eastbound Hammersmith & City/Circle/Metropolitan lines", { hc: 1, circle: 1, metropolitan: 1 }],
        ["northbound Northern line", { northern1: -1 }],
        ["southbound Northern line", { northern1: 1 }],
    ],
    "Notting Hill Gate": [
        ["northbound Circle/District lines", { circle: 1, district1: 1 }],
        ["southbound Circle/District lines", { circle: -1, district1: -1 }],
        ["eastbound Central line", { central: 1 }],
    ],
    "Paddington": [
        ["southbound Bakerloo line", { bakerloo: 1 }],
        ["eastbound Hammersmith & City/Circle lines", { hc: 1 }],
    ],
    "Sloane Square": [
        ["westbound Circle/District lines", { circle: 1, district2: -1 }],
        ["eastbound Circle/District lines", { circle: -1, district2: 1 }],
    ],
    "South Kensington": [
        ["westbound Circle/District lines", { circle: 1, district2: -1 }],
        ["eastbound Circle/District lines", { circle: -1, district2: 1 }],
        ["eastbound Piccadilly line", { piccadilly: 1 }],
        ["westbound Piccadilly line", { piccadilly: -1 }],
    ],
    "St. James's Park": [
        ["westbound Circle/District lines", { circle: 1, district2: -1 }],
        ["eastbound Circle/District lines", { circle: -1, district2: 1 }],
    ],
    "Temple": [
        ["westbound Circle/District lines", { circle: 1, district2: -1 }],
        ["eastbound Circle/District lines", { circle: -1, district2: 1 }],
    ],
    "Tower Hill": [
        ["westbound Circle/District lines", { circle: 1, district2: -1 }],
        ["eastbound Circle/District lines", { circle: -1, district2: 1 }],
    ],
    "Victoria": [
        ["westbound Circle/District lines", { circle: 1, district2: -1 }],
        ["eastbound Circle/District lines", { circle: -1, district2: 1 }],
        ["northbound Victoria line", { victoria: -1 }],
        ["southbound Victoria line", { victoria: 1 }],
    ],
    "Westminster": [
        ["westbound Circle/District lines", { circle: 1, district2: -1 }],
        ["eastbound Circle/District lines", { circle: -1, district2: 1 }],
        ["northbound Jubilee line", { jubilee: -1 }],
        ["southbound Jubilee line", { jubilee: 1 }],
    ],
};

// Stations where a lot of people get on and off, as they do at any station with three or more platforms
const BUSY = ["Farringdon", "Marylebone"];

// ---- The map ----

function stationAfter(station, line, direction) {
    const stations = LINES[line].stations;
    const index = stations.indexOf(station);
    return index < 0 ? "" : stations[index + direction] || "";
}

// [{ name, trains: { line: direction } }]
function platformsAt(station) {
    if (PLATFORMS[station]) return PLATFORMS[station].map(([name, trains]) => ({ name, trains }));
    const platforms = [];
    const branches = LINES.northern1.stations.includes(station) && LINES.northern2.stations.includes(station);
    for (const [code, line] of Object.entries(LINES)) {
        for (const direction of [-1, 1]) {
            if (!stationAfter(station, code, direction)) continue;
            let name = `${line.ends[direction < 0 ? 0 : 1]} ${line.name} line`;
            if (branches && code == "northern1") name += " (Bank Branch)";
            if (branches && code == "northern2") name += " (Charing Cross Branch)";
            platforms.push({ name, trains: { [code]: direction } });
        }
    }
    return platforms;
}

// ---- Chance ----

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// How many people get on or off, when it's usually about this many
function poisson(expected) {
    const limit = Math.exp(-expected);
    let count = 0;
    let p = Math.random();
    while (p > limit) {
        count++;
        p *= Math.random();
    }
    return count;
}

function pick(list, count) {
    const from = [...list];
    const picked = [];
    while (picked.length < count && from.length) {
        picked.push(from.splice(randomInt(0, from.length - 1), 1)[0]);
    }
    return picked;
}

// ---- Passengers ----
//
// A passenger is a passage in people.squiffy, such as "a man (Kurt Cobain)". Before I look at
// them, all I know is what the name says before the brackets: "a man".

const list = (name) => squiffy.get(name) || [];
const title = (who) => who.replace(/ \(.*\)$/, "");
// "a man in a suit" gets off as "the man in the suit"
const the = (who) => title(who).replace(/^(an? )?/, "the ").replace(/ an? /g, " the ");
const settled = (who) => list("settled").includes(who);

// Once I've looked at somebody and they've left the carriage, I don't see them again
const strangers = () => list("strangers").filter(who => !list("aboard").includes(who) && !squiffy.story.seen(who));

// "a man, a woman and another man"
function describe(people) {
    const used = [];
    return people.map(who => {
        let as = title(who);
        if (used.includes(as)) as = as.replace(/^an? /, "another ");
        while (used.includes(as)) as = "yet " + as;
        used.push(as);
        return { who, as };
    });
}

const sentence = (items) => items.length < 2 ? items.join("") : items.slice(0, -1).join(", ") + " and " + items.at(-1);
const one = (people) => people.length == 1 && !title(people[0]).includes(" and ");

// {{board}}: I get on the train at this station, into a carriage with a few people in it
squiffy.registerHelper("board", () => {
    squiffy.set("aboard", []);
    squiffy.set("aboard", pick(strangers(), randomInt(2, 4)));
    squiffy.set("next", stationAfter(squiffy.get("station"), squiffy.get("line"), squiffy.get("direction")));
    return "";
});

// {{doors}}: the doors are about to close, so some people get off and some get on. It sets
// "leaving" ("the man and the old woman") and "joining" ("a woman"), which are empty if nobody
// does, and "one_leaving" and "one_joining", for "gets" or "get" and "is" or "are".
squiffy.registerHelper("doors", () => {
    const station = squiffy.get("station");
    const aboard = list("aboard");
    const usual = platformsAt(station).length > 2 || BUSY.includes(station) ? 2 : 0.3;

    let off = poisson(usual);
    const leaving = pick(aboard.filter(who => !settled(who)), off);
    const staying = aboard.filter(who => !leaving.includes(who));

    let on = poisson(usual);
    if (on > 4) {
        on = 4;
        off++;
    }
    if (aboard.length - off > 4) on = 0;
    if (aboard.length - off + on <= 1) on++;
    squiffy.set("aboard", staying);
    const joining = pick(strangers().filter(who => !settled(who)), on);

    squiffy.set("aboard", [...staying, ...joining]);
    squiffy.set("leaving", sentence(leaving.map(the)));
    squiffy.set("one_leaving", one(leaving));
    squiffy.set("joining", sentence(describe(joining).map(person => person.as)));
    squiffy.set("one_joining", one(joining));
    return "";
});

// {{#each (passengers)}}: everybody in the carriage. "who" is their passage, and "as" is what to
// call them: "a man", "another man"...
squiffy.registerHelper("passengers", () => describe(list("aboard")));

// ---- Trains ----

// {{move}}: the train goes on to the next station
squiffy.registerHelper("move", () => {
    const station = squiffy.get("next");
    squiffy.set("station", station);
    squiffy.set("next", stationAfter(station, squiffy.get("line"), squiffy.get("direction")));
    return "";
});

// {{#if (between "Leicester Square" "Covent Garden")}}: is the train between these two stations?
squiffy.registerHelper("between", (a, b) => {
    const stations = [squiffy.get("station"), squiffy.get("next")];
    return stations.includes(a) && stations.includes(b);
});

// ---- Platforms ----

// {{alight}}: I get off the train, onto its platform. At the end of a line there isn't a platform
// for trains going any further, so "platform" is empty.
squiffy.registerHelper("alight", () => {
    const line = squiffy.get("line");
    const platform = platformsAt(squiffy.get("station")).find(platform => platform.trains[line] == squiffy.get("direction"));
    squiffy.set("platform", platform ? platform.name : "");
    return "";
});

// {{signs}}: sets "ways" to the other platforms here
squiffy.registerHelper("signs", () => {
    const platforms = platformsAt(squiffy.get("station")).map(platform => platform.name);
    squiffy.set("ways", platforms.filter(name => name != squiffy.get("platform")));
    return "";
});

// {{train}}: a train arrives at my platform. It sets "line", "direction" and "next", "line_name" for
// "A Circle line train arrives", and "other_trains" if trains of other lines stop here too.
squiffy.registerHelper("train", () => {
    const platform = platformsAt(squiffy.get("station")).find(platform => platform.name == squiffy.get("platform"));
    const lines = Object.keys(platform.trains);
    const line = lines[randomInt(0, lines.length - 1)];
    squiffy.set("line", line);
    squiffy.set("direction", platform.trains[line]);
    squiffy.set("next", stationAfter(squiffy.get("station"), line, platform.trains[line]));
    squiffy.set("line_name", LINES[line].name);
    squiffy.set("other_trains", lines.length > 1);
    return "";
});

// {{#if (nothing_to_click)}}: are there no passage links left to click in this section?
squiffy.registerHelper("nothing_to_click", () => {
    const sections = squiffy.element.querySelectorAll(".squiffy-output-section");
    const section = sections[sections.length - 1];
    return !section || !section.querySelector("a.link-passage:not(.disabled)");
});
