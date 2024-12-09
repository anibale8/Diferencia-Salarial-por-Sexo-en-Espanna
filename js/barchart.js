/**
 * @file Script con las funciones específicas del bar chart, ademas de toda la funcionalidad de los radio button que estan asociados al grafico.
 * @author Anibal Hernando Novo
 */


/**
 * Selecciona los datos de un sexo en concreto
 * @param {JSON} data Datos de los que se quiere obtener el subconjunto
 * @param {String[]} sexos sexo a seleccionar de los datos
 */
function seleccionarDatosSexos(data, sexos) {
    var dataSelec = [];
    data.forEach(function (d) {
        if (sexos.includes(d.Genero)) {
            dataSelec.push(d);
        }
    })
    return dataSelec;
}

/**
 * Carga el grafico correspondiente segun el radio button seleccionado.
 */
function cargarGrafRadioSeleccionado() {
    // Obtener todos los radio buttons de la tab activa
    var radios = document.getElementsByName("sexos-barchart");
    
    // Buscar el radio button seleccionado
    var radioSeleccionado;
    for (var i = 0; i < radios.length; i++) {
        if (radios[i].checked) {
            radioSeleccionado = radios[i];
            break;
        }
    }

    // Verificar si se encontró un radio button seleccionado
    if (radioSeleccionado) {
        cambioRadioSexo(radioSeleccionado);
        
    }
}

/**
 *  @param {HTMLElement} radio El radio button seleccionado.
 */
function cambioRadioSexo(radio) {
    // Obtener el valor seleccionado
    var valorSeleccionado = radio.value;

    // Eliminar el anterior svg en caso de que hubiese (sino no hace nada)
    d3.select("#barras").selectAll("svg").remove();
  
    // Ejecutar la funcion correspondiente segun el valor
    switch (valorSeleccionado) {
        case 'both':
            dibujarGrafico3(["both"]);
            break;
        case 'male':
            dibujarGrafico3(["male"]);
            break;
        case 'female':
            dibujarGrafico3(["female"]);
            break;
    }
}


