import { renderSpider } from "./track.js";
import { clearWindow } from "../utils.js";

let tracklist_data;

const trackList = (selection, track_data, page) => {
  const result_num = track_data.length;
  track_data = track_data.slice(10*(page-1),10*page);

  let column_show = ["track_name", "artists", "album_name", "track_genre", "duration_ms"];
  const Title = selection.append("h1")
    .attr('font-size', 40)
    .style('padding', '15px')
    .text("Tracks");
  const Table = selection.append("table")
    .attr('class', 'table table-hover')
    .style('margin-left', 'auto')
    .style('margin-right', 'auto');

  Table.append('caption')
    .text(`${result_num} results`)

  const tableTitles = Table.append('thead').append('tr');
  tableTitles.selectAll('th')
  .data(column_show).enter()
    .append('th')
    .text(d => {
      let col = d;
      if(d == "duration_ms")
        col = "duration";
      col = col.split('_').map(d => d[0].toUpperCase() + d.slice(1)).join(' ');
      return col;
    });

  const tableBody = Table.append('tbody');
  for(let track of track_data) {
    const row = tableBody.append('tr')
      .attr('class', 'clickable-row')
      .attr('id', track[""])
      .on("mouseover", function(_, d) {
        document.body.style.cursor = "pointer";
      })
      .on("mouseout", function(_, d) {
        document.body.style.cursor = "default";
      });
    column_show.forEach(d => {
      let content = track[d];
      if(d == "duration_ms") {
        let time_s = +content.slice(0,-3);
        let time_m = Math.floor(time_s/60);
        time_s = time_s % 60;
        content = `${time_m} min ${time_s} sec `
      }

      row.append('td')
      .attr('class', `col-${d}`)
      .text(content)
    });
  }

  jQuery(document).ready(function($) {
    $(".clickable-row").click(function(d) {
        // console.log($(this).find('.col-track_name').attr('id'))
        document.body.style.cursor = "default";
        let id = $(this).attr('id');
        clearWindow();
        let spider_data = {
          selection: tracklist_data.selection,
          data: tracklist_data.data,
          track_id: id,
          tracklist_data: tracklist_data,
        }
        renderSpider(spider_data);
    });

  });

  
}

const pageBar = (track_data, page) => {
  $(document).ready(function(){
    $("#plot").append($('<div class="pagination">').load("./pagination.html", function() {
      const max_page = Math.ceil(track_data.length/10);
      const load_page = (page_num) => {
        clearWindow();
        tracklist_data.page = page_num;
        renderTrackList(tracklist_data);
      }
      for(let i = 1; i <=5; i++) {
        let page_num = page+i-3;
        if(page < 3)
          page_num += 3-page;
        else if(page > max_page-2) {
          page_num -= page-(max_page-2)
          if(max_page < 5) 
            page_num += 5-max_page
        }
        d3.select(`#page${i}`)
          .select('a')
          .on('click', function() {
            load_page(page_num);
          })
          .text(page_num);
        d3.select(`#page${i}`)
          .classed('active', page == page_num);
      }
      for(let i = 5; i > max_page ; i--){
        d3.select(`#page${i}`).remove();
      }
      d3.select(`#page-previous`)
        .on('click', function() {
          if(page>1)
            load_page(page-1);
        });
      d3.select(`#page-next`)
        .on('click', function() {
          if(page<max_page)
            load_page(page+1);
        });
    }));
    $('.pagination').css('margin', 'auto').css('width', '10%');
  });
}

export const renderTrackList = (props) => {
  const {
    selection,
    data,
    track_name,
    page
  } = props;
  tracklist_data = props;
  d3.select('#plot').style('overflow-y', 'auto');
  data.sort(function(a, b) { return b.popularity - a.popularity });
  let track_data = data.filter(d => d.track_name.toLowerCase()
    .includes(track_name.toLowerCase()));
  trackList(selection, track_data, page);
  pageBar(track_data, page);
}