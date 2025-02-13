
/** 
 * Script principal del juego
 * @author {Ángel Aragón} 
 */

/**
 * Clase que simula el entorno principal del juego.
 *
 * @class Game
 * @typedef {Game}
 */
class Game {

    
    /**
     * Crea una instancia de Game
     *
     * @constructor
     * @param {number} maxScore Parametro que establece la cantidad de objetos de tipo Floppy del juego y la cantidad máxima coleccionable.
     */
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
        this.victoryMusic = new Audio("./src/sounds/win.mp3");
        this.endMusic = new Audio("./src/sounds/end.mp3");
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

    /** Construye el escenario del juego */
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

    
    /** Agrega los eventos del juego */
    addEvents(){
        window.addEventListener("keydown", this.keydownMove);
        this.checkCollisions();
        //Agrega el evento de música
        this.btnMusic.addEventListener("click",()=>this.toggleMusic());
    }

    
    /** Comprueba las colisiones entre objetos del juego */
    checkCollisions(){
        this.collisionInterval = setInterval(() => {
            this.floppys.forEach((floppy, index) => {
                if (this.character.collisionWith(floppy)) {
                    floppy.sndColl.play();
                    this.container.removeChild(floppy.element);
                    this.floppys.splice(index,1)
                    this.score++
                    this.viewScore();
                }
            })
            this.ravens.forEach((raven) => {
                if(this.character.collisionWith(raven)) this.endGame();
            });
        },100);
    }
    
    /** Pausa e inicializa la música de juego, segun si estaba sonando previamente o no. */
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

    
    /** Comprueba si se cumple la condicion de Victoria */
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

    
    /** Despliega el menú de derrota */
    endGame(){
        const menuEnd = document.getElementById("menu-end");
        menuEnd.style.display = "block";
        window.removeEventListener("keydown",this.keydownMove);
        this.backgroundMusic.pause();
        this.endMusic.play();
        this.ravens.forEach(raven => {
            clearInterval(raven.moveInterval);
        })
    }

    
    /** Muestra por pantalla la puntuación actual */
    viewScore(){
        this.scoreInterface.innerHTML = `${this.score} / ${this.maxScore} <i class='bi bi-floppy2-fill'></i>`;
    }

}


/** Clase Sprite que define el tipo de objeto básico que aparece en pantalla.
 * @class Sprite
 * @typedef {Sprite}
 */
class Sprite {
    
    /**
     * Crea una instancia de Sprite.
     *
     * @constructor
     * @param {number} x Posición en eje 'x' del sprite.
     * @param {number} y Posición en el eje 'y' del sprite.
     * @param {number} width Anchura del sprite.
     * @param {number} height Altura del sprite.
     * @param {number} speed Velocidad de movimiento del sprite.
     * @param {string} className Nombre de la clase CSS del sprite.
     */
    constructor(x,y,width, height, speed, className) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.width = width;
        this.height = height;
        this.element = document.createElement("div");
        this.element.classList.add(className);
        this.updPosition();
    }

    /** Actualiza la posición del sprite. */
    updPosition() {
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
    }

    
    /**
     * Método que comprueba si el objeto Sprite colisiona con otro pasado por parametro.
     *
     * @param {Sprite} obj Objeto de tipo Sprite o que herede de este con el que colisionamos.
     * @returns {boolean} Devuelve boolean dependiendo de si el objeto colisiona con el pasado por parametro.
     */
    collisionWith(obj){
        return (
            this.x < obj.x + obj.width &&
            this.x + this.width > obj.x &&
            this.y < obj.y + obj.height &&
            this.y + this.height > obj.y
          );
    }
}


/**
 * Clase Character que extiende de la clase Sprite. Personaje principal del juego.
 *
 * @class Character
 * @typedef {Character}
 * @extends {Sprite}
 */
class Character extends Sprite {
    /**
     * Crea una instancia de Character.
     * @constructor
     */
    constructor(){
        super(50,335,70,70,10,"character")
        this.jumpingAir = true; 
        this.jumpInterval = null;
        this.fallInterval = null;
        this.jumping = false;
        this.falling = false;
        this.element.classList.add("right");

    }

    /**
     * Método que mueve el sprite según los botones pulsados.
     * @param {*} event - Evento que condiciona el movimiento del Sprite.
     */
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

    
    /** Método que ejecuta el salto del Character
     * @modified Aplicada la correción de Nico para desbugear el bucle salto-caída en el aire.
     */
    jump(){
        
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
    }

    
    /** Metodo que aplíca la caída del personaje 
     * @modified Aplicada la correción de Nico para desbugear el bucle salto-caída en el aire.
     */
    fall(){
        this.falling = true;
        this.fallInterval = setInterval(() => {
            if(this.y < 335){
                this.y += 10;
                this.element.classList.remove("jump");
                this.element.classList.add("fall");
            } else {
                this.element.classList.remove("fall");
                clearInterval(this.fallInterval);
                this.fallInterval = null;
                this.falling = false;
                this.jumpingAir = true; 
                this.y = 335;
                this.actualizarPosicion;
                return;
            }
            this.updPosition();
        },
            20);
    }
}


/**
 * Clase Floppy que extiende de Sprite.
 *
 * @class Floppy
 * @typedef {Floppy}
 * @extends {Sprite}
 */
class Floppy extends Sprite {
    
    /**
     * Crea una instancia de Floppy.
     *
     * @constructor
     */
    constructor(){
        super(Math.random() * 700 + 50, Math.random() * 250 + 50, 30, 30, 0, "floppy");
        this.sndColl = new Audio ("./src/sounds/sndCollect.mp3")
        this.sndColl.volume = 0.5;
    }
}


/**
 * Clase Raven que extiende de la clase Sprite.
 *
 * @class Raven
 * @typedef {Raven}
 * @extends {Sprite}
 */
class Raven extends Sprite{
    
    /**
     * Crea una instancia de Raven en una posición en x aleatoria.
     * @constructor
     */
    constructor(){ 
        super(Math.random() * 700 + 20, 150,56,32,10,"raven")
        this.moveLeft = true;
        this.moveInterval = null;
        this.move();
    }

    
    /** Método que calcula el movimiento de Raven */
    move(){
       this.moveInterval = setInterval(() => {
            if (this.moveLeft) {
                this.x -= this.speed;
                this.element.classList.remove("right");
                if (this.x <= 0) this.moveLeft = false;
            } else {
                this.element.classList.add("right");
                this.x += this.speed;
                if (this.x >= 720) this.moveLeft = true; 
            }
            this.updPosition();
        }, 40);
    }
}


/** Fúnción que comienza el juego. */
function startGame(){
    const menuStart = document.getElementById("menu-start");
    menuStart.style.display = "none";
    const game = new Game(3);
}


/** Función que reinicia el juego */
function restart(){
    location.reload();
}

window.restart = restart;
window.startGame = startGame;