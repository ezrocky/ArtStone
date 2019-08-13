function startGame() {
    document.querySelector('button').remove();

    window.thecomputer = new Player('thecomputer');
    window.thegamer = new Player('thegamer');
    
    thecomputer.generateRandomSkill();
    thegamer.choosePlayerSkill();

    gameObj.createDeck();
    gameObj.showDeck();
}

const additionalFuncs = {
    countDown(time) {
        let timeoutId = setInterval(timer, 1000);
        window.theTime = time;

        function timer() {
            document.querySelector('.timeblock').innerHTML = 'Time left: <br>' + window.theTime;
            window.theTime--;
            if(window.theTime == -1) {
                clearInterval(timeoutId);
                additionalFuncs.switchPlayerTurn();
            };
        }
    },

    switchPlayerTurn() {
        if(thegamer.turn) {
            thegamer.turn = false;
            thecomputer.turn = true;
            
            thecomputer.playerType.thecomputerTurn(+window.globalMana);
            return;
        }

        if(thecomputer.turn) {
            thecomputer.turn = false;
            thegamer.turn = true;

            thegamer.playerType.thegamerTurn(+window.globalMana + 1);
            thegamer.playerType.allCardsCanAttack()

            return;
        }
    },
    
    randomInteger(min, max) {
        var rand = min - 0.5 + Math.random() * (max - min + 1)
        rand = Math.round(rand);
        return rand;
    }
}

const gameObj = {
    createDeck() {
        window.gameDeck = Object.keys(cards).map(function(key) {
            return cards[key];
        });
    
        window.gameDeck.sort(function(a, b) {
            return Math.random() - 0.5;
        });
    },

    showDeck() {
        document.querySelector('.deckBlock').innerHTML = `Cards in deck: ${window.gameDeck.length}` 
    },

    drawMana(mana) {
        window.globalMana = mana;
        window.usedMana = mana;

        let manabox = document.createElement('div');
        manabox.innerHTML = `Mana left: ${usedMana}/${globalMana}`;
        manabox.classList.add('manabox');
        document.body.insertBefore(manabox, document.querySelector('.timeblock'));
    },

    reloadMana() {
        let manaBox = document.getElementsByClassName('manabox')[0];
        manaBox.innerHTML = `Mana left: ${usedMana}/${globalMana}`;
    }
} 

const playerSkillsObj = {
    fireBall: {
        skillname: 'fire',
        descr: 'deal 1 damage',
        bgcolor: '#E15464'
    },
    freezeMinion: {
        skillname: 'freeze',
        descr: 'freeze selected minion',
        bgcolor: '#9AD9E1'
    },
    healMinion: {
        skillname: 'heal',
        descr: 'heal 1 hp to selected minion',
        bgcolor: '#6EE139'
    },
}

Object.defineProperty(playerSkillsObj, 'chooseRandomSkill', {
    value: function(player) {
        let allSkills = Object.keys(playerSkillsObj).map(function(key) {
            return playerSkillsObj[key];
        });

        let randomNum = additionalFuncs.randomInteger(0, allSkills.length - 1);
        player.playerSkill = allSkills[randomNum];
        
        console.log(allSkills[randomNum]);
        player.drawSkillPower();
    }
})

Object.defineProperty(playerSkillsObj, 'showAllSkills', {
    value: function(player) {
        let skillUl = document.createElement('ul');
        
        let h3 = document.createElement('h3');
        h3.innerHTML = 'Choose skill';
        skillUl.appendChild(h3);
        
        for(let key in this) {
            let currentLi = document.createElement('li');
            currentLi.style.backgroundColor = this[key].bgcolor;
            currentLi.innerHTML = this[key].descr;
            currentLi.dataset.thisobj = key;
            
            currentLi.addEventListener('click', function() {
                player.playerSkill = playerSkillsObj[this.dataset.thisobj];
                player.drawSkillPower()
            });
            skillUl.appendChild(currentLi);
        }
        
        document.getElementById(player.position).appendChild(skillUl);
    },
    enumerable: false,
    configurable: false,
    writable: false
});

class Player {
    constructor(position) {
        this.position = position;
        this.healthPoints = 15;
        this.playerSkill = undefined;
        this.playerHand = undefined;
        this.turn = false;

        if(this.position == 'thegamer') {
            this.playerType = new Gamer;
        }

        if(this.position == 'thecomputer') {
            this.playerType = new Computer; 
        }
    }

    choosePlayerSkill() {
        playerSkillsObj.showAllSkills(this);
    }

    generateRandomSkill() {
        playerSkillsObj.chooseRandomSkill(this);
    }

    drawFace(hp) {
        let face = document.createElement('div');
        face.innerHTML = this.position + '<br>' + 'HP: ' + hp;
        face.classList.add('facebox');
        document.getElementById(this.position).insertBefore(face, document.getElementById(this.position).firstChild);
    }

