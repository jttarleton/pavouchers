
// Bubbles Code

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
    minRadius = 6.75;

var n = served + unserved, // total number of nodes
    m = 2; // number of distinct clusters

/*var color = d3.scaleSequential(d3.interpolateRainbow)
    .domain(d3.range(m));*/

var color = function (d) {
  console.log(d);
  if (d == 0) {
    return "lightgrey";
    }
  else {
    return "black";
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
    .force('center', d3.forceCenter(width2/2, height2/2))

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


  svg2.append("text")
    .text("served: "+served+" households")
    .attr("color", "black")
    .attr("dx", 50)
    .attr("dy", 50);

  svg2.append("text")
    .text("unserved: "+unserved+" households")
    .attr("color", "black")
    .attr("dx", 700)
    .attr("dy", 50);

  function layoutTick(e) {
  node
    .attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; })
    .attr("r", function(d) { return d.radius; });
  }



} //End of drawBubbles function






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
        .domain([0.25, .3, 0.35, 0.4, .45, .5, .55, .6])
        //.range(["#f7fcfd","#e5f5f9","#ccece6","#99d8c9","#66c2a4","#41ae76","#238b45","#006d2c","#00441b"]);
        .range(d3.range(9).map(function(i) {
          return "q" + i + "-9";
        }));


    var color2 = d3.scaleThreshold()
        .domain([100, 500, 1000, 1500, 2000, 4000, 10000, 15000])
        //.range(["#fff7fb","#ece7f2","#d0d1e6","#a6bddb","#74a9cf","#3690c0","#0570b0","#045a8d","#023858"]);
        .range(d3.range(9).map(function(i) {
          return "b" + i + "-9";
        }));

    var color3 = d3.scaleThreshold()
        .domain([.2, .5, 1, 1.5, 2, 2.5, 3, 3.5])
        .range(["#fff7fb","#ece7f2","#d0d1e6","#a6bddb","#74a9cf","#3690c0","#0570b0","#045a8d","#023858"]);

    var color4 = d3.scaleThreshold()
        .domain([-0.5, -0.25, -0.1, 0.0, 0.1, 0.25, .5])
        .range(["#2171b5", "#6baed6", "#bdd7e7", "#eff3ff", "#fee5d9", "#fcae91", "#fb6a4a", "#cb181d"]);
    
    var legend1 = d3.legendColor()
        .labelFormat(d3.format(".2f"))
        .labels(d3.legendHelpers.thresholdLabels)
        .useClass(true)
        .scale(color1);

     var legend2 = d3.legendColor()
        .labelFormat(d3.format(".2f"))
        .labels(d3.legendHelpers.thresholdLabels)
        .useClass(true)
        .scale(color2);

      var legend3 = d3.legendColor()
        .labelFormat(d3.format(".2f"))
        .labels(d3.legendHelpers.thresholdLabels)
        .useClass(true)
        .scale(color3);

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
    
    svg.append("g")
      .attr("class", "legendBurden burden")
      .attr("transform", "translate(20,20)")
      .attr('opacity', 0);

    svg.append("text")
      .attr("class", "title burden")
      .attr('x', width / 2)
      .attr('y', height / 3)
      .text('% of Very & Extremely Low Income PAers Who Are Housing Cost Burdened')
      
    svg.append('g')
      .selectAll("path")
      .data(topojson.feature(pa, pa.objects.hcv_data).features)
      .enter().append("path")
      .attr("d", path)
      .attr("class", function(d) {
        console.log(color1(d.properties.ELIG_B_P));
        return "burden " + color1(d.properties.ELIG_B_P);
      })
      .style("stroke", "white")
      .style("stroke-width","1px")
      .attr('opacity', 0);

    svg.append("g")
          .attr("class", "legendHCVCount HCVCount")
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
      .style("stroke-width","1px")
      /*.style("fill", function(d) {
      return color2(d.properties.HCV);
      })*/
      .on("click", function(d){
        d3.select("#countyname").text(d.properties.NAMELSAD);
        served = +d.properties.HCV;
        unserved = +d.properties.ELIG_B;
        n = (served + unserved)*bubbleFactor;
        console.log("hiiiiiiiiii");
        d3.selectAll("#bubbles svg").remove();
        drawBubbles();
      });


      svg.append("g")
          .attr("class", "legendHCVHH HCVHH")
          .attr("transform", "translate(20,20)")
          .attr('opacity', 0);

      svg.append('g')
        .selectAll("path")
        .data(topojson.feature(pa, pa.objects.hcv_data).features)
        .enter().append("path")
        .attr("d", path)
        .attr("class", function(d) {
          console.log(color3(d.properties.HCV_HH));
          return "HCVHH " + color3(d.properties.HCV_HH);
        })
        .style("stroke", "white")
        .style("stroke-width","1px")
        .attr('opacity', 0);

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
    /*activateFunctions[4] = showELIGBUNT;
    activateFunctions[5] = showElection;
    activateFunctions[6] = showRurban;*/

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
  }


/**


  /**
   * showHCVHH - hcv per household choropleth
   *
   * hides: burden map
   * hides: hcv per household map
   * shows: hcv count choropleth
   *
   */
  function showHCVHH() {
    d3.selectAll('.HCVHH')
      .transition()
      .duration(750)
      .attr('opacity', 1);

    d3.selectAll('.HCVCount')
      .transition()
      .duration(750)
      .attr('opacity', 0);

    d3.selectAll(".legendHCVCount")
      .call(legend2)
      .transition()
      .duration(750)
      .attr('opacity', 0);
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


