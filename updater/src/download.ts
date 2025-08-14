export async function downloadWithProgress(
  url: string,
  headers: Record<string, string>
): Promise<Uint8Array> {
  console.log(`Starting download from: ${url}`);

  const response = await fetch(url, {
    headers,
    method: "GET"
  });

  console.log(`Download response status: ${response.status}`);
  console.log(`Content-Type: ${response.headers.get("content-type")}`);

  const contentLength = response.headers.get("content-length");
  const totalSize = contentLength ? parseInt(contentLength, 10) : 0;

  console.log(
    totalSize > 0
      ? `Content-Length: ${totalSize} bytes (${(
          totalSize /
          1024 /
          1024
        ).toFixed(2)} MB)`
      : `Content-Length: Unknown (server didn't provide size)`
  );

  if (!response.ok) {
    console.error(`Download failed with status: ${response.status}`);
    const responseText = await response.text();
    console.error(`Response body: ${responseText.slice(0, 500)}...`);
    throw new Error(
      `Failed to download PDF: ${response.status} ${response.statusText}`
    );
  }

  if (!response.body) {
    throw new Error("Response body is empty");
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let downloadedSize = 0;
  let lastProgressUpdate = 0;

  // Progress bar configuration
  const progressBarWidth = 50;
  const updateInterval = 1024 * 1024; // Update every 1MB

  if (totalSize > 0) {
    console.log("Progress: [" + " ".repeat(progressBarWidth) + "] 0%");
  } else {
    console.log("Downloaded: 0.00 MB (size unknown)");
  }

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      chunks.push(value);
      downloadedSize += value.length;

      // Update progress bar
      if (downloadedSize - lastProgressUpdate >= updateInterval) {
        const downloadedMB = (downloadedSize / 1024 / 1024).toFixed(2);

        // Clear previous line and print new progress
        process.stdout.write(`\r\x1b[K`);

        if (totalSize > 0) {
          const progress = downloadedSize / totalSize;
          const progressPercent = Math.round(progress * 100);
          const filledBars = Math.round(progress * progressBarWidth);
          const emptyBars = progressBarWidth - filledBars;

          const progressBar = "█".repeat(filledBars) + "░".repeat(emptyBars);
          const totalMB = (totalSize / 1024 / 1024).toFixed(2);

          process.stdout.write(
            `Progress: [${progressBar}] ${progressPercent}% (${downloadedMB}/${totalMB} MB)`
          );
        } else {
          // Show spinner and downloaded size when total size is unknown
          const spinners = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
          const spinnerIndex = Math.floor(Date.now() / 100) % spinners.length;
          process.stdout.write(
            `${spinners[spinnerIndex]} Downloaded: ${downloadedMB} MB`
          );
        }

        lastProgressUpdate = downloadedSize;
      }
    }

    // Final progress update
    const downloadedMB = (downloadedSize / 1024 / 1024).toFixed(2);
    process.stdout.write(`\r\x1b[K`);

    if (totalSize > 0) {
      const totalMB = (totalSize / 1024 / 1024).toFixed(2);
      process.stdout.write(
        `Progress: [${"█".repeat(
          progressBarWidth
        )}] 100% (${downloadedMB}/${totalMB} MB)\n`
      );
    } else {
      process.stdout.write(`✓ Downloaded: ${downloadedMB} MB (complete)\n`);
    }

    console.log("Download completed! Preparing buffer...");

    // Combine all chunks into a single Uint8Array
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const combinedArray = new Uint8Array(totalLength);
    let offset = 0;

    for (const chunk of chunks) {
      combinedArray.set(chunk, offset);
      offset += chunk.length;
    }

    console.log(
      `Buffer ready: ${(combinedArray.length / 1024 / 1024).toFixed(2)} MB`
    );

    return combinedArray;
  } catch (error) {
    console.error("Error during download:", error);
    throw error;
  } finally {
    reader.releaseLock();
  }
}
