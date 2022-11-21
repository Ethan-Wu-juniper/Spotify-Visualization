export class DefaultDict {
  constructor(defaultVal) {
    return new Proxy({}, {
      get: (target, name) => name in target ? target[name] : defaultVal
    })
  }
};

export function getElementSize(tag) {
  let box = document.querySelector(tag).getBBox();
  let height = +box.height;
  let width = +box.width;

  return { height, width };
}

export function getSplitdata(input_data, split_col) {
  let data = {};
  let cats = [];
  input_data.forEach(d => {
    if(!cats.includes(d[split_col])) {
      cats.push(d[split_col]);
    }
  });
  cats.forEach(cat => {
    data[cat] = input_data.filter(d => {
      return d[split_col] == cat;
    })
  });
  return {data, cats};
}

export const dropdownMenu = (selection, props) => {
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
  
  const option = select.selectAll('option').data(options);
  option.enter().append('option')
    .merge(option)
      .attr('value', d => d)
      .property('selected', d => d === selectedOption)
      .text(d => d);
};

export const getLabelCount = (data, Label) => {
  const LabelGroup = d3.group(data, d => d[Label]);
  let LabelCount = [];
  Array.from(LabelGroup, (key, value) => {
    LabelCount.push([+key[0], key[1].length]);
  });

  return LabelCount.sort((a,b) => a[0] - b[0]);
}

export const clearWindow = () => {
  // d3.select('#main-plot').selectAll("*").remove();
  d3.select("#plot").selectAll("*").remove();
}

const nonNumeric_col = ["track_id", "artists", "album_name", "track_name", "track_genre", "time_signature", "explicit", "key", "mode", "popularity", "duration_ms"];
const float_col = ["danceability", "energy", "speechiness", "acousticness", "instrumentalness", "liveness", "valence"]
const plot_types = ["barchart", "ridgeline"]

export { nonNumeric_col, float_col, plot_types };