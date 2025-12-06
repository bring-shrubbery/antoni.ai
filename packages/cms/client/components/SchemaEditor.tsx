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
  slug: string;
  description: string | null;
  schema: { fields: Field[] };
}

interface SchemaEditorProps {
  collection: Collection;
  onBack: () => void;
  onViewEntries: () => void;
  onUpdate: (collection: Collection) => void;
}

const FIELD_TYPES = [
  { value: "string", label: "String", icon: "Aa" },
  { value: "number", label: "Number", icon: "#" },
  { value: "boolean", label: "Boolean", icon: "✓" },
] as const;

export function SchemaEditor({
  collection,
  onBack,
  onViewEntries,
  onUpdate,
}: SchemaEditorProps) {
  const [fields, setFields] = React.useState<Field[]>(collection.schema.fields);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [editingField, setEditingField] = React.useState<string | null>(null);
  const [hasChanges, setHasChanges] = React.useState(false);

  // Track changes
  React.useEffect(() => {
    const originalJson = JSON.stringify(collection.schema.fields);
    const currentJson = JSON.stringify(fields);
    setHasChanges(originalJson !== currentJson);
  }, [fields, collection.schema.fields]);

  const generateKey = (name: string): string => {
    return name
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .replace(/\s+(.)/g, (_, c) => c.toUpperCase())
      .replace(/\s/g, "")
      .replace(/^(.)/, (c) => c.toLowerCase());
  };

  const addField = () => {
    const newField: Field = {
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: "",
      key: "",
      type: "string",
      required: false,
    };
    setFields([...fields, newField]);
    setEditingField(newField.id);
  };

  const updateField = (fieldId: string, updates: Partial<Field>) => {
    setFields(
      fields.map((f) => {
        if (f.id !== fieldId) return f;
        const updated = { ...f, ...updates };
        // Auto-generate key from name if name changed and key is empty or was auto-generated
        if (updates.name && (!f.key || f.key === generateKey(f.name))) {
          updated.key = generateKey(updates.name);
        }
        return updated;
      })
    );
  };

  const removeField = (fieldId: string) => {
    setFields(fields.filter((f) => f.id !== fieldId));
    if (editingField === fieldId) {
      setEditingField(null);
    }
  };

  const moveField = (fieldId: string, direction: "up" | "down") => {
    const index = fields.findIndex((f) => f.id === fieldId);
    if (index === -1) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;

    const newFields = [...fields];
    [newFields[index], newFields[newIndex]] = [
      newFields[newIndex],
      newFields[index],
    ];
    setFields(newFields);
  };

  const saveSchema = async () => {
    // Validate fields
    for (const field of fields) {
      if (!field.name.trim()) {
        setError("All fields must have a name");
        return;
      }
      if (!field.key.trim()) {
        setError("All fields must have a key");
        return;
      }
      if (!/^[a-z][a-zA-Z0-9]*$/.test(field.key)) {
        setError(
          `Field key "${field.key}" must be camelCase (start with lowercase letter)`
        );
        return;
      }
    }

    // Check for duplicate keys
    const keys = fields.map((f) => f.key);
    if (new Set(keys).size !== keys.length) {
      setError("Field keys must be unique");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/admin/api/trpc/collections.updateSchema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          json: {
            id: collection.id,
            schema: { fields },
          },
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || "Failed to save schema");
      }

      const updatedCollection = data.result?.data?.json || data.result?.data;
      onUpdate(updatedCollection);
      setHasChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save schema");
    } finally {
      setIsSaving(false);
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
              {collection.name}
            </h1>
            <p className="text-sm text-gray-500">Schema Editor</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onViewEntries}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            View Entries
          </button>
          <button
            onClick={saveSchema}
            disabled={!hasChanges || isSaving}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              hasChanges
                ? "text-white bg-blue-600 hover:bg-blue-700"
                : "text-gray-400 bg-gray-100 cursor-not-allowed"
            }`}
          >
            {isSaving ? "Saving..." : "Save Schema"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Fields */}
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className={`bg-white rounded-lg border ${
                editingField === field.id
                  ? "border-blue-300 shadow-sm"
                  : "border-gray-200"
              }`}
            >
              <div
                className="flex items-center gap-3 p-3 cursor-pointer"
                onClick={() =>
                  setEditingField(editingField === field.id ? null : field.id)
                }
              >
                {/* Drag handle / reorder */}
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      moveField(field.id, "up");
                    }}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      moveField(field.id, "down");
                    }}
                    disabled={index === fields.length - 1}
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

                {/* Field type icon */}
                <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded text-sm font-mono text-gray-600">
                  {FIELD_TYPES.find((t) => t.value === field.type)?.icon}
                </div>

                {/* Field name & key */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {field.name || (
                      <span className="text-gray-400 italic">
                        Unnamed field
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    {field.key || "no key"}
                  </p>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2">
                  {field.required && (
                    <span className="px-1.5 py-0.5 text-xs font-medium text-orange-700 bg-orange-100 rounded">
                      Required
                    </span>
                  )}
                  <span className="px-1.5 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 rounded">
                    {field.type}
                  </span>
                </div>

                {/* Delete */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeField(field.id);
                  }}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>

                {/* Expand/collapse */}
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    editingField === field.id ? "rotate-180" : ""
                  }`}
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
              </div>

              {/* Expanded edit form */}
              {editingField === field.id && (
                <div className="p-4 pt-0 border-t border-gray-100 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Field Name
                      </label>
                      <input
                        type="text"
                        value={field.name}
                        onChange={(e) =>
                          updateField(field.id, { name: e.target.value })
                        }
                        placeholder="e.g., Title"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Field Key
                      </label>
                      <input
                        type="text"
                        value={field.key}
                        onChange={(e) =>
                          updateField(field.id, { key: e.target.value })
                        }
                        placeholder="e.g., title"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Field Type
                    </label>
                    <div className="flex gap-2">
                      {FIELD_TYPES.map((type) => (
                        <button
                          key={type.value}
                          onClick={() =>
                            updateField(field.id, {
                              type: type.value,
                              defaultValue: undefined,
                            })
                          }
                          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md border ${
                            field.type === type.value
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <span className="font-mono mr-2">{type.icon}</span>
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (optional)
                    </label>
                    <input
                      type="text"
                      value={field.description || ""}
                      onChange={(e) =>
                        updateField(field.id, { description: e.target.value })
                      }
                      placeholder="Help text for editors"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) =>
                          updateField(field.id, { required: e.target.checked })
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        Required field
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add field button */}
        <button
          onClick={addField}
          className="mt-4 w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
        >
          + Add Field
        </button>
      </div>
    </div>
  );
}
