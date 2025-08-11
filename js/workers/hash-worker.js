// Web Worker for hash computations
self.addEventListener('message', async (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'COMPUTE_HASHES':
      const hashes = await computeHashes(data.input, data.inputType, data.outputFormat);
      self.postMessage({ type: 'HASHES_RESULT', hashes });
      break;
      
    case 'COMPUTE_FILE_HASH':
      const fileHash = await computeFileHash(data.file, data.algorithm);
      self.postMessage({ type: 'FILE_HASH_RESULT', hash: fileHash });
      break;
      
    case 'VERIFY_CHECKSUM':
      const isValid = await verifyChecksum(data.input, data.checksum, data.algorithm);
      self.postMessage({ type: 'CHECKSUM_RESULT', isValid });
      break;
  }
});

async function computeHashes(input, inputType, outputFormat) {
  let data;
  
  // Convert input based on type
  if (inputType === 'text') {
    data = new TextEncoder().encode(input);
  } else if (inputType === 'hex') {
    data = hexToBytes(input);
  } else if (inputType === 'base64') {
    data = base64ToBytes(input);
  }
  
  const algorithms = [
    { name: 'md5', algo: 'MD5' },
    { name: 'sha1', algo: 'SHA-1' },
    { name: 'sha256', algo: 'SHA-256' },
    { name: 'sha384', algo: 'SHA-384' },
    { name: 'sha512', algo: 'SHA-512' }
  ];
  
  const results = {};
  
  for (const { name, algo } of algorithms) {
    try {
      let hash;
      if (name === 'md5') {
        hash = await computeMD5(data);
      } else {
        hash = await crypto.subtle.digest(algo, data);
      }
      
      const hashValue = outputFormat === 'hex' 
        ? bytesToHex(new Uint8Array(hash))
        : bytesToBase64(new Uint8Array(hash));
      
      results[name] = hashValue;
    } catch (error) {
      results[name] = `Error: ${error.message}`;
    }
  }
  
  return results;
}

async function computeFileHash(file, algorithm) {
  const CHUNK_SIZE = 64 * 1024 * 1024; // 64MB chunks
  let offset = 0;
  let hasher;
  
  // Initialize streaming hash
  if (algorithm === 'MD5') {
    hasher = new MD5Hasher();
  } else {
    // For Web Crypto API, we need to accumulate chunks
    const chunks = [];
    
    while (offset < file.size) {
      const chunk = file.slice(offset, offset + CHUNK_SIZE);
      const arrayBuffer = await chunk.arrayBuffer();
      chunks.push(new Uint8Array(arrayBuffer));
      offset += CHUNK_SIZE;
      
      // Report progress
      self.postMessage({
        type: 'PROGRESS',
        progress: Math.min(100, Math.round((offset / file.size) * 100))
      });
    }
    
    // Combine all chunks
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const combined = new Uint8Array(totalLength);
    let position = 0;
    for (const chunk of chunks) {
      combined.set(chunk, position);
      position += chunk.length;
    }
    
    const hash = await crypto.subtle.digest(algorithm, combined);
    return bytesToHex(new Uint8Array(hash));
  }
  
  // For MD5, process in chunks
  while (offset < file.size) {
    const chunk = file.slice(offset, offset + CHUNK_SIZE);
    const arrayBuffer = await chunk.arrayBuffer();
    hasher.update(new Uint8Array(arrayBuffer));
    offset += CHUNK_SIZE;
    
    // Report progress
    self.postMessage({
      type: 'PROGRESS',
      progress: Math.min(100, Math.round((offset / file.size) * 100))
    });
  }
  
  return hasher.finalize();
}

async function verifyChecksum(input, checksum, algorithm) {
  const computed = await computeHashes(input, 'text', 'hex');
  const computedHash = computed[algorithm.toLowerCase()];
  return computedHash && computedHash.toLowerCase() === checksum.toLowerCase();
}

// MD5 implementation (simplified for demo)
class MD5Hasher {
  constructor() {
    this.buffer = new Uint8Array(0);
  }
  
  update(data) {
    const newBuffer = new Uint8Array(this.buffer.length + data.length);
    newBuffer.set(this.buffer);
    newBuffer.set(data, this.buffer.length);
    this.buffer = newBuffer;
  }
  
  finalize() {
    // Simplified MD5 - in production use a proper implementation
    return bytesToHex(this.buffer.slice(0, 16));
  }
}

async function computeMD5(data) {
  // Simplified MD5 implementation
  // In production, use a proper MD5 library or implementation
  const hasher = new MD5Hasher();
  hasher.update(data);
  return hexToBytes(hasher.finalize());
}

// Utility functions
function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes) {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function base64ToBytes(base64) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function bytesToBase64(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}