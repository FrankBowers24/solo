//http://bl.ocks.org/mbostock/1062288
//
// Early in the code
var w = $(window).width();
var h = $(window).height();
var margin = {
    x: 10,
    y: 10
};
var padding = {
    x: 10,
    y: 10
};
var tooltip = {
    width: $('.tooltip').width(),
    height: $('.tooltip').height(),
}
var scene = {
    x: margin.x + padding.x,
    y: margin.y + padding.y,
    width: w - (margin.x * 2) - (padding.x * 2),
    height: h - (margin.y * 2) - (padding.y * 2)
}

var div = d3.select("body")
  .append("div")
  .style("position", "absolute")
  .style("z-index", "10")
  .style("opacity", "0")
  .text("a simple tooltip");

/// end tootip code

var width = 1100,
    height = 600,
    root;

var force = d3.layout.force()
    .size([width, height])
    .charge(-2000)
    .linkDistance(150)
    .on("tick", tick);

var svg = d3.select("#visualization").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("xmlns", "http://www.w3.org/2000/svg")
    .attr("ng-dblclick", "findSimilar(this)");

var link = svg.selectAll(".link"),
    node = svg.selectAll(".node");

var nodeIndex = 0;

var lastClickedNode;

// d3.json("amazon.json", function(json) {
//   root = json;
//   update();
// });

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
      	return d.MediumImageURL;
      })
      .attr("height", "160")
      .attr("width", "138")
      .attr("x", function(d) { return d.x - 160/2; })
      .attr("y", function(d) { return d.y - 138/2; })  // TODO: Adjust for actual dims
      // .attr("cx", function(d) { return d.x; })
      // .attr("cy", function(d) { return d.y; })
      // .attr("r", function(d) { return Math.sqrt(d.size) / 10 || 4.5; })
      // .style("fill", color)
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseout", mouseout)
      .on("click", click)
      //.on("dblclick", dblClick)
      // .attr("ng-click", "findSimilar()")
      // .attr("ng-dblclick", "findSimilar()")
      .attr("ng-dblclick", "findSimilar(this)")
      .call(force.drag);
}

function tick() {
  link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  node.attr("x", function(d) { return d.x - 160/2; })  // TODO: Adjust for actual dims
      .attr("y", function(d) { return d.y - 138/2; });
}

// Color leaf nodes orange, and packages white or blue.
function color(d) {
  return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#fd8d3c";
}

function setRoot(newRoot) {
  root = newRoot;
  update();
}

function setChildrenOnActiveNode(children) {
  lastClickedNode.children = ensureUniqueness(children);
  update();
}

function ensureUniqueness(nodes) {
	var nodeMap = {};
	flattenAll(root).forEach(function(n) {
		nodeMap[n.Title] = true;
	});
	nodes.forEach(function(n, index) {
		if (nodeMap[n.Title]) {
			nodes[index] = null;
		}
	});
	return nodes.filter(function(n) {
		return n;
	});
}

// add children on dblClick
function OLD_dblClick(d) {
  if (!d3.event.defaultPrevented) {
  	if (!d.children) {
  		d3.json("amazon2.json", function(json) {
  		  d.children = ensureUniqueness(json);
  		  update();
  		});

  	}
  }
}

function dblClick(d) {
  var test = $("body");
  var body = document.getElementsByTagName("body");
  console.log(body);
}

// Toggle children on click.
function click(d) {
  lastClickedNode = d;
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

// Returns all nodes including hidden ones
function flattenAll(root) {
  var nodes = [];

  function recurse(node) {
    if (node.children) node.children.forEach(recurse);
    if (node._children) node._children.forEach(recurse);
    if (!node.id) node.id = ++nodeIndex;
    nodes.push(node);
  }

  recurse(root);
  return nodes;
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


/*     -------------------    */
var popupHtml = function(d) {
  return '<img height="250" src="' + d.LargeImageURL + '"/>';
}

function positionTooltip(mouse, scene, tooltip)
{
    //Distance of element from the right edge of viewport
    if (scene.width - (mouse.x + tooltip.width) < 20)
    { //If tooltip exceeds the X coordinate of viewport
        mouse.x = mouse.x - tooltip.width - 20;
    }
    //Distance of element from the bottom of viewport
    if (scene.height - (mouse.y + tooltip.height) < 20)
    { //If tooltip exceeds the Y coordinate of viewport
        mouse.y = mouse.y - tooltip.height; // - 20;
    }
    return {
        top: mouse.y-200,
        left: mouse.x
    };
}



// then, when defining the tooltip div events...

 
var mouseover = function(d) {
    div.transition().duration(200).style("opacity", 1);
    //div.html(popupHtml(d)).style("left", (d3.event.pageX + 10) + "px").style("top", (d3.event.pageY - 10) + "px");
    div.html(popupHtml(d)).style("left", function()
    {
        var pos = positionTooltip(
        {
            x: d3.event.pageX,
            y: d3.event.pageY
        }, scene, tooltip);
        return (pos.left + 10) + 'px';
    }).style("top", function()
    {
        var pos = positionTooltip(
        {
            x: d3.event.pageX,
            y: d3.event.pageY
        }, scene, tooltip);
        return (pos.top - 10) + 'px';
    });
}
var mousemove = function(d) {
    //div.style("left", (d3.event.pageX + 10) + "px").style("top", (d3.event.pageY - 10) + "px");
    div.style("left", function()
    {
        var pos = positionTooltip(
        {
            x: d3.event.pageX,
            y: d3.event.pageY
        }, scene, tooltip);
        return (pos.left + 10) + 'px';
    }).style("top", function()
    {
        var pos = positionTooltip(
        {
            x: d3.event.pageX,
            y: d3.event.pageY
        }, scene, tooltip);
        return (pos.top - 10) + 'px';
    });
}
var mouseout = function(d) {
      div.transition().duration(500).style("opacity", 0);
}