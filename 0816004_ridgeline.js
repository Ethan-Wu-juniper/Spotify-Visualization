import { getSplitdata, float_col, dropdownMenu, clearWindow } from './0816004_utils.js'
import { renderBarChart } from './0816004_barchart.js'

let ridge_data;
let split_data;

function kernelDensityEstimator(kernel, X) {
  return function(V) {
    return X.map(function(x) {
      return [x, d3.mean(V, function(v) { return kernel(x - v); })];
    });
  };
}
function kernelEpanechnikov(k) {
  return function(v) {
    return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
  };
}

const Ridgeline = (selection, Label) => {
  let data = split_data.data[Label];
  let categories = float_col;
  
  const height = 800;
  const width = 1500;

  const svg = selection.selectAll('.svg-plot').data([null]);
  const svgEnter = svg.enter().append('svg')
  .merge(svg)
    .attr('class', 'svg-plot')
    .attr('height', height)
    .attr('width', width);

  const margin = { top: 50, right: 150, bottom: 70, left: 240 };
  const innerHeight = height - margin.top - margin.bottom;
  const innerWidth = width - margin.left - margin.right;


  const InnerG = svg.merge(svgEnter)
    .selectAll('.InnerPlot').data([null]);
  const InnerPlot = InnerG.enter().append('g')
    .merge(InnerG)
      .attr('transform', `translate(${margin.left}, ${margin.top})`)
      .attr('class', 'InnerPlot');
    

  const offset = {left : -300, right : 0};
  const xScale = d3.scaleLinear()
    .domain([0,1])
    .range([0, innerWidth])
    .nice();

  const yScale = d3.scaleBand()
    .domain([""].concat(categories))
    .range([0, innerHeight])
    .paddingInner(1);



  let kde = kernelDensityEstimator(kernelEpanechnikov(0.5), xScale.ticks(40))
  let allDensity = []
  for (let i = 0; i < categories.length; i++) {
  // for (let i = 0; i < 1; i++) {
      let key = categories[i]
      let density = kde( data.map(function(d){  return d[key]; }) )
      allDensity.push({key: key, density: density})
  }

  const lineConfig = AxisG => {
    // AxisG.selectAll('.domain').remove();
    AxisG.selectAll('line')
      .attr("opacity", 0.5)
      .attr("stroke-width", 1.6);
    AxisG.selectAll('text')
      .attr('font-size', 20);
  }

  const ClipPath = InnerG.merge(InnerPlot)
    .selectAll("#clip-left").data([null]);
  ClipPath.enter().append('clipPath')
    .attr('id', 'clip-left')
  .append('rect')
  .attr('x', xScale(0))
  .attr('y', 0)
  .attr('width', xScale(1)-xScale(0))
  .attr('height', height);



  const yDensityScale = d3.scaleLinear()
    .domain([0, 10])
    .range([ innerHeight, 0]);

  // let GroupCount = {};
  // for(let category of categories) {
  //   let LabelCount = getLabelCount(data, category);
  //   GroupCount[category] = LabelCount;
  // }
  // const getLine = (category) => {
  //   d3.line()
  //     .x(d => d3.scaleLinear()
  //       .domain(d3.extent(data, d => +d[category]))
  //       .range([0, innerWidth])
  //       .nice()(d[0])
  //     )
  //     .y(d => d3.scaleLinear()
  //       .domain(d3.extent(GroupCount[category].map(d => d[1])))
  //       .range([innerHeight, 0])
  //       .nice()(d[1])
  //     )(GroupCount[category])
  // };

  const area = d3.area()
    .curve(d3.curveBasis)
    .x(function(d) { return xScale(d[0]); })
    .y0(function(d) { return yDensityScale(0); })
    .y1(function(d) { return yDensityScale(d[1]); });

  const PathMouseEvent = (element) => {
    element.on('click', function(_, d) {
      let selected_id = d3.select(this).text();
      if(selected_id == '')
        selected_id = d3.select(this).attr('id');
      let bar_data = {
        selection: ridge_data.selection,
        data: ridge_data.data,
        split_col: ridge_data.split_col,
        cur_col: ridge_data.Label,
        Label: selected_id,
      }
      clearWindow();
      document.body.style.cursor = "default";
      renderBarChart(bar_data);
    })
    .on("mouseover", function(_, d) {
      d3.select(this).attr('opacity', 0.85);
      document.body.style.cursor = "pointer";
    })
    .on("mouseout", function(_, d) {
      d3.select(this).attr('opacity', 1);
      document.body.style.cursor = "default";
    });
  }

  for(let density of allDensity) { 
    const DataLine = InnerG.merge(InnerPlot)
      .selectAll(`#${density.key}`).data([density]);
    let path = DataLine.enter().append("path")
        .attr("transform", d => {
          return("translate(0," + (yScale(d.key)-innerHeight) +")" )
        })
        .attr("stroke", "blue")
        .attr("stroke-width", 1)
        .call(PathMouseEvent)
      .merge(DataLine)
      .transition().duration(200)
        .attr("id", d => d.key)
        .attr("class", "dataline")
        .attr("transform", d => {
          return("translate(0," + (yScale(d.key)-innerHeight) +")" )
        })
        .attr("fill", "#69b3a2")
        .attr("stroke", "blue")
        .attr("stroke-width", 1)
        .attr("d", d => area(d.density));
        // .attr("d", d => interpolatePath(area(d.density), getLine(d.key))(0));
  }

  const xAxis = d3.axisBottom(xScale)
    .tickPadding(15);
  const xAxisG = InnerG.merge(InnerPlot)
    .selectAll(".x-axis").data([null]);
  xAxisG.enter().append('g')
  .merge(xAxisG)
    .attr('class', 'x-axis')
    .call(xAxis)
    .attr('transform', `translate(0, ${innerHeight})`)
    .call(lineConfig)
  .selectAll('text')
    .attr('transform', `translate(-15, 0)`);

  const yAxis = d3.axisLeft(yScale)
    .tickSize(-innerWidth)
    .tickPadding(15);
  const yAxisG = InnerG.merge(InnerPlot)
    .selectAll(".y-axis").data([null]);
  yAxisG.enter().append('g')
  .merge(yAxisG)
    .attr('class', 'y-axis')
    .call(yAxis)
    .attr('transform', `translate(${xScale(0)}, 0)`)
    .call(lineConfig)
  .selectAll('text')
    .call(PathMouseEvent);

  d3.selectAll('.axis-label').remove();

}

