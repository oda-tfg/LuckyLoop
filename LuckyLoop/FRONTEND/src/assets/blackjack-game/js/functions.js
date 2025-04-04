//MODALIDAD CON APUESTAS , JUGADORES DINAMICOS ...

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
let cartasBarajeadas = null;
let puntos = 0;
let i = 0;
let numeroJugadores = 0;




function crearBaraja() {
    const palos = ["C", "D", "H", "S"];
    const valores = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    let cartas = [];

    for (let palo of palos) {
        for (let valor of valores) {
            cartas.push(`${valor}${palo}`);
        }
    }

    let cartasBarajeadas = _.shuffle(cartas);

    return cartasBarajeadas;
}





function puntosCartas(carta) {
    let arr = carta.split('');
    arr.pop();

    let puntos = arr.join();

    if (isNaN(puntos)) {
        if (puntos == 'A') {
            return 'AS';
        } else {
            puntos = 10;
        }
    }

    return parseInt(puntos);
}





function plantarse() {
    jugadorCartas[i].querySelector('h2').classList.remove('green');
    jugadorCartas[i].querySelector('h2').classList.add('plantado');

    let comment = document.createElement('div');
    comment.classList.add('comment');
    jugadorCartas[i].appendChild(comment);

    //si es el ultimo juega la maquina ya
    if (i == jugadorCartas.length - 1) {

        juegaMaquina();
        //añadimos el gameOver siempre que se acabe el juego
        divJugadores.classList.add('gameOver');
    } else {
        i++;
        jugadorCartas[i].querySelector('h2').classList.add('green');
    }


}





function crearPartida() {
    cartasBarajeadas = crearBaraja();//Borramos a los jugadores anteriores
    divJugadores.innerHTML = '';
    maquina.innerHTML = '';
    i = 0;
    formJugadores.style.display = 'flex';
    buttonCrearPartida.classList.add('disabled');



    buttonPedirCarta.classList.remove('disabled');
}




function pedirCarta() {

    //Creamos y añadimos la imagen de la carta 
    let nuevaCarta = document.createElement('img');
    nuevaCarta.classList.add('carta');
    nuevaCarta.src = `./images/${cartasBarajeadas[0]}.png`;

    //Si es la mquina
    if (document.querySelector('.gameOver')) {
        //Si es un AS
        if (puntosCartas(cartasBarajeadas[0]) == 'AS') {
            maquina.appendChild(nuevaCarta);
            maquina.classList.add('as');
            as();
        } else {
            //Si hay un as en sus cartas
            if (maquina.className.includes(' as')) {
                let j = 0;
                for (let puntos of jugadorPuntuacion[`Maquina`]['puntos']) {
                    puntos += puntosCartas(cartasBarajeadas[0]);
                    jugadorPuntuacion[`Maquina`]['puntos'][j] = puntos;
                    j++;
                }

                puntuacion[i].textContent = `Puntuacion: ${jugadorPuntuacion[`Maquina`]['puntos'][0]}/${jugadorPuntuacion[`Maquina`]['puntos'][1]}`;

                maquina.appendChild(nuevaCarta);

                //Si alguna de las dos puntuaciones se pasa de puntos se quita y si alguna de las dos es >=17 se para
                for (let indice in jugadorPuntuacion[`Maquina`]['puntos']) {

                    if (jugadorPuntuacion['Maquina']['puntos'][indice] >= 17) {
                        jugadorPuntuacion[`Maquina`]['puntos'] = jugadorPuntuacion['Maquina']['puntos'][indice]
                        puntuacion[i].textContent = `Puntuacion: ${jugadorPuntuacion[`Maquina`]['puntos']}`;

                        //y ya lo contamos como unas cartas normales, solo con 1 punto
                        maquina.classList.remove('as');
                        break;
                    }


                    if (jugadorPuntuacion[`Maquina`]['puntos'][indice] > 21) {
                        jugadorPuntuacion[`Maquina`]['puntos'].splice(1, indice);

                        //Dejamos solo los puntos que no se han pasado
                        jugadorPuntuacion[`Maquina`]['puntos'] = jugadorPuntuacion[`Maquina`]['puntos'][0];

                        puntuacion[i].textContent = `Puntuacion: ${jugadorPuntuacion[`Maquina`]['puntos']}`;

                        //y ya lo contamos como unas cartas normales, solo con 1 punto
                        maquina.classList.remove('as');
                        break;
                    }

                }

            } else {
                jugadorPuntuacion['Maquina']['puntos'] += puntosCartas(cartasBarajeadas[0]);
                puntuacion[i].textContent = `Puntuacion: ${jugadorPuntuacion[`Maquina`]['puntos']}`;
                maquina.appendChild(nuevaCarta);
            }
        }
    } else {

        if (puntosCartas(cartasBarajeadas[0]) == 'AS') {
            jugadorCartas[i].appendChild(nuevaCarta);
            jugadorCartas[i].classList.add('as');
            as();
        } else {
            //sumamos los puntos
            jugadorPuntuacion[`Jugador${i}`]['puntos'] += puntosCartas(cartasBarajeadas[0]);
            puntuacion[i].textContent = `Puntuacion: ${jugadorPuntuacion[`Jugador${i}`]['puntos']}`;


            buttonPlantarse.classList.remove('disabled');
            jugadorCartas[i].appendChild(nuevaCarta);


            //Si se pasa de puntos
            if (jugadorPuntuacion[`Jugador${i}`]['puntos'] > 21) {

                //Si se pasa, sus puntos realmente dan igual    --> les igualo a 1 para que la maquina les supere tirando una vez 
                jugadorPuntuacion[`Jugador${i}`]['puntos'] = 1;

                let div = document.createElement('div');
                jugadorCartas[i].appendChild(div);
                div.classList.add('comment');

                puntuacion[i].classList.add('red');
                jugadorCartas[i].querySelector('h2').classList.remove('green');
                jugadorCartas[i].querySelector('h2').classList.add('red');

                //si es el ultimo juega la maquina ya
                if (i == jugadorCartas.length - 1) {

                    juegaMaquina();

                    //añadimos el gameOver siempre que se acabe el juego
                    divJugadores.classList.add('gameOver');
                } else {
                    i++;
                    jugadorCartas[i].querySelector('h2').classList.add('green');
                }


            }
        }



    }

    cartasBarajeadas.shift();

}





