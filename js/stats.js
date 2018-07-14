window.onload = function() {
	var selectFile = document.querySelector('#selectFile'),
		chartResults = document.querySelector('#chartResults'),
		chartContainer = document.querySelector('.chart'),
		chart = null,
		uploadedData = null,
		plotData = {
			title: '',
			data: []
		};

	timeDB.open(getGraphData);

	function processData() {
		var groupedData = [],
			orderedData = [];

		for (var i in uploadedData) {
			var customer = uploadedData[i].customer,
				time = parseFloat(uploadedData[i].time);

			if (! groupedData[customer]) {
				groupedData[customer] = 0;
			}

			groupedData[customer] += time;
		}

		var count = 0;
		for (var customer in groupedData) {
			orderedData[count] = [customer, groupedData[customer]];
			count++;
		}

		orderedData.sort(function (a, b) {
			if (a[0] < b[0]) {
				return -1;
			} else if (a[0] > b[0]) {
				return 1;
			}

			return 0;
		});

		plotData.data = orderedData;

		clearGraph();

		const showGraphEvent = new Event('showgraph')
		chartResults.dispatchEvent(showGraphEvent);
	}

	function getGraphData() {
		timeDB.getAllTime(function (time) {
			uploadedData = time;
			processData();
		});

		timeDB.getDateRange(function (time) {
		});
	}

	function clearGraph() {
		if (chart) {
			chart.destroy();
		}
	}

	chartResults.addEventListener('showgraph', function(event) {
		const labels = [],
			data = [],
			colors = [];

		for (var i in plotData.data) {
			let graphData = plotData.data[i];

			if (graphData) {
				labels.push(graphData[0]);
				data.push(graphData[1]);
				colors.push('rgba(54, 162, 235, 0.2)');
			}
		}

		chart = new Chart(chartResults, {
			type: 'bar',
			data: {
				labels: labels,
				datasets: [{
					label: 'Time Log ' + plotData.title,
					data: data,
					backgroundColor: colors,
					borderColor: colors,
					borderWidth: 1
				}]
			},
			options: {
				scales: {
					yAxes: [{
						ticks: {
							beginAtZero: true
						}
					}],
					xAxes: [{
						ticks: {
							autoSkip: false,
						}
					}]
				}
			}
		});

	});

}
