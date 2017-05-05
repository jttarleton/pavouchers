

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
        .range(["#f7fcfd","#e5f5f9","#ccece6","#99d8c9","#66c2a4","#41ae76","#238b45","#006d2c","#00441b"]);

    var color2 = d3.scaleThreshold()
        .domain([100, 500, 1000, 1500, 2000, 4000, 10000, 15000])
        .range(["#fff7fb","#ece7f2","#d0d1e6","#a6bddb","#74a9cf","#3690c0","#0570b0","#045a8d","#023858"]);

    var color3 = d3.scaleThreshold()
        .domain([.2, .5, 1, 1.5, 2, 2.5, 3, 3.5])
        .range(["#fff7fb","#ece7f2","#d0d1e6","#a6bddb","#74a9cf","#3690c0","#0570b0","#045a8d","#023858"]);

    var color4 = d3.scaleThreshold()
        .domain([-0.5, -0.25, -0.1, 0.0, 0.1, 0.25, .5])
        .range(["#2171b5", "#6baed6", "#bdd7e7", "#eff3ff", "#fee5d9", "#fcae91", "#fb6a4a", "#cb181d"]);


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
      svg = d3.select(this).selectAll('svg');
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


    g.append('g')
      .attr("class", "blank")
      .selectAll("path")
      .data(topojson.feature(pa, pa.objects.PA_Counties_jc).features)
      .enter().append("path")
      .attr("d", path)
      .style("stroke", "lightgrey")
      .style("stroke-width","1px")
      .style("fill", "white")
      .attr('opacity', 0);
      
    g.append('g')
      .attr("class", "burden")
      .selectAll("path")
      .data(topojson.feature(pa, pa.objects.PA_Counties_jc).features)
      .enter().append("path")
      .attr("d", path)
      .style("stroke", "lightgrey")
      .style("stroke-width","1px")
      .style("fill", function(d) {
        return color1(d.properties.BRD_T_P);
      })
      .attr('opacity', 0);


    g.append('g')
      .attr("class", "HCVCount")
      .selectAll("path")
      .data(topojson.feature(pa, pa.objects.PA_Counties_jc).features)
      .enter().append("path")
      .attr("d", path)
      .style("stroke", "lightgrey")
      .style("stroke-width","1px")
      .style("fill", function(d) {
      return color2(d.properties.HCV);
      })
      .attr('opacity', 0);

      




}



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
    /*activateFunctions[3] = showHCVHH;
    activateFunctions[4] = showELIGBUNT;
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
    g.selectAll('.burden')
      .transition()
      .duration(0)
      .attr('opacity', 0);

    g.selectAll('.blank')
      .transition()
      .duration(600)
      .attr('opacity', 1.0);
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
    g.selectAll('.blank')
      .transition()
      .duration(0)
      .attr('opacity', 0);

    g.selectAll('.HCVCount')
      .transition()
      .duration(0)
      .attr('opacity', 0);

    g.selectAll('.burden')
      .transition()
      .duration(600)
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
    g.selectAll('.burden')
      .transition()
      .duration(0)
      .attr('opacity', 0);

    g.selectAll('.HCVCount')
      .transition()
      .duration(600)
      .attr('opacity', 1.0);
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
      .style('opacity', function (d, i) { return i === index ? 1 : 0.1; });

    // activate current section
    plot.activate(index);
  });

}

// load data and display
d3.json('data/hcv_pa_simp.json', display);


