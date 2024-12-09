/**
 * @file Script con las funciones específicas del line chart
 * @author Anibal Hernando Novo
 */

const COLORES = {"both": "orange","female": "green", "male": "blue"};

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
 * Selecciona los datos de unas fechas en concreto. 
 * @param {JSON} data Datos de los que se quiere obtener el subconjunto. 
 * @param {String[]} fechas Fechas para las que seleccionar los datos. 
 * @returns 
 */
function filtrarFecha(data, fechas){
    var dataSelec = [];
    
    data.forEach(function(d){
        if(fechas.indexOf(d.Periodo)>-1){
            dataSelec.push(d);
        }
        
    })
    return dataSelec;
}

/**
 * Animaciones de las lineas del line chart
 * @param {*} path 
 */
function transition(path) {
    path.transition()
        .duration(4000)
        .attrTween("stroke-dasharray", tweenDash)
        .on("end", () => { d3.select(this).call(transition); });
}

function tweenDash() {
    if (this instanceof Window)
        return;
    const l = this.getTotalLength(),
        i = d3.interpolateString("0," + l, l + "," + l);
    return function (t) { return i(t) };
}

/**
 * Dibuja el gráfico de la pestaña 1, correspondiente al line chart
 * @param {String[]} sexos permite seleccionar el grupo de genero que se quiere representar
 * @param {int} comunidad permite seleccionar entre 'Hombres' y 'Mujeres'
 * @param {String[]} fechas intervalo de fechas que se muestran
 */

