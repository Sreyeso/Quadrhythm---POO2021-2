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
let clvl;         // Objeto donde se guarda el JSON para carga de nivel
let nlvl=0;       //Contador de nivel para carga sequencial de niveles
//Variables de sonido
let s_zeta;
let s_equis;
let s_fin;
let s_normal;
let s_miss;

//Elementos DOM
let canvas;
let menu;
let test="bien";
let exportlvl;
//Request object
let request = new XMLHttpRequest();
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
  vaciar(){
    this.tipo=1;
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

function preload() {
  soundFormats('wav');
  s_zeta= loadSound('media/z.wav');
  s_equis= loadSound('media/x.wav');
  s_fin= loadSound('media/fin.wav');
  s_normal= loadSound('media/normal.wav');
  s_miss= loadSound('media/combobreak.wav');

}

function setup() {

  frameRate(60);
  //Ajuste del canvas por posicion absoluta
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.position = (0,0);
  background('mediumpurple');
  width = windowWidth;
  height = windowHeight;
  exportlvl=createButton('Exportar');
  exportlvl.position(windowWidth * 0.483,windowHeight*0.85);
  exportlvl.hide();
  exportlvl.mouseClicked(saveLevel);
  showMenu();
  //slider para tamaño de nivel
  //alerta para asignacion del nombre
  //Volumen
  outputVolume(0.2);
  //Cargo nivel inicial
  inicializarlvl(1,1["00n"],45);
  
}

//Ajuste dinamico de la distribución
function windowResized() {
  width = windowWidth;
  height = windowHeight;
}
//Carga de nivel
//decirle a tibu que toca agregar condicional para los bordes
async function loadLevel(n,mode){
  switch(mode){
    case(0): //Carga JSON
      request.open("GET", "/levels/made/levels.json", false);
      request.send(null);
      clvl = JSON.parse(request.responseText);
      clvl= (clvl.level[n]);
      inicializarlvl(clvl.x, clvl.y, clvl.layout,45);
      break;
    case(1): //Carga localstorage
      let { value: odioname } = await Swal.fire({
        title: 'Nombre del nivel?',
        input: 'text',

        showDenyButton: true,
        reverseButtons: true,
        allowOutsideClick: false,
        inputValidator: (value) => {
          return new Promise((resolve) => {
            if (value) {
              resolve();
            }
            else {
              resolve('ERROR');
              alert('juego no existe');
              showMenu();
            }
          })
        }
      })/* .then((result) => {
            if(result.isConfirmed){
              resolve();
            }
            if (result.isDenied) {
              resolve();
              showMenu();
            }
          }) */;
      if(odioname){      
      console.log(odioname);
      try{
      clvl = localStorage.getItem(odioname);
      console.log(clvl);
      inicializarlvl(clvl.x, clvl.y, clvl.layout, 45);
    }
      catch{
        Swal.fire({
          title:'Nivel no existe',
          toast: true,
          timer:3000
        }).then(
          showMenu
        );
      }
      }      
      break;
    default:
      alert('nani?!');
      break;  
  }
}
async function saveLevel() {
  /* request.open("POST", "/levels/made/" + 'test' +"_ug"+ ".json", true);
  request.setRequestHeader("Content-type","application/json");
  request.setRequestHeader("Content-length", clvl.length);
  request.setRequestHeader("Connection", "Keep-Alive");
  request.send(clvl); */
  let { value: ename } = await Swal.fire({
    title: 'Nombre del nivel?',
    input: 'text',
    showDenyButton: true,
    reverseButtons: true,
    allowOutsideClick: false,
    inputValidator: (value) => {
      if (!value) {
        return 'Escribe un nombre!'
      }
    }
  })

  if (ename) {
    clvl = JSON.stringify({ x: lvl.f, y: parseInt(lvl.c), layout: lvl.tablero });
    Swal.fire({
      title: 'Estas seguro?',
      color:'white',
      text: "Tu nivel llamado "+ename+" de "+lvl.f+"X"+lvl.c+" se guardará!",
      icon: 'warning',
      showDenyButton: true,
      reverseButtons: true,
      allowOutsideClick: false,
      confirmButtonColor: 'chartreuse',
      cancelButtonColor: 'tomato',
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Regresar'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.setItem(ename, clvl);
        Swal.fire(
          'Tu nivel ha sido guardado!',
        )
        showMenu();
      }
    })
  } 
}
//Funcion de menu encapsular la carga de esa vaina yuck y quitar async
function showMenu() {
  game = '0';
  menu = Swal.fire({
    title: 'Not ADOFAI WIP',
    showDenyButton: true,
    showCancelButton: true,
    reverseButtons: true,
    allowOutsideClick: false,
    confirmButtonText: 'Jugar',
    denyButtonText: 'Editor',
    cancelButtonText: 'Cargar',
    confirmButtonColor: 'chartreuse',
    cancelButtonColor: 'magenta',
  }).then((result) => {
    if (result.isConfirmed) {
      
      loadLevel(nlvl,0);
      game = '1';

    }
    if (result.isDismissed) {
      inicializarlvl(1, 2,["30n","20n"], 45);
      loadLevel(nlvl,1);
      game = '1';

  
    }
    if(result.isDenied) {
      game = '2';
      startEditor();
    }
  });
}
//(Posible funcion para el editor, talvez sea mejor encapsularla en clase)
//perdoname por las atrocidades que voy a cometer en este codigo
//altamente WIP
//let elvl;
//let elx;
//let ely;
//let epx;
//let epy;
//let egx;
//let egy;
//let elayout;
//let lvlinput;
function genArray(x) {
  let array = [];
  for (let i = 0; i < x; i++) {
    array[i] = "00n";
  }
  return array;
}
async function startEditor(){
  let {value:elx}=await Swal.fire({
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
    showDenyButton: false,
    reverseButtons: true,
    allowOutsideClick: false,
    //confirmButtonColor: 'chartreuse',
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
  let { value: ely } = await Swal.fire({
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
    showDenyButton: false,
    reverseButtons: true,
    allowOutsideClick: false,
    //confirmButtonColor: 'chartreuse',
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
  if (elx && ely) {
    Swal.fire('Elegiste: ' +elx+" X "+ ely);
  }
  // exportar a menu y cargar
  
  inicializarlvl(parseInt(elx),parseInt(ely),genArray(elx*ely),45);
  
  
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
      exportlvl.hide();
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
      s_fin.play();
      game = '0';
      nlvl++;
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
          game = '1';
          loadLevel(nlvl,0);
          //añadir 
        }
        else {
          nlvl = 0;
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
      //Imprimir el boton
      exportlvl.show();
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
    case('1')://Juego
    switch(keyCode){
      case(RIGHT_ARROW):
      if(
        lvl.tablero[px][py+1].tipo!=0 &&
        lvl.tablero[px][py].n==0 &&
        lvl.tablero[px][py+1].tipo!=4
        ){
        py+=1;
        lvl.tablero[px][py-1].completar();
        test='Bien';
        s_normal.play();
      }else{
        s_miss.play();
        test='mal';
      }
      break;
      case(LEFT_ARROW):
      if(
        lvl.tablero[px][py-1].tipo!=0 &&
        lvl.tablero[px][py].n==0 &&
        lvl.tablero[px][py-1].tipo!=4
        ){
        py-=1;
        lvl.tablero[px][py+1].completar();
        test='Bien';
        s_normal.play();
      }else{
        s_miss.play();
        test='mal';
      }
      break;
      case(UP_ARROW):
      if(
        lvl.tablero[px-1][py].tipo!=0 &&
        lvl.tablero[px][py].n==0 &&
        lvl.tablero[px-1][py].tipo!=4
        ){
        px-=1;
        lvl.tablero[px+1][py].completar();
        test='Bien';
        s_normal.play();
      }else{
        s_miss.play();
        test='mal';
      }
      break;
      case(DOWN_ARROW):
      if(
        lvl.tablero[px+1][py].tipo!=0 &&
        lvl.tablero[px][py].n==0 &&
        lvl.tablero[px+1][py].tipo!=4
        ){
        px+=1;
        lvl.tablero[px-1][py].completar();
        test='Bien';
        s_normal.play();
      }else{
        s_miss.play();
        test='mal';
      }
      break;
      case(90):
      if(
        lvl.tablero[px][py].tipo==5 &&
        lvl.tablero[px][py].n>0
        ){
          lvl.tablero[px][py].n-=1;
          if(lvl.tablero[px][py].n==0){
              lvl.tablero[px][py].vaciar();  
          }
        test='Bien';
        s_zeta.play();
      }else{
        test='mal';
        s_miss.play();
      }
      break;
      case(88):
      if(
        lvl.tablero[px][py].tipo==6 &&
        lvl.tablero[px][py].n>0
        ){
          lvl.tablero[px][py].n-=1;
          if(lvl.tablero[px][py].n==0){
            lvl.tablero[px][py].vaciar();  
        }
        test='Bien';
        s_equis.play();
      }else{
        s_miss.play();
        test='mal';
      }
      break;
      default:
        s_miss.play();
        test='mal';
      break;
    }
    break;
    case('2')://Editor
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
