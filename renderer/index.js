'use strict'
const { ipcRenderer } = require('electron')

const UI = {
	STORAGES: {
		FORM: document.querySelector(".store-form"),
		INPUT: document.querySelector('.store-input'),
	},
	ADD_LOG: {
		FORM: document.querySelector(".add-log__form"),
		SELECT: document.querySelector(".add-log__select"),
		TYPE: document.querySelector(".add-log__type"),
		LENGTH: document.querySelector(".add-log__length"),
		DIAMETER: document.querySelector(".add-log__diameter"),
		VOLUME: document.querySelector(".add-log__volume"),
	},
	STORE: {
		STORAGESBLOCK: document.querySelector('.storages-block'),
		SELECT: document.querySelector(".store__select"),
		SUM: document.querySelector(".sum-volume"),
	},

};

const Pi = 3.14;
let currentStorages;

UI.ADD_LOG.LENGTH.addEventListener("input", calcVolume);
UI.ADD_LOG.DIAMETER.addEventListener("input", calcVolume);

UI.STORAGES.FORM.addEventListener('submit', (e) => {
	e.preventDefault();
	if (UI.STORAGES.INPUT.value >= 2 && UI.STORAGES.INPUT.value != currentStorages && confirm("Изменить количество складов?")) {
		ipcRenderer.send('set-storages', UI.STORAGES.INPUT.value);
		ipcRenderer.send('delete-storages', UI.STORAGES.INPUT.value);
	}
});

document.querySelector('.clear-btn').addEventListener("click", () => {
	if (confirm("Очистить склады?")) {
		ipcRenderer.send('delete-storages', "-1");
		UI.STORE.SUM.textContent = 0;
		ipcRenderer.send('get-stores', UI.STORE.SELECT.value);
	}
})

UI.ADD_LOG.FORM.addEventListener('submit', (e) => {
	e.preventDefault();
	if (UI.ADD_LOG.SELECT.value &&
		UI.ADD_LOG.TYPE.value &&
		UI.ADD_LOG.LENGTH.value &&
		UI.ADD_LOG.DIAMETER.value &&
		UI.ADD_LOG.VOLUME.value) {
		ipcRenderer.send('add-log', {
			store: UI.ADD_LOG.SELECT.value,
			type: UI.ADD_LOG.TYPE.value.toUpperCase().trim(),
			length: UI.ADD_LOG.LENGTH.value,
			diameter: UI.ADD_LOG.DIAMETER.value,
			volume: UI.ADD_LOG.VOLUME.value,
		});
		UI.ADD_LOG.TYPE.value = '';
		UI.ADD_LOG.LENGTH.value = '';
		UI.ADD_LOG.DIAMETER.value = '';
		UI.ADD_LOG.VOLUME.value = '';
	}
	ipcRenderer.send('get-stores', UI.STORE.SELECT.value);
});

UI.STORE.SELECT.addEventListener('change', (event) => {
	const storageClass = ".storage__" + event.target.value;
	const storage = UI.STORE.STORAGESBLOCK.querySelector(storageClass);
	const storages = UI.STORE.STORAGESBLOCK.querySelectorAll(".store__block");
	for (let item of storages) {
		item.classList.add("hidden");
	}
	storage.classList.remove("hidden");
	ipcRenderer.send('get-stores', UI.STORE.SELECT.value);
});

ipcRenderer.on('storages', (event, storages) => {
	if (storages == currentStorages) {
		return;
	}
	let html = "";
	for (let i = 1; i <= storages; i++) {
		html += `<option value="${i}">Склад ${i}</option>`;
	}
	UI.ADD_LOG.SELECT.innerHTML = html;
	UI.STORE.SELECT.innerHTML = html;
	UI.STORE.STORAGESBLOCK.innerHTML = createStorageBlock(storages);
	if (UI.STORE.STORAGESBLOCK) UI.STORE.STORAGESBLOCK.querySelector(".storage__1").classList.remove("hidden");
	currentStorages = storages;
	ipcRenderer.send('get-stores', UI.STORE.SELECT.value);
})

