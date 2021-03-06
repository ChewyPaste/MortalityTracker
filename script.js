'use strict';
console.log('js loaded');

var usStates =[
  ['Alabama', 'AL'],
  ['Alaska', 'AK'],
  ['Arizona', 'AZ'],
  ['Arkansas', 'AR'],
  ['California', 'CA'],
  ['Colorado', 'CO'],
  ['Connecticut', 'CT'],
  ['Delaware', 'DE'],
  ['District of Columbia', 'DC'],
  ['Florida', 'FL'],
  ['Georgia', 'GA'],
  ['Hawaii', 'HI'],
  ['Idaho', 'ID'],
  ['Illinois', 'IL'],
  ['Indiana', 'IN'],
  ['Iowa', 'IA'],
  ['Kansas', 'KS'],
  ['Kentucky', 'KY'],
  ['Louisiana', 'LA'],
  ['Maine', 'ME'],
  ['Maryland', 'MD'],
  ['Massachusetts', 'MA'],
  ['Michigan', 'MI'],
  ['Minnesota', 'MN'],
  ['Mississippi', 'MS'],
  ['Missouri', 'MO'],
  ['Montana', 'MT'],
  ['Nebraska', 'NE'],
  ['Nevada', 'NV'],
  ['New Hampshire', 'NH'],
  ['New Jersey', 'NJ'],
  ['New Mexico', 'NM'],
  ['New York', 'NY'],
  ['North Carolina', 'NC'],
  ['North Dakota', 'ND'],
  ['Ohio', 'OH'],
  ['Oklahoma', 'OK'],
  ['Oregon', 'OR'],
  ['Pennsylvania', 'PA'],
  ['Rhode Island', 'RI'],
  ['South Carolina', 'SC'],
  ['South Dakota', 'SD'],
  ['Tennessee', 'TN'],
  ['Texas', 'TX'],
  ['Utah', 'UT'],
  ['Vermont', 'VT'],
  ['Virginia', 'VA'],
  ['Washington', 'WA'],
  ['West Virginia', 'WV'],
  ['Wisconsin', 'WI'],
  ['Wyoming', 'WY'],
];

const availYears = [
  2017,
  2016,
  2015,
  2014,
  2013,
  2012,
  2011,
  2010,
  2009,
  2008,
  2007,
  2006,
  2005,
  2004,
  2003,
  2002,
  2001,
  2000,
  1999
];

$(createOptions);
$(watchButton);

const appToken = 'Makv8r9sxeet5wMNkZvDCGEl2';
const dataTopCauses =  "bi63-dtpu";
const cdcBaseURL= " https://data.cdc.gov/resource/bi63-dtpu.json?" ;
const covidBaseURL = "https://covidtracking.com/api/v1/states/";



function createOptions() {

  for (let i = 0; i < usStates.length; i++) {
    $("#stateSelect").append(new Option(usStates[i][0], usStates[i][0]));
  };
  $("#yearSelect").append(new Option(availYears[0] + " (most recent)", availYears[0]));
  for (let i = 1; i < availYears.length; i++) {
    $("#yearSelect").append(new Option(availYears[i], availYears[i]));
  };
  
  //defaults
  $("#stateSelect").val("New York");
  $("#yearSelect").val(2017);
};


function watchButton() {
  $("#stateSearchForm").on("submit", event => {
    event.preventDefault();
    $(".css-chart-sidenote").removeClass("hidden");
    $(".results").empty();
    $("#css-placeholder-wrapper").remove();
    $('.css-text-result').remove();
    $("#chartContainer>canvas").remove();
    $("#chartContainer").append(`<canvas id="myChart"></canvas>`);
    $("#chartContainer").css("height","auto")
   getMortality();
  });
};

function getMortality() {
  let selectedState = $("#stateSelect").val();
  let selectedYear = $("#yearSelect").val();
  const options = {
    headers: new Headers ({
      "X-App-Token": "Makv8r9sxeet5wMNkZvDCGEl2"
    })
  };

  //cdc fetch
  async function resultsTopDeaths(){
  let response = await fetch(`${cdcBaseURL}state=${selectedState}&year=${selectedYear}`, options);
  let responseJson = await response.json();
  return responseJson;
  }

  //covid fetch
  let abbr = getAbbr(selectedState);
  async function resultsCovid(){
    let response = await fetch(covidBaseURL + abbr + "/current.json" );
    let responseJson = await response.json();
    let covidDeaths = await responseJson.death;
    return covidDeaths;
  }

  async function displayCovidJson(){
    let result = await resultsCovid();
    return result;
  }

  Promise.all([resultsTopDeaths(),resultsCovid()])
  .then(response => {
    let holder = [];
    response.map(element => holder.push(element))
    displayResults(holder,selectedState,selectedYear);
  })
}

