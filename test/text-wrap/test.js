 var createSVG = function () {
   var svg = d3.select("body").append("svg")
     .attr('id', 'mySVG')
     .attr({
       "width": '500',
       "height": '500'
     })
   return svg;
 };

 var addImage = function (parent, imgUrl, callback) {
   var svg_img = parent.append('image')
     .attr('image-rendering', 'optimizeQuality')
     .attr('x', '100')
     .attr('y', '100');

   var img = new Image();
   img.src = imgUrl;
   img.onload = function () {
     var width = this.width;
     var height = this.height;

     svg_img.attr('height', height)
       .attr('width', width)
       .attr('xlink:href', imgUrl);
     callback(height, width);
   }
 };

 function wrap(text, width) {
   text.each(function () {
     var text = d3.select(this),
       words = text.text().split(/\s+/).reverse(),
       word,
       line = [],
       lineNumber = 0,
       lineHeight = 1.1, // ems
       y = text.attr("y"),
       dy = parseFloat(text.attr("dy") || 0),
       tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
     while (word = words.pop()) {
       line.push(word);
       tspan.text(line.join(" "));
       if (tspan.node().getComputedTextLength() > width) {
         line.pop();
         tspan.text(line.join(" "));
         line = [word];
         tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
       }
     }
     // console.log(' text BBox: ', JSON.stringify(text.getBBox()));
   });
 }

 $(document).ready(function () {

   var svg = createSVG();
   addImage(svg,
     "http://ecx.images-amazon.com/images/I/5165Cn6GA2L._SL160_.jpg",
     function (height, width) {
       var img = svg.select("image");
       svg.select("text")
         .attr("y", +img.attr("y") + height)
         .attr("x", +img.attr("x"));
     });
   svg.append("text")
     .attr("x", 50)
     .attr("y", 50)
     .text("San Francisco Then and Now (Then & Now Thunder Bay)");
   wrap(svg.selectAll("text"), 150);


 });