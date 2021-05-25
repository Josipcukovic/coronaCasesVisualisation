var width = 670;
var height = 700;



const dims = { height: 300, width: 300, radius: 75 };
//const cent = { x: (dims.width / 2 + 5), y: (dims.height / 2 + 5) };
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
    .style("background", "white");

var pieChartSvg = d3.select(".canvas").append("svg")
    .attr("width", 400)
    .attr("height", 180)
    .attr("transform", `translate(80, -430)`);


var barGraphSvg = d3.select(".canvas").append("svg").attr("width", 600)
    .attr("height", 400).attr("class", "bar");



var groupMap = svg.append("g").attr("width", width).attr("height", height);
//piechart
var groupPieChart = pieChartSvg.append("g").attr("width", dims.width).attr("height", dims.height).attr("transform", "translate(75,100)");
var groupPieChartLegend = pieChartSvg.append("g").attr("transform", `translate(160, 30)`);
///bar
var groupBarGraph = barGraphSvg.append("g")
    .attr("width", graphWidth)
    .attr("height", graphHeight)
    .attr("transform", `translate(${margin.right + 35}, ${margin.top + 20})`);

const xAxisGroup = groupBarGraph.append("g").attr("transform", `translate(0,${graphHeight})`);
const yAxisGroup = groupBarGraph.append("g");

//bar
const colorsPieChart = d3.scaleOrdinal(['#72bcd4', '#ff3232']);

const legend = d3.legendColor()
    .shape("circle")
    .scale(colorsPieChart)
    .title("Udio zaraženih prema spolu");

const pie = d3.pie().sort(null).value(d => d.value);

const arcPath = d3.arc().outerRadius(dims.radius).innerRadius(dims.radius / 2);


//pie



const tip = d3.tip()
    .attr("class", "tip card");

const tipPieChart = d3.tip().attr("class", "tip card");
groupPieChart.call(tipPieChart);

const tipBarGraph = d3.tip().attr("class", "tip card");
groupBarGraph.call(tipBarGraph)


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
///mozda ti ovako nesto zatreba, ucitavas podatke samo jednom
var dataForEachPerson;
d3.json("proba.json").then((data) => {
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
const mojaMalaZupanija = document.querySelector(".imeZupanije");
//console.log(mojaMalaZupanija);
const barGraphTitle = barGraphSvg.append("text").attr("transform", "translate(150,15)");
/////end of scales for bar chart
d3.json("cro_regv3.json").then((cro) => {
    var data = topojson.feature(cro, cro.objects.layer1);


    ///skaliraj po max i min vrijednosti
    colorScale.domain([d3.min(data.features, d => d.properties.broj_zarazenih), d3.max(data.features, d => d.properties.broj_zarazenih)])



    var colors = ["#ffbaba", "#ff7b7b", "#ff5252", "#ff0000", "#FF0800", "#a70000", "#7C0A02"];

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
            if (i.properties.name == "Grad Zagreb") {
                mojaMalaZupanija.innerHTML = `${i.properties.name}`;
            } else {
                mojaMalaZupanija.innerHTML = `${i.properties.name} županija`;
            }

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
            var ourData = [
                { "name": "0-18", "value": god018 },
                { "name": "18-36", "value": god1836 },
                { "name": "36-54", "value": god3654 },
                { "name": "54-72", "value": god5472 },
                { "name": "72-90", "value": god7290 },
                { "name": "90+", "value": god90ilivise }
            ]
            console.log(ourData);

            yScale.domain([0, d3.max(ourData, d => d.value)])
            xScale.domain(ourData.map(d => d.name))

            colorScale.domain([0, d3.max(ourData, d => d.value)])

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
            barGraphTitle.text(`Broj zaraženih prema dobnoj skupini`);

            groupBarGraph.selectAll('rect').on("mouseover", (d, i, n) => {

                tipBarGraph.html((d) => {
                    return `${d.value}`;
                })
                tipBarGraph.show(i, d.target);
            }).on("mouseout", (d) => {
                tipBarGraph.hide();
            });


            xAxisGroup.transition()
                .duration(1500)
                .call(xAxis);
            yAxisGroup
                .transition()
                .duration(1500)
                .call(yAxis);

            xAxisGroup.attr("font-size", 15);
            yAxisGroup.attr("font-size", 15);

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