function dibujarGrafico3(sexos){
     // Crear SVG
     d3.csv("./datasets/cyl_dataset.csv").then(function (data) {
        // Verifica si los datos están siendo cargados correctamente
        console.log("Datos leídos correctamente:", data);
        
        // Configuración del gráfico
        var margin = { top: 20, right: 10, bottom: 70, left: 150 },
            width = window.innerWidth - 150 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;
        
        var dataSel = seleccionarDatosSexos(data, sexos);
        console.log("Datos seleccionados:", dataSel);
        
        // Crear el SVG para el gráfico
        var svg = d3.select("#barras").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Definir la escala del eje X
        var x = d3.scaleBand()
            .domain(dataSel.map(function (d) { return d.Periodo; })) // Asegúrate de que `d.Periodo` existe
            .range([0, width]);

        // Crear el eje X
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).tickFormat(d3.format(".0f")))
            .selectAll("text")
            .style("text-anchor", "end")
            .style("font-size", "18px")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");

        // Definir la escala del eje Y
        var y = d3.scaleLinear()
            .domain([15000, 30000]) // Ajusta el dominio según los valores
            .range([height, 0]);
        
        // Crear el eje Y
        svg.append("g")
            .call(d3.axisLeft(y).ticks(4))
            .style("font-size", "15px");
        
        // Añadir el grid del eje Y
        svg.append("g")
            .attr("class", "grid")
            .call(d3.axisLeft(y)
                .tickSize(-width)
                .tickFormat("")
            );

        // Definir el tooltip
        var tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background", "#f8f8f8")
            .style("border", "1px solid #ccc")
            .style("padding", "8px")
            .style("border-radius", "4px")
            .style("box-shadow", "0 0 10px rgba(0, 0, 0, 0.2)");

    

        // //Dibuja las barras de Castilla y León
        svg.selectAll(".barCastilla")
            .data(dataSel) // Usa dataSel directamente
            .enter().append("rect")
            .attr("class", "barCastilla")
            .attr("x", function(d,i) {
                // Desplazar las barras para que se dibujen una al lado de la otra
                // Usamos un pequeño desplazamiento para España
                return x(d.Periodo) + (x.bandwidth() / 4); 
            })
            .attr("width", x.bandwidth() / 4) // La mitad del ancho para que las barras no se sobrepongan
            .attr("y", height)
            .attr("height", 0)
            .transition()
            .duration(1500)
            .attr("y", function(d) { return y(d.CastillayLeon); })
            .attr("height", function(d) { return height - y(d.CastillayLeon) })
            .attr("fill", "yellow"); // Color para España (puedes ajustar esto a un color que prefieras)

        //Dibuja barras de España
         svg.selectAll(".barEspana")
            .data(dataSel) // Usa dataSel directamente
            .enter().append("rect")
            .attr("class", "barEspana")
            .attr("x", function(d,i) {
                // Desplazar las barras para que se dibujen una al lado de la otra
                // Usamos un pequeño desplazamiento para España
                return x(d.Periodo)  + (x.bandwidth() / 2); // Desplazar un poco más para las barras de España
            })
            .attr("width", x.bandwidth() / 4) // La mitad del ancho para que las barras no se sobrepongan
            .attr("y", height)
            .attr("height", 0)
            .transition()
            .duration(1500)
            .attr("y", function(d) {
                // Para las barras de España
                return y(d.Espanna);
            })
            .attr("height", function(d) {
                return height - y(d.Espanna); // Altura proporcional a los salarios de España
            })
            .attr("fill", "red"); // Color para España (puedes ajustar esto a un color que prefieras)

          
    
        // Eventos de ratón
        // Agregamos eventos de ratón para las barras de Castilla y Leon
        svg.selectAll(".barCastilla")
            .on("mouseover", function (event, d) {
            // Resaltar la barra, haciéndola más grande (aumentando el tamaño de la barra)
            d3.select(this)
                .transition()
                .duration(100)
            tooltip.transition()
                .duration(100)

            // Actualizar el contenido del tooltip de CyL
            tooltip.html("Castilla y León: " + (+d.CastillayLeon).toFixed(2) + "€ de salario");

            // Mostrar el tooltip con la posición correcta
            tooltip.transition()
                .duration(100)
                .style("visibility", "visible")
                .style("left", (event.pageX + 10) + "px")  // Posicionar el tooltip en el eje X
                .style("top", (event.pageY + 10) + "px")   // Posicionar el tooltip en el eje Y
                .style("background", "yellow");  // Cambiar el color del fondo del tooltip

            })
            .on("mouseout", function () {
                // Restaurar la barra a su tamaño original
                d3.select(this)
                    .transition()
                    .duration(100)
                // Ocultar el tooltip
                tooltip.transition()
                    .duration(100)
                    .style("visibility", "hidden");
            });

        // Agregamos eventos de ratón para las barras de
         svg.selectAll(".barEspana")
            .on("mouseover", function (event, d) {
            // Resaltar la barra, haciéndola más grande (aumentando el tamaño de la barra)
            d3.select(this)
                .transition()
                .duration(100)
            tooltip.transition()
                .duration(100)

            // Actualizar el contenido del tooltip de CyL
            tooltip.html("España: " + (+d.Espanna).toFixed(2) + "€ de salario");

            // Mostrar el tooltip con la posición correcta
            tooltip.transition()
                .duration(100)
                .style("visibility", "visible")
                .style("left", (event.pageX + 10) + "px")  // Posicionar el tooltip en el eje X
                .style("top", (event.pageY + 10) + "px")   // Posicionar el tooltip en el eje Y
                .style("background", "red");  // Cambiar el color del fondo del tooltip

            })
            .on("mouseout", function () {
                // Restaurar la barra a su tamaño original
                d3.select(this)
                    .transition()
                    .duration(100)
                // Ocultar el tooltip
                tooltip.transition()
                    .duration(100)
                    .style("visibility", "hidden");
            });

    }) 
}


// Inicializar el gráfico con los datos por defecto (Ambos sexos)
// dibujarGrafico3(['both']);

// // Agregar eventos a los checkboxes
// document.getElementById("ambos").addEventListener("change", function() {
//     var sexos = obtenerSexoSeleccionado();
//     console.log("entraaa")
//     dibujarGrafico3(sexos);
// });

// document.getElementById("mujeres").addEventListener("change", function() {
//     var sexos = obtenerSexoSeleccionado();
//     dibujarGrafico3(sexos);
// });

// document.getElementById("hombres").addEventListener("change", function() {
//     var sexos = obtenerSexoSeleccionado();
//     dibujarGrafico3(sexos);
// });
