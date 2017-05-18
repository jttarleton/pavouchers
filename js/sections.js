
// Bubbles Code

//https://bl.ocks.org/ericsoco/cd0c38a20141e997e926592264067db3

//from http://stackoverflow.com/questions/3883342/add-commas-to-a-number-in-jquery
function commaSeparateNumber(val){
  while (/(\d+)(\d{3})/.test(val.toString())){
    val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
  }
  return val;
}

var clusters = null; //create empty clusters variable

var served = null,
    unserved = null;
    bubbleFactor = .01

var node = null;

var width2 = 960,
    height2 = 500,
    padding = .75, // separation between same-color nodes
    clusterPadding = 1, // separation between different-color nodes
    maxRadius = 8,
    minRadius = 4.75;

var n = served + unserved, // total number of nodes
    m = 2; // number of distinct clusters

/*var color = d3.scaleSequential(d3.interpolateRainbow)
    .domain(d3.range(m));*/

var color = function (d) {
  console.log(d);
  if (d == 0) {
    return "yellow";
    }
  else {
    return "darkgrey";
  }
};

var clusters = new Array(m);

// Move d to be adjacent to the cluster node.
// from: https://bl.ocks.org/mbostock/7881887

function cluster () {

    var nodes,
      strength = 0.1;

    function force (alpha) {

      // scale + curve alpha value
      alpha *= strength * alpha;

      nodes.forEach(function(d) {
        var cluster = clusters[d.cluster];
        if (cluster === d) return;
        
        let x = d.x - cluster.x,
          y = d.y - cluster.y,
          l = Math.sqrt(x * x + y * y),
          r = d.radius + cluster.radius;

        if (l != r) {
          l = (l - r) / l * alpha;
          d.x -= x *= l;
          d.y -= y *= l;
          cluster.x += x;
          cluster.y += y;
        }
      });

    }

    force.initialize = function (_) {
      nodes = _;
    }

    force.strength = _ => {
      strength = _ == null ? strength : _;
      return force;
    };

    return force;

}

function drawBubbles () {
  console.log("DRAWING BUBBLES");
  console.log("served: "+served);
  console.log("unserved: "+unserved);
  console.log("total nodes n: "+n);



  function clustersort (d) {
    console.log("clustersort is running");
    if (d < (unserved*bubbleFactor)) {
      return 0;
    }
    else {
      return 1;
    }
  };

  var nodes = d3.range(n).map(function(num) {
    var i = clustersort(num),
        r = Math.random() * (maxRadius - minRadius) + minRadius,
        d = {
          cluster: i,
          radius: r,
          x: Math.cos(i / m * 2 * Math.PI) * 200 + width2 / 2 + Math.random(),
          y: Math.sin(i / m * 2 * Math.PI) * 200 + height2 / 2 + Math.random()
        };
      if (!clusters[i] || (r > clusters[i].radius)) clusters[i] = d;
        return d;
  });


  var force = d3.forceSimulation()
  
  // keep entire simulation balanced around screen center
    .force('center', d3.forceCenter(width2/1.5, height2/2))

  // cluster by section
    .force('cluster', cluster()
      .strength(0.75))

  // apply collision with padding
    .force('collide', d3.forceCollide(d => d.radius + padding)
      .strength(1))

    .on('tick', layoutTick)
    .nodes(nodes);


  var svg2 = d3.select("#bubbles").append("svg")
    .attr("width", width2)
    .attr("height", height2);

  var node = svg2.selectAll("circle")
    .data(nodes)
    .enter().append("circle")
    .style("stroke", "#e6e6e6")
    .style("fill", function(d) { return color(d.cluster/10); });


//On tspans: http://stackoverflow.com/questions/24032397/inserting-new-line-in-html-using-d3

  var text1 = svg2.append("text")
    .text("served:")
    .attr("x", 175)
    .attr("y", 50);

  text1.append("tspan")
    .text(commaSeparateNumber(served))
    .attr("dy", "40px")
    .attr("x", 175)
    .style("font-size", "50px")
    .style("font-weight", "900");

  text1.append("tspan")
    .text("households")
    .attr("dy", "20px")
    .attr("x", 175);

  var text2 = svg2.append("text")
    .text("unserved:")
    .attr("x", 650)
    .attr("y", 50);

  text2.append("tspan")
    .text(commaSeparateNumber(unserved))
    .attr("dy", "40px")
    .attr("x", 650)
    .style("font-size", "50px")
    .style("font-weight", "900");

  text2.append("tspan")
    .text("households")
    .attr("dy", "20px")
    .attr("x", 650);



  console.log(nodes);

  function layoutTick(e) {
  node
    .attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; })
    .attr("r", function(d) { return d.radius; });
  }

