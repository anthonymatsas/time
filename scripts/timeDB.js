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
