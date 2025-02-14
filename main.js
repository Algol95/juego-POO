
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
     * @param {number} level Parametro que establece el nivel del juego
     * @param {number} maxScore Parametro que establece la cantidad de objetos de tipo Floppy del juego y la cantidad máxima coleccionable.
     */
    constructor(level, maxScore) {
        this.container = document.getElementById("game-container");
        this.character = null;
        this.ravens = [];
        this.floppys = [];
        this.score = 0;
        this.level = level;
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
        this.levelInterval = null;
        this.keydownMove = (e) => this.character.move(e);

        this.buildScenario();
        this.addEvents();
        this.checkLevel();
        this.viewScore();
    }

    /** Construye el escenario del juego */
    buildScenario() {
        this.character = new Character();
        this.container.appendChild(this.character.element);
        this.character.addTouchControls(); // Activa los controles táctiles dentro de Character

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
    addEvents() {
        window.addEventListener("keydown", this.keydownMove);
        this.checkCollisions();
        this.btnMusic.addEventListener("click", () => this.toggleMusic());
    }

    /** Comprueba las colisiones entre objetos del juego */
    checkCollisions() {
        this.collisionInterval = setInterval(() => {
            this.floppys.forEach((floppy, index) => {
                if (this.character.collisionWith(floppy)) {
                    floppy.sndColl.play();
                    this.container.removeChild(floppy.element);
                    this.floppys.splice(index, 1);
                    this.score++;
                    this.viewScore();
                }
            });

            this.ravens.forEach((raven) => {
                if (this.character.collisionWith(raven)) this.endGame();
            });
        }, 100);
    }

    /** Pausa o inicia la música del juego */
    toggleMusic() {
        if (this.musicPlaying) {
            this.backgroundMusic.pause();
            this.btnMusic.innerHTML = '<i class="bi bi-volume-mute-fill"></i>';
        } else {
            this.backgroundMusic.play();
            this.btnMusic.innerHTML = '<i class="bi bi-volume-up-fill"></i>';
        }
        this.musicPlaying = !this.musicPlaying;
    }

    /** Comprueba si se cumple la condición de victoria */
    checkLevel() {
        this.levelInterval = setInterval(() => {
            if (this.floppys.length === 0) {
                const menuVictory = document.getElementById("menu-victory");
                window.removeEventListener("keydown", this.keydownMove);
                this.backgroundMusic.pause();
                this.victoryMusic.play();
                menuVictory.style.display = "block";

                this.ravens.forEach(raven => {
                    clearInterval(raven.moveInterval);
                    
                });
                clearInterval(this.collisionInterval);
                clearInterval(this.victoryInterval);
            }
        }, 100);
    }

    /** Despliega el menú de derrota */
    endGame() {
        const menuEnd = document.getElementById("menu-end");
        menuEnd.style.display = "block";
        window.removeEventListener("keydown", this.keydownMove);
        this.backgroundMusic.pause();
        this.endMusic.play();

        this.ravens.forEach(raven => {
            clearInterval(raven.moveInterval);
        });
    }

    /** Muestra por pantalla la puntuación actual */
    viewScore() {
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

    
    /** Método que calcula el movimiento del sprite */
    move(){};
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
        super(50,300,70,70,20,"character")
        this.jumpingAir = true; 
        this.jumpInterval = null;
        this.fallInterval = null;
        this.jumping = false;
        this.falling = false;
        this.element.classList.add("right");
        this.sndJump = new Audio("./src/sounds/jump.mp3")
        this.sndJump.volume = 0.5;
        this.touchInterval = null;
    }

    /**
     * Método que mueve el sprite según los botones pulsados.
     * @param {*} event - Evento que condiciona el movimiento del Sprite.
     * @override
     */
    move(event) {
        const screenWidth = 720;
        const moveAmount = this.speed; 
    
        if ((event.key === "ArrowRight" || event.target?.id === "touchRight") && this.x + moveAmount <= screenWidth) {
            this.x += moveAmount;
            this.element.classList.add("right");
        } else if ((event.key === "ArrowLeft" || event.target?.id === "touchLeft") && this.x - moveAmount >= 0) {
            this.x -= moveAmount;
            this.element.classList.remove("right");
        } else if (event.key === "ArrowUp" || event.target?.id === "touchTop") {
            this.jump();
        }
    
        this.updPosition();
    }

    
    /**
     * Este método establece touchInterval como verdadero cuando se realiza el evento de tipo touchstart.
     *
     * @param {addEventListener("touchStart")} event 
     */
    touchStart(event) {
        if (this.touchInterval) return; 
        this.touchInterval = setInterval(() => {
            this.move(event); 
        }, 60); 
    }

    
    /** Este método establece touchInterval como falso cuando se realiza el evento de tipo touchend */
    touchEnd() {
        clearInterval(this.touchInterval); 
        this.touchInterval = null;
    }

    
    /** Método que agrega los eventos touch de start y end */
    addTouchControls() {
        document.getElementById("touchLeft").addEventListener("touchstart", (event) => this.touchStart(event));
        document.getElementById("touchRight").addEventListener("touchstart", (event) => this.touchStart(event));
        document.getElementById("touchTop").addEventListener("touchstart", (event) => this.touchStart(event));

        document.getElementById("touchLeft").addEventListener("touchend", () => this.touchEnd());
        document.getElementById("touchRight").addEventListener("touchend", () => this.touchEnd());
        document.getElementById("touchTop").addEventListener("touchend", () => this.touchEnd());
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
                    this.sndJump.play();
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
            if(this.y < 300){
                this.y += 10;
                this.element.classList.remove("jump");
                this.element.classList.add("fall");
            } else {
                this.element.classList.remove("fall");
                clearInterval(this.fallInterval);
                this.fallInterval = null;
                this.falling = false;
                this.jumpingAir = true; 
                this.y = 300;
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
     * Crea una instancia de Raven en una posición en x aleatoria y una "y" pasada por parametro.
     * @constructor
     */
    constructor(y){ 
        super(Math.random() * 700 + 20, y, 56,32,10,"raven")
        this.moveLeft = true;
        this.moveInterval = null;
        this.move();
    }

    constructor() {
        super(720, 300,56,32,10,"raven")
        this.moveLeft = true;
        this.moveInterval = null;
        this.move();
    }
    
    /** Método que calcula el movimiento de Raven 
     * @override
    */
    move(){
       this.moveInterval = setInterval(() => {
            if (this.moveLeft) {
                this.x -= this.speed;
                this.element.classList.remove("right");
                if (this.x <= 0) this.moveLeft = false;
            } else {
                this.element.classList.add("right");
                this.x += this.speed;
                if (this.x >= 730) this.moveLeft = true; 
            }
            this.updPosition();
        }, 50);
    }
}


/** Fúnción que comienza el juego. */
function startGame(){
    const menuStart = document.getElementById("menu-start");
    const interfaceBot = document.getElementsByClassName("interface-bot");
    if (isMobile()){
        interfaceBot[0].style.display = "block"
    }
    menuStart.style.display = "none";
    const game = new Game(3);
}


/** Función que reinicia el juego */
function restart(){
    location.reload();
}


/** Función que habilita pantalla completa */
function goFullscreen() {
    let gameContainer = document.getElementById("game-container");
    if (gameContainer.requestFullscreen) {
      gameContainer.requestFullscreen();
    } else if (gameContainer.mozRequestFullScreen) { 
      gameContainer.mozRequestFullScreen();
    } else if (gameContainer.webkitRequestFullscreen) { 
      gameContainer.webkitRequestFullscreen();
    } else if (gameContainer.msRequestFullscreen) { 
      gameContainer.msRequestFullscreen();
    }
  }

  
  /**
   * Función que devuelve un booleano si detecta que esta navegando en una tablet o movil
   * @returns {boolean} True o False : Movil/Tablet
   */
  function isMobile() {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }
  /** Habilita la pantalla completa en función del parametro.
   * @param {boolean} isMobile
   */
  if (isMobile()) {
    document.addEventListener("click", goFullscreen, { once: true });
    document.addEventListener("touchstart", goFullscreen, { once: true });
  }

window.isMobile = isMobile;
window.restart = restart;
window.startGame = startGame;
