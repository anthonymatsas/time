window.onload = function() {
	var addButton = document.querySelector('#addButton'),
		tbody = document.querySelector('#entriesTbody'),
		taskDate = document.querySelector('#taskDate'),
		taskCustomer = document.querySelector('#taskCustomer'),
		taskTime = document.querySelector('#taskTime'),
		taskDescription = document.querySelector('#taskDescription'),
		autoCompleteDiv = document.querySelector('#autocomplete'),
		currentFocus;

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

			taskDate.valueAsDate = new Date();
			taskCustomer.value = '';
			taskTime.value = '';
			taskDescription.value = '';
		}

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

	taskCustomer.onkeydown = function(event) {
		var autoCompleteItems = document.getElementById(this.id + 'autocomplete-list');
		if (autoCompleteItems) {
			autoCompleteItems = autoCompleteItems.getElementsByTagName('div');
		}

		if (event.keyCode == 40) {
			currentFocus++;
			addActive(autoCompleteItems);
		} else if (event.keyCode == 38) {
			currentFocus--;
			addActive(autoCompleteItems);
		} else if (event.keyCode == 13) {
			e.preventDefault();
			if (currentFocus > -1 && autoCompleteItems) {
				autoCompleteItems[currentFocus].click();
			}
		}
	};

	function addActive(item) {
		if (! item) {
			return;
		}

		removeActive(item);
		if (currentFocus >= item.length) {
			currentFocus = 0;
		}

		if (currentFocus < 0) {
			currentFocus = (x.length - 1);
		}

		item[currentFocus].classList.add('autocomplete-active');
	}

	function removeActive(item) {
		for (var i = 0; i < x.length; i++) {
			item[i].classList.remove('autocomplete-active');
		}
	}

	function closeAllLists(element) {
		var autoCompleteItems = document.getElementsByClassName('autocomplete-items');
		for (var i = 0; i < autoCompleteItems.length; i++) {
			if (element != autoCompleteItems[i] && element != taskCustomer) {
				autoCompleteItems[i].parentNode.removeChild(autoCompleteItems[i])
			}
		}
	}

	taskCustomer.oninput = function(event) {
		var val = this.value;

		timeDB.getAllTime(function (time, event) {
			var data = [];

			closeAllLists();

			if (! val) {
				return false;
			}

			for (var y = 0; y < time.length; y++) {
				if (data.indexOf(time[y].customer) < 0) {
					data.push(time[y].customer);
				}
			}

			currentFocus = -1;
			var autoCompleteItems = document.createElement('DIV');
			autoCompleteItems.setAttribute('id', taskCustomer.getAttribute('id') + 'autocomplete-list');
			autoCompleteItems.setAttribute('class', 'autocomplete-items');

			autoCompleteDiv.appendChild(autoCompleteItems);
			for (var i = 0; i < data.length; i++) {
				if (data[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
					var matching = document.createElement('DIV');
					matching.setAttribute('class', 'small');
					matching.innerHTML = '<strong>' + data[i].substr(0, val.length) + '</strong>';
					matching.innerHTML += data[i].substr(val.length);
					matching.innerHTML += '<input type="hidden" value="' + data[i] + '">';

					matching.onclick = function(event) {
						taskCustomer.value = this.getElementsByTagName('input')[0].value;
						closeAllLists();
					};

					autoCompleteItems.appendChild(matching);
				}
			}
		});
	}
}
