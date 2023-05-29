const readline = require('readline');
const crypto = require('crypto');

class HMAC {
  constructor(key) {
    this.key = key;
  }
  generateHMAC(move) {
    const hmac = crypto.createHmac('sha3-256', move);
    return hmac.digest('hex');
  }
  generateKey() {
    const randomKey = crypto.randomBytes(32);
    return randomKey.toString('hex');
  }
}

class Table {
  constructor(moves, rules) {
    this.moves = moves;
    this.rules = rules;
  }

  generateTable() {
    console.log('Rules:');
    const tableData = [];
    const headerRow = ['Move', ...args];
    tableData.push(headerRow);

    this.moves.forEach((move, index) => {
      const moveRules = this.rules[index].map(ruleIndex => this.moves[ruleIndex]);
      const row = [move];
      args.forEach(arg => {
        if (args[index] === arg) {
          row.push('Draw');
        } else if (moveRules.includes(arg)) {
          row.push("Lose");
        } else {
          row.push("Win");
        }
      });
      tableData.push(row);
    });
      console.table(tableData);
  }
}

class Rules {
  constructor(moves) {
    this.rules = {};

    for (let i = 0; i < moves.length; i++) {
      const moveRules = [];
      for (let j = 1; j <= moves.length / 2; j++) {
        moveRules.push((i + j) % moves.length);
      }
      this.rules[i] = moveRules;
    }
  }

  getRules() {
    return this.rules;
  }
}

class Game {
  constructor(moves) {
    this.moves = moves;
    this.key = '';
    this.rules = new Rules(this.moves).getRules();
  }

  play() {
    const computerMoveIndex = this.getComputerMove();
    const computerMove = this.moves[computerMoveIndex];
    const hmacGenerator = new HMAC(this.key);
    const hmac = hmacGenerator.generateHMAC(computerMove);
    this.key = hmacGenerator.generateKey();

    console.log(`HMAC: ${hmac}`);
    console.log('Available moves:');
    this.moves.forEach((move, i) => console.log(`${i + 1} - ${move}`));
    console.log('0 - exit');
    console.log('? - help');

    this.getUserMove().then((userMove) => {
      if (userMove === '0') {
        console.log('Exit');
        return;
      }

      if (userMove === '?') {
        const table = new Table(this.moves, this.rules);
        table.generateTable();
        return;
        }

      if (!this.isValidChoice(parseInt(userMove, 10))) {
        console.log('Invalid input. Please try again.');
        return;
      }

      const result = this.determineWinner(userMove - 1, computerMoveIndex);

      console.log(`Your move: ${this.moves[userMove - 1]}`);
      console.log(`Computer move: ${computerMove}`);
      console.log(`Result: ${result}`);
      console.log('HMAC Key:', this.key);
    });
  }

  getComputerMove() {
    return Math.floor(Math.random() * this.moves.length);
  }

  getUserMove() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question('Enter your move:', (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    });
  }

  isValidChoice(userMove) {
    return Number.isInteger(userMove) && userMove >= 0 && userMove <= this.moves.length;
  }

  determineWinner(userMove, computerMove) {
    if (userMove === computerMove) {
      return "It's a draw!";
    }

    if (this.rules[userMove].includes(computerMove)) {
      return "You lose:(";
    } else {
      return "You win!";
    }
  }
}

const moves = process.argv.slice(2);

if (moves.length < 1) {
  console.log('Invalid input. Please provide 3 or more moves.');
} else if (moves.length % 2 !== 1) {
  console.log('Invalid input. Please provide an odd number of moves.');
} else if (new Set(moves).size !== moves.length) {
  console.log('Invalid input. Please provide unique moves.');
} else {
  const game = new Game(moves);
  game.play();
}