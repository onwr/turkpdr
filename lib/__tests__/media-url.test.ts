import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  normalizeMediaUrl,
  normalizeRichTextMediaUrls,
  resolveMediaUrl,
} from "@/lib/media-url";

describe("normalizeMediaUrl", () => {
  it("strips localhost host from upload URLs", () => {
    assert.equal(
      normalizeMediaUrl("https://localhost:3000/uploads/files/test.pdf"),
      "/uploads/files/test.pdf"
    );
  });

  it("adds leading slash to bare upload paths", () => {
    assert.equal(
      normalizeMediaUrl("uploads/files/test.pdf"),
      "/uploads/files/test.pdf"
    );
  });

  it("keeps relative upload paths unchanged", () => {
    assert.equal(
      normalizeMediaUrl("/uploads/images/photo.jpg"),
      "/uploads/images/photo.jpg"
    );
  });

  it("fixes duplicated absolute upload URLs", () => {
    assert.equal(
      normalizeMediaUrl(
        "https://localhost:3000/uploads/files/a.pdfhttps://localhost:3000/uploads/files/a.pdf"
      ),
      "/uploads/files/a.pdf"
    );
  });

  it("returns null for empty values", () => {
    assert.equal(normalizeMediaUrl(""), null);
    assert.equal(normalizeMediaUrl(null), null);
  });
});

describe("normalizeRichTextMediaUrls", () => {
  it("normalizes image src attributes in HTML", () => {
    const html =
      '<img src="https://localhost:3000/uploads/images/a.jpg" alt="test" />';
    assert.equal(
      normalizeRichTextMediaUrls(html),
      '<img src="/uploads/images/a.jpg" alt="test" />'
    );
  });
});

describe("resolveMediaUrl", () => {
  it("keeps upload paths relative so they resolve against the current origin", () => {
    assert.equal(
      resolveMediaUrl("/uploads/files/test.pdf"),
      "/uploads/files/test.pdf"
    );
  });

  it("passes external URLs through unchanged", () => {
    assert.equal(
      resolveMediaUrl("https://images.unsplash.com/photo.jpg"),
      "https://images.unsplash.com/photo.jpg"
    );
  });
});
