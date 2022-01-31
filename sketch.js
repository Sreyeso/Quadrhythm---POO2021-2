//Variables gráficas
let width;        //Ancho de la ventana
let height;       //Largo de la ventana
let x;
let y;

//Variables del juego
let game='0';     //0-menu inicial 1-juego 2-editor 3-exit
let px;           //Coordenada en x del jugador 
let py;           //Coordenada en y del jugador
let gx;           //Coordenada en x de la meta
let gy;           //Coordenada en y de la meta
let lvl;          // Objeto donde se guarda el nivel actual (modo jugar)

//Elementos DOM
let canvas;
let menu;
let test="bien";
//let button;

//Clase principal
class nivel {

  //añadir variable nombre y tutorial,
  //dependiendo del nivel, puede haber o no tutorial.
  //añadir metodo para imprimir este nombre encima del nivel, 
  //y el tutorial por debajo
  constructor(filas,columnas,layout,tamcasilla){

    //Definidos por constructor
    this.f=filas;
    this.c=columnas;
    this.layout=layout;//Disposicion del nivel (arreglo)
    this.tamcasilla=tamcasilla;

    //Definidos por inicializacion
    this.tablero=[];//Representacion del nivel (matriz)
    this.xini=0; //Posicion inicial del jugador en x
    this.yini=0; //Posicion inicial del jugador en y
    this.xfin=0; //Posicion en x de la casilla final
    this.yfin=0; //Posicion en y de la casilla final

    //Definido por calculo automatico 

    //Centrado del tablero
    this._ajustex=((width-(this.f*this.tamcasilla))*0.5);
    this._ajustey=((height-(this.c*this.tamcasilla))*0.5);
    
    this.inicializar();  
  }

  inicializar() {
    for (let i = 0; i < this.c; i++) {
      let fila = [];
      for (let j = 0; j < this.f; j++) {

        //leer la disposicion del tablero (guardar las propiedades de la casilla)
        let prop = this.layout[(i * (this.f)) + j];
        let propcomp = prop[0] + prop[1] + prop[2];
        
        //Ubicar la casilla inicial
        if (propcomp == "20n") {
          this.xini = i;
          this.yini = j;
        }
        //Ubicar la casilla final
        if (propcomp == "30n") {
          this.xfin = i;
          this.yfin = j;
        }

        //crear el objeto casilla con las propiedades que va en esa posicion del tbalero
        let cas = new casilla(int(prop[0]), int(prop[1]), prop[2]);
        fila.push(cas);
      }
      this.tablero.push(fila);
    }
  }

  dibujar() {
    //Recorrer el tablero
    for (let i = 0; i < this.c; i++) {
      for (let j = 0; j < this.f; j++) {
        //Ajuste centrado
        let x = this._ajustex + (j * this.tamcasilla);
        let y = this._ajustey + (i * this.tamcasilla);
        //Traer las propiedades de la casilla actual
        let cas = this.tablero[i][j];


        push(); //Graba la configuración actual de estilo de dibujo
        stroke("black");
        fill(cas.color);
        strokeWeight(1);
        
        //Imprimir la casilla
        rect(x, y, this.tamcasilla, this.tamcasilla);
        if (cas.tipo != 0) {

          fill("white");
          textStyle("italic");
          textSize(this.tamcasilla * 0.45);

          if (cas.n != 0) {
            //Imprimir el numero de la casilla
            text(cas.n, x + this.tamcasilla / 2.6, y + this.tamcasilla / 1.5);
          }

        }
        pop(); //Deja la configuracion del estilo de dibujo como estaba antes del push
      }
    }
  }
}