    redrawFace(hp) {
        document.getElementById(this.position).firstChild.remove();
        this.drawFace(hp);
    }

    drawSkillPower() {
        let skillBox = document.createElement('div');
        skillBox.innerHTML = this.playerSkill.skillname;
        skillBox.style.backgroundColor = this.playerSkill.bgcolor;
        skillBox.classList.add('skillbox');
        document.getElementById(this.position).innerHTML = '';
        document.getElementById(this.position).appendChild(skillBox);
        
        if(thecomputer.playerSkill && thegamer.playerSkill) {
            thecomputer.playerHand = new Hand(5, thecomputer.position)
            thegamer.playerHand = new Hand(5, thegamer.position)
            thecomputer.drawFace(this.healthPoints);
            thegamer.drawFace(this.healthPoints);
            
            thegamer.playerType.thegamerTurn(1);
            thegamer.turn = true;
        }
    }
}

class Gamer extends Player {
    thegamerTurn(turn) {
        if(document.getElementsByClassName('manabox')[0]) {
            document.getElementsByClassName('manabox')[0].remove();
        }

        gameObj.drawMana(turn);
        additionalFuncs.countDown(15);
        document.querySelector('.wrapper').addEventListener('click', thegamer.playerType.checkTarget);    
    }

    checkTarget(event) {
        let theActiveCard = document.getElementsByClassName('activeCard')[0];

        if(thegamer.turn) {
            if(event.target.classList.contains('thecard-visible')) {
                let visibleCards = document.querySelectorAll('.thecard-visible');
                if(theActiveCard == event.target || theActiveCard == null) {
                   thegamer.playerType.activateCard(event.target);
                }
            }
    
            if(event.target.classList.contains('lowertable') 
            && theActiveCard != null
            && theActiveCard
            && theActiveCard.getAttribute('data-mana') <= window.usedMana) {
                theActiveCard.classList.add('friendlyCard');
                event.target.appendChild(theActiveCard)
                window.usedMana = +window.usedMana - +theActiveCard.getAttribute('data-mana');
                gameObj.reloadMana();
    
                //disabling the activeness of the card
                thegamer.playerType.activateCard(theActiveCard)
            }
    
            if(theActiveCard
            && theActiveCard.parentElement.classList.contains('lowertable')
            && theActiveCard.classList.contains('friendlyCard') == false
            && event.target.parentElement.id == 'thecomputer') {
                window.thecomputer.healthPoints = window.thecomputer.healthPoints -  +theActiveCard.getAttribute('data-attack');
                thecomputer.redrawFace(thecomputer.healthPoints);
                theActiveCard.classList.add('friendlyCard');
    
                //disabling the activeness of the card
                thegamer.playerType.activateCard(theActiveCard)
            }
        }   
    }

    activateCard(card) {
        card.classList.toggle('activeCard');
        document.querySelector('.lowertable').classList.toggle('activelowertable');
    }

    allCardsCanAttack() {
        let table = document.getElementsByClassName('lowertable')[0];

        for(let i = 0; i < table.children.length; i++) {
            table.children[i].classList.remove('friendlyCard');
        }
    }
}

class Computer extends Player {
    thecomputerTurn(turn) {
        document.getElementsByClassName('manabox')[0].remove();

        gameObj.drawMana(turn);
        additionalFuncs.countDown(15);
        setTimeout(thecomputer.playerType.defineTheMove, additionalFuncs.randomInteger(3000, 13000))
    }

    defineTheMove() {
        let handDiv = document.getElementsByClassName('handdiv')[0];
        let upperTable = document.getElementsByClassName('uppertable')[0];
        let lowerTable = document.getElementsByClassName('lowertable')[0];

        for(let i = 0; i < handDiv.children.length; i++) {
            if(+handDiv.children[i].getAttribute('data-mana') <= window.usedMana) {
                upperTable.appendChild(handDiv.children[i]);
                return;
            }
        }
    }
}

class Hand {
    constructor(cardsQuantity, position) {
        this.cardsInHand = this.giveCards(cardsQuantity);
        this.topCard = undefined;
        this.position = position
        this.drawCards();
    }

    giveCards(number) {
        let givenPart = gameDeck.splice(0, number);
        gameObj.showDeck()

        return givenPart;
    }

