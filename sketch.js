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
let lvl;          //Objeto donde se guarda el nivel actual (modo jugar)
let pc;           //Diccionario donde se guarda el color del jugador
let combo="Bien"; //Control del movimiendo valido
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
let score;
let exportlvl;
let sldrtiming;
let sldrtext;

//Request object
let request = new XMLHttpRequest();

//Clase principal
class nivel {

  //añadir variable nombre y tutorial,
  //dependiendo del nivel, puede haber o no tutorial.
  //añadir metodo para imprimir este nombre encima del nivel, 
  //y el tutorial por debajo
  constructor(filas,columnas,layout,tamcasilla,timing){

    //Definidos por constructor
    this.f=filas;
    this.c=columnas;
    this.layout=layout;//Disposicion del nivel (arreglo)
    this.tamcasilla=tamcasilla;
    this.timing=timing;   //Valor en ms de la ventana para hacer un movimiento
                          //antes de que mande miss (limite superior)
    this.timer=this.timing; //Valor actual del timer

    //Definidos por inicializacion
    this.tablero=[]; //Representacion del nivel (matriz)
    this.xini=0; //Posicion inicial del jugador en x
    this.yini=0; //Posicion inicial del jugador en y
    this.xfin=0; //Posicion en x de la casilla final
    this.yfin=0; //Posicion en y de la casilla final
    this.contcas=0; //Cantidad de casillas asociadas al ranking final del nivel

    //Definido por calculo dinamico

    this.movfla=false; //Registro de cuando el usuario interacciona por primera vez con el tablero 
                       //(para que inicie el contador de timing)
    this.misses=0;    //Misses en 0 al inicio del lvl
    this.ranking='S'; //Ranking inicial de cada lvl

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
        
        //Contar las casillas de juego
        if (propcomp != "00n") {
          this.contcas+=1;
        }
        //Ubicar la casilla inicial
        if (propcomp == "20n") {
          this.xini = i;
          this.yini = j;
          this.contcas-=1;
        }
        //Ubicar la casilla final
        if (propcomp == "30n") {
          this.xfin = i;
          this.yfin = j;
          this.contcas-=1;
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
      case (0): //Casilla limite (limite del nivel)
          this.color = ('lightsteelblue');
          if(this.n!=0){
            this.n=0;
          }
      break;
      case (1): //Casilla vacía (cualquier dirección)
          this.color = ('white');
          if(this.n!=0){
            this.n=0;
          }
      break;
      case (2): //Casilla de inicio
          this.color = ('darkkhaki');
          if(this.n!=0){
            this.n=0;
          }
      break;
      case (3): //Casilla final
          this.color = ('chartreuse');
          if(this.n!=0){
            this.n=0;
          }
      break;
      case (4): //Casilla completada
          this.color = ('aquamarine');
      break;
      case (5): //Casilla azul (tecla z)
          this.color = ('lightskyblue');
          if(this.n==0){
            this.n=1;
          }
      break;
      case (6): //Casilla roja (tecla x)
          this.color = ('firebrick');
          if(this.n==0){
            this.n=1;
          }
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
function inicializarlvl(filas, columnas, layout, tamcasilla,timing) {
  lvl = new nivel(filas, columnas, layout, tamcasilla,timing);
  px = lvl.xini;
  py = lvl.yini;
  gx = lvl.xfin;
  gy = lvl.yfin;
  score.position(lvl._ajustex,lvl._ajustey-(2.5*lvl.tamcasilla));
}

function preload() { //Precarga de los sonidos
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
  background('mediumpurple');
  width = windowWidth;
  height = windowHeight;

  //Inicializar el Player Color (Depende de si el movimiento del jugador es valido o no)
  pc = {'Bien' : 'darkorchid' , 'mal' : 'red'}

  //Volumen
  outputVolume(0.2);

   //Elementos DOM
  score = createElement('h1',"");
    //boton exportar
  exportlvl=createButton('Exportar');
  exportlvl.position(windowWidth * 0.483,windowHeight*0.85);
  exportlvl.hide();
  exportlvl.mouseClicked(saveLevel);
    //slider timing
  sldrtiming = createSlider(100, 300, 50,100);
  sldrtiming.position(windowWidth * 0.25, windowHeight * 0.483);
  sldrtiming.style('width', '100px');
  sldrtiming.hide();
  sldrtext='';
  showMenu();
  //Volumen
  outputVolume(0.2);
  //Cargo nivel inicial
  inicializarlvl(1,1,["20n"],45,150);
  
}

//Ajuste dinamico de la distribución
function windowResized() {
  width = windowWidth;
  height = windowHeight;
}
//Carga de nivel con 2 opciones, desde JSON y desde localstorage
async function loadLevel(n,mode){
  switch(mode){
    case(0): //Carga JSON
      request.open("GET", "/levels/made/levels.json", false);
      request.send(null);
      clvl = JSON.parse(request.responseText);
      try{
      clvl= (clvl.level[n]);
      inicializarlvl(clvl.x, clvl.y, clvl.layout,clvl.tamcasilla,clvl.timing);
      }
      catch{
        showMenu();
      }
      break;
    case(1): //Carga localstorage
      let { value: odioname } = await Swal.fire({
        title: 'Nombre del nivel?',
        input: 'text',
        reverseButtons: true,
        confirmButtonColor: 'chartreuse',
        allowOutsideClick: false,
        inputValidator: (value) => {
          return new Promise((resolve) => {
            if (value) {
                resolve();
            }
            else {
              Swal.fire({
                title: 'Nivel no existe',
                toast: true,
                timer: 3000,
                confirmButtonColor: 'chartreuse'
              }).then(
                showMenu
              );
            }
          })
        }
      });
      if(odioname){      
      try{
      clvl = localStorage.getItem(odioname);
      clvl = JSON.parse(clvl);
      let clayout=[];         //Declaracion de variables locales para empaque del nivel a formato estandar
      let cvalcas;
      let ccas;
      for (let i = 0; i < clvl.y; i++) {
        for (let j = 0; j < clvl.x; j++) {
          ccas = clvl.tablero[i][j];
          cvalcas = join([str(ccas.tipo),str(ccas.n),str(ccas.objeto)],"");
          clayout.push(cvalcas);
        }
      }
      inicializarlvl(clvl.x, clvl.y, clayout, 45,clvl.timing);
    }
      catch{
        Swal.fire({
          title:'Nivel no existe',
          toast: true,
          timer:3000,
          confirmButtonColor: 'chartreuse'
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
//Esta funcion se utiliza para grabar niveles a formato JSON
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
    clvl = JSON.stringify({ x: lvl.f, y: parseInt(lvl.c), tablero: lvl.tablero, tamcasilla: 45, timing: sldrtiming.value()});
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
        game = '0';
        Swal.fire({
          title: 'Tu nivel ha sido guardado!',
          showCancelButton: true,
          reverseButtons: true,
          allowOutsideClick: false,
          confirmButtonColor: 'chartreuse',
          cancelButtonColor: 'tomato',
          confirmButtonText: 'Testear',
          cancelButtonText: 'Volver al menú'
        }).then((result)=>{
          if (result.isConfirmed) {
            clvl = JSON.parse(clvl);
            let clayout = [];         
            let cvalcas;
            let ccas;
            for (let i = 0; i < clvl.y; i++) {
              for (let j = 0; j < clvl.x; j++) {
                ccas = clvl.tablero[i][j];
                cvalcas = join([str(ccas.tipo), str(ccas.n), str(ccas.objeto)], "");
                clayout.push(cvalcas);
              }
            }
            game='0';
            inicializarlvl(clvl.x, clvl.y, clayout, 45, clvl.timing);
            game='1';
            alert(('"x":' + clvl.x + ',' + '"y": ' + clvl.y +','+ '"layout": ' + join([clayout,'",']) +','+ '"tamcasilla": ' + 45 +','+'"timing": '+ clvl.timing));
          }
          if (result.isDismissed){
            showMenu();
          }
          else{
            //showMenu();
          }
        })
        
      }
    })
    
  } 
}
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
      inicializarlvl(1, 2,["30n","20n"], 45,150);
      nlvl=-1;
      loadLevel(nlvl,1);
      game = '1';

  
    }
    if(result.isDenied) {
      game = '2';
      startEditor();
    }
  });
}
function genArray(x) {   // Generador de arreglo para tablero vacio
  let array = [];
  for (let i = 0; i < x; i++) {
    array[i] = "00n";
  }
  return array;
}
async function startEditor(){   // Empieza el editor de niveles
  let {value:elx}=await Swal.fire({
    title: 'Escoje valor x',
    input: 'select',
    inputOptions: {
      '5': '5',
      '6': '6',
      '7': '7',
      '8': '8',
      '9': '9',
      '10': '10',
      '11': '11',
      '12': '12',
      '13': '13',
      '14': '14',
      '15': '15'
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
      '5': '5',
      '6': '6',
      '7': '7',
      '8': '8',
      '9': '9',
      '10': '10',
      '11': '11',
      '12': '12',
      '13': '13',
      '14': '14',
      '15': '15'

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
  inicializarlvl(parseInt(elx),parseInt(ely),genArray(elx*ely),45,150);
}


function miss(){  //Movimiento invalido
  lvl.movfla=true;
  s_miss.play();
  lvl.misses+=1;
  combo='mal';
}

function hit(){  //Movimiento permitido
  lvl.movfla=true;
  lvl.timer=lvl.timing;
  combo='Bien';
}

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
      sldrtiming.hide();
      sldrtext='';
    break;
    case('1'): //Juego
    
    background('mediumpurple');
  
    //Imprimir el nivel
    lvl.dibujar();
    //Ranking dinamico
    score.html(lvl.ranking);
    //Imprimir la barra de timing
    push();
    stroke("black");
    fill('red');
    rect(lvl._ajustex, //Coordenada x
    lvl._ajustey-lvl.tamcasilla, //Coordenada y
    map(lvl.timer,0,lvl.timing,0,((0.5*lvl.f)*lvl.tamcasilla)), //Ancho
    (0.2*lvl.tamcasilla)); //Largo
    pop();
    //Control de la barra de timing
    if (lvl.timer>0 && lvl.movfla){
        lvl.timer-=1;
    }
    if (lvl.timer==0){
      miss();
      lvl.timer=lvl.timing;
  }

    //Imprimir al jugador
    x = lvl._ajustex + (int(py) * lvl.tamcasilla);
    y = lvl._ajustey + (int(px) * lvl.tamcasilla);

    push();
    strokeWeight(5.5);
    stroke(pc[combo]);
    noFill();
    rect(x,y,lvl.tamcasilla,lvl.tamcasilla);
    pop();

    //Scoremeter
    if(lvl.misses>lvl.contcas*0.8){
      lvl.ranking='F';
    }
    else if (lvl.misses>lvl.contcas*0.7){
      lvl.ranking='E';
    }
    else if (lvl.misses>lvl.contcas*0.6){
      lvl.ranking='D';
    }
    else if (lvl.misses>lvl.contcas*0.5){
      lvl.ranking='C';
    }
    else if (lvl.misses>lvl.contcas*0.3){
      lvl.ranking='B';
    }
    else if (lvl.misses>lvl.contcas*0.1){
      lvl.ranking='A';
    }else if (lvl.misses==0){
      lvl.ranking='S';
    }

    //Condicion de victoria 
    if (px == lvl.xfin && py == lvl.yfin) {
      score.html('');
      s_fin.play();
      game = '0';
      nlvl++;
      //alerta
      Swal.fire({
        title: '<b> Nivel Completado ! </b>',
        text:('Rango obtenido: '+ lvl.ranking),
        color:'white',
        showDenyButton: true,
        focusConfirm: true,
        reverseButtons: true,
        allowOutsideClick: false,
        confirmButtonText: 'Siguiente',
        denyButtonText: 'Volver al menú',
        confirmButtonColor: 'chartreuse',
        cancelButtonColor: 'tomato',

      }).then((result) => {
        if (result.isConfirmed) {
          game = '1';
          loadLevel(nlvl,0);           
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
      sldrtext =text('Timing: '+str(sldrtiming.value()), windowWidth * 0.25, windowHeight * 0.483);
  
      //Imprimir el nivel
      lvl.dibujar();
      //Imprimir el boton
      exportlvl.show();
      sldrtiming.show();
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
                //Control del jugador
                //CONDICIONES DE MOVIMIENTO
                //No se puede mover hacia una casilla gris
                //No se puede mover hacia la izquierda ->
                //al salir de una casilla, la anterior se marca como completada
                //No se puede mover hacia una casilla completada
                //No se puede mover desde una casilla cuyo numero no sea 0
    case('1'):  //Juego
    switch(keyCode){
      case(RIGHT_ARROW):
      if (py+1<=lvl.f){
        if(
          lvl.tablero[px][py+1].tipo!=0 &&
          lvl.tablero[px][py].n==0 &&
          lvl.tablero[px][py+1].tipo!=4
          ){
          py+=1;
          lvl.tablero[px][py-1].completar();
          s_normal.play();
          hit();
          }else{
            miss();
          }
      }else{
        miss();
      }
      break;
      case(LEFT_ARROW):
      if (py-1>=0){
        if(
          lvl.tablero[px][py-1].tipo!=0 &&
          lvl.tablero[px][py].n==0 &&
          lvl.tablero[px][py-1].tipo!=4
          ){
          py-=1;
          lvl.tablero[px][py+1].completar();
          s_normal.play();
          hit();
          }else{
            miss();
          }
      }else{
        miss();
      }
      break;
      case(UP_ARROW):
      if (px-1>=0){
        if(
          lvl.tablero[px-1][py].tipo!=0 &&
          lvl.tablero[px][py].n==0 &&
          lvl.tablero[px-1][py].tipo!=4
          ){
          px-=1;
          lvl.tablero[px+1][py].completar();
          s_normal.play();
          hit();
          }else{
            miss();
          }
      }else{
        miss();
      }
      break;
      case(DOWN_ARROW):
      if (px+1<=lvl.c){
        if(
          lvl.tablero[px+1][py].tipo &&
          lvl.tablero[px+1][py].tipo!=0 &&
          lvl.tablero[px][py].n==0 &&
          lvl.tablero[px+1][py].tipo!=4
          ){
          px+=1;
          lvl.tablero[px-1][py].completar();
          s_normal.play();
          hit();
        }else{
          miss();
        }
      }
      else{
        miss();
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
        s_zeta.play();
        hit();
      }else{
        miss();
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
        s_equis.play();
        hit();
      }else{
        miss();
      }
      break;
      default:
        miss();
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
      case(90): //Z
        lvl.tablero[px][py].tipo=5;
        lvl.tablero[px][py].n=1;
        lvl.tablero[px][py].inicializar();
      break;
      case(88): //X
        lvl.tablero[px][py].tipo=6;
        lvl.tablero[px][py].n=1;
        lvl.tablero[px][py].inicializar();
      break;
      case(49): //1
        lvl.tablero[px][py].n=1;
        lvl.tablero[px][py].inicializar();
      break;
      case(50): //2
        lvl.tablero[px][py].n=2;
        lvl.tablero[px][py].inicializar();
      break;
      case(51): //3
        lvl.tablero[px][py].n=3;
        lvl.tablero[px][py].inicializar();
      break;
      case(52): //4
        lvl.tablero[px][py].n=4;
        lvl.tablero[px][py].inicializar();
      break;
      case(53): //5
        lvl.tablero[px][py].n=5;
        lvl.tablero[px][py].inicializar();
      break;
      case(54): //6
        lvl.tablero[px][py].n=6;
        lvl.tablero[px][py].inicializar();
      break;
      case(55): //7
        lvl.tablero[px][py].n=7;
        lvl.tablero[px][py].inicializar();
      break;
      case(56): //8
        lvl.tablero[px][py].n=8;
        lvl.tablero[px][py].inicializar();
      break;
      case(57): //9
        lvl.tablero[px][py].n=9;
        lvl.tablero[px][py].inicializar();
      break;
      case(48): //0
        lvl.tablero[px][py].n=0;
        lvl.tablero[px][py].inicializar();
      break;
      case(67): //C
        lvl.tablero[px][py].tipo=1;
        lvl.tablero[px][py].inicializar();
        break;
      case(66): //B
        lvl.tablero[px][py].tipo=0;
        lvl.tablero[px][py].inicializar();
      break;
      case(83): //S
        lvl.tablero[px][py].tipo=2;
        lvl.tablero[px][py].inicializar();
      break;
      case(70): //F
        lvl.tablero[px][py].tipo=3;
        lvl.tablero[px][py].inicializar();
      break;
      default:
        break;
    }
    break;
  }
}
