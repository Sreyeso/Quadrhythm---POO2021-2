//Variables gráficas
let width;        //Ancho de la ventana
let height;       //Largo de la ventana

//Variables del juego
let px;           //Coordenada en x del jugador 
let py;           //Coordenada en y del jugador
let gx;           //Coordenada en x de la meta
let gy;           //Coordenada en y de la meta

//Elementos DOM
let canvas;
let menu;
//let button;

//Clase principal
class nivel {

  //añadir variable nombre y tutorial,
  //dependiendo del nivel, puede haber o no tutorial.
  //añadir metodo para imprimir este nombre encima del nivel, 
  //y el tutorial por debajo
  constructor(filas, columnas, layout, tipolvl, tamcasilla) {
    this.f = filas;
    this.c = columnas;
    this.layout = layout;
    this.tipolvl = tipolvl;
    this.tablero = [];
    this.xini = 0;
    this.yini = 0;
    this.xfin = 0;
    this.yfin = 0;
    this.tamcasilla = tamcasilla;
    this.inicializar();
    this.ajustex = ((width - (this.f * this.tamcasilla)) * 0.5);
    this.ajustey = ((height - (this.c * this.tamcasilla)) * 0.5);
  }
  inicializar() {
    for (let i = 0; i < this.c; i++) {
      let fila = [];
      for (let j = 0; j < this.f; j++) {
        let prop = this.layout[(i * (this.f)) + j];
        let propcomp = prop[0] + prop[1] + prop[2];
        if (propcomp == "20n") {
          this.xini = i;
          this.yini = j;
        }
        if (propcomp == "30n") {
          this.xfin = i;
          this.yfin = j;
        }
        let cas = new casilla(int(prop[0]), int(prop[1]), prop[2]);
        fila.push(cas);
      }
      this.tablero.push(fila);
    }
  }
  dibujar() {
    for (let i = 0; i < this.c; i++) {
      for (let j = 0; j < this.f; j++) {
        let x = this.ajustex + (j * this.tamcasilla);
        let y = this.ajustey + (i * this.tamcasilla);
        let cas = this.tablero[i][j];
        stroke("black");
        fill(cas.color);
        strokeWeight(1);
        rect(x, y, this.tamcasilla, this.tamcasilla);
        if (cas.tipo != 0) {
          fill("white");
          textStyle("italic");
          textSize(this.tamcasilla * 0.45);
          if (cas.n != 0) {
            text(cas.n, x + this.tamcasilla / 2.6, y + this.tamcasilla / 1.5);
          }
        }
      }
    }
  }
}

//Clase secundaria
class casilla {
  constructor(tipo, numero, objeto) {
    this.n = numero;
    this.objeto = objeto;
    this.tipo = tipo;
    this.color = ('white');
    this.inicializar();
  }
  inicializar() {
    switch (this.tipo) {
      case (0): //Casilla negra (limite del nivel)
        this.color = ('lightsteelblue');
        break;
      case (1): //Casilla vacía (cualquier dirección)
        this.color = ('white');
        break;
      case (2): //Casilla de inicio
        this.color = ('darkkhaki');
        break;
      case (3): //Casilla final
        this.color = ('chartreuse');
        break;
      case (4): //Casilla completada
        this.color = ('aquamarine');
        break;
      case (5): //Casilla azul (tecla z)
        this.color = ('lightskyblue');
        break;
      case (6): //Casilla roja (tecla x)
        this.color = ('firebrick');
        break;
      default:
        this.color = ('purple');
    }
  }
}

//Variables de prueba
let lvl;
let game = false;

//Funcion utilizada para iniciar/cambiar un nivel.
//->   Migrar a un archivo txt donde cada fila sea un nivel,
//     leerlos de ahi y seleccionar
function inicializarlvl(filas, columnas, layout, x, y, tipolvl, tamcasilla) {
  lvl = new nivel(filas, columnas, layout, x, y, tipolvl, tamcasilla);
  game = true;
  px = lvl.xini;
  py = lvl.yini;
  gx = lvl.xfin;
  gy = lvl.yfin;
}

function setup() {

  frameRate(60);
  //Ajuste del canvas por posicion absoluta
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.position = (0,0);
  //menu = createGraphics(windowWidth*0.1,windowHeight*0.1);
  width = windowWidth;
  height = windowHeight;
  //Declarar valores por defecto
  //menu
  showMenu();
  //menu.createButton('click me');
  //button.mousePressed(delete menu);
}

//Ajuste dinamico de la distribución
function windowResized() {
  width = windowWidth;
  height = windowHeight;
}
//Funcion (ojala temporal?) de menu
function showMenu(){
menu = Swal.fire({
    title: 'Not AOFI WIP',
    showDenyButton: true,
    reverseButtons: true,
    allowOutsideClick: false,
    confirmButtonText: 'Jugar',
    denyButtonText: 'Editor',
    confirmButtonColor: 'chartreuse',
    cancelButtonColor: 'tomato',    
  }).then((result) => {
    if (result.isConfirmed) {
      startGame();
      
    }
    else{
      startEditor();
    }
  })
}

