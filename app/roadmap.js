// The road to the platinum, in the order to play it. Each stage lists the
// trophy ids from data/trophies.json that belong to it, and the note is the
// reason the stage sits where it does. Stage 1 is the story because its
// trophies unlock by playing; stage 6 is the cleanup because its trophies
// are the ones best done with the whole map open.

export const ROADMAP = [
  {
    stage: 1,
    title: 'Play the story first',
    note: 'Chapters 1 to 4, the named missions and the finale. All 12 story trophies unlock by finishing missions, none of them can be missed, and the story opens the map and the contacts the later stages need.',
    ids: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  },
  {
    stage: 2,
    title: 'Meet Leonida\u2019s strangers',
    note: 'The contacts with mission strands: Andy, Kenton, Billy, Randy and Tyrone, plus Cal\u2019s fishing challenge and Bret\u2019s hunt. Take each strand as it appears and finish 8 stranger strands in all.',
    ids: [20, 22, 23, 24, 25, 26, 27, 29],
  },
  {
    stage: 3,
    title: 'Activities and challenges',
    note: 'The counted play: 250 stunts, the 42 Shooting Range challenges at gold, drone races at all 14 spots, 20 different race wins, 50 challenges, plus the arcade, the bowling alley and the two combat feats.',
    ids: [15, 16, 17, 18, 19, 21, 32, 36, 46, 51],
  },
  {
    stage: 4,
    title: 'Collect and explore',
    note: 'The slow burn: 3 card sets, WAiNK It at 100 spots, meditation at all 18 spots, 100 vehicles discovered, all 52 areas of Leonida, all 8 garages bought and 10 vehicles registered. Do these while travelling for the other stages.',
    ids: [28, 30, 31, 35, 42, 54, 55],
  },
  {
    stage: 5,
    title: 'Crime pays',
    note: 'The heists and the money: 5 bank vaults, the armored truck, the jewelry store unseen, one illegal operation for each of the 9 gangs, the two partner jobs, and $250,000 laundered against $100,000 spent.',
    ids: [33, 34, 39, 40, 41, 43, 52, 53],
  },
  {
    stage: 6,
    title: 'Cleanup, then the platinum',
    note: 'The odd ones out, best left until the map is fully open: the airport departure, the Rhinos, the cocktail on Ocean Beach, the showroom smash, the partnership moment, the 500 choices, the second try and the strange event. Then 100% completion, and the platinum follows.',
    ids: [37, 38, 44, 45, 47, 48, 49, 50, 14, 1],
  },
];
