import {
  StandardPageLinksContent,
  type StandardPageLinksContentActions,
  type StandardPageLinksContentView,
} from "@/shared/ui/standard-page/StandardPageLinksContent";
import { Card } from "@/shared/ui/primitives/card";

type BookmarksContentStatus = {
  error: string | null;
  loading: boolean;
};

export type BookmarksContentModel = {
  status: BookmarksContentStatus;
  content: {
    view: StandardPageLinksContentView;
    actions: StandardPageLinksContentActions;
  };
};

type BookmarksContentProps = {
  model: BookmarksContentModel;
};

export function BookmarksContent({
  model,
}: BookmarksContentProps) {
  const { status, content } = model;
  const { error, loading } = status;

  if (error) {
    return (
      <Card className="p-4">
        <div className="rounded-md border bg-card p-4">
          <p className="text-sm font-medium">当前环境无法读取 Chrome 书签</p>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          <div className="mt-3 text-sm text-muted-foreground">
            <p>要在扩展中使用：请使用 Manifest V3，并声明权限：</p>
            <pre className="mt-2 whitespace-pre-wrap rounded-md bg-muted p-3 text-xs">
{`"permissions": ["bookmarks", "storage"],
"chrome_url_overrides": { "newtab": "index.html" }`}
            </pre>
          </div>
        </div>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="p-4">
        <p className="text-sm text-muted-foreground">正在读取书签…</p>
      </Card>
    );
  }

  return <StandardPageLinksContent view={content.view} actions={content.actions} />;
}

