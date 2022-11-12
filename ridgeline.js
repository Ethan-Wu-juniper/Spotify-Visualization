import { getSplitdata, float_col, dropdownMenu } from './utils.js'

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
  
  const width = +selection.attr('width');
  const height = +selection.attr('height');

  const margin = { top: 100, right: 200, bottom: 70, left: 250 };
  const innerHeight = height - margin.top - margin.bottom;
  const innerWidth = width - margin.left - margin.right;

  selection.attr('transform', `translate(50, 10)`);

  const InnerG = selection.selectAll('.InnerPlot').data([null]);
  const InnerPlot = InnerG.enter().append('g')
    .merge(InnerG)
      .attr('transform', `translate(${margin.left}, ${margin.top})`)
      .attr('class', 'InnerPlot');
    

  const offset = {left : -300, right : 0};
  const xScale = d3.scaleLinear()
    .domain([-1,2])
    .range([-innerWidth, innerWidth * 2])
    .nice();

  const yScale = d3.scaleBand()
    .domain([""].concat(categories))
    .range([0, innerHeight])
    .paddingInner(1);

  let GroupCount = {};
  for(let category of categories) {
    let LabelGroup = d3.group(data, d => d[category]);
    let LabelCount = [];
    Array.from(LabelGroup, (key, value) => {
      LabelCount.push([+key[0], key[1].length]);
    });

    LabelCount = LabelCount.sort((a,b) => a[0] - b[0]);
    GroupCount[category] = LabelCount;
  }
  // const GetCountScale = (cat) => d3.scaleLinear()
  //   .domain(d3.extent(GroupCount[cat].map(d => d[1])))
  //   .range([innerHeight, 0])
  //   .nice();

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

  const line = d3.line()
    .curve(d3.curveBasis)
    .x(function(d) { return xScale(d[0]); })
    .y(function(d) { return yDensityScale(d[1]); });

  for(let density of allDensity) { 
    const DataLine = InnerG.merge(InnerPlot)
      .selectAll(`#${density.key}`).data([density]);
    DataLine.enter().append("path")
        .attr("transform", d => {
          return("translate(0," + (yScale(d.key)-innerHeight) +")" )
        })
        .attr("stroke", "blue")
        .attr("stroke-width", 1)
      .merge(DataLine)
      .transition().duration(1000)
        .attr("id", d => d.key)
        .attr("class", "dataline")
        .attr("transform", d => {
          return("translate(0," + (yScale(d.key)-innerHeight) +")" )
        })
        .attr("fill", "#69b3a2")
        .attr("stroke", "blue")
        .attr("stroke-width", 1)
        .attr("d", d => line(d.density))
        .attr('clip-path', 'url(#clip-left)');
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
    .attr('clip-path', 'url(#clip-left)')
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
    .call(lineConfig);

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
    .attr('max', 113)
    .attr('value', 0)
    .attr('style', 'position: relative; left: 20px;')
    .attr('oninput', 'module.OnRangeChange(this.value)');
}

const MenuConfig = () => {
  const menu = document.querySelector('#menus');
  const menuStyle = `
    font-size: 2.5em;
    position: relative; left: 500px;
  `;
  menu.style.cssText = menuStyle;

  const menuselect = document.querySelectorAll('#menus select');
  const selectStyle = `
    font-size: 2.5rem;
  `;
  menuselect.forEach(el => el.style.cssText = selectStyle);

  const option = document.querySelectorAll('#menus select option');
  const optionStyle = `
    font-size: 1rem;
  `;
  option.forEach(el => el.style.cssText = optionStyle);
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
  LabelSelector(selection.select(function() { return this.parentNode; }));

  d3.select('#x-menu')
    .call(dropdownMenu, {
      options: Object.keys(split_data.data),
      onOptionClicked: onColumnClicked,
      selectedOption: Label
    });

  MenuConfig();
}