    drawCards() {
        let handDiv = document.createElement('div');
        handDiv.classList.add('handdiv');
        for(let i = 0; i < this.cardsInHand.length; i++) {
            let theCard = document.createElement('div');
            if(this.position == 'thegamer') {
                theCard.classList.add('thecard-visible');
                theCard.innerHTML = `${this.cardsInHand[i].cardName} - [${this.cardsInHand[i].manaCost}] <hr> ${this.cardsInHand[i].minionSkill} <hr> ${this.cardsInHand[i].minionAttack}  |  ${this.cardsInHand[i].minionHealth}</p>`;
                theCard.dataset.mana = this.cardsInHand[i].manaCost;
                theCard.dataset.attack = this.cardsInHand[i].minionAttack;
                theCard.dataset.healh = this.cardsInHand[i].minionHealth;
            } else {
                theCard.classList.add('thecard-invisible');
                theCard.dataset.mana = this.cardsInHand[i].manaCost;
                theCard.dataset.attack = this.cardsInHand[i].minionAttack;
                theCard.dataset.healh = this.cardsInHand[i].minionHealth;
            }
            handDiv.appendChild(theCard);
        }

        document.getElementById(this.position).appendChild(handDiv);
    }

    takeCards(number) {
        let takenPart = gameDeck.splice(0, number);
        this.cardsInHand = this.cardsInHand.concat(takenPart);
        gameObj.showDeck()
    }
}

const cards = {
    soldier1: {
        cardName: 'solider1',
        cardType: 'minion',
        manaCost: 1,
        minionHealth: 1,
        minionAttack: 1,
        minionSkill: 'lorem lorem lorem lorem lorem lorem lorem'
    },
    
    solider2: {
        cardName: 'solider2',
        cardType: 'minion',
        manaCost: 1,
        minionHealth: 1,
        minionAttack: 2,
        minionSkill: 'lorem lorem lorem lorem lorem lorem lorem'
    },
    
    solider3: {
        cardName: 'solider3',
        cardType: 'minion',
        manaCost: 1,
        minionHealth: 2,
        minionAttack: 1,
        minionSkill: 'lorem lorem lorem lorem lorem lorem lorem'
    },
    
    solider4: {
        cardName: 'solider4',
        cardType: 'minion',
        manaCost: 1,
        minionHealth: 2,
        minionAttack: 2,
        minionSkill: 'lorem lorem lorem lorem lorem lorem lorem'
    },
    
    solider5: {
        cardName: 'solider5',
        cardType: 'minion',
        manaCost: 1,
        minionHealth: 2,
        minionAttack: 2,
        minionSkill: 'lorem lorem lorem lorem lorem lorem lorem'
    },
    
    solider6: {
        cardName: 'solider6',
        cardType: 'minion',
        manaCost: 1,
        minionHealth: 6,
        minionAttack: 2,
        minionSkill: 'lorem lorem lorem lorem lorem lorem lorem'
    },
    
    solider7: {
        cardName: 'solider7',
        cardType: 'minion',
        manaCost: 1,
        minionHealth: 3,
        minionAttack: 5,
        minionSkill: 'lorem lorem lorem lorem lorem lorem lorem'
    },
    
    solider8: {
        cardName: 'solider8',
        cardType: 'minion',
        manaCost: 1,
        minionHealth: 2,
        minionAttack: 6,
        minionSkill: 'lorem lorem lorem lorem lorem lorem lorem'
    },
    
    solider9: {
        cardName: 'solider9',
        cardType: 'minion',
        manaCost: 1,
        minionHealth: 4,
        minionAttack: 2,
        minionSkill: 'lorem lorem lorem lorem lorem lorem lorem'
    },

    solider10: {
        cardName: 'solider10',
        cardType: 'minion',
        manaCost: 1,
        minionHealth: 4,
        minionAttack: 2,
        minionSkill: 'lorem lorem lorem lorem lorem lorem lorem'
    },

    solider11: {
        cardName: 'solider11',
        cardType: 'minion',
        manaCost: 1,
        minionHealth: 4,
        minionAttack: 2,
        minionSkill: 'lorem lorem lorem lorem lorem lorem lorem'
    },

    solider12: {
        cardName: 'solider12',
        cardType: 'minion',
        manaCost: 1,
        minionHealth: 4,
        minionAttack: 2,
        minionSkill: 'lorem lorem lorem lorem lorem lorem lorem'
    },

    solider13: {
        cardName: 'solider13',
        cardType: 'minion',
        manaCost: 1,
        minionHealth: 4,
        minionAttack: 2,
        minionSkill: 'lorem lorem lorem lorem lorem lorem lorem'
    },

    solider14: {
        cardName: 'solider14',
        cardType: 'minion',
        manaCost: 1,
        minionHealth: 4,
        minionAttack: 2,
        minionSkill: 'lorem lorem lorem lorem lorem lorem lorem'
    },

    solider15: {
        cardName: 'solider15',
        cardType: 'minion',
        manaCost: 1,
        minionHealth: 4,
        minionAttack: 2,
        minionSkill: 'lorem lorem lorem lorem lorem lorem lorem'
    },
}
