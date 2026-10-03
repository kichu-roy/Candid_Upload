const MAX_FILES = 5;
const MAX_TOTAL_BYTES = 10 * 1024 * 1024;

function doPost(e) {
  let requestId = "";

  try {
    const request = JSON.parse((e && e.parameter && e.parameter.payload) || "{}");
    requestId = String(request.requestId || "").slice(0, 100);

    const senderName = String(request.senderName || "").trim();
    const senderEmail = String(request.senderEmail || "").trim();
    const message = String(request.message || "").trim();
    const files = request.files;

    if (!senderName || senderName.length > 120) throw new Error("Enter a valid name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(senderEmail) || senderEmail.length > 254) {
      throw new Error("Enter a valid email address.");
    }
    if (message.length > 1000) throw new Error("The note is too long.");
    if (!Array.isArray(files) || files.length < 1 || files.length > MAX_FILES) {
      throw new Error("Choose between 1 and " + MAX_FILES + " files.");
    }

    let totalBytes = 0;
    const preparedFiles = files.map(function(file) {
      if (!file || typeof file.data !== "string" || !file.data) throw new Error("A file could not be read.");
      const bytes = Utilities.base64Decode(file.data);
      totalBytes += bytes.length;
      if (totalBytes > MAX_TOTAL_BYTES) throw new Error("The total file size exceeds 10 MB.");
      const name = safeFileName_(file.name);
      const mimeType = String(file.mimeType || "application/octet-stream").slice(0, 150);
      return Utilities.newBlob(bytes, mimeType, name);
    });

    const folderId = PropertiesService.getScriptProperties().getProperty("DRIVE_FOLDER_ID");
    if (!folderId) throw new Error("Drive storage has not been configured.");

    const parentFolder = DriveApp.getFolderById(folderId);
    const timestamp = new Date();
    const submissionFolder = parentFolder.createFolder(
      timestamp.toISOString().replace(/[:.]/g, "-") + " - " + safeFileName_(senderName).slice(0, 60)
    );
    preparedFiles.forEach(function(blob) {
      submissionFolder.createFile(blob);
    });
    submissionFolder.createFile(
      "submission.json",
      JSON.stringify({
        submittedAt: timestamp.toISOString(),
        senderName: senderName,
        senderEmail: senderEmail,
        message: message,
        files: preparedFiles.map(function(blob) { return blob.getName(); })
      }, null, 2),
      MimeType.PLAIN_TEXT
    );

    return response_(requestId, true, "Files received. Thank you!");
  } catch (error) {
    console.error(error);
    return response_(requestId, false, "Upload failed. Check the details and try again.");
  }
}

function safeFileName_(value) {
  const cleaned = String(value || "upload")
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/[\u0000-\u001f]/g, "")
    .trim()
    .slice(0, 150);
  return cleaned || "upload";
}

function response_(requestId, ok, message) {
  const result = JSON.stringify({
    type: "drive-upload-result",
    requestId: requestId,
    ok: ok,
    message: message
  }).replace(/</g, "\\u003c");

  return HtmlService.createHtmlOutput(
    "<!doctype html><html><head><meta charset=\"utf-8\"></head><body>" +
      "<script>parent.postMessage(" + result + ", '*');</script>" +
      "</body></html>"
  ).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}