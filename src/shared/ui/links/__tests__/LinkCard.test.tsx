import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LinkCard } from "@/shared/ui/links/LinkCard";

describe("LinkCard", () => {
  it("opens site links in the current tab by default", () => {
    render(
      <LinkCard
        link={{
          id: "github",
          title: "GitHub",
          url: "https://github.com",
        }}
      />,
    );

    const link = screen.getByRole("link", { name: /GitHub/i });
    expect(link).not.toHaveAttribute("target");
    expect(link).toHaveAttribute("href", "https://github.com");
  });
});
