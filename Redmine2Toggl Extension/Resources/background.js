// -------- URL matching --------
function matchesRedmineIssues(url) {
  if (!url) return false;
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    const path = u.pathname.toLowerCase();
    // host contains "redmine" AND path has "/issues/"
    // OR "redmine" appears as a path segment (e.g., /redmine/issues/)
    return (host.includes("redmine") && path.includes("/issues/"));
  } catch {
    return false;
  }
}

function setActionForTab(tabId, url) {
  if (matchesRedmineIssues(url)) chrome.action.enable(tabId);
  else chrome.action.disable(tabId);
}

function sweepAllTabs() {
  try {
    chrome.tabs.query({}, (tabs) => {
      for (const t of tabs || []) {
        if (t?.id) setActionForTab(t.id, t.url);
      }
    });
  } catch {
  }
}

// Run at start
sweepAllTabs();

chrome.runtime.onInstalled.addListener(() => {
  chrome.action.disable();
  sweepAllTabs();

  chrome.contextMenus.create({
    id: "copy-clean",
    title: "Copy ticket (#ID: [Title])",
    contexts: ["page"]
  });
});

chrome.runtime.onStartup.addListener(() => {
  chrome.action.disable();
  sweepAllTabs();
});

// Keep state fresh on tab/window events
chrome.tabs.onActivated.addListener(({ tabId }) => {
  chrome.tabs.get(tabId, (tab) => tab && setActionForTab(tab.id, tab.url));
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // React on URL changes and both loading/complete
  if (changeInfo.url || changeInfo.status === "loading" || changeInfo.status === "complete") {
    setActionForTab(tabId, changeInfo.url || tab?.url);
  }
});

chrome.windows.onFocusChanged.addListener(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const t = tabs && tabs[0];
    if (t?.id) setActionForTab(t.id, t.url);
  });
});

// -------- Main runner --------
async function run(tabId) {
  await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      function toast(msg) {
        const id = "__rtc_toast__";
        let el = document.getElementById(id);
        if (!el) {
          el = document.createElement('div');
          el.id = id;
          Object.assign(el.style, {
            position: 'fixed', zIndex: 2147483647, left: '50%', bottom: '24px',
            transform: 'translateX(-50%)', padding: '8px 12px',
            background: 'rgba(0,0,0,0.8)', color: '#fff',
            borderRadius: '8px', fontSize: '12px', maxWidth: '80vw', whiteSpace: 'nowrap'
          });
          document.body.appendChild(el);
        }
        el.textContent = msg;
        clearTimeout(el.__t); el.__t = setTimeout(() => el.remove(), 1500);
      }

      const id = (location.pathname.match(/\/issues\/(\d+)(?:[/?#]|$)/) || [])[1] || null;
      const h3 = document.querySelector('.issue .subject h3') || document.querySelector('#content h3');
      const title = h3?.textContent?.trim() || null;

      if (!id || !title) { toast(`Couldn’t find ${!id ? "ticket ID" : "title"}.`); return; }

      const out = `#${id}: [${title}]`;

      // Clipboard: execCommand first (Safari), then Clipboard API
      let copied = false;
      try {
        const ta = document.createElement('textarea');
        ta.value = out; ta.style.position = 'fixed'; ta.style.top = '-1000px';
        document.body.appendChild(ta); ta.focus(); ta.select();
        copied = document.execCommand('copy'); ta.remove();
      } catch {}

      if (!copied && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(out)
          .then(() => toast(`Copied: ${out}`))
          .catch(() => toast("Clipboard blocked by the browser."));
        return;
      }
      toast(copied ? `Copied: ${out}` : "Clipboard blocked by the browser.");
    }
  });
}

// Toolbar click
chrome.action.onClicked.addListener((tab) => {
  if (tab?.id && matchesRedmineIssues(tab.url)) run(tab.id);
});

// Context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "copy-clean" && tab?.id && matchesRedmineIssues(tab.url)) {
    run(tab.id);
  }
});
