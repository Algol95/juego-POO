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
            this.canJump = true; // Opcional - Me permite meter un delay después de cada salto - AMCA
            this.jumpCount = 0; // Opcional - Lleva la cuenta del numero de saltos - AMCA
            this.maxJumps = 2; // Opcional - Lo he metido para que salte un máximo de veces - AMCA
            this.jumpInterval = null;   // Para guardar el intervalo de salto - AMCA
            this.gravityInterval = null; // Para guardar el intervalo de caída - AMCA
            this.isFalling = false // A veces se puede ejecutar la caida fall() dos veces, esto me permite controlarlo. - AMCA
            this.element = document.createElement("div");
            this.element.classList.add("character");
            this.updPosition();
        }
    
        move(event){
            if(event.key === "ArrowRight"){
                this.x += this.speed;
            } else if (event.key === "ArrowLeft"){
                this.x -= this.speed;
            } else if(event.key === "ArrowUp"){
                this.jump();
            }
            this.updPosition();
        }
    
        jump(){
            // Si tiene el maximo de saltos se va fuera y no ejecuta el método - AMCA
            // También he añadido delay entre salto y salto una vez toque el suelo - AMCA
            if (!this.canJump || this.jumpCount >= this.maxJumps) return; 
    
            this.jumpCount++; // Cada vez que salta añade al contador.
    
            /* SOLUCION AL BUG - Si haces un nuevo salto mientras sigue cayendo,
            para el fall() anterior que era lo que lo bugeaba - AMCA*/
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
        }
    
        fall(){
            if (this.isFalling) return; // Evita que la gravedad se active dos veces - AMCA

            this.gravityInterval = setInterval(() => {
                if(this.y < 300) {
                    this.y += 9.8;
                    this.updPosition();
                } else {
                    clearInterval(this.gravityInterval);
                    this.gravityInterval = null;
                    this.jumpCount = 0;  
                    
                    //Bloquea el salto 300ms antes de permitir otro salto - AMCA
                    this.canJump = false;
                    setTimeout(() => {
                        this.canJump = true;
                    }, 300);
                }
            }, 20);
        }
    
        updPosition(){
            this.element.style.left = `${this.x}px`;
            this.element.style.top = `${this.y}px`;
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