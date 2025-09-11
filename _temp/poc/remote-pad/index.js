// Combined Electron + Socket.IO server file.
// Starts an HTTP server with Socket.IO and launches an Electron window
// containing a textbox. Every keystroke is sent to connected clients.

const { app, BrowserWindow } = require('electron');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

// ---- Socket.IO Server Setup ----
// Simple HTTP server to serve a minimal test page at http://localhost:PORT/
const server = http.createServer((req, res) => {
	if (req.url === '/') {
		const page = `<!doctype html><html><head><title>Remote Pad Test</title></head><body>
		<h2>Remote Pad Test Page</h2>
		<p>Open Electron app and type / move mouse there. Events appear here.</p>
		<pre id="out" style="height:240px;overflow:auto;border:1px solid #ccc;padding:8px;font-size:12px;"></pre>
		<script src="/socket.io/socket.io.js"></script>
		<script>
			const out = document.getElementById('out');
			function log(m){ const d=document.createElement('div'); d.textContent=new Date().toISOString()+" "+m; out.appendChild(d); out.scrollTop=out.scrollHeight; }
			const sock = io();
			sock.on('connect', ()=>log('connected '+sock.id));
			sock.on('char', d=>log('char '+JSON.stringify(d)));
			sock.on('fullText', d=>log('fullText len='+d.text.length));
			sock.on('mouse', d=>log('mouse '+d.x+','+d.y));
		</script></body></html>`;
		res.writeHead(200, { 'Content-Type': 'text/html' });
		return res.end(page);
	}
	res.writeHead(404); res.end('Not found');
});
const io = new Server(server, {
	cors: { origin: '*' }
});

function broadcastClients(){
	const ids = [...io.of('/').sockets.keys()];
	io.emit('clients', { ids });
}

io.on('connection', (socket) => {
	const count = io.of('/').sockets.size;
	console.log(`[connect] id=${socket.id} total=${count}`);
	broadcastClients();

	socket.on('char', (data) => {
		console.log(`[character] from=${socket.id} data=${JSON.stringify(data)}`);
		// Broadcast character to ALL including sender so local client also receives the event
		io.emit('char', data);
	});

	socket.on('fullText', (data) => {
		const len = data && data.text ? data.text.length : 0;
		console.log(`[fullText] from=${socket.id} length=${len}`);
		socket.broadcast.emit('fullText', data);
	});

	// Mouse coordinates broadcast
	socket.on('mouse', (data) => {
		if (data) {
			console.log(`[mouse] from=${socket.id} x=${data.x} y=${data.y} w=${data.w} h=${data.h}`);
		}
		socket.broadcast.emit('mouse', data);
	});

	socket.on('disconnectClient', (data) => {
		const targetId = data && data.id;
		if (targetId && io.of('/').sockets.has(targetId)) {
			console.log(`[admin] disconnect request for ${targetId} by ${socket.id}`);
			io.of('/').sockets.get(targetId).disconnect(true);
			setTimeout(broadcastClients, 10);
		}
	});

	socket.on('disconnect', (reason) => {
		const remaining = io.of('/').sockets.size;
		console.log(`[disconnect] id=${socket.id} reason=${reason} remaining=${remaining}`);
		broadcastClients();
	});
});

const PORT = process.env.PORT || 22300;
server.listen(PORT, () => console.log(`Socket.IO server listening on :${PORT}`));

// ---- Electron App ----
let mainWindow;

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 500,
		height: 300,
		webPreferences: {
			contextIsolation: true,
			nodeIntegration: false,
			sandbox: true
		}
	});

	// Load external HTML file with port query parameter
	const indexPath = path.join(__dirname, 'index.html');
	mainWindow.loadURL(`file://${indexPath}?port=${PORT}`);
	mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
