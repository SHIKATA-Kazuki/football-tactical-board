const anchor = [50, 50];

export const relativeFormations = {
    // 主要formation
    "442":[[0, 48], [37, 25], [13, 30], [-13, 30], [-37, 25],
      [-15, 8], [28, -5], [15,8], [10, -22], [-10, -22], [-28, -5]],
    "442_diamond":[[0, 48], [37, 25], [13, 30], [-13, 30], [-37, 25],
      [0, 10], [20, 1], [0, -8], [15, -22], [-15, -22], [-20, 1]], 
    "4123":[
      [0, 48], [37, 25], [13, 30], [-13, 30], [-37, 25],
      [0, 13], [27, -17], [15, -4], [0, -22], [-15, -4],  [-27, -17]
    ],
    "4231":[
        [0, 48], [37, 25], [13, 30], [-13, 30], [-37, 25],
        [-15, 8], [27, -7], [15, 8], [0, -22], [0, -7], [-27, -7]
    ],
    "343_diamond":[
        [0, 48], [20, 3], [25, 23],  [-25, 23], [-20,3],
        [0, 30], [35, -17], [0, 10], [0, -22], [0, -7], [-35, -17]
    ],
    "3421":[
        [0, 48], [25, 23], [0, 30], [-25, 23], [-40,3], 
        [-15, 8], [40, 3], [15, 8], [0, -22], [17, -12], [-17, -12]
    ],
    "352W":[
        [0, 48], [25, 23], [0, 30], [-25, 23], [-40,-3], 
        [-19, 8], [40, -3], [19, 8], [14, -22], [0, -7], [-14, -22]
    ],
    "352M":[
        [0, 48], [25, 23], [0, 30], [-25, 23], [-40,3], 
        [-19, -1], [40, 3], [19, -1], [14, -22], [0, 8],  [-14, -22]
    ],
    // 派生formation
    "4132":[
      [0, 48], [37, 25], [13, 30], [-13, 30], [-37, 25],
      [0, 8], [32, -10], [0, -6], [11, -22], [-11, -22], [-32, -10]
    ],
    "433":[
        [0, 48], [37, 25], [13, 30], [-13, 30], [-37, 25],
        [0, 3], [27, -17], [20, 1], [0, -22], [-20, 1], [-27, -17]
    ],
    "4321":[
        [0, 48], [37, 25], [13, 30], [-13, 30], [-37, 25],
        [-27, 7], [25, 7], [0, 10], [0, -22], [17, -12], [-17, -12]
    ],
    "343":[
        [0, 48], [25, 23], [0, 30], [-25, 23], [-40,3], 
        [-15, 8], [40, 3], [15, 8], [0, -22], [25, -17], [-25, -17]
    ],
    "3421R":[
        [0, 48], [40, 3], [25, 23], [0, 30], [-25, 23], 
        [-15, 8], [17, -12], [15, 8], [0, -22], [-17, -12], [-40,3]
    ],
    "460":[
        [0, 48], [37, 25], [13, 30], [-13, 30], [-37, 25],
        [0, 15], [27, -17], [20, 2], [0, -10], [-20, 2], [-27, -17]
    ],
    // high press system & 前線数的有利
    "424":[[0, 48], [37, 25], [13, 30], [-13, 30], [-37, 25],
      [-19, 0], [32, -20], [19, 0], [10, -22], [-10, -22], [-32, -20]],
    "4114":[
      [0, 48], [37, 25], [13, 30], [-13, 30], [-37, 25],
      [0, 8], [32, -22], [0, -6], [11, -22], [-11, -22], [-32, -22]
    ],
    "4213":[
      [0, 48], [37, 25], [13, 30], [-13, 30], [-37, 25],
      [-15, 13], [27, -17], [15, 13], [0, -22], [0, -4],  [-27, -17]
    ],
    "325":[
        [0, 48], [25, 23], [0, 30], [-25, 23], [-40,-17], 
        [-15, 8], [40,-17], [15, 8], [0, -22], [17, -12], [-17, -12]
    ],
    "334":[
        [0, 48], [25, 23], [0, 30], [-25, 23], [-30,-12], 
        [0, 3], [30, -12], [20, 1], [10, -22], [-20, 1], [-10, -22]
    ],
    "2134":[
      [0, 48], [37, -3], [13, 30], [-13, 30], [-37, -3],
      [0, 8], [32, -22], [0, -6],  [11, -22], [-11, -22],[-32, -22]
    ],
    "253":[
        [0, 48], [40, 5], [13, 30], [-13, 30], [-40, 5],
        [0, 8], [29, -19], [17, -4], [0, -19],[-17, -4], [-29, -19]
    ],
    "235":[
        [0, 48], [27, -2], [13, 30], [-13, 30], [-27, -2],
        [0, 0], [40, -24], [19, -15], [0, -23], [-19, -15], [-40, -24]
    ],
    // block
    "442block":[
      [0, 48], [37, 25], [13, 30], [-13, 30], [-37, 25],
      [-13, 11],  [37, 6], [13, 11],[12, -15], [-12, -15], [-37, 6]
    ],
    "4141":[
        [0, 48], [37, 28], [13, 30], [-13, 30], [-37, 28],
        [0, 13], [37, -6], [14, -4], [0, -22], [-14, -4], [-37, -6]
    ],
    "4411":[
        [0, 48], [37, 28], [13, 30], [-13, 30], [-37, 28],
        [13, 13], [37, -6], [-13, -4], [0, -22], [0, -11], [-37, -6]
    ],
    "451":[
        [0, 48], [37, 28], [13, 30], [-13, 30], [-37, 28],
        [0, 8], [40, 6], [20, 5], [0, -22], [-20, 5], [-40, 6]
    ],
    //      9
    // 11 10 6 8 7
    //  5   4  3 2
    "541":[
        [0, 48], [20, 28], [0, 28], [-20, 28], [-40,28], 
        [-10, 8], [40, 28], [10, 8], [0, -9], [28, 8], [-28, 8]
    ],
    "532":[
        [0, 48], [20, 28], [0, 28], [-20, 28], [-40,28], 
        [0, 13], [40, 28], [15, 13], [12, -15], [-12, -15], [15, -13]
    ],
    //    10  9
    //   11 6 8 
    //  5 4 3 2 7
}