ipcRenderer.on('stores', (event, stores) => {
	const sum = stores.reduce((summ, item) => Number(item.volume) + Number(summ), 0)
	UI.STORE.SUM.textContent = sum;
})


ipcRenderer.on('store', (event, store, storageNumber) => {
	createStorageTable(store, storageNumber);
	createStorageList(store, storageNumber);
	storageVolume(store, storageNumber);

});


// ______Functions below _____________


function storageVolume(store, storageNumber) {
	const sum = store.reduce((summ, item) => Number(item.volume) + Number(summ), 0)
	const storageClass = ".storage__" + storageNumber;
	const storage = UI.STORE.STORAGESBLOCK.querySelector(storageClass);
	storage.querySelector('.storage-volume').textContent = sum;
}

function calcVolume() {
	if (UI.ADD_LOG.LENGTH.value && UI.ADD_LOG.DIAMETER.value) {
		UI.ADD_LOG.VOLUME.value = Number((Pi * (UI.ADD_LOG.DIAMETER.value / 2) ** 2 * UI.ADD_LOG.LENGTH.value).toFixed(2));
	}
}

function capitalizeFirstLetter(word) {
	const capitalizedWord = word[0].toUpperCase() + word.slice(1).toLowerCase();
	return capitalizedWord;
}

function createStorageTable(store, storageNumber) {
	const avgStore = {};
	store.filter(item => {
		if (item.type in avgStore) {
			avgStore[item.type].diameter += Number(item.diameter);
			avgStore[item.type].length += Number(item.length);
			avgStore[item.type].count += 1;
		} else {
			avgStore[item.type] = { "diameter": Number(item.diameter), "length": Number(item.length), "count": 1 };
		}
	});
	let html = "";
	for (const item in avgStore) {
		html += `<tr>
		<td>${capitalizeFirstLetter(item)}</td>
		<td>${avgStore[item].length / avgStore[item].count} см</td>
		<td>${avgStore[item].diameter / avgStore[item].count} см</td>
	  </tr>`
	}
	const storageClass = ".storage__" + storageNumber;
	const storage = UI.STORE.STORAGESBLOCK.querySelector(storageClass);
	const table = storage.querySelector(".store__table");
	table.querySelector('tbody').innerHTML = html;
}

function createStorageList(store, storageNumber) {
	let html = "";
	const sortedList = store.map((item) => {
		return { diameter: item.diameter, volume: item.volume };
	});
	sortedList.sort((a, b) => b.volume - a.volume);
	for (let i = 0; i < sortedList.length; i++) {
		html += `<tr>
		<td>${i + 1}</td>
		<td>${sortedList[i].diameter} см</td>
		<td>${sortedList[i].volume} см&#179</td>
	  </tr>`
	}
	const storageClass = ".storage__" + storageNumber;
	const storage = UI.STORE.STORAGESBLOCK.querySelector(storageClass);
	const table = storage.querySelector(".store__list");
	table.querySelector('tbody').innerHTML = html;
}

function createStorageBlock(storagesNumber) {
	let html = '';
	for (let i = 1; i <= storagesNumber; i++) {
		html += `
		<div class="store__block storage__${i} hidden">
		<div>Объем сырья на складе:<span class="storage-volume"> </span> см&#179</div>
		<hr>
		<div class="flex-block">
		<table class="table table-scroll store__table">
		  <thead>
			<tr>
			  <th>Порода</th>
			  <th>Ср. Длина</th>
			  <th>Ср. Диаметр</th>
			</tr>
		  </thead>
		  <tbody>
		  </tbody>
		</table>
		<table class="table table-scroll store__list">
		  <thead>
			<tr>
			  <th>№</th>
			  <th>Диаметр</th>
			  <th>Объем</th></th>
			</tr>
		  </thead>
		  <tbody>
		  </tbody>
		</table>
		</div>
	  </div>`;
	}
	return html;
}