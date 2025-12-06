import React from "react";

type FieldType =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "textarea"
  | "url"
  | "image"
  | "array";
type ArrayItemType =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "textarea"
  | "url"
  | "image";

interface Field {
  id: string;
  name: string;
  key: string;
  type: FieldType;
  required: boolean;
  description?: string;
  defaultValue?: string | number | boolean | unknown[];
  arrayItemType?: ArrayItemType;
}

interface Collection {
  id: string;
  name: string;
  schema: { fields: Field[] };
}

interface Entry {
  id: string;
  data: Record<string, unknown>;
  status: "draft" | "published" | "archived";
}

interface EntryEditorProps {
  collection: Collection;
  entry: Entry | null; // null for new entry
  onBack: () => void;
  onSave: (entry: Entry) => void;
}

export function EntryEditor({
  collection,
  entry,
  onBack,
  onSave,
}: EntryEditorProps) {
  const isNew = !entry;
  const [data, setData] = React.useState<Record<string, unknown>>(() => {
    if (entry) return { ...entry.data };
    // Apply defaults for new entry
    const defaults: Record<string, unknown> = {};
    for (const field of collection.schema.fields) {
      if (field.defaultValue !== undefined) {
        defaults[field.key] = field.defaultValue;
      } else if (field.type === "boolean") {
        defaults[field.key] = false;
      } else if (field.type === "number") {
        defaults[field.key] = 0;
      } else if (field.type === "array") {
        defaults[field.key] = [];
      } else {
        defaults[field.key] = "";
      }
    }
    return defaults;
  });
  const [status, setStatus] = React.useState<"draft" | "published">(
    entry?.status === "published" ? "published" : "draft"
  );
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>(
    {}
  );
  const [uploadingFields, setUploadingFields] = React.useState<Set<string>>(
    new Set()
  );

  const URL_REGEX = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

  const validateField = (field: Field, value: unknown): string | null => {
    const isEmpty =
      value === undefined ||
      value === null ||
      value === "" ||
      (Array.isArray(value) && value.length === 0);

    if (field.required && isEmpty) {
      return `${field.name} is required`;
    }

    if (isEmpty) {
      return null;
    }

    switch (field.type) {
      case "string":
      case "textarea":
        if (typeof value !== "string") return `${field.name} must be text`;
        break;
      case "number":
        if (typeof value !== "number" || isNaN(value))
          return `${field.name} must be a number`;
        break;
      case "boolean":
        if (typeof value !== "boolean")
          return `${field.name} must be true or false`;
        break;
      case "date":
        if (typeof value !== "string")
          return `${field.name} must be a valid date`;
        break;
      case "url":
        if (typeof value !== "string" || !URL_REGEX.test(value))
          return `${field.name} must be a valid URL`;
        break;
      case "image":
        if (typeof value !== "string" && typeof value !== "object")
          return `${field.name} must be a valid image`;
        break;
      case "array":
        if (!Array.isArray(value)) return `${field.name} must be an array`;
        break;
    }

    return null;
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    for (const field of collection.schema.fields) {
      const error = validateField(field, data[field.key]);
      if (error) {
        errors[field.key] = error;
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (saveStatus: "draft" | "published") => {
    if (!validate()) {
      setError("Please fix the errors below");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const endpoint = isNew
        ? "/admin/api/trpc/entries.create"
        : "/admin/api/trpc/entries.update";

      const payload = isNew
        ? { collectionId: collection.id, data, status: saveStatus }
        : { id: entry.id, data, status: saveStatus };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ json: payload }),
      });

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error.message || "Failed to save entry");
      }

      const savedEntry = result.result?.data?.json || result.result?.data;
      onSave(savedEntry);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save entry");
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (key: string, value: unknown) => {
    setData((prev) => ({ ...prev, [key]: value }));
    // Clear field error when user types
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const renderField = (field: Field) => {
    const value = data[field.key];
    const hasError = !!fieldErrors[field.key];
    const isUploading = uploadingFields.has(field.key);

    const baseInputClass = `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
      hasError ? "border-red-300 bg-red-50" : "border-gray-300"
    }`;

    switch (field.type) {
      case "string":
        return (
          <input
            type="text"
            value={(value as string) || ""}
            onChange={(e) => updateField(field.key, e.target.value)}
            className={baseInputClass}
            placeholder={
              field.description || `Enter ${field.name.toLowerCase()}`
            }
          />
        );

      case "textarea":
        return (
          <textarea
            value={(value as string) || ""}
            onChange={(e) => updateField(field.key, e.target.value)}
            className={`${baseInputClass} min-h-[120px] resize-y`}
            placeholder={
              field.description || `Enter ${field.name.toLowerCase()}`
            }
            rows={4}
          />
        );

      case "number":
        return (
          <input
            type="number"
            value={
              value === undefined || value === null ? "" : (value as number)
            }
            onChange={(e) => {
              const val = e.target.value;
              updateField(field.key, val === "" ? null : parseFloat(val));
            }}
            className={baseInputClass}
            placeholder={
              field.description || `Enter ${field.name.toLowerCase()}`
            }
          />
        );

      case "boolean":
        return (
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => updateField(field.key, e.target.checked)}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              {field.description || `Enable ${field.name.toLowerCase()}`}
            </span>
          </label>
        );

      case "date":
        return (
          <input
            type="date"
            value={
              value ? new Date(value as string).toISOString().split("T")[0] : ""
            }
            onChange={(e) => {
              const dateValue = e.target.value;
              updateField(
                field.key,
                dateValue ? new Date(dateValue).toISOString() : ""
              );
            }}
            className={baseInputClass}
          />
        );

      case "url":
        return (
          <input
            type="url"
            value={(value as string) || ""}
            onChange={(e) => updateField(field.key, e.target.value)}
            className={baseInputClass}
            placeholder={field.description || "https://example.com"}
          />
        );

      case "image":
        return (
          <ImageField
            value={value as string | { id: string; url: string } | null}
            onChange={(val) => updateField(field.key, val)}
            isUploading={isUploading}
            setUploading={(uploading) => {
              setUploadingFields((prev) => {
                const next = new Set(prev);
                if (uploading) {
                  next.add(field.key);
                } else {
                  next.delete(field.key);
                }
                return next;
              });
            }}
            hasError={hasError}
          />
        );

      case "array":
        return (
          <ArrayField
            value={value as unknown[]}
            onChange={(val) => updateField(field.key, val)}
            itemType={field.arrayItemType || "string"}
            fieldName={field.name}
            hasError={hasError}
          />
        );

      default:
        return (
          <div className="text-gray-500">
            Unsupported field type: {field.type}
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              {isNew ? `New ${collection.name} Entry` : `Edit Entry`}
            </h1>
            <p className="text-sm text-gray-500">{collection.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave("draft")}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Draft"}
          </button>
          <button
            onClick={() => handleSave("published")}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Publish"}
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Form */}
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-2xl space-y-6">
          {collection.schema.fields.map((field) => (
            <div key={field.id}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.name}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {field.description && field.type !== "boolean" && (
                <p className="text-xs text-gray-500 mb-2">
                  {field.description}
                </p>
              )}
              {renderField(field)}
              {fieldErrors[field.key] && (
                <p className="mt-1 text-sm text-red-600">
                  {fieldErrors[field.key]}
                </p>
              )}
            </div>
          ))}

          {collection.schema.fields.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>This collection has no fields defined.</p>
              <p className="text-sm mt-1">
                Add fields in the Schema Editor first.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Helper Components
// =============================================================================

interface ImageFieldProps {
  value: string | { id: string; url: string } | null;
  onChange: (value: string | { id: string; url: string } | null) => void;
  isUploading: boolean;
  setUploading: (uploading: boolean) => void;
  hasError: boolean;
}

function ImageField({
  value,
  onChange,
  isUploading,
  setUploading,
  hasError,
}: ImageFieldProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const imageUrl = typeof value === "string" ? value : value?.url;

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      // Convert file to base64 to avoid binary corruption in Next.js 16/Turbopack
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);

      const response = await fetch("/admin/api/upload", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          data: base64,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Upload failed");
      }

      const result = await response.json();
      // Store the URL
      onChange(result.url || result);
    } catch (err) {
      console.error("Upload error:", err);
      alert(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className={`relative border-2 rounded-lg overflow-hidden ${
        hasError
          ? "border-red-300 bg-red-50"
          : imageUrl
          ? "border-gray-200"
          : "border-dashed border-gray-300 hover:border-blue-400"
      }`}
    >
      {imageUrl ? (
        <>
          {/* Image preview */}
          <div className="aspect-video bg-gray-100">
            <img
              src={imageUrl}
              alt="Uploaded"
              className="w-full h-full object-contain"
            />
          </div>
          {/* Action buttons - top right */}
          <div className="absolute top-2 right-2 flex gap-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="p-1.5 text-gray-600 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-md hover:bg-white hover:text-blue-600 shadow-sm"
              title="Replace image"
            >
              {isUploading ? (
                <svg
                  className="animate-spin h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              )}
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="p-1.5 text-gray-600 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-md hover:bg-white hover:text-red-600 shadow-sm"
              title="Remove image"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </>
      ) : (
        <div
          className="text-center py-8 px-4 cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? (
            <div className="text-gray-500">
              <svg
                className="animate-spin mx-auto h-8 w-8 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <p className="mt-2 text-sm">Uploading...</p>
            </div>
          ) : (
            <>
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-600">
                Click to upload an image
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </>
          )}
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
          // Reset input so same file can be re-selected
          e.target.value = "";
        }}
      />
    </div>
  );
}

interface ArrayFieldProps {
  value: unknown[];
  onChange: (value: unknown[]) => void;
  itemType: ArrayItemType;
  fieldName: string;
  hasError: boolean;
}

function ArrayField({
  value = [],
  onChange,
  itemType,
  fieldName,
  hasError,
}: ArrayFieldProps) {
  const items = Array.isArray(value) ? value : [];

  const addItem = () => {
    let defaultValue: unknown;
    switch (itemType) {
      case "number":
        defaultValue = 0;
        break;
      case "boolean":
        defaultValue = false;
        break;
      default:
        defaultValue = "";
    }
    onChange([...items, defaultValue]);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, newValue: unknown) => {
    const newItems = [...items];
    newItems[index] = newValue;
    onChange(newItems);
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;
    const newItems = [...items];
    [newItems[index], newItems[newIndex]] = [
      newItems[newIndex],
      newItems[index],
    ];
    onChange(newItems);
  };

  const renderItemInput = (item: unknown, index: number) => {
    const baseClass =
      "flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

    switch (itemType) {
      case "string":
        return (
          <input
            type="text"
            value={(item as string) || ""}
            onChange={(e) => updateItem(index, e.target.value)}
            className={baseClass}
            placeholder="Enter text..."
          />
        );
      case "textarea":
        return (
          <textarea
            value={(item as string) || ""}
            onChange={(e) => updateItem(index, e.target.value)}
            className={`${baseClass} min-h-[80px] resize-y`}
            placeholder="Enter text..."
            rows={2}
          />
        );
      case "number":
        return (
          <input
            type="number"
            value={item === null || item === undefined ? "" : (item as number)}
            onChange={(e) =>
              updateItem(
                index,
                e.target.value === "" ? null : parseFloat(e.target.value)
              )
            }
            className={baseClass}
            placeholder="Enter number..."
          />
        );
      case "boolean":
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!!item}
              onChange={(e) => updateItem(index, e.target.checked)}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Enabled</span>
          </label>
        );
      case "date":
        return (
          <input
            type="date"
            value={
              item ? new Date(item as string).toISOString().split("T")[0] : ""
            }
            onChange={(e) =>
              updateItem(
                index,
                e.target.value ? new Date(e.target.value).toISOString() : ""
              )
            }
            className={baseClass}
          />
        );
      case "url":
        return (
          <input
            type="url"
            value={(item as string) || ""}
            onChange={(e) => updateItem(index, e.target.value)}
            className={baseClass}
            placeholder="https://example.com"
          />
        );
      case "image":
        return (
          <div className="flex-1">
            <ArrayImageItem
              value={item as string | { id: string; url: string } | null}
              onChange={(val) => updateItem(index, val)}
            />
          </div>
        );
      default:
        return <span className="text-gray-500">Unsupported type</span>;
    }
  };

  return (
    <div
      className={`border rounded-lg p-3 ${
        hasError ? "border-red-300 bg-red-50" : "border-gray-200"
      }`}
    >
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-start gap-2">
            <div className="flex flex-col gap-0.5 pt-2">
              <button
                type="button"
                onClick={() => moveItem(index, "up")}
                disabled={index === 0}
                className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => moveItem(index, "down")}
                disabled={index === items.length - 1}
                className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>
            <span className="pt-2 text-xs text-gray-400 font-mono w-6">
              {index + 1}.
            </span>
            {renderItemInput(item, index)}
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="pt-2 p-1.5 text-gray-400 hover:text-red-600"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addItem}
        className="mt-3 w-full py-2 border-2 border-dashed border-gray-300 rounded-md text-sm font-medium text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
      >
        + Add {fieldName.replace(/s$/, "")}
      </button>
    </div>
  );
}

interface ArrayImageItemProps {
  value: string | { id: string; url: string } | null;
  onChange: (value: string | { id: string; url: string } | null) => void;
}

function ArrayImageItem({ value, onChange }: ArrayImageItemProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const imageUrl = typeof value === "string" ? value : value?.url;

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/admin/api/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");
      const result = await response.json();
      onChange(result.url || result);
    } catch {
      alert("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  if (imageUrl) {
    return (
      <div className="flex items-center gap-2">
        <img
          src={imageUrl}
          alt="Uploaded"
          className="w-12 h-12 object-cover rounded border"
        />
        <input
          type="text"
          value={imageUrl}
          readOnly
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-600"
        />
        <button
          type="button"
          onClick={() => onChange(null)}
          className="p-1.5 text-gray-400 hover:text-red-600"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
      >
        {isUploading ? "Uploading..." : "Upload Image"}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
      />
    </div>
  );
}
