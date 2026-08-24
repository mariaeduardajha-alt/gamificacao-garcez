import { describe, it, expect } from "vitest";
import { reviewDecisionFields } from "./review";

describe("reviewDecisionFields", () => {
  it("APPROVE gera status APPROVED", () => {
    const fields = reviewDecisionFields("APPROVE", "user-1");
    expect(fields.status).toBe("APPROVED");
    expect(fields.reviewedBy).toBe("user-1");
    expect(fields.reviewNote).toBeNull();
    expect(fields.reviewedAt).toBeInstanceOf(Date);
  });

  it("REJECT gera status REJECTED e preserva a nota", () => {
    const fields = reviewDecisionFields("REJECT", "admin-1", "print ilegível");
    expect(fields.status).toBe("REJECTED");
    expect(fields.reviewNote).toBe("print ilegível");
  });
});
