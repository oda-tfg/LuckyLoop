import { crearBaraja, puntosCartas,plantarse,crearPartida,pedirCarta, fJugadores, as} from "./functions.js";
import {
    buttonPedirCarta,
    buttonCrearPartida,
    buttonPlantarse,
    formJugadores,
    divJugadores,
    jugadorPuntuacion,
    maquina,
    formularioAs
} from './constantes.js';

let puntuacion = null;
let jugadorCartas = null;
let i = 0;
let numeroJugadores = 0;

//CREAR PARTIDA
buttonCrearPartida.addEventListener('click',crearPartida)

//PEDIR CARTA
buttonPedirCarta.addEventListener('click', pedirCarta);

//FORMULARIO PARA EL NUMERO DE JUGADORES POR PARTIDA
formJugadores.addEventListener('submit', fJugadores);

//BOTON PARA PLANTARSE
buttonPlantarse.addEventListener('click', plantarse);





