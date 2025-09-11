// Client logic extracted from index.html
// Provides Vue 3 reactive app for Remote Pad

(() => {
	if (typeof Vue === 'undefined') {
		console.error('Vue not loaded');
		return;
	}
	const { createApp, reactive, computed } = Vue;

	createApp({
		setup() {
			const state = reactive({
				padValue: '',
				logs: [],
				lastEvent: '',
				totalChars: 0,
				connectionCount: 1,
				lastSentLength: 0,
				socket: null,
				port: (new URLSearchParams(location.search)).get('port') || '22300',
				clients: [],
				disconnectId: ''
			});

			function addLog(line) {
				const ts = new Date().toISOString();
				state.logs.push(ts + ' ' + line);
				if (state.logs.length > 500) state.logs.splice(0, state.logs.length - 500); // trim
				state.lastEvent = line;
			}

			function sendChar(char) {
				state.socket.emit('char', { c: char });
				addLog('[local] char ' + JSON.stringify(char));
			}

			function sendFull() {
				state.socket.emit('fullText', { text: state.padValue });
				addLog('[local] fullText len=' + state.padValue.length);
			}

			function onInput() {
				const newVal = state.padValue;
				if (newVal.length > state.lastSentLength) {
					const added = newVal.slice(state.lastSentLength);
					for (const ch of added) sendChar(ch);
				}
				state.lastSentLength = newVal.length;
				state.totalChars = newVal.length;
				sendFull();
			}

			function initSocket() {
				if (state.socket) return; // avoid duplicate
				state.socket = io('http://localhost:' + state.port);
                console.log('Connecting to socket.io at port', state.port);
				state.socket.on('connect', () => addLog('[info] connected ' + state.socket.id));
				state.socket.on('char', (data) => addLog('[remote] char ' + JSON.stringify(data)));
				state.socket.on('fullText', (data) => addLog('[remote] fullText len=' + (data.text?.length || 0)));
				state.socket.on('mouse', (data) => addLog('[remote] mouse ' + data.x + ',' + data.y));
				state.socket.on('clients', (data) => {
					state.clients = data.ids || [];
					state.connectionCount = state.clients.length;
					addLog('[info] clients updated count=' + state.clients.length);
				});
			}

			function ensureSocketIoAndInit() {
				if (typeof io !== 'undefined') { initSocket(); return; }
				// Attempt dynamic load from local server as fallback
				const script = document.createElement('script');
				script.src = 'http://localhost:' + state.port + '/socket.io/socket.io.js';
				script.onload = () => { if (typeof io !== 'undefined') initSocket(); else addLog('[error] socket.io client failed to load'); };
				script.onerror = () => addLog('[error] unable to load socket.io client script');
				document.head.appendChild(script);
			}

			// Mouse tracking (throttled ~30fps)
			let lastMouse = 0;
			window.addEventListener('mousemove', (e) => {
				if (!state.socket) return;
				const now = performance.now();
				if (now - lastMouse < 33) return;
				lastMouse = now;
				state.socket.emit('mouse', { x: e.clientX, y: e.clientY, w: window.innerWidth, h: window.innerHeight });
			});

			ensureSocketIoAndInit();

			const logsJoined = computed(() => state.logs.join('\n'));
			const clientListText = computed(() => state.clients.map(id => (id === state.socket?.id ? id + ' (me)' : id)).join('\n'));

			function disconnectClient(){
				const target = state.disconnectId.trim();
				if(!target){ addLog('[warn] disconnectId empty'); return; }
				state.socket.emit('disconnectClient', { id: target });
				addLog('[admin] requested disconnect of ' + target);
			}

			return { ...Vue.toRefs(state), logsJoined, clientListText, onInput, disconnectClient };
		}
	}).mount('#app');
})();
