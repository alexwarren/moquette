Moquette
========

> Tuesday morning. London Underground. Hangover. Journey begins.

"Moquette" is a choice-based work of interactive fiction, first written for [Quest 5.5](https://textadventures.co.uk/quest) as an entry in IFComp 2013. It's now been remade in [Squiffy](https://squiffystory.com).

This repo has both versions:

- `squiffy/`: the Squiffy version, the one to play now. [Play it at moquette.squiffystory.com](https://moquette.squiffystory.com/).
- `quest/`: the original Quest version, as entered in IFComp 2013. You can still [play it at textadventures.co.uk](https://textadventures.co.uk/games/view/zbzfpcnknu_vdjog-cbihw/moquette).

## The Squiffy version

To build and play it locally:

```bash
cd squiffy
npm install
npm run serve
```

`npm run check`, `npm run random` and `npm test` check the story, play it at random, and replay the playthrough tests in `tests/`. The Squiffy version is pinned in `squiffy/package.json`. Update it there on purpose, then run all three.

### Hosting

It's hosted at [moquette.squiffystory.com](https://moquette.squiffystory.com/) by Cloudflare Pages, in a project connected to this repo:

- Production branch: `main`
- Root directory: `squiffy`
- Build command: `npm run build`
- Build output directory: `build`

The Node version comes from `squiffy/.node-version`. Every push to another branch, and every PR, gets its own preview deployment.

## The Quest version

Open `quest/Moquette.aslx` in Quest 5. It uses Quest's English and Core libraries, and the two in this folder, `tube.aslx` and `people.aslx`.

## Credits

Written by Alex Warren. Photography by Robin Baumgarten.

Thanks to everyone who beta tested the original: Rachel Kelly, Nick Wood, mostly useless, Katzy, Steven Watson, Jay Nabonne, Dave Upchurch, The Pixie, Martha Henson and Joel Webster.

## Licence

The code and the story's text are under the MIT licence (see `LICENSE.md`). The photographs, `intro.jpg` and `end.jpg` in both versions, are © Robin Baumgarten and used with permission. The MIT licence doesn't cover them, so they can't be reused without Robin's permission.
