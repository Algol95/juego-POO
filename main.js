
/** 
 * Script principal del juego
 * @author {Ángel Aragón} 
 * @version 1.1
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
        this.section = document.getElementById("section-game");
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
        this.checkVictory();
        this.viewScore();
    }

    /** Construye el escenario del juego */
    buildScenario() {
        this.character = new Character();
        this.container.appendChild(this.character.element);
        this.character.addTouchControls();

        for (let i = 0; i < this.maxScore; i++) {
            const floppy = new Floppy();
            this.floppys.push(floppy);
            this.container.appendChild(floppy.element);
        }
        switch (this.level) {
            case 1:
                this.ravens.push(new Raven(Math.random() * 700 + 20, 150, 5));
                break;
            case 2:
                this.ravens.push(new Raven(Math.random() * 700 + 20, 150, 5));
                this.ravens.push(new Raven(Math.random() * 700 + 20, 50, 10));
                break;
            case 3:
                this.ravens.push(new Raven(Math.random() * 700 + 20, 150, 5));
                this.ravens.push(new Raven(Math.random() * 700 + 20, 50, 10));
                this.ravens.push(new Raven(720,300,20));
                break;
            default:
                this.ravens=[];
        }
        for (let i = 0; i < this.ravens.length; i++) {
            this.container.appendChild(this.ravens[i].element);
        }
    }

    /** Agrega los eventos del juego */
    addEvents() {
        window.addEventListener("keydown", this.keydownMove);
        this.checkCollisions();
        this.btnMusic.addEventListener("click", () => this.toggleMusic());
    }

    
    /** "Destruye" la instancia de class */
    destroy() {

        clearInterval(this.collisionInterval);
        clearInterval(this.victoryInterval);
        window.removeEventListener("keydown", this.keydownMove);
        this.container.innerHTML = "";
        this.backgroundMusic.pause();
        this.backgroundMusic = null;

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

    
    /** Chekea si se cumple la condición de victoria o de siguiente nivel */
    checkVictory() {
        this.victoryInterval = setInterval(() => {
            if (this.floppys.length === 0) {
                clearInterval(this.collisionInterval);
                clearInterval(this.victoryInterval);
                window.removeEventListener("keydown", this.keydownMove);
                if (this.level < 3) {
                    this.nextLevel();
                } else {
                    this.winGame();
                }
            }
        }, 100);
    }

    
    /** Método que cambia al siguiente nivel */
    nextLevel() {
        const menuLevel = document.getElementById("menu-level");
        menuLevel.innerHTML = `<h1><i class="bi bi-award"></i> <br />NIVEL ${this.level+1} ALCANZADO</h1>
        <p>
          ¡Ánimo ya te queda poco!
        </p>
        <button id="btnNextLevel"><i class="bi bi-play-fill"></i> Next</button>`
        menuLevel.style.display = "block";
        document.getElementById("btnNextLevel").onclick = () => {
            menuLevel.style.display = "none";
            this.restartGame(this.level+1, this.maxScore+2);
        };
    }

    
    /** Método para desplegar menú de victoria */
    winGame() {
        this.backgroundMusic.pause();
        this.victoryMusic.play();
        this.ravens.forEach(raven => {
            raven.speed = 0;
        });
        document.getElementById("menu-victory").style.display = "block";
    }

    
    /** Método para desplegar menu de fin */
    endGame() {
        clearInterval(this.collisionInterval);
        window.removeEventListener("keydown", this.keydownMove);
        this.backgroundMusic.pause();
        this.endMusic.play();
        this.ravens.forEach(raven => {
            raven.speed = 0;
        });
        document.getElementById("menu-end").style.display = "block";
    }

    
    /** Visualiza la puntuación y le nivel actual en la interfaz del juego */
    viewScore() {
        let msgLvl = this.level == 0 ? "Tutorial <i class='bi bi-journal-bookmark-fill'></i>" : `Nivel ${this.level} <i class="bi bi-caret-up-square-fill"></i>`
        this.scoreInterface.innerHTML = `${msgLvl} &nbsp;&nbsp; ${this.score} / ${this.maxScore} <i class='bi bi-floppy2-fill'></i>`;
    }

    
    /**
     * Método que inicia un nivel nuevo
     *
     * @param {number} level Valor dle siguiente nivel
     * @param {number} maxScore Cantidad de floppys a recoger
     */
    restartGame(level, maxScore) {
        this.destroy();
        this.container.innerHTML = `<div class="menu" id="menu-victory">
        <h1><i class="bi bi-trophy"></i> <br />¡Michifantástico!</h1>
        <p>
          Has recogido todos los michicódigos y ahora los michis pueden abir el michiportal para
          viajar a NipParadise
        </p>
        <button onclick="restart()"><i class="bi bi-arrow-clockwise"></i> Restart</button>
      </div>
      <div class="menu" id="menu-end">
        <h1><i class="bi bi-heartbreak"></i> <br />END GAME</h1>
        <p>
          ¡No te ríndas, vuelve a intentarlo! ¡Los michis te necesitan!
        </p>
        <button onclick="restart()"><i class="bi bi-arrow-clockwise"></i> Restart</button>
      </div>
      <div class="menu" id="menu-level">
        
      </div>
      <div class="interface">
        <div id="scoreInterface"></div>
        <button id="btnMusic"><i class="bi bi-volume-up-fill"></i></button>
      </div>
      <div class="interface-bot"><i class="bi bi-arrow-left-circle interface-bot-bi" id="touchLeft"></i>
        <i class="bi bi-arrow-up-circle interface-bot-bi" id="touchTop"></i>
        <i class="bi bi-arrow-right-circle interface-bot-bi" id="touchRight"></i>
      </div>`;
        const interfaceBot = document.getElementsByClassName("interface-bot");
        if (isMobile()){
            interfaceBot[0].style.display = "block"
        }
        new Game(level, maxScore);
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
    
        if ((event.key === "ArrowRight" || event.target?.id === "touchRight") && this.x + this.speed <= screenWidth) {
            this.x += this.speed;
            this.element.classList.add("right");
        } else if ((event.key === "ArrowLeft" || event.target?.id === "touchLeft") && this.x - this.speed >= 0) {
            this.x -= this.speed;
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
                this.y += 7.5;
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
     * Inicializa un objeto de tipo Raven.
     *
     * @constructor
     * @param {number} x Coordenadas en el eje x
     * @param {number} y Coordenadas en el eje y
     * @param {speed} speed Velocidad del objeto Raven
     */
    constructor(x,y,speed){ 
        super(x, y, 40,20,speed,"raven")
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
        }, 60);
    }
}

let game;

/** Fúnción que comienza el juego. */
function startGame(){
    const menuStart = document.getElementById("menu-start");
    const interfaceBot = document.getElementsByClassName("interface-bot");
    if (isMobile()){
        interfaceBot[0].style.display = "block"
    }
    menuStart.style.display = "none";
    game = new Game(0, 3);
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


window.game = game;
window.isMobile = isMobile;
window.restart = restart;
window.startGame = startGame;
