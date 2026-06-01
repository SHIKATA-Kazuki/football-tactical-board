import {formations} from './formations.js';

// ==========配置からの調整パート定義===========

export let wingStick = {
    x: 0, // -1.0 ~ 1.0 (幅)
    y: 0  // -1.0 ~ 1.0 (高さ/上下)
};

function applyTacticalAdjustments(
    // player,
    squadNum,
    pos,
    isOpponent
) {

    let [x, y] = pos;

    const sbValue =
        parseFloat(sidbackUpDown.value);

    const lineValue =
        parseFloat(lineSlider.value);

    const backsVal =
        parseFloat(backsSlider.value);

    const volante =
        parseFloat(volanteSlider.value);

    const top =
        parseFloat(topSlider.value);

    /* =====================
       オフセット変換
    ===================== */
    const wingWidthOffset = wingStick.x * 15; 
    const wingHeightOffset = wingStick.y * 15;
    let sbOffset =
        (sbValue - 0.22) * 20;

    const lineOffset =
        (lineValue - 0.5) * 20;
    if (
        (squadNum === 2 && backsVal > 0.5) 
        || (squadNum === 5 && backsVal + volante + top > 0.1) 
        || (squadNum === 7 && backsVal < 0.5 && backsVal + volante + top > 0.1) 
        || (squadNum === 3 && backsVal + volante + top < 0.1) 
        || (squadNum === 4 && backsVal + volante + top < 0.1) 
    ) 
    {
        if (backsVal < 0.5) {
            if (backsVal + volante + top > 0.1){
                sbOffset = (sbValue - 0.4) * 37;
            }
        }
        if (isOpponent) {
            y += sbOffset;
        } else {
            y -= sbOffset;
        }
    }

    // --- サイドアタッカー の処理 ---
    if (
        (squadNum === 7 && backsVal > 0.5) 
        || (squadNum === 11 && backsVal > 0.5) 
        || (squadNum === 10 && backsVal < 0.5 && volante > 0.5 && top < 0.5) 
        || (squadNum === 11 && backsVal < 0.5 && volante > 0.5 && top < 0.5) 
        || (squadNum === 6 && backsVal < 0.5 && top > 0.5) 
        || (squadNum === 8 && backsVal < 0.5 && top > 0.5) 
        || (squadNum === 2 && backsVal + volante + top < 0.1) 
        || (squadNum === 5 && backsVal + volante + top < 0.1) 

    ) {
        // 幅（X軸）の調整
        if (isOpponent) {
            if (squadNum === 7 || squadNum === 10 || squadNum === 8 || squadNum === 2) x -= wingWidthOffset;
            if (squadNum === 11 || squadNum === 6 || squadNum === 5) x += wingWidthOffset;
        } else {
            if (squadNum === 7 || squadNum === 10 || squadNum === 8 || squadNum === 2) x += wingWidthOffset;
            if (squadNum === 11 || squadNum === 6 || squadNum === 5) x -= wingWidthOffset;
        }

        // 高さ（Y軸）の調整
        if (isOpponent) {
            y += wingHeightOffset; // 敵陣方向への調整
        } else {
            y -= wingHeightOffset; // 自陣/敵陣方向への調整
        }
    }

    if (
        [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
        .includes(squadNum)
    ) {
        if (isOpponent) {
            y += lineOffset;
        } else {
            y -= lineOffset;
        }
    }

    return [x, y];
}

// ==========基準formation+調整===========
let homePlayers = [];
let awayPlayers = [];
function getHomePlayers() {
    return homePlayers;
}

function getAwayPlayers() {
    return awayPlayers;
}

function setHomePlayers(players) {
    homePlayers = players;
}

function setAwayPlayers(players) {
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
    // console.log("Placing players:", players, "at positions:", positions, "isOpponent:", isOpponent);
    // Update positions and text
    for (let i = 0; i < players.length; i++) {
        const el = arr[i];
        el.className = isOpponent ? "player away" : "player home";
        const [x, y] =
            applyTacticalAdjustments(
                i+1,
                // players[i],
                positions[i],
                isOpponent
            );        
        el.style.left = `${x}%`;
        el.style.top = `${y}%`;
        el.innerHTML = `<strong>${players[i].number}</strong>`;
    }

    // Update state
    if (isOpponent) {
        setAwayPlayers(arr);
    } else {
        setHomePlayers(arr);
    }
}

// ==========フォーメーションの適用===========
export function applyFormation(position_on_now_formation){
  let players = readPlayersFromForm(
    document.getElementById("playerFormHome")
  );
  placePlayers(players, position_on_now_formation, false);
//   players = readPlayersFromForm(
//     document.getElementById("playerFormAway")
//   );
//   placePlayers(players, position_on_now_formation, true);
}
