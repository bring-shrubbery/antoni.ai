import React from "react";

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  schema: {
    fields: Array<{ id: string; name: string; key: string; type: string }>;
  };
  createdAt: string;
  updatedAt: string;
}

interface CollectionsListProps {
  onSelectCollection: (collection: Collection) => void;
  onCreateCollection: () => void;
}

export function CollectionsList({
  onSelectCollection,
  onCreateCollection,
}: CollectionsListProps) {
  const [collections, setCollections] = React.useState<Collection[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchCollections = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/admin/api/trpc/collections.list", {
        credentials: "include",
      });
      const data = await response.json();

      if (data.result?.data?.json) {
        setCollections(data.result.data.json);
      } else if (data.result?.data) {
        setCollections(data.result.data);
      }
    } catch (err) {
      setError("Failed to load collections");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500">
        <svg
          className="animate-spin h-6 w-6 mx-auto mb-2"
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
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        Loading collections...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchCollections}
          className="text-blue-600 hover:text-blue-800"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Collections</h2>
        <button
          onClick={onCreateCollection}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
          New Collection
        </button>
      </div>

      {collections.length === 0 ? (
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
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <h3 className="mt-4 text-sm font-medium text-gray-900">
            No collections yet
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Get started by creating your first collection.
          </p>
          <button
            onClick={onCreateCollection}
            className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Create Collection
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {collections.map((collection) => (
            <button
              key={collection.id}
              onClick={() => onSelectCollection(collection)}
              className="text-left p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {collection.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    /{collection.slug}
                  </p>
                  {collection.description && (
                    <p className="text-sm text-gray-600 mt-2">
                      {collection.description}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded">
                    {collection.schema.fields.length} field
                    {collection.schema.fields.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