function displayResults(responseJson, selectedState, selectedYear){
  const results = [];
  $(".css-results-wrapper").removeClass("hidden");
  for (let i = 0; i < responseJson[0].length; i++){
    
    results.push(responseJson[0][i]);
  };

  results.sort((a, b) => parseInt(b.deaths) - parseInt(a.deaths)).push(responseJson[1]);
 
  $(".results").before(`
  <div class="css-text-result">
  <h3>In the year ${selectedYear}, there was a total of <span id="css-total-death">${Number(results[0].deaths).toLocaleString()}</span> deaths in ${selectedState}; for comparison, so far <span id="css-covid-total">${results[11].toLocaleString()}</span> people in this state has succumbed to COVID-19</h3>
  <br>
  <h4>For ${selectedYear}, the leading causes of death in ${selectedState} were:</h4>
  </div>
  `);
  for( let i = 1; i< results.length-1; i++){
    $(".results").append(`<li>${results[i].cause_name} - ${Number(results[i].deaths).toLocaleString()}</li>`);
  }

  createChart(results);
};

function createChart(data){
  let selectedState = $("#stateSelect").val();
  let selectedYear = $("#yearSelect").val();
  let xChartData = [];
  let yChartData = [];
  for( let i = 1; i< data.length-1; i++){
    xChartData.push(data[i].cause_name);
    yChartData.push(data[i].deaths);
  }
  xChartData.push("COVID-19");
  yChartData.push(data[data.length-1]);
  //console.log(xChartData + "::xchartdata::\n" + yChartData + "::ychartdata::");
  chartWrapper(xChartData,yChartData,selectedState,selectedYear);
}

function getAbbr(state) {
  const selectedState = usStates.find(s =>
    s.find(x => x.toLowerCase() === state.toLowerCase())
  )
  if (!selectedState) return null
  return selectedState[1].toLocaleLowerCase();
}

function chartWrapper(xinput,yinput,state,year){
  let labelSet = xinput;
  let yset = yinput;
  const ctx = document.getElementById('myChart').getContext('2d');
  Chart.defaults.global.legend.display = false;
  const myChart = new Chart(ctx, {
      type: 'bar',
      data: {
          labels: labelSet,
          datasets: [{
                        data: yset,
                        backgroundColor: [
                        'rgba(91, 191, 227, 0.2)',
                        'rgba(91, 191, 227, 0.2)',
                        'rgba(91, 191, 227, 0.2)',
                        'rgba(91, 191, 227, 0.2)',
                        'rgba(91, 191, 227, 0.2)',
                        'rgba(91, 191, 227, 0.2)',
                        'rgba(91, 191, 227, 0.2)',
                        'rgba(91, 191, 227, 0.2)',
                        'rgba(91, 191, 227, 0.2)',
                        'rgba(91, 191, 227, 0.2)',
                        'rgba(227, 91, 191, 0.4)',
                        ],
                        borderColor: [
                          'rgba(134, 154, 160)',
                          'rgba(134, 154, 160)',
                          'rgba(134, 154, 160)',
                          'rgba(134, 154, 160)',
                          'rgba(134, 154, 160)',
                          'rgba(134, 154, 160)',
                          'rgba(134, 154, 160)',
                          'rgba(134, 154, 160)',
                          'rgba(134, 154, 160)',
                          'rgba(134, 154, 160)',
                          'rgba(134, 154, 160)',
                        ],
                        borderWidth: 1
                    }
                    ],

      options: {
          responsive: true,
          title: {
            display: true,
          },
          scales: {
              yAxes: [{
                  display:true,
                  scaleLabel:{
                      display: true,
                      labelString: 'Value'
                    },
                  ticks: {
                      beginAtZero: true
                  }
              }]
          }
      }
    }
  });
}

