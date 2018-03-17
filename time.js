$(document).ready(function() {
	var timeDB = (function() {
		var db = {},
			dataStore = null
			storeName = "time";

		//db connection
		db.open = function(callback) {
			var version = 1,
				store = indexedDB.open(storeName, version);

			store.onupgradeneeded = function (event) {
				var conn = event.target.result;
				event.target.transaction.onerror = db.onerror;

				if (conn.objectStoreNames.contains(storeName)) {
					conn.deleteObjectStore(storeName);
				}

				var newStore = conn.createObjectStore(storeName, { keyPath: "id", autoIncrement: true});
			};

			store.onsuccess = function (event) {
				dataStore = event.target.result;

				callback();
			};

			store.onerror = db.onerror;
		};

		//get all tasks
		db.getAllTime = function (callback) {
			var store = dataStore,
				transaction = store.transaction(storeName, "readwrite"),
				objectStore = transaction.objectStore(storeName);

			var time = [];

			transaction.oncomplete = function(event) {
				callback(time);
			};

			var keyRange = IDBKeyRange.lowerBound(0),
				cursorRequest = objectStore.openCursor(keyRange);

			cursorRequest.onsuccess = function (event) {
				var result = event.target.result;

				if (! result) {
					return;
				}

				time.push(result.value);

				result.continue();
			};

			cursorRequest.onerror = db.onerror;
		};

		//add task
		db.createTask = function (data, callback) {
			var store = dataStore,
				transaction = store.transaction(storeName, "readwrite"),
				objectStore = transaction.objectStore(storeName);

			var time = {
				"customer": data.customer,
				"time": data.time,
				"description": data.description,
				"complete": data.complete,
				"taskDate": data.taskDate,
				"createdDateTime": new Date().getTime(),
				"completedDateTime": null,
			};

			var dataStoreRequest = objectStore.put(time);
			dataStoreRequest.onsuccess = function (event) {
				callback(time);
			}

			dataStoreRequest.onerror = db.onerror;
		};

		//remove task
		db.removeTask = function(id, callback) {
			var store = dataStore,
				transaction = store.transaction(storeName, "readwrite"),
				objectStore = transaction.objectStore(storeName);

			if (! id) {
				return;
			}

			var dataStoreRequest = objectStore.delete(id);
			dataStoreRequest.onsuccess = function(event) {
				callback();
			};

			dataStoreRequest.onerror = function (event) {
				console.log(event);
			}
		};

		db.completeTask = function(id, callback) {
			var store = dataStore,
				transaction = store.transaction(storeName, "readwrite"),
				objectStore = transaction.objectStore(storeName);

			var dataStoreRequest = objectStore.get(id);

			dataStoreRequest.onsuccess = function(event) {
				var task = dataStoreRequest.result;
				task.complete = 1;
				var updateRequest = objectStore.put(task);
				updateRequest.onsuccess = function(event) {
					callback(task);
				};
			};

			dataStoreRequest.onerror = function (event) {
				console.log(event);
			}
		};

		db.export = function(callback) {
			var stores = [
				"time",
			];

			db.getAllTime(function(tasks) {
				callback(JSON.stringify(tasks));
			});
		};

		return db;
	}());

	var addButton = $("#addButton"),
		backupButton = $("#backupButton"),
		backupStatus = $("#backupStatus"),
		backupLink = $("#backupLink"),
		tbody = $("#entriesTbody"),
		taskDate = $("#taskDate"),
		taskCustomer = $("#taskCustomer"),
		taskTime = $("#taskTime"),
		taskDescription = $("#taskDescription");

	timeDB.open(displayTasks);

	function displayTasks() {
		timeDB.getAllTime(function (time) {

			tbody.empty();

			for (var i = 0; i < time.length; i++) {
				var task = time[(time.length - 1 - i)];

				if (! task.complete) {
					var tds = [
						"<td><button class='deleteButton' data-task-id='" + task.id + "'>x</button></td>",
						"<td>" + task.taskDate + "</td>",
						"<td>" + task.customer + "</td>",
						"<td>" + task.time + "</td>",
						"<td>" + task.description + "</td>",
					];

					var tr = tbody.append("<tr></tr>");
					for (var x in tds) {
						tr.append(tds[x]);
					}
				}
			}

			$(".deleteButton").on("click", function() {
				var taskId = $(this).data("taskId");
				timeDB.completeTask(taskId, displayTasks);
			});

		});
	}

	addButton.on("click", function(event) {
		event.preventDefault();
		var isValid = validateInputs();

		if (isValid) {
			var time = {
				"customer": taskCustomer.val(),
				"time": taskTime.val(),
				"description": taskDescription.val(),
				"complete": 0,
				"taskDate": taskDate.val(),
				"createdDateTime": new Date().getTime(),
				"completedDateTime": null,
			};

			timeDB.createTask(time, function(task) {
				displayTasks();
			});

			taskDate.val("");
			taskCustomer.val("");
			taskTime.val("");
			taskDescription.val("");
		}

	});

	backupButton.on("click", function(event) {
		event.preventDefault();
		backupStatus.removeClass("no-show")
			.empty()
			.append("<p>exporting db... </p>");

		timeDB.export(function (tasks) {
			exportDB(tasks);
		});
	});

	function validateInputs() {
		var inputs = $(':input'),
			error = $("#error"),
			valid = true,
			message = "";

		error.empty();

		$.each(inputs, function(index, ui) {
			if (! $(this).is('button') && ! $(this).val()) {
				var elementId = $(this).attr('id').replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
				valid = false;

				message = elementId + ' required';
				return false;
			}

			if (! valid) {
				return false;
			}
		});

		if (message && ! valid) {
			error.removeClass("no-show")
				.addClass('show')
				.append("<p>" + message + "</p>");
		} else {
			error.removeClass("show")
				.addClass("no-show");
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

		var link = $("<a>")
			.attr("href", "data:Application/octet-stream," + encodeURIComponent(backupData))
			.attr("title", "file")
			.attr("download", fileName)
			.text(fileName)
			.addClass("link");

		backupStatus.find("p")
			.append("  done");

		backupLink.removeClass("no-show")
			.html(link)
			.append("<br>");
	}
});
