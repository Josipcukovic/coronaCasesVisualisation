var width = 960;
var height = 700;

var projection = d3.geo.mercator()
    .center([0, 10])
    .scale(6000)
    .translate([17480, 4550])
    .rotate([-180, 0]);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("background", "white");

var groupMap = svg.append("g").attr("width", width).attr("height", height);

const tip = d3.tip()
    .attr("class", "tip card")
    .style("background-color", "#367588")
    .style("color", "white")
    .style("padding", "10px");

groupMap.call(tip);

d3.json("cro_regv3.json", function (error, cro) {
    var data = topojson.feature(cro, cro.objects.layer1);
    
///skaliraj po max i min vrijednosti
    var skala = d3.scale.linear()
              .domain([4000, 65000])
              .range([0, 6]);

    var colors = ["#ffbaba", "#ff7b7b", "#ff5252", "#ff0000", "#a70000", "#FF0800", "#7C0A02"];

    var states = groupMap.selectAll("path.county")
        .data(data.features)
        .enter()
        .append("path")
        .attr("class", "county")
        .attr("id", function (d) { return d.id; })
        .attr("d", path)
        .style("fill", function (d) {   
        	var value = Math.round(skala(d.properties.broj_zarazenih)); 
         return colors[value];
         })
        .style("stroke", "gray")
        .style("stroke-width", 1)
        .style("stroke-opacity", 1)
        .on("click", (d) => {

        })
        .on("mouseover", (d) => {
            handleHover(d);
        })
        .on("mouseout", (d) => {
            handleHoverOut(d);
        });
});


function handleHover(d){
    d3.select(event.target).style("opacity", 0.5);
    tip.html((d) => {
        return `${d.properties.name} <br> Broj zaraženih: ${d.properties.broj_zarazenih} <br> Broj umrlih: ${d.properties.broj_umrlih} `
    });
    tip.show(d, event.target);
}

function handleHoverOut(d){
    tip.hide()
    d3.select(event.target).style("opacity", 1);
}
// svg.append('circle')
//     .attr('cx', 100)
//     .attr('cy', 100)
//     .attr('r', 50)
//     .attr('stroke', 'black')
//     .attr('fill', '#69a3b2')
//     .on("mouseover", (d) => {
//         console.log(event);
//     });
