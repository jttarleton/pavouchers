d3.csv("data/states2.csv", function(error, states) {
  if (error) throw error;

  var ages = d3.keys(states[0]).filter(function(key) {
    return key != "State" && key != "Total";
  });

  d3.selectAll("thead td").data(ages).on("click", function(k) {
    console.log(k);
    tr.sort(function(a, b) {
      return (b[k] / b.Total) - (a[k] / a.Total);
    });
  });

  var tr = d3.select("tbody").selectAll("tr")
      .data(states)
    .enter().append("tr");



  tr.append("th")
      .text(function(d) { return d.State; });

  tr.selectAll("td")
    .data(function(d) { return ages.map(function(k) {
      console.log(k);
      return [(d[k] / d.Total), k];
      });
    })
    .enter()
    .append("td").append("svg")
      .attr("width", "100")
      .attr("height", function(d) { return 10+(d[0] * 200); })
    .append("circle")
      .style("fill", "#ffffff")
      .style("stroke", "lightgrey")
      .attr("r", function(d) { return d[0] * 100; })
      .attr("cy", function(d) { return 5+(d[0] * 100); })
      .attr("cx", (function(d) {
        if (d[1] == "Young") {
          return 100-(d[0] * 100);
        }
        if (d[1] == "Old") {
          return d[0] * 100;
        }

      }));

});


d3.select("#button1").on("click", function() {
    document.getElementById("button1").style = 'background-color: black';
});







