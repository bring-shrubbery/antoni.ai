import React from "react";

interface Field {
  id: string;
  name: string;
  key: string;
  type: "string" | "number" | "boolean";
  required: boolean;
  description?: string;
  defaultValue?: string | number | boolean;
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

  const validateField = (field: Field, value: unknown): string | null => {
    if (
      field.required &&
      (value === undefined || value === null || value === "")
    ) {
      return `${field.name} is required`;
    }

    if (value === undefined || value === null || value === "") {
      return null;
    }

    switch (field.type) {
      case "string":
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
