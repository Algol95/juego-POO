// Class

class Game {

    constructor(maxScore){
        this.container = document.getElementById("game-container");
        this.character = null;
        this.ravens = [];
        this.floppys = [];
        this.score = 0
        this.maxScore = maxScore;
        this.backgroundMusic = new Audio("./src/sounds/bg-music-michiverse.mp3");
        this.backgroundMusic.loop = true;
        this.backgroundMusic.volume = 0.4;
        this.backgroundMusic.play();
        this.victoryMusic = new Audio("./src/sounds/win.mp3")
        this.victoryMusic.loop = false;
        this.musicPlaying = true;
        this.btnMusic = document.getElementById("btnMusic");
        this.scoreInterface = document.getElementById("scoreInterface");
        this.collisionInterval = null;
        this.victoryInterval = null;
        this.keydownMove = (e) => this.character.move(e);
        this.buildScenario();
        this.addEvents();
        this.checkVictory();
        this.viewScore();
    }

    buildScenario(){
        this.character = new Character();
        this.container.appendChild(this.character.element);
        for (let index = 0; index < this.maxScore; index++) {
            const floppy = new Floppy();
            this.floppys.push(floppy);
            this.container.appendChild(floppy.element);
        }
        const raven = new Raven();
        this.ravens.push(raven);
        this.container.appendChild(raven.element);
    }

    addEvents(){
        window.addEventListener("keydown", this.keydownMove);
        this.checkCollisions();
        //Agrega el evento de música
        this.btnMusic.addEventListener("click",()=>this.toggleMusic());
    }

    checkCollisions(){
        this.collisionInterval = setInterval(() => {
            this.floppys.forEach((floppy, index) => {
                if (this.character.collisionWith(floppy)) {
                    floppy.sndColl.play();
                    this.container.removeChild(floppy.element);
                    this.floppys.splice(index,1)
                    this.score++
                    console.log(this.score);
                    this.viewScore();
                }
            })
        },100);
    }
    /*
    Pausa o inicia la música de fondo según el el valor de this.musicPlaying,
    lo cambia a su valor contrario y cambia el icono del speaker. ------ AMCA
    */
    toggleMusic(){
        if (this.musicPlaying){
            this.backgroundMusic.pause();
            this.btnMusic.innerHTML = '<i class="bi bi-volume-mute-fill"></i>'
        } else {
            this.backgroundMusic.play();
            this.btnMusic.innerHTML = '<i class="bi bi-volume-up-fill"></i>'
        }
        this.musicPlaying = !this.musicPlaying;
    }

    /* Checkea si se cumple la condición para alcanzar la victoria, remueve los intervalos y eventos para que se para el juego --- AMCA */
    checkVictory(){
        this.victoryInterval = setInterval(() => {
        if(this.floppys.length === 0){
            const menuVictory = document.getElementById("menu-victory");
            window.removeEventListener("keydown",this.keydownMove);
            this.backgroundMusic.pause();
            this.victoryMusic.play();
            menuVictory.style.display = "block";
            this.ravens.forEach(raven => {
                clearInterval(raven.moveInterval);
            });
            clearInterval(this.victoryInterval);
        }
        },100);
    }

    //Método que muestra por pantalla nuestra puntuación --- AMCA
    viewScore(){
        this.scoreInterface.innerHTML = `${this.score} / ${this.maxScore} <i class='bi bi-floppy2-fill'></i>`;
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
        this.element.classList.add("right");
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
                this.actualizarPosicion;
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

    collisionWith(obj){
        return (
            this.x < obj.x + obj.width &&
            this.x + this.width > obj.x &&
            this.y < obj.y + obj.height &&
            this.y + this.height > obj.y
          );
    }

}

class Floppy {
    constructor(){
        this.x = Math.random() * 700 + 50;
        this.y = Math.random() * 250 + 50;
        this.width = 30;
        this.height = 30;
        this.sndColl = new Audio ("./src/sounds/sndCollect.mp3")
        this.sndColl.volume = 0.5;
        this.element = document.createElement("div");
        this.element.classList.add("floppy");
        this.updPosition();
    }

    updPosition(){
        this.element.style.left = `${this.x}px`
        this.element.style.top = `${this.y}px`
    }
}

class Raven{
    constructor(){ 
        this.x = Math.random() * 700 + 20;
        this.y = 150;
        this.width = 76;
        this.height = 52;
        this.speed = 10;
        this.moveLeft = true;
        this.moveInterval = null;
        this.element = document.createElement("div");
        this.element.classList.add("raven");
        this.updPosition();
        this.move();
    }

    updPosition(){
        this.element.style.left = `${this.x}px`
        this.element.style.top = `${this.y}px`
    }

    move(){
       this.moveInterval = setInterval(() => {
            if (this.moveLeft) {
                this.x -= this.speed;
                this.element.classList.remove("right");
                if (this.x <= 0) this.moveLeft = false; // Cambia dirección
            } else {
                this.element.classList.add("right");
                this.x += this.speed;
                if (this.x >= 720) this.moveLeft = true; // Cambia d
                // irección
            }
            this.updPosition();
        }, 40);
    }
}

function startGame(){
    const menuStart = document.getElementById("menu-start");
    menuStart.style.display = "none";
    const game = new Game(3);
}

function restart(){
    location.reload();
}

window.restart = restart;
window.startGame = startGame;