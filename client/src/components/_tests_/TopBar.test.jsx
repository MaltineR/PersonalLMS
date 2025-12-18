import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import TopBar from "../TopBar";

/* ---------------- MOCK AXIOS ---------------- */
vi.mock("axios");

/* ---------------- MOCK BASE_URL ---------------- */
vi.mock("../../utils/vars", () => ({
  BASE_URL: "http://localhost:5000",
}));

describe("TopBar component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem("token", "fake-token");
  });

  it("fetches user and displays avatar when avatar exists", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        avatar: "https://example.com/avatar.jpg",
      },
    });

    render(
      <MemoryRouter>
        <TopBar />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        "http://localhost:5000/api/v1/user/me",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer fake-token",
          }),
        })
      );
    });

    const avatar = screen.getByAltText("User Avatar");
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute("src", "https://example.com/avatar.jpg");
  });

  it("shows default icon when user has no avatar", async () => {
    axios.get.mockResolvedValueOnce({
      data: {},
    });

    render(
      <MemoryRouter>
        <TopBar />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });

    // Icon is SVG, so we check that avatar image is NOT present
    expect(screen.queryByAltText("User Avatar")).not.toBeInTheDocument();
  });

  it("renders logout button", async () => {
    axios.get.mockResolvedValueOnce({
      data: {},
    });

    render(
      <MemoryRouter>
        <TopBar />
      </MemoryRouter>
    );

    const logoutButton = await screen.findByText("Logout");
    expect(logoutButton).toBeInTheDocument();
  });
});
