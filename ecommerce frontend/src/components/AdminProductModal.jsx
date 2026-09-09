import {
  useEffect,
  useRef,
  useState
} from "react";

const initialForm = {
  name: "",
  price: "",
  description: "",
  category: ""
};

export default function AdminProductModal({
  open,
  onClose,
  onSubmit,
  busy
}) {
  const [form, setForm] =
    useState(initialForm);

  const [file, setFile] =
    useState(null);

  const [previewUrl, setPreviewUrl] =
    useState("");

  const [error, setError] =
    useState("");

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  if (!open) {
    return null;
  }

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));

    setError("");
  }

  function selectFile(selectedFile) {
    if (!selectedFile) {
      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select a valid image.");
      return;
    }

    setFile(selectedFile);
    setError("");
  }

  function resetAndClose() {
    if (busy) {
      return;
    }

    setForm(initialForm);
    setFile(null);
    setError("");
    onClose();
  }

  async function submit(event) {
    event.preventDefault();
    setError("");

    if (!file) {
      setError("Please select a product image.");
      return;
    }

    try {
      await onSubmit(form, file);

      setForm(initialForm);
      setFile(null);
    } catch (submitError) {
      setError(
        submitError.message ||
        "Could not create the product."
      );
    }
  }

  return (
    <div
      className="admin-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          resetAndClose();
        }
      }}
    >
      <div
        className="admin-product-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-product-title"
      >
        <div className="admin-modal-header">
          <div>
            <span className="admin-badge">
              ADMIN PORTAL
            </span>

            <h2 id="add-product-title">
              Create a new product
            </h2>

            <p>
              Add the product details and upload
              its storefront image.
            </p>
          </div>

          <button
            type="button"
            className="admin-modal-close"
            onClick={resetAndClose}
            disabled={busy}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form
          className="admin-product-form"
          onSubmit={submit}
        >
          <div className="admin-form-grid">
            <div className="admin-fields">
              <div className="admin-field">
                <label htmlFor="product-name">
                  Product name
                </label>

                <input
                  id="product-name"
                  value={form.name}
                  onChange={(event) =>
                    update(
                      "name",
                      event.target.value
                    )
                  }
                  placeholder="Wireless headphones"
                  required
                />
              </div>

              <div className="admin-form-row">
                <div className="admin-field">
                  <label htmlFor="product-price">
                    Price
                  </label>

                  <div className="admin-price-input">
                    <span>$</span>

                    <input
                      id="product-price"
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={form.price}
                      onChange={(event) =>
                        update(
                          "price",
                          event.target.value
                        )
                      }
                      placeholder="99.99"
                      required
                    />
                  </div>
                </div>

                <div className="admin-field">
                  <label htmlFor="product-category">
                    Category
                  </label>

                  <input
                    id="product-category"
                    value={form.category}
                    onChange={(event) =>
                      update(
                        "category",
                        event.target.value
                      )
                    }
                    placeholder="Electronics"
                    required
                  />
                </div>
              </div>

              <div className="admin-field">
                <label htmlFor="product-description">
                  Description
                </label>

                <textarea
                  id="product-description"
                  value={form.description}
                  onChange={(event) =>
                    update(
                      "description",
                      event.target.value
                    )
                  }
                  placeholder="Describe the product’s main features…"
                  rows="5"
                  maxLength="500"
                  required
                />

                <small className="character-count">
                  {form.description.length}/500
                </small>
              </div>
            </div>

            <div className="admin-image-section">
              <label>Product image</label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(event) =>
                  selectFile(
                    event.target.files?.[0]
                  )
                }
              />

              <button
                type="button"
                className={
                  previewUrl
                    ? "admin-image-dropzone has-image"
                    : "admin-image-dropzone"
                }
                onClick={() =>
                  fileInputRef.current?.click()
                }
                onDragOver={(event) =>
                  event.preventDefault()
                }
                onDrop={(event) => {
                  event.preventDefault();

                  selectFile(
                    event.dataTransfer.files?.[0]
                  );
                }}
              >
                {previewUrl ? (
                  <>
                    <img
                      src={previewUrl}
                      alt="Selected product preview"
                    />

                    <span className="change-image">
                      Change image
                    </span>
                  </>
                ) : (
                  <>
                    <span className="upload-icon">
                      ↑
                    </span>

                    <strong>
                      Upload product image
                    </strong>

                    <small>
                      Click or drag an image here
                    </small>

                    <small>
                      PNG, JPG or WEBP
                    </small>
                  </>
                )}
              </button>

              {file && (
                <div className="selected-file">
                  <span>✓</span>
                  <span>{file.name}</span>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="admin-form-error">
              ⚠ {error}
            </div>
          )}

          <div className="admin-upload-note">
            <span>🔒</span>

            <span>
              Images are uploaded securely using a
              temporary S3 presigned URL.
            </span>
          </div>

          <div className="admin-modal-actions">
            <button
              className="admin-cancel-button"
              type="button"
              onClick={resetAndClose}
              disabled={busy}
            >
              Cancel
            </button>

            <button
              className="admin-create-button"
              type="submit"
              disabled={busy}
            >
              {busy ? (
                <>
                  <span className="admin-spinner" />
                  Uploading product…
                </>
              ) : (
                <>＋ Create Product</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}