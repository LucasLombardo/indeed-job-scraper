$(function() {
  $.getJSON(
    "https://raw.githack.com/LucasLombardo/drum-machine/master/frontendfull.json",
    function(data) {
      $.each(data, function(i, job) {
        $("#jobs").append(`
            <li><a href ="https://www.indeed.com${
              job.link
            }">${job.title} - ${job.location}</a></li>
        `);
      });
    }
  );
});
