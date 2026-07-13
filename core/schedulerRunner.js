import { INBOX_STORAGE_KEY, processDueScheduledEmails } from "./emailScheduler.js";
import { readJSON } from "./storage.js";

export const INBOX_EMAILS_CHANGED_EVENT = "inboxEmailsChanged";

let runnerStarted = false;
let runnerInterval = null;

function dispatchInboxEmailsChanged(deliveredEmails) {
  window.dispatchEvent(new CustomEvent(INBOX_EMAILS_CHANGED_EVENT, {
    detail: {
      deliveredEmails,
      emails: readJSON(INBOX_STORAGE_KEY, [])
    }
  }));
}

function processScheduledEmails() {
  const deliveredEmails = processDueScheduledEmails();
  if (deliveredEmails.length) dispatchInboxEmailsChanged(deliveredEmails);
  return deliveredEmails;
}

export function startSchedulerRunner({ onDeliver } = {}) {
  if (runnerStarted) return processScheduledEmails;
  runnerStarted = true;

  const runAndNotify = () => {
    const deliveredEmails = processScheduledEmails();
    if (deliveredEmails.length && onDeliver) onDeliver(deliveredEmails);
  };
  const runWhenActive = () => {
    if (!document.hidden) runAndNotify();
  };

  runAndNotify();
  runnerInterval = setInterval(runWhenActive, 500);
  document.addEventListener("visibilitychange", runWhenActive);
  window.addEventListener("pageshow", runAndNotify);
  window.addEventListener("focus", runAndNotify);

  return runAndNotify;
}

export function stopSchedulerRunner() {
  if (!runnerStarted) return;
  runnerStarted = false;
  clearInterval(runnerInterval);
  runnerInterval = null;
}
