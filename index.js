var width = 670;
var height = 650;



const dims = { height: 300, width: 300, radius: 75 };

const margin = { top: 20, right: 20, bottom: 100, left: 100 };
const graphWidth = 500 - margin.left - margin.right;
const graphHeight = 450 - margin.top - margin.bottom;


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
    .attr("class", "map")
    .style("background", "rgb(243, 241, 241)");

var pieChartSvg = d3.select(".canvas").append("svg")
    .attr("width", 400)
    .attr("height", 180)
    .attr("class", "pie");


var barGraphSvg = d3.select(".canvas").append("svg").attr("width", 600)
    .attr("height", 400).attr("class", "bar");

var zupanijaSvg = d3.select(".canvas").append("svg").attr("width", 205).attr("height", 200).attr("class", "zupanijaPrikaz");

var groupMap = svg.append("g").attr("width", width).attr("height", height).attr("transform", "translate(0,-40)");
var groupMapLegend = svg.append("g").attr("width", 700).attr("height", 200).attr("class", "mapLegend");
//piechart
var groupPieChart = pieChartSvg.append("g").attr("width", dims.width).attr("height", dims.height).attr("transform", "translate(75,100)");
var groupPieChartLegend = pieChartSvg.append("g").attr("transform", `translate(160, 30)`);
///bar
var groupBarGraph = barGraphSvg.append("g")
    .attr("width", graphWidth)
    .attr("height", graphHeight)
    .attr("transform", `translate(${margin.right + 35}, ${margin.top + 20})`);

var groupZupanija = zupanijaSvg.append("g").attr("class", "grupaZupanije");

const xAxisGroup = groupBarGraph.append("g").attr("transform", `translate(0,${graphHeight})`);
const yAxisGroup = groupBarGraph.append("g");

const colorsPieChart = d3.scaleOrdinal(['#72bcd4', '#ff3232']);

const legend = d3.legendColor()
    .shape("circle")
    .scale(colorsPieChart)
    .title("Udio zaraženih prema spolu");

const pie = d3.pie().sort(null).value(d => d.value);

const arcPath = d3.arc().outerRadius(dims.radius).innerRadius(dims.radius / 2);


//tips
const tip = d3.tip()
    .attr("class", "tip card");

const tipPieChart = d3.tip().attr("class", "tip card");
groupPieChart.call(tipPieChart);

const tipBarGraph = d3.tip().attr("class", "tip card");
groupBarGraph.call(tipBarGraph);


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
    });


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

function getDataByAge(data, i) {
    var god018 = 0;
    var god1836 = 0;
    var god3654 = 0;
    var god5472 = 0;
    var god7290 = 0;
    var god90ilivise = 0;

    data.forEach(element => {
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
    });

    var ourData = [
        { "name": "0-18", "value": god018 },
        { "name": "18-36", "value": god1836 },
        { "name": "36-54", "value": god3654 },
        { "name": "54-72", "value": god5472 },
        { "name": "72-90", "value": god7290 },
        { "name": "90+", "value": god90ilivise }
    ];

    return ourData;
}

function handleRects(ourData) {

    barGraphTitle.text(`Broj zaraženih prema dobnoj skupini`).style("font-size", 17);

    var colors = ["#C6C6C6", "#AFAFAF", "#999999", "#777777", "#555555", "#333333", "#111111"];
    /////rects
    const rects = groupBarGraph.selectAll("rect")
        .data(ourData);

    rects.exit().remove();

    rects.attr("width", xScale.bandwidth)
        .attr("fill", d => {
            var value = Math.round(colorScale(d.value));
            return colors[value];
        })
        .attr("x", d => xScale(d.name))
        .transition().duration(750)
        .attr("y", d => yScale(d.value))
        .attr("height", d => graphHeight - yScale(d.value));;

    rects.enter()
        .append("rect")
        .attr("height", 0)
        .attr("fill", d => {
            var value = Math.round(colorScale(d.value));
            return colors[value];
        })
        .attr("x", d => xScale(d.name))
        .attr("y", graphHeight)
        .transition().duration(750)
        .attrTween("width", barWidthTween)
        .attr("y", d => yScale(d.value))
        .attr("height", d => graphHeight - yScale(d.value));
}

function addBarGraphTip() {
    groupBarGraph.selectAll('rect').on("mouseover", (d, i, n) => {

        tipBarGraph.html((d) => {
            return `${d.value}`;
        })
        tipBarGraph.show(i, d.target);
    }).on("mouseout", (d) => {
        tipBarGraph.hide();
    });
}

function addBarGraphAxes() {
    xAxisGroup.transition()
        .duration(1500)
        .call(xAxis);

    yAxisGroup
        .transition()
        .duration(1500)
        .call(yAxis);

    xAxisGroup.attr("font-size", 15);
    yAxisGroup.attr("font-size", 15);
}

function updateBarChart(data, i) {
    imeZupanije.classList.add("prikazi");
    if (i.properties.name == "Grad Zagreb") {
        imeZupanije.innerHTML = `${i.properties.name}`;

    } else {
        imeZupanije.innerHTML = `${i.properties.name} županija`;
    };

    if (i.properties.name == "Grad Zagreb" || i.properties.name == "Istarska" || i.properties.name == "Zadarska" || i.properties.name == "Karlovačka") {
        imeZupanije.classList.add("pomakni");
    } else {
        imeZupanije.classList.remove("pomakni");
    }

    const ourData = getDataByAge(data, i);

    yScale.domain([0, d3.max(ourData, d => d.value)])
    xScale.domain(ourData.map(d => d.name))

    colorScale.domain([0, d3.max(ourData, d => d.value)])
    handleRects(ourData);
    addBarGraphTip();
    addBarGraphAxes();
}
///mozda ti ovako nesto zatreba, ucitavas podatke samo jednom
var dataForEachPerson;
d3.json("poOsobama.json").then((data) => {
    dataForEachPerson = data
});
///scale for map colors


