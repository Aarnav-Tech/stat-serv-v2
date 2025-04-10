let interval = null;

document.addEventListener("DOMContentLoaded", () => {
  const serverInput = document.getElementById("serverIP");
  const autoRefreshCheckbox = document.getElementById("autoRefresh");

  // ⌨️ Handle Enter Key
  serverInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      checkStatus();
    }
  });

  // 🔁 Hook auto-refresh checkbox
  autoRefreshCheckbox.addEventListener("change", toggleAutoRefresh);

  // 🌐 Handle URL Parameters
  const params = new URLSearchParams(window.location.search);
  const ipFromURL = params.get("ip");
  const refresh = params.get("refresh");

  if (ipFromURL) {
    serverInput.value = ipFromURL;
    if (refresh === "true") {
      autoRefreshCheckbox.checked = true;
      toggleAutoRefresh(); // Start auto-refresh
    }
    checkStatus();
  }
});


function toggleAutoRefresh() {
  const checkbox = document.getElementById("autoRefresh");
  clearInterval(interval);
  if (checkbox.checked) {
    interval = setInterval(checkStatus, 30000);
  }
}

function toggleDebug() {
  const debug = document.getElementById("debugInfo");
  const btn = event.target;

  if (debug.classList.contains("hidden")) {
    debug.classList.remove("hidden");
    btn.textContent = "🙈 Hide Debug Info";
  } else {
    debug.classList.add("hidden");
    btn.textContent = "🔍 Show Debug Info";
  }
}

function toggleDNS() {
  const dns = document.getElementById("dnsInfo");
  const btn = event.target;

  if (dns.classList.contains("hidden")) {
    dns.classList.remove("hidden");
    btn.textContent = "🙈 Hide DNS Info";
  } else {
    dns.classList.add("hidden");
    btn.textContent = "📡 Show DNS Info";
  }
}

function copyShareLink() {
  const ip = document.getElementById("serverIP").value.trim();
  const refresh = document.getElementById("autoRefresh").checked ? 'true' : 'false';
  const shareURL = `${window.location.origin}${window.location.pathname}?ip=${encodeURIComponent(ip)}&refresh=${refresh}`;

  navigator.clipboard.writeText(shareURL).then(() => {
    alert("📎 Shareable link copied to clipboard!");
  }).catch(err => {
    alert("Failed to copy share link.");
    console.error(err);
  });
}

function randomChar() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return chars[Math.floor(Math.random() * chars.length)];
}

function startObfuscationAnimation() {
  setInterval(() => {
    document.querySelectorAll('.obfuscated').forEach(el => {
      el.textContent = randomChar();
    });
  }, 75); // 🔁 refresh every 75ms for fast flicker like Minecraft
}

function randomChar() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  return chars[Math.floor(Math.random() * chars.length)];
}

// ⚡ Start animation on page load
startObfuscationAnimation();


function parseMinecraftColorCodes(text) {
  const colorMap = {
    '0': '#000000', '1': '#0000AA', '2': '#00AA00', '3': '#00AAAA',
    '4': '#AA0000', '5': '#AA00AA', '6': '#FFAA00', '7': '#AAAAAA',
    '8': '#555555', '9': '#5555FF', 'a': '#55FF55', 'b': '#55FFFF',
    'c': '#FF5555', 'd': '#FF55FF', 'e': '#FFFF55', 'f': '#FFFFFF'
  };

  const formatting = {
    'l': 'font-weight:bold;',
    'm': 'text-decoration:line-through;',
    'n': 'text-decoration:underline;',
    'o': 'font-style:italic;',
  };

  let result = '';
  let styleStack = [];
  let currentStyles = '';
  let isObfuscated = false;

  for (let i = 0; i < text.length; i++) {
    if (text[i] === '§' && i + 1 < text.length) {
      const code = text[++i].toLowerCase();

      if (code === 'r') {
        // Reset everything
        result += '</span>'.repeat(styleStack.length);
        styleStack = [];
        currentStyles = '';
        isObfuscated = false;
        continue;
      }

      if (colorMap[code]) {
        result += '</span>'.repeat(styleStack.length);
        styleStack = [];
        currentStyles = `color: ${colorMap[code]};`;
        result += `<span style="${currentStyles}">`;
        styleStack.push(currentStyles);
        continue;
      }

      if (formatting[code]) {
        currentStyles += formatting[code];
        result += `<span style="${formatting[code]}">`;
        styleStack.push(formatting[code]);
        continue;
      }

      if (code === 'k') {
        isObfuscated = true;
        continue;
      }
    } else {
      if (isObfuscated && text[i] !== ' ') {
        const originalChar = text[i];
        const obChar = randomChar();
        result += `<span class="obfuscated" data-char="${originalChar}" data-rand="${obChar}"></span>`;
      } else {
        result += text[i];
      }
    }
  }

  result += '</span>'.repeat(styleStack.length);
  return result;
}


