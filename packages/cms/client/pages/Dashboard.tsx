import React from "react";
import { CollectionsList } from "../components/CollectionsList";
import { SchemaEditor } from "../components/SchemaEditor";
import { EntriesList } from "../components/EntriesList";
import { EntryEditor } from "../components/EntryEditor";
import { CreateCollectionModal } from "../components/CreateCollectionModal";

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
  createdAt: string;
  updatedAt: string;
}

interface Entry {
  id: string;
  data: Record<string, unknown>;
  status: "draft" | "published" | "archived";
  createdAt: string;
  updatedAt: string;
}

type View =
  | { type: "collections" }
  | { type: "schema"; collection: Collection }
  | { type: "entries"; collection: Collection }
  | { type: "entry-editor"; collection: Collection; entry: Entry | null };

interface DashboardProps {
  onLogout: () => void;
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [view, setView] = React.useState<View>({ type: "collections" });
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [refreshKey, setRefreshKey] = React.useState(0);

  const handleLogout = async () => {
    try {
      await fetch("/admin/api/auth/sign-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });
    } catch (e) {
      // Ignore errors
    }
    onLogout();
  };

  const handleSelectCollection = (collection: Collection) => {
    // Go to entries view if schema has fields, otherwise to schema editor
    if (collection.schema.fields.length > 0) {
      setView({ type: "entries", collection });
    } else {
      setView({ type: "schema", collection });
    }
  };

  const handleCreateCollection = (collection: Collection) => {
    setShowCreateModal(false);
    // Go to schema editor for new collection
    setView({ type: "schema", collection: collection as Collection });
  };

  const handleUpdateCollection = (updatedCollection: Collection) => {
    // Update the view with the new collection data
    if (view.type === "schema") {
      setView({ type: "schema", collection: updatedCollection });
    } else if (view.type === "entries") {
      setView({ type: "entries", collection: updatedCollection });
    }
  };

  const handleSaveEntry = (entry: Entry) => {
    if (view.type === "entry-editor") {
      setView({ type: "entries", collection: view.collection });
      setRefreshKey((k) => k + 1);
    }
  };

  const renderContent = () => {
    switch (view.type) {
      case "collections":
        return (
          <CollectionsList
            key={refreshKey}
            onSelectCollection={handleSelectCollection}
            onCreateCollection={() => setShowCreateModal(true)}
          />
        );

      case "schema":
        return (
          <SchemaEditor
            collection={view.collection}
            onBack={() => {
              setView({ type: "collections" });
              setRefreshKey((k) => k + 1);
            }}
            onViewEntries={() =>
              setView({ type: "entries", collection: view.collection })
            }
            onUpdate={handleUpdateCollection}
          />
        );

      case "entries":
        return (
          <EntriesList
            key={refreshKey}
            collection={view.collection}
            onBack={() => {
              setView({ type: "collections" });
              setRefreshKey((k) => k + 1);
            }}
            onEditSchema={() =>
              setView({ type: "schema", collection: view.collection })
            }
            onEditEntry={(entry) =>
              setView({
                type: "entry-editor",
                collection: view.collection,
                entry,
              })
            }
            onCreateEntry={() =>
              setView({
                type: "entry-editor",
                collection: view.collection,
                entry: null,
              })
            }
          />
        );

      case "entry-editor":
        return (
          <EntryEditor
            collection={view.collection}
            entry={view.entry}
            onBack={() =>
              setView({ type: "entries", collection: view.collection })
            }
            onSave={handleSaveEntry}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">CMS</h1>
        </div>

        <nav className="flex-1 p-4">
          <button
            onClick={() => {
              setView({ type: "collections" });
              setRefreshKey((k) => k + 1);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${
              view.type === "collections"
                ? "bg-blue-50 text-blue-700"
                : "text-gray-700 hover:bg-gray-50"
            }`}
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
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            Collections
          </button>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
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
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {renderContent()}
      </main>

      {/* Create Collection Modal */}
      <CreateCollectionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateCollection}
      />
    </div>
  );
}
