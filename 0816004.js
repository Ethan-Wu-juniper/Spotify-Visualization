let data;
let Label = "id";

const get_id = () => {
  let input = document.getElementById("id").value;
  console.log(input);
  out = data.filter((d) => {
    return d.artists.toLowerCase()
      .includes(input.toLowerCase())
  })
  console.log(out);
}

const dropdownMenu = (selection, props) => {
  const {
    options,
    onOptionClicked,
    selectedOption
  } = props;
  
  let select = selection.selectAll('select').data([null]);
  select = select.enter().append('select')
    .merge(select)
      .on('change', function() {
        onOptionClicked(this.value);
      });
  
  const option = select.selectAll('option').data(options.slice(1));
  option.enter().append('option')
    .merge(option)
      .attr('value', d => d)
      .property('selected', d => d === selectedOption)
      .text(d => d);
};

const onColumnClicked = column => {
  Label = column;
  render();
};

const render = () => {

  d3.select('#column')
    .call(dropdownMenu, {
      options: data.columns,
      onOptionClicked: onColumnClicked,
      selectedOption: Label
    });

}

const show_col = (col) => {
  stat = {};
  data.forEach(el => {
    stat[el[col]] += 1;
  });
}

d3.csv("archive/dataset.csv").then(loaddata => {
  data = loaddata;
  console.log(data);
  render();
})