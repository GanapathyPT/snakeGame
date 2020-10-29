import React, { useState, useEffect } from "react";

import { useInterval } from "../useInterval";

const initialBoard = Array(20).fill("clear").map(e => Array(20).fill("clear"));
const initialBestScore = localStorage.getItem("bestScore");

const createRandomFood = (snake) => {
	const x = Math.floor(Math.random() * 20);
	const y = Math.floor(Math.random() * 20);

	if (snake.some(pos => pos[0] === x && pos[1] === y))
		return createRandomFood(snake);
	return [x,y]
}

export default function SnakeGame() {

	const [board, setBoard] = useState(initialBoard);
	const [snake, setSnake] = useState([ [0,0], [0,1] ]);
	const [direction, setDirection] = useState("RIGHT");
	const [food, setFood] = useState(createRandomFood(snake));
	const [snakeSpeed, setSnakeSpeed] = useState(null);
	const [score, setScore] = useState(0);
	const [gameCompleted, setGameCompleted] = useState(true);
	const [bestScore, setBestScore] = useState( 
		!!initialBestScore ? +initialBestScore + 1 : 0
	);

	const moveSnake = (direction) => {
		if (gameCompleted)
			return;

		let newSnake = snake.map(row => [...row]);

		const head = newSnake[newSnake.length - 1];
		let newHead;

		switch(direction) {
			case "LEFT":
				newHead = [head[0], head[1]-1];
				break;

			case "UP":
				newHead = [head[0]-1, head[1]];
				break;

			case "RIGHT":
				newHead = [head[0], head[1]+1];
				break;

			case "DOWN":
				newHead = [head[0]+1, head[1]];
				break;

			default:
				return;
		}

		newSnake.push(newHead);
		newSnake.shift();

		if (snakeCollapse(newSnake) || snakeHitsOnWall(newHead)){
			setGameCompleted(true);
			setSnakeSpeed(null);
		}

		if (snakeEatsFood(head)){
			setScore(s => s + 1);
			setSnakeSpeed(ss => ss - 8);
			newSnake = increaseSnakeLength(newSnake);
			setFood(createRandomFood(newSnake));
		}

		setSnake(newSnake);
	}

	useInterval(() => moveSnake(direction), snakeSpeed);

	const display = () => {
		try {
			const newBoard = initialBoard.map(row => [...row]);

			snake.forEach(pos => {
				newBoard[pos[0]][pos[1]] = "snake";
			});

			newBoard[food[0]][food[1]] = "food";

			setBoard(newBoard);
		}
		catch (e) {
			setGameCompleted(true);
			setSnakeSpeed(null);
		}
	}

	useEffect(display, [snake, food]);

	const changeDirection = ({ keyCode }) => {
		if (gameCompleted)
			return;

		let newDirection;
		
		switch(keyCode) {
			case 37: // Left
				newDirection = direction === "RIGHT" ? "RIGHT" : "LEFT";
				break;

			case 38: // Up
				newDirection = direction === "DOWN" ? "DOWN" : "UP";
				break;

			case 39: // Right
				newDirection = direction === "LEFT" ? "LEFT" : "RIGHT";
				break;

			case 40: // Down
				newDirection = direction === "UP" ? "UP" : "DOWN";
				break;

			default:
				return;
		}

		setDirection(newDirection);
	}

	const snakeEatsFood = (head) => head[0] === food[0] && head[1] === food[1];

	const increaseSnakeLength = (snake) => {
		const head = snake[snake.length - 1];

		snake.push(head);
		snake.unshift();

		return snake;
	}

	const snakeHitsOnWall = (head) => head[0] < 0 ||
		head[0] === 20 || head[1] < 0 || head[1] === 20;

	const snakeCollapse = (snake) => {
		const clonedSnake = snake.map(row => [...row]);
		let flag = false;

		const head = clonedSnake[clonedSnake.length - 1];
		clonedSnake.pop();

		clonedSnake.forEach(pos => {
			if (pos[0] === head[0] && pos[1] === head[1])
				flag = true;
		})

		return flag;
	}

	const newGame = () => {
		document.getElementById('game').focus();
		setScore(0);
		setGameCompleted(false);
		setBoard(initialBoard);
		setSnake([ [0,0], [0,1] ]);
		setDirection("RIGHT");
		setFood(createRandomFood([ [0,0], [0,1] ]));
		setSnakeSpeed(500);
	}

	useEffect(() => {
		if (score > bestScore){
			setBestScore(score);
			localStorage.setItem("bestScore", bestScore + "");
		}
	}, [score, bestScore])

	return (
		<div id="game" className="full-screen" onKeyDown={changeDirection} tabIndex="0">
			<div className="half-screen">
				<div>
					<h1>Snake Game</h1>
					<p>best childhood game for everyone</p>
					<p className="score">Score: { score } <br /> Best: { bestScore }</p>
					{
						gameCompleted ?
						<button onClick={newGame} className="btn start">
							New Game
						</button>
						: null
					}
					<p className="mobile-guide">
						click on the direction to change the direction of the snake
					</p>
				</div>
			</div>
			<div className="half-screen">
				<div>
					{
						!gameCompleted &&
						board.map((row, i) => 
							<div key={i} className="board-row">
								{
									row.map((col, j) => 
										<div key={j} className={
											`board-item ${col}`
										} />
									)
								}
							</div>
						)
					}
				</div>
			</div>
			{
				gameCompleted ?
				null :
				<div className="control-btns">
					<button onClick={() => {
						if (direction !== "RIGHT")
							setDirection("LEFT")
					}} className="control-btn btn-l" />
					<button onClick={() => {
						if (direction !== "DOWN")
							setDirection("UP")}
					} className="control-btn btn-u" />
					<button onClick={() => {
						if (direction !== "UP")
							setDirection("DOWN")
					}} className="control-btn btn-d" />
					<button onClick={() => {
						if (direction !== "LEFT")
							setDirection("RIGHT")
					}} className="control-btn btn-r" />
				</div>
			}
		</div>
	);
}