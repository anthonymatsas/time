window.onload = function() {
	var addButton = document.querySelector('#addButton'),
		backupButton = document.querySelector('#backupButton'),
		backupStatus = document.querySelector('#backupStatus'),
		backupLink = document.querySelector('#backupLink'),
		tbody = document.querySelector('#entriesTbody'),
		taskDate = document.querySelector('#taskDate'),
		taskCustomer = document.querySelector('#taskCustomer'),
		taskTime = document.querySelector('#taskTime'),
		taskDescription = document.querySelector('#taskDescription');

	taskDate.valueAsDate = new Date();
	timeDB.open(displayTasks);

	function displayTasks() {
		timeDB.getAllTime(function (time) {

			tbody.innerHTML = '';

			for (var i = 0; i < time.length; i++) {
				var task = time[(time.length - 1 - i)];

				if (! task.complete) {
					var tds = [
						"<button class='deleteButton' data-task-id='" + task.id + "'>x</button>",
						task.taskDate,
						task.customer,
						task.time,
						task.description,
					];

					var tr = document.createElement('tr');
					tbody.appendChild(tr);

					for (var x in tds) {
						let html = tds[x];
						let td = document.createElement('td');
						td.innerHTML = html.trim();

						tr.appendChild(td);
					}

				}
			}

			const deleteButtons = document.querySelectorAll('.deleteButton');
			for (var x = 0; x < deleteButtons.length; x++) {
				deleteButtons[x].addEventListener('click', function() {
					const taskId = this.dataset.taskId;
					timeDB.completeTask(taskId, displayTasks);
				});
			}

		});
	}

	addButton.onclick = function(event) {
		event.preventDefault();
		var isValid = validateInputs();

		if (isValid) {
			var time = {
				'customer': taskCustomer.value,
				'time': taskTime.value,
				'description': taskDescription.value,
				'complete': 0,
				'taskDate': taskDate.value,
				'createdDateTime': new Date().getTime(),
				'completedDateTime': null,
			};

			timeDB.createTask(time, function(task) {
				displayTasks();
			});

			taskDate.value = '';
			taskCustomer.value = '';
			taskTime.value = '';
			taskDescription.value = '';
		}

	};

	backupButton.onclick = function(event) {
		event.preventDefault();
		backupStatus.classList.remove('no-show');
		backupStatus.innerHTML = '';

		const exportElement = document.createElement('p');
		exportElement.innerHTML = 'exporting db...';
		backupStatus.appendChild(exportElement);

		timeDB.export(function (tasks) {
			exportDB(tasks);
		});
	};

	function validateInputs() {
		var inputs = document.querySelectorAll('input'),
			error = document.querySelector('#error'),
			valid = true,
			message = '';

		error.innerHTML = '';

		inputs.forEach(function(element, index) {
			if (element.tagName != 'BUTTON' && ! element.value) {
				var elementId = element.getAttribute('id').replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
				valid = false;

				message += elementId + ' required<br>';
				return false;
			}

			if (! valid) {
				return false;
			}
		});

		if (message && ! valid) {
			const errorP = document.createElement('p');
			errorP.innerHTML = message;

			error.classList.remove('no-show');
			error.classList.add('show');
			error.appendChild(errorP);
		} else {
			error.classList.remove('show');
			error.classList.add('no-show');
		}

		return valid;
	}

	function exportDB(backupData) {
		var date = new Date(),
			m = date.getMonth() + 1,
			d = date.getDate(),
			y = date.getFullYear(),
			s = date.getSeconds(),
			fileName = "time_backup_" + m + "_" + d + "_" + y + "_" + s + ".json";

		var link = document.createElement('a');
		link.setAttribute('href', 'data:Application/octet-stream,' + encodeURIComponent(backupData));
		link.setAttribute('title', 'file');
		link.setAttribute('download', fileName);
		link.setAttribute('class', 'link');
		link.innerHTML = fileName;

		backupStatus.querySelector("p")
			.textContent += '  done';

		backupLink.innerHTML = '';
		backupLink.classList.remove("no-show")
		backupLink.appendChild(link);
		backupLink.appendChild(document.createElement('br'));
	}
}
