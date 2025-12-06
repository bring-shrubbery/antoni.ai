import React from "react";

interface Field {
  id: string;
  name: string;
  key: string;
  type: "string" | "number" | "boolean";
  required: boolean;
  description?: string;
}

interface Collection {
  id: string;
  name: string;
  slug: string;
  schema: { fields: Field[] };
}

interface Entry {
  id: string;
  data: Record<string, unknown>;
  status: "draft" | "published" | "archived";
  createdAt: string;
  updatedAt: string;
}

interface EntriesListProps {
  collection: Collection;
  onBack: () => void;
  onEditSchema: () => void;
  onEditEntry: (entry: Entry) => void;
  onCreateEntry: () => void;
}

export function EntriesList({
  collection,
  onBack,
  onEditSchema,
  onEditEntry,
  onCreateEntry,
}: EntriesListProps) {
  const [entries, setEntries] = React.useState<Entry[]>([]);
  const [total, setTotal] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchEntries = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/admin/api/trpc/entries.list?input=${encodeURIComponent(
          JSON.stringify({ json: { collectionId: collection.id } })
        )}`,
        { credentials: "include" }
      );
      const data = await response.json();

      const result = data.result?.data?.json || data.result?.data;
      if (result) {
        setEntries(result.entries);
        setTotal(result.total);
      }
    } catch (err) {
      setError("Failed to load entries");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [collection.id]);

  React.useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const deleteEntry = async (entryId: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    try {
      await fetch("/admin/api/trpc/entries.delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ json: { id: entryId } }),
      });
      fetchEntries();
    } catch (err) {
      console.error("Failed to delete entry:", err);
    }
  };

  const getDisplayValue = (entry: Entry): string => {
    // Try to find a title-like field
    const titleFields = ["title", "name", "label", "heading"];
    for (const key of titleFields) {
      if (entry.data[key] && typeof entry.data[key] === "string") {
        return entry.data[key] as string;
      }
    }
    // Fall back to first string field
    const firstField = collection.schema.fields[0];
    if (firstField && entry.data[firstField.key]) {
      const value = entry.data[firstField.key];
      if (typeof value === "string") return value;
      if (typeof value === "number" || typeof value === "boolean")
        return String(value);
    }
    return `Entry ${entry.id.slice(0, 8)}`;
  };

  const statusColors = {
    draft: "bg-yellow-100 text-yellow-800",
    published: "bg-green-100 text-green-800",
    archived: "bg-gray-100 text-gray-800",
  };

  if (collection.schema.fields.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-4 p-4 border-b border-gray-200 bg-white">
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
            <p className="text-sm text-gray-500">Entries</p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="mt-4 text-sm font-medium text-gray-900">
              No schema defined
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              You need to define fields before adding entries.
            </p>
            <button
              onClick={onEditSchema}
              className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Edit Schema
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            <p className="text-sm text-gray-500">{total} entries</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onEditSchema}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Edit Schema
          </button>
          <button
            onClick={onCreateEntry}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            <svg
              className="w-4 h-4 mr-1.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Entry
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">
            Loading entries...
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchEntries}
              className="mt-2 text-blue-600 hover:text-blue-800"
            >
              Try again
            </button>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-4 text-sm font-medium text-gray-900">
              No entries yet
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Get started by creating your first entry.
            </p>
            <button
              onClick={onCreateEntry}
              className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Create Entry
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entry
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onEditEntry(entry)}
                        className="text-left text-sm font-medium text-gray-900 hover:text-blue-600"
                      >
                        {getDisplayValue(entry)}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          statusColors[entry.status]
                        }`}
                      >
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(entry.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => onEditEntry(entry)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteEntry(entry.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
