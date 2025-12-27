// contacts.mjs
// Assumes firebase-config.mjs is loaded (same folder) and exports { db, storage, auth }.
// Include this script as: <script type="module" src="assets/mjs/contacts.mjs"></script>

import { db, storage, auth } from "./firebase-config.mjs";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-storage.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

/* CONFIG */
const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20MB
const REQUIRE_AUTH = false;              // set true if only signed-in users can submit
const EMAIL_WEBHOOK_URL = "";            // optional backend to trigger emails (leave empty to skip)

/* HELPERS */
const byId = id => document.getElementById(id);

function createInlineError(input) {
  let err = input.parentNode.querySelector('.input-error');
  if (!err) {
    err = document.createElement('div');
    err.className = 'text-danger small mt-1 input-error';
    input.parentNode.appendChild(err);
  }
  return err;
}
function setError(input, msg) {
  const err = createInlineError(input);
  err.textContent = msg;
  input.classList.add('is-invalid');
}
function clearError(input) {
  const err = createInlineError(input);
  err.textContent = '';
  input.classList.remove('is-invalid');
}
function showAlert(container, type, html) {
  container.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${html}
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>`;
  container.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
function isEmail(v) {
  if (!v) return false;
  v = v.trim();
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  return re.test(v);
}
function isPhone(v) {
  if (!v) return true;
  return /^\d{7,15}$/.test(v.trim());
}
function validateFile(file) {
  if (!file) return { ok: true };
  if (file.size > MAX_FILE_BYTES) return { ok: false, reason: `Attachment exceeds ${MAX_FILE_BYTES/1024/1024} MB.` };
  return { ok: true };
}

/* DOM ready */
document.addEventListener('DOMContentLoaded', () => {
  const form = byId('contactForm');
  if (!form) return console.warn('contacts.mjs: contactForm not found');

  const nameEl = byId('contactName');
  const emailEl = byId('contactEmail');
  const phoneEl = byId('contactPhone');
  const subjectEl = byId('contactSubject');
  const messageEl = byId('contactMessage');
  const fileEl = byId('contactFile');
  const captchaEl = byId('contactCaptcha');

  const submitBtn = byId('contactSubmit');
  const submitSpinner = byId('submitSpinner');
  const alertWrapper = byId('formAlert');
  const resetBtn = document.querySelector('button[type="reset"]');
  const fileLabel = document.querySelector('.custom-file-label');

  // Create a small progress bar under file label (hidden until upload)
  let progressContainer;
  if (fileLabel) {
    progressContainer = document.createElement('div');
    progressContainer.className = 'mt-2';
    progressContainer.style.display = 'none';
    progressContainer.innerHTML = `
      <div class="progress" style="height:8px;">
        <div class="progress-bar" role="progressbar" style="width:0%;"></div>
      </div>
      <small class="text-muted progress-text d-block mt-1"></small>
    `;
    fileLabel.parentNode.appendChild(progressContainer);
  }

  // file label update
  if (fileEl && fileLabel) {
    fileEl.addEventListener('change', () => {
      const f = fileEl.files[0];
      fileLabel.textContent = f ? f.name : 'Choose file';
      // reset progress UI
      if (progressContainer) {
        progressContainer.style.display = 'none';
        progressContainer.querySelector('.progress-bar').style.width = '0%';
        progressContainer.querySelector('.progress-text').textContent = '';
      }
    });
  }

  // reset behavior
  if (resetBtn) resetBtn.addEventListener('click', () => {
    form.reset();
    if (fileLabel) fileLabel.textContent = 'Choose file';
    alertWrapper.innerHTML = '';
    document.querySelectorAll('.input-error').forEach(x => x.textContent = '');
    document.querySelectorAll('.is-invalid').forEach(x => x.classList.remove('is-invalid'));
    if (progressContainer) progressContainer.style.display = 'none';
  });

  // live validation
  if (nameEl) nameEl.addEventListener('blur', () => nameEl.value.trim() ? clearError(nameEl) : setError(nameEl,'Name required'));
  if (emailEl) emailEl.addEventListener('blur', () => isEmail(emailEl.value) ? clearError(emailEl) : setError(emailEl,'Invalid email'));
  if (phoneEl) phoneEl.addEventListener('blur', () => isPhone(phoneEl.value) ? clearError(phoneEl) : setError(phoneEl,'Phone must be 7-15 digits'));
  if (messageEl) messageEl.addEventListener('blur', () => messageEl.value.trim() ? clearError(messageEl) : setError(messageEl,'Message required'));
  if (subjectEl) subjectEl.addEventListener('change', () => subjectEl.value ? clearError(subjectEl) : setError(subjectEl,'Select a subject'));

  // optional: enforce auth
  if (REQUIRE_AUTH && auth) {
    onAuthStateChanged(auth, user => {
      if (!user) {
        window.location.href = 'pages/samples/register.html?return=' + encodeURIComponent(window.location.pathname);
      }
    });
  }

  // submit handler
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    alertWrapper.innerHTML = '';

    // collect
    const name = nameEl?.value?.trim() || '';
    const email = emailEl?.value?.trim() || '';
    const phone = phoneEl?.value?.trim() || '';
    const subject = subjectEl?.value || '';
    const message = messageEl?.value?.trim() || '';
    const file = fileEl?.files?.[0] || null;
    const captchaOk = captchaEl?.checked || false;

    // validate
    let hadError = false;
    if (!name) { setError(nameEl,'Name required'); hadError = true; } else clearError(nameEl);
    if (!email) { setError(emailEl,'Email required'); hadError = true; }
    else if (!isEmail(email)) { setError(emailEl,'Email invalid, e.g. user@gmail.com'); hadError = true; } else clearError(emailEl);
    if (!isPhone(phone)) { setError(phoneEl,'Phone must be numbers 7-15 digits'); hadError = true; } else clearError(phoneEl);
    if (!subject) { setError(subjectEl,'Select a subject'); hadError = true; } else clearError(subjectEl);
    if (!message) { setError(messageEl,'Message required'); hadError = true; } else clearError(messageEl);
    if (!captchaOk) { setError(captchaEl,'Confirm you are not a robot'); hadError = true; } else clearError(captchaEl);

    const fCheck = validateFile(file);
    if (!fCheck.ok) { showAlert(alertWrapper,'danger', fCheck.reason); hadError = true; }

    if (hadError) return;

    // UI lock
    submitBtn?.setAttribute('disabled','disabled');
    submitSpinner?.classList.remove('d-none');
    const oldBtnTextNode = submitBtn?.querySelector('span')?.nextSibling;
    if (oldBtnTextNode) oldBtnTextNode.textContent = ' Sending...';

    try {
      // 1) If there's a file and storage is available, upload with progress
      let fileURL = null;
      if (file && storage) {
        if (!progressContainer) throw new Error('Progress UI missing');
        progressContainer.style.display = 'block';
        const filename = `contact_attachments/${Date.now()}_${file.name.replace(/\s+/g,'_')}`;
        const sRef = storageRef(storage, filename);
        const uploadTask = uploadBytesResumable(sRef, file);

        await new Promise((resolve, reject) => {
          uploadTask.on('state_changed',
            (snap) => {
              // progress percent
              const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
              const bar = progressContainer.querySelector('.progress-bar');
              const text = progressContainer.querySelector('.progress-text');
              if (bar) bar.style.width = pct + '%';
              if (text) text.textContent = `Uploading attachment — ${pct}%`;
            },
            (err) => reject(err),
            async () => {
              try {
                fileURL = await getDownloadURL(uploadTask.snapshot.ref);
                const text = progressContainer.querySelector('.progress-text');
                if (text) text.textContent = `Upload complete`;
                resolve();
              } catch (e) { reject(e); }
            });
        });
      }

      // 2) Save to Firestore
      if (!db) throw new Error('Firestore (db) is not initialized.');
      const docRef = await addDoc(collection(db, 'contactMessages'), {
        name,
        email,
        phone: phone || null,
        subject,
        message,
        fileName: file ? file.name : null,
        fileURL: fileURL || null,
        createdAt: serverTimestamp()
      });

      // 3) Optional: call email webhook (non-blocking)
      if (EMAIL_WEBHOOK_URL) {
        try {
          await fetch(EMAIL_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: 'your-email@example.com',
              from: email,
              subject: `[Contact] ${subject} — ${name}`,
              message,
              fileURL,
              dbId: docRef.id
            }),
            keepalive: true // try to improve chance on page unload (not guaranteed)
          });
        } catch (e) {
          // Non-fatal — log and continue
          console.warn('Email webhook failed', e);
        }
      }

      // success
      showAlert(alertWrapper, 'success', `<strong>Message sent!</strong> Thanks — we received it.`);
      form.reset();
      if (fileLabel) fileLabel.textContent = 'Choose file';
      if (progressContainer) { progressContainer.style.display = 'none'; progressContainer.querySelector('.progress-bar').style.width = '0%'; }
      document.querySelectorAll('.input-error').forEach(x=>x.textContent='');
      document.querySelectorAll('.is-invalid').forEach(x=>x.classList.remove('is-invalid'));
      console.info('Saved contact message:', docRef.id);
    } catch (err) {
      console.error(err);
      showAlert(alertWrapper, 'danger', `<strong>Submission failed:</strong> ${err.message || 'Unknown error'}`);
    } finally {
      submitBtn?.removeAttribute('disabled');
      submitSpinner?.classList.add('d-none');
      if (oldBtnTextNode) oldBtnTextNode.textContent = ' Send Message';
    }
  });
});