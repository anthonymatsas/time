window.onload = function() {
	var selectFile = document.querySelector('#selectFile'),
		importButton = document.querySelector('#importButton'),
		chartResults = document.querySelector('#chartResults'),
		chartContainer = document.querySelector('.chart'),
		chart = null,
		uploadedData = null,
		plotData = {
			title: '',
			data: []
		};

	timeDB.open(getGraphData);

	importButton.onclick = function() {
		var files = selectFile.files;

		if (! files[0]) {
			console.log('No files found');
		}

		var fileName = files[0].name.split('_');
		var graphTitle = fileName[2] + '/' + fileName[3] + '/' + fileName[4];
		plotData.title = graphTitle;

		var fileReader = new FileReader();
		fileReader.onload = function (event) {
			var fileContent = event.target.result;
			uploadedData = JSON.parse(fileContent);

			if (uploadedData) {
				processData();
			}
		};

		fileReader.readAsText(files[0]);
	}

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
					}]
				}
			}
		});

	});

}
