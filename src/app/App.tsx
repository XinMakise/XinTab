import { useEffect } from "react";

import { AppProviders } from "@/app/providers/AppProviders";
import { AppRouter } from "@/app/router";
import { useAppearance } from "@/features/appearance";

const App = () => {
  const { isReady } = useAppearance();

  useEffect(() => {
    if (!isReady) return;

    const root = document.getElementById("root");
    root?.classList.add("app-ready");
  }, [isReady]);

  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
};

export default App;
