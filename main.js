// Class

class Game {
    constructor(){
        this.container = document.getElementById("game-container");
        this.character = null;
        this.coins = [];
        this.score = 0
        this.buildScenario();
        this.addEvents();
    }

    buildScenario(){
        this.character = new Character();
        this.container.appendChild(this.character.element);
        for (let index = 0; index < 5; index++) {
            const coin = new Coin();
            this.coins.push(coin);
            this.container.appendChild(coin.element);
        }
    }

    addEvents(){
        window.addEventListener("keydown", (e) => this.character.move(e));
        this.checkCollisions();
    }

    checkCollisions(){
        setInterval(() => {
            this.coins.forEach((coin, index) => {
                if (this.character.collisionWhit(coin)) {
                    this.container.removeChild(coin.element);
                    this.coins.splice(index,1)
                }
            })
        },
            100);
    }
}

class Character {
    constructor(){
        this.x = 50;
        this.y = 300;
        this.width = 50;
        this.height = 50;
        this.speed = 10;
        this.jumping = false;
        this.element = document.createElement("div");
        this.element.classList.add("character");
        this.updPosition();
    }

    move(event){
        if(event.key === "ArrowRight"){
            this.x += this.speed;
        } else if (event.key === "ArrowLeft"){
            this.x -= this.speed;
        }   else if(event.key === "ArrowUp"){
            this.jump();
        }
        this.updPosition();
    }

    jump(){
        this.jumping = true;
        let maxHeight = this.y - 100;
        const jump = setInterval(() => {
            if(this.y > maxHeight){
                this.y -= 10
            } else {
                clearInterval(jump);
                this.fall()
            }
            this.updPosition();
        },
        20);
    }

    fall(){
        const gravity = setInterval(() => {
            if(this.y < 300){
                this.y += 10;
            } else {
                clearInterval(gravity);
            }
            this.updPosition();
        },
            20);
    }

    updPosition(){
        this.element.style.left = `${this.x}px`
        this.element.style.top = `${this.y}px`
    }

    collisionWhit(obj){
        return (
            this.x < obj.x + obj.width &&
            this.x + this.width > obj.x &&
            this.y < obj.y + obj.height &&
            this.y + this.height > obj.y
          );
    }

}

class Coin {
    constructor(){
        this.x = Math.random() * 700 + 50;
        this.y = Math.random() * 250 + 50;
        this.width = 30;
        this.height = 30;
        this.element = document.createElement("div");
        this.element.classList.add("coin");
        this.updPosition();
    }

    updPosition(){
        this.element.style.left = `${this.x}px`
        this.element.style.top = `${this.y}px`
    }
}

const game = new Game();
console.log(game);