function dibujarGrafico1(sexos, comunidad, fechas) {
    d3.csv("./datasets/lineChart_dataset.csv").then(function (data) {
        var margin = { top: 20, right: 10, bottom: 70, left: 150 },
            width = window.innerWidth - 150 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;
        
        data = filtrarFecha(data, fechas);
        
        var tituloY = "Comunidades";
        // Tratamiento de datos
        data.forEach(function (d) {
           switch(comunidad){
            case 0:
                d.Comunidad = +d.Andalucia;
                break;
            case 1:
                d.Comunidad = +d.Aragon;
                break;
            case 2:
                d.Comunidad = +d.PrincipadoDeAsturias;
                break;
            case 3:
                d.Comunidad = +d.IslasBaleares;
                break;
            case 4:
                d.Comunidad = +d.Canarias;
                break;
            case 5:
                d.Comunidad = +d.Cantabria;
                break;
            case 6:
                d.Comunidad = +d.CastillaLaMancha;
                break;
            case 7:
                d.Comunidad = +d.CastillayLeon;
                break;
            case 8:
                d.Comunidad = +d.Cataluna;
                break;
            case 9:
                d.Comunidad = +d.ComunidadValenciana;
                break;
            case 10:
                d.Comunidad = +d.Extremadura;
                break;
            case 11:
                d.Comunidad = +d.Galicia;
                break;
            case 12:
                d.Comunidad = +d.ComunidadDeMadrid;
                break;
            case 13:
                d.Comunidad = +d.RegionDeMurcia;
                break;
            case 14:
                d.Comunidad = +d.Navarra;
                break;
            case 15:
                d.Comunidad = +d.PaisVasco;
                break;
            case 16:
                d.Comunidad = +d.LaRioja;
                break;
           }
        })

        var dataSel = seleccionarDatosSexos(data, sexos);

        // Añadimos el svg al HTML
        var svg = d3.select("#serie")
            .append("svg")
            .attr("width", "100%")
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("width", "100%")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Agrupamos los datos por sexo para que cada linea del line chart represente una grupo de sexo
        var agrupados = d3.nest()
            .key(function (d) { return d.Genero; })
            .entries(dataSel);


        // Añadimos el eje X
        var x = d3.scaleTime()
            .domain(d3.extent(data, function (d) { return d.Periodo }))
            .rangeRound([0, width]);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).tickFormat(d3.format(".0f")).ticks(fechas.length))
            .selectAll("text")
            .style("text-anchor", "end")
            .style("font-size", "18px")  // Aumenta el tamaño de la fuente
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)")

        // Añadimos el eje Y
        var y = d3.scaleLinear()
            .domain([15000, 35000])
            .range([height, 0]);
        
        var y_axis = d3.axisLeft(y).ticks(5);
        svg.append("g")
            .call(y_axis)
            .style("font-size", "15px") 

        // Dibujamos las líneas
        svg.selectAll(".line")
            .data(agrupados)
            .enter()
            .append("path")
            .call(transition) // animación
            .attr("fill", "none")
            .attr("stroke", function (d) { return COLORES[d.key] }) // Elegimos los mismos colores
            .attr("stroke-width", 1.5)
            .attr("d", function (d) {
                return d3.line()
                    .x(function (d) { return x(d.Periodo); })
                    .y(function (d) { return y(d.Comunidad); })
                    (d.values)
            });

        // Añadimos el grid del eje X
        svg.append("g")
            .attr("class", "grid")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).ticks(39) // queremos todas las marcas
                .tickSize(-height)
                .tickFormat("")
            )
            .attr("color", "lightGrey");

        // Añadimos el grid del eje Y
        svg.append("g")
            .attr("class", "grid")
            .call(y_axis
                .tickSize(-width)
                .tickFormat("")
            );
        
        // Título del eje Y
        // Cambia en función de la comunidad seleccionado
        switch(comunidad){
            case 0:
                tituloY = "Evolución salarial en Andalucía";
                break;
            case 1:
                tituloY = "Evolución salarial en Aragón";
                break;
            case 2:
                tituloY = "Evolución salarial en Asturias";
                break;
            case 3:
                tituloY = "Evolución salarial en Islas Baleares";
                break;
            case 4:
                tituloY = "Evolución salarial en Canarias";
                break;
            case 5:
                tituloY = "Evolución salarial en Cantabria";
                break;
            case 6:
                tituloY = "Evolución salarial en Castilla La Mancha";
                break;
            case 7:
                tituloY = "Evolución salarial en Castilla y León";
                break;
            case 8:
                tituloY = "Evolución salarial en Cataluña";
                break;
            case 9:
                tituloY = "Evolución salarial en Valencia";
                break;
            case 10:
                tituloY = "Evolución salarial en Extremadura";
                break;
            case 11:
                tituloY = "Evolución salarial en Galicia";
                break;
            case 12:
                tituloY = "Evolución salarial en Madrid";
                break;
            case 13:
                tituloY = "Evolución salarial en Murcia";
                break;
            case 14:
                tituloY = "Evolución salarial en Navarra";
                break;
            case 15:
                tituloY = "Evolución salarial en País Vasco";
                break;
            case 16:
                tituloY = "Evolución salarial en La Rioja";
                break;
           }
        
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 50 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text(tituloY);

        // Etiquetas de los puntos del line chart. Solo serán visibles cuando se active el evento mouseover
        // Muestran los datos de empleo
        var tooltip = d3.select('#serie').append('div')
                    .style("position", "absolute")
                    .style("visibility", "hidden")
                    .style("padding", "8px")
                    .style("background-color", "#bc3a3a")
                    .style("opacity", "1")
                    .style("stroke", "black")
                    .style("border-style", "solid")
                    .style("border-width", "1px")
                    .style("text-align", "center")
                    .style("color", "white")
                    .style("font-size", "small")
                    .text("");
        
        var sexo = svg.selectAll(".sexo")
            .data(agrupados)
            .enter().append("g")
            .attr("class", "sexo");

        // Añadimos los puntos
        sexo.selectAll("circle")
            .data(function (d) { return d.values })
            .enter()
            .append("circle")
            .attr("r", 5)
            .attr("cx", function (d) { return x(d.Periodo); })
            .attr("cy", function (d) { return y(d.Comunidad); })
            .style("fill", function (d) { return COLORES[d.Genero]; })
            .on("mouseover", function (event) {
                d3.select(this).transition()
                    .duration('100')
                    .attr("r", 8); // el punto se hace mas grande cuando el ratón está encima
                tooltip.transition()
                    .duration(100)
                    
                tooltip.html((this.__data__.Comunidad) + "€ de salario");
                tooltip.style("visibility", "visible")
                    .style("left", (event.pageX + 10)  + "px")
                    .style("top", (event.pageY + 10) + "px" )
                    .style("background", COLORES[this.__data__.Genero]);

            })
            // Cuando se retira el cursor, se oculta la etiqueta y el punto vuelve al tamaño original
            .on("mouseout", function () {
                d3.select(this).transition()
                    .duration('100')
                    .attr("r", 5);
                // desaparecer etiquetas
                tooltip.transition()
                    .duration(100)
                    .style("visibility", "hidden");
            });
    })
}