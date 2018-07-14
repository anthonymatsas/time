window.onload = function() {
	var uploadButton = document.querySelector('#uploadButton'),
		clearButton = document.querySelector('#clearButton'),
		downloadButton = document.querySelector('#downloadButton'),
		downloadStatus = document.querySelector('#downloadStatus'),
		downloadLink = document.querySelector('#downloadLink');

	timeDB.open();

	uploadButton.onclick = function() {
		var files = selectFile.files;

		if (! files[0]) {
			console.error('No files found');
		}

		var fileReader = new FileReader();
		fileReader.onload = function (event) {
			var fileContent = event.target.result;
			uploadedData = JSON.parse(fileContent);

			if (uploadedData) {
				uploadedData.sort(function orderByCustomer(a, b) {
					if (a.customer < b.customer) {
						return -1;
					} else if (a.customer > b.customer) {
						return 1;
					}

					return 0;
				});

				for (var i in uploadedData) {
					var task = uploadedData[i];

					timeDB.createTask(task, function(time) {
						console.log(time);
					});
				}
			}

		};

		fileReader.readAsText(files[0]);
	}

	clearButton.onclick = function() {
		timeDB.removeAllTasks(function () {
			console.log('Removed all tasks');
		});
	}

	downloadButton.onclick = function(event) {
		event.preventDefault();
		//downloadStatus.classList.remove('no-show');
		//downloadStatus.innerHTML = '';

		const exportElement = document.createElement('p');
		exportElement.innerHTML = 'exporting db...';
		//downloadStatus.appendChild(exportElement);

		timeDB.export(function (tasks) {
			exportDB(tasks);
		});
	};

	function exportDB(downloadData) {
		var date = new Date(),
			m = date.getMonth() + 1,
			d = date.getDate(),
			y = date.getFullYear(),
			s = date.getSeconds(),
			fileName = "time_" + m + "_" + d + "_" + y + "_" + s + ".json";

		var link = document.createElement('a');
		link.setAttribute('href', 'data:Application/octet-stream,' + encodeURIComponent(downloadData));
		link.setAttribute('title', 'file');
		link.setAttribute('download', fileName);
		link.setAttribute('class', 'link');
		link.innerHTML = fileName;

		//downloadStatus.querySelector("p")
			//.textContent += '  done';

		downloadLink.innerHTML = '';
		downloadLink.classList.remove("no-show")
		downloadLink.appendChild(link);
		downloadLink.appendChild(document.createElement('br'));
	}
}
