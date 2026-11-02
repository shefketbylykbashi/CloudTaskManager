import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Modal } from "../Modal";

function TestView({ open, onClose }) {
  return (
    <>
      <button type="button">Open trigger</button>
      <Modal open={open} onClose={onClose} title="Focus test">
        <label htmlFor="focus-target">Focus target</label>
        <input id="focus-target" data-autofocus />
        <button type="button">Keep working</button>
      </Modal>
    </>
  );
}

describe("Modal focus lifecycle", () => {
  it("keeps focus stable across callback changes, uses the latest callback, and restores focus", async () => {
    const firstOnClose = vi.fn();
    const latestOnClose = vi.fn();
    const { rerender } = render(<TestView open={false} onClose={firstOnClose} />);
    const trigger = screen.getByRole("button", { name: "Open trigger" });
    trigger.focus();

    rerender(<TestView open onClose={firstOnClose} />);
    const focusTarget = screen.getByLabelText("Focus target");
    await waitFor(() => expect(focusTarget).toHaveFocus());

    const keepWorking = screen.getByRole("button", { name: "Keep working" });
    keepWorking.focus();
    expect(keepWorking).toHaveFocus();

    rerender(<TestView open onClose={latestOnClose} />);
    expect(keepWorking).toHaveFocus();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(latestOnClose).toHaveBeenCalledTimes(1);
    expect(firstOnClose).not.toHaveBeenCalled();

    rerender(<TestView open={false} onClose={latestOnClose} />);
    expect(trigger).toHaveFocus();
  });
});