export const OnRangeChange = (val) => {
  onColumnClicked(split_data.cats[val]);
}

const onColumnClicked = column => {
  ridge_data.Label = column;
  d3.select('#label-range')
    .attr('value', split_data.cats.findIndex(el => el == column));
  renderRidgeline(ridge_data);
};

const LabelSelector = (selection) => {
  const menus = selection.selectAll('#menus').data([null]);
  const menuDiv = menus.enter().append('div')
    .attr('id', 'menus');
  menuDiv.append('label')
    .text(`${ridge_data.split_col} : `);
  menuDiv.append('span')
    .attr('id', 'x-menu');
  menuDiv.append('input')
    .attr('id', 'label-range')
    .attr('type', 'range')
    .attr('min', 0)
    .attr('max', Object.keys(split_data.data).length-1)
    .attr('value', 0)
    .attr('style', 'position: relative; left: 20px;')
    .attr('oninput', 'module.OnRangeChange(this.value)');
}


export const renderRidgeline = (props) => {
  const {
    selection,
    data,
    split_col,
    Label
  } = props;

  if(ridge_data != props) {
    ridge_data = props;
    split_data = getSplitdata(data, split_col);
  }

  Ridgeline(selection, Label);
  LabelSelector(selection);

  d3.select('#x-menu')
    .call(dropdownMenu, {
      options: Object.keys(split_data.data),
      onOptionClicked: onColumnClicked,
      selectedOption: Label
    });

  // MenuConfig();
}