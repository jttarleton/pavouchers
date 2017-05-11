/* Script for the D3 Bubbles*/

var width2 = 600,
    height2 = 400,
    padding = 2, // separation between same-color nodes
    clusterPadding = 6, // separation between different-color nodes
    maxRadius = 2;


var width = 600;
    var height = 300;
    var margin = { top: 0, left: 20, bottom: 40, right: 10 };

var elig = 10;


//Color from original code
/*var bubbleColor = d3.scaleSequential(d3.interpolateRainbow)
    .domain(d3.range(m));*/

// The largest node for each cluster.
function drawBubbles () {
	console.log("elig inside is " +elig);

	var n = elig/100, // total number of nodes
    	m = 1; // number of distinct clusters

	var clusters = new Array(m);

	var nodes = d3.range(n).map(function() {
	  var i = Math.floor(Math.random() * m),
	      r = parseInt(Math.sqrt((i + 1) / m * -Math.log(Math.random())) * maxRadius),
	      d = {
	        cluster: i,
	        radius: Math.floor((Math.random() * 3) + 3),
	        x: Math.cos(i / m * 2 * Math.PI) * 200 + width / 2 + Math.random(),
	        y: Math.sin(i / m * 2 * Math.PI) * 200 + height / 2 + Math.random()
	      };
	  if (!clusters[i] || (r > clusters[i].radius)) clusters[i] = d;
	  return d;
	});

	var force = d3.forceSimulation()
	  // keep entire simulation balanced around screen center
	  .force('center', d3.forceCenter(width/2, height/2))

	  // cluster by section
	  .force('cluster', cluster()
	    .strength(0.2))

	  // apply collision with padding
	  .force('collide', d3.forceCollide(d => d.radius + padding)
	    .strength(0.7))

	  .on('tick', layoutTick)
		.nodes(nodes);
	  
	var svg2 = d3.select("#bubbles").append("svg")
	    .attr("width", width2)
	    .attr("height", height2)
	    /*.attr("style", "outline: thin solid red;");*/

	var node = svg2.selectAll("circle")
	    .data(nodes)
	  .enter().append("circle")
	  	.style("fill", "white")
	  	.style("stroke", "black")
	  	.style("stroke-width", "1px")
	    /* .style("fill", function(d) { return bubbleColor(d.cluster/10); }); */


	  
	function layoutTick(e) {
	  node
	      .attr("cx", function(d) { return d.x; })
	      .attr("cy", function(d) { return d.y; })
	      .attr("r", function(d) { return d.radius; });
	}

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
}
