var width = 960;
var height = 700;

const dims = { height: 300, width: 300, radius: 150 };
const cent = { x: (dims.width / 2 + 5), y: (dims.height / 2 + 5) };

var projection = d3.geoMercator()
    .center([0, 10])
    .scale(6000)
    .translate([17480, 4550])
    .rotate([-180, 0]);

var path = d3.geoPath()
    .projection(projection);

var svg = d3.select(".canvas").append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("background", "white");

var groupMap = svg.append("g").attr("width", width).attr("height", height);
var groupPieChart = svg.append("g").attr("width", dims.width + 150).attr("height", dims.height + 150).attr("transform", "translate(600,250)");
const pie = d3.pie().sort(null).value(d => d.broj_zarazenih);

const angles = pie([
    { "Male": "kk", "broj_zarazenih": 150 },
    { "Male": "kksasa", "broj_zarazenih": 50 },
    { "Male": "kksasa", "broj_zarazenih": 100 }
]);


const tip = d3.tip()
    .attr("class", "tip card");

groupMap.call(tip);

const arcPath = d3.arc().outerRadius(dims.radius).innerRadius(dims.radius / 2);

console.log(arcPath(angles[0]));




d3.json("cro_regv3.json").then((cro) => {
    var data = topojson.feature(cro, cro.objects.layer1);


    ///skaliraj po max i min vrijednosti
    var skala = d3.scaleLinear()
        .domain([d3.min(data.features, d => d.properties.broj_zarazenih), d3.max(data.features, d => d.properties.broj_zarazenih)])
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
        .on("click", (d, i) => {


            d3.json("poOsobama.json").then((data) => {
                var musko = 0;
                var zensko = 0;
                console.log(data);
                data.forEach(element => {
                    if (element.spol == "M" && element.Zupanija == i.properties.name) {
                        musko++;
                    } else if (element.spol == "Ž" && element.Zupanija == i.properties.name) {
                        zensko++;
                    }
                });
                var ukupno = musko + zensko;
                console.log(ukupno);
                console.log((musko / ukupno) * 100);
                console.log((zensko / ukupno) * 100);
            });
        })
        .on("mouseover", (d, i, n) => {

            handleHover(i);
        })
        .on("mouseout", (d) => {
            handleHoverOut(d);
        });

});




function handleHover(d) {
    d3.select(event.target).style("opacity", 0.5);
    tip.html((d) => {

        return `${d.properties.name} <br> Broj zaraženih: ${d.properties.broj_zarazenih} <br> Broj umrlih: ${d.properties.broj_umrlih} `
    });
    tip.show(d, event.target);
}

function handleHoverOut(d) {
    tip.hide()
    d3.select(event.target).style("opacity", 1);
}
groupPieChart.append('circle')
    .attr('cx', 100)
    .attr('cy', 100)
    .attr('r', 50)
    .attr('stroke', 'black')
    .attr('fill', '#69a3b2')
    .on("mouseover", (d) => {
        console.log(event);
    });
