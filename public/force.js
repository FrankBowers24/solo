//http://bl.ocks.org/mbostock/1062288

var width = 960,
    height = 500,
    root;

var force = d3.layout.force()
    .size([width, height])
    .charge(-5000)
    .on("tick", tick);

var svg = d3.select("#visualization").append("svg")
    .attr("width", width)
    .attr("height", height);

var link = svg.selectAll(".link"),
    node = svg.selectAll(".node");

var nodeIndex = 0;

d3.json("amazon.json", function(json) {
  root = json;
  update();
});

function update() {
  var nodes = flatten(root),
      links = d3.layout.tree().links(nodes);

  // Restart the force layout.
  force
      .nodes(nodes)
      .links(links)
      .start();



  // Update the links…
  link = link.data(links, function(d) { return d.target.id; });

  // Exit any old links.
  link.exit().remove();

  // Enter any new links.
  link.enter().insert("line", ".node")
      .attr("class", "link")
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  //Frank Bowers
  nodes.map(function(d) {
    return d.__data__;
  });

  // Update the nodes…
  node = node.data(nodes, function(d) { return d.id; }).style("fill", color);

  // Exit any old nodes.
  node.exit().remove();


  // Enter any new nodes.
  node.enter().append("image")
      .attr("class", "node")
      // .attr("xlink:href", "http://ecx.images-amazon.com/images/I/5165Cn6GA2L._SL75_.jpg")
      .attr("xlink:href", function(d) {
      	return d.ImageURL;
      })
      .attr("height", "65")
      .attr("width", "75")
      .attr("x", function(d) { return d.x - 75/2; })
      .attr("y", function(d) { return d.y - 65/2; })
      // .attr("cx", function(d) { return d.x; })
      // .attr("cy", function(d) { return d.y; })
      // .attr("r", function(d) { return Math.sqrt(d.size) / 10 || 4.5; })
      // .style("fill", color)
      .on("click", click)
      .on("dblclick", dblClick)
      .call(force.drag);
}

function tick() {
  link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  node.attr("x", function(d) { return d.x - 75/2; })
      .attr("y", function(d) { return d.y - 65/2; });
}

// Color leaf nodes orange, and packages white or blue.
function color(d) {
  return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#fd8d3c";
}


function ensureUniqueness(nodes) {
	var nodeMap = {};
	flatten(root).forEach(function(n) {
		nodeMap[n.ASIN] = true;
	});
	nodes.forEach(function(n, index) {
		if (nodeMap[n.ASIN]) {
			nodes[index] = null;
		}
	});
	return nodes.filter(function(n) {
		return n;
	});
}

// add children on dblClick
function dblClick(d) {
  if (!d3.event.defaultPrevented) {
  	if (!d.children) {
  		d3.json("amazon2.json", function(json) {
  		  d.children = ensureUniqueness(json);
  		  update();
  		});

  	}
  }
}

// Toggle children on click.
function click(d) {
  if (!d3.event.defaultPrevented) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    update();
  }
}

// Returns a list of all nodes under the root.
function flatten(root) {
  var nodes = [];

  function recurse(node) {
    if (node.children) node.children.forEach(recurse);
    if (!node.id) node.id = ++nodeIndex;
    nodes.push(node);
  }

  recurse(root);
  return nodes;
}
