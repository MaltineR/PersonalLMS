import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import AuthHOC from "../../hooks/AuthHOC";


vi.mock("axios");
vi.mock("../../utils/vars", () => ({
  BASE_URL: "http://localhost:5000",
}));

const TestComponent = () => <div>Protected Content</div>;

describe("AuthHOC", () => {
  it("renders children when token is valid", async () => {
    localStorage.setItem("token", "valid-token");

    axios.post.mockResolvedValueOnce({
      data: {
        ok: true,
        user: { id: 1, role: "user" },
      },
    });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <AuthHOC>
          <TestComponent />
        </AuthHOC>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Protected Content")).toBeInTheDocument();
    });
  });

  it("shows loading initially", () => {
    localStorage.setItem("token", "valid-token");

    axios.post.mockResolvedValueOnce({
      data: { ok: true, user: {} },
    });

    render(
      <MemoryRouter>
        <AuthHOC>
          <TestComponent />
        </AuthHOC>
      </MemoryRouter>
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});
