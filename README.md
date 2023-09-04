# Babbling Bubbles

A word game like Boggle except letters are used up and replaced with new letters like Scrabble. Deployed live at https://babblin-bubbles.onrender.com/

## Outside Data:

The only 3rd party used for this game is the dictionary data to check words against. I will be using the list of words provided by this npm package: https://www.npmjs.com/package/an-array-of-english-words

## Overview of gameplay:

- Single-player game (for now).  
- The player starts with a vertical Boggle-like grid of letter tiles.
- The letter tiles are shaped as bubbles and are placed in a water background.  
- Similar to Boggle, when you find a word, you get points based on the length of the word found.
- However, after entering the word, the letter bubbles used for the word pop and disappear and letter bubbles from below “bubble up” to fill the empty space. Any empty space at the bottom of the grid will be filled by new bubbles that appear from below. You now will need to find words in this slightly changed grid.
- The changes to the grid with each word found adds new interesting strategies to the normal Boggle game. For example, players will have to be careful not to only use the very common letters because as those are used up and replaced with random letters, the grid can get crowded with only uncommon letters and words will be difficult to form.
- You have 3 minutes to find words and build your score.
## Overview of website:
- Tech stack: React, Node/Express
- This will be a front-end focused application. Front-end goals will be to create fun and smooth gameplay with animations and with a simple user interface and playful and attractive styling.
- This will be a website with thoughts of maintaining gameplay that could eventually be turned into a mobile app.
- The goal of this game will be to create a fun casual word game that players can use to relax and compete against themselves for high scores.
- Target demographic: young adults
- I will use this npm package to verify words that users enter: https://www.npmjs.com/package/an-array-of-english-words
- I will create an algorithm to choose letters so that common letters will appear more frequently than uncommon letters.
## MVP version of app:
- Users will land on a fun but simple homepage with how-to-play, login, and play links.
- The play link will send users to a new page styled with a water background and a central start game button. A 3 second countdown timer will commence after the start game button is pressed. After the 3 seconds, the game board will appear and an input field to enter words will become active. A 3-minute timer will begin and the game will end when the 3 minute timer expires.
- When a player enters words, the words will be checked against the dictionary immediately on the front-end. Correct words will pop the bubbles and increase the players score. Incorrect words will display a “not a word” message and will clear the input field.
- After the game, a total score will be displayed and an option to play again.
- Users can play without logging in, but will have the option to log in to store their stats and high scores.
- The database will store user and statistical information and the backend will communicate with the database.
- The complexity of the application in the MVP version (that make it more than just a simple CRUD app), will be centered around the front-end gameplay, animations, and styling.
## Additional Features:
- Special 2x and 3x bubbles will randomly appear that, when used for a word, will multiply the score for that word by 2 or 3 times. Incorporating multiple special bubbles in a word would result in a compounded bonus. For example, using one 2x and one 3x bubble in a single word would result in the score for that word being multiplied by 6.
- Like Scrabble, uncommon letter can count for more points than common letters when used.

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
