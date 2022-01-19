//Variables gráficas
let width;        //Ancho de la ventana
let height;       //Largo de la ventana
let ajustex;      //Centrado en x dinamico
let ajustey;      //Centrado en y dinamico

//Variables del juego
let px;           //Coordenada en x del jugador 
let py;           //Coordenada en y del jugador
let gx;           //Coordenada en x de la meta
let gy;           //Coordenada en y de la meta

//Elementos DOM
let canvas;       

//Clase principal
class nivel{

  //añadir variable nombre y tutorial,
  //dependiendo del nivel, puede haber o no tutorial.
  //añadir metodo para imprimir este nombre encima del nivel, 
  //y el tutorial por debajo
  constructor(filas,columnas,layout,x,y,tipolvl,tamcasilla){
    this.f=filas;
    this.c=columnas;
    this.layout=layout;
    this.x=x;
    this.y=y;
    this.tipolvl=tipolvl;
    this.tablero=[];
    this.xini=0;
    this.yini=0;
    this.tamcasilla=tamcasilla;
    this.inicializar();  
  }
  inicializar(){
    for(let i=0;i<this.c;i++){
      let fila=[];
      for(let j=0;j<this.f;j++){
        let prop=this.layout[(i*(this.f))+j];
        let propcomp=prop[0]+prop[1]+prop[2];
        if(propcomp=="20n"){
          this.xini=i;
          this.yini=j;
        }
        if(propcomp=="30n"){
          this.xfin=i;
          this.yfin=j;
        }
        let cas = new casilla(int(prop[0]),int(prop[1]),prop[2]);
        fila.push(cas);
      }
      this.tablero.push(fila);
    }
  }
  dibujar(){
    for(let i=0;i<this.c;i++){
      for(let j=0;j<this.f;j++){
        let x = (ajustex*(2/this.f))+(j*this.tamcasilla);
        let y = (ajustey*(2/this.c))+(i*this.tamcasilla);
        let cas = this.tablero[i][j];
        stroke("black");
        fill(cas.color);
        strokeWeight(1);
        rect(x,y,this.tamcasilla,this.tamcasilla);
        if(cas.tipo!=0){
          fill("white");
          textStyle("italic");
          textSize(this.tamcasilla*0.45);
          if(cas.n!=0){
            text(cas.n,x+this.tamcasilla/2.6,y+this.tamcasilla/1.5);
          }  
        }
      }
    }
  }
}

//Clase secundaria
class casilla{
  constructor(tipo,numero,objeto){
    this.n=numero;
    this.objeto=objeto;
    this.tipo=tipo;
    this.color=('white');
    this.inicializar();
  }
  inicializar(){
    switch(this.tipo){
      case(0): //Casilla negra (limite del nivel)
        this.color=('lightsteelblue');
      break;
      case(1): //Casilla vacía (cualquier dirección)
        this.color=('white');
      break;
      case(2): //Casilla de inicio
        this.color=('darkkhaki');
      break;
      case(3): //Casilla final
        this.color=('chartreuse');
      break;
      case(4): //Casilla completada
        this.color=('aquamarine');
      break;
      case(5): //Casilla azul (tecla z)
        this.color=('firebrick');
      break;
      case(6): //Casilla roja (tecla x)
        this.color=('lightskyblue');
      break;
      default:
        this.color=('purple');
    }
  }
}

//Variables de prueba
let lvl;
let game=false;

//Funcion utilizada para iniciar/cambiar un nivel.
//->   Migrar a un archivo txt donde cada fila sea un nivel,
//     leerlos de ahi y seleccionar
function inicializarlvl(filas,columnas,layout,x,y,tipolvl,tamcasilla){
  lvl = new nivel(filas,columnas,layout,x,y,tipolvl,tamcasilla);
  game=true;
  px=lvl.xini;
  py=lvl.yini;
  gx=lvl.xfin;
  gy=lvl.yfin;
}

function setup() {

  frameRate(30); 
  //Ajuste del canvas por posicion absoluta
  canvas=createCanvas(windowWidth, windowHeight);
  canvas.position=(0,0);

  //Declarar valores por defecto (lo ideal es que sean dinamicos)
  width=windowWidth;
  height=windowHeight;

}

//Ajuste dinamico de la distribución
function windowResized(){
  width=windowWidth;
  height=windowHeight;
}

//(Temporal, la seleccion de niveles sera controlada por una variable)
function mouseClicked(){
  inicializarlvl(7,3,
    [
      "00n","00n","00n","00n","00n","00n","00n",
      "00n","20n","52n","10n","62n","30n","00n",
      "00n","00n","00n","00n","00n","00n","00n"
    ],
    0,0,1,60);
}

function draw() {

  background('mediumpurple');

  
  if(game){
    //Imprimir el nivel
    lvl.dibujar();
    //Imprimir al jugador
    let x = (ajustex*(2/lvl.f))+(int(py)*lvl.tamcasilla);
    let y = (ajustey*(2/lvl.c))+(int(px)*lvl.tamcasilla);
    strokeWeight(5.5);
    stroke("darkorchid");
    noFill();
    rect(x,y,lvl.tamcasilla,lvl.tamcasilla);

    //Control del jugador
    //CONDICIONES DE MOVIMIENTO
    //No se puede mover hacia una casilla gris
    //No se puede mover hacia la izquierda ->
    //al salir de una casilla, la anterior se marca como completada
    //No se puede mover hacia una casilla completada
    //No se puede mover desde una casilla cuyo numero no sea 0
    
    if(keyIsDown(RIGHT_ARROW)){
      py+=0.5;
    }
    //Condicion de victoria 
    if(px==lvl.xfin && py==lvl.yfin){
      print("gg");
      game=false;
    }
  }
  
  //Elementos dinamicos
  ajustex=(width/2);
  ajustey=(height/2);
}