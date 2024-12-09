/**
 * @file Script con las funciones generales para el manejo de los graficos
 * @author Anibal Hernando Novo
 */


  //Cuando se carga la página
 $(document).ready(function () {
    let sexos = ["both", "female", "male"];
    var comunidad = 0;

    var fechas_selected = [
        "2008", "2009", "2010", "2011",
        "2012", "2013", "2014", "2015",
        "2016", "2017", "2018", "2019",
        "2020", "2021", "2022"
      ];

    // Manejador de tabs
    $('#tabs li a:not(:first)').addClass('inactive');
    $('.container').hide();
    $('.container:first').show();
    $('#tabs li a').click(function () {
        var t = $(this).attr('id');
        if ($(this).hasClass('inactive')) {
            $('#tabs li a').addClass('inactive');
            $(this).removeClass('inactive');

            $('.container').hide();
            $('#' + t + 'C').fadeIn('slow');

            // Cargamos cada tab solo cuando está seleccionado
            switch (t) {
                case "tab1":
                    d3.select("#mapa").selectAll("svg").remove();
                    document.getElementById("radiosTerminos2").value = 1;
                    dibujarGrafico2(1);
                    break;
                case "tab2":
                    d3.select("#serie").selectAll("svg").remove();
                    dibujarGrafico1(sexos, comunidad, fechas_selected);
                    break;
                case "tab3":
                    d3.select("#barras").selectAll("svg").remove();
                    cargarGrafRadioSeleccionado();
                    break;

            }
        }
    });
   
    // El mapa se carga al principio
    d3.select("#mapa").selectAll("svg").remove();
    dibujarGrafico2(1);
 
    // Gráfico 1
    // Para la selección del sexo de line chart
    $("input[type=checkbox]").change(function () {
        if (this.checked) {
            sexos.push(this.name);
        } else {
            sexos.splice(sexos.indexOf(this.name), 1);
        }
        console.log(sexos)
        d3.select("#serie").selectAll("svg").remove();
        dibujarGrafico1(sexos, comunidad, fechas_selected);
    });


    $("#selectComunidad").change(function () {
        comunidad = parseInt($(this).val());
        d3.select("#serie").selectAll("svg").remove();
        dibujarGrafico1(sexos, comunidad, fechas_selected);
    });

    // Para seleccionar las fechas con el slider
    var tooltip = d3.select('#container-slider').append('div')
                .style("position", "absolute")
                .style("visibility", "hidden")
                .style("padding", "30px")
                .style("margin-top", "4px")
                .style("height", "20px")
                .style("background-color", "lightgrey")
                .style("opacity", "1")
                .style("stroke", "black")
                .style("border-style", "solid")
                .style("border-width", "1px")
                .style("text-align", "center")
                .style("color", "black")
                .style("font-size", "small")
                .text("");
    
    var handle = $( "#custom-handle" );
    $( "#slider-range" ).slider({
        orientation: "horizontal",
        range: true,
        min: 0,
        max: 15,
        values: [ 0, 15 ],
        labels: "thtrhw ",

        create: function() {
            handle.text( $( this ).slider( "value" ) );
        },
        slide: function(event, ui) {
            tooltip.transition()
                    .duration(100)
            
            var fechas = [
                "2008", "2009", "2010", "2011",
                "2012", "2013", "2014", "2015",
                "2016", "2017", "2018", "2019",
                "2020", "2021", "2022"
                ];
            tooltip.html(fechas[ui.values[ui.handleIndex]] );
                tooltip.style("visibility", "visible")
               .style("left", event.pageX + "px")
               .style("top", (event.pageY - 50) + "px"); 
        },

        change: function(event, ui ) {

        tooltip.transition()
                .duration(100)
                .style("visibility", "hidden");
     
        var fechas = [
            "2008", "2009", "2010", "2011",
            "2012", "2013", "2014", "2015",
            "2016", "2017", "2018", "2019",
            "2020", "2021", "2022"
            ];
        fechas_selected = fechas.slice(ui.values[0], ui.values[1]+1);
        d3.select('#rangoFechas').text(fechas_selected[0] + " - " + fechas_selected.slice(-1)[0]);
        d3.select("#serie").selectAll("svg").remove();
        dibujarGrafico1(sexos, comunidad, fechas_selected);

        },
 
    });

     // Evento para el boton de restablecer parámetros
    document.getElementById("refresh-button").addEventListener("click", function() {
        location.reload(); // Esto recarga la página actual
        document.getElementById("selectComunidad").selectedIndex = 0;
        document.getElementById("mujeres").checked = true;
        document.getElementById("hombres").checked = true;
        document.getElementById("ambos").checked = true;
    });
    

    // Gráfico 2
    // Establecer el valor del slider al 2008 cuando se recarga la página
    var slider = $("input[type=range]");  // El slider
    var initialYear = 2008;  // El valor que queremos para el año inicial

    // Establecer el valor del slider a 2008
    slider.val(initialYear);
    d3.select('#actYear2').text(initialYear);
    document.getElementById("radiosTerminos2").value = "1"; 

    // Selección del sexo mostrado
    $("select").on('change', function () {
        d3.select("#mapa").selectAll("svg").remove();
        slider.val(initialYear); //Reestablece el año cada vez que se cambia de sexo
        dibujarGrafico2(this.value);
        });
    $("input[type=range]")
        .change(cambiar2);
});