function fJugadores(event) {
    event.preventDefault();

    //ocultamos el form
    formJugadores.style.display = 'none';
    numeroJugadores = document.getElementById('numeroJugadores').value;

    //Creamos i numero de jugadores
    for (let i = 0; i < numeroJugadores; i++) {
        let div = document.createElement('div');
        div.classList.add('jugador-cartas');

        let h2 = document.createElement('h2');
        h2.textContent = `Jugador ${i + 1}`

        let h3 = document.createElement('h3');
        h3.classList.add('score');
        let money = document.createElement('h3');
        money.classList.add('money');
        money.textContent = `Dinero: ${jugadorPuntuacion[`Jugador${i}`]?.dinero ?? 100} €`
        let partidasGanadas = document.createElement('h3');
        partidasGanadas.classList.add('partidasGanadas');
        partidasGanadas.textContent = `Partidas ganadas: ${jugadorPuntuacion[`Jugador${i}`]?.partidasGanadas || 0}`

        div.appendChild(h2);
        div.appendChild(h3);
        div.appendChild(money);
        div.appendChild(partidasGanadas);

        divJugadores.appendChild(div);

        //Cada jugador empieza con 0
        jugadorPuntuacion[`Jugador${i}`] = {
            'puntos': 0,
            'partidasGanadas': jugadorPuntuacion[`Jugador${i}`]?.partidasGanadas || 0,
            'dinero': jugadorPuntuacion[`Jugador${i}`]?.dinero ?? 100
        };

        if (jugadorPuntuacion[`Jugador${i}`].dinero <= 0) {
            alert(`El jugador numero ${i + 1} no tiene dinero. Esta jugando en modo sin dinero!`);
        }



    }



    //Creamos la puntuacion y el nombre de la maquina
    jugadorPuntuacion['Maquina'] = { 'puntos': 0 };
    let maquinaH2 = document.createElement('h2');
    maquinaH2.textContent = 'Maquina';
    maquina.appendChild(maquinaH2);
    let scoreMaquina = document.createElement('h3');
    scoreMaquina.classList.add('score');
    let money = document.createElement('h3');
    money.classList.add('money');

    maquina.appendChild(scoreMaquina);
    maquina.appendChild(money);


    //Puntuacion de cada jugador
    puntuacion = document.querySelectorAll('.score');


    //todos los jugadores
    jugadorCartas = document.querySelectorAll('.jugador-cartas');
    jugadorCartas[i].querySelector('h2').classList.add('green');



    //Dos cartas a cada jugador
    for (const jugador of jugadorCartas) {

        pedirCarta();
        pedirCarta();
        i++
    }

    //Una carta para la maquina
    divJugadores.classList.add('gameOver');
    pedirCarta();
    divJugadores.classList.remove('gameOver');

    //Llamamos a la funcion apuesta para que cada jugador apueste lo suyo
    apuesta();

    //Para que vuelva a empezar desde el primero
    i = 0;
}