//(Temporal, la seleccion de niveles sera controlada por una variable)
function startGame() {
  inicializarlvl(7, 3,
    [
      "00n", "00n", "00n", "00n", "00n", "00n", "00n",
      "00n", "20n", "52n", "10n", "62n", "30n", "00n",
      "00n", "00n", "00n", "00n", "00n", "00n", "00n"
    ],
    1, 45);
}

//(Posible funcion para el editor, talvez sea mejor encapsularla en clase)
//perdoname por las atricidades que voy a cometer en este codigo
//altamente WIP
let elvl;
//let elx;
//let ely;
let epx;
let epy;
let egx;
let egy;
let elayout;
let lvlinput;
function genArray(x) {
  let array = [];
  for (let i = 0; i < x; i++) {
    array[i] = "00n";
  }
  return array;
}
async function startEditor(){
  const {value:elx}=await Swal.fire({
    title: 'Escoje valor x',
    input: 'select',
    inputOptions: {
        '1': '1',
        '2': '2',
        '3': '3',
        '4': '4',
        '5': '5',
        '6': '6',
        '7': '7',
        '8': '8',
        '9': '9'
    
  },
    inputPlaceholder: 'Selecciona un tamanio',
    showCancelButton: true,
    inputValidator: (value) => {
      return new Promise((resolve) => {
        if (value) {
          resolve()
        } else {
          resolve('ERROR')
        }
      })
    }
  
  })
  if (elx) {
    Swal.fire('Elegiste: '+elx);
    JSON.stringify(elx);
  }
  const { value: ely } = await Swal.fire({
    title: 'Escoje valor y',
    input: 'select',
    inputOptions: {
      '1': '1',
      '2': '2',
      '3': '3',
      '4': '4',
      '5': '5',
      '6': '6',
      '7': '7',
      '8': '8',
      '9': '9'

    },
    inputPlaceholder: 'Selecciona un tamanio',
    showCancelButton: true,
    inputValidator: (value) => {
      return new Promise((resolve) => {
        if (value) {
          resolve()
        } else {
          resolve('ERROR')
        }
      })
    }

  })
  if (ely) {
    Swal.fire('Elegiste: ' + ely);
    JSON.stringify(ely);
  }
  //Falta generacion de matriz segun parametros, recorrido y cambio de propiedades, almacenamiento JSON, modo para edicion ((!game)?)
  
  /* elvl = new nivel(ely, elx,
    [ "00n", "00n", "00n", "00n", "00n", "00n", "00n",
    "00n", "20n", "52n", "10n", "62n", "30n", "00n"]
    ,2,45); */
  inicializarlvl(parseInt(elx), parseInt(ely),
    genArray(elx*ely),
    1, 45);
}

//fin del equivalente de Auchwitz
function draw() {

  background('mediumpurple');
  
  /* image(menu,windowWidth * 0.4, windowHeight * 0.2);
  menu.background('red');
  menu.text('Menu Principal',10,10); */
  
  

  if (game) {

    //Imprimir el nivel
    lvl.dibujar();

    //Imprimir al jugador
    let x = lvl.ajustex + (int(py) * lvl.tamcasilla);
    let y = lvl.ajustey + (int(px) * lvl.tamcasilla);

    strokeWeight(5.5);
    stroke("darkorchid");
    noFill();
    rect(x, y, lvl.tamcasilla, lvl.tamcasilla);

    //Control del jugador
    //CONDICIONES DE MOVIMIENTO
    //No se puede mover hacia una casilla gris
    //No se puede mover hacia la izquierda ->
    //al salir de una casilla, la anterior se marca como completada
    //No se puede mover hacia una casilla completada
    //No se puede mover desde una casilla cuyo numero no sea 0

    if (keyIsDown(RIGHT_ARROW)) {
      py += 0.5;
    }
    //Condicion de victoria 
    if (px == lvl.xfin && py == lvl.yfin) {
      print("gg");
      game = false;
      //alerta
      Swal.fire({
        title: '<b> Nivel Completado ! </b>',
        showDenyButton: true,
        focusConfirm: true,
        reverseButtons: true,
        allowOutsideClick: false,
        confirmButtonText: 'Siguente',
        denyButtonText: 'Volver al menu',
        confirmButtonColor: 'chartreuse',
        cancelButtonColor: 'tomato',

      }).then((result) => {
        if (result.isConfirmed) {
          startGame();
        }
        else {
          showMenu();
        }
      }
      )
    }
  }

}