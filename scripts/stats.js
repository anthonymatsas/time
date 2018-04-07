$(document).ready(function() {
	var selectFile = $('#selectFile'),
		importButton = $('#importButton'),
		results = $('#results'),
		uploadedData = null,
		plotData = {
			title: '',
			data: []
		};

	timeDB.open(getGraphData);

	importButton.on('click', function() {
		var files = selectFile.prop('files');

		if (! files[0]) {
			console.log('No files found');
		}

		var fileName = files[0].name.split('_');
		var graphTitle = fileName[2] + '/' + fileName[3] + '/' + fileName[4];
		plotData.title = graphTitle;

		var fileReader = new FileReader();
		fileReader.onload = function (event) {
			var fileContent = event.target.result;
			uploadedData = $.parseJSON(fileContent);

			if (uploadedData) {
				processData();
			}
		};

		fileReader.readAsText(files[0]);
	});

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

		results.trigger('showgraph');
	}

	function getGraphData() {
		timeDB.getAllTime(function (time) {
			uploadedData = time;
			processData();
		});
	}

	function clearGraph() {
		results.empty();
	}

	results.on('showgraph', function(event) {
		results.highcharts({
			chart: {
				type: 'column'
			},
			title: {
				text: 'Time Log ' + plotData.title
			},
			xAxis: {
				type: 'category',
				labels: {
					rotation: -45
				}
			},
			yAxis: {
				title: {
					text: 'Time'
				},
				min: 0
			},
			legend: {
				enabled: false
			},
			series: [
				{
					name: 'time',
					data: plotData.data,
					dataLabels: {
						enabled: true,
						rotation: -90,
						align: 'right',
						y: 10,
						color: 'white'
					}
				},
			],
		});
	});

});
