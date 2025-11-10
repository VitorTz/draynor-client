import { useState } from "react";
import { BookOpen, Send, CheckCircle, AlertCircle } from "lucide-react";
import { draynorApi } from "../api/draynor";
import "./MangaRequest.css";

const MangaRequest = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMessage("Please fill in the manga title.");
      setSubmitStatus("error");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      await draynorApi.mangaRequests.createRequest(
        title.trim(),
        message.trim() || undefined
      );

      setSubmitStatus("success");
      setTitle("");
      setMessage("");

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus("idle");
      }, 5000);
    } catch (error: any) {
      setSubmitStatus("error");
      setErrorMessage(
        error.message || "Error submitting request. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="manga-request-page">
      <div className="manga-request-container">
        <div className="manga-request-header">
          <div className="manga-request-icon">
            <BookOpen size={32} />
          </div>
          <h1>Request Manga</h1>
          <p>
            Didn't find the manga you're looking for? Request it and we'll add
            it!
          </p>
        </div>

        <form className="manga-request-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">
              Title <span className="required">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="One Piece, Naruto, Berserk..."
              maxLength={150}
              disabled={isSubmitting}
              required
            />
            <span className="char-count">{title.length}/150</span>
          </div>

          <div className="form-group">
            <label htmlFor="message">Additional Information (Optional)</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add extra details such as author, genre, reason for the request, reference links, etc..."
              rows={8}
              maxLength={1000}
              disabled={isSubmitting}
            />
            <span className="char-count">{message.length}/1000</span>
          </div>

          {submitStatus === "success" && (
            <div className="alert alert-success">
              <CheckCircle size={20} />
              <span>
                Request submitted successfully! We’ll review it and add it soon.
              </span>
            </div>
          )}

          {submitStatus === "error" && (
            <div className="alert alert-error">
              <AlertCircle size={20} />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="spinner"></div>
                Sending...
              </>
            ) : (
              <>
                <Send size={20} />
                Send
              </>
            )}
          </button>
        </form>

        <div className="manga-request-footer">
          <p className="footer-note">
            <strong>Important:</strong> Please check if the manga is already
            available in our library before submitting a request. Duplicate
            requests may take longer to process.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MangaRequest;
