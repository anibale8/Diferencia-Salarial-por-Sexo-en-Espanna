
/**
 * @file Script con las funciones específicas del mapa
 * @author Anibal Hernando Novo
 */


// Dimensiones del área de dibujo
const WIDTH = 1000;
const HEIGHT = 600;

// Creamos zona para el mapa
var svgWidth = WIDTH;
var svgHeight = HEIGHT - 60;

var actualSexo = 1;

/**
 * Función que redibuja el mapa con el nuevo año seleccionado
 */
function cambiar2(){
    actualYear = d3.select('#year2').property('value');
    d3.select('#actYear2').text(actualYear);
    d3.select("#mapa").selectAll("svg").remove();
    dibujarGrafico2(actualSexo);
}

/**
 * Función para dar formato a los datos leídos del fichero csv
 * @param {*} data 
 * @param {*} actualYear 
 * @param {*} dataSelec 
 * @returns datos con el formato busacdo
 */
function getDatosAño(data, actualYear, dataSelec){
    data.forEach(function (d) {
    if(d.year == actualYear){

        a={ comunidad : d.state, año: d.year, Ambos : d.average_income,
            Hombres : d.male_income, Mujeres : d.female_income, difSalarial : d.difSalarial}
        dataSelec.push(a);
    }
})
return dataSelec;

}

/**
 * Función que lee el archivo de datos
 * @param {*} actualYear 
 * @returns datos listos para ser utilizados
 */

async function lecturaComunidades(actualYear) {
    var dataSelec = [];
    await d3.csv("./datasets/map_dataset.csv").then(function (data){
        dataSelec=getDatosAño(data, actualYear, dataSelec);
    })
    return dataSelec;
}



/**
 * Función que dibuja el mapa de España por comunidades y muestra los datos con una escala de colores
 * @param {String} sexo grupo (hombres, mujeres o ambos) del que se quieren mostrar los datos
 */