/*var labels = [{text: "HELLO", cluster: 0, radius: 0},{text: "GOODBYE", cluster: 1, radius: 0}];*/

}; //End of drawBubbles function




// REST OF THE SECTIONS CODE


var scrollVis = function () {
    // Width and Height of the whole visualization
    var width = 600;
    var height = 300;
    var margin = { top: 0, left: 20, bottom: 40, right: 10 };

    // Keep track of which visualization
    // we are on and which was the last
    // index activated. When user scrolls
    // quickly, we want to call all the
    // activate functions that they pass.
    var lastIndex = -1;
    var activeIndex = 0;

    var svg = null;
    var g = null;


    // Define projection;
    /* var albersProjection = d3.geoAlbers(); */
    var proj = d3.geoAlbers()
      .rotate( [77.727836,0] )
      .center( [0, 40.964551] )
      .scale(6000)
      .translate( [width/2,height/2] );

    // Create GeoPath function that uses built-in D3 functionality to turn
    // lat/lon coordinates into screen coordinates
    var path = d3.geoPath()
      .projection( proj );

    var color1 = d3.scaleThreshold()
      .domain([0.45, .5, 0.55, 0.6, .65])
      //.range(["#f7fcfd","#e5f5f9","#ccece6","#99d8c9","#66c2a4","#41ae76","#238b45","#006d2c","#00441b"]);
      .range(d3.range(6).map(function(i) {
        return "q" + i + "-6";
      }));


    var color2 = d3.scaleThreshold()
      .domain([100, 500, 1000, 1500, 2000, 4000, 10000, 15000])
      //.range(["#fff7fb","#ece7f2","#d0d1e6","#a6bddb","#74a9cf","#3690c0","#0570b0","#045a8d","#023858"]);
      .range(d3.range(9).map(function(i) {
        return "b" + i + "-9";
      }));

    var color3 = d3.scaleThreshold()
      .domain([.5, 1, 1.5, 2, 2.5, 3, 3.5])
      //.range(["#fff7fb","#ece7f2","#d0d1e6","#a6bddb","#74a9cf","#3690c0","#0570b0","#045a8d","#023858"]);
      .range(d3.range(8).map(function(i) {
        return "c" + i + "-8";
      }));

    var color4 = d3.scaleThreshold()
      .domain([0.1, 0.15, 0.2])
      //.range(["#2171b5", "#6baed6", "#bdd7e7", "#eff3ff", "#fee5d9", "#fcae91", "#fb6a4a", "#cb181d"]);
      .range(d3.range(4).map(function(i) {
        return "d" + i + "-4";
      }));

    var color5 = d3.scaleThreshold()
      .domain([-0.5, -0.25, -0.1, 0.0, 0.1, 0.25, .5])
      //.range(["#2171b5", "#6baed6", "#bdd7e7", "#eff3ff", "#fee5d9", "#fcae91", "#fb6a4a", "#cb181d"]);
      .range(d3.range(8).map(function(i) {
        return "e" + i + "-8";
      }));

    var color6 = d3.scaleOrdinal()
      .domain(["Rural Counties", "Urban Counties"])
      .range(["#b2df8a", "#1f78b4"]);
    

    var legend1 = d3.legendColor()
      .labelFormat(d3.format(".0%"))
      .labels(["Less than 45%", "45% to 50%", "50% to 55%", "55% to 60%", "60% to 65%", "More than 65%"])
      .useClass(true)
      .scale(color1)
      .title("% of Renting Households that are Cost Burdened")
      .titleWidth(200);
    

    var legend2 = d3.legendColor()
      .labelFormat(d3.format("0,"))
      .labels(d3.legendHelpers.thresholdLabels)
      .useClass(true)
      .scale(color2)
      .title("# of Housing Choice Vouchers")
      .titleWidth(200);

    var legend3 = d3.legendColor()
      .labelFormat(d3.format("0"))
      .labels(d3.legendHelpers.thresholdLabels)
      .useClass(true)
      .scale(color3)
      .title("# of Housing Choice Vouchers per 100 Households")
      .titleWidth(200);

    var legend4 = d3.legendColor()
      .labelFormat(d3.format("0,"))
      .labels(d3.legendHelpers.thresholdLabels)
      .useClass(true)
      .scale(color4)
      .title("% of Households that are Eligible for Vouchers & Housing Cost Burdened But Unserved")
      .titleWidth(200)
      .labels(["Less than 10%", "10% to 15%", "15% to 20%", "More than 20%"]);

    var legend5 = d3.legendColor()
      .labelFormat(d3.format("0"))
      .labels(d3.legendHelpers.thresholdLabels)
      .useClass(true)
      .scale(color5)
      .title("Trump v. Clinton Margin of Victory")
      .titleWidth(200)
      .labels(["50% or more (Clinton)",
      "50% to 25%", "25% to 10%", "10% to 0%", "0% to 10%", "10% to 25%", "25% to 50%", "50% or more (Trump)"]);

    var legend6 = d3.legendColor()
      //d3 symbol creates a path-string, for example
      //"M0,-8.059274488676564L9.306048591020996,
      //8.059274488676564 -9.306048591020996,8.059274488676564Z"
      .shape("path", d3.symbol().type(d3.symbolSquare).size(200)())
      .shapePadding(10)
      .cellFilter(function(d){ return d.label !== "R" && d.label !== "U" })
      //.cellFilter(function(d){ return d.label !== "U" })
      .scale(color6);

    // When scrolling to a new section
    // the activation function for that
    // section is called.
   var activateFunctions = [];
    // If a section has an update function
    // then it is called while scrolling
    // through the section with the current
    // progress through the section.
    var updateFunctions = [];

/**
   * chart
   *
   * @param selection - the current d3 selection(s)
   *  to draw the visualization in. For this
   *  example, we will be drawing it in #vis
   */
  var chart = function (selection) {
    selection.each(function (pa) {
      // create svg and give it a width and height
      svg = d3.select(this).selectAll('svg').data([pa]);
      //deleted .data([wordData]);
      var svgE = svg.enter().append('svg');
      // @v4 use merge to combine enter and existing selection
      svg = svg.merge(svgE);

      svg.attr('width', width + margin.left + margin.right);
      svg.attr('height', height + margin.top + margin.bottom);

      svg.append('g');

// look closely at this HCVdata, word data, fillewrods, etc. maybe delete

// this group element will be used to contain all
      // other elements.
      g = svg.select('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      setupVis(pa);

      setupSections();
    });
  };

/**
   * setupVis - creates initial elements for all
   * sections of the visualization.
   *
   * @param wordData - data object for each word.
   * @param fillerCounts - nested data that includes
   *  element for each filler word type.
   * @param histData - binned histogram data
   */

  var svg3 = d3.select("#leftmargin").append("svg")
      .attr("width", 300)
      .attr("height", height2);

  /*var svg4 = d3.select("#rightmargin").append("svg")
      .attr("width", 300)
      .attr("height", height2);
  */

  var div = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

  var setupVis = function (pa) {

   /* var burden = g.selectAll('.burden').data(pa);
    var burdenE = burden.enter()
      .append("path")*/
    var elig = 10;


  svg.append('g')
    .selectAll("path")
    .data(topojson.feature(pa, pa.objects.hcv_data).features)
    .enter().append("path")
    .attr("d", path)
    .attr("class", "blank")
    .style("stroke", "lightgrey")
    .style("stroke-width","1px")
    .style("fill", "white")
    .attr('opacity', 0);
    
  svg3.append("g")
    .attr("class", "legendBurden legend burden")
    .attr("transform", "translate(20,20)")
    .attr('opacity', 0);
    
  svg.append('g')
    .selectAll("path")
    .data(topojson.feature(pa, pa.objects.hcv_data).features)
    .enter().append("path")
    .attr("d", path)
    .attr("class", function(d) {
      console.log(color1(d.properties.BRD_RENT_P));
      return "burden " + color1(d.properties.BRD_RENT_P);
    })
    .style("stroke", "white")
    .style("stroke-width","1px")
    .attr('opacity', 0);

  svg3.append("g")
        .attr("class", "legendHCVCount legend HCVCount")
        .attr("transform", "translate(20,20)")
        .attr('opacity', 0);

  svg.append('g')
    .selectAll("path")
    .data(topojson.feature(pa, pa.objects.hcv_data).features)
    .enter().append("path")
    .attr("d", path)
    //.attr("class", "HCVCount")//
    .attr("class", function(d) {
      console.log(color2(d.properties.HCV));
      return "HCVCount " + color2(d.properties.HCV);
    })
    .style("stroke", "white")
    .style("stroke-width","1px");
    /*.style("fill", function(d) {
    return color2(d.properties.HCV);
    })*/


    svg3.append("g")
        .attr("class", "legendHCVHH legend HCVHH")
        .attr("transform", "translate(20,20)")
        .attr('opacity', 0);

    svg.append('g')
      .selectAll("path")
      .data(topojson.feature(pa, pa.objects.hcv_data).features)
      .enter().append("path")
      .attr("d", path)
      .attr("class", function(d) {
        console.log(color3(d.properties.HCV_HH*100));
        return "HCVHH " + color3(d.properties.HCV_HH*100);
      })
      .style("stroke", "white")
      .style("stroke-width","1px")
      .attr('opacity', 0);

    svg.append('g')
      .selectAll("path")
      .data(topojson.feature(pa, pa.objects.hcv_data).features)
      .enter().append("path")
      .attr("d", path)
      .attr("class", function(d) {
        console.log(color4(d.properties.ELIGBUNT/d.properties.HH_T));
        return "ELIGBUNT_HHT " + color4(d.properties.ELIGBUNT/d.properties.HH_T);
      })
      .style("stroke", "white")
      .style("stroke-width","1px")
      .attr('opacity', 0);

    svg3.append("g")
      .attr("class", "legendELIGBUNT_HHT legend ELIGBUNT_HHT")
      .attr("transform", "translate(20,20)")
      .attr('opacity', 0);


    svg.append('g')
      .selectAll("path")
      .data(topojson.feature(pa, pa.objects.hcv_data).features)
      .enter().append("path")
      .attr("d", path)
      .attr("class", function(d) {
        console.log(color5(d.properties.MVICT));
        return "MVICT " + color5(d.properties.MVICT);
      })
      .style("stroke", "white")
      .style("stroke-width","1px")
      .attr('opacity', 0);

    svg3.append("g")
      .attr("class", "legendMVICT legend MVICT")
      .attr("transform", "translate(20,20)")
      .attr('opacity', 0);


    svg3.append("g")
      .attr("class", "legendRURBAN legend RURBAN")
      .attr("transform", "translate(20,20)")
      .attr('opacity', 0);

    svg.append('g')
      .selectAll("path")
      .data(topojson.feature(pa, pa.objects.hcv_data).features)
      .enter().append("path")
      .attr("d", path)
      .attr("class", "RURBAN")
      .style("fill", function(d) {
        return color6(d.properties.RURURB)})
      /*.style("fill", function(d) {
        if (d.properties.RURURB == "R") {
          return "red"
        } else {
          return "blue"
        }
        })*/
      .style("stroke", "white")
      .style("stroke-width","1px")
      .attr('opacity', 0)

      .on("click", function(d){
        d3.select("#countyname").text(d.properties.NAMELSAD);
        served = +d.properties.HCV;
        unserved = +d.properties.ELIG_B;
        n = (served + unserved)*bubbleFactor;
        console.log("hiiiiiiiiii");
        d3.selectAll("#bubbles svg").remove();
        drawBubbles();
      })
//Mouseover from https://bl.ocks.org/d3noob/257c360b3650b9f0a52dd8257d7a2d73

    svg.append('g')
      .selectAll("path")
        .data(topojson.feature(pa, pa.objects.hcv_data).features)
        .enter().append("path")
        .attr("d", path)
        .style("stroke", "transparent")
        .style("stroke-width","1px")
        .style("fill", "transparent")
        .attr('opacity', 1)
      .on("mouseover", function(d){
          d3.select(this)
          .style("stroke","yellow")
          .raise()
          .style("stroke-width", "2px");
          div.transition()
            .duration(200)
            .style("opacity", 1);
          div.html(toolTipText(d))
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
        })
      .on("mouseout", function(d){
          d3.select(this).style("stroke","transparent")
            .style("stroke-width", "1px");
          div.transition()
            .duration(500)
            .style("opacity", 0);
      })
        .on("click", function(d){
        d3.select("#countyname").text(d.properties.NAMELSAD);
        served = +d.properties.HCV;
        unserved = +d.properties.ELIG_B;
        n = (served + unserved)*bubbleFactor;
        console.log("hiiiiiiiiii");
        d3.selectAll("#bubbles svg").remove();
        drawBubbles();
      });
};



function mVict (d) {
  if (d < 0) {
      return "% (Clinton)";
    }
    if (d > 0) {
      return "% (Trump)";
    }
};

function rUrban (d) {
  if (d == "R") {
    return "Mostly or completely rural";
  }
  if (d == "U") {
    return "Mostly urban";
  }
};


var toolTipText = function (a) {
  if (d3.selectAll('.blank').attr('opacity') > .5) {
    return a.properties.NAMELSAD;
  }
  if (d3.selectAll('.burden').attr('opacity') > .5) {
    return (a.properties.NAMELSAD+("<br />")+commaSeparateNumber(Math.ceil(100*a.properties.BRD_RENT_P)))+"% of households rent burdened";
  }
  if (d3.selectAll('.HCVCount').attr('opacity') > .5) {
    return (a.properties.NAMELSAD+("<br />")+a.properties.HCV+" vouchers");
  }
  if (d3.selectAll('.HCVHH').attr('opacity') > .5) {
    return (a.properties.NAMELSAD+("<br />")+a.properties.HCV_HH*100+" vouchers per 100 households");
  }
  if (d3.selectAll('.ELIGBUNT_HHT').attr('opacity') > .5) {
    return (a.properties.NAMELSAD+("<br />")+Math.ceil(100*(a.properties.ELIGBUNT/a.properties.HH_T))+"% of county households that eligible<br />and rent burdened but unserved");
  }
  if (d3.selectAll('.MVICT').attr('opacity') > .5) {
    return (a.properties.NAMELSAD+("<br />")+Math.ceil((Math.abs(a.properties.MVICT)*100))+mVict(a.properties.MVICT));
  }
  if (d3.selectAll('.RURBAN').attr('opacity') > .5) {
    return (a.properties.NAMELSAD+("<br />")+rUrban(a.properties.RURURB));
  }
};

/**
   * setupSections - each section is activated
   * by a separate function. Here we associate
   * these functions to the sections based on
   * the section's index.
   *
   */
  var setupSections = function () {
    // activateFunctions are called each
    // time the active section changes
    activateFunctions[0] = showBlank;
    activateFunctions[1] = showBurden;
    activateFunctions[2] = showHCVCount;
    activateFunctions[3] = showHCVHH;
    activateFunctions[4] = showELIGBUNT_HHT;
    activateFunctions[5] = showElection;
    activateFunctions[6] = showRURBAN;

  };



/**
   * ACTIVATE FUNCTIONS
   *
   * These will be called their
   * section is scrolled to.
   *
   * General pattern is to ensure
   * all content for the current section
   * is transitioned in, while hiding
   * the content for the previous section
   * as well as the next section (as the
   * user may be scrolling up or down).
   *
   */

  /**
   * showBlank - initial map
   *
   * hides: Burden Map
   * (no previous step to hide)
   * shows: Blank Map
   *
   */
  function showBlank() {
    d3.selectAll('.burden')
      .transition()
      .duration(750)
      .attr('opacity', 0);

    d3.selectAll('.blank')
      .transition()
      .duration(0)
      .attr('opacity', 1.0);

    d3.selectAll('.HCVCount')
      .transition()
      .duration(0)
      .attr('opacity', 0);

  }

  /**
   * showBurden - housing cost burden map
   *
   * hides: Blank map
   * hides: HCV count map
   * shows: housing cost burden map
   *
   */
  function showBurden() {
    d3.selectAll('.blank')
      .transition()
      .duration(2000)
      .attr('opacity', 0);

    d3.selectAll('.HCVCount')
      .transition()
      .duration(750)
      .attr('opacity', 0);

    d3.selectAll(".legendHCVCount")
      .call(legend2)
      .transition()
      .duration(750)
      .attr('opacity', 0);

    d3.selectAll('.burden')
      .transition()
      .duration(750)
      .attr('opacity', 1.0);

    d3.selectAll(".legendBurden")
      .call(legend1)
      .transition()
      .delay(10000)
      .duration(750)
      .attr('opacity', 1.0);

  }

  /**
   * showHCVCount - hcv count choropleth
   *
   * hides: burden map
   * hides: hcv per household map
   * shows: hcv count choropleth
   *
   */
  function showHCVCount() {
    d3.selectAll('.burden')
      .transition()
      .duration(750)
      .attr('opacity', 0);

    d3.selectAll(".legendBurden")
      .call(legend1)
      .transition()
      .duration(500)
      .attr('opacity', 0);

    d3.selectAll('.HCVCount')
      .transition()
      .duration(750)
      .attr('opacity', 1.0);

    d3.selectAll(".legendHCVCount")
      .call(legend2)
      .transition()
      .duration(750)
      .attr('opacity', 1.0);

    d3.selectAll('.HCVHH')
      .transition()
      .duration(750)
      .attr('opacity', 0);

    d3.selectAll(".legendHCVHH")
      .call(legend3)
      .transition()
      .duration(750)
      .attr('opacity', 0);
  }


/**


  /**
   * showHCVHH - hcv per household choropleth
   *
   * hides: hcv count
   * hides: eligbunt_hh
   * shows: hcvhh
   *
   */
  function showHCVHH() {
    d3.selectAll('.HCVHH')
      .transition()
      .duration(750)
      .attr('opacity', 1);

     d3.selectAll(".legendHCVHH")
      .call(legend3)
      .transition()
      .duration(750)
      .attr('opacity', 1.0);

    d3.selectAll('.HCVCount')
      .transition()
      .duration(750)
      .attr('opacity', 0);

    d3.selectAll(".legendHCVCount")
      .call(legend2)
      .transition()
      .duration(750)
      .attr('opacity', 0);

    d3.selectAll('.ELIGBUNT_HHT')
      .transition()
      .duration(750)
      .attr('opacity', 0);

     d3.selectAll(".legendELIGBUNT_HHT")
      .call(legend4)
      .transition()
      .duration(750)
      .attr('opacity', 0);
  }

 /**
   * showELIGBUNT_HHT 
   *
   * hides: HCVHH
   * hides: Election
   * shows: ELIGBUNT_HHT
   *
   */
  function showELIGBUNT_HHT() {
    d3.selectAll('.HCVHH')
      .transition()
      .duration(750)
      .attr('opacity', 0);

     d3.selectAll(".legendHCVHH")
      .call(legend3)
      .transition()
      .duration(750)
      .attr('opacity', 0);

    d3.selectAll('.ELIGBUNT_HHT')
      .transition()
      .duration(750)
      .attr('opacity', 1.0);

     d3.selectAll(".legendELIGBUNT_HHT")
      .call(legend4)
      .transition()
      .duration(750)
      .attr('opacity', 1.0);

       d3.selectAll('.MVICT')
      .transition()
      .duration(750)
      .attr('opacity', 0);

     d3.selectAll(".legendMVICT")
      .call(legend5)
      .transition()
      .duration(750)
      .attr('opacity', 0);
  }

/**
   * showElection 
   *
   * hides: ELIGBUNT_HHT
   * hides: RURBAN
   * shows: Election
   *
   */
  function showElection() {
    d3.selectAll('.MVICT')
      .transition()
      .duration(750)
      .attr('opacity', 1);

     d3.selectAll(".legendMVICT")
      .call(legend5)
      .transition()
      .duration(750)
      .attr('opacity', 1);

    d3.selectAll('.ELIGBUNT_HHT')
      .transition()
      .duration(750)
      .attr('opacity', 0);

     d3.selectAll(".legendELIGBUNT_HHT")
      .call(legend4)
      .transition()
      .duration(750)
      .attr('opacity', 0);

    d3.selectAll('.RURBAN')
      .transition()
      .duration(750)
      .attr('opacity', 0);

     d3.selectAll(".legendRURBAN")
      .call(legend6)
      .transition()
      .duration(750)
      .attr('opacity', 0);
  }

/**
   * showRURBAN 
   *
   * hides: Election
   * shows: RURBAN
   *
   */
  function showRURBAN() {
    d3.selectAll('.MVICT')
      .transition()
      .duration(750)
      .attr('opacity', 0);

     d3.selectAll(".legendMVICT")
      .call(legend5)
      .transition()
      .duration(750)
      .attr('opacity', 0);

    d3.selectAll('.RURBAN')
      .transition()
      .duration(750)
      .attr('opacity', 1);

     d3.selectAll(".legendRURBAN")
      .call(legend6)
      .transition()
      .duration(750)
      .attr('opacity', 1);
  }


/**
   * activate -
   *
   * @param index - index of the activated section
   */
  chart.activate = function (index) {
    activeIndex = index;
    var sign = (activeIndex - lastIndex) < 0 ? -1 : 1;
    var scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
    scrolledSections.forEach(function (i) {
      activateFunctions[i]();
    });
    lastIndex = activeIndex;
  };

  // return chart function
  return chart;
};


/**
 * display - called once data
 * has been loaded.
 * sets up the scroller and
 * displays the visualization.
 *
 * @param data - loaded json data
 */
function display(pa) {
  // create a new plot and
  // display it
  var plot = scrollVis();
  d3.select('#vis')
    .datum(pa)
    .call(plot);

  // setup scroll functionality
  var scroll = scroller()
    .container(d3.select('#graphic'));

  // pass in .step selection as the steps
  scroll(d3.selectAll('.step'));

  // setup event handling
  scroll.on('active', function (index) {
    // highlight current step text
    d3.selectAll('.step')
      .style('opacity', function (d, i) { return i+1 === index ? 1 : 0.1; });

    // activate current section
    plot.activate(index);
    console.log("am i working");
  });

}

// load data and display
d3.json('data/hcv_data.json', display);


