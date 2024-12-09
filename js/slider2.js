/**
 * @file Script con la funcionalidad del slider del mapa
 * @author Anibal Hernando Novo
 * Realizado a parte para facilitar la actualizacion de la etiqueta del año en tiempo de deslizamiento
 */

var output =document.getElementById("actYear2");
var slider =document.getElementById("year2").oninput=function(){
    output.innerHTML=this.value;
}