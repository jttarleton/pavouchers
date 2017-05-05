

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
    selection.each(function (rawData) {
      // create svg and give it a width and height
      svg = d3.select(this).selectAll('svg').data([wordData]);
      var svgE = svg.enter().append('svg');
      // @v4 use merge to combine enter and existing selection
      svg = svg.merge(svgE);

      svg.attr('width', width + margin.left + margin.right);
      svg.attr('height', height + margin.top + margin.bottom);

      svg.append('g');

// Create SVG
var svg = d3.select("#map")
	.append("svg")
    .attr("width", width)
    .attr("height", height);



// Append empty placeholder g element to the SVG
// g will contain geometry elements
var g = svg.append( "g" );


// set color


var color = d3.scaleThreshold()
    .domain([0.25, .3, 0.35, 0.4, .45, .5, .55, .6])
    .range(["#f7fcfd","#e5f5f9","#ccece6","#99d8c9","#66c2a4","#41ae76","#238b45","#006d2c","#00441b"]);
    /*.domain([0, .5])
    .range(["red","white","green"]);*/


function ready(error, pa) {
  if (error) throw error;
  
  svg.append("g")
    .attr("class", "PA_Counties_jc")
    .selectAll("path")
    .data(topojson.feature(pa, pa.objects.PA_Counties_jc).features)
    .enter().append("path")
    .attr("d", path)
    .style("stroke", "lightgrey")
    .style("stroke-width","1px")
    .style("fill", "white");
    /*.style("fill", function(d) {
    	return color(d.properties.BRD_T_P);
    });*/
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

  /**
   * update
   *
   * @param index
   * @param progress
   */
  chart.update = function (index, progress) {
    updateFunctions[index](progress);
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
function display(data) {
  // create a new plot and
  // display it
  var plot = scrollVis();
  d3.select('#vis')
    .datum(data)
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
      .style('opacity', function (d, i) { return i === index ? 1 : 0.1; });

    // activate current section
    plot.activate(index);
  });

  scroll.on('progress', function (index, progress) {
    plot.update(index, progress);
  });
}

// load data and display
d3.json('data/hcv_pa_simp.json', display);