import { playerRoles } from './config.js';

let homePlayers = [];
let awayPlayers = [];

export function getHomePlayers() {
    return homePlayers;
}

export function getAwayPlayers() {
    return awayPlayers;
}

export function setHomePlayers(players) {
    homePlayers = players;
}

export function setAwayPlayers(players) {
    awayPlayers = players;
}

export function readPlayersFromForm(formEl) {
    const fd = new FormData(formEl);
    const arr = [];
    for (let i = 1; i <= 11; i++) {
        arr.push({ number: fd.get(`number${i}`), name: fd.get(`name${i}`) });
    }
    return arr;
}

export function createInputs(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    let numbers;
    if (containerId === "inputsHome") {
        numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    } else {
        numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    }
    for (let i = 0; i <= 10; i++) {
        container.innerHTML += `
          <div>
            ${playerRoles[i]} <input type="number" name="number${i+1}" value="${numbers[i]}" required>
          </div>
        `;
    }
}