async function dibujarGrafico2(sexo) {
    
    var actualYear = d3.select('#year2').property('value');
    actualSexo=sexo;

    columnas = ["Ambos", "Hombres", "Mujeres", "difSalarial"];
    var datosComunidades = lecturaComunidades(actualYear);
    
    
    d3.select('#actYear2').text(actualYear);

    d3.select("#actYear2").text(d3.select("#year2").property("value"));
    
    var dataSeleccionado;

    // Aplicamos un color a los textos visibles en función del sexo seleccionado
    if(sexo==1){   
        document.getElementById("titulo4").style.color = "green";   
        document.getElementById("actYear2").style.color = "green";   
    }     
    if(sexo==2){             
        document.getElementById("titulo4").style.color = "blue";      
        document.getElementById("actYear2").style.color = "blue";

    }
    if(sexo==3){  
        document.getElementById("titulo4").style.color = "orange";     
        document.getElementById("actYear2").style.color = "orange";   
    }

    // A partir de aquí se añaden todos los aspectos relacionados con el valor de los datos
    datosComunidades.then(value => {
        dataSeleccionado = value;
        var colorScale;
        // Asignación de color dependiendo del sexo
        if(sexo == 1){   
            colorScale = d3.scaleThreshold()         
                .domain([18000, 20000, 22000, 24000, 26000, 28000, 30000]) // Define los rangos salariales de 18000 a 32000
                .range(d3.schemeGreens[9]); // Escala de colores verde
        }  
        if(sexo == 2){   
            colorScale = d3.scaleThreshold()         
                .domain([16000, 18000, 20000, 22000, 25000, 28000, 31000]) // Rango de salarios de 16000 a 30000
                .range(d3.schemeBlues[9]); // Escala de colores azul
        }       
        if(sexo == 3){                
            colorScale = d3.scaleThreshold()         
                .domain([19000, 21000, 23000, 25000, 28000, 31000, 34000]) // Rango de salarios de 19000 a 35000
                .range(d3.schemeOranges[9]); // Escala de colores naranja
        }
        
        // Añadimos el svg al HTML
        var svg = d3.select("#mapa")
            .append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight);

        
        var projection = d3.geoConicConformalSpain();  // esta función mueve las Islas Canarias para situarlas cerca de la Península
        var geoPath = d3.geoPath().projection(projection);
        
        // Lectura del json con los datos del mapa de España
        d3.json("./datasets/mapaEsp.json").then(function(data){
            const mapageojson=topojson.feature(
                data,data.objects.autonomous_regions
            );
        
        projection.fitSize(
            [svgWidth, svgHeight],
            mapageojson
            );


        //Se crea la leyenda
    
        var legendX = 650; // Cambia para ajustar horizontalmente
        var legendY = 450; // Cambia para ajustar verticalmente
        var legendWidth = 300;
        var legendHeight = 10;

        var legend = svg.append("g")
            .attr("transform", `translate(${legendX},${legendY})`);

        legend.append("text")
        .attr("x", legendWidth / 2)
        .attr("y", legendHeight - 15)
        .style("text-anchor", "middle")
        .text("Salario Medio (miles de €)");

        legend.selectAll("rect")
            .data(colorScale.range())
            .enter().append("rect")
            .attr("x", function(d, i) { return i * (legendWidth / colorScale.range().length); })
            .attr("y", 10)
            .attr("width", legendWidth / colorScale.range().length)
            .attr("height", legendHeight)
            .style("fill", function(d) { return d; });

        
        var legendAxis = d3.axisBottom(d3.scaleLinear()
            .domain([16, 34])  // El rango de salarios en tu caso
            .range([0, legendWidth]));

        legend.append("g")
            .attr("transform", "translate(0," + (legendHeight + 20) + ")")
            .call(legendAxis);

            

        // Utilizamos 3 divs creados de forma dinámica para mostrar el nombre de la comunidad, dato de empleo y bandera
        var div = d3.select('#mapa').append('div')
        .attr('class', 'tooltip')
        .style('display', 'none');

        var div_dato = d3.select('#mapa').append('div')
        .attr('class', 'tooltip')
        .style('display', 'none');

        var div_flag = d3.select('#grupo4').append('div')
        .attr('class', 'tooltip')
        .style('display', 'none');

    
        // Se pinta el mapa
        svg.selectAll("path")
            .data(mapageojson["features"])
            .enter()
            .append("path")
            .style("stroke", "#000")
            .style("stroke-width", "0.5px")
            .attr("class", "comunidad")
            .attr("d",geoPath)             

            // Se aplica una escala de colorws diferente en funcion del dato que se quiere mostrar
            .attr("fill", function(d) {
                var dato = [];
                var dato2 = [];
                for (var i = 0; i <dataSeleccionado.length; i++) {
                    if(dataSeleccionado[i].comunidad==d.properties.NAMEUNIT && sexo==1){
                        dato=dataSeleccionado[i].Mujeres
                    }
                    if(dataSeleccionado[i].comunidad==d.properties.NAMEUNIT && sexo==2){
                        dato=dataSeleccionado[i].Hombres
                    }
                    else if(dataSeleccionado[i].comunidad==d.properties.NAMEUNIT && sexo==3){
                        dato=dataSeleccionado[i].Ambos
                        dato2=dataSeleccionado[i].difSalarial
                    }
                }
                return colorScale(dato);
            })
            
            // Añadimos un evento para cuando se pase el cursor por encima del mapa
            // Se reduce la opacidad del resto de comunidades cuando el cursor está sobre una
            .on("mouseover", function(d) {
                d3.selectAll(".comunidad")
                    .transition()
                    .duration(200)
                    .style("opacity", .5);
                // colorear
                d3.select(this)
                    .transition()
                    .duration(200)
                    .style("opacity", 1);
                // Cambiamos el display para que se haga visible
                div.style('display', 'inline')
                div_flag.style('display', 'inline')
                div_dato.style('display', 'inline');
            })


            // Evento retirar cursor
            .on("mouseleave", function(d) {
                d3.selectAll(".comunidad")
                    .transition()
                    .duration(200)
                    .style("opacity", 1)
                d3.select(this)
                    .transition()
                    .duration(200);
                // Quitamos el display para que no sea visible
                div.style('display', 'none')
                div_flag.style('display', 'none')
                div_dato.style('display', 'none')
            })

            // Mostrar en los divs creados 
            .on("mousemove", function(event) {
                var d = d3.select(this).data()[0]
                var dato;
                var dato2;
                var comunidad;
                for (var i = 0; i <dataSeleccionado.length; i++) {

                    if(dataSeleccionado[i].comunidad==d.properties.NAMEUNIT && sexo==1){
                        dato=dataSeleccionado[i].Mujeres
                        comunidad=dataSeleccionado[i].comunidad
                    }
                    if(dataSeleccionado[i].comunidad==d.properties.NAMEUNIT && sexo==2){
                        dato=dataSeleccionado[i].Hombres
                        comunidad=dataSeleccionado[i].comunidad
                    }
                    else if(dataSeleccionado[i].comunidad==d.properties.NAMEUNIT && sexo==3){
                        dato=dataSeleccionado[i].Ambos
                        comunidad=dataSeleccionado[i].comunidad
                        dato2=dataSeleccionado[i].difSalarial
                    }
                }


                // Damos estilo a los divs creados dinámicamente que contienen la información de las comunidades

                div
                .html(comunidad)
                .style('height', '100px')
                .style('width', '300px')
                .style('position', 'absolute')
                .style('left', '1477px')
                .style('top', '32%')
                .style('color', function() {
                    if (sexo == 1) return 'rgb(0, 128, 0)'; 
                    else if (sexo == 2) return 'rgb(0, 0, 255)'; 
                    else if (sexo == 3) return 'rgb(255, 165, 0)'; 
                    else return 'transparent';
                    })
                .style('border-radius', '10px')
                .style('display', 'inline')
                .style('justify-content', 'center')
                .style('align-items', 'center')
                .style('line-height', '3')
                .style('font-weight', 'bold') 
                .style('font-size', '23px')
                .style("text-align", "center");  


                div_dato
                .html(function() {
                    // Si el sexo es 'ambos', mostrar el mensaje completo
                    if (sexo == 3) {
                        return "Salario Medio: <b>" + dato + "€</b> <br>El salario de los hombres es un <br><b>" + dato2 + "% mayor</b> que el de las mujeres";
                    } else {
                        // Si no es 'ambos', solo mostrar el salario medio sin el mensaje de diferencia salarial
                        return "Salario Medio: <b>" + dato + "€</b>";
                    }
                })
                .style('height', '100px')
                .style('width', '400px')
                .style('position', 'absolute')
                .style('left', '1500px')
                .style('top', '60%')
                .style('color', function() {
                    if (sexo == 1) return 'rgb(0, 128, 0)'; 
                    else if (sexo == 2) return 'rgb(0, 0, 255)';
                    else if (sexo == 3) return 'rgb(255, 165, 0)'; 
                    else return 'transparent';
                    })
                .style('border-radius', '10px')
                .style('display', 'inline')
                .style('justify-content', 'center')
                .style('align-items', 'center')
                .style('line-height', '3')
                .style('font-weight', 'bold') 
                .style('font-size', '20px');  


                div_flag
                .html('<img src="./datasets/' + comunidad + '.png" style="width: 100%; height: auto; display: block;">')
                .style("left", "1500px")
                .style("top", "40%")
                .style("position", "absolute")
                .style("border", "2px solid black")
                .style("width", "250px")  
                .style("padding", "0") 
                .style("box-sizing", "border-box"); 
                
                

            });

            // Canarias no está en su lugar original. Añadimos un recuadro para indicarlo.
            svg
            .append("path")
              .style("fill","none")
              .style("stroke","#000")
              .attr("d", projection.getCompositionBorders());

        }).catch(err => {
            console.log(err);
        });

        })  


}
