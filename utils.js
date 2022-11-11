export class DefaultDict {
  constructor(defaultVal) {
    return new Proxy({}, {
      get: (target, name) => name in target ? target[name] : defaultVal
    })
  }
};

export function fn() {
  console.log('這是一段函式')
};

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

const nonNumeric_col = ["track_id", "artists", "album_name", "track_name", "track_genre", "time_signature", "explicit", "key", "mode"];
const float_col = ["popularity", "danceability", "energy", "speechiness", "acousticness", "instrumentalness", "liveness", "valence"]

export { nonNumeric_col, float_col };