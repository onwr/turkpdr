import type { ContentStatus } from "@prisma/client";
import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import {
  canAuthorEditContent,
  canAuthorResubmit,
  requiresReviewNote,
  validateReviewNote,
} from "../content-review.ts";

describe("content-review", () => {
  it("requires review note for rejected and revision requested", () => {
    assert.equal(requiresReviewNote("REJECTED"), true);
    assert.equal(requiresReviewNote("REVISION_REQUESTED"), true);
    assert.equal(requiresReviewNote("PUBLISHED"), false);
  });

  it("validates review note messages in Turkish", () => {
    assert.equal(
      validateReviewNote("REJECTED", ""),
      "Reddetme işlemi için not yazmanız zorunludur."
    );
    assert.equal(
      validateReviewNote("REVISION_REQUESTED", "  "),
      "Revizyon isteği için not yazmanız zorunludur."
    );
    assert.equal(validateReviewNote("REVISION_REQUESTED", "Düzeltin"), null);
  });

  it("allows author edit and resubmit only on expected statuses", () => {
    const editable: ContentStatus[] = [
      "DRAFT",
      "REJECTED",
      "REVISION_REQUESTED",
    ];
    const notEditable: ContentStatus[] = ["PENDING", "PUBLISHED"];

    for (const status of editable) {
      assert.equal(canAuthorEditContent(status), true);
    }
    for (const status of notEditable) {
      assert.equal(canAuthorEditContent(status), false);
    }

    assert.equal(canAuthorResubmit("REJECTED"), true);
    assert.equal(canAuthorResubmit("REVISION_REQUESTED"), true);
    assert.equal(canAuthorResubmit("DRAFT"), false);
  });
});