async function checkStatus() {
  const ip = document.getElementById("serverIP").value.trim();
  const resultDiv = document.getElementById("result");

  if (!ip) {
    resultDiv.innerHTML = `<div class="text-red-500">⚠️ Please enter a server IP.</div>`;
    return;
  }

  resultDiv.innerHTML = `
    <div class="flex flex-col items-center justify-center my-4">
      <div class="w-8 h-8 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin"></div>
      <p class="text-gray-500 text-sm mt-2">Checking server <strong>${ip}</strong>...</p>
    </div>
  `;

  try {
    const res = await fetch(`https://api.mcsrvstat.us/3/${ip}`);
    const data = await res.json();

    setTimeout(() => {
      if (data.online) {
        const favicon = data.icon
          ? `<img src="${data.icon}" alt="Favicon" class="w-10 h-10 rounded" />`
          : '';

        resultDiv.innerHTML = `
        <div class="text-[1.1rem] leading-relaxed sm:text-[1.2rem] sm:leading-loose">
        <div class="text-base sm:text-lg"> 
        <div class="rounded-xl bg-white p-4 shadow-inner space-y-4">
            <div class="flex items-center space-x-3">
              ${favicon}
              <span class="text-green-600 font-bold text-lg">✅ Server is Online</span>
            </div>

            <div class="space-y-2 text-gray-800 text-sm">
              <div class="flex items-center space-x-2">
                <span class="font-semibold">🌐 IP:</span>
                <span class="break-all">${data.ip}${data.port && data.port !== 25565 ? `:${data.port}` : ''}</span>
                <button onclick="copyToClipboard('${data.ip}')" title="Copy IP" class="ml-2 text-indigo-500 hover:underline">📋</button>
              </div>

              <div class="flex items-center space-x-2">
                <span class="font-semibold">🧱 Version:</span>
                <span>${data.version}</span>
              </div>

              <div class="flex items-center space-x-2">
                <span class="font-semibold">🎮 Players:</span>
                <span>${data.players.online} / ${data.players.max}</span>
              </div>

              <div class="flex items-start space-x-2">
                <span class="font-semibold mt-1">📝 MOTD:</span>
                <div>
                  <div class="font-mono text-sm leading-relaxed" style="white-space:pre-wrap;">
                    ${data.motd.raw.map(line => parseMinecraftColorCodes(line)).join('<br>')}
                  </div>
                  <details class="mt-2 text-sm">
                    <summary class="text-indigo-600 cursor-pointer hover:underline">📃 Show Raw MOTD</summary>
                    <pre class="bg-gray-100 text-gray-800 text-xs p-2 mt-1 rounded overflow-x-auto whitespace-pre-wrap break-words">${JSON.stringify(data.motd.raw, null, 2)}</pre>
                  </details>
                </div>
              </div>

              <div class="flex items-center space-x-2">
                <span class="font-semibold">📶 Ping Enabled:</span>
                <span>${data.debug.ping ? 'Yes' : 'No'}</span>
              </div>

              <div class="flex items-center space-x-2">
                <span class="font-semibold">🔁 Auto Refresh:</span>
                <span>${document.getElementById("autoRefresh").checked ? 'On (30s)' : 'Off'}</span>
              </div>
              <!-- Share Link -->
              <div class="flex items-center space-x-2 mt-4">
              <button onclick="copyShareLink()" class="text-indigo-600 hover:underline font-semibold">
              📤 Copy Shareable Link
              </button>
              </div>

            </div>

            <!-- Debug Info -->
            <div class="mt-6">
              <button onclick="toggleDebug()" class="text-indigo-600 hover:underline font-semibold mb-2">
                🔍 Show Debug Info
              </button>
              <div id="debugInfo" class="hidden bg-gray-50 rounded-lg p-4 text-sm text-gray-700 space-y-1 border border-indigo-200">
                <span class="font-semibold">🕒 Cache Time:</span>
                <span>${new Date(data.debug.cachetime * 1000).toISOString()}</span>
                <div><strong>🔗 Hostname:</strong> ${data.hostname || 'N/A'}</div>
                <div><strong>🌐 IP Address:</strong> ${data.ip || 'N/A'}</div>
                <div><strong>📡 Port:</strong> ${data.port || 'N/A'}</div>
                <div><strong>📦 Protocol Version:</strong> ${data.protocol?.name || 'N/A'} (${data.protocol?.version || 'N/A'})</div>
                <div><strong>🚫 Blocked by Mojang:</strong> ${data.debug.blocked ? 'Yes' : 'No'}</div>
                <div><strong>🧭 SRV Record:</strong> ${data.debug.srv ? 'Yes' : 'No'}${data.debug.srvRecord ? ` — ${data.debug.srvRecord}` : ''}</div>
                <div><strong>📶 Ping:</strong> ${data.debug.ping ? 'Yes' : 'No'}</div>
                <div><strong>📡 Query:</strong> ${data.debug.query ? 'Yes' : 'No - Failed to read from socket.'}</div>
              </div>

              <div class="mt-4">
                <button onclick="toggleDNS()" class="text-indigo-600 hover:underline font-semibold mb-2">
                  📡 Show DNS Info
                </button>
                <div id="dnsInfo" class="hidden bg-gray-50 rounded-lg p-4 text-sm text-gray-700 space-y-1 border border-indigo-200">
                  <div><strong>🔄 SRV Record:</strong> ${data.debug.srv ? 'Yes' : 'No'}</div>
                  <div><strong>🔗 CNAME Detected:</strong> ${data.debug.cname ? data.debug.cname : 'No CNAME record'}</div>
                  <div><strong>📜 Raw DNS:</strong><br><code class="text-xs text-gray-600 break-all">${JSON.stringify(data.dns, null, 2)}</code></div>
                </div>
              </div>
            </div>
          </div>
          </div>
          </div>
        `;
      } else {
        resultDiv.innerHTML = `
          <div class="rounded-xl bg-white p-4 shadow-inner text-red-600 font-semibold text-lg">
            ❌ Server is Offline
          </div>
        `;
      }
    }, 800);
  } catch (err) {
    resultDiv.innerHTML = `
      <div class="rounded-xl bg-white p-4 shadow-inner text-red-600 font-semibold">
        ❌ Error fetching server data.
      </div>
    `;
    console.error(err);
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert("Copied to clipboard!");
  }).catch(err => {
    alert("Failed to copy IP.");
    console.error(err);
  });
}