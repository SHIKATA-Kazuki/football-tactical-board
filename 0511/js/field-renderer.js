import { getHomePlayers, setHomePlayers, getAwayPlayers, setAwayPlayers } from './players.js';

export function getBaseFormationName() {
    let formationName;
    const top =
        parseFloat(
            document.getElementById("topSlider").value
        );

    const volante =
        parseFloat(
            document.getElementById("volanteSlider").value
        );

    const backs =
        parseFloat(
            document.getElementById("backsSlider").value
        );
        
    if (backs > 0.5){
        if (volante > 0.5){
            if (top < 0.33){
                formationName = "4231";
            }else if(top < 0.66){
                formationName = "442";
            }else{  
                formationName = "4213";
            }
        }else{
            if (top < 0.33){
                formationName = "4150";
            }else if (top < 0.66){  
                formationName = "4123";
            }else{
                formationName = "424";
            }
        }    
    }else{
        if (volante > 0.5){
          if (top < 0.5){
              formationName = "3421";
          }else{  
              formationName = "352W";
          }
        }else{
            formationName = "352M";
        }      
    };

    return formationName;
}

function applyTacticalAdjustments(
    // player,
    squadNum,
    pos,
    isOpponent
) {

    let [x, y] = pos;

    const sbValue =
        parseFloat(sidbackUpDown.value);

    const wingValue =
        parseFloat(wingSlider.value);

    const lineValue =
        parseFloat(lineSlider.value);


    /* =====================
       オフセット変換
    ===================== */

    const sbOffset =
        (sbValue - 0.5) * 20;

    const wingOffset =
        (wingValue - 0.5) * 20;

    const lineOffset =
        (lineValue - 0.5) * 20;

    if (squadNum === 2 || squadNum === 5) 
    {

        if (isOpponent) {
            y += sbOffset;
        } else {
            y -= sbOffset;
        }
    }

    if (squadNum === 7) {
        x += wingOffset;
    }

    if (squadNum === 11) {
        x -= wingOffset;
    }


    if (
        [2, 3, 4, 5]
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

function getFormationNameFromSliders() {

    const backs =
        parseFloat(
            backsSlider.value
        );

    const volante =
        parseFloat(
            volanteSlider.value
        );

    const top =
        parseFloat(
            topSlider.value
        );


    if (backs === 1) {

        if (volante === 0) {

            if (top < 0.25) {
                return "4321";
            }

            if (top < 0.7) {
                return "4123";
            }

            return "442";
        }

        else {

            if (top < 0.25) {
                return "4231";
            }

            return "442_diamond";
        }
    }

    else {

        if (volante === 0) {

            return "343";
        }

        else {

            if (top < 0.25) {
                return "3421";
            }

            return "352W";
        }
    }
}