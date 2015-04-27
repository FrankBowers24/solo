 var createSVG = function () {
   var svg = d3.select("body").append("svg")
     .attr('id', 'mySVG')
     .attr({
       "width": '500',
       "height": '500'
     })
   return svg;
 };

 var addImage = function(parent, imgUrl) {
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
       .attr('xlink:href', imgUrl)
   }
 };

 $(document).ready(function () {

   var svg = createSVG();
   addImage(svg, "http://ecx.images-amazon.com/images/I/5165Cn6GA2L._SL160_.jpg");
 });