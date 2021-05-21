var width = 670;
var height = 700;



const dims = { height: 300, width: 300, radius: 75 };
//const cent = { x: (dims.width / 2 + 5), y: (dims.height / 2 + 5) };


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

var pieChartSvg = d3.select(".canvas").append("svg")
    .attr("width", 450)
    .attr("height", 350)
    .attr("transform", "translate(0,-300)");

var groupMap = svg.append("g").attr("width", width).attr("height", height);
//piechart
var groupPieChart = pieChartSvg.append("g").attr("width", dims.width).attr("height", dims.height).attr("transform", "translate(75,100)");
var groupPieChartLegend = pieChartSvg.append("g").attr("transform", `translate(160, 30)`);

const colorsPieChart = d3.scaleOrdinal(['#72bcd4', '#ff3232']);

const legend = d3.legendColor()
    .shape("circle")
    .scale(colorsPieChart)
    .title("Postotak zaraženih prema spolu");

const pie = d3.pie().sort(null).value(d => d.value);

const arcPath = d3.arc().outerRadius(dims.radius).innerRadius(dims.radius / 2);


//pie



const tip = d3.tip()
    .attr("class", "tip card");

const tipPieChart = d3.tip().attr("class", "tip card");
groupPieChart.call(tipPieChart);


groupMap.call(tip);

const update = (data, i) => {
    console.log(data);
    console.log("ovo su podaci");

    console.log(i);
    let pieData = [];
    pieData = getDataByGender(data, i);
    //domain
    colorsPieChart.domain(pieData.map(d => d.id));
    // console.log(pieData);
    groupPieChartLegend.call(legend);



    //setting paths
    const paths = groupPieChart.selectAll("path")
        .data(pie(pieData));


    //deleting elements
    paths.exit().remove();
    ///update current elements
    paths.attr("d", arcPath)
        .transition()
        .duration(750)
        .attrTween("d", arcTweenUpdate);
    ///create elements for data provided
    console.log(pieData);

    paths.enter()
        .append("path")
        .attr("class", "arc")
        .attr("stroke", "#fff")
        .attr("stroke-width", 3)
        .attr("fill", d => colorsPieChart(d.data.id))
        .each(function (d) { this.trenutno = d })
        .transition()
        .duration(1000)
        .attrTween("d", arcTweenEnter);



    groupPieChart.selectAll('path').on("mouseover", (d, i, n) => {

        tipPieChart.html((d) => {
            return `${Math.round(d.value * 100) / 100}%`;
        })
        tipPieChart.show(i, d.target);
    }).on("mouseout", (d) => {
        tipPieChart.hide();
    })


};

function getDataByGender(data, i) {
    const newData = []

    var male = 0;
    var female = 0;

    data.forEach(element => {

        if (element.spol == "M" && element.Zupanija == i.properties.name) {
            male++;
        } else if (element.spol == "Ž" && element.Zupanija == i.properties.name) {
            female++;
        }

    });

    var total = male + female;
    newData.push({ "id": "Muškarci", "value": (male / total) * 100 });
    newData.push({ "id": "Žene", "value": (female / total) * 100 });

    return newData;
};
///mozda ti ovako nesto zatreba, ucitavas podatke samo jednom
var dataForEachPerson;
d3.json("proba.json").then((data) => {
    dataForEachPerson = data
});

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
            update(dataForEachPerson, i);
            var god018 = 0;
            var god1836 = 0;
            var god3654 = 0;
            var god5472 = 0;
            var god7290 = 0;
            var god90ilivise = 0;

            dataForEachPerson.forEach(element => {
                if ((element.dob >= 2003) && (element.Zupanija == i.properties.name)) {
                    god018++;
                } else if ((element.dob >= 1985 && element.dob < 2003) && (element.Zupanija == i.properties.name)) {
                    god1836++
                } else if ((element.dob >= 1967 && element.dob < 1985) && (element.Zupanija == i.properties.name)) {
                    god3654++
                } else if ((element.dob >= 1949 && element.dob < 1967) && (element.Zupanija == i.properties.name)) {
                    god5472++
                } else if ((element.dob >= 1931 && element.dob < 1949) && (element.Zupanija == i.properties.name)) {
                    god7290++
                } else if ((element.dob <= 1931) && (element.Zupanija == i.properties.name)) {
                    god90ilivise++
                }
                //console.log(element.dob);
            })

            // console.log(god018);
            // console.log(god1836);
            // console.log(god3654);
            // console.log(god5472);
            // console.log(god7290);
            // console.log(god90ilivise);
            //console.log(dataForEachPerson);



        })
        .on("mouseover", (d, i, n) => {

            handleHover(i, d);
        })
        .on("mouseout", (d) => {
            handleHoverOut(d);
        });

});




function handleHover(i, d) {
    d3.select(d.target).style("opacity", 0.5);
    tip.html((d) => {

        return `${i.properties.name} <br> Broj zaraženih: ${i.properties.broj_zarazenih} <br> Broj umrlih: ${i.properties.broj_umrlih} `
    });
    tip.show(i, d.target);
    //console.log(i);
};

function handleHoverOut(d) {
    tip.hide()
    d3.select(d.target).style("opacity", 1);
};


const arcTweenEnter = (d) => {
    var i = d3.interpolate(d.endAngle, d.startAngle);

    return function (t) {
        d.startAngle = i(t);
        return arcPath(d);
    }
};

function arcTweenUpdate(d) {
    var i = d3.interpolate(this.trenutno, d);

    this.trenutno = d;

    return function (t) {
        return arcPath(i(t));
    }
}