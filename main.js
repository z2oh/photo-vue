const {app, BrowserWindow, ipcMain} = require('electron');
const fs = require('fs');
const path = require('path');
const slash = require('slash');
const url = require('url');

let win;

function init() {
	create_window();
	ipcMain.on('path_uri_updated', function(event, arg) {
		var images_flat = enumerate_files_flat(arg);
		win.webContents.send('images_array_sent_to_renderer', { arr: images_flat });
	});
}

function create_window() {
	// Create the window object.
	win = new BrowserWindow({ width: 800, height: 600 });

	// Load index.html.
	win.loadURL(url.format({
		pathname: path.join(__dirname, 'index.html'),
		protocol: 'file:',
		slashes: true
	}));

	// Automatically open dev tools at the start of app.
	win.webContents.openDevTools();

	win.on('closed', () => {
		win = null;
	});
}

app.on('ready', init);

app.on('windows-all-closed', () => {
	if(process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if(win === null) {
		createWindow();
	}
});

function is_file_image(path) {
	// TODO
	return true;
}

// This function will return an array of files and arrays in a tree structure to
// mimic the directory structure on the filesystem.
function enumerate_files_tree(dir_path) {
	var arr = [];
	// At this point, arr is guaranteed to be defined.
	var all_files = fs.readdirSync(dir_path);
	all_files.forEach(function(file) {
		var file_path = slash(path.join(dir_path, file));
		if(fs.statSync(file_path).isDirectory()) {
			arr.push(enumerate_files_tree(file_path));
		}
		else if(is_file_image(file_path)) {
			arr.push(file_path);
		}
	});
	return arr;
}

function enumerate_files_flat(dir_path) {
	var arr = [];
	// At this point, arr is guaranteed to be defined.
	var all_files = fs.readdirSync(dir_path);
	all_files.forEach(function(file) {
		var file_path = slash(path.join(dir_path, file));
		if(fs.statSync(file_path).isDirectory()) {
			arr = arr.concat(enumerate_files_flat(file_path));
		}
		else if(is_file_image(file_path)) {
			arr.push(file_path);
		}
	});
	return arr;
}