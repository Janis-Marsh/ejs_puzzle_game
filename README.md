# ejs_puzzle_game — Puz-Zoo

A server-rendered escape-room game built with Node.js, Express, and EJS. The zoo has closed for the night, the gates are locked, and the zookeeper hid the way out. Each animal will only help if you solve its puzzle. Solve all six to escape.

The server decides which pages a player may see. Every puzzle lives at its own random secret path, and the only way to learn the next path is to answer the current puzzle correctly.

## How to play

1. Open the start page and click **Start**.
2. Read the story and the puzzle, type an answer, and press **Submit**.
3. A wrong, empty, or too-long answer shows the same puzzle again with a message.
4. A correct answer takes you to the next puzzle. After the last one you reach the victory page.
5. To play again, go back to the start page.

## Running the game

Requires Node.js and npm.

```bash
npm install
npm start
```

Then open <http://localhost:5000>.

The server prints the puzzle list to the console on startup (including the secret slugs). Secret paths are generated fresh every time the server starts, so old links stop working after a restart.

## Puzzles

| # | Location | Type |
|---|----------|------|
| 1 | The Sunlit Garden | Riddle |
| 2 | The Northern Woods | Riddle |
| 3 | The Rainforest House | Anagram |
| 4 | The Aquarium | Anagram |
| 5 | The Misty Hill | Caesar cipher (shift hinted in the prompt) |
| 6 | The Golden Plain | Morse code |

The difficulty ramps up: the first two are quick riddles, the anagrams need some unscrambling, and the last two are ciphers where the player has to work out the method. Answers for the instructor are in [`ANSWERS.md`](ANSWERS.md).

## How it works

### Secret paths and the gate

- When the server starts, every puzzle (and the victory page) is given a slug from `crypto.randomUUID()`. Slugs are not based on the puzzle number, title, or answer.
- There are no numbered routes. `/play/2`, `/puzzle/2`, and any other guess fall through to the 404 page.
- `middleware/gate.js` runs on every `/play/:slug` and `/victory/:slug` request, for both GET and POST. It looks the slug up in the server's puzzle list. If it finds nothing, it passes to the 404 handler, so a guesser learns nothing. If it finds a match, it stores the puzzle and its index in `res.locals`.
- When an answer is correct, the POST handler redirects to the slug of the puzzle directly after the current one, taken from the server's own list. The target never comes from the request: there is no `next=` field or query string.
- The next slug is only ever revealed by that redirect. It is never rendered into a page.
- The server stores no per-player state: no sessions, no cookies, and no progress variable.

### Answer checking

Every submitted answer goes through the same steps before it is compared with the accepted answer:

1. Make sure a body and a non-empty answer were sent.
2. Reject answers longer than 100 characters.
3. Normalize: lowercase, collapse runs of whitespace into a single space, drop a leading "a", "an" or "the", strip surrounding punctuation, and trim.

Validation helpers come from the local `guard-kit` module. Accepted answers are kept on the server in `lib/answers.js` and are never sent to the browser. When a wrong answer is shown again, the template only receives the puzzle's own title, story, text, index, and an error message.

### Templates

All pages are rendered with EJS and share one header and footer through partials. The header shows the logo and a progress tracker ("Puzzle 3 of 6" plus an icon for each puzzle). A single `puzzle.ejs` template renders every puzzle from the data in `data/puzzles.js`. Any text that comes from data or the player is output with `<%= %>` so it is escaped.

## Project structure

```
ejs_puzzle_game/
├── app.js                # creates the app, builds slugs, defines routes, starts the server
├── package.json
├── README.md
├── ANSWERS.md            # for the instructor
├── data/
│   └── puzzles.js        # puzzle titles, stories, and prompts (server only)
├── lib/
│   └── answers.js        # accepted answers (server only)
├── middleware/
│   └── gate.js           # slug lookup: puzzle in, or 404
├── guard-kit/            # reusable error classes and input validation
├── views/
│   ├── partials/
│   │   ├── header.ejs
│   │   └── footer.ejs
│   ├── index.ejs         # start page
│   ├── puzzle.ejs        # one template for every puzzle
│   ├── victory.ejs
│   ├── not-found.ejs
│   └── error.ejs
└── public/
    ├── style.css
    └── assets/           # logo, icon, and font
```

## Known limitations

- Anyone who has a puzzle's link can open it directly, since the server keeps no record of who has solved what (see question 6 below).
- Each puzzle accepts a single answer string.

## Questions

1. Why must a slug be random?
    - Slugs must be random so that a players can't guess one and skip questions or straight to victory.
2. Where does the gate run, and what does it hand to the route?
    - The gate runs before all requests on /play and /victory and hands the question object and index to the route.
3. How does the POST handler choose where to redirect?
    - The POST handler chooses to where to redirect by checking if the upcoming item is 'victory' 
4. What does your template receive?
    - The template receives the story text, question text, index, and the error message if applicable.
5. Why redirect after a correct POST instead of rendering the next puzzle directly?
    - The app redirects so it can pass a new slug into the gate and get teh next question for the template.
6. A player sends the puzzle 5 link to a friend. What happens? Is that acceptable for this game? What would you need to stop it?
    - The friend is able to skip to question 5, which isn't acceptable. To stop it the app would need to track which questions the user has answered and only let them acces the one they are on.