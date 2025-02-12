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
        this.y = 335;
        this.width = 70;
        this.height = 70;
        this.speed = 10;
        this.jumpingAir = true; // ARREGLO DE NICO - Controlar salto doble
        this.jumpInterval = null; // Para guardar el intervalo de salto - AMCA
        this.fallInterval = null; // Para guardar el intervalo de caída - AMCA
        this.jumping = false;
        this.falling = false; // ARREGLO NICO
        this.element = document.createElement("div");
        this.element.classList.add("character");
        this.updPosition();
    }

    move(event){
        if(event.key === "ArrowRight" && this.x != 720){
            this.x += this.speed;
            this.element.classList.add("right")
        } else if (event.key === "ArrowLeft" && this.x != 0){
            this.x -= this.speed;
            this.element.classList.remove("right")
        }   else if(event.key === "ArrowUp"){
            this.jump();
        }
        this.updPosition();
    }

    jump(){
        /* ---- APLICADA CORRECIÓN DE NICO ----- */
        if (!this.jumping && (this.jumpingAir || !this.falling)) {
            if (this.falling) {
                this.jumpingAir = false;  
                clearInterval(this.fallInterval); 
                this.fallInterval = null;
                this.falling = false;
            }

            this.jumping = true;
            let maxHeight = this.y - 150;
            this.element.classList.remove("fall");
            this.element.classList.add("jump");
            this.jumpInterval = setInterval(() => {
                if (this.y > maxHeight) {
                    this.y -= 10;
                } else {
                    clearInterval(this.jumpInterval);
                    this.jumpInterval = null;
                    this.jumping = false;
                    this.fall();
                }
                this.updPosition();
            }, 20);
        }
        
        /*
       // Si tiene el maximo de saltos se va fuera y no ejecuta el método - AMCA
            // También he añadido delay entre salto y salto una vez toque el suelo - AMCA
            if (!this.canJump || this.jumpCount >= this.maxJumps) return; 
    
            this.jumpCount++; // Cada vez que salta añade al contador.
    
            /* SOLUCION AL BUG - Si haces un nuevo salto mientras sigue cayendo,
            para el fall() anterior que era lo que lo bugeaba - AMCA
            if (this.gravityInterval) {
                clearInterval(this.gravityInterval);
                this.gravityInterval = null;
            }
    
            let maxHeight = this.y - 140; 
            this.jumpInterval = setInterval(() => { //Guarda el intervalo de salto
                if (this.y > maxHeight) {
                    this.y -= 15;
                    this.updPosition();
                } else {
                    clearInterval(this.jumpInterval);
                    this.jumpInterval = null;
                    this.fall(); 
                }
            }, 20);
        */
    }

    fall(){
        this.falling = true;
        this.fallInterval = setInterval(() => {
            if(this.y < 335){
                this.y += 10;
                this.element.classList.remove("jump");
                this.element.classList.add("fall");
            } else {
                this.element.classList.remove("fall");
                /* ----- CORECCION DE NICO ----- */
                clearInterval(this.fallInterval);
                this.fallInterval = null;
                this.falling = false;
                this.jumpingAir = true; 
                this.y = 335;
                this.actualizarPosicion();
                return;
                /* ----------------------------- */
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

function startGame(){
    const menuStart = document.getElementById("menu-start");
    menuStart.style.display = "none";
    const music = document.getElementById("gameMusic");
    const game = new Game();
    music.play();
    console.log(game);
}

window.startGame = startGame;