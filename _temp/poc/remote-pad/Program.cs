using System;
using System.Linq;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;
// Fully qualify SocketIOClient types to avoid namespace collision with any 'SocketIO' namespace

namespace RemotePadListener
{
	internal class Program
	{
		static async Task Main(string[] args)
		{
			string host = args.Length > 0 ? args[0] : "http://localhost:22300"; // Adjust to LAN IP if needed

			var logPath = Path.Combine(AppContext.BaseDirectory, "log.txt");
			var logLock = new object();
			using var logWriter = new StreamWriter(logPath, append: true) { AutoFlush = true };

			void Log(string message)
			{
				var line = $"{DateTime.UtcNow:O} {message}"; // ISO 8601 UTC
				lock (logLock)
				{
					Console.WriteLine(line);
					logWriter.WriteLine(line);
				}
			}

			Log($"Starting listener targeting {host}");

			var client = new SocketIOClient.SocketIO(host, new SocketIOClient.SocketIOOptions
			{
				Transport = SocketIOClient.Transport.TransportProtocol.WebSocket,
				Reconnection = true,
				ReconnectionAttempts = 20,
				ReconnectionDelay = 1000
			});

			client.OnConnected += (s, e) => { Log($"[connect] id={client.Id} url={host}"); };

			client.OnDisconnected += (s, e) => { Log($"[disconnect] reason={e}"); };

			client.OnError += (s, e) => { Log($"[error] {e}"); };

			// Character events (server emits every keystroke to all clients)
			client.On("char", resp =>
			{
				try
				{
					var doc = resp.GetValue<JsonElement>();
					if (doc.TryGetProperty("c", out var cVal))
						Log($"[char] {cVal.GetString()}");
					else
						Log($"[char] payload unexpected: {doc}");
				}
				catch (Exception ex)
				{
					Log($"[char] parse error: {ex.Message}");
				}
			});

			// Full text snapshots (server sends to others only)
			client.On("fullText", resp =>
			{
				try
				{
					var doc = resp.GetValue<JsonElement>();
					var text = doc.GetProperty("text").GetString();
					Log($"[fullText] length={(text?.Length ?? 0)}");
				}
				catch (Exception ex)
				{
					Log($"[fullText] parse error: {ex.Message}");
				}
			});

			// Mouse coordinate broadcasts
			client.On("mouse", resp =>
			{
				try
				{
					var doc = resp.GetValue<JsonElement>();
					int x = doc.GetProperty("x").GetInt32();
					int y = doc.GetProperty("y").GetInt32();
					Log($"[mouse] {x},{y}");
				}
				catch (Exception ex)
				{
					Log($"[mouse] parse error: {ex.Message}");
				}
			});

			// Client list updates
			client.On("clients", resp =>
			{
				try
				{
					var doc = resp.GetValue<JsonElement>();
					var ids = doc.GetProperty("ids").EnumerateArray().Select(j => j.GetString()).ToList();
					Log($"[clients] count={ids.Count} ids={string.Join(",", ids)}");
				}
				catch (Exception ex)
				{
					Log($"[clients] parse error: {ex.Message}");
				}
			});

			// Connect
			try
			{
				Log($"Connecting to {host} ...");
				await client.ConnectAsync();
				Log("Press ENTER to send a test char, or just watch events. Type 'quit' to exit.");

				while (true)
				{
					var line = Console.ReadLine();
					if (string.Equals(line, "quit", StringComparison.OrdinalIgnoreCase)) break;
					if (!string.IsNullOrEmpty(line))
					{
						// Emit first char of the line as a test input
						var first = line[0].ToString();
						await client.EmitAsync("char", new { c = first });
			Log($"[emit] char {first}");
					}
				}
				await client.DisconnectAsync();
			}
			catch (Exception ex)
			{
		Log($"[fatal] {ex.Message}");
			}
		}
	}
}
