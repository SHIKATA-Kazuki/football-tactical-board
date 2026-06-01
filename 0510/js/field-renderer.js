import { getHomePlayers, setHomePlayers, getAwayPlayers, setAwayPlayers } from './players.js';

export function placePlayers(players, positions, isOpponent) {
    const field = document.getElementById("field");
    const arr = isOpponent ? getAwayPlayers() : getHomePlayers();

    // Adjust array size
    while (arr.length < players.length) {
        const div = document.createElement("div");
        div.className = isOpponent ? "player away" : "player home";
        field.appendChild(div);
        arr.push(div);
    }
    while (arr.length > players.length) {
        const removed = arr.pop();
        removed.remove();
    }

    // Update positions and text
    for (let i = 0; i < players.length; i++) {
        const el = arr[i];
        el.className = isOpponent ? "player away" : "player home";
        el.style.left = `${positions[i][0]}%`;
        el.style.top = `${positions[i][1]}%`;
        el.innerHTML = `<strong>${players[i].number}</strong>`;
    }

    // Update state
    if (isOpponent) {
        setAwayPlayers(arr);
    } else {
        setHomePlayers(arr);
    }
}