//Clase secundaria
class casilla {
  constructor(tipo, numero, objeto) {

    //Definidas por constructor
    this.n = numero;
    this.objeto = objeto;
    this.tipo = tipo;

    //Valor por defecto (definida por inicializacion)
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
  completar(){
    this.tipo=4;
    this.inicializar();
  }
}

//Funcion utilizada para iniciar/cambiar un nivel.
//->   Migrar a un archivo txt donde cada fila sea un nivel,
//     leerlos de ahi y seleccionar
function inicializarlvl(filas, columnas, layout, tamcasilla) {
  lvl = new nivel(filas, columnas, layout, tamcasilla);
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
  background('mediumpurple');
  showMenu();
  width = windowWidth;
  height = windowHeight;

  inicializarlvl(7, 3,
    [
      "00n","00n","00n","00n","00n","00n","00n",
      "00n","20n","52n","10n","62n","30n","00n",
      "00n","00n","00n","00n","00n","00n","00n"
    ],
    45); 
  
}

//Ajuste dinamico de la distribución
function windowResized() {
  width = windowWidth;
  height = windowHeight;
}
//Funcion (ojala temporal?) de menu
function showMenu(){
menu = Swal.fire({
    title: 'Not ADOFAI WIP',
    showDenyButton: true,
    reverseButtons: true,
    allowOutsideClick: false,
    confirmButtonText: 'Jugar',
    denyButtonText: 'Editor',
    confirmButtonColor: 'chartreuse',
    cancelButtonColor: 'tomato',    
  }).then((result) => {
    if (result.isConfirmed) {
      game='1';
      startGame();
      
    }
    else{  
      game='2';
      startEditor();
    }
  });
}

//(Posible funcion para el editor, talvez sea mejor encapsularla en clase)
//perdoname por las atrocidades que voy a cometer en este codigo
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
    inputPlaceholder: 'Selecciona un tamaño',
    showCancelButton: true,
    inputValidator: (value) => {
      return new Promise((resolve) => {
        if (value) {
          resolve();
        } else {
          resolve('ERROR');
        }
      });
    }
  
  });
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
    inputPlaceholder: 'Selecciona un tamaño',
    showCancelButton: true,
    inputValidator: (value) => {
      return new Promise((resolve) => {
        if (value) {
          resolve();
        } else {
          resolve('ERROR');
        }
      });
    }

  });
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
    45);
    
  
}

//fin del equivalente de Auchwitz







//0-menu inicial 1-juego 2-editor 3-exit
function draw() {

  /* image(menu,windowWidth * 0.4, windowHeight * 0.2);
  menu.background('red');
  menu.text('Menu Principal',10,10); */
  switch(game){//Control del juego
    case('0'): //Volver al menu
      clear();
      background('mediumpurple');
    break;
    case('1'): //Juego

    background('mediumpurple');
  
    text(test,50,50);

    //Imprimir el nivel
    lvl.dibujar();

    //Imprimir al jugador
    x = lvl._ajustex + (int(py) * lvl.tamcasilla);
    y = lvl._ajustey + (int(px) * lvl.tamcasilla);

    push();
    strokeWeight(5.5);
    stroke("darkorchid");
    noFill();
    rect(x,y,lvl.tamcasilla,lvl.tamcasilla);
    pop();

    //Control del jugador
    //CONDICIONES DE MOVIMIENTO
    //No se puede mover hacia una casilla gris
    //No se puede mover hacia la izquierda ->
    //al salir de una casilla, la anterior se marca como completada
    //No se puede mover hacia una casilla completada
    //No se puede mover desde una casilla cuyo numero no sea 0
    //Condicion de victoria 
    if (px == lvl.xfin && py == lvl.yfin) {
      print("gg");
      game = '0';
      //alerta
      Swal.fire({
        title: '<b> Nivel Completado ! </b>',
        showDenyButton: true,
        focusConfirm: true,
        reverseButtons: true,
        allowOutsideClick: false,
        confirmButtonText: 'Siguiente',
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
      );
    }

    break;

    case('2'): //Editor
      background('mediumpurple');
      text(test,50,50);
  
      //Imprimir el nivel
      lvl.dibujar();
  
      //Imprimir al jugador
      x = lvl._ajustex + (int(py) * lvl.tamcasilla);
      y = lvl._ajustey + (int(px) * lvl.tamcasilla);
  
      push();
      strokeWeight(5.5);
      stroke("darkorchid");
      noFill();
      rect(x,y,lvl.tamcasilla,lvl.tamcasilla);
      pop();

    break;
    default:
      alert('chao');
    break;
  }

}

function keyPressed(){
  switch(game){//Control del juego
    case('1'):
    switch(keyCode){
      case(RIGHT_ARROW):
      if(
        lvl.tablero[px][py+1].tipo!=0 &&
        lvl.tablero[px][py].n==0
        ){
        py+=1;
        lvl.tablero[px][py-1].completar();
        test='Bien';
      }else{
        test='mal';
      }
      break;
    }
    break;
    case('2'):
    switch(keyCode){
      //Movimiento de seleccionar casilla
      case(RIGHT_ARROW):
        py+=1;
        py=py%lvl.f;
      break;
      case(LEFT_ARROW):
        if(py<=0){
        py=lvl.f-1;
        }else{
          py-=1;
        }
      break;
      case(DOWN_ARROW):
        px+=1;
        px=px%lvl.c;
      break;
      case(UP_ARROW):
        if(px<=0){
        px=lvl.c-1;
        }else{
          px-=1;
        }
      break;
      //Asignar propiedades a la casilla hovereada
      case(90):
        lvl.tablero[px][py].tipo=5;
        lvl.tablero[px][py].inicializar();
      break;

      default:
        break;
    }
    break;

  }
    
  
  
}
