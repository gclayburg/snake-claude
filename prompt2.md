
You are an expert Javsscript developer.  Your task is to create a classic snake game that runs in a browser using vanilla javascript. Here are the features we need:

1. The snake should move automatically
2. The snake should start at the bottom center of the screen
3. The snake should be able to move in 2 directions only, left turn and right turn.
4. The snake should be able to grow longer when it eats food
5. The snake should be able to die when it hits the edge of the screen or the snake itself
6. The controls are: left arrow key and right arrow key to move the snake.
7. The user should be able to perform many moves quickly, and the snake will remember all moves in order
8. The grid size is 20x20
9. The playable area will expand to occupy the full area of the browser window.
10. On any resize, the game will never distort the snake blocks or food blocks.  It will only make them bigger or smaller to fill the screen.
11. The snake will be green.  The food is red.
12. Put this all in one file, index.html
13. Display the score prominently in the game area, one point per food eaten.


On game initialize:
Display a light gray background over the play area.
Display 'Snake!'
Display a green button labeled 'Start'
A press of the space bar or click of the button will start the game from the beginning.

On game start:
Remove all text from screen then show the following in a count down format, each message separated by a 1 second delay:
- Ready
- Set
- Go!
  Only one of these 3 messages will be visible on the screen at a time.
  After Go! has expired, the screen background should go back to white and the game begins with the snake at the bottom center.


On game over:
Display a light gray background over the play area.
Display 'Game Over!'
Display green button labeled 'Restart'
A press of the space bar or click of the button will restart the game from the beginning.

Mobile:
We also need to add support for running on a mobile device such as safari on ios or chrome.
A tap anywhere on the left half of the screen will turn left.
A tap anywhere on teh right half of the screen will turn right.
All other browser events like scroll, multiple touch, etc should be disbled as much as possible during game play so not to interrupt the game.


---
chatGPT built the entire game with this one prompt shown above.  There was no border though so you couldn't see where the edge of the world was - because I never asked it to build it I guess.  One more prompt and we have a full game:

can you modify this to show the edge of the playable area.  this should be 5 pixels wide on each side

---
We need to modify this to keep a list of high scores on a server.
Your task is to create a node.js server to record new scores and serve a list of top scores to the client.  Use these guidelines:
The server must examine any input submitted from the client closely.  We want to reject any input that is deemed malicious or out of bounds of what the client could legitimately send to the server.  Under no circumstances should it be possible for any client to cause the server to crash or do anything beyond the function of dealing with high scores for this game.

# When the game is over:
Display the score right below the "Game Over!" line
Next to the high score should be a button labeled "Submit high score"
The 'Restart' should also be visible below this "Submit high score" line
If the user clicks "Submit high score", the game will:
- check to see if the user has already logged in
  -  if the user is logged in it will submit the high score value to the server as the user.  see 'submit high score flow' below for next steps.
  - if the user is not logged in, the user will be presented with a popup window so they can either login or register.  see 'login or register flow' for next steps


# submit high score flow
If the client is unable to communicate with the server, the game should still be playable.  It should just report a message to the console log indicating the server is down.  High scores will not be viewable.

# login or register flow
At this point the user has played a game to the end.  They have a new score.
-  remove the "Submit high score" button. and replace it with a small form
