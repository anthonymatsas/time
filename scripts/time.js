$(document).ready(function() {
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
