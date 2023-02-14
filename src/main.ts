// Types

type Card = {
	id: string; // id is unique
	name: string;
	front: string;
	back: string;
};

type Cards = Array<Card>;

type CardMatchDict = Record<string, { matched: boolean; card: Card }>;

type CardDict = Record<string, Card>;

type Player = {
	name: string;
	score: number;
};

// Cards

let count = 0;
const deck: Cards = Array.from(Array(9), () => {
	const cardObj = {
		id: `id${count}`,
		name: `Example${count}`,
		front: `front${count}`,
		back: `back${count}`,
	};
	count++;
	return cardObj;
});

// The rest aka mess

function shuffle(array) {
	var count = array.length,
		randomnumber,
		temp;
	while (count) {
		randomnumber = (Math.random() * count--) | 0;
		temp = array[count];
		array[count] = array[randomnumber];
		array[randomnumber] = temp;
	}
}

const cardGrid = document.getElementById("card-grid") as HTMLElement;

function addChildren(parent: HTMLElement, children: Array<HTMLElement>): void {
	for (const child of children) {
		parent.appendChild(child);
	}
}

const scoreBoard = document.getElementById("score-board") as HTMLElement;

function removeChildren(parent: HTMLElement): void {
	const children = [...parent.children];

	for (const child of children) {
		parent.removeChild(child);
	}
}

function renderScore() {
	removeChildren(scoreBoard);

	const scoreElements: Array<HTMLElement> = players.map((player, index) => {
		const element = newElement("div");
		if (index == playerTurn) {
			element.innerHTML = `<mark>${player.name}: ${player.score}</mark>`;
		} else {
			element.innerText = `${player.name}: ${player.score}`;
		}
		return element;
	});

	addChildren(scoreBoard, scoreElements);
}

function increaseScore() {
	players[playerTurn].score++;
}

let selectedCards: Array<HTMLElement> = [];

const players: Array<Player> = [
	{
		name: "Player1",
		score: 0,
	},
	{
		name: "Player2",
		score: 0,
	},
];

let playerTurn: number = 0;

function nextTurn() {
	playerTurn = (playerTurn + 1) % players.length;
	renderScore();
}

function placeCards(cards: Array<any>) {
	// transform cards data into appropriate elements

	const cardElements = cards.map((card) => {
		const element = newElement("div", ["grid-cell"]);
		addChildren(element, [card]);
		return element;
	});

	addChildren(cardGrid, cardElements);
}

const subset = deck;

const cardMatchDict: CardMatchDict = {};

const cards: Cards = [...subset, ...subset];
shuffle(cards);

for (const card of subset) {
	const id = card.id;

	cardMatchDict[id] = {
		matched: false,
		card: card,
	};
}

function flipBox(
	frontChildren: Array<HTMLElement>,
	backChildren: Array<HTMLElement>
) {
	const flipBox = newElement("div");
	addClasses(flipBox, ["flip-box"]);

	const flipBoxInner = newElement("div");
	addClasses(flipBoxInner, ["flip-box-inner"]);
	addChildren(flipBox, [flipBoxInner]);

	const flipBoxFront = newElement("div");
	addClasses(flipBoxFront, ["flip-box-front"]);
	addChildren(flipBoxFront, frontChildren);

	const flipBoxBack = newElement("div");
	addClasses(flipBoxBack, ["flip-box-back"]);
	addChildren(flipBoxBack, backChildren);

	addChildren(flipBoxInner, [flipBoxFront, flipBoxBack]);

	return flipBox;
}

function newElement(tag, classes: Array<string> = []) {
	const element = document.createElement(tag);
	addClasses(element, classes);

	return element;
}

function addClasses(element: HTMLElement, classes: Array<string>) {
	element.classList.add(...classes);
}

function toggleClasses(element: HTMLElement, classes: Array<string>) {
	for (const className of classes) {
		element.classList.toggle(className);
	}
}

let frozen: Boolean = false;

document.addEventListener("click", (event) => {
	if (frozen == true) {
		return;
	}

	const target = event.target as HTMLElement;

	if (target.matches(".flip-box *")) {
		const flipCard = target.closest(".flip-box") as HTMLElement;
		const cardId = flipCard.id.split("_")[0];

		const { matched, card } = cardMatchDict[cardId];

		if (!matched && selectedCards.length < 2) {
			if (selectedCards.length == 1) {
				const selectedElement1 = selectedCards[0];
				console.log(selectedCards);
				if (selectedElement1.id == flipCard.id) {
					return;
				}
			}

			selectedCards.push(flipCard);
			toggleClasses(flipCard, ["flipped"]);

			if (selectedCards.length == 2) {
				const selectedElement1 = selectedCards[0];
				const selectedElement2 = selectedCards[1];

				const cardId1 = selectedElement1.id.split("_")[0];
				const cardId2 = selectedElement2.id.split("_")[0];

				if (cardId1 == cardId2 && selectedElement1.id != selectedElement2.id) {
					cardMatchDict[cardId].matched = true;
					increaseScore();
					selectedCards = [];
					nextTurn();
				} else {
					frozen = true;

					setTimeout(() => {
						frozen = false;

						for (const element of selectedCards) {
							toggleClasses(element, ["flipped"]);
						}

						selectedCards = [];
						nextTurn();
					}, 1500);
				}
			}
		}
	}
});

// testing area

const flipCards = cards.map((card) => {
	const front = newElement("span");

	const back = newElement("span");
	back.innerText = card.back;

	const flipCard = flipBox([front], [back]);
	flipCard.id = `${card.id}_${Math.floor(Math.random() * 100000)}`;

	return flipCard;
});

placeCards(flipCards);