const colorScale = d3.scaleLinear()
    .range([0, 6]);
///scales and axes for bar chart
const yScale = d3.scaleLinear()
    .range([graphHeight, 0]);

const xScale = d3.scaleBand()
    .range([0, 500])
    .paddingInner(0.2)
    .paddingOuter(0.2);

const xAxis = d3.axisBottom(xScale);
const yAxis = d3.axisLeft(yScale)
    .ticks(10);
const imeZupanije = document.querySelector(".imeZupanije");

const barGraphTitle = barGraphSvg.append("text").attr("transform", "translate(150,15)");


function showSelectedCounty(d, i) {
    const zupanija = d.target;
    d3.select(zupanija).style("opacity", 1);
    groupZupanija.html(`${d.target.outerHTML}`);
    if (i.properties.name == "Osječko-baranjska") {
        groupZupanija.attr("class", "os");
    } else if (i.properties.name == "Vukovarsko-srijemska") {
        groupZupanija.attr("class", "vs");
    } else if (i.properties.name == "Brodsko-posavska") {
        groupZupanija.attr("class", "bp");
    } else if (i.properties.name == "Bjelovarsko-bilogorska") {
        groupZupanija.attr("class", "bb");
    } else if (i.properties.name == "Koprivničko-križevačka") {
        groupZupanija.attr("class", "kk");
    } else if (i.properties.name == "Međimurska") {
        groupZupanija.attr("class", "m");
    } else if (i.properties.name == "Krapinsko-zagorska") {
        groupZupanija.attr("class", "kz");
    } else if (i.properties.name == "Grad Zagreb") {
        groupZupanija.attr("class", "gz");
    } else if (i.properties.name == "Zagrebačka ") {
        groupZupanija.attr("class", "z");
    } else if (i.properties.name == "Sisačko-moslavačka") {
        groupZupanija.attr("class", "sm");
    } else if (i.properties.name == "Karlovačka") {
        groupZupanija.attr("class", "k");
    } else if (i.properties.name == "Primorsko-goranska") {
        groupZupanija.attr("class", "pg");
    } else if (i.properties.name == "Istarska") {
        groupZupanija.attr("class", "i");
    } else if (i.properties.name == "Ličko-senjska") {
        groupZupanija.attr("class", "ls");
    } else if (i.properties.name == "Zadarska") {
        groupZupanija.attr("class", "zad");
    } else if (i.properties.name == "Šibensko-kninska") {
        groupZupanija.attr("class", "šk");
    } else if (i.properties.name == "Splitsko-dalmatinska") {
        groupZupanija.attr("class", "sd");
    } else if (i.properties.name == "Dubrovačko-neretvanska") {
        groupZupanija.attr("class", "dn");
    } else if (i.properties.name == "Požeško-slavonska") {
        groupZupanija.attr("class", "ps");
    } else if (i.properties.name == "Virovitičko-podravska") {
        groupZupanija.attr("class", "vp");
    } else if (i.properties.name == "Varaždinska") {
        groupZupanija.attr("class", "v");
    }

    groupZupanija.selectAll("path").style("stroke", "black");
}
/////end of scales for bar chart,prikaz karte kopiran s predloška za laboratorijske vježbe
d3.json("cro_regv3.json").then((cro) => {
    var data = topojson.feature(cro, cro.objects.layer1);

    ///skaliraj po max i min vrijednosti
    colorScale.domain([d3.min(data.features, d => d.properties.broj_zarazenih), d3.max(data.features, d => d.properties.broj_zarazenih)])

    var colors = ["#ffbaba", "#ff7b7b", "#ff5252", "#ff0000", "#cc0600", "#7C0A02", "#3D0501"];

    var x = 10;
    for (var i = 0; i < 7; i++) {
        groupMapLegend.append('rect')
            .attr('x', x)
            .attr('y', 120)
            .attr('width', 25)
            .attr('height', 25)
            .attr('stroke', 'black')
            .attr('fill', colors[i]);
        x += 30;
    }

    groupMapLegend.append("text")
        .attr("x", -75)
        .attr("y", 132)
        .text(`Manji broj`).style("font-size", 18);
    groupMapLegend.append("text")
        .attr("x", -75)
        .attr("y", 150)
        .text(`zaraženih`).style("font-size", 18);

    groupMapLegend.append("text")
        .attr("x", 223)
        .attr("y", 132)
        .text(`Veći broj`).style("font-size", 18);
    groupMapLegend.append("text")
        .attr("x", 223)
        .attr("y", 150)
        .text(`zaraženih`).style("font-size", 18);

    var states = groupMap.selectAll("path.county")
        .data(data.features)
        .enter()
        .append("path")
        .attr("class", "county")
        .attr("id", function (d) { return d.id; })
        .attr("d", path)
        .style("fill", function (d) {
            var value = Math.round(colorScale(d.properties.broj_zarazenih));
            return colors[value];
        })
        .style("stroke", "gray")
        .style("stroke-width", 1)
        .style("stroke-opacity", 1)
        .on("click", (d, i) => {
            update(dataForEachPerson, i);
            updateBarChart(dataForEachPerson, i);
            barGraphSvg.attr("class", "bar prikazi");
            pieChartSvg.attr("class", "pie prikazi");
            showSelectedCounty(d, i)
            handleHover(i, d);
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

function barWidthTween(d) {
    var i = d3.interpolate(0, xScale.bandwidth());
    return function (t) {
        return i(t);
    }
}