function toAbsolutePositions(relativeFormations, anchor) {
  return relativeFormations.map(([dx, dy]) => [ anchor[0] + dx, anchor[1] + dy ]);
}

export const formations = {
// 基本formation
  "442": toAbsolutePositions(relativeFormations["442"], anchor),
  "4231": toAbsolutePositions(relativeFormations["4231"], anchor),
  "442_diamond": toAbsolutePositions(relativeFormations["442_diamond"], anchor),
  "4123": toAbsolutePositions(relativeFormations["4123"], anchor),
  "352W": toAbsolutePositions(relativeFormations["352W"], anchor),
  "352M": toAbsolutePositions(relativeFormations["352M"], anchor),
  "343_diamond": toAbsolutePositions(relativeFormations["343_diamond"], anchor),
  "3421": toAbsolutePositions(relativeFormations["3421"], anchor),
// 派生formaion
  "4213": toAbsolutePositions(relativeFormations["4213"], anchor),
  "433": toAbsolutePositions(relativeFormations["433"], anchor),
  "3421R": toAbsolutePositions(relativeFormations["3421R"], anchor),
  "4132": toAbsolutePositions(relativeFormations["4132"], anchor),
  "4321": toAbsolutePositions(relativeFormations["4321"], anchor),
  "460": toAbsolutePositions(relativeFormations["460"], anchor),
  "343": toAbsolutePositions(relativeFormations["343"], anchor),
// high press system & 前線数的有利
  "424": toAbsolutePositions(relativeFormations["424"], anchor),
  "4114": toAbsolutePositions(relativeFormations["4114"], anchor),
  "2134": toAbsolutePositions(relativeFormations["2134"], anchor),
  "235": toAbsolutePositions(relativeFormations["235"], anchor),
  "253": toAbsolutePositions(relativeFormations["253"], anchor),
  "334": toAbsolutePositions(relativeFormations["334"], anchor),
  "325": toAbsolutePositions(relativeFormations["325"], anchor),
// block
  "442block": toAbsolutePositions(relativeFormations["442block"], anchor),
  "4141": toAbsolutePositions(relativeFormations["4141"], anchor),
  "4411": toAbsolutePositions(relativeFormations["4411"], anchor),
  "541": toAbsolutePositions(relativeFormations["541"], anchor),
  "451": toAbsolutePositions(relativeFormations["451"], anchor),
  "532": toAbsolutePositions(relativeFormations["532"], anchor),
};

export const formationSliderMap = {
    "4123":        {backs: 1,volante: 0,top: 0},
    "442":         {backs: 1,volante: 1,top: 1},
    "442_diamond": {backs: 1,volante: 0,top: 1},
    "4231":        {backs: 1,volante: 1,top: 0},
    "4213":        {backs: 1,volante: 1,top: 0},
    "3421":        {backs: 0,volante: 1,top: 0},
    "352W":        {backs: 0,volante: 1,top: 1},
    "352M":        {backs: 0,volante: 0,top: 1},
    "343_diamond": {backs: 0,volante: 0,top: 0},
// 派生formation
    "433":   {backs: 1,volante: 0,top: 0},
    "3421R": {backs: 0,volante: 1,top: 0},
    "4132":  {backs: 1,volante: 0,top: 1},
    "4321":  {backs: 1,volante: 0,top: 0},
    "4150":  {backs: 1,volante: 0,top: 0},
    "343":   {backs: 0,volante: 1,top: 0},
// high press system & 前線数的有利
    "424":  {backs: 1,volante: 1,top: 1},
    "4114": {backs: 1,volante: 0,top: 1},
    "2134": {backs: 1,volante: 0,top: 1},
    "235":  {backs: 1,volante: 0,top: 0},
    "253":  {backs: 1,volante: 0,top: 0},
    "334":  {backs: 0,volante: 0,top: 1},
    "325":  {backs: 0,volante: 1,top: 0},
// block
    "442block": {backs: 1,volante: 1,top: 1},
    "4141": {backs: 1,volante: 0,top: 0},
    "4411": {backs: 1,volante: 1,top: 0},
    "451":  {backs: 1,volante: 0,top: 0},
    "541":  {backs: 0,volante: 1,top: 0},
    "532":  {backs: 0,volante: 0,top: 1},
};

export function getFormationName(backs, volante, top) {
    if (backs > 0.5) {
        if (volante > 0.5) {
            if (top < 0.5) { return "4231";} 
            else {return "442";}
        } else {
            if (top < 0.5) { return "4123";} 
            else {return "442_diamond";}
        }
    } else {
        if (volante > 0.5) {
            if (top < 0.5) {return "3421";} 
            else {return "352W";}
        } else {
            if (top < 0.5) {return "343_diamond";} 
            else {return "352M";}
        }
    }
}