function as() {
    //Si es la maquina
    if (document.querySelector('.gameOver')) {
        maquina.classList.add('as');
        let puntuacion1 = jugadorPuntuacion[`Maquina`]['puntos'] + 1;
        let puntuacion11 = jugadorPuntuacion[`Maquina`]['puntos'] + 11

        jugadorPuntuacion[`Maquina`]['puntos'] = [puntuacion1, puntuacion11]

        puntuacion[i].textContent = `Puntuacion: ${jugadorPuntuacion[`Maquina`]['puntos'][0]}/${jugadorPuntuacion[`Maquina`]['puntos'][1]}`;
    } else {
        let puntosAs = prompt(`Jugador ${i + 1} ¿Cuanto quieres que valga tu AS 1 o 11?`);
        jugadorPuntuacion[`Jugador${i}`]['puntos'] += parseInt(puntosAs);

        puntuacion[i].textContent = `Puntuacion: ${jugadorPuntuacion[`Jugador${i}`]['puntos']}`;
    }


}





function juegaMaquina() {

    //Deshabilitamos todos los botones porque juega la maquina
    buttonPedirCarta.classList.add('disabled');
    buttonPlantarse.classList.add('disabled');

    i++;
    let max = 0;

    //El dealer (maquina en este caso) siempre se planta cuando tenga mas que 17 o 17
    let interval = setInterval(() => {

        //La maquina para cuando supere o iguale al mejor jugador
        if (jugadorPuntuacion['Maquina']['puntos'] >= 17) {
            clearInterval(interval);
            divJugadores.classList.remove('gameOver');

            if (jugadorPuntuacion['Maquina']['puntos'] > 21) {
                jugadorPuntuacion['Maquina']['puntos'] = 1;
            }

            //siempre despues de que juegue la maquina se acaba la partida
            finPartida();
        } else {
            pedirCarta();
        }
    }, 1000)
}



function finPartida() {
    buttonCrearPartida.classList.remove('disabled');

    let j = 0;
    //Comparamos las puntuaciones para ver quien gana y quien pierde
    for (let indice in jugadorPuntuacion) {
        if (!jugadorPuntuacion[indice].partidasGanadas) {
            jugadorPuntuacion[indice].partidasGanadas = 0;
        }

        if (jugadorPuntuacion[indice].puntos > jugadorPuntuacion['Maquina'].puntos) {
            let h2 = document.createElement('h2');
            h2.textContent = 'Has ganado!';
            h2.classList.add('green');
            jugadorCartas[j].querySelector('.comment').appendChild(h2);

            jugadorPuntuacion[indice].partidasGanadas++;
            let partidasGanadas = jugadorCartas[j].querySelector('.partidasGanadas');
            partidasGanadas.textContent = `Partidas ganadas: ${jugadorPuntuacion[indice].partidasGanadas}`;
            if (jugadorPuntuacion[`Jugador${j}`].dinero <= 0) {

            } else {
                jugadorPuntuacion[`Jugador${j}`].dinero += jugadorPuntuacion[`Jugador${j}`].dineroApostado;
                jugadorCartas[j].querySelector('.money').textContent = `Dinero: ${jugadorPuntuacion[`Jugador${j}`].dinero}€`
            }
            j++;

        } else if (jugadorPuntuacion[indice].puntos == jugadorPuntuacion['Maquina'].puntos && jugadorPuntuacion[indice].puntos != 1) {
            let h2 = document.createElement('h2');
            h2.textContent = 'Has empatado!';


            jugadorCartas[j].querySelector('.comment').appendChild(h2);
            j++;
        } else {
            let h2 = document.createElement('h2');
            h2.textContent = 'Has perdido!';
            h2.classList.add('red');
            jugadorCartas[j].querySelector('.comment').appendChild(h2);

            if (jugadorPuntuacion[`Jugador${j}`].dinero <= 0) {

            } else {
                //Si pierde se le quita el dinero
                jugadorPuntuacion[`Jugador${j}`].dinero -= jugadorPuntuacion[`Jugador${j}`].dineroApostado;
                jugadorCartas[j].querySelector('.money').textContent = `Dinero: ${jugadorPuntuacion[`Jugador${j}`].dinero}€`
            }




            j++;
        }
    }



}




function apuesta() {
    //Si un jugador pone mas dinero del que tiene se les pregunta otra vez

    for (let j = 0; j < numeroJugadores; j++) {
        if (jugadorPuntuacion[`Jugador${j}`].dinero <= 0) {

        } else {
            let cantidad = parseInt(prompt(`¿Jugador ${j + 1} cuanto quieres apostar?`));
            jugadorPuntuacion[`Jugador${j}`].dineroApostado = cantidad;
        }


    }
}

export { crearBaraja, puntosCartas, plantarse, crearPartida, pedirCarta, fJugadores, as };