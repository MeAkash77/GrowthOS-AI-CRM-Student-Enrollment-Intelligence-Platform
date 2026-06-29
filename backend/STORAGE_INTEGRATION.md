**Strictly use this SDK for file storage and NEVER use cloud storage APIs (S3, GCS, Azure Blob) directly.**

## Forbidden Dependencies

**NEVER install or import these packages - they are already wrapped in @uptiqai/integrations-sdk:**

- ❌ `@aws-sdk/client-s3` - AWS S3 SDK
- ❌ `@google-cloud/storage` - Google Cloud Storage
- ❌ `@azure/storage-blob` - Azure Blob Storage
- ❌ `aws-sdk` - Legacy AWS SDK
- ❌ `multer-s3` - S3 upload middleware

**Use instead:** `@uptiqai/integrations-sdk` for ALL storage operations

---

## Environment Variables

- `INFRA_PROVIDER` - Storage provider (required)

---

## Initialization

```typescript
import { Storage, InfraProvider } from '@uptiqai/integrations-sdk';

const storage = new Storage({ provider: process.env.INFRA_PROVIDER as InfraProvider });
```

---

## Available Methods

### 1. Upload File (Multipart Form Data)

Upload a file from multipart form data:

```typescript
const result = await storage.uploadFile({
  file: file as Blob,           // File from FormData
  destinationKey: 'path/to/file.pdf',  // Storage key/path
});
// Returns: { key, url, ... }
```

### 2. Upload Data (Base64)

Upload base64-encoded data directly:

```typescript
const result = await storage.uploadData({
  data: base64String,           // Base64 encoded data
  destinationKey: 'path/to/file.png',
  contentType: 'image/png',     // Optional, defaults to 'application/octet-stream'
});
```

### 3. Generate Upload Signed URL

Get a pre-signed URL for client-side direct uploads:

```typescript
const result = await storage.generateUploadSignedUrl({
  key: 'path/to/upload.pdf',
  contentType: 'application/pdf',  // Optional
});
// Returns: { url, ... } - Client uploads directly to this URL
```

### 4. Generate Download Signed URL

Get a pre-signed URL for downloading files:

```typescript
const result = await storage.generateDownloadSignedUrl({
  key: 'path/to/file.pdf',
  fileName: 'download-name.pdf',  // Optional, for Content-Disposition
});
// Returns: { url, ... }
```

### 5. Check Document Exists

Verify if a file exists in storage:

```typescript
const result = await storage.documentExists({
  key: 'path/to/file.pdf',
});
// Returns: { exists: boolean }
```

### 6. Get Data (Base64)

Retrieve file content as base64:

```typescript
const result = await storage.getData({
  key: 'path/to/file.pdf',
});
// Returns: { data: base64String, ... }
```

### 7. Create Read Stream

Stream file content from storage:

```typescript
const response = await storage.createReadStream({
  key: 'path/to/file.pdf',
  contentType: 'application/pdf',  // Optional
  fileName: 'download.pdf',        // Optional
});
// Returns: { data: Blob | Buffer | ArrayBuffer }
```

### 8. Create Write Stream

Write file to storage via stream:

```typescript
const result = await storage.createWriteStream(fileBlob, {
  key: 'path/to/file.pdf',
});
```

### 9. Copy File

Copy a file within storage:

```typescript
const result = await storage.copyFile({
  srcKey: 'source/path/file.pdf',
  destinationKey: 'destination/path/file.pdf',
});
```

### 10. Get File Metadata

Get file metadata (size, etc.):

```typescript
const result = await storage.getFileMetadata({
  key: 'path/to/file.pdf',
});
// Returns: { size, contentType, ... }
```

### 11. Delete File

Delete a file from storage:

```typescript
const result = await storage.deleteFile({
  key: 'path/to/file.pdf',
});
```

---

## Controller Example

```typescript
import { Storage, InfraProvider } from '@uptiqai/integrations-sdk';
import { Context } from 'hono';
import catchAsync from '../utils/catchAsync.ts';
import ApiError from '../utils/ApiError.ts';

const storage = new Storage({ provider: process.env.INFRA_PROVIDER as InfraProvider });

/** Upload file endpoint */
export const uploadFile = catchAsync(async (c: Context) => {
  const formData = await c.req.formData();
  const file = formData.get('file');
  const destinationKey = formData.get('destinationKey');

  if (!file || !(file instanceof Blob) || file.size === 0) {
    throw new ApiError(400, 'file is required (multipart form field)');
  }
  if (!destinationKey || typeof destinationKey !== 'string' || !destinationKey.trim()) {
    throw new ApiError(400, 'destinationKey is required');
  }

  const result = await storage.uploadFile({
    file: file as Blob,
    destinationKey: destinationKey.trim(),
  });

  return c.json(result);
});

/** Get signed download URL endpoint */
export const getDownloadUrl = catchAsync(async (c: Context) => {
  const body = await c.req.json<{ key: string; fileName?: string }>();

  if (!body.key) {
    throw new ApiError(400, 'key is required');
  }

  const result = await storage.generateDownloadSignedUrl({
    key: body.key,
    fileName: body.fileName,
  });

  return c.json(result);
});
```

---

## Integration Automatically Handles

- Cloud provider abstraction (S3, GCS, Azure Blob)
- Signed URL generation with proper expiration
- Content-Type and Content-Disposition headers
- Multipart upload handling
- Error handling from cloud APIs

---

## Key Points

- **Always use `process.env.INFRA_PROVIDER`** - Never hardcode providers
- Provider parameter is REQUIRED during initialization
- Use signed URLs for client-side uploads/downloads when possible
- Store the `key` in database for later retrieval
- Only one storage provider